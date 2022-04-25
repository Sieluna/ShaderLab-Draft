const express = require("express");
const path = require("path");
const logger = require("morgan");

const indexRouter = require("./routes/index.js");
const userRouter = require("./routes/user.js");
const homeRouter = require("./routes/home.js");
const editorRouter = require("./routes/editor.js");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // return value: flase -> object|array. true -> any
app.use(express.static(path.join(__dirname, "static")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/home", homeRouter);
app.use("/editor", editorRouter);

// listen 3000 port
//app.listen(3000, () => console.log("Server is start running"));

module.exports = app;