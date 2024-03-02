const { errorResponse } = require("../util/ResponseUtil");
// const db = require("../db");
const mysql = require('mysql2');
const mysqlConfig = {
    host: "mysql_server",
    user: "shipan",
    password: "secret",
    database: "visit_feeds"
}



module.exports = class FeedVisit {
    constructor(userId, feedId, visitTime) {
        this.userId = userId;
        this.feedId = feedId;
        this.visitTime = visitTime;
    }
    createConnection() {
        this.con = mysql.createConnection(mysqlConfig);
    }
    save() {
        if (this.con == null)
            this.createConnection
        this.con.connect(function (err) {
            if (err) throw err;
            const sql = `INSERT INTO products (userId,feedId,visitTime) VALUES(${this.userId},${this.feedId},${this.visitTime})`
            this.con.query(sql, function (err, result) {
                if (err) {
                    // let data = {
                    //     code: 404,
                    //     message: "No Feeds Found",
                    //     data: err.message,
                    // };
                    return errorResponse(err)
                }
                let result2 = {
                    code: 200,
                    message: "Feed Visit Insert",
                    data: result,
                };
                return result2;
            });
        })
    }
    static fetchAll() {
        if (this.con == null)
            this.createConnection
        this.con.connect(function (err) {
            if (err) throw errorResponse(err);
            const sql = `SELECT * FROM products`
            this.con.query(sql, function (err, result2, fields) {
                if (err) return errorResponse(err);
                let result3 = {
                    code: 200,
                    message: "Feed Visit Insert",
                    data: result2,
                };
                return result3;
            });
        });
    }
    static findProductById(id) {
        return db.execute("SELECT * FROM products WHERE id=?",
            [id]);
    }
    static deleteProduct(id) {

    }
}