import {
    EmailSender,
    SendEmailOptions,
} from "#application/port/email-sender.js";
import { Transporter } from "nodemailer";

import {
    EmailSendFailedError,
    EmailTransportNotInitializedError,
} from "#domain/errors/index.js";
import { ILogger } from "#application/port/i-logger.js";
import { Tracer } from "#application/port/notification-trace.js";

export class SmtpEmailSender implements EmailSender {
    constructor(
        private readonly transporter: Transporter,
        private readonly logger: ILogger,
        private readonly tracer: Tracer,
    ) {}

    async send(options: SendEmailOptions): Promise<void> {
        await this.tracer.startActiveSpan("smtp_email_send", async (span) => {
            if (!this.transporter) {
                throw new EmailTransportNotInitializedError();
            }

            try {
                span.setAttributes({
                    "email.provider": "smtp",
                });
                await this.transporter.sendMail(options);
            } catch (error: any) {
                this.logger.error(
                    {
                        error,
                        subject: options.subject,
                    },
                    "Failed to send email",
                );
                throw new EmailSendFailedError();
            }
        });
    }
}
