import { registerNotFoundHandler } from "#presentation/handlers/not-found.handler.js";
import Fastify from "fastify";
import { registerErrorHandler } from "#presentation/handlers/error.handler.js";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";
import { BookingRoute } from "#presentation/routes/booking.route.js";
import { bookingController } from "#presentation/containers/booking.container.js";
import { metricsPlugin } from "#presentation/plugins/metric.plugin.js";
import { register } from "#infrastructure/metrics/prometheus.js";

export async function initializeApp() {
    const app = Fastify({
        logger: true,
        requestIdHeader: "X-Request-Id",
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // ======================
    // Plugins
    // ======================
    await metricsPlugin(app);

    // ======================
    // Metrics endpoint
    // ======================
    app.get("/metrics", async (_req, res) => {
        res.header("content-type", register.contentType);
        res.send(await register.metrics());
    });

    // ======================
    // Routes
    // ======================
    const bookingRoute = new BookingRoute(app, bookingController);
    bookingRoute.register();

    // ======================
    // Health
    // ======================
    app.get("/health", async () => ({
        status: "ok",
        service: "booking-service",
        timestamp: new Date().toISOString(),
    }));

    // ======================
    // Global handlers
    // ======================
    registerNotFoundHandler(app);
    registerErrorHandler(app);

    return app.withTypeProvider<ZodTypeProvider>();
}
