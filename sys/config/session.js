module.exports = {
    storeOption: {
        expirationInterval: 15 * 60 * 1000,      // The interval at which to cleanup expired sessions.
        expiration: 24 * 60 * 60 * 1000,         // The maximum age (in milliseconds) of a valid session. Used when cookie.expires is not set.
    },
    sessionOption: {
        secret: "SHADERLAB_SESSION_KEY",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }
}
