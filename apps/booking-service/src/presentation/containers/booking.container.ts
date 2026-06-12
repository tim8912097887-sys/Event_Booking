import { prisma } from "#infrastructure/persistence/postgres-connection.js";
import { PrismaBookingRepository } from "#infrastructure/persistence/prisma-booking.repository.js";
import { CancelBookingUseCase } from "#application/use-case/cancel-booking.use-case.js";
import { CreateBookingUseCase } from "#application/use-case/create-booking.use-case.js";
import { BookingController } from "../controllers/booking.controller.js";
import { EventHttpClient } from "#infrastructure/event/event-reservation-gateway.js";

// Initialize repositories
export const bookingRepository = new PrismaBookingRepository(prisma);
// Initialize event client
const eventService = new EventHttpClient();
// Initialize use cases
export const cancelBookingUseCase = new CancelBookingUseCase(
    bookingRepository,
    eventService,
);
export const createBookingUseCase = new CreateBookingUseCase(
    bookingRepository,
    eventService,
);
// Initialize controllers
export const bookingController = new BookingController(
    cancelBookingUseCase,
    createBookingUseCase,
);
