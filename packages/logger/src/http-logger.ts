import pinoHttp from "pino-http";
import { createLogger } from "./create-logger.js"; // assuming createLogger is in index or imported here

export function createHttpLoggerMiddleware(serviceName: string) {
    const logger = createLogger(serviceName);

    return pinoHttp({
        logger,
        // Custom serialization if you want to clean up or extend the HTTP metadata
        serializers: {
            req(req) {
                return {
                    method: req.method,
                    url: req.url,
                    // You can add tracking/correlation headers here later
                    requestId: req.headers["x-request-id"],
                };
            },
            res(res) {
                return {
                    statusCode: res.statusCode,
                };
            },
        },
        // Log clean messages for completions
        customSuccessMessage: (req, res, responseTime) => {
            return `${req.method} ${req.url} completed with status ${res.statusCode} in ${responseTime}ms`;
        },
        customErrorMessage: (req, _res, err) => {
            return `${req.method} ${req.url} failed: ${err.message}`;
        },
    });
}
