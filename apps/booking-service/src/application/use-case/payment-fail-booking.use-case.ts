import { BookingUseCaseBase } from "#application/port/base-booking.use-case.js";

export class PaymentFailBookingUseCase extends BookingUseCaseBase {
    async execute(id: string): Promise<void> {
        const existingBooking = await this.getBookingOrFail(id);
        existingBooking.paymentFail();
        await this.repository.update(existingBooking);
    }
}
