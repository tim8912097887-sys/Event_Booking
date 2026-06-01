import { NotificationTarget } from "#domain/value-objects/notification-target.vo.js";
import { RecipientEmail } from "#domain/value-objects/recipient-email.vo.js";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationProps {
    target: NotificationTarget;
    recipientEmail: RecipientEmail;
    templateId: string;
    payload: Record<string, any>; // Flexible for ticket/event metadata
    status: NotificationStatus;
    idempotencyKey: string;
    errorMessage?: string;
}

export class Notification {
    private constructor(
        public readonly id: string, // UUID generated in domain layer
        private props: NotificationProps,
    ) {}

    // Factory method to create a new notification
    public static create(
        id: string,
        props: Omit<NotificationProps, "status">,
    ): Notification {
        return new Notification(id, { ...props, status: "PENDING" });
    }

    // Domain behavior: business rules live here
    public markAsSent(): void {
        this.props.status = "SENT";
    }

    public markAsFailed(reason: string): void {
        this.props.status = "FAILED";
        this.props.errorMessage = reason;
    }

    // Getters to safely expose properties to the Mongoose mapper
    public getProps(): NotificationProps {
        return { ...this.props };
    }
}
