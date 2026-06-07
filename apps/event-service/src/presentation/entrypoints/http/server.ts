import { registerNotFoundHandler } from "#presentation/handlers/not-found.handler.js";
import Fastify from "fastify";
import { registerErrorHandler } from "#presentation/handlers/error.handler.js";
import { EventCommandRoute } from "#presentation/routes/event-command.route.js";
import {
    eventCommandController,
    eventQueryController,
} from "#presentation/containers/event.container.js";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";
import { EventQueryRoute } from "#presentation/routes/event-query.route.js";

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
    const eventCommandRoute = new EventCommandRoute(
        eventCommandController,
        app,
    );
    const eventQueryRoute = new EventQueryRoute(app, eventQueryController);

    eventQueryRoute.register();
    eventCommandRoute.register();

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
