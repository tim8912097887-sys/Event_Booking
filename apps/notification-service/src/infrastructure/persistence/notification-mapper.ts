import { Notification } from "#domain/entities/notification.entity.js";
import { NotificationTarget } from "#domain/value-objects/notification-target.vo.js";
import { RecipientEmail } from "#domain/value-objects/recipient-email.vo.js";
import { INotificationDoc } from "./models/notification-model.js";

export class NotificationMapper {
    // Convert Domain Entity -> Mongoose Database Document format
    public static toPersistence(
        notification: Notification,
    ): Partial<INotificationDoc> {
        const props = notification.getProps();
        return {
            _id: notification.id,
            targetType: props.target.type,
            targetId: props.target.id,
            recipientEmail: props.recipientEmail.value,
            templateId: props.templateId,
            payload: props.payload,
            status: props.status,
            idempotencyKey: props.idempotencyKey,
            errorMessage: props.errorMessage,
        };
    }

    // Convert Mongoose Database Document -> Domain Entity format
    public static toDomain(doc: INotificationDoc): Notification {
        return Notification.rehydrate(doc._id, {
            target: new NotificationTarget(doc.targetType, doc.targetId),
            recipientEmail: RecipientEmail.create(doc.recipientEmail),
            templateId: doc.templateId,
            payload: doc.payload,
            idempotencyKey: doc.idempotencyKey,
            status: doc.status,
            errorMessage: doc.errorMessage,
        });
    }
}
