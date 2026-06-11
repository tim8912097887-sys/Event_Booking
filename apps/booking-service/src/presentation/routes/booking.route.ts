import { FastifyInstance } from "fastify";
import { BookingController } from "../controllers/booking.controller.js";
import { CreateBookingSchema } from "../schemas/create-booking.schema.js";
import { BookingIdSchema } from "../schemas/booking-id.schema.js";

export class BookingRoute {
    constructor(
        private readonly app: FastifyInstance,
        private readonly controller: BookingController,
    ) {}

    register() {
        this.app.post(
            "/bookings",
            { schema: { body: CreateBookingSchema } },
            this.controller.create,
        );
        this.app.post(
            "/bookings/:id",
            {
                schema: { params: BookingIdSchema },
            },
            this.controller.cancel,
        );
    }
}
