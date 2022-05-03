const express = require("express");
const path = require("path");
const logger = require("morgan");

const sequelize = require("./handle/model.js");

sequelize.sync({ force: true }).then(() => {
    require("./config/debug.js").log("Database is synchronized.");
});

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => res.render("index", { title: "Shader Lab" }));

app.use("/api/user", require("./routes/user.js"));
app.use("/api/topic", require("./routes/topic.js"));
app.use("/api/post", require("./routes/post.js"));

module.exports = app;
