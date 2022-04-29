module.exports = {
    secret: process.env.TOKEN_KEY || "SHADERLAB_JSONWEBTOKEN_KEY",
    algorithm: "HS256"
}
