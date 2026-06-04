import { InvalidEventDateError } from "#domain/errors/event-date.error.js";

export class EventDate {
    private constructor(private readonly value: Date) {
        if (value.getTime() < Date.now()) {
            throw new InvalidEventDateError();
        }
    }

    static fromISOString(value: string) {
        return new EventDate(new Date(value));
    }

    static fromDate(date: Date) {
        return new EventDate(date);
    }

    getValue(): Date {
        return this.value;
    }
}
