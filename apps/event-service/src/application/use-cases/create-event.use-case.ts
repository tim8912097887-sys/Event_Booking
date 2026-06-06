import { Event } from "#domain/event/entities/event.js";
import { EventRepository } from "../port/event-repository.js";
import { IEvent } from "../port/i-event.js";

export class CreateEventUseCase {
    constructor(private readonly repository: EventRepository) {}

    async execute(
        input: Omit<
            IEvent & { date: string },
            "id" | "status" | "createdAt" | "updatedAt" | "deletedAt"
        >,
    ): Promise<string> {
        const event = Event.create(input);
        await this.repository.save(event);
        return event.getId();
    }
}
