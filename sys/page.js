const path = require("node:path");
const express = require("express");

const devMode = process.env.NODE_ENV != "production";

const bindResource = app => {
    app.use(express.static(path.join(__dirname, devMode ? "public" : "static")));

    app.engine("html", require("./config/engine.js"));
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "html");
}

module.exports = devMode ? bindResource : port => {
    const cluster = require("node:cluster");

    if (cluster.isSpawn) {

        const express = require("express");
        const morgan = require("morgan");
        const compression = require("compression");

        const logger = () => morgan(function format(tokens, req, res) {
            const status = (typeof res.headersSent != "boolean" ? Boolean(res._header) : res.headersSent) ? res.statusCode : undefined;
            const color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
            if (!format[color]) format[color] = morgan.compile(`    \x1b[90m>\x1b[0m :method :url \x1b[${color}m:status\x1b[0m :response-time ms - :res[content-length]`);
            return  format[color](tokens, req, res);
        });

        const app = express();

        app.use(logger());
        app.use(compression());

        bindResource(app);

        app.use("/", require("./routes/page.js"));

        app.listen(port);
    }
}
