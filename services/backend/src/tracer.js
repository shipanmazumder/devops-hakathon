const { NodeTracerProvider } = require("@opentelemetry/node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const {
    ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { MySQLInstrumentation } = require('@opentelemetry/instrumentation-mysql');
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");
const { Resource } = require("@opentelemetry/resources");
const {
    SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
    RedisInstrumentation,
} = require("@opentelemetry/instrumentation-redis");
function configureOpenTelemetry(serviceName) {
    // Create a tracer provider and register the Express instrumentation
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
            // Add other resource attributes as needed
        }),
    });
    provider.register();

    // Configure and register Jaeger exporter
    const exporter = new JaegerExporter({
        serviceName: serviceName,
        endpoint: "http://jaeger:14268/api/traces"
    });

    // Use BatchSpanProcessor
    const spanProcessor = new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(spanProcessor);

    // Register the Express instrumentation
    registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [
            new ExpressInstrumentation(),
            new RedisInstrumentation(),
            new MongoDBInstrumentation(),
            new MySQLInstrumentation()

        ],
    });

    return provider;
}

module.exports = configureOpenTelemetry;