export interface EventServicePort {
    reserveSeats(eventId: string, seats: number): Promise<void>;
    releaseSeats(eventId: string, seats: number): Promise<void>;
}
