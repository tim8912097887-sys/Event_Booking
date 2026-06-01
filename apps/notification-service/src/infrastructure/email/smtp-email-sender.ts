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

export class SmtpEmailSender implements EmailSender {
    constructor(
        private readonly transporter: Transporter,
        private readonly logger: ILogger,
    ) {}

    async send(options: SendEmailOptions): Promise<void> {
        if (!this.transporter) {
            throw new EmailTransportNotInitializedError();
        }

        try {
            await this.transporter.sendMail(options);
        } catch (error: any) {
            this.logger.error("Failed to send email", {
                error,
                subject: options.subject,
            });
            throw new EmailSendFailedError();
        }
    }
}
