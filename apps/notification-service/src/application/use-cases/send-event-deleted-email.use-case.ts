import { EmailSender } from "#application/port/email-sender.js";
// import { NotificationRepository } from "#application/port/notification-repository.js";
import { TemplateRenderer } from "#application/port/template-renderer.js";
import { env } from "#infrastructure/config/env.js";

export type EventDeletedEvent = {
    eventId: string;
    name: string;
    ownerEmail: string;
};

export class SendEventDeletedEmailUseCase {
    constructor(
        private readonly emailSender: EmailSender,
        // private readonly repository: NotificationRepository,
        private readonly templateRenderer: TemplateRenderer,
    ) {}

    async execute(event: EventDeletedEvent) {
        const email = await this.templateRenderer.render(
            "event-deleted",
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
