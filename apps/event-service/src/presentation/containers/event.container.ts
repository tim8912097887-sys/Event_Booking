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
import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { ReleaseSeatUseCase } from "#application/use-cases/release-seat.use-case.js";
import { ReservedSeatUseCase } from "#application/use-cases/reserve-seat.use-case.js";

// Initialize metrics
export const metric = new PrometheusEventMetrics();
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
    metric,
);
subscribeShutdown(async () => publisher.stop());

export const eventCommandController = new EventCommandController(
    new CancelEventUseCase(commandRepository, tracer, metric),
    new PublishEventUseCase(commandRepository, tracer, metric),
    new DeleteEventUseCase(commandRepository, tracer, metric),
    new CreateEventUseCase(commandRepository, tracer, metric),
    new ChangeEventDateUseCase(commandRepository, tracer, metric),
    new ChangeEventCapacityUseCase(commandRepository, tracer, metric),
    new ChangeEventPriceUseCase(commandRepository, tracer, metric),
    new ChangeEventNameUseCase(commandRepository, tracer, metric),
    new ChangeEventDescriptionUseCase(commandRepository, tracer, metric),
    new ReservedSeatUseCase(commandRepository, tracer, metric),
    new ReleaseSeatUseCase(commandRepository, tracer, metric),
);

export const eventQueryController = new EventQueryController(
    new GetEventBySlugQuery(queryRepository, metric),
    new ListEventsQuery(queryRepository, metric),
);
