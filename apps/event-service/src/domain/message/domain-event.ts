import { EventName } from "@event-booking/message-broker";

export abstract class DomainEvent {
    readonly occurredAt = new Date();
    constructor(readonly eventName: EventName) {}
}
