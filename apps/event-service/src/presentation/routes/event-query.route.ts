import { FastifyInstance } from "fastify";
import { EventQueryController } from "../controllers/event-query.controller.js";
import { EventFilterSchema } from "../schemas/event-filter.schema.js";

export class EventQueryRoute {
    constructor(
        private readonly app: FastifyInstance,
        private readonly controller: EventQueryController,
    ) {}

    register() {
        this.app.get(
            "/events",
            {
                schema: {
                    querystring: EventFilterSchema,
                },
            },
            this.controller.getEventsByFilter,
        );
        this.app.get("/events/:slug", this.controller.getEventBySlug);
    }
}
