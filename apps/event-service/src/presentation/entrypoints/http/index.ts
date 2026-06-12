import { stopTelemetry } from "#infrastructure/traces/telemetry.js";
import type { FastifyInstance } from "fastify";

import { initializeApp } from "./server.js";
import { env } from "#infrastructure/config/env.js";
import { logger } from "#infrastructure/logging/logger.js";
import { publisher } from "#presentation/containers/event.container.js";
import {
    shutdown,
    subscribeShutdown,
} from "#infrastructure/shared/shutdown.js";
import { dbServer } from "#infrastructure/persistence/postgres-connection.js";

class AppServer {
    private static instance: AppServer;

    private app?: FastifyInstance;

    private isShutdown = false;

    private readonly shutdownTimeout = 10000;

    private constructor() {
        this.setupProcessHandlers();
    }

    public static getInstance(): AppServer {
        if (!AppServer.instance) {
            AppServer.instance = new AppServer();
        }

        return AppServer.instance;
    }

    public async start(): Promise<void> {
        try {
            // Db connection
            await dbServer.testConnection();
            subscribeShutdown(async () => await dbServer.dbDisconnection());

            this.app = await initializeApp();
            await this.app.listen({
                port: env.PORT,
                host: "0.0.0.0",
            });

            logger.info({
                event: "server_started",
                service: "event-service",
                port: env.PORT,
            });

            this.setupProcessHandlers();
            // Subscribe publisher and telemetry to shutdown
            subscribeShutdown(async () => await publisher.stop());
            subscribeShutdown(async () => await stopTelemetry());
            // Check for pending events constantly
            await publisher.start();
        } catch (error) {
            logger.error({
                event: "server_start_failed",
                service: "event-service",
                err: error,
            });

            process.exit(1);
        }
    }

    private setupProcessHandlers(): void {
        process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));

        process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));

        process.on("uncaughtException", (error) =>
            this.gracefulShutdown("uncaughtException", error, 1),
        );

        process.on("unhandledRejection", (reason) =>
            this.gracefulShutdown("unhandledRejection", reason, 1),
        );
    }

    private async gracefulShutdown(
        signal: string,
        reason?: unknown,
        code = 0,
    ): Promise<void> {
        if (this.isShutdown) {
            return;
        }

        this.isShutdown = true;

        logger.info({
            event: "shutdown_initiated",
            service: "event-service",
            signal,
        });

        if (reason) {
            logger.error({
                event: "shutdown_reason",
                service: "event-service",
                reason,
            });
        }

        const forceExit = setTimeout(() => {
            logger.error({
                event: "shutdown_timeout_exceeded",
                service: "event-service",
                timeoutMs: this.shutdownTimeout,
            });

            process.exit(1);
        }, this.shutdownTimeout);

        try {
            if (this.app) {
                await this.app.close();
            }

            await shutdown();
            clearTimeout(forceExit);

            logger.info({
                event: "shutdown_completed",
                service: "event-service",
            });

            process.exit(code);
        } catch (error) {
            logger.error({
                event: "shutdown_failed",
                service: "event-service",
                err: error,
            });

            process.exit(1);
        }
    }
}

const server = AppServer.getInstance();

await server.start();
