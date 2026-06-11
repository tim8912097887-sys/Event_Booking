import { BookingUseCaseBase } from "#application/port/base-booking.use-case.js";

export class CancelBookingUseCase extends BookingUseCaseBase {
    async execute(id: string): Promise<void> {
        const existingBooking = await this.getBookingOrFail(id);
        existingBooking.cancel();
        await this.repository.update(existingBooking);
    }
}
