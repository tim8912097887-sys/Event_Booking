import {
    eventOperationsTotal,
    httpRequestCounter,
    httpRequestDuration,
    outboxMessagesTotal,
    outboxPendingMessages,
} from "./event.metric.js";

export class PrometheusEventMetrics {
    // Metric wrappers
    async trackOperation<T>(operation: string, fn: () => Promise<T>) {
        try {
            const result = await fn();
            this.eventPerform(operation, "success");
            return result;
        } catch (error) {
            this.eventPerform(operation, "fail");
            throw error;
        }
    }

    eventPerform(operation: string, result: string) {
        eventOperationsTotal.inc({ operation, result });
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

    async trackOutboxMessagePublish<T>(
        event_name: string,
        fn: () => Promise<T>,
    ) {
        let outcome = "success";
        try {
            const result = await fn();
            return result;
        } catch (error) {
            outcome = "fail";
            throw error;
        } finally {
            this.outboxMessagesTotal(event_name, outcome);
        }
    }

    outboxMessagesTotal(event_name: string, result: string) {
        outboxMessagesTotal.inc({ event_name, result });
    }

    outboxPendingMessagesTotal(count: number) {
        outboxPendingMessages.set(count);
    }
}
