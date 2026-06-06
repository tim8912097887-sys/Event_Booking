import z from "zod";

export const ChangeDescriptionSchema = z.object({
    description: z
        .string()
        .min(10, "Description at least 10 characters")
        .max(500, "Description at most 500 characters"),
});
