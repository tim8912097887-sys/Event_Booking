import { DomainError } from "./domain.error";

export class InvalidTransactionError extends DomainError {
    constructor(from: string, to: string) {
        super(`Invalid transaction from ${from} to ${to}`);
    }
}
