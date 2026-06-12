import { DomainError } from "./domain.error.js";

export class CapacityExceededError extends DomainError {
    constructor() {
        super("Not enough available seats");
    }
}
