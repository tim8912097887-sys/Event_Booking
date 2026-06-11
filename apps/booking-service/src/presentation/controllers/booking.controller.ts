import { CreateBooking } from "#application/dto/create-booking.dto.js";
import { CancelBookingUseCase } from "#application/use-case/cancel-booking.use-case.js";
import { CreateBookingUseCase } from "#application/use-case/create-booking.use-case.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../response/success.js";

export class BookingController {
    constructor(
        private readonly cancelBookingUseCase: CancelBookingUseCase,
        private readonly createBookingUseCase: CreateBookingUseCase,
    ) {}

    cancel = async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as {
            id: string;
        };

        await this.cancelBookingUseCase.execute(id);

        return reply.status(204).send();
    };

    create = async (request: FastifyRequest, reply: FastifyReply) => {
        const input = request.body as CreateBooking;

        const eventId = await this.createBookingUseCase.execute(input);

        return reply.status(201).send(
            successResponse({
                eventId,
            }),
        );
    };
}
