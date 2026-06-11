import { ApplicationError } from "./application.error.js";

export class BookingNotFoundError extends ApplicationError {
    constructor(id: string) {
        super(`Booking ${id} not found`);
    }
}
