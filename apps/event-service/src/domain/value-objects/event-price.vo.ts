import { InvalidEventPriceError } from "#domain/errors/event-price.error.js";

export class EventPrice {
    constructor(private readonly value: number) {
        if (value < 0) {
            throw new InvalidEventPriceError();
        }
    }

    getValue() {
        return this.value;
    }
}
