import { CreateBooking } from "#application/dto/create-booking.dto";
import { BookingRepository } from "#application/port/booking.repository";
import { Booking } from "#domain/booking/entities/booking";

export class CreateBookingUseCase {
    constructor(private readonly repository: BookingRepository) {}

    async execute(createBookingDto: CreateBooking): Promise<string> {
        const booking = Booking.create(createBookingDto);
        const createdBooking = await this.repository.save(booking);
        return createdBooking.id;
    }
}
