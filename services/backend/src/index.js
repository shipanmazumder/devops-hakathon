const configureOpenTelemetry = require("./tracer");
const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4001;
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("backend-service");
const axios = require("axios");

const morgan = require("morgan");
app.use(morgan("dev"));
app.get("/", async (req, res) => {
    const ctx = propagation.extract(context.active(), req.headers);
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("backend-span", {}, ctx);

    try {
        const mongoSpan = tracer.startSpan("mongo-start-span", {}, ctx);
        // await new Promise(resolve => setTimeout(resolve, 3000))
        const getFeeds = await axios.get(`http://mongodb:4002`, {
            headers: req.headers,
        });
        mongoSpan.end();
        if (getFeeds != null && getFeeds.data.code == 200) {
            // let userId = req.query.userId;
            // let feedId = req.query.feedId;
            // let visitTime = Date.now();
            const mysqlSpan = tracer.startSpan("mysql-start-span", {}, ctx);
            // const vistiAdd = await axios.post(`http://mysqldb:4003/addVisit`, { userId: userId, feedId: feedId, visitTime: visitTime }, {
            //     headers: req.headers,
            // });
            return axios.get(`http://mysqldb:4003/addVisit`, { headers: req.headers }).then((result) => {
                mysqlSpan.addEvent("Data Saved")
                res.json(getFeeds.data).status(200);
                // mysqlSpan.end();
            }).catch(err => {
                console.log(err.message)
            }).finally(() => {
                mysqlSpan.end();
            });

        } else {
            res.json(getFeeds.data).status(200);
        }
        // res.json({ data: "Data from backend" }).status(200);
    } catch (error) {
        span.recordException(error)
        res.status(500).send(error.message);
    } finally {
        span.end();
    }
});

const amqp = require('amqplib');

const connectAndListen = async () => {
    const connection = await amqp.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const exchange = 'orderExchange';
    const queue = 'orderQueue';

    // Assert the exchange and queue
    await channel.assertExchange(exchange, 'direct', { durable: false });
    await channel.assertQueue(queue, { durable: false });

    // Bind the queue to the exchange with the routing key 'orderCreated'
    await channel.bindQueue(queue, exchange, 'orderCreated');

    console.log(`Waiting for "order created" events. To exit press CTRL+C`);

    // Consume messages from the queue
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            // const rabitTracerProvider = configureOpenTelemetry("rabit-service")
            const eventData = JSON.parse(msg.content.toString());
            const headers = msg.properties.headers;

            const ctx = propagation.extract(context.active(), headers);
            const rabitTracer = tracerProvider.getTracer("express-tracer");
            const rabitSpan = rabitTracer.startSpan("rabit-consume-span", {}, ctx);
            console.log(`Received "order created" event:`, eventData);
            rabitSpan.end();

            // Handle the order creation logic here
            // ...

            // Acknowledge the message
            channel.ack(msg);
        }
    });
};

connectAndListen();
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