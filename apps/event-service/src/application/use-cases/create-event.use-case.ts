import { Event } from "#domain/event/entities/event.js";
import { EventCommandRepository } from "../port/event-command.repository.js";
import { Tracer } from "../port/event-trace.js";
import { IEvent } from "../port/i-event.js";

export class CreateEventUseCase {
    constructor(
        private readonly repository: EventCommandRepository,
        private readonly tracer: Tracer,
    ) {}

    async execute(
        input: Omit<
            IEvent,
            "id" | "status" | "createdAt" | "updatedAt" | "deletedAt" | "date"
        > & { date: string },
    ): Promise<string> {
        return this.tracer.startActiveSpan(
            "CreateEventUseCase",
            async (span) => {
                const event = Event.create(input);
                const baseSlug = event.getSlug();
                // Set span attribute
                span.setAttributes({
                    "event.id": event.getId(),
                    "event.slug": baseSlug,
                    "event.action": "create",
                });
                let counter = 1;
                // Handle race conditions by db unique constraint
                while (true) {
                    try {
                        await this.repository.save(event);
                        break;
                    } catch (error: any) {
                        console.error("CATCHBLOCK_DEBUG:", {
                            code: error?.code,
                            driverErrorCode: error?.driverError?.code,
                            message: error?.message,
                            keys: Object.keys(error || {}),
                        });
                        // Check direct PG code
                        // Check Drizzle's wrapped driverError code
                        // Check for the string if codes are missing
                        const isUniqueViolation =
                            error.code === "23505" ||
                            error.driverError?.code === "23505" ||
                            error.message?.includes("23505") ||
                            error.message?.includes("events_slug_unique") ||
                            JSON.stringify(error).includes("23505");

                        if (!isUniqueViolation) {
                            throw error; // Real database error (connection, etc)
                        }

                        counter++;
                        event.changeSlug(`${baseSlug}-${counter}`);
                    }
                }
                return event.getId();
            },
        );
    }
}
