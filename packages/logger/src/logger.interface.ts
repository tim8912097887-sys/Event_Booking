import type { Logger as PinoLogger } from "pino";

// Define the exact logging interface your applications will use
export interface ILogger extends PinoLogger {}
