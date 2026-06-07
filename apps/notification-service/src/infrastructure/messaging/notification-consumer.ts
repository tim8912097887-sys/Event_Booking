import { ILogger } from "#application/port/i-logger.js";
import { NotificationMetrics } from "#application/port/notification-metrics.js";
import { Tracer } from "#application/port/notification-trace.js";
import { SendEventPublishedEmailUseCase } from "#application/use-cases/send-event-published-email.use-case.js";
import { MessageBrokerType, TOPICS } from "@event-booking/message-broker";

export class NotificationConsumer {
    constructor(
        private readonly broker: MessageBrokerType,

        private readonly publishedUseCase: SendEventPublishedEmailUseCase,

        private readonly logger: ILogger,

        private readonly metrics: NotificationMetrics,

        private readonly tracer: Tracer,
    ) {}

    async start() {
        try {
            const consumer = this.broker.consumer("notification-service");

            await consumer.connect();

            this.logger.info(
                {
                    groupId: "notification-service",
                },
                "notification.consumer.connected",
            );

            await consumer.subscribe(
                TOPICS.EVENT_PUBLISHED,
                async (payload) => {
                    await this.tracer.startActiveSpan(
                        "process_event_published",
                        async (span) => {
                            // Process duration metrics
                            const endProcessing =
                                this.metrics.processingStarted(
                                    TOPICS.EVENT_PUBLISHED,
                                );
                            // Consume metrics
                            this.metrics.eventConsumed(TOPICS.EVENT_PUBLISHED);
                            this.logger.info(
                                {
                                    topic: TOPICS.EVENT_PUBLISHED,
                                    eventId: payload.eventId,
                                },
                                "notification.event.received",
                            );
                            try {
                                span.setAttributes({
                                    "messaging.system": "kafka",
                                    "messaging.destination":
                                        TOPICS.EVENT_PUBLISHED,
                                    "messaging.operation": "process",
                                    "event.id": payload.eventId,
                                });

                                await this.publishedUseCase.execute(payload);
                                // Process count metrics
                                this.metrics.eventProcessed(
                                    TOPICS.EVENT_PUBLISHED,
                                );
                            } catch (error: any) {
                                this.logger.error(
                                    error,
                                    "notification.event.error",
                                );
                                this.metrics.eventFailed(
                                    TOPICS.EVENT_PUBLISHED,
                                    error.message,
                                );
                            } finally {
                                endProcessing();
                            }
                        },
                    );
                },
            );

            this.logger.info(
                {
                    topics: [TOPICS.EVENT_PUBLISHED],
                },
                "notification.consumer.ready",
            );

            await consumer.run();
        } catch (error: any) {
            this.logger.error(
                {
                    error,
                },
                "notification.consumer.crashed",
            );

            process.exit(1);
        }
    }
}
