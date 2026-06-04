import { ILogger } from "#application/port/i-logger.js";
import { NotificationMetrics } from "#application/port/notification-metrics.js";
import { Tracer } from "#application/port/notification-trace.js";
import { SendEventCreatedEmailUseCase } from "#application/use-cases/send-event-created-email.use-case.js";
import { SendEventDeletedEmailUseCase } from "#application/use-cases/send-event-deleted-email.use-case.js";
import { SendEventUpdatedEmailUseCase } from "#application/use-cases/send-event-updated-email.use-case.js";
import { MessageBrokerType, TOPICS } from "@event-booking/message-broker";

export class NotificationConsumer {
    constructor(
        private readonly broker: MessageBrokerType,

        private readonly createdUseCase: SendEventCreatedEmailUseCase,

        private readonly updatedUseCase: SendEventUpdatedEmailUseCase,

        private readonly deletedUseCase: SendEventDeletedEmailUseCase,

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

            await consumer.subscribe(TOPICS.EVENT_CREATED, async (payload) => {
                await this.tracer.startActiveSpan(
                    "process_event_created",
                    async (span) => {
                        // Process duration metrics
                        const endProcessing = this.metrics.processingStarted(
                            TOPICS.EVENT_CREATED,
                        );
                        // Consume metrics
                        this.metrics.eventConsumed(TOPICS.EVENT_CREATED);
                        this.logger.info(
                            {
                                topic: TOPICS.EVENT_CREATED,
                                eventId: payload.eventId,
                            },
                            "notification.event.received",
                        );
                        try {
                            span.setAttributes({
                                "messaging.system": "kafka",
                                "messaging.destination": TOPICS.EVENT_CREATED,
                                "messaging.operation": "process",
                                "event.id": payload.eventId,
                            });

                            await this.createdUseCase.execute(payload);
                            // Process count metrics
                            this.metrics.eventProcessed(TOPICS.EVENT_CREATED);
                        } catch (error: any) {
                            this.logger.error(
                                error,
                                "notification.event.error",
                            );
                            this.metrics.eventFailed(
                                TOPICS.EVENT_CREATED,
                                error.message,
                            );
                            // Rethrow to trigger retry mechanism in message broker
                            throw error;
                        } finally {
                            endProcessing();
                        }
                    },
                );
            });

            await consumer.subscribe(TOPICS.EVENT_UPDATED, async (payload) => {
                await this.tracer.startActiveSpan(
                    "process_event_updated",
                    async (span) => {
                        // Consume metrics
                        this.metrics.eventConsumed(TOPICS.EVENT_UPDATED);
                        this.logger.info(
                            {
                                topic: TOPICS.EVENT_UPDATED,
                                eventId: payload.eventId,
                            },
                            "notification.event.received",
                        );
                        // Process duration metrics
                        const endProcessing = this.metrics.processingStarted(
                            TOPICS.EVENT_UPDATED,
                        );
                        try {
                            span.setAttributes({
                                "messaging.system": "kafka",
                                "messaging.destination": TOPICS.EVENT_UPDATED,
                                "messaging.operation": "process",
                                "event.id": payload.eventId,
                            });
                            await this.updatedUseCase.execute(payload);
                            // Process count metrics
                            this.metrics.eventProcessed(TOPICS.EVENT_UPDATED);
                        } catch (error: any) {
                            this.logger.error(
                                error,
                                "notification.event.error",
                            );
                            this.metrics.eventFailed(
                                TOPICS.EVENT_UPDATED,
                                error.message,
                            );
                            // Rethrow to trigger retry mechanism in message broker
                            throw error;
                        } finally {
                            endProcessing();
                        }
                    },
                );
            });

            await consumer.subscribe(TOPICS.EVENT_DELETED, async (payload) => {
                await this.tracer.startActiveSpan(
                    "process_event_deleted",
                    async (span) => {
                        // Consume metrics
                        this.metrics.eventConsumed(TOPICS.EVENT_DELETED);
                        // Process duration metrics
                        const endProcessing = this.metrics.processingStarted(
                            TOPICS.EVENT_DELETED,
                        );
                        this.logger.info(
                            {
                                topic: TOPICS.EVENT_DELETED,
                                eventId: payload.eventId,
                            },
                            "notification.event.received",
                        );
                        try {
                            span.setAttributes({
                                "messaging.system": "kafka",
                                "messaging.destination": TOPICS.EVENT_DELETED,
                                "messaging.operation": "process",
                                "event.id": payload.eventId,
                            });
                            await this.deletedUseCase.execute(payload);
                            // Process count metrics
                            this.metrics.eventProcessed(TOPICS.EVENT_DELETED);
                        } catch (error: any) {
                            this.logger.error(
                                error,
                                "notification.event.error",
                            );
                            this.metrics.eventFailed(
                                TOPICS.EVENT_DELETED,
                                error.message,
                            );
                            // Rethrow to trigger retry mechanism in message broker
                            throw error;
                        } finally {
                            endProcessing();
                        }
                    },
                );
            });

            this.logger.info(
                {
                    topics: [
                        TOPICS.EVENT_CREATED,
                        TOPICS.EVENT_UPDATED,
                        TOPICS.EVENT_DELETED,
                    ],
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
