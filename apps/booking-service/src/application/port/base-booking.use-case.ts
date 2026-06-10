import { BookingNotFoundError } from "#application/errors/booking-not-found";
import { BookingRepository } from "./booking.repository";

export abstract class BookingUseCaseBase {
    constructor(protected readonly repository: BookingRepository) {}

    protected async getBookingOrFail(id: string) {
        const booking = await this.repository.findById(id);
        if (!booking) throw new BookingNotFoundError(id);
        return booking;
    }
}
