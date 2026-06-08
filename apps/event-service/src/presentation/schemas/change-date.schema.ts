import z from "zod";

export const ChangeDateSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format",
    }),
});
