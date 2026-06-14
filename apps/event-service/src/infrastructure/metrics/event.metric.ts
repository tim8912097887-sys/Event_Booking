import { client, register } from "./prometheus.js";

export const httpRequestCounter = new client.Counter({
    name: "event_http_requests_total",
    help: "Total number of HTTP requests made to event-service",
    labelNames: ["method", "path", "status_code"],
    registers: [register],
});

export const httpRequestDuration = new client.Histogram({
    name: "event_http_request_duration_seconds",
    help: "Histogram of HTTP request durations for event-service in seconds",
    labelNames: ["method", "path", "status_code"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const eventOperationsTotal = new client.Counter({
    name: "event_operations_total",
    help: "Total number of event operations",
    labelNames: ["operation", "result"],
    registers: [register],
});

export const outboxMessagesTotal = new client.Counter({
    name: "event_outbox_messages_total",
    help: "Total number of messages published by outbox",
    labelNames: ["event_name", "result"],
    registers: [register],
});

export const outboxPendingMessages = new client.Gauge({
    name: "event_outbox_pending_messages",
    help: "Number of pending messages in outbox",
    registers: [register],
});
