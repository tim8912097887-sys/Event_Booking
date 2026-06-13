import { ApplicationError } from "./application.error.js";

export class EventNotFoundError extends ApplicationError {
    constructor(eventId: string) {
        super(`Event ${eventId} not found`);
    }
}
