export interface NotificationMetrics {
    emailSent(templateId: string): void;

    emailFailed(templateId: string, reason: string): void;

    processingStarted(eventType: string): () => void;

    eventConsumed(topic: string): void;

    emailProcessingStarted(templateId: string): () => void;

    eventProcessed(topic: string): void;

    eventFailed(topic: string, reason: string): void;
}
