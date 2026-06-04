import { Event } from "#domain/event/entities/event.js";

export interface EventRepository {
    save(event: Event): Promise<void>;

    findById(id: string): Promise<Event | null>;

    delete(id: string): Promise<void>;
}
