import { NotificationRepository } from "#application/port/notification-repository.js";
import { Tracer } from "#application/port/notification-trace.js";
import { Notification } from "#domain/entities/notification.entity.js";
import { MongooseNotificationModel } from "./models/notification-model.js";
import { NotificationMapper } from "./notification-mapper.js";

export class MongooseNotificationRepository implements NotificationRepository {
    constructor(private readonly tracer: Tracer) {}

    async save(notification: Notification): Promise<void> {
        await this.tracer.startActiveSpan("save_notification", async (span) => {
            span.setAttributes({
                "db.system": "mongodb",
                "db.operation": "findByIdAndUpdate",
                "db.collection.name": "notifications",
                "notification.id": notification.id,
                "notification.templateId": notification.getProps().templateId,
            });
            const updatedValue = NotificationMapper.toPersistence(notification);
            await MongooseNotificationModel.findByIdAndUpdate(
                notification.id,
                updatedValue,
                { upsert: true },
            );
        });
    }

    async findByIdempotencyKey(key: string): Promise<Notification | null> {
        const doc = await MongooseNotificationModel.findOne({
            idempotencyKey: key,
        });

        if (!doc) return null;

        return NotificationMapper.toDomain(doc);
    }
}
