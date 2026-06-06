import { db } from "#infrastructure/persistence/postgres-connection.js";
import { PostgresEventRepository } from "#infrastructure/persistence/postgres-event.repository.js";
import { CancelEventUseCase } from "#application/use-cases/cancel-event.use-case.js";
import { PublishEventUseCase } from "#application/use-cases/publish-event.use-case.js";
import { EventController } from "../controllers/event.controller.js";
import { DeleteEventUseCase } from "#application/use-cases/delete-event.use-case.js";
import { CreateEventUseCase } from "#application/use-cases/create-event.use-case.js";
import { ChangeEventDateUseCase } from "#application/use-cases/change-event-date.use-case.js";
import { ChangeEventCapacityUseCase } from "#application/use-cases/change-event-capacity.use-case.js";
import { ChangeEventPriceUseCase } from "#application/use-cases/change-event-price.use-case.js";
import { ChangeEventNameUseCase } from "#application/use-cases/change-event-name.use-case.js";
import { ChangeEventDescriptionUseCase } from "#application/use-cases/change-event-description.use-case.js";

const repository = new PostgresEventRepository(db);

export const eventController = new EventController(
    new CancelEventUseCase(repository),
    new PublishEventUseCase(repository),
    new DeleteEventUseCase(repository),
    new CreateEventUseCase(repository),
    new ChangeEventDateUseCase(repository),
    new ChangeEventCapacityUseCase(repository),
    new ChangeEventPriceUseCase(repository),
    new ChangeEventNameUseCase(repository),
    new ChangeEventDescriptionUseCase(repository),
);
