import { logger } from "./logger.js";
import { ILogger } from "#application/port/i-logger.js";

export class WorkspaceLoggerAdapter implements ILogger {
    public info(message: string, meta?: any): void {
        // Map your workspace package's method to your local needs
        logger.info({ ...meta }, message);
    }

    public error(message: string, meta?: any): void {
        logger.error({ ...meta }, message);
    }

    public warn(message: string, meta?: any): void {
        logger.warn({ ...meta }, message);
    }

    public debug(message: string, meta?: any): void {
        logger.debug({ ...meta }, message);
    }
}
