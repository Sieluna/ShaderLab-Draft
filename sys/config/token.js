const crypto = require("crypto");

module.exports = {
    key: process.env.TOKEN_KEY || crypto.randomBytes(64).toString("hex"),
    algorithm: ["HS256"]
}