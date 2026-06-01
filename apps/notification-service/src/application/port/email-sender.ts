export type SendEmailOptions = {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

export interface EmailSender {
    send(options: SendEmailOptions): Promise<void>;
}
