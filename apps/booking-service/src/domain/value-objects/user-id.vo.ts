import { InvalidUserIdError } from "#domain/errors/user-id.error.js";
import z from "zod";

export class UserId {
    constructor(private readonly value: string) {
        const schema = z.uuid();
        const result = schema.safeParse(value);
        if (!result.success) {
            throw new InvalidUserIdError();
        }
    }

    getValue(): string {
        return this.value;
    }
}
