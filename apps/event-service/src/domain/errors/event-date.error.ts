import { DomainError } from "./domain.error.js";

export class InvalidEventDateError extends DomainError {
    constructor() {
        super("Event date cannot be in the past");
    }
}
