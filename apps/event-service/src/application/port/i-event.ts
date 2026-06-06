export interface IEvent {
    id: string;
    name: string;
    description: string;
    creatorId: string;
    date: Date;
    capacity: number;
    price: number;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
