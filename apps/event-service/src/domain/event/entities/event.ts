import {
    EventAlreadyCancelledError,
    EventAlreadyDeletedError,
    EventDeletedModificationError,
    EventNotDraftError,
} from "#domain/errors/entity.error.js";
import { EventCapacity } from "#domain/value-objects/event-capacity.vo.js";
import { EventDate } from "#domain/value-objects/event-date.vo.js";
import { EventDescription } from "#domain/value-objects/event-description.vo.js";
import { EventId } from "#domain/value-objects/event-id.vo.js";
import { EventName } from "#domain/value-objects/event-name.vo.js";
import { EventPrice } from "#domain/value-objects/event-price.vo.js";
import { UserId } from "#domain/value-objects/user-id.vo.js";

enum EventStatus {
    PUBLISHED = "PUBLISHED",
    CANCELLED = "CANCELLED",
    DRAFT = "DRAFT",
}

export class Event {
    private constructor(
        private readonly id: EventId,
        private name: EventName,
        private description: EventDescription,
        private creatorId: UserId,
        private date: EventDate,
        private capacity: EventCapacity,
        private price: EventPrice,
        private status: EventStatus,
        private deletedAt: Date | null,
    ) {}

    static create(
        name: string,
        description: string,
        creatorId: string,
        date: Date,
        capacity: number,
        price: number,
    ) {
        return new Event(
            EventId.generate(),
            new EventName(name),
            new EventDescription(description),
            new UserId(creatorId),
            EventDate.fromDate(date),
            new EventCapacity(capacity),
            new EventPrice(price),
            EventStatus.DRAFT,
            null,
        );
    }

    reconstitute(
        id: string,
        name: string,
        description: string,
        creatorId: string,
        date: Date,
        capacity: number,
        price: number,
        status: EventStatus,
        deletedAt: Date | null,
    ) {
        return new Event(
            EventId.from(id),
            new EventName(name),
            new EventDescription(description),
            new UserId(creatorId),
            EventDate.fromDate(date),
            new EventCapacity(capacity),
            new EventPrice(price),
            status,
            deletedAt,
        );
    }

    changeDate(newDate: Date) {
        this.ensureDraft();
        this.date = EventDate.fromDate(newDate);
    }

    changeCapacity(newCapacity: number) {
        this.ensureDraft();
        this.capacity = new EventCapacity(newCapacity);
    }

    changePrice(newPrice: number) {
        this.ensureDraft();
        this.price = new EventPrice(newPrice);
    }

    delete() {
        if (this.status === EventStatus.PUBLISHED) {
            throw new EventAlreadyDeletedError();
        }
        if (this.deletedAt !== null) {
            throw new EventAlreadyDeletedError();
        }
        this.deletedAt = new Date();
    }

    publish() {
        this.ensureDraft();
        this.status = EventStatus.PUBLISHED;
    }

    cancel() {
        if (this.deletedAt !== null) {
            throw new EventDeletedModificationError();
        }
        if (this.status === EventStatus.CANCELLED) {
            throw new EventAlreadyCancelledError();
        }

        this.status = EventStatus.CANCELLED;
    }

    getId(): string {
        return this.id.getValue();
    }

    getName(): string {
        return this.name.getValue();
    }

    getDescription(): string {
        return this.description.getValue();
    }

    getCreatorId(): string {
        return this.creatorId.getValue();
    }

    getDate(): Date {
        return this.date.getValue();
    }

    getCapacity(): number {
        return this.capacity.getValue();
    }

    getPrice(): number {
        return this.price.getValue();
    }

    getStatus(): EventStatus {
        return this.status;
    }

    getDeletedAt(): Date | null {
        return this.deletedAt;
    }

    private ensureDraft() {
        if (this.deletedAt !== null) {
            throw new EventDeletedModificationError();
        }
        if (this.status !== EventStatus.DRAFT) {
            throw new EventNotDraftError();
        }
    }
}
