import { BookingRecord } from "#application/dto/persistence-booking.dto";
import { BookingRepository } from "#application/port/booking.repository";
import { Booking } from "#domain/booking/entities/booking";
import { PrismaClient } from "#generated/prisma/client";
import { BookingMapper } from "./booking-mapper";

export class PrismaBookingRepository implements BookingRepository {
    constructor(private readonly db: PrismaClient) {}

    async save(booking: Booking): Promise<BookingRecord> {
        const persistentBooking = BookingMapper.toPersistence(booking);
        const createdBooking = await this.db.booking.create({
            data: persistentBooking,
        });
        return createdBooking;
    }

    async findById(id: string): Promise<Booking | null> {
        const booking = await this.db.booking.findUnique({ where: { id } });
        if (!booking) return null;
        const domainBooking = BookingMapper.toDomain(booking);
        return domainBooking;
    }

    async update(booking: Booking): Promise<void> {
        const persistentBooking = BookingMapper.toPersistence(booking);
        await this.db.booking.update({
            where: { id: persistentBooking.id },
            data: persistentBooking,
        });
    }
}
