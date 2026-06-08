import { DomainError } from "./domain.error.js";

export class InvalidEventNameError extends DomainError {
    constructor() {
        super("Event name must be between 3 and 100 characters");
    }
}
