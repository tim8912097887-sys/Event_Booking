import { BookingId } from "#domain/value-objects/booking-id.vo";
import { EventId } from "#domain/value-objects/event-id.vo";
import { UserId } from "#domain/value-objects/user-id.vo";
import { Money } from "#domain/value-objects/money.vo";
import { CreateBooking } from "#application/dto/create-booking.dto";
import {
    BOOKING_STATUS,
    BookingRecord,
    BookingStatus,
} from "#application/dto/persistence-booking.dto";

export class Booking {
    constructor(
        public readonly id: BookingId,
        public readonly eventId: EventId,
        public readonly userId: UserId,
        public readonly status: BookingStatus,
        public readonly totalAmount: Money,
    ) {}

    static create({
        eventId,
        userId,
        amount,
        currency,
    }: CreateBooking): Booking {
        return new Booking(
            BookingId.generate(),
            new EventId(eventId),
            new UserId(userId),
            BOOKING_STATUS.PENDING_PAYMENT,
            new Money(amount, currency),
        );
    }

    static reconstitute({
        id,
        eventId,
        userId,
        status,
        amount,
        currency,
    }: BookingRecord): Booking {
        return new Booking(
            BookingId.from(id),
            new EventId(eventId),
            new UserId(userId),
            status,
            new Money(amount, currency),
        );
    }

    getBookingId(): string {
        return this.id.getValue();
    }

    getEventId(): string {
        return this.eventId.getValue();
    }

    getUserId(): string {
        return this.userId.getValue();
    }

    getStatus(): string {
        return this.status;
    }

    getAmount(): number {
        return this.totalAmount.amount;
    }

    getCurrency(): string {
        return this.totalAmount.currency;
    }
}
