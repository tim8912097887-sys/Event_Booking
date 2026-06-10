import { BookingRecord } from "#application/dto/persistence-booking.dto";
import { Booking } from "#domain/booking/entities/booking";

export class BookingMapper {
    public static toPersistence(
        booking: Booking,
    ): Omit<BookingRecord, "createdAt" | "updatedAt"> {
        return {
            id: booking.getBookingId(),
            eventId: booking.getEventId(),
            userId: booking.getUserId(),
            status: booking.getStatus(),
            amount: booking.getTotalAmount().amount,
            currency: booking.getTotalAmount().currency,
        };
    }

    // Convert Mongoose Database Document -> Domain Entity format
    public static toDomain(doc: BookingRecord): Booking {
        return Booking.reconstitute({
            id: doc.id,
            eventId: doc.eventId,
            userId: doc.userId,
            status: doc.status,
            amount: doc.amount,
            currency: doc.currency,
        });
    }
}
