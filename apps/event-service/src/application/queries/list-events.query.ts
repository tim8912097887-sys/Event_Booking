import {
    EventQueryRepository,
    EventsQueryFilter,
    PagedEventsResult,
} from "../port/event-query.repository.js";

export class ListEventsQuery {
    constructor(private readonly repository: EventQueryRepository) {}

    async execute(filter: EventsQueryFilter): Promise<PagedEventsResult> {
        return this.repository.findEvents(filter);
    }
}
