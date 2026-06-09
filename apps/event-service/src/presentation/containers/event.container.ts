import { db } from "#infrastructure/persistence/postgres-connection.js";
import { messageBroker } from "#infrastructure/messaging/message-broker.js";
import { PostgresEventCommandRepository } from "#infrastructure/persistence/postgres-event-command.repository.js";
import { CancelEventUseCase } from "#application/use-cases/cancel-event.use-case.js";
import { PublishEventUseCase } from "#application/use-cases/publish-event.use-case.js";
import { EventCommandController } from "../controllers/event-command.controller.js";
import { DeleteEventUseCase } from "#application/use-cases/delete-event.use-case.js";
import { CreateEventUseCase } from "#application/use-cases/create-event.use-case.js";
import { ChangeEventDateUseCase } from "#application/use-cases/change-event-date.use-case.js";
import { ChangeEventCapacityUseCase } from "#application/use-cases/change-event-capacity.use-case.js";
import { ChangeEventPriceUseCase } from "#application/use-cases/change-event-price.use-case.js";
import { ChangeEventNameUseCase } from "#application/use-cases/change-event-name.use-case.js";
import { ChangeEventDescriptionUseCase } from "#application/use-cases/change-event-description.use-case.js";
import { EventQueryController } from "../controllers/event-query.controller.js";
import { GetEventBySlugQuery } from "#application/queries/get-event-by-slug.query.js";
import { PostgresEventQueryRepository } from "#infrastructure/persistence/postgres-event-query.repository.js";
import { ListEventsQuery } from "#application/queries/list-events.query.js";
import { OutboxPublisher } from "#infrastructure/outbox/outbox-publisher.js";
import { EventProducer } from "#infrastructure/messaging/event-producer.js";
import { subscribeShutdown } from "#infrastructure/shared/shutdown.js";
import { OpenTelemetryTracer } from "#infrastructure/traces/otel-tracer.js";

// Initialize repositories
const commandRepository = new PostgresEventCommandRepository(db);
const queryRepository = new PostgresEventQueryRepository(db);
// Initialize tracer
const tracer = new OpenTelemetryTracer();
// Initialize producers
const eventProducer = new EventProducer(messageBroker);
await eventProducer.start();
subscribeShutdown(async () => eventProducer.stop());
export const publisher = new OutboxPublisher(
    db,
    eventProducer.getProducer(),
    tracer,
);
subscribeShutdown(async () => publisher.stop());

export const eventCommandController = new EventCommandController(
    new CancelEventUseCase(commandRepository, tracer),
    new PublishEventUseCase(commandRepository, tracer),
    new DeleteEventUseCase(commandRepository, tracer),
    new CreateEventUseCase(commandRepository, tracer),
    new ChangeEventDateUseCase(commandRepository, tracer),
    new ChangeEventCapacityUseCase(commandRepository, tracer),
    new ChangeEventPriceUseCase(commandRepository, tracer),
    new ChangeEventNameUseCase(commandRepository, tracer),
    new ChangeEventDescriptionUseCase(commandRepository, tracer),
);

export const eventQueryController = new EventQueryController(
    new GetEventBySlugQuery(queryRepository),
    new ListEventsQuery(queryRepository),
);
