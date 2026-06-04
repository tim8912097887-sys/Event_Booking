import { client, register } from "./prometheus.js";

export const emailsSentCounter = new client.Counter({
    name: "notification_email_sent_total",
    help: "Total emails sent",
    labelNames: ["template"],
    registers: [register],
});

export const emailsFailedCounter = new client.Counter({
    name: "notification_email_failed_total",
    help: "Total email failures",
    labelNames: ["template", "reason"],
    registers: [register],
});

export const eventsConsumedCounter = new client.Counter({
    name: "notification_events_consumed_total",
    help: "Kafka events consumed",
    labelNames: ["topic"],
    registers: [register],
});

export const processingDuration = new client.Histogram({
    name: "notification_processing_duration_seconds",
    help: "Notification processing duration",
    labelNames: ["event"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const emailProcessingDuration = new client.Histogram({
    name: "notification_email_processing_duration_seconds",
    help: "Email processing duration",
    labelNames: ["template"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register],
});

export const eventProcessedCounter = new client.Counter({
    name: "notification_events_processed_total",
    help: "Total events processed",
    labelNames: ["topic"],
    registers: [register],
});

export const eventFailedCounter = new client.Counter({
    name: "notification_events_failed_total",
    help: "Total events failed",
    labelNames: ["topic", "reason"],
    registers: [register],
});
