import { createLogger } from "@event-booking/logger";

export const logger = createLogger("notification-service");

logger.info({
    event: "logger_initialized",
    service: "notification-service",
});
