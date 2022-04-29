const jwt = require("jsonwebtoken");
const config = require("../config/token.js");

const getVerificationKey = typeof config.secret == "function" ? config.secret : () => config.secret;
const credentialsRequired = typeof config.credentialsRequired == "undefined" ? true : config.credentialsRequired;
const requestProperty = typeof config.requestProperty == "string" ? config.requestProperty : "auth";

module.exports = {
    /**
     * @param {object|number} id object or userid
     * @param {number} auth permission level
     * @param {string} opts addition json
     * @return {*}
     */
    sign: (id, auth, opts) => {
        return jwt.sign(typeof id == "object" ? id : { id: id, auth: auth, opts: opts }, config.secret, {
            algorithm: config.algorithm,
            expiresIn: 86400,
        });
    },
    verify: (req, res, next) => {
        let token, decodedToken;
        try {
            if (req.method === "OPTIONS" && "access-control-request-headers" in req.headers) {
                const hasAuthInAccessControl = req.headers["access-control-request-headers"].split(",").map(header => header.trim().toLowerCase()).includes("authorization");
                if (hasAuthInAccessControl) return next();
            }

            const authorizationHeader = req.headers && "Authorization" in req.headers ? "Authorization" : "authorization";
            if (config.getToken && typeof config.getToken == "function") {
                token = config.getToken(req);
            } else if (req.headers && req.headers[authorizationHeader]) {
                const parts = (req.headers[authorizationHeader]).split(' ');
                if (parts.length === 2) {
                    const scheme = parts[0];
                    const credentials = parts[1];
                    if (/^Bearer$/i.test(scheme))
                        token = credentials;
                    else
                        return credentialsRequired ? next({ code: "CREDENTIALS_BAD_SCHEME", status: 401, message: "Format is Authorization: Bearer [token]" }) : next();
                } else return next({ code: "CREDENTIALS_BAD_FORMAT", message: "Format is Authorization: Bearer [token]" });
            }

            if (!token) return credentialsRequired ? next({ code: "CREDENTIALS_REQUIRED", status: 401, message: "No authorization token was found" }) : next();

            try {
                decodedToken = jwt.decode(token, { complete: true });
            } catch (err) {
                return next({ code: "INVALID_TOKEN", status: 401, message: err.message, inner: err });
            }

            const key = getVerificationKey(req, decodedToken);
            try {
                jwt.verify(token, key, config);
            } catch (err) {
                return next({ code: "INVALID_TOKEN", status: 401, message: err.message, inner: err });
            }

            const isRevoked = config.isRevoked && config.isRevoked(req, decodedToken) || false;
            if (isRevoked) return next({ code: "REVOKED_TOKEN", status: 401, message: "The token has been revoked." });

            req[requestProperty] = decodedToken.payload;
            next();
        } catch (err) {
            return next(err);
        }
    }
};
