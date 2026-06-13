import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventDescriptionUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }

    async execute(eventId: string, newDescription: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventDescriptionUseCase",
            async () => {
                await this.metrics.trackOperation(
                    "change-description",
                    async () => {
                        const event = await this.getEventOrFail(eventId);
                        event.changeDescription(newDescription);
                        await this.repository.update(event);
                    },
                );
            },
            {
                "event.id": eventId,
                "event.newDescription": newDescription,
                "event.action": "change-description",
            },
        );
    }
}
