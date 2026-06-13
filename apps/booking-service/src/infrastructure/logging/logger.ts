import { createLogger } from "@event-booking/logger";

export const logger = createLogger("booking-service");

logger.info({
    event: "logger_initialized",
    service: "booking-service",
});
