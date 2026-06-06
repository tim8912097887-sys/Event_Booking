import z from "zod";

export const ChangeNameSchema = z.object({
    name: z
        .string()
        .min(3, "Name at least 3 characters")
        .max(100, "Name at most 100 characters"),
});
