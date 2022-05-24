const express = require("express");
const path = require("path");
const logger = require("morgan");

const sequelize = require("./handle/model.js");

sequelize.sync({ force: true }).then(() => console.log("Database is synchronized."));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => res.render("index", { title: "Shader Lab" }));

app.use("/api/user", require("./routes/user.js"));
app.use("/api/topic", require("./routes/topic.js"));
app.use("/api/tag", require("./routes/tag.js"));
app.use("/api/post", require("./routes/post.js"));
app.use("/api/search", require("./routes/search.js"));

//app.use("/shader", require("./routes/shader.js"));

app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).send("Invalid token.");
    } else next(err);
});

setTimeout(() => {
    require("./config/inject.js")(500).then();
}, 2500)

module.exports = app;
