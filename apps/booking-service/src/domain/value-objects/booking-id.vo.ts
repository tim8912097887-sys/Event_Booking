import { InvalidBookingIdError } from "#domain/errors/booking-id.error.js";
import crypto from "crypto";
import z from "zod";

export class BookingId {
    private constructor(public readonly value: string) {}

    static generate(): BookingId {
        return new BookingId(crypto.randomUUID());
    }

    static from(value: string): BookingId {
        const schema = z.uuid();
        const result = schema.safeParse(value);
        if (!result.success) {
            throw new InvalidBookingIdError();
        }
        return new BookingId(value);
    }

    getValue(): string {
        return this.value;
    }
}
