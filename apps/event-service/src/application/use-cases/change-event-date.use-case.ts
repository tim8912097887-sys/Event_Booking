import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventDateUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }

    async execute(eventId: string, newDate: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventDateUseCase",
            async () => {
                await this.metrics.trackOperation("change-date", async () => {
                    const event = await this.getEventOrFail(eventId);
                    event.changeDate(newDate);
                    await this.repository.update(event);
                });
            },
            {
                "event.id": eventId,
                "event.newDate": newDate,
                "event.action": "change-date",
            },
        );
    }
}
