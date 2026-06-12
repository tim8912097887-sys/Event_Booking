export interface IEvent {
    id: string;
    name: string;
    slug: string;
    description: string;
    creatorId: string;
    date: Date;
    capacity: number;
    reservedSeats: number;
    version: number;
    price: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
