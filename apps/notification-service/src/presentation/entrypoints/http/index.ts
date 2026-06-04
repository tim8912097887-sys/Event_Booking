import { stopTelemetry } from "#infrastructure/traces/telemetry.js";
import { Server } from "http";
import { initializeApp } from "./server.js";
import { env } from "#infrastructure/config/env.js";
import { logger } from "#infrastructure/logging/logger.js";
import {
    shutdown,
    subscribeShutdown,
} from "#infrastructure/shared/shutdown.js";
import { dbConnection } from "#infrastructure/persistence/mongoose-connection.js";
import { SendEventCreatedEmailUseCase } from "#application/use-cases/send-event-created-email.use-case.js";
import { SendEventUpdatedEmailUseCase } from "#application/use-cases/send-event-updated-email.use-case.js";
import { SendEventDeletedEmailUseCase } from "#application/use-cases/send-event-deleted-email.use-case.js";
import { SmtpEmailSender } from "#infrastructure/email/smtp-email-sender.js";
import {
    getTransporter,
    initializeEmailTransporter,
} from "#infrastructure/email/smtp-transporter.js";
import { Transporter } from "nodemailer";
import { HandlebarsTemplateRenderer } from "#infrastructure/email/handlebars-template-renderer.js";
import { NotificationConsumer } from "#infrastructure/messaging/notification-consumer.js";
import {
    brokerDisconnect,
    messageBroker,
} from "#infrastructure/messaging/message-broker.js";
import { MongooseNotificationRepository } from "#infrastructure/persistence/mongoose-notification.repository.js";
import { PrometheusNotificationMetrics } from "#infrastructure/metrics/prometheus-notification-metrics.js";
import { OpenTelemetryTracer } from "#infrastructure/traces/otel-tracer.js";

class AppServer {
    private static instance: AppServer;
    private server?: Server;
    private isShutdown = false;
    private timeout = 10000;

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
            // Initialize DB and subscribe its teardown immediately
            await dbConnection();

            // Initialize email transporter

            await initializeEmailTransporter();
            const transporter = getTransporter() as Transporter;

            const tracer = new OpenTelemetryTracer();
            subscribeShutdown(stopTelemetry);

            const emailSender = new SmtpEmailSender(
                transporter,
                logger,
                tracer,
            );
            // Initialize use cases
            const templateRenderer = new HandlebarsTemplateRenderer();

            const notificationRepository = new MongooseNotificationRepository(
                tracer,
            );

            const notificationMetrics = new PrometheusNotificationMetrics();
            const sendEventCreatedEmailUseCase =
                new SendEventCreatedEmailUseCase(
                    emailSender,
                    notificationRepository,
                    templateRenderer,
                    logger,
                    notificationMetrics,
                );

            const sendEventUpdatedEmailUseCase =
                new SendEventUpdatedEmailUseCase(
                    emailSender,
                    notificationRepository,
                    templateRenderer,
                    logger,
                    notificationMetrics,
                );

            const sendEventDeletedEmailUseCase =
                new SendEventDeletedEmailUseCase(
                    emailSender,
                    notificationRepository,
                    templateRenderer,
                    logger,
                    notificationMetrics,
                );
            // Initialize message broker
            const consumer = new NotificationConsumer(
                messageBroker,
                sendEventCreatedEmailUseCase,
                sendEventUpdatedEmailUseCase,
                sendEventDeletedEmailUseCase,
                logger,
                notificationMetrics,
                tracer,
            );
            // Subscribe message broker
            await consumer.start();
            // Subscribe broker shutdown
            subscribeShutdown(brokerDisconnect);
            // Initialize App and HTTP server
            const app = initializeApp();
            this.server = app.listen(env.PORT, () => {
                logger.info(
                    { port: env.PORT, context: "ServerInitialization" },
                    `Server started on port ${env.PORT}`,
                );
            });

            // Using arrow function fixes the `this` context loss bug
            subscribeShutdown(() => this.disConnectServer());

            logger.info(
                { context: "ServerInitialization" },
                `Successfully registered shutdown handlers`,
            );
        } catch (error: any) {
            logger.error(
                { err: error, context: "ServerInitialization" },
                `Server failed to start.`,
            );
            process.exit(1);
        }
    }

    private setupProcessHandlers(): void {
        // Graceful exits for process signals
        ["SIGINT", "SIGTERM"].forEach((signal) => {
            process.on(signal, () => this.gracefulShutdown(signal));
        });

        // Hard/Severe runtime errors handled via the same controlled shutdown
        ["uncaughtException", "unhandledRejection"].forEach((event) => {
            process.on(event, (reason: any) => {
                const errorInstance =
                    reason instanceof Error
                        ? reason
                        : new Error(String(reason));

                logger.fatal(
                    { err: errorInstance, event, context: "ProcessCrash" },
                    `Critical crash intercepted via ${event}. Initiating emergency shutdown.`,
                );

                // Elevate directly to graceful shutdown to attempt cleaning up DB & Server connections
                this.gracefulShutdown(event);
            });
        });
    }

    private async gracefulShutdown(signal: string): Promise<void> {
        if (this.isShutdown) return;
        this.isShutdown = true;

        logger.info(
            { signal, context: "GracefulShutdown" },
            `${signal} received. Starting graceful shutdown sequence...`,
        );

        // Force fallback timeout to prevent hanging processes
        const forceExit = setTimeout(() => {
            logger.error(
                {
                    signal,
                    timeoutMs: this.timeout,
                    context: "GracefulShutdown",
                },
                "Shutdown timed out! Forcing application exit immediately.",
            );
            process.exit(1);
        }, this.timeout);

        try {
            // Runs server disconnect first, then database disconnect second.
            await shutdown();

            logger.info(
                { signal, context: "GracefulShutdown" },
                "Shutdown completely clean. Goodbye!",
            );

            clearTimeout(forceExit);
            process.exit(0);
        } catch (err: any) {
            logger.error(
                { err, signal, context: "GracefulShutdown" },
                "Error occurred during shutdown sequence.",
            );
            process.exit(1);
        }
    }

    private async disConnectServer(): Promise<void> {
        if (!this.server) return;

        logger.info(
            { context: "WebserverTeardown" },
            "Closing HTTP server (Draining active requests)...",
        );

        await new Promise<void>((resolve, reject) => {
            this.server!.close((err) => (err ? reject(err) : resolve()));
        });

        logger.info(
            { context: "WebserverTeardown" },
            "HTTP server fully closed.",
        );
    }
}

const server = AppServer.getInstance();
await server.start();
