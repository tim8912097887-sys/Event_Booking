import { BookingUseCaseBase } from "#application/port/base-booking.use-case.js";
import { PrometheusBookingMetrics } from "#infrastructure/metrics/prometheus-booking.metric.js";
import { BookingRepository } from "../port/booking.repository.js";
import { EventServicePort } from "../port/event.service.port.js";

export class CancelBookingUseCase extends BookingUseCaseBase {
    constructor(
        protected readonly repository: BookingRepository,
        private readonly eventService: EventServicePort,
        private readonly metrics: PrometheusBookingMetrics,
    ) {
        super(repository);
    }
    async execute(id: string): Promise<void> {
        await this.metrics.trackOperation("cancel", async () => {
            const existingBooking = await this.getBookingOrFail(id);
            await this.eventService.releaseSeats(
                existingBooking.getEventId(),
                existingBooking.getSeats(),
            );
            existingBooking.cancel();
            await this.repository.update(existingBooking);
        });
    }
}
