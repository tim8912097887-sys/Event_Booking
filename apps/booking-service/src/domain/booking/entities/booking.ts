import { BookingId } from "#domain/value-objects/booking-id.vo.js";
import { EventId } from "#domain/value-objects/event-id.vo.js";
import { UserId } from "#domain/value-objects/user-id.vo.js";
import { Money } from "#domain/value-objects/money.vo.js";
import { CreateBooking } from "#application/dto/create-booking.dto.js";
import {
    BOOKING_STATUS,
    BookingRecord,
    BookingStatus,
} from "#application/dto/persistence-booking.dto.js";
import { InvalidTransactionError } from "#domain/errors/booking.error.js";

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    PENDING_PAYMENT: [
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.PAYMENT_FAILED,
        BOOKING_STATUS.CANCELLED,
    ],
    CONFIRMED: [
        BOOKING_STATUS.CANCELLED, // maybe refund
    ],
    PAYMENT_FAILED: [BOOKING_STATUS.CANCELLED],
    CANCELLED: [],
};

export class Booking {
    constructor(
        public readonly id: BookingId,
        public readonly eventId: EventId,
        public readonly userId: UserId,
        public status: BookingStatus,
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
    }: Omit<BookingRecord, "createdAt" | "updatedAt">): Booking {
        return new Booking(
            BookingId.from(id),
            new EventId(eventId),
            new UserId(userId),
            status,
            new Money(amount, currency),
        );
    }

    cancel(): void {
        this.transition(BOOKING_STATUS.CANCELLED);
    }

    confirm(): void {
        this.transition(BOOKING_STATUS.CONFIRMED);
    }

    paymentFail(): void {
        this.transition(BOOKING_STATUS.PAYMENT_FAILED);
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

    getStatus(): BookingStatus {
        return this.status;
    }

    getTotalAmount(): Money {
        return this.totalAmount;
    }

    private transition(to: BookingStatus) {
        if (!allowedTransitions[this.status].includes(to)) {
            throw new InvalidTransactionError(this.status, to);
        }
        this.status = to;
    }
}
