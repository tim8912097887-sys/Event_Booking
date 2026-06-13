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
        try {
            const booking = Booking.create(createBookingDto);
            await this.repository.save(booking);
            return booking.id.getValue();
        } catch (error) {
            await this.eventService.releaseSeats(
                createBookingDto.eventId,
                createBookingDto.seats,
            );
            throw error;
        }
    }
}
