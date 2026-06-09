import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class DeleteEventUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}
    async execute(eventId: string): Promise<void> {
        await this.tracer.startActiveSpan(
            "DeleteEventUseCase",
            async () => {
                await this.metrics.trackOperation("delete", async () => {
                    const event = await this.repository.findById(eventId);
                    if (!event) {
                        throw new EventNotFoundError(eventId);
                    }
                    event.delete();
                    await this.repository.delete(eventId);
                });
            },
            {
                "event.id": eventId,
            },
        );
    }
}
