// redisClient.js
const redis = require('redis');
const configureOpenTelemetry = require('../tracer');

// Function // Import necessary OpenTelemetry objects
const { trace } = require('@opentelemetry/api');

// Assuming you have a tracer named 'example-tracer' initialized elsewhere in your application

const tracerProvider = configureOpenTelemetry("redis-service")
const tracer = tracerProvider.getTracer('express-tracer');

// Connect to Redis server
const client = redis.createClient({
    url: 'redis://redis:6379' // Default Redis URL
});
client.connect();

// Function to set a key-value pair in Redis with tracing and forced delay
async function setKeyValue(key, value, parent) {
    const span = tracer.startSpan('setKeyValue', {}, parent);
    try {
        await client.set(key, value);
        console.log(`Key set: ${key}`);
        span.addEvent('Key set successfully');
    } catch (error) {
        console.error(`Error setting key ${key}:`, error);
        span.recordException(error);
        span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    } finally {
        span.end();
    }
}

// Function to get a value by key from Redis with tracing
async function getValueByKey(key, parent) {
    const span = tracer.startSpan('getValueByKey', {}, parent);
    try {
        const value = await client.get(key);
        console.log(`Value for ${key}:`, value);
        span.addEvent('Value retrieved successfully');
        return value;
    } catch (error) {
        console.error(`Error getting value for key ${key}:`, error);
        span.recordException(error);
        span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    } finally {
        span.end();
    }
}
// Function to get a value by key from Redis with tracing
async function deleteCacheKey(key) {
    // const span = tracer.startSpan('deletekey', {}, parent);
    try {
        await client.del(key);
        // span.addEvent('Value retrieved successfully');
    } catch (error) {
        console.error(`Error getting value for key ${key}:`, error);
        // span.recordException(error);
        // span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
    } finally {
        // span.end();
    }
}

module.exports = { setKeyValue, getValueByKey, deleteCacheKey };