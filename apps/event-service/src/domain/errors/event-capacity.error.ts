import { DomainError } from "./domain.error.js";

export class InvalidEventCapacityError extends DomainError {
    constructor() {
        super("Event capacity must be between 1 and 1000");
    }
}
