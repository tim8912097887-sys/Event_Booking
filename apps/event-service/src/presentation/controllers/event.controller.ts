import { FastifyReply, FastifyRequest } from "fastify";
import { CancelEventUseCase } from "#application/use-cases/cancel-event.use-case.js";
import { DeleteEventUseCase } from "#application/use-cases/delete-event.use-case.js";
import { PublishEventUseCase } from "#application/use-cases/publish-event.use-case.js";
import { CreateEventUseCase } from "#application/use-cases/create-event.use-case.js";
import { ChangeEventPriceUseCase } from "#application/use-cases/change-event-price.use-case.js";
import { ChangeEventCapacityUseCase } from "#application/use-cases/change-event-capacity.use-case.js";
import { ChangeEventDateUseCase } from "#application/use-cases/change-event-date.use-case.js";
import { IEvent } from "#application/port/i-event.js";
import { successResponse } from "../response/success.js";
import { ChangeEventNameUseCase } from "#application/use-cases/change-event-name.use-case.js";
import { ChangeEventDescriptionUseCase } from "#application/use-cases/change-event-description.use-case.js";

export class EventController {
    constructor(
        private readonly cancelEventUseCase: CancelEventUseCase,
        private readonly publishEventUseCase: PublishEventUseCase,
        private readonly deleteEventUseCase: DeleteEventUseCase,
        private readonly createEventUseCase: CreateEventUseCase,
        private readonly changeEventDateUseCase: ChangeEventDateUseCase,
        private readonly changeEventCapacityUseCase: ChangeEventCapacityUseCase,
        private readonly changeEventPriceUseCase: ChangeEventPriceUseCase,
        private readonly changeEventNameUseCase: ChangeEventNameUseCase,
        private readonly changeEventDescriptionUseCase: ChangeEventDescriptionUseCase,
    ) {}

    cancel = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };

        await this.cancelEventUseCase.execute(id);

        return reply.status(204).send();
    };

    publish = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };

        await this.publishEventUseCase.execute(id);

        return reply.status(204).send();
    };

    delete = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };

        await this.deleteEventUseCase.execute(id);

        return reply.status(204).send();
    };

    create = async (request: FastifyRequest, reply: FastifyReply) => {
        const input = request.body as Omit<
            IEvent & { date: string },
            "id" | "status" | "createdAt" | "updatedAt" | "deletedAt"
        >;

        const eventId = await this.createEventUseCase.execute(input);

        return reply.status(201).send(
            successResponse({
                eventId,
            }),
        );
    };

    changeName = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };
        const { name } = request.body as {
            name: string;
        };

        await this.changeEventNameUseCase.execute(id, name);

        return reply.status(204).send();
    };

    changeDescription = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ) => {
        const { id } = request.params as {
            id: string;
        };
        const { description } = request.body as {
            description: string;
        };

        await this.changeEventDescriptionUseCase.execute(id, description);

        return reply.status(204).send();
    };

    changeDate = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };
        const { date } = request.body as {
            date: string;
        };

        await this.changeEventDateUseCase.execute(id, date);

        return reply.status(204).send();
    };

    changeCapacity = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };
        const { capacity } = request.body as {
            capacity: number;
        };

        await this.changeEventCapacityUseCase.execute(id, capacity);

        return reply.status(204).send();
    };

    changePrice = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };
        const { price } = request.body as {
            price: number;
        };

        await this.changeEventPriceUseCase.execute(id, price);

        return reply.status(204).send();
    };
}
