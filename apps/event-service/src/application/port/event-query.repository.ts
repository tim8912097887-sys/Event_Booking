import { PublicEventDto } from "../dto/public-event.dto.js";

export interface EventsQueryFilter {
    q?: string;

    minPrice?: number;
    maxPrice?: number;

    startDate?: string;
    endDate?: string;

    sort?: "date" | "price";
    order?: "asc" | "desc";

    page?: number;
    limit?: number;
}

export interface PagedEventsResult {
    events: PublicEventDto[];
    total: number;
    page: number;
    limit: number;
}

export interface EventQueryRepository {
    findEventBySlug(slug: string): Promise<PublicEventDto | null>;
    findEvents(filter: EventsQueryFilter): Promise<PagedEventsResult>;
}
