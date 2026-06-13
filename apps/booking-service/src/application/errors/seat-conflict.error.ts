import { ApplicationError } from "./application.error.js";

export class SeatConflictError extends ApplicationError {
    constructor() {
        super("seat conflict error");
    }
}
