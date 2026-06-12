import { CreateBooking } from "#application/dto/create-booking.dto.js";
import { BookingRepository } from "#application/port/booking.repository.js";
import { Booking } from "#domain/booking/entities/booking.js";
import { EventServicePort } from "../port/event.service.port.js";

export class CreateBookingUseCase {
    constructor(
        private readonly repository: BookingRepository,
        private readonly eventService: EventServicePort,
    ) {}

    async execute(createBookingDto: CreateBooking): Promise<string> {
        await this.eventService.reserveSeats(
            createBookingDto.eventId,
            createBookingDto.seats,
        );
        const booking = Booking.create(createBookingDto);
        const createdBooking = await this.repository.save(booking);
        return createdBooking.id;
    }
}
