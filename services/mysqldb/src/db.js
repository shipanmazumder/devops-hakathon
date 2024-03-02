const mysql = require('mysql2');
const mysqlConfig = {
    host: "mysql_server",
    user: "shipan",
    password: "secret",
    database: "visit_feeds"
}

con = mysql.createConnection(mysqlConfig);

module.exports = con;