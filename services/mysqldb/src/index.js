const express = require('express')
const configureOpenTelemetry = require("./tracer");
const { getResultFormat, errorResponse, nextError } = require("./util/ResponseUtil");
const { trace, context, propagation } = require("@opentelemetry/api");
const tracerProvider = configureOpenTelemetry("mysql-service");
const dotenv = require("dotenv").config();

const app = express()

const morgan = require("morgan");
app.use(morgan("dev"));
const mysql = require('mysql2');

const mysqlConfig = {
    host: "mysql_server",
    user: "shipan",
    password: "secret",
    database: "visit_feeds"
}

let con = null


// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world')
})

app.get('/connect', function (req, res) {
    con = mysql.createConnection(mysqlConfig);
    con.connect(function (err) {
        if (err) throw err;
        res.send('connected')
    });
})

app.get('/create-table', function (req, res) {
    con.connect(function (err) {
        if (err) throw err;
        const sql = `
    CREATE TABLE IF NOT EXISTS visitor_count (
      id INT AUTO_INCREMENT PRIMARY KEY,
      number INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )  ENGINE=INNODB;
  `;
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.send("numbers table created");
        });
    });
})

app.get('/addVisit', function (req, res) {

    const ctx = propagation.extract(context.active(), req.headers);
    const tracer = tracerProvider.getTracer("express-tracer");
    const span = tracer.startSpan("mysql-span", {}, ctx);
    const number = Math.round(Math.random() * 100)
    // const userId = req.query.userId;
    // const feedId = req.query.feedId;
    // const visitTime = req.query.visitTime;
    con.connect(function (err) {
        if (err) throw err;
        const sql = `INSERT INTO visitor_count (number) VALUES (${number})`
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.send(`${number} inserted into table`)
        });
    })
    span.end();
})
let port = process.env.port || 4003;
app.listen(port)

console.log(`listening on port ${port} `)

