const jwt = require("jsonwebtoken");
const config = require("../config/token.js");
const Error = require("./fallback/authorize.js")("Token");

module.exports = {
    /**
     * Generate token
     * @param {string} name token name
     * @param {object} data object
     * @param {number} expire expire time
     * @return {Promise<array>}
     */
    sign: (data, expire = 43200) => {
        return Promise.resolve(jwt.sign(data, config.secret, {
            algorithm: config.algorithm,
            expiresIn: expire,
        }));
    },
    /**
     * Verify token
     * @param {object} options
     */
    verify: (options = {}) => {
        options = { ...config, ...options };
        return async (req, res, next) => {
            if (req.method == "OPTIONS" && "access-control-request-headers" in req.headers)
                if (req.headers["access-control-request-headers"].split(",").map(header => header.trim().toLowerCase()).includes("authorization"))
                    return next();

            let token = options.resolveToken(req);

            if (!token) return next(new Error("No authorization token was found"));

            jwt.verify(token, options.secret, options, (err, decode) => {
                if (err) return next(new Error(`Invalid Token ${err.message}`));
                req[options.requestProperty] = decode;
                next();
            });
        }
    }
};
