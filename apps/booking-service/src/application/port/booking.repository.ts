import { BookingRecord } from "#application/dto/persistence-booking.dto";
import { Booking } from "#domain/booking/entities/booking";

export interface BookingRepository {
    save(booking: Booking): Promise<BookingRecord>;

    findById(id: string): Promise<Booking | null>;

    update(booking: Booking): Promise<void>;
}
