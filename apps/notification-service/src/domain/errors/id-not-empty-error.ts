import { DomainError } from "./domain-error.js";

export class IdNotEmptyError extends DomainError {
    constructor(idType: string) {
        super(`${idType} ID cannot be empty.`);
    }
}
