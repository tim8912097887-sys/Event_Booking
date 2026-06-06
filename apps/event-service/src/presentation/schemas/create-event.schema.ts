import z from "zod";

export const CreateEventSchema = z.object({
    name: z
        .string()
        .min(3, "Name at least 3 characters")
        .max(100, "Name at most 100 characters"),
    description: z
        .string()
        .min(10, "Description at least 10 characters")
        .max(500, "Description at most 500 characters"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format",
    }),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    price: z.number().positive("Price must be a positive number"),
    creatorId: z.uuid(),
});
