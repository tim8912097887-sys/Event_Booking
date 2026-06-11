import z from "zod";

export const CreateBookingSchema = z.object({
    eventId: z.uuid(),
    userId: z.uuid(),
    amount: z.number().positive("Amount must be a positive number"),
    currency: z.string(),
});
