import { EventNotFoundError } from "#application/errors/event-not-found.error.js";
import { SeatConflictError } from "#application/errors/seat-conflict.error.js";
import { SeatUnavailableError } from "#application/errors/seat-unavailable.error.js";
import {
    bookingCompensationFailuresTotal,
    bookingDbErrorsTotal,
    bookingFailuresTotal,
    bookingOperationsTotal,
    eventServiceRequestTotal,
    eventServiceRetriesTotal,
    httpRequestCounter,
    httpRequestDuration,
} from "./booking.metric.js";

export class PrometheusBookingMetrics {
    async trackOperation<T>(operation: string, fn: () => Promise<T>) {
        try {
            const result = await fn();
            this.bookingPerform(operation, "success");
            return result;
        } catch (error) {
            if (error instanceof SeatUnavailableError) {
                this.bookingFailure("seat_unavailable");
            } else if (error instanceof EventNotFoundError) {
                this.bookingFailure("event_not_found");
            } else if (error instanceof SeatConflictError) {
                this.bookingFailure("seat_conflict");
            } else {
                this.bookingFailure("unknown");
            }
            this.bookingPerform(operation, "fail");
            throw error;
        }
    }

    bookingPerform(operation: string, result: string) {
        bookingOperationsTotal.inc({ operation, result });
    }

    httpRequestTotal(method: string, path: string, statusCode: number) {
        httpRequestCounter.inc({
            method,
            path,
            status_code: statusCode.toString(),
        });
    }

    httpRequestDuration(
        method: string,
        path: string,
        statusCode: number,
        duration: number,
    ) {
        httpRequestDuration.observe(
            {
                method,
                path,
                status_code: statusCode.toString(),
            },
            duration,
        );
    }

    bookingDbErrorsTotal(operation: string) {
        bookingDbErrorsTotal.inc({ operation });
    }

    async trackDbQuery<T>(operation: string, fn: () => Promise<T>) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            this.bookingDbErrorsTotal(operation);
            throw error;
        }
    }

    eventRequestTotal(operation: string, result: string) {
        eventServiceRequestTotal.inc({ operation, result });
    }

    eventRetriesTotal(operation: string, result: string) {
        eventServiceRetriesTotal.inc({ operation, result });
    }

    bookingFailure(errorType: string) {
        bookingFailuresTotal.inc({ error_type: errorType });
    }

    bookingCompensationFailure() {
        bookingCompensationFailuresTotal.inc();
    }
}
