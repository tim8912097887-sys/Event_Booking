import { DomainError } from "./domain.error.js";

export class InvalidBookingIdError extends DomainError {
    constructor() {
        super("Invalid booking ID");
    }
}
