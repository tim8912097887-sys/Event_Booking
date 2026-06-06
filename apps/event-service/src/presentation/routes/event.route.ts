import { FastifyInstance } from "fastify";
import { EventController } from "../controllers/event.controller.js";
import { CreateEventSchema } from "../schemas/create-event.schema.js";
import { ChangePriceSchema } from "../schemas/change-price.schema.js";
import { EventIdSchema } from "../schemas/event-id.schema.js";
import { ChangeCapacitySchema } from "../schemas/change-capacity.schema.js";
import { ChangeDateSchema } from "../schemas/change-date.schema.js";
import { ChangeNameSchema } from "../schemas/change-name.schema.js";
import { ChangeDescriptionSchema } from "../schemas/change-description.schema.js";

export class EventRoute {
    constructor(
        private readonly controller: EventController,
        private readonly app: FastifyInstance,
    ) {}

    register() {
        this.app.post(
            "/events",
            {
                schema: {
                    body: CreateEventSchema,
                },
            },
            this.controller.create,
        );
        this.app.patch(
            "/events/:id/name",
            {
                schema: {
                    body: ChangeNameSchema,
                    params: EventIdSchema,
                },
            },
            this.controller.changeName,
        );
        this.app.patch(
            "/events/:id/description",
            {
                schema: {
                    body: ChangeDescriptionSchema,
                    params: EventIdSchema,
                },
            },
            this.controller.changeDescription,
        );
        this.app.patch(
            "/events/:id/price",
            {
                schema: {
                    body: ChangePriceSchema,
                    params: EventIdSchema,
                },
            },
            this.controller.changePrice,
        );
        this.app.patch(
            "/events/:id/capacity",
            {
                schema: {
                    body: ChangeCapacitySchema,
                    params: EventIdSchema,
                },
            },
            this.controller.changeCapacity,
        );
        this.app.patch(
            "/events/:id/date",
            {
                schema: {
                    body: ChangeDateSchema,
                    params: EventIdSchema,
                },
            },
            this.controller.changeDate,
        );
        this.app.post(
            "/events/:id/publish",
            {
                schema: {
                    params: EventIdSchema,
                },
            },
            this.controller.publish,
        );
        this.app.post(
            "/events/:id/cancel",
            {
                schema: {
                    params: EventIdSchema,
                },
            },
            this.controller.cancel,
        );
        this.app.delete(
            "/events/:id",
            {
                schema: {
                    params: EventIdSchema,
                },
            },
            this.controller.delete,
        );
    }
}
