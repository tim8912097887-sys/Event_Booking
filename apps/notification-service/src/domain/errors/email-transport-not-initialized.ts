import { DomainError } from "./domain-error.js";

export class EmailTransportNotInitializedError extends DomainError {
    constructor() {
        super("Email transporter is not initialized");
        this.name = "EmailTransportNotInitializedError";
    }
}
