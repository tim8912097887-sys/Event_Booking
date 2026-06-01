import express from "express";
import { errorHandler } from "#presentation/middlewares/error-handler.js";
import { notFoundHandler } from "#presentation/middlewares/not-found-handler.js";

export const initializeApp = () => {
    const app = express();

    // Healthy check endpoint
    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "OK",
            service: "notification-service",
            timestamp: new Date().toISOString(),
        });
    });

    // Error Handler
    app.use(errorHandler);
    app.use(notFoundHandler);
    return app;
};
