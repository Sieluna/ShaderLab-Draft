const expressUnless = require("express-unless");
const jwt = require("jsonwebtoken");

class UnauthorizedError extends Error {
    constructor(code, error) {
        super(error.message);
        this.code = code;
        this.status = 401;
        this.name = "UnauthorizedError";
        this.inner = error;
    }
}

/**
 * @param {any} options.secret
 * @param {any} options.algorithms
 * @param {any} [options.getToken]
 * @param {any} [options.isRevoked]
 * @param {any} [options.credentialsRequired]
 * @param {any} [options.requestProperty]
 */
module.exports = options => {
    if (!options.secret || !options.algorithms || !Array.isArray(options.algorithms)) return;

    const getVerificationKey = typeof options.secret == "function" ? options.secret : async () => options.secret;
    const credentialsRequired = typeof options.credentialsRequired == "undefined" ? true : options.credentialsRequired;
    const requestProperty = typeof options.requestProperty == "string" ? options.requestProperty : "auth";

    const middleware = async (req, res, next) => {
        let token, decodedToken;
        try {
            if (req.method === "OPTIONS" && "access-control-request-headers" in req.headers) {
                const hasAuthInAccessControl = req.headers["access-control-request-headers"].split(",").map(header => header.trim().toLowerCase()).includes("authorization");
                if (hasAuthInAccessControl)
                    return next();
            }

            const authorizationHeader = req.headers && "Authorization" in req.headers ? "Authorization" : "authorization";
            if (options.getToken && typeof options.getToken === "function") {
                token = await options.getToken(req);
            } else if (req.headers && req.headers[authorizationHeader]) {
                const parts = (req.headers[authorizationHeader]).split(' ');
                if (parts.length === 2) {
                    const scheme = parts[0];
                    const credentials = parts[1];
                    if (/^Bearer$/i.test(scheme))
                        token = credentials;
                    else {
                        if (credentialsRequired)
                            throw new UnauthorizedError("credentials_bad_scheme", { message: "Format is Authorization: Bearer [token]" });
                        else
                            return next();
                    }
                } else throw new UnauthorizedError("credentials_bad_format", { message: "Format is Authorization: Bearer [token]" });
            }

            if (!token) {
                if (credentialsRequired)
                    throw new UnauthorizedError("credentials_required", { message: "No authorization token was found" });
                else
                    return next();
            }

            try {
                decodedToken = jwt.decode(token, { complete: true });
            } catch (err) {
                throw new UnauthorizedError("invalid_token", err);
            }

            const key = await getVerificationKey(req, decodedToken);

            try {
                jwt.verify(token, key, options);
            } catch (err) {
                throw new UnauthorizedError("invalid_token", err);
            }

            const isRevoked = options.isRevoked && await options.isRevoked(req, decodedToken) || false;
            if (isRevoked) throw new UnauthorizedError("revoked_token", { message: "The token has been revoked." });

            req[requestProperty] = decodedToken.payload;
            next();
        } catch (err) {
            return next(err);
        }
    }
    middleware.unless = expressUnless;
    return middleware;
}