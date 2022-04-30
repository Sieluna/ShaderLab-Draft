const mysql = require("mysql2");

const config = require("../config/sql.js")

const pool = mysql.createPool(config);

module.exports = (sql, sqlParams) => {
    sqlParams = sqlParams || [];

    return new Promise((resolve, reject) => {
        pool.getConnection((error, conn) => {
            if (!error) {
                conn.query(sql, sqlParams, (err, res) => {
                    if (!err) {
                        console.log("[sql] query success : thread", conn.threadId);
                        resolve(res);
                    } else {
                        console.log("[sql] query fail : code", err.sqlMessage, err.errno, "thread", conn.threadId);
                        reject(err);
                    }
                    conn.release();
                });
            } else {
                console.log("[sql] Connection", error);
                reject(error);
            }
        });
    }).catch(error => error.errno);
}