import { InvalidEventIdError } from "#domain/errors/event-id.error.js";
import crypto from "crypto";
import z from "zod";

export class EventId {
    private constructor(private readonly value: string) {}

    static generate() {
        return new EventId(crypto.randomUUID());
    }

    static from(value: string) {
        const schema = z.uuid();
        const result = schema.safeParse(value);
        if (!result.success) {
            throw new InvalidEventIdError();
        }
        return new EventId(value);
    }

    getValue() {
        return this.value;
    }
}
