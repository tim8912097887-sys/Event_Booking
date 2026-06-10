export class BookingNotFoundError extends Error {
    constructor(id: string) {
        super(`Booking ${id} not found`);
    }
}
