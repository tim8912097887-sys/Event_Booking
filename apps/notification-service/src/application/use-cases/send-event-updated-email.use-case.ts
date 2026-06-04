import { EmailSender } from "#application/port/email-sender.js";
import { ILogger } from "#application/port/i-logger.js";
import { NotificationMetrics } from "#application/port/notification-metrics.js";
import { NotificationRepository } from "#application/port/notification-repository.js";
import { TemplateRenderer } from "#application/port/template-renderer.js";
import { Notification } from "#domain/entities/notification.entity.js";
import { NotificationTarget } from "#domain/value-objects/notification-target.vo.js";
import { RecipientEmail } from "#domain/value-objects/recipient-email.vo.js";
import { env } from "#infrastructure/config/env.js";
import { randomUUID } from "crypto";

export type EventUpdatedEvent = {
    eventId: string;
    ownerEmail: string;

    changes: {
        name?: {
            old: string;
            new: string;
        };

        date?: {
            old: string;
            new: string;
        };

        price?: {
            old: number;
            new: number;
        };

        totalPeople?: {
            old: number;
            new: number;
        };
    };
};

export class SendEventUpdatedEmailUseCase {
    constructor(
        private readonly emailSender: EmailSender,
        private readonly repository: NotificationRepository,
        private readonly templateRenderer: TemplateRenderer,
        private readonly logger: ILogger,
        private readonly metrics: NotificationMetrics,
    ) {}

    async execute(event: EventUpdatedEvent) {
        // Check idempotency to prevent duplicate email sending
        const idempotencyKey = `event-updated:${event.eventId}`;
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
            "event-updated",
            event,
        );

        const notificationId = randomUUID();
        const target = "SYSTEM_EVENT";
        const notification = Notification.create(notificationId, {
            target: new NotificationTarget(target, event.eventId),
            payload: event,
            templateId: "event-updated",
            recipientEmail: RecipientEmail.create(event.ownerEmail),
            idempotencyKey,
        });

        this.logger.info(
            {
                notificationId,
                eventId: event.eventId,
                templateId: notification.getProps().templateId,
            },
            "notification.created",
        );

        // Save record prevent loss
        await this.repository.save(notification);

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
