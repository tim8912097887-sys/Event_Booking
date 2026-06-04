import { DomainError } from "./domain.error.js";

export class InvalidEventPriceError extends DomainError {
    constructor() {
        super("Event price cannot be negative");
    }
}
