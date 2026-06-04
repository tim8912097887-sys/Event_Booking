import { InvalidEventCapacityError } from "#domain/errors/event-capacity.error.js";

export class EventCapacity {
    constructor(private readonly value: number) {
        if (value <= 0) {
            throw new InvalidEventCapacityError();
        }

        if (value > 1000) {
            throw new InvalidEventCapacityError();
        }
    }

    getValue(): number {
        return this.value;
    }
}
