import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class ChangeEventDateUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
    ) {}

    async execute(eventId: string, newDate: string): Promise<void> {
        return this.tracer.startActiveSpan(
            "ChangeEventDateUseCase",
            async () => {
                const event = await this.repository.findById(eventId);
                if (!event) {
                    throw new EventNotFoundError(eventId);
                }
                event.changeDate(newDate);
                await this.repository.update(event);
            },
            {
                "event.id": eventId,
                "event.newDate": newDate,
                "event.action": "change-date",
            },
        );
    }
}
