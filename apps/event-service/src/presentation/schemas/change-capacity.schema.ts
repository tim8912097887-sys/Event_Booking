import z from "zod";

export const ChangeCapacitySchema = z.object({
    capacity: z.number().min(1, "Capacity must be at least 1"),
});
