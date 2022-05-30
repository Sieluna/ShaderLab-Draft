const express = require("express");
const path = require("path");
const logger = require("morgan");
const compression = require("compression");

const sequelize = require("./handle/model.js");
const { styles, colors } = require("./config/style.js");
const engine = require("./config/engine.js");

sequelize.sync({ force: true }).then(() => console.log(`> ${styles.bold(colors.yellow("[Info]"))} Database is synchronized`));

const devMode = process.env.NODE_ENV != "production";

console.log(`> ${styles.bold(colors.yellow("[Info]"))} Mode ${devMode ? "development" : "production"}`);

const app = express();

app.engine("html", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, devMode ? "public" : "static")));

if (!devMode) app.use("/", require("./routes/page.js"));

app.use("/api/user", require("./routes/user.js"));
app.use("/api/topic", require("./routes/topic.js"));
app.use("/api/tag", require("./routes/tag.js"));
app.use("/api/post", require("./routes/post.js"));
app.use("/api/search", require("./routes/search.js"));

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).send("Invalid token.");
    } else next(err);
});

setTimeout(() => require("./config/inject.js")(500, true).then(), 2500);

module.exports = app;
