import { BookingUseCaseBase } from "#application/port/base-booking.use-case";

export class ConfirmBookingUseCase extends BookingUseCaseBase {
    async execute(id: string): Promise<void> {
        const existingBooking = await this.getBookingOrFail(id);
        existingBooking.confirm();
        await this.repository.update(existingBooking);
    }
}
