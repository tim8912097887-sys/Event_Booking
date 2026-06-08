import { Event } from "#domain/event/entities/event.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { IEvent } from "../port/i-event.js";

export class CreateEventUseCase {
    constructor(private readonly repository: EventCommandRepository) {}

    async execute(
        input: Omit<
            IEvent,
            "id" | "status" | "createdAt" | "updatedAt" | "deletedAt" | "date"
        > & { date: string },
    ): Promise<string> {
        const event = Event.create(input);
        const baseSlug = event.getSlug();
        let counter = 1;
        // Handle race conditions by db unique constraint
        while (true) {
            try {
                await this.repository.save(event);
                break;
            } catch (error: any) {
                // Throw error if it's not a unique violation
                if (!(error.code === "23505")) {
                    throw error;
                }

                counter++;
                event.changeSlug(`${baseSlug}-${counter}`);
            }
        }
        return event.getId();
    }
}
