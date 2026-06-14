import { BookingRecord } from "#application/dto/persistence-booking.dto.js";
import { BookingRepository } from "#application/port/booking.repository.js";
import { Booking } from "#domain/booking/entities/booking.js";
import { PrismaClient } from "#generated/prisma/client.js";
import { PrometheusBookingMetrics } from "../metrics/prometheus-booking.metric.js";
import { BookingMapper } from "./booking-mapper.js";

export class PrismaBookingRepository implements BookingRepository {
    constructor(
        private readonly db: PrismaClient,
        private readonly metrics: PrometheusBookingMetrics,
    ) {}

    async save(booking: Booking): Promise<BookingRecord> {
        return this.metrics.trackDbQuery("save-booking", async () => {
            const persistentBooking = BookingMapper.toPersistence(booking);
            const createdBooking = await this.db.booking.create({
                data: persistentBooking,
            });
            return createdBooking;
        });
    }

    async findById(id: string): Promise<Booking | null> {
        return this.metrics.trackDbQuery("find-booking-by-id", async () => {
            const booking = await this.db.booking.findUnique({ where: { id } });
            if (!booking) return null;
            const domainBooking = BookingMapper.toDomain(booking);
            return domainBooking;
        });
    }

    async update(booking: Booking): Promise<void> {
        await this.metrics.trackDbQuery("update-booking", async () => {
            const persistentBooking = BookingMapper.toPersistence(booking);
            await this.db.booking.update({
                where: { id: persistentBooking.id },
                data: persistentBooking,
            });
        });
    }
}
