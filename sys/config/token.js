module.exports = {
    secret: process.env.TOKEN_KEY || "SHADERLAB_JSONWEBTOKEN_KEY",
    algorithm: "HS256",
    getToken: null,
    /* A function to verify if a token is revoked. */
    //isRevoked: async (req, token, next) => {
    //    const issuer = token.payload.iss;
    //    const tokenId = token.payload.jti;
    //},
    /* name of the property in the request object where the payload is set. */
    requestProperty: null
}
