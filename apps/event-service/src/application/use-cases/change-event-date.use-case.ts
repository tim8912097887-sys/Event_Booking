import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventRepository } from "../port/event-repository.js";

export class ChangeEventDateUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(eventId: string, newDate: string): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.changeDate(newDate);
        await this.repository.update(event);
    }
}
