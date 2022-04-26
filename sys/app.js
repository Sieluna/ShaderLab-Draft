const express = require("express");
const path = require("path");
const logger = require("morgan");

const config = require("./config/token.js");
const jwt = require("./handle/token.js");

const routes = {
    user: require("./routes/user.js"),

}

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => res.render("index", { title: "Shader Lab" }));

app.use("/api", jwt({ secret: config.key, algorithms: config.algorithm }));

/**
 * join all path to a single with forward slash
 * @param {string} base
 * @param {string|array|""} other
 * @return {string}
 */
const join = (base, other) => typeof other === "string" ? path.posix.join(base, other) :
                              Array.isArray(other) ? path.posix.join(base, ...other) : base;
const asyncExc = handler => async (req, res, next) => { try { await handler(req, res); } catch (error) { next(error); }};

/** REST API makeup */
for (const [name, route] of Object.entries(routes)) {
    for (let key in route) {
        switch (route[key].method.toLowerCase()) {
            case "get":
                app.get(join(`/api/${name}`, route[key].params), asyncExc(route[key].lambda));
                break;
            case "post":
                app.post(join(`/api/${name}`, route[key].params), asyncExc(route[key].lambda));
                break;
            case "put":
                app.put(join(`/api/${name}`, route[key].params), asyncExc(route[key].lambda));
                break;
            case "delete":
                app.delete(join(`/api/${name}`, route[key].params), asyncExc(route[key].lambda));
                break;
        }
    }
}

module.exports = app;