const app = require("../app.js");
const sequelize = require("../handle/model.js");
const chai = require("chai");
const express = require("express");
const compression = require("compression");
const path = require("node:path");

const expect = chai.expect;
chai.use(require("chai-http"));

describe("Page APIs", () => {
    const app = express();

    app.use(compression());
    app.use(express.static(path.join(__dirname, "../static")));

    app.engine("html", require("../config/engine.js"));
    app.set("views", path.join(__dirname, "../views"));
    app.set("view engine", "html");

    app.use("/", require("../routes/page.js"));

    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("Get home page", () => {
        it ("should return code 200, and html", done => {
            chai.request(app).get("/").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Get editor page", () => {
        it ("should return code 200, and html", done => {
            chai.request(app).get("/editor").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Get login page", () => {
        it ("should return code 200, and html", done => {
            chai.request(app).get("/login").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
