import { DomainError } from "./domain.error.js";

export class InsufficientReservedSeatsError extends DomainError {
    constructor() {
        super("Cannot release more seats than reserved");
    }
}
