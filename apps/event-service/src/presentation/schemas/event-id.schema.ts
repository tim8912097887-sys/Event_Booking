import z from "zod";

export const EventIdSchema = z.object({ id: z.uuid() });
