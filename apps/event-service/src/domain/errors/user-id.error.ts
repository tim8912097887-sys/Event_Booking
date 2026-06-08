import { DomainError } from "./domain.error.js";

export class InvalidUserIdError extends DomainError {
    constructor() {
        super("Invalid user ID");
    }
}
