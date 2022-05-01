const app = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sequelize = require("../handle/model");

const debug = require("../config/debug.js");

const expect = chai.expect;
chai.use(chaiHttp);

describe("User APIs", () => {
    let code = true;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("User router register test", () => {
        it("should return code 200, and user info", done => {
            chai.request(app).post("/api/user").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Register ", res.body);
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
                debug.log("Get All", res.body);
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
                debug.log(res.body);
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
                expect(res.status).to.equal(200, res.body);
                done();
            });
        });
    });
    // TODO: Admin
    describe("User update test", () => {
        it("should update", () => {
            // Yes!!!! I AM ADMIN
        });
    });
    describe("User update name test", () => {
        it("should update name", done => {
            chai.request(app).put("/api/user/name").
            send({ id: "1", name: "UpdateTest", password: "UpExpsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Update name", res.body);
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User update email test", () => {
        it("should update email", done => {
            chai.request(app).put("/api/user/email").
            send({ id: "1", email: "EmailTest@123.com" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Update email", res.body);
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User update password test", () => {
        it("should update password", done => {
            chai.request(app).put("/api/user/password").
            send({ id: "1", password: "psw23333" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Update password", res.body);
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User update introduction test", () => {
        it("should update introduction", done => {
            chai.request(app).put("/api/user/introduction").
            send({ id: "1", introduction: "546532154" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Update introduction", res.body);
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User delete test", () => {
        it("should mark user to be deprecate", done => {
            chai.request(app).delete("/api/user/abort/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Delete", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return error code 404", done => {
            chai.request(app).delete("/api/user/abort/114514").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                expect(res.status).to.equal(404);
                done();
            });
        });
    });
    describe("User restore test", () => {
        it("should mark user to be active", done => {
            chai.request(app).get("/api/user/restore/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return error code 404", done => {
            chai.request(app).get("/api/user/restore/114514").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                expect(res.status).to.equal(404);
                done();
            });
        });
    });
});
