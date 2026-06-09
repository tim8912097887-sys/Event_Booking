import { trace, SpanStatusCode, Span } from "@opentelemetry/api";
import { Tracer } from "#application/port/event-trace.js";

export class OpenTelemetryTracer implements Tracer {
    private readonly tracer = trace.getTracer("event-service");

    async startActiveSpan<T>(
        name: string,
        fn: (span: Span) => Promise<T>,
        attributes?: Record<string, string | number | boolean>,
    ): Promise<T> {
        return this.tracer.startActiveSpan(name, async (span) => {
            try {
                if (attributes) {
                    span.setAttributes(attributes);
                }

                const result = await fn(span);

                span.setStatus({
                    code: SpanStatusCode.OK,
                });

                return result;
            } catch (error) {
                span.recordException(error as Error);

                span.setStatus({
                    code: SpanStatusCode.ERROR,
                });

                throw error;
            } finally {
                span.end();
            }
        });
    }
}
