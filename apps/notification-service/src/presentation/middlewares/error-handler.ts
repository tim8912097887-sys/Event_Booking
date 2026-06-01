import { ErrorRequestHandler } from "express";
import { responseEnvelope } from "#presentation/utils/response-envelope.js";
import { logger } from "#infrastructure/logging/logger.js";
import { errorMapper } from "#presentation/utils/error-mapper.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    // Variables for data envelope
    let statusCode = 500;
    let statusType = "ServerError";
    let detail = "An unexpected error occurred. Please try again later.";

    const errorInfo = errorMapper(err);

    if (errorInfo) {
        statusCode = errorInfo.statusCode;
        statusType = errorInfo.statusType;
        detail = errorInfo.detail;
    }

    // Log useful context
    const logContext = {
        method: req.method,
        path: req.path,
        type: statusType,
        ip: req.ip,
        stack: statusCode === 500 ? err.stack : undefined, // Only log stacks for 500s
    };

    if (statusCode >= 500) {
        logger.error(logContext, `[CRITICAL] ${err.message}`);
    } else {
        logger.warn(logContext, `[CLIENT_ERROR] ${detail}`);
    }

    // Uniform Response Structure
    return res.status(statusCode).json(
        responseEnvelope({
            state: "error",
            error: {
                code: statusType,
                detail,
            },
        }),
    );
};
