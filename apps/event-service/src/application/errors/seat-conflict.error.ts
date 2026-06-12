import { ApplicationError } from "./application.error.js";

export class SeatConflictError extends ApplicationError {
    constructor(action: string) {
        super(`seat conflict error: ${action}`);
    }
}
