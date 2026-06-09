import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { outboxEvents } from "../persistence/schema/outbox-event.js";
import { eq, isNull } from "drizzle-orm";
import { TOPICS } from "@event-booking/message-broker";
import { KafkaProducer } from "@event-booking/message-broker/dist/producer.js";
import { EventPublishedDomainEvent } from "#domain/message/event-published-domain-event.js";
import { EventCancelledDomainEvent } from "#domain/message/event-cancelled-domain-event.js";
import { context, propagation, ROOT_CONTEXT } from "@opentelemetry/api";
import { Tracer } from "#application/port/event-trace.js";
import { PrometheusEventMetrics } from "../metrics/prometheus-event.metric.js";

export class OutboxPublisher {
    private running = false;
    constructor(
        private readonly db: NodePgDatabase,
        private readonly producer: KafkaProducer,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async start() {
        this.running = true;
        while (this.running) {
            await this.publishPendingEvents();
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }

    async stop() {
        this.running = false;
    }

    async publishPendingEvents() {
        const events = await this.db
            .select()
            .from(outboxEvents)
            .where(isNull(outboxEvents.publishedAt))
            .limit(100);
        // Report the number of pending messages
        this.metrics.outboxPendingMessagesTotal(events.length);

        for (const event of events) {
            try {
                const parentContext = propagation.extract(
                    ROOT_CONTEXT,
                    event.traceContext ?? {},
                );
                await context.with(parentContext, async () => {
                    await this.publish(event);

                    await this.db
                        .update(outboxEvents)
                        .set({
                            publishedAt: new Date(),
                        })
                        .where(eq(outboxEvents.id, event.id));
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    private async publish(event: typeof outboxEvents.$inferSelect) {
        await this.metrics.trackOutboxMessagePublish(
            event.eventName,
            async () => {
                await this.tracer.startActiveSpan(
                    "outbox.publish",
                    async () => {
                        const headers: Record<string, string> = {};

                        propagation.inject(context.active(), headers);
                        switch (event.eventName) {
                            case "event.published":
                                await this.producer.publish({
                                    topic: TOPICS.EVENT_PUBLISHED,
                                    payload:
                                        event.payload as EventPublishedDomainEvent,
                                    headers,
                                });
                                break;

                            case "event.cancelled":
                                await this.producer.publish({
                                    topic: TOPICS.EVENT_CANCELLED,
                                    payload:
                                        event.payload as EventCancelledDomainEvent,
                                    headers,
                                });
                                break;
                        }
                    },
                    {
                        "outbox.eventId": event.id,
                        "outbox.eventName": event.eventName,
                    },
                );
            },
        );
    }
}
