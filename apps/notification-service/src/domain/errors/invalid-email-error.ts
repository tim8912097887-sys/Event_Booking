import { DomainError } from "./domain-error.js";

export class InvalidEmailError extends DomainError {
    constructor(email: string) {
        super(`The email address '${email}' is structurally invalid.`);
    }
}
