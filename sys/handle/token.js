const jwt = require("jsonwebtoken");
const config = require("../config/token.js");

module.exports = {
    /**
     * @param {object|number} id object or userid
     * @param {number} auth permission level
     * @param {number} expire expire time
     * @param {string} opts addition json
     * @return {*}
     */
    sign: (id, auth, opts = "", expire = 86400) => {
        return jwt.sign(typeof id == "object" ? id : {
            id: id,
            auth: auth,
            opts: opts
        }, config.secret, {
            algorithm: config.algorithm,
            expiresIn: expire,
        });
    },
    /**
     * Vertify token
     * @param req
     * @param res
     * @param next
     */
    verify: (req, res, next) => {
        let token, decodedToken;
        try {
            if (req.method === "OPTIONS" && "access-control-request-headers" in req.headers) {
                const hasAuthInAccessControl = req.headers["access-control-request-headers"].split(",").map(header => header.trim().toLowerCase()).includes("authorization");
                if (hasAuthInAccessControl) return next();
            }

            const authorizationHeader = req.headers && "Authorization" in req.headers ? "Authorization" : "authorization";
            if (req.headers && req.headers[authorizationHeader]) {
                const parts = (req.headers[authorizationHeader]).split(" ");
                if (parts.length === 2) {
                    const scheme = parts[0], credentials = parts[1];
                    if (/^Bearer$/i.test(scheme)) token = credentials;
                    else return next({ code: "CREDENTIALS_BAD_SCHEME", status: 401, message: "Format is Authorization: Bearer [token]" });
                } else return next({ code: "CREDENTIALS_BAD_FORMAT", status: 401, message: "Format is Authorization: Bearer [token]" });
            }

            if (!token)
                return next({ code: "CREDENTIALS_REQUIRED", status: 401, message: "No authorization token was found" });

            try {
                decodedToken = jwt.decode(token, { complete: true });
            } catch (err) {
                return next({ code: "INVALID_TOKEN", status: 401, message: err.message, inner: err });
            }

            const getVerificationKey = typeof config.secret == "function" ? config.secret : () => config.secret;
            try {
                jwt.verify(token, getVerificationKey(req, decodedToken), config);
            } catch (err) {
                return next({ code: "INVALID_TOKEN", status: 401, message: err.message, inner: err });
            }

            req["auth"] = decodedToken.payload;
            next();
        } catch (err) {
            return next(err);
        }
    }
};
