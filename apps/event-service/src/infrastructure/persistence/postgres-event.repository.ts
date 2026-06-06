import { EventRepository } from "#application/port/event-repository.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { events } from "./schema/event.js";
import { Event } from "#domain/event/entities/event.js";
import { EventMapper } from "./event-mapper.js";
import { eq } from "drizzle-orm";

export class PostgresEventRepository implements EventRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async save(event: Event): Promise<void> {
        const eventData = EventMapper.toPersistence(event);
        await this.db.insert(events).values(eventData).execute();
    }

    async findById(id: string): Promise<Event | null> {
        const result = await this.db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .execute();
        if (result.length === 0) return null;
        return EventMapper.toDomain({
            ...result[0],
            price: parseFloat(result[0].price),
        });
    }

    async update(event: Event): Promise<void> {
        const eventData = EventMapper.toPersistence(event);
        await this.db
            .update(events)
            .set(eventData)
            .where(eq(events.id, event.getId()))
            .execute();
    }

    async delete(id: string): Promise<void> {
        await this.db
            .update(events)
            .set({ deletedAt: new Date() })
            .where(eq(events.id, id))
            .execute();
    }
}
