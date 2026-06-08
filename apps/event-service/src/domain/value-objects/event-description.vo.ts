import { InvalidEventDescriptionError } from "#domain/errors/event-description.error.js";

export class EventDescription {
    constructor(private readonly value: string) {
        if (value.trim() === "" || value.length > 500 || value.length < 10) {
            throw new InvalidEventDescriptionError();
        }
    }

    getValue(): string {
        return this.value;
    }
}
