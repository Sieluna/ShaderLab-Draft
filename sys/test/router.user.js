const app = require("../app.js")
const chai = require("chai");
const chaiHttp = require("chai-http");
const sequelize = require("../handle/model");

const expect = chai.expect;
chai.use(chaiHttp);

describe("User APIs", () => {
    let code = true;
    before(() => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after(async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("User router register test", () => {
        it("should return code 200, and user info", done => {
            chai.request(app).post("/api/user").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                console.log("register", res.body);
                code = res.body.token;
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router get All test", () => {
        it("should return code 200, and user infos", done => {
            chai.request(app).get("/api/user").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                console.log("get all", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router get by id test", () => {
        it("should return code 200, user info", done => {
            chai.request(app).get("/api/user/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                console.log("get by id", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router login test", () => {
        it("should return code 200, user info", done => {
            chai.request(app).post("/api/user/login").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                console.log("login", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User delete test", () => {
        it("should mark user to be deprecate", done => {
            chai.request(app).delete("/api/user/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                console.log("delete", res);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return error code 404", done => {
            chai.request(app).delete("/api/user/114514").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                console.log("delete", res);
                expect(res.status).to.equal(404);
                done();
            });
        });
    });
});
