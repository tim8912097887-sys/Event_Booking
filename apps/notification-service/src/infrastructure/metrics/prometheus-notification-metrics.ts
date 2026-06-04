import {
    processingDuration,
    emailsSentCounter,
    emailsFailedCounter,
    eventsConsumedCounter,
    emailProcessingDuration,
    eventProcessedCounter,
    eventFailedCounter,
} from "#infrastructure/metrics/notification.metrics.js";
import { NotificationMetrics } from "#application/port/notification-metrics.js";

export class PrometheusNotificationMetrics implements NotificationMetrics {
    emailSent(templateId: string): void {
        emailsSentCounter.inc({
            template: templateId,
        });
    }

    emailFailed(templateId: string, reason: string): void {
        emailsFailedCounter.inc({
            template: templateId,
            reason,
        });
    }

    processingStarted(eventType: string): () => void {
        return processingDuration.startTimer({
            event: eventType,
        });
    }

    eventConsumed(topic: string): void {
        eventsConsumedCounter.inc({
            topic,
        });
    }

    emailProcessingStarted(templateId: string): () => void {
        return emailProcessingDuration.startTimer({
            template: templateId,
        });
    }

    eventProcessed(topic: string): void {
        eventProcessedCounter.inc({
            topic,
        });
    }

    eventFailed(topic: string, reason: string): void {
        eventFailedCounter.inc({
            topic,
            reason,
        });
    }
}
