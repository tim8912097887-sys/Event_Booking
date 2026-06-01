import { DomainError } from "./domain-error.js";

export class EmailSendFailedError extends DomainError {
    constructor() {
        super("Failed to send email");
        this.name = "EmailSendFailedError";
    }
}
