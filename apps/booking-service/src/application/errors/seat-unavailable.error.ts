import { ApplicationError } from "./application.error.js";

export class SeatUnavailableError extends ApplicationError {
    constructor() {
        super("Seat is unavailable");
    }
}
