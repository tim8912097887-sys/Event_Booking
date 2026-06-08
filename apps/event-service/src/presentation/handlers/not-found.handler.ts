import { FastifyInstance } from "fastify";
import { errorResponse } from "../response/error.js";

export function registerNotFoundHandler(fastify: FastifyInstance) {
    fastify.setNotFoundHandler((request, reply) => {
        request.log.error(
            {
                method: request.method,
                url: request.url,
            },
            "Route not found",
        );
        return reply.status(404).send(errorResponse("NOT_FOUND", "Not Found"));
    });
}
