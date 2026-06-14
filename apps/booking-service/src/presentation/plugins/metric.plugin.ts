import { FastifyInstance } from "fastify";
import { bookingMetric } from "../containers/booking.container.js";

export async function metricsPlugin(fastify: FastifyInstance) {
    fastify.addHook("onRequest", async (request) => {
        request.startTime = process.hrtime.bigint();
    });

    fastify.addHook("onResponse", async (request, reply) => {
        const duration =
            Number(process.hrtime.bigint() - request.startTime) / 1_000_000_000;

        const path = request.routeOptions?.url ?? request.url;

        bookingMetric.httpRequestTotal(request.method, path, reply.statusCode);

        bookingMetric.httpRequestDuration(
            request.method,
            path,
            reply.statusCode,
            duration,
        );
    });
}
