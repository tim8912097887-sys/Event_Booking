import { IdNotEmptyError } from "#domain/errors/id-not-empty-error.js";

export type ReferenceType = "TICKET" | "SYSTEM_EVENT";

export class NotificationTarget {
    constructor(
        public readonly type: ReferenceType,
        public readonly id: string,
    ) {
        if (!id) throw new IdNotEmptyError("Target");
    }
}
