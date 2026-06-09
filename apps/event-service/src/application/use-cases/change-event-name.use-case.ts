import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventNameUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(eventId: string, newName: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventNameUseCase",
            async () => {
                await this.metrics.trackOperation("change-name", async () => {
                    const event = await this.repository.findById(eventId);
                    if (!event) {
                        throw new EventNotFoundError(eventId);
                    }
                    event.changeName(newName);
                    await this.repository.update(event);
                });
            },
            {
                "event.id": eventId,
                "event.newName": newName,
                "event.action": "change-name",
            },
        );
    }
}
