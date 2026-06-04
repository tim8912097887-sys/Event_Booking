import { DomainError } from "./domain.error.js";

export class EventAlreadyDeletedError extends DomainError {
    constructor() {
        super("Event is already deleted");
    }
}

export class EventDeletedModificationError extends DomainError {
    constructor() {
        super("Cannot modify a deleted event");
    }
}

export class EventNotDraftError extends DomainError {
    constructor() {
        super("Only draft events can be modified");
    }
}

export class PublishedEventDeletionError extends DomainError {
    constructor() {
        super("Cannot delete a published event");
    }
}

export class EventAlreadyCancelledError extends DomainError {
    constructor() {
        super("Event is already cancelled");
    }
}
