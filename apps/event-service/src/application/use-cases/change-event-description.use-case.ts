import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";

export class ChangeEventDescriptionUseCase {
    constructor(private readonly repository: EventCommandRepository) {}

    async execute(eventId: string, newDescription: string): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.changeDescription(newDescription);
        await this.repository.update(event);
    }
}
