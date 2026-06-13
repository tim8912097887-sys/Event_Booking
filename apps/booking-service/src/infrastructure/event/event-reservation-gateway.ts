import { httpClient } from "../http/axios.client.js";
import { EventServicePort } from "#application/port/event.service.port.js";
import { EventNotFoundError } from "#application/errors/event-not-found.error.js";
import { EventServiceUnavailableError } from "#application/errors/event-service-unavailable.error.js";
import { SeatConflictError } from "#application/errors/seat-conflict.error.js";
import { sleep } from "../shared/retry.js";
import { AxiosResponse } from "axios";
import { SeatUnavailableError } from "#application/errors/seat-unavailable.error.js";

export class EventHttpClient implements EventServicePort {
    async reserveSeats(eventId: string, seats: number): Promise<void> {
        // Encode the eventId to ensure it can never break out of its path segment
        const safeEventId = encodeURIComponent(eventId);
        await this.request(
            () =>
                httpClient.post(`/events/${safeEventId}/reserve`, {
                    requestedSeats: seats,
                }),
            eventId,
        );
    }

    async releaseSeats(eventId: string, seats: number): Promise<void> {
        const safeEventId = encodeURIComponent(eventId);
        await this.request(
            () =>
                httpClient.post(`/events/${safeEventId}/release`, {
                    requestedSeats: seats,
                }),
            eventId,
        );
    }

    private async request<T>(
        fn: () => Promise<AxiosResponse<T>>,
        eventId: string,
    ): Promise<T> {
        // Handle retries for network and optimistic errors
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const result = await fn();
                return result.data;
            } catch (error: any) {
                const status = error?.response?.status;

                if (!status) {
                    await sleep(100 * (attempt + 1));
                    continue;
                }

                if (status === 409 && attempt < 2) {
                    await sleep(50 * (attempt + 1));
                    continue;
                }

                this.handleError(error, eventId);
            }
        }

        throw new EventServiceUnavailableError();
    }

    private handleError(error: any, eventId: string): never {
        // Axios-specific error shape
        const status = error?.response?.status;

        switch (status) {
            case 409:
                throw new SeatConflictError();
            case 422:
                throw new SeatUnavailableError();
            case 404:
                throw new EventNotFoundError(eventId);
            default:
                throw new EventServiceUnavailableError();
        }
    }
}
