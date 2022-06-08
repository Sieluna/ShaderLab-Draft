const devMode = process.env.NODE_ENV != "production";

const bindRoutes = app => {
    app.use("/api/user", require("./routes/user.js"));
    app.use("/api/topic", require("./routes/topic.js"));
    app.use("/api/tag", require("./routes/tag.js"));
    app.use("/api/post", require("./routes/post.js"));
    app.use("/api/search", require("./routes/search.js"));
}

module.exports = devMode ? bindRoutes : port => {
    const cluster = require("node:cluster");

    if (cluster.isSpawn) {

        const express = require("express");
        const compression = require("compression");

        const app = express();

        app.use(compression());
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));

        bindRoutes(app);

        app.listen(port);

    }
};
