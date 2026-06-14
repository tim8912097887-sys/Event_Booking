import { client, register } from "./prometheus.js";

export const httpRequestCounter = new client.Counter({
    name: "booking_http_requests_total",
    help: "Total number of HTTP requests made to booking-service",
    labelNames: ["method", "path", "status_code"],
    registers: [register],
});

export const httpRequestDuration = new client.Histogram({
    name: "booking_http_request_duration_seconds",
    help: "Histogram of HTTP request durations in seconds",
    labelNames: ["method", "path", "status_code"],
    registers: [register],
});

export const bookingOperationsTotal = new client.Counter({
    name: "booking_operations_total",
    help: "Total number of booking operations",
    labelNames: ["operation", "result"],
    registers: [register],
});

export const eventServiceRequestTotal = new client.Counter({
    name: "booking_event_service_requests_total",
    help: "Total number of requests made to event-service",
    labelNames: ["operation", "result"],
    registers: [register],
});

export const eventServiceRetriesTotal = new client.Counter({
    name: "booking_event_service_retries_total",
    help: "Total number of retries made to event-service",
    labelNames: ["operation", "result"],
    registers: [register],
});

export const bookingFailuresTotal = new client.Counter({
    name: "booking_failures_total",
    help: "Total number of booking failures",
    labelNames: ["error_type"],
    registers: [register],
});

export const bookingDbErrorsTotal = new client.Counter({
    name: "booking_db_errors_total",
    help: "Total number of database errors",
    labelNames: ["operation"],
    registers: [register],
});

export const bookingCompensationFailuresTotal = new client.Counter({
    name: "booking_compensation_failures_total",
    help: "Total number of booking compensation failures",
    registers: [register],
});
