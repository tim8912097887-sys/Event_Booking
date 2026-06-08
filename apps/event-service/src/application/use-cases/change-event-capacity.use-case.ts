import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";

export class ChangeEventCapacityUseCase {
    constructor(private readonly repository: EventCommandRepository) {}

    async execute(eventId: string, newCapacity: number): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.changeCapacity(newCapacity);
        await this.repository.update(event);
    }
}
