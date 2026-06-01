import { InvalidEmailError } from "#domain/errors/invalid-email-error.js";
import z from "zod";

export class RecipientEmail {
    private constructor(public readonly value: string) {}

    public static create(email: string): RecipientEmail {
        const recipientEmailSchema = z.email().toLowerCase().trim();
        const result = recipientEmailSchema.safeParse(email);
        if (!result.success) {
            throw new InvalidEmailError(email);
        }
        return new RecipientEmail(result.data);
    }
}
