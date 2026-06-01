import { NotificationRepository } from "#application/port/notification-repository.js";
import { Notification } from "#domain/entities/notification.entity.js";
import { MongooseNotificationModel } from "./models/notification-model.js";
import { NotificationMapper } from "./notification-mapper.js";

export class MongooseNotificationRepository implements NotificationRepository {
    async save(notification: Notification): Promise<void> {
        const updatedValue = NotificationMapper.toPersistence(notification);
        await MongooseNotificationModel.findByIdAndUpdate(
            notification.id,
            updatedValue,
            { upsert: true },
        );
    }

    async findByIdempotencyKey(key: string): Promise<Notification | null> {
        const doc = await MongooseNotificationModel.findOne({
            idempotencyKey: key,
        });

        if (!doc) return null;

        return NotificationMapper.toDomain(doc);
    }
}
