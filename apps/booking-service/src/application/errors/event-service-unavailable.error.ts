import { ApplicationError } from "./application.error.js";

export class EventServiceUnavailableError extends ApplicationError {
    constructor() {
        super("Event service is unavailable");
        this.name = "EventServiceUnavailableError";
    }
}
