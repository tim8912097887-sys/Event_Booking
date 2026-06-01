import { EmailSender } from "#application/port/email-sender.js";
// import { NotificationRepository } from "#application/port/notification-repository.js";
import { TemplateRenderer } from "#application/port/template-renderer.js";
import { env } from "#infrastructure/config/env.js";

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
        // private readonly repository: NotificationRepository,
        private readonly templateRenderer: TemplateRenderer,
    ) {}

    async execute(event: EventUpdatedEvent) {
        const email = await this.templateRenderer.render(
            "event-updated",
            event,
        );

        await this.emailSender.send({
            to: event.ownerEmail,
            subject: email.subject,
            html: email.html,
            from: env.EMAIL_HOST,
        });
    }
}
