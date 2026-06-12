import { FastifyInstance } from "fastify";

import { errorResponse } from "../response/error.js";
import { InvalidEventIdError } from "#domain/errors/event-id.error.js";
import { InvalidUserIdError } from "#domain/errors/user-id.error.js";
import { BookingNotFoundError } from "#application/errors/booking-not-found.js";
import { InvalidBookingIdError } from "#domain/errors/booking-id.error.js";
import { InvalidTransactionError } from "#domain/errors/booking.error.js";
import { SeatUnavailableError } from "#application/errors/seat-unavailable.error.js";
import { SeatConflictError } from "#application/errors/seat-conflict.error.js";
import { EventNotFoundError } from "#application/errors/event-not-found.error.js";

export function registerErrorHandler(fastify: FastifyInstance) {
    fastify.setErrorHandler((error, request, reply) => {
        if ("validation" in (error as any)) {
            return reply
                .status(400)
                .send(errorResponse("ValidationError", (error as any).message));
        }

        if (error instanceof BookingNotFoundError) {
            request.log.info(
                {
                    error: error.name,
                    eventId: request.params,
                },
                error.message,
            );
            return reply
                .status(404)
                .send(errorResponse("BookingNotFoundError", error.message));
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
            error instanceof InvalidEventIdError ||
            error instanceof InvalidBookingIdError ||
            error instanceof InvalidTransactionError ||
            error instanceof SeatUnavailableError ||
            error instanceof SeatConflictError
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
