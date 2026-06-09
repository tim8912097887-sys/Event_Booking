import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventPriceUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(eventId: string, newPrice: number): Promise<void> {
        await this.tracer.startActiveSpan(
            "ChangeEventPriceUseCase",
            async () => {
                await this.metrics.trackOperation("change-price", async () => {
                    const event = await this.repository.findById(eventId);
                    if (!event) {
                        throw new EventNotFoundError(eventId);
                    }
                    event.changePrice(newPrice);
                    await this.repository.update(event);
                });
            },
            {
                "event.id": eventId,
                "event.price.new": newPrice,
            },
        );
    }
}
