import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

const sdk = new NodeSDK({
    serviceName: "event-service",
    traceExporter: new OTLPTraceExporter({
        url: "http://otel-collector:4317",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

export function startTelemetry() {
    sdk.start();
    console.log("OpenTelemetry initialized for event-service");
}

export async function stopTelemetry() {
    await sdk.shutdown();
}

startTelemetry();
