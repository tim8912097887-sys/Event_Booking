import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventDescriptionUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(eventId: string, newDescription: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventDescriptionUseCase",
            async () => {
                await this.metrics.trackOperation(
                    "change-description",
                    async () => {
                        const event = await this.repository.findById(eventId);
                        if (!event) {
                            throw new EventNotFoundError(eventId);
                        }
                        event.changeDescription(newDescription);
                        await this.repository.update(event);
                    },
                );
            },
            {
                "event.id": eventId,
                "event.newDescription": newDescription,
                "event.action": "change-description",
            },
        );
    }
}
