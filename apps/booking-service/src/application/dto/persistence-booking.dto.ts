export const BOOKING_STATUS = {
    PENDING_PAYMENT: "PENDING_PAYMENT",
    CONFIRMED: "CONFIRMED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    CANCELLED: "CANCELLED",
} as const;

export type BookingStatus =
    (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export interface BookingRecord {
    id: string;
    eventId: string;
    userId: string;
    status: BookingStatus;
    amount: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date | null;
}
