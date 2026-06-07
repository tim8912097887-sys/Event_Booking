import { DomainEvent } from "./domain-event.js";

export class EventCancelledDomainEvent extends DomainEvent {
    constructor(
        public readonly eventId: string,
        public readonly name: string,
        public readonly slug: string,
    ) {
        super("event.cancelled");
    }
}
