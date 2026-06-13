import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { SeatConflictError } from "../errors/seat-conflict.error.js";
import { EventUseCaseBase } from "../port/base-event.use-case.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ReservedSeatUseCase extends EventUseCaseBase {
    constructor(
        protected readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
        private readonly metrics: PrometheusEventMetrics,
    ) {
        super(repository);
    }

    async execute(eventId: string, requestedSeats: number): Promise<void> {
        return this.tracer.startActiveSpan(
            "ReservedSeatUseCase",
            async () => {
                await this.metrics.trackOperation("reserve-seat", async () => {
                    const event = await this.getEventOrFail(eventId);
                    event.reserveSeat(requestedSeats);
                    const updated =
                        await this.repository.updateReservedSeats(event);
                    if (updated === 0) {
                        throw new SeatConflictError("reserve");
                    }
                });
            },
            {
                "event.id": eventId,
                "event.action": "reserve-seat",
            },
        );
    }
}
