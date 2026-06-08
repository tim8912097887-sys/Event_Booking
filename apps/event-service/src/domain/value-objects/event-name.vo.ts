import { InvalidEventNameError } from "#domain/errors/event-name.error.js";

export class EventName {
    constructor(private readonly value: string) {
        if (value.trim() === "" || value.length > 100 || value.length < 3) {
            throw new InvalidEventNameError();
        }
    }

    getValue(): string {
        return this.value;
    }
}
