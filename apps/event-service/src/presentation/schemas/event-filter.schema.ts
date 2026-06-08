import z from "zod";

export const EventFilterSchema = z
    .object({
        q: z.string().optional(),
        minPrice: z.coerce
            .number()
            .min(0, "Min price must be at least 0")
            .optional(),
        maxPrice: z.coerce
            .number()
            .min(0, "Max price must be at least 0")
            .optional(),
        startDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "Start date must be in YYYY-MM-DD format",
            })
            .optional(),
        endDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
                message: "End date must be in YYYY-MM-DD format",
            })
            .optional(),
        sort: z
            .enum(["date", "price"], "Sort must be 'date' or 'price'")
            .optional(),
        order: z
            .enum(["asc", "desc"], "Order must be 'asc' or 'desc'")
            .optional(),
        page: z.coerce.number().positive().optional(),
        limit: z.coerce.number().positive().max(100).optional(),
    })
    .refine((data) => {
        if (data.startDate && data.endDate)
            return new Date(data.startDate) < new Date(data.endDate);
        return true;
    }, "Start date must be before end date")
    .refine((data) => {
        if (data.minPrice && data.maxPrice)
            return data.minPrice < data.maxPrice;
        return true;
    }, "Min price must be less than max price");
