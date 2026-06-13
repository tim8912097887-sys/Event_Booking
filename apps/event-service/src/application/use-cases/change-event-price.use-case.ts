import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventPriceUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }

    async execute(eventId: string, newPrice: number): Promise<void> {
        await this.tracer.startActiveSpan(
            "ChangeEventPriceUseCase",
            async () => {
                await this.metrics.trackOperation("change-price", async () => {
                    const event = await this.getEventOrFail(eventId);
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
