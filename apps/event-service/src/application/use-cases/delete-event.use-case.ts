import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class DeleteEventUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }
    async execute(eventId: string): Promise<void> {
        await this.tracer.startActiveSpan(
            "DeleteEventUseCase",
            async () => {
                await this.metrics.trackOperation("delete", async () => {
                    const event = await this.getEventOrFail(eventId);
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
