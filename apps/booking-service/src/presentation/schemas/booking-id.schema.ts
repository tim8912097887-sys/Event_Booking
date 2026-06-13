import z from "zod";

export const BookingIdSchema = z.object({ id: z.uuid() });
