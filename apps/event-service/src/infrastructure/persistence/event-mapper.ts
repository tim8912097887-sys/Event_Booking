import { Event } from "#domain/event/entities/event.js";
import { IEvent } from "#application/port/i-event.js";
import { InferInsertModel } from "drizzle-orm";
import { events } from "./schema/event.js";

type NewEventPersistence = InferInsertModel<typeof events>;

export class EventMapper {
    // Convert Domain Entity -> Mongoose Database Document format
    public static toPersistence(event: Event): NewEventPersistence {
        return {
            id: event.getId(),
            name: event.getName(),
            slug: event.getSlug(),
            description: event.getDescription(),
            creatorId: event.getCreatorId(),
            date: event.getDate(),
            capacity: event.getCapacity(),
            reservedSeats: event.getReservedSeats(),
            version: event.getVersion(),
            price: event.getPrice().toFixed(2),
            status: event.getStatus(),
            deletedAt: event.getDeletedAt(),
        };
    }

    // Convert Mongoose Database Document -> Domain Entity format
    public static toDomain(doc: IEvent): Event {
        return Event.reconstitute({
            id: doc.id,
            name: doc.name,
            slug: doc.slug,
            description: doc.description,
            creatorId: doc.creatorId,
            date: doc.date,
            capacity: doc.capacity,
            reservedSeats: doc.reservedSeats,
            version: doc.version,
            price: doc.price,
            status: doc.status,
            deletedAt: doc.deletedAt,
        });
    }
}
