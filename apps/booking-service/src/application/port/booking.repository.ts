import { BookingRecord } from "#application/dto/persistence-booking.dto.js";
import { Booking } from "#domain/booking/entities/booking.js";

export interface BookingRepository {
    save(booking: Booking): Promise<BookingRecord>;

    findById(id: string): Promise<Booking | null>;

    update(booking: Booking): Promise<void>;
}
