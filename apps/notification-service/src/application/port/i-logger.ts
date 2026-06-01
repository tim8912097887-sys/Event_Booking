// src/context/notifications/application/ports/ILogger.ts
export interface ILogger {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, meta?: any): void;
}
