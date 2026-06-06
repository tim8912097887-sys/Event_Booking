import { registerNotFoundHandler } from "#presentation/handlers/not-found.handler.js";
import Fastify from "fastify";
import { registerErrorHandler } from "#presentation/handlers/error.handler.js";
import { EventRoute } from "#presentation/routes/event.route.js";
import { eventController } from "#presentation/containers/event.container.js";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";

export async function initializeApp() {
    const app = Fastify({
        logger: true,
        requestIdHeader: "X-Request-Id",
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // ======================
    // Routes
    // ======================
    const eventRoute = new EventRoute(eventController, app);
    eventRoute.register();

    // ======================
    // Global handlers
    // ======================
    registerNotFoundHandler(app);
    registerErrorHandler(app);

    // ======================
    // Health
    // ======================
    app.get("/health", async () => ({
        status: "ok",
        service: "event-service",
        timestamp: new Date().toISOString(),
    }));

    return app.withTypeProvider<ZodTypeProvider>();
}
