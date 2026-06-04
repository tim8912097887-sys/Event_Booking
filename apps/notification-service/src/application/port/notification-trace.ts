import { Span } from "@opentelemetry/api";

export interface Tracer {
    startActiveSpan<T>(
        name: string,
        fn: (span: Span) => Promise<T>,
        attributes?: Record<string, string | number | boolean>,
    ): Promise<T>;
}
