import z from "zod";

export const RequestedSeatSchema = z.object({
    requestedSeats: z
        .number("Requested seat must be a number")
        .min(1, "Requested seat must be at least 1"),
});
