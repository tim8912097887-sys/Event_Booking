export interface ILogger {
    info(meta: any, message: string): void;
    warn(meta: any, message: string): void;
    error(meta: any, message: string): void;
    debug(meta: any, message: string): void;
}
