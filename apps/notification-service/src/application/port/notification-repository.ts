import { Notification } from "#domain/entities/notification.entity.js";

export interface NotificationRepository {
    save(notification: Notification): Promise<void>;

    findByIdempotencyKey(key: string): Promise<Notification | null>;
}
