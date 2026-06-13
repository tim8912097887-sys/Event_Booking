import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class PublishEventUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }
    async execute(eventId: string, ownerEmail: string): Promise<void> {
        await this.tracer.startActiveSpan(
            "PublishEventUseCase",
            async () => {
                await this.metrics.trackOperation("publish", async () => {
                    const event = await this.getEventOrFail(eventId);
                    event.publish(ownerEmail);
                    await this.repository.update(event);
                });
            },
            {
                "event.id": eventId,
                "event.action": "publish",
            },
        );
    }
}
