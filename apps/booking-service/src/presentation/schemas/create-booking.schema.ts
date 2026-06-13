import z from "zod";

export const CreateBookingSchema = z.object({
    eventId: z.uuid(),
    userId: z.uuid(),
    seats: z.number().positive("Seats must be a positive number"),
    amount: z.number().positive("Amount must be a positive number"),
    currency: z.string(),
});
