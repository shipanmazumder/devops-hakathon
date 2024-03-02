const configureOpenTelemetry = require("./tracer");
const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4001;
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("backend-service");
const axios = require("axios");
app.get("/", async (req, res) => {
    const ctx = propagation.extract(context.active(), req.headers);
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("backend-span", {}, ctx);

    try {
        const mongoSpan = tracer.startSpan("mongo-start-span", {}, ctx);
        await new Promise(resolve => setTimeout(resolve, 3000))
        const getFeeds = await axios.get(`http://mongodb:4002`, {
            headers: req.headers,
        });
        console.log(getFeeds.data.code);
        mongoSpan.end();
        if (getFeeds.data.code == 200) {
            let userId = req.query.userId;
            let feedId = req.query.feedId;
            let visitTime = Date.now();
            const mysqlSpan = tracer.startSpan("mysql-start-span", {}, ctx);
            // const vistiAdd = await axios.post(`http://mysqldb:4003/addVisit`, { userId: userId, feedId: feedId, visitTime: visitTime }, {
            //     headers: req.headers,
            // });
            return axios.get(`http://mysqldb:4003/addVisit`, { headers: req.headers }).then((result) => {
                mysqlSpan.addEvent(result)
                res.json(result.data).status(200);
                // mysqlSpan.end();
            }).catch(err => {
                console.log(err.message)
            }).finally(() => {
                mysqlSpan.end();
            });

        }
        res.json(getFeeds.data).status(200);
        // res.json({ data: "Data from backend" }).status(200);
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