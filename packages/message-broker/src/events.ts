export type EventMap = {
    "event.created": {
        eventId: string;
        name: string;
        ownerEmail: string;
        date: string;
        price: number;
        totalPeople: number;
    };

    "event.updated": {
        eventId: string;
        ownerEmail: string;

        changes: {
            name?: {
                old: string;
                new: string;
            };

            date?: {
                old: string;
                new: string;
            };

            price?: {
                old: number;
                new: number;
            };

            totalPeople?: {
                old: number;
                new: number;
            };
        };
    };

    "event.deleted": {
        eventId: string;
        name: string;
        ownerEmail: string;
    };
};

export type EventName = keyof EventMap;

export type EventPayload<T extends EventName> = EventMap[T];
