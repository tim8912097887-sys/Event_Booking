import { Event } from "#domain/event/entities/event.js";

export interface EventRepository {
    save(event: Event): Promise<void>;

    findById(id: string): Promise<Event | null>;

    update(event: Event): Promise<void>;

    delete(id: string): Promise<void>;
}
