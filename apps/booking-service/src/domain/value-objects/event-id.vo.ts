import { InvalidEventIdError } from "#domain/errors/event-id.error.js";
import z from "zod";

export class EventId {
    constructor(private readonly value: string) {
        const schema = z.uuid();
        const result = schema.safeParse(value);
        if (!result.success) {
            throw new InvalidEventIdError();
        }
    }

    getValue() {
        return this.value;
    }
}
