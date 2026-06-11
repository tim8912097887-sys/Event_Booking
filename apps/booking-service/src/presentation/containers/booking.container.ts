import { prisma } from "#infrastructure/persistence/postgres-connection.js";
import { PrismaBookingRepository } from "#infrastructure/persistence/prisma-booking.repository.js";
import { CancelBookingUseCase } from "#application/use-case/cancel-booking.use-case.js";
import { CreateBookingUseCase } from "#application/use-case/create-booking.use-case.js";
import { BookingController } from "../controllers/booking.controller.js";

// Initialize repositories
export const bookingRepository = new PrismaBookingRepository(prisma);
// Initialize use cases
export const cancelBookingUseCase = new CancelBookingUseCase(bookingRepository);
export const createBookingUseCase = new CreateBookingUseCase(bookingRepository);
// Initialize controllers
export const bookingController = new BookingController(
    cancelBookingUseCase,
    createBookingUseCase,
);
