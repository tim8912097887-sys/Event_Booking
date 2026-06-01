import mongoose from "mongoose";
import { logger } from "#infrastructure/logging/logger.js";
// import { subscribeShutdown } from "#utils/shutdown.js";
import { env } from "#infrastructure/config/env.js";
import { subscribeShutdown } from "#infrastructure/shared/shutdown.js";

export const dbConnection = async () => {
    let mongoConnection: mongoose.Mongoose;

    // Centralized Event Listeners with structured payloads
    mongoose.connection.on("error", (error) => {
        logger.error(
            { event: "database_error", error: error.message },
            "Database connection encountered an error",
        );
    });

    mongoose.connection.on("connected", () => {
        logger.info(
            { event: "database_status", status: "connected" },
            "Database connection established successfully",
        );
    });

    mongoose.connection.on("disconnecting", () => {
        logger.warn(
            { event: "database_status", status: "disconnecting" },
            "Database connection is disconnecting",
        );
    });

    mongoose.connection.on("reconnected", () => {
        logger.info(
            { event: "database_status", status: "reconnected" },
            "Database connection successfully recovered and reconnected",
        );
    });

    const start = Date.now();
    try {
        mongoConnection = await mongoose.connect(env.MONGO_URI, {
            connectTimeoutMS: 5000,
            maxPoolSize: 20,
            minPoolSize: 5,
            family: 4,
            serverSelectionTimeoutMS: 10000,
            maxIdleTimeMS: 60000,
            socketTimeoutMS: 45000,
            autoIndex: env.NODE_ENV === "development",
            heartbeatFrequencyMS: 5000,
        });

        // Subscribe to shutdown lists
        // subscribeShutdown(dbDisconnection);

        const duration = Date.now() - start;

        // Clear performance profiling logs
        logger.info(
            {
                event: "database_connection_success",
                duration_ms: duration,
                pool_config: { min: 5, max: 20 },
            },
            `Database initialized and ready after ${duration}ms`,
        );

        subscribeShutdown(dbDisconnection);
        logger.info(
            { event: "database_shutdown_registered" },
            "Graceful shutdown hook registered for database connection",
        );
    } catch (error: any) {
        const duration = Date.now() - start;

        // Robust Error Logging
        logger.error(
            {
                event: "database_connection_failure",
                duration_ms: duration,
                error: {
                    message: error.message,
                    stack:
                        env.NODE_ENV !== "production" ? error.stack : undefined,
                },
            },
            `Database connection failed to establish after ${duration}ms`,
        );
        throw error;
    }

    return mongoConnection;
};

const dbDisconnection = async () => {
    try {
        await mongoose.connection.close();
        logger.info(
            { event: "database_shutdown_success" },
            "Database connection pool closed gracefully via shutdown hook",
        );
    } catch (error: any) {
        logger.error(
            { event: "database_shutdown_error", error: error.message },
            "Error closing database connection pool during shutdown",
        );
    }
};
