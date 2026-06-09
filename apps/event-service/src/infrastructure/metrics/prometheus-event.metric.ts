import {
    dbQueryDuration,
    eventOperationsTotal,
    httpRequestCounter,
    httpRequestDuration,
    outboxMessagesTotal,
    outboxPendingMessages,
    outboxPublishDuration,
} from "./event.metric.js";

export class PrometheusEventMetrics {
    // Metric wrappers
    async trackOperation<T>(action: string, fn: () => Promise<T>) {
        try {
            const result = await fn();
            this.eventPerform(action, "success");
            return result;
        } catch (error) {
            this.eventPerform(action, "fail");
            throw error;
        }
    }

    eventPerform(action: string, result: string) {
        eventOperationsTotal.inc({ action, result });
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

    async trackDbQuery<T>(operation: string, fn: () => Promise<T>) {
        const end = dbQueryDuration.startTimer({
            operation,
        });
        try {
            const result = await fn();
            end({ result: "success" });
            return result;
        } catch (error) {
            end({ result: "fail" });
            throw error;
        }
    }

    async trackOutboxMessagePublish<T>(
        event_name: string,
        fn: () => Promise<T>,
    ) {
        const end = outboxPublishDuration.startTimer({
            event_name,
        });
        let outcome = "success";
        try {
            const result = await fn();
            end({ result: outcome });
            return result;
        } catch (error) {
            outcome = "fail";
            end({ result: outcome });
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
