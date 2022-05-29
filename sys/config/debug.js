const devMode = process.env.NODE_ENV != "production";

module.exports = {
    log: (...msg) => {
        if (devMode)
            console.log(...msg);
    }
}
