import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { outboxEvents } from "../persistence/schema/outbox-event.js";
import { eq, isNull } from "drizzle-orm";
import { TOPICS } from "@event-booking/message-broker";
import { KafkaProducer } from "@event-booking/message-broker/dist/producer.js";
import { EventPublishedDomainEvent } from "#domain/message/event-published-domain-event.js";
import { EventCancelledDomainEvent } from "#domain/message/event-cancelled-domain-event.js";

export class OutboxPublisher {
    private running = false;
    constructor(
        private readonly db: NodePgDatabase,
        private readonly producer: KafkaProducer,
    ) {}

    async start() {
        this.running = true;
        while (this.running) {
            await this.publishPendingEvents();
            await new Promise((resolve) => setTimeout(resolve, 1000));
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

        for (const event of events) {
            try {
                await this.publish(event);

                await this.db
                    .update(outboxEvents)
                    .set({
                        publishedAt: new Date(),
                    })
                    .where(eq(outboxEvents.id, event.id));
            } catch (error) {
                console.error(error);
            }
        }
    }

    private async publish(event: typeof outboxEvents.$inferSelect) {
        switch (event.eventName) {
            case "event.published":
                await this.producer.publish({
                    topic: TOPICS.EVENT_PUBLISHED,
                    payload: event.payload as EventPublishedDomainEvent,
                });
                break;

            case "event.cancelled":
                await this.producer.publish({
                    topic: TOPICS.EVENT_CANCELLED,
                    payload: event.payload as EventCancelledDomainEvent,
                });
                break;
        }
    }
}
