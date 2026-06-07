import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { events } from "./schema/event.js";
import {
    and,
    asc,
    count,
    desc,
    eq,
    gte,
    ilike,
    isNull,
    lte,
    or,
    SQL,
} from "drizzle-orm";
import { PublicEventDto } from "#application/dto/public-event.dto.js";
import {
    EventQueryRepository,
    EventsQueryFilter,
    PagedEventsResult,
} from "#application/port/event-query.repository.js";

export class PostgresEventQueryRepository implements EventQueryRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async findEventBySlug(slug: string): Promise<PublicEventDto | null> {
        const result = await this.db
            .select({
                slug: events.slug,
                name: events.name,
                description: events.description,
                date: events.date,
                capacity: events.capacity,
                price: events.price,
            })
            .from(events)
            .where(
                and(
                    eq(events.slug, slug),
                    eq(events.status, "PUBLISHED"),
                    isNull(events.deletedAt),
                ),
            )
            .execute();
        if (result.length === 0) return null;
        return PublicEventDto.from({
            ...result[0],
            price: parseFloat(result[0].price),
        });
    }

    async findEvents(filter: EventsQueryFilter): Promise<PagedEventsResult> {
        // Pagination
        const page = filter.page || 1;
        let limit = filter.limit || 10;
        if (limit > 100) limit = 100;
        const offset = (page - 1) * limit;
        const conditions: SQL[] = [
            isNull(events.deletedAt),
            eq(events.status, "PUBLISHED"),
        ];

        if (filter.q) {
            conditions.push(
                // Filter always present
                or(
                    ilike(events.name, `%${filter.q}%`),
                    ilike(events.description, `%${filter.q}%`),
                )!,
            );
        }

        if (filter.minPrice !== undefined) {
            conditions.push(gte(events.price, filter.minPrice.toString()));
        }

        if (filter.maxPrice !== undefined) {
            conditions.push(lte(events.price, filter.maxPrice.toString()));
        }

        if (filter.startDate) {
            conditions.push(gte(events.date, new Date(filter.startDate)));
        }

        if (filter.endDate) {
            conditions.push(lte(events.date, new Date(filter.endDate)));
        }
        // Add Id for tie breaker
        let orderByClause = [
            desc(events.date),
            asc(events.price),
            asc(events.id),
        ];

        if (filter.sort && filter.order) {
            switch (filter.sort) {
                case "date":
                    if (filter.order === "asc") {
                        orderByClause = [asc(events.date), asc(events.price)];
                    } else {
                        orderByClause = [desc(events.date), asc(events.price)];
                    }
                    break;
                case "price":
                    if (filter.order === "asc") {
                        orderByClause = [desc(events.date), asc(events.price)];
                    } else {
                        orderByClause = [desc(events.date), desc(events.price)];
                    }
                    break;
            }
            // Add Id for tie breaker
            orderByClause.push(asc(events.id));
        }

        const [result, total] = await Promise.all([
            this.db
                .select({
                    slug: events.slug,
                    name: events.name,
                    description: events.description,
                    date: events.date,
                    capacity: events.capacity,
                    price: events.price,
                })
                .from(events)
                .where(and(...conditions))
                .orderBy(...orderByClause)
                .limit(limit)
                .offset(offset)
                .execute(),
            this.db
                .select({ count: count() })
                .from(events)
                .where(and(...conditions))
                .execute(),
        ]);
        if (result.length === 0) return { events: [], total: 0, page, limit };
        // Map to PublicEventDto
        const filterEvents = result.map((event) =>
            PublicEventDto.from({ ...event, price: parseFloat(event.price) }),
        );
        return {
            events: filterEvents,
            total: total[0].count,
            page,
            limit,
        };
    }
}
