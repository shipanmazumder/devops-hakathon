const configureOpenTelemetry = require("./tracer");
const dotenv = require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 4002;
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("mongo-service");

const mongoose = require("mongoose");
const Feed = require("./Model/Feed");
const { getResultFormat, errorResponse } = require("./util/ResponseUtil");
const { setKeyValue, getValueByKey, deleteCacheKey } = require("./redis/RedisSetup");

app.get("/", async (req, res, next) => {
    const ctx = propagation.extract(context.active(), req.headers);
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("mongo-db-span", {}, ctx);

    try {
        let cacheKey = "feeds";
        let result = await getValueByKey(cacheKey, ctx);
        if (result) {
            return getResultFormat(res, next, JSON.parse(result));
        }
        let feeds = await Feed.find()
            .sort([['createdAt', -1]]);
        if (!feeds) {
            let data = {
                code: 404,
                message: "No Feeds Found",
                data: null,
            };
            return getResultFormat(res, next, data);
        }
        await setKeyValue(cacheKey, JSON.stringify(feeds), ctx);
        let data = {
            code: 200,
            message: "All Feeds",
            data: feeds,
        };
        return getResultFormat(res, next, data);

    } catch (error) {
        span.recordException(error)
        return errorResponse(error);
    } finally {
        span.end();
    }
});

app.get("/insertFeeds", async (req, res, next) => {
    let data = [
        {
            "title": "alphonso mango",
            "desc": "great Quality of Mango"
        },
        {
            "title": "Apples",
            "desc": "great Quality of Apple"
        },
        {
            "title": "Kesar Mango",
            "desc": "great Quality of Mango"
        },
        {
            "title": "Langra Mango",
            "desc": "great Quality of Mango"
        },
        {
            "title": "Broccoli",
            "desc": "great Quality of Fresh Vegetable"
        },
        {
            "title": "Cauliflower",
            "desc": "great Quality of Fresh Vegetable"
        },
        {
            "title": "Olive Oil",
            "desc": "great Quality of Oil"
        }
    ]
    deleteCacheKey("feeds");
    await Feed.deleteMany();

    await Feed.insertMany(data);
    return getResultFormat(res, next, {
        code: 200,
        message: "All Feeds Insert",
        data: data,
    });
});

// Start the server
// const server = app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });


mongoose.Promise = global.Promise;
// Connect to the DB an initialize the app if successful
const server = mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        // logger.info( "Database connection successful" );
        console.log("Database Connect")
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        //eslint-disable-next-line
        console.error(err);
        // logger.error( err );
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