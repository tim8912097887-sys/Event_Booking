import crypto from "crypto";
import { EventCommandRepository } from "#application/port/event-command.repository.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { events } from "./schema/event.js";
import { Event } from "#domain/event/entities/event.js";
import { EventMapper } from "./event-mapper.js";
import { eq } from "drizzle-orm";
import { outboxEvents } from "./schema/outbox-event.js";
import { context, propagation } from "@opentelemetry/api";

export class PostgresEventCommandRepository implements EventCommandRepository {
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

    async findBySlug(slug: string): Promise<Event | null> {
        const result = await this.db
            .select()
            .from(events)
            .where(eq(events.slug, slug))
            .execute();
        if (result.length === 0) return null;
        return EventMapper.toDomain({
            ...result[0],
            price: parseFloat(result[0].price),
        });
    }

    async update(event: Event): Promise<void> {
        const eventData = EventMapper.toPersistence(event);
        await this.db.transaction(async (trx) => {
            await trx
                .update(events)
                .set(eventData)
                .where(eq(events.id, event.getId()))
                .execute();
            const domainEvents = event.getDomainEvents();
            for (const domainEvent of domainEvents) {
                // Inject trace context for outbox
                const carrier: Record<string, string> = {};

                propagation.inject(context.active(), carrier);
                await trx
                    .insert(outboxEvents)
                    .values({
                        id: crypto.randomUUID(),
                        eventName: domainEvent.eventName,
                        payload: domainEvent,
                        traceContext: carrier,
                    })
                    .execute();
            }
            event.clearDomainEvents();
        });
    }

    async delete(id: string): Promise<void> {
        await this.db
            .update(events)
            .set({ deletedAt: new Date() })
            .where(eq(events.id, id))
            .execute();
    }
}
