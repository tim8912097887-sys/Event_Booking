import { responseEnvelope } from "#presentation/utils/response-envelope.js";
import { ERROR_CODE } from "#presentation/types/index.js";
import { RequestHandler } from "express";
import { logger } from "#infrastructure/logging/logger.js";

export const notFoundHandler: RequestHandler = (req, res) => {
    logger.warn(
        {
            context: "NotFoundHandler",
            method: req.method,
            path: req.path,
            ip: req.ip,
        },
        `NotFoundHandler: Ip ${req.ip} enter not found route ${req.method} ${req.url}`,
    );

    res.status(ERROR_CODE.NOT_FOUND).json(
        responseEnvelope({
            state: "error",
            error: {
                code: "NotFoundError",
                detail: "The requested resource was not found.",
            },
        }),
    );
};
