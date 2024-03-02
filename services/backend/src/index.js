const configureOpenTelemetry = require("./tracer");
const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4001;
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("backend-service");
app.get("/", async (req, res) => {
    const ctx = propagation.extract(context.active(), req.headers);
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("backend-span", {}, ctx);

    try {
        res.json({ data: "Data from backend" }).status(200);
    } catch (error) {
        span.recordException(error)
        res.status(500).send(error.message);
    } finally {
        span.end();
    }
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Gracefully shut down the OpenTelemetry SDK and the server
const gracefulShutdown = () => {
    server.close(() => {
        console.log("Server stopped");
        sdk
            .shutdown()
            .then(() => console.log("Tracing terminated"))
            .catch((error) => console.error("Error shutting down tracing", error))
            .finally(() => process.exit(0));
    });
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);