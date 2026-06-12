import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class CancelEventUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }
    async execute(eventId: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "CancelEventUseCase",
            async () => {
                await this.metrics.trackOperation("cancel", async () => {
                    const event = await this.getEventOrFail(eventId);
                    event.cancel();
                    await this.repository.update(event);
                });
            },
            {
                "event.id": eventId,
                "event.action": "cancel",
            },
        );
    }
}
