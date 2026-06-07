import { PublicEventDto } from "../dto/public-event.dto.js";
import { EventQueryRepository } from "../port/event-query.repository.js";

export class GetEventBySlugQuery {
    constructor(private readonly repository: EventQueryRepository) {}

    async execute(slug: string): Promise<PublicEventDto | null> {
        const event = await this.repository.findEventBySlug(slug);
        if (!event) {
            return null;
        }
        return event;
    }
}
