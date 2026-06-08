import { FastifyInstance } from "fastify";

import { EventNotFoundError } from "#application/errors/event-not-found.error.js";

import {
    EventAlreadyCancelledError,
    EventNotDraftError,
    EventDeletedModificationError,
    EventAlreadyDeletedError,
    PublishedEventDeletionError,
} from "#domain/errors/entity.error.js";
import { errorResponse } from "../response/error.js";
import { InvalidEventCapacityError } from "#domain/errors/event-capacity.error.js";
import { InvalidEventDateError } from "#domain/errors/event-date.error.js";
import { InvalidEventDescriptionError } from "#domain/errors/event-description.error.js";
import { InvalidEventIdError } from "#domain/errors/event-id.error.js";
import { InvalidEventNameError } from "#domain/errors/event-name.error.js";
import { InvalidEventPriceError } from "#domain/errors/event-price.error.js";
import { InvalidUserIdError } from "#domain/errors/user-id.error.js";

export function registerErrorHandler(fastify: FastifyInstance) {
    fastify.setErrorHandler((error, request, reply) => {
        if ("validation" in (error as any)) {
            return reply
                .status(400)
                .send(errorResponse("ValidationError", (error as any).message));
        }

        if (error instanceof EventNotFoundError) {
            request.log.info(
                {
                    error: error.name,
                    eventId: request.params,
                },
                error.message,
            );
            return reply
                .status(404)
                .send(errorResponse("EventNotFoundError", error.message));
        }

        if (
            error instanceof InvalidUserIdError ||
            error instanceof InvalidEventPriceError ||
            error instanceof InvalidEventNameError ||
            error instanceof InvalidEventIdError ||
            error instanceof InvalidEventDescriptionError ||
            error instanceof InvalidEventDateError ||
            error instanceof InvalidEventCapacityError ||
            error instanceof PublishedEventDeletionError ||
            error instanceof EventAlreadyDeletedError ||
            error instanceof EventAlreadyCancelledError ||
            error instanceof EventNotDraftError ||
            error instanceof EventDeletedModificationError
        ) {
            return reply
                .status(400)
                .send(errorResponse("BadRequestError", error.message));
        }

        request.log.error(
            {
                err: error,
                url: request.url,
                method: request.method,
            },
            "Unhandled exception",
        );

        return reply
            .status(500)
            .send(
                errorResponse(
                    "InternalServerError",
                    "An unexpected error occurred",
                ),
            );
    });
}
