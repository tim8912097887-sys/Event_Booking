export type EventMap = {
    "event.published": {
        eventId: string;
        slug: string;
        name: string;
        ownerEmail: string;
        date: string;
    };
    "event.cancelled": {
        eventId: string;
        name: string;
        slug: string;
    };
};

export type EventName = keyof EventMap;

export type EventPayload<T extends EventName> = EventMap[T];
