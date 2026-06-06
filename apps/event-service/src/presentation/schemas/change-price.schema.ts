import z from "zod";

export const ChangePriceSchema = z.object({
    price: z.number().positive("Price must be a positive number"),
});
