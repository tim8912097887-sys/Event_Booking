import { TOPICS } from "@event-booking/message-broker";
import { DomainEvent } from "./domain-event.js";

export class EventPublishedDomainEvent extends DomainEvent {
    constructor(
        public readonly eventId: string,
        public readonly slug: string,
        public readonly name: string,
        public readonly date: string,
        public readonly ownerEmail: string,
    ) {
        super(TOPICS.EVENT_PUBLISHED);
    }
}
