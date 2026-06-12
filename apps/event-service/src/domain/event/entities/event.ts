import {
    EventAlreadyCancelledError,
    EventAlreadyDeletedError,
    EventDeletedModificationError,
    EventNotDraftError,
    EventNotPublishedError,
    PublishedEventDeletionError,
} from "#domain/errors/entity.error.js";
import { EventCapacity } from "#domain/value-objects/event-capacity.vo.js";
import { EventDate } from "#domain/value-objects/event-date.vo.js";
import { EventDescription } from "#domain/value-objects/event-description.vo.js";
import { EventId } from "#domain/value-objects/event-id.vo.js";
import { EventName } from "#domain/value-objects/event-name.vo.js";
import { EventPrice } from "#domain/value-objects/event-price.vo.js";
import { UserId } from "#domain/value-objects/user-id.vo.js";
import { IEvent } from "#application/port/i-event.js";
import { EventSlug } from "#domain/value-objects/event-slug.vo.js";
import { AggregateRoot } from "../aggregate-root.js";
import { EventPublishedDomainEvent } from "#domain/message/event-published-domain-event.js";
import { EventCancelledDomainEvent } from "#domain/message/event-cancelled-domain-event.js";
import { CreateEventDto } from "#application/dto/create-event.dto.js";
import { InsufficientReservedSeatsError } from "#domain/errors/insufficient-reserved-seats.error.js";
import { CapacityExceededError } from "#domain/errors/capacity-exceeded.error.js";

const EventStatus = {
    PUBLISHED: "PUBLISHED",
    CANCELLED: "CANCELLED",
    DRAFT: "DRAFT",
} as const;

export class Event extends AggregateRoot {
    private constructor(
        private readonly id: EventId,
        private name: EventName,
        private slug: EventSlug,
        private description: EventDescription,
        private creatorId: UserId,
        private date: EventDate,
        private capacity: EventCapacity,
        private reservedSeats: number,
        private version: number,
        private price: EventPrice,
        private status: (typeof EventStatus)[keyof typeof EventStatus],
        private deletedAt: Date | null,
    ) {
        super();
    }

    static create({
        name,
        description,
        creatorId,
        date,
        capacity,
        price,
    }: CreateEventDto) {
        return new Event(
            EventId.generate(),
            new EventName(name),
            EventSlug.generate(name),
            new EventDescription(description),
            new UserId(creatorId),
            EventDate.fromISOString(date),
            new EventCapacity(capacity),
            0,
            1,
            new EventPrice(price),
            EventStatus.DRAFT,
            null,
        );
    }

    static reconstitute({
        id,
        name,
        slug,
        description,
        creatorId,
        date,
        capacity,
        reservedSeats,
        version,
        price,
        status,
        deletedAt,
    }: IEvent) {
        return new Event(
            EventId.from(id),
            new EventName(name),
            EventSlug.from(slug),
            new EventDescription(description),
            new UserId(creatorId),
            EventDate.fromDate(date),
            new EventCapacity(capacity),
            reservedSeats,
            version,
            new EventPrice(price),
            status,
            deletedAt,
        );
    }

    releaseSeat(requestedSeats: number) {
        if (this.status !== EventStatus.PUBLISHED) {
            throw new EventNotPublishedError();
        }
        if (this.deletedAt !== null) {
            throw new EventAlreadyDeletedError();
        }
        if (
            this.reservedSeats === 0 ||
            this.reservedSeats - requestedSeats < 0
        ) {
            throw new InsufficientReservedSeatsError();
        }
        this.reservedSeats -= requestedSeats;
        this.version += 1;
    }

    reserveSeat(requestedSeats: number) {
        if (this.status !== EventStatus.PUBLISHED) {
            throw new EventNotPublishedError();
        }
        if (this.deletedAt !== null) {
            throw new EventAlreadyDeletedError();
        }
        if (this.reservedSeats + requestedSeats > this.capacity.getValue()) {
            throw new CapacityExceededError();
        }
        this.reservedSeats += requestedSeats;
        this.version += 1;
    }

    changeName(newName: string) {
        this.ensureDraft();
        this.name = new EventName(newName);
    }

    changeDescription(newDescription: string) {
        this.ensureDraft();
        this.description = new EventDescription(newDescription);
    }

    changeDate(newDate: string) {
        this.ensureDraft();
        this.date = EventDate.fromISOString(newDate);
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
            throw new PublishedEventDeletionError();
        }
        if (this.deletedAt !== null) {
            throw new EventAlreadyDeletedError();
        }
        this.deletedAt = new Date();
    }

    publish(ownerEmail: string) {
        this.ensureDraft();
        this.status = EventStatus.PUBLISHED;
        this.addDomainEvent(
            new EventPublishedDomainEvent(
                this.id.getValue(),
                this.slug.getValue(),
                this.name.getValue(),
                this.date.getValue().toISOString(),
                ownerEmail,
            ),
        );
    }

    cancel() {
        if (this.deletedAt !== null) {
            throw new EventDeletedModificationError();
        }
        if (this.status === EventStatus.CANCELLED) {
            throw new EventAlreadyCancelledError();
        }

        this.status = EventStatus.CANCELLED;
        this.addDomainEvent(
            new EventCancelledDomainEvent(
                this.id.getValue(),
                this.name.getValue(),
                this.slug.getValue(),
            ),
        );
    }

    changeSlug(newSlug: string) {
        this.slug = EventSlug.from(newSlug);
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

    getStatus(): (typeof EventStatus)[keyof typeof EventStatus] {
        return this.status;
    }

    getDeletedAt(): Date | null {
        return this.deletedAt;
    }

    getSlug(): string {
        return this.slug.getValue();
    }

    getReservedSeats(): number {
        return this.reservedSeats;
    }

    getVersion(): number {
        return this.version;
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
