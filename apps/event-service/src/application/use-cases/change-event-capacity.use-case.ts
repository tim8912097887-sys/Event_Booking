import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventCapacityUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(eventId: string, newCapacity: number): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventCapacityUseCase",
            async () => {
                await this.metrics.trackOperation(
                    "change-capacity",
                    async () => {
                        const event = await this.repository.findById(eventId);
                        if (!event) {
                            throw new EventNotFoundError(eventId);
                        }
                        event.changeCapacity(newCapacity);
                        await this.repository.update(event);
                    },
                );
            },
            {
                "event.id": eventId,
                "event.newCapacity": newCapacity,
                "event.action": "change-capacity",
            },
        );
    }
}
