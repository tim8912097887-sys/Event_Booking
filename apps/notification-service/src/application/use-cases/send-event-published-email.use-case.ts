import { EmailSender } from "#application/port/email-sender.js";
import { NotificationRepository } from "#application/port/notification-repository.js";
import { TemplateRenderer } from "#application/port/template-renderer.js";
import { env } from "#infrastructure/config/env.js";
import { Notification } from "#domain/entities/notification.entity.js";
import { RecipientEmail } from "#domain/value-objects/recipient-email.vo.js";
import { randomUUID } from "crypto";
import { NotificationTarget } from "#domain/value-objects/notification-target.vo.js";
import { ILogger } from "#application/port/i-logger.js";
import { NotificationMetrics } from "#application/port/notification-metrics.js";
import { EventMap } from "@event-booking/message-broker";

export class SendEventPublishedEmailUseCase {
    constructor(
        private readonly emailSender: EmailSender,
        private readonly repository: NotificationRepository,
        private readonly templateRenderer: TemplateRenderer,
        private readonly logger: ILogger,
        private readonly metrics: NotificationMetrics,
    ) {}

    async execute(event: EventMap["event.published"]) {
        // Check idempotency to prevent duplicate email sending
        const idempotencyKey = `event-published:${event.eventId}`;
        const existingNotification =
            await this.repository.findByIdempotencyKey(idempotencyKey);
        if (existingNotification) {
            this.logger.info(
                {
                    eventId: event.eventId,
                    idempotencyKey,
                    notificationId: existingNotification.id,
                },
                "notification.duplicate.skipped",
            );

            return;
        }

        const email = await this.templateRenderer.render(
            "event-published",
            event,
        );

        const notificationId = randomUUID();
        const target = "SYSTEM_EVENT";
        const notification = Notification.create(notificationId, {
            target: new NotificationTarget(target, event.eventId),
            payload: event,
            templateId: "event-published",
            recipientEmail: RecipientEmail.create(event.ownerEmail),
            idempotencyKey,
        });

        // Save record prevent loss
        await this.repository.save(notification);

        this.logger.info(
            {
                notificationId,
                eventId: event.eventId,
                templateId: notification.getProps().templateId,
            },
            "notification.published",
        );

        // email sending process
        const endEmailProcessing = this.metrics.emailProcessingStarted(
            notification.getProps().templateId,
        );
        try {
            await this.emailSender.send({
                to: event.ownerEmail,
                subject: email.subject,
                html: email.html,
                from: env.EMAIL_HOST,
            });

            // Send metrics
            this.metrics.emailSent(notification.getProps().templateId);

            this.logger.info(
                {
                    notificationId,
                    templateId: notification.getProps().templateId,
                    recipientEmail: event.ownerEmail,
                    eventId: event.eventId,
                    targetType: "SYSTEM_EVENT",
                },
                "notification.email.sent",
            );
            notification.markAsSent();
        } catch (error: any) {
            notification.markAsFailed(error.message);
            // Send failed metrics
            this.metrics.emailFailed(
                notification.getProps().templateId,
                error.message,
            );

            this.logger.error(
                {
                    notificationId,
                    templateId: notification.getProps().templateId,
                    recipientEmail: event.ownerEmail,
                    eventId: event.eventId,
                    targetType: "SYSTEM_EVENT",
                    errorMessage: error.message,
                    errorName: error.name,
                },
                "notification.email.failed",
            );
            throw error;
        } finally {
            endEmailProcessing();
            await this.repository.save(notification);
        }
    }
}
