import { GetEventBySlugQuery } from "#application/queries/get-event-by-slug.query.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../response/success.js";
import { ListEventsQuery } from "#application/queries/list-events.query.js";
import { EventsQueryFilter } from "#application/port/event-query.repository.js";

export class EventQueryController {
    constructor(
        private readonly slugQuery: GetEventBySlugQuery,
        private readonly filterQuery: ListEventsQuery,
    ) {}

    getEventBySlug = async (request: FastifyRequest, reply: FastifyReply) => {
        const { slug } = request.params as { slug: string };
        const event = await this.slugQuery.execute(slug);
        return reply.status(200).send(
            successResponse({
                event,
            }),
        );
    };

    getEventsByFilter = async (
        request: FastifyRequest,
        reply: FastifyReply,
    ) => {
        const filter = request.query as EventsQueryFilter;
        const events = await this.filterQuery.execute(filter);
        return reply.status(200).send(
            successResponse({
                events,
            }),
        );
    };
}
