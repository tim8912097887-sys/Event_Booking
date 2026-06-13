import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventNameUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }

    async execute(eventId: string, newName: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventNameUseCase",
            async () => {
                await this.metrics.trackOperation("change-name", async () => {
                    const event = await this.getEventOrFail(eventId);
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
