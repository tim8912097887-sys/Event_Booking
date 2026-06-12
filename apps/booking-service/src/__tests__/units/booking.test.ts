import { Booking } from "#domain/booking/entities/booking.js";
import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { InvalidEventIdError } from "#domain/errors/event-id.error.js";
import { InvalidTransactionError } from "#domain/errors/booking.error.js";
import { BOOKING_STATUS } from "#application/dto/persistence-booking.dto.js";

describe("Booking", () => {
    describe("create", () => {
        it("should create a booking with pending payment status", () => {
            const booking = Booking.create({
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 3,
                amount: 150,
                currency: "USD",
            });

            expect(booking.getStatus()).toBe(BOOKING_STATUS.PENDING_PAYMENT);
            expect(booking.getSeats()).toBe(3);
            expect(booking.getTotalAmount().amount).toBe(150);
            expect(booking.getTotalAmount().currency).toBe("USD");
            expect(booking.getBookingId()).toBeTruthy();
        });

        it("should fail when create booking with invalid eventId", () => {
            expect(() =>
                Booking.create({
                    eventId: "invalid-uuid",
                    userId: crypto.randomUUID(),
                    seats: 3,
                    amount: 150,
                    currency: "USD",
                }),
            ).toThrow(InvalidEventIdError);
        });

        it("should preserve status when reconstituting an existing booking", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 2,
                amount: 200,
                currency: "EUR",
                status: BOOKING_STATUS.CONFIRMED,
            });

            expect(booking.getStatus()).toBe(BOOKING_STATUS.CONFIRMED);
            expect(booking.getSeats()).toBe(2);
            expect(booking.getTotalAmount().currency).toBe("EUR");
        });
    });

    describe("confirm", () => {
        it("should transition from pending payment to confirmed", () => {
            const booking = Booking.create({
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 1,
                amount: 50,
                currency: "USD",
            });

            booking.confirm();

            expect(booking.getStatus()).toBe(BOOKING_STATUS.CONFIRMED);
        });

        it("should not confirm a booking that is already confirmed", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 1,
                amount: 50,
                currency: "USD",
                status: BOOKING_STATUS.CONFIRMED,
            });

            expect(() => booking.confirm()).toThrow(InvalidTransactionError);
        });

        it("should not confirm a cancelled booking", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 1,
                amount: 50,
                currency: "USD",
                status: BOOKING_STATUS.CANCELLED,
            });

            expect(() => booking.confirm()).toThrow(InvalidTransactionError);
        });

        it("should not confirm a payment failed booking", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 1,
                amount: 50,
                currency: "USD",
                status: BOOKING_STATUS.PAYMENT_FAILED,
            });

            expect(() => booking.confirm()).toThrow(InvalidTransactionError);
        });
    });

    describe("cancel", () => {
        it("should transition from pending payment to cancelled", () => {
            const booking = Booking.create({
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 2,
                amount: 80,
                currency: "USD",
            });

            booking.cancel();

            expect(booking.getStatus()).toBe(BOOKING_STATUS.CANCELLED);
        });

        it("should transition from confirmed to cancelled", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 4,
                amount: 200,
                currency: "USD",
                status: BOOKING_STATUS.CONFIRMED,
            });

            booking.cancel();

            expect(booking.getStatus()).toBe(BOOKING_STATUS.CANCELLED);
        });

        it("should transition from payment failed to cancelled", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 4,
                amount: 200,
                currency: "USD",
                status: BOOKING_STATUS.PAYMENT_FAILED,
            });

            booking.cancel();

            expect(booking.getStatus()).toBe(BOOKING_STATUS.CANCELLED);
        });

        it("should not cancel a booking that is already cancelled", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 4,
                amount: 200,
                currency: "USD",
                status: BOOKING_STATUS.CANCELLED,
            });

            expect(() => booking.cancel()).toThrow(InvalidTransactionError);
        });
    });

    describe("paymentFail", () => {
        it("should transition from pending payment to payment failed", () => {
            const booking = Booking.create({
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 2,
                amount: 80,
                currency: "USD",
            });

            booking.paymentFail();

            expect(booking.getStatus()).toBe(BOOKING_STATUS.PAYMENT_FAILED);
        });

        it("should not move from confirmed to payment failed", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 3,
                amount: 120,
                currency: "USD",
                status: BOOKING_STATUS.CONFIRMED,
            });

            expect(() => booking.paymentFail()).toThrow(
                InvalidTransactionError,
            );
        });

        it("should not move from cancelled to payment failed", () => {
            const booking = Booking.reconstitute({
                id: crypto.randomUUID(),
                eventId: crypto.randomUUID(),
                userId: crypto.randomUUID(),
                seats: 3,
                amount: 120,
                currency: "USD",
                status: BOOKING_STATUS.CANCELLED,
            });

            expect(() => booking.paymentFail()).toThrow(
                InvalidTransactionError,
            );
        });
    });
});
