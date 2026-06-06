import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventRepository } from "../port/event-repository.js";

export class DeleteEventUseCase {
    constructor(private readonly repository: EventRepository) {}
    async execute(eventId: string): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.delete();
        await this.repository.delete(eventId);
    }
}
