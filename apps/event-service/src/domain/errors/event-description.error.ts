import { DomainError } from "./domain.error.js";

export class InvalidEventDescriptionError extends DomainError {
    constructor() {
        super("Event description must be between 10 and 500 characters");
    }
}
