import { EventNotFoundError } from "../errors/event-not-found.error.js";
import { EventCommandRepository } from "./event-command.repository.js";

export abstract class EventUseCaseBase {
    constructor(protected readonly repository: EventCommandRepository) {}

    protected async getEventOrFail(id: string) {
        const event = await this.repository.findById(id);
        if (!event) throw new EventNotFoundError(id);
        return event;
    }
}
