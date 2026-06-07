import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";

export class ChangeEventNameUseCase {
    constructor(private readonly repository: EventCommandRepository) {}

    async execute(eventId: string, newName: string): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.changeName(newName);
        await this.repository.update(event);
    }
}
