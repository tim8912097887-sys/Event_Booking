import { prisma } from "#infrastructure/persistence/postgres-connection.js";
import { PrismaBookingRepository } from "#infrastructure/persistence/prisma-booking.repository.js";
import { CancelBookingUseCase } from "#application/use-case/cancel-booking.use-case.js";
import { CreateBookingUseCase } from "#application/use-case/create-booking.use-case.js";
import { BookingController } from "../controllers/booking.controller.js";
import { EventHttpClient } from "#infrastructure/event/event-reservation-gateway.js";
import { PrometheusBookingMetrics } from "#infrastructure/metrics/prometheus-booking.metric.js";

// Initialize metrics
export const bookingMetric = new PrometheusBookingMetrics();
// Initialize repositories
export const bookingRepository = new PrismaBookingRepository(
    prisma,
    bookingMetric,
);
// Initialize event client
const eventService = new EventHttpClient(bookingMetric);
// Initialize use cases
export const cancelBookingUseCase = new CancelBookingUseCase(
    bookingRepository,
    eventService,
    bookingMetric,
);
export const createBookingUseCase = new CreateBookingUseCase(
    bookingRepository,
    eventService,
    bookingMetric,
);
// Initialize controllers
export const bookingController = new BookingController(
    cancelBookingUseCase,
    createBookingUseCase,
);
