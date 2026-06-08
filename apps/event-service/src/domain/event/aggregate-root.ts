import { DomainEvent } from "../message/domain-event.js";

export abstract class AggregateRoot {
    private domainEvents: DomainEvent[] = [];

    protected addDomainEvent(event: DomainEvent) {
        this.domainEvents.push(event);
    }

    getDomainEvents(): readonly DomainEvent[] {
        return this.domainEvents;
    }

    clearDomainEvents() {
        this.domainEvents = [];
    }

    hasDomainEvents(): boolean {
        return this.domainEvents.length > 0;
    }
}
