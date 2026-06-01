// src/context/infrastructure/persistence/MongooseNotification.ts
import { Schema, model, Document } from "mongoose";

export interface INotificationDoc extends Document {
    _id: any; // We map Domain ID to MongoDB _id
    targetType: "TICKET" | "SYSTEM_EVENT"; // Flattened Value Object
    targetId: string; // Flattened Value Object
    recipientEmail: string; // Value Object string value
    templateId: string;
    payload: Record<string, any>; // Flexible schema-less object
    status: "PENDING" | "SENT" | "FAILED";
    idempotencyKey: string;
    errorMessage?: string;
}

const NotificationMongooseSchema = new Schema<INotificationDoc>(
    {
        _id: { type: String, required: true }, // Store UUID string here
        targetType: {
            type: String,
            enum: ["TICKET", "SYSTEM_EVENT"],
            required: true,
        },
        targetId: { type: String, required: true },
        recipientEmail: { type: String, required: true },
        templateId: { type: String, required: true },
        payload: { type: Schema.Types.Mixed, required: true }, // Allows flexible Mongo structures
        status: {
            type: String,
            enum: ["PENDING", "SENT", "FAILED"],
            required: true,
            index: true,
        },
        idempotencyKey: { type: String, required: true, unique: true },
        errorMessage: { type: String },
    },
    {
        timestamps: true, // Automatically gives us createdAt and updatedAt fields
    },
);

// Compound index to look up alerts quickly by target type and target ID
NotificationMongooseSchema.index({ targetType: 1, targetId: 1 });

export const MongooseNotificationModel = model<INotificationDoc>(
    "Notification",
    NotificationMongooseSchema,
);
