const configureOpenTelemetry = require("./tracer");
const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("user-service");
const axios = require("axios");
var uniqid = require('uniqid');
const amqp = require('amqplib');

app.use((req, res, next) => {
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("user-start");

    // Add custom attributes or log additional information if needed
    span.setAttribute("user", "user call feed");

    // Pass the span to the request object for use in the route handler
    context.with(trace.setSpan(context.active(), span), () => {
        propagation.inject(context.active(), req.headers);
        next();
    });
});



async function publishOrderCreatedEvent(orderId, otherOrderDetails, headers) {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const exchange = 'orderExchange';

    // Assert the exchange
    await channel.assertExchange(exchange, 'direct', { durable: false });

    // Publish the "order created" event to the exchange
    channel.publish(exchange, 'orderCreated', Buffer.from(JSON.stringify({ orderId, otherOrderDetails }), headers));

    console.log(`Order created event published: ${orderId}`);

    // Close the channel and connection
    await channel.close();
    await connection.close();
}




app.get("/feed", async (req, res) => {
    const parentSpan = trace.getSpan(context.active());

    try {
        const rabitTracer = tracerProvider.getTracer("express-tracer");
        const rabitSpan = rabitTracer.startSpan("rabit-start-span", {}, context.active())
        let carrers = {}
        propagation.inject(context.active(), carrers);

        await publishOrderCreatedEvent(1234, { "id": 1234 }, { headers: carrers });
        rabitSpan.end();
        // let userId =
        const getFeeds = await axios.get(`http://backend:4001?userId=${uniqid()}&feedId=${uniqid()}`, {
            headers: req.headers,
        });
        res.json(getFeeds.data).status(200);
    } catch (error) {
        parentSpan.recordException(error)
        res.status(500).send(error.message);
    } finally {
        parentSpan.end();
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