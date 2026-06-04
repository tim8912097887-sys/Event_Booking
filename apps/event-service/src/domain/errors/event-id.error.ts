import { DomainError } from "./domain.error.js";

export class InvalidEventIdError extends DomainError {
    constructor() {
        super("Invalid event ID");
    }
}
