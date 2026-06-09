import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";

export class PublishEventUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
    ) {}
    async execute(eventId: string, ownerEmail: string): Promise<void> {
        await this.tracer.startActiveSpan(
            "PublishEventUseCase",
            async () => {
                const event = await this.repository.findById(eventId);
                if (!event) {
                    throw new EventNotFoundError(eventId);
                }
                event.publish(ownerEmail);
                await this.repository.update(event);
            },
            {
                "event.id": eventId,
                "event.action": "publish",
            },
        );
    }
}
