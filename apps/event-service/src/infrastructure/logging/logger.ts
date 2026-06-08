import { createLogger } from "@event-booking/logger";

export const logger = createLogger("event-service");

logger.info({
    event: "logger_initialized",
    service: "event-service",
});
