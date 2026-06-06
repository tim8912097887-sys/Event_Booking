import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventRepository } from "../port/event-repository.js";

export class ChangeEventPriceUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(eventId: string, newPrice: number): Promise<void> {
        const event = await this.repository.findById(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        event.changePrice(newPrice);
        await this.repository.update(event);
    }
}
