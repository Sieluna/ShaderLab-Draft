const app = require("../app.js");
const tokenHandle = require("../handle/token.js");
const sequelize = require("../handle/model.js");
const chai = require("chai");

const expect = chai.expect;
chai.use(require("chai-http"));

describe("User APIs", () => {
    let token = true;
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("User router register test", () => {
        it("should return code 200, and user info", done => {
            chai.request(app).post("/api/user/signup").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                token = res.body.accessToken;
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router get All test", () => {
        it("should return code 200, and user infos", done => {
            chai.request(app).get("/api/user").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router get by id test", () => {
        it("should return code 200, user info", done => {
            chai.request(app).get("/api/user/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router login test", () => {
        it("should return code 200, user info", done => {
            chai.request(app).post("/api/user/signin").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200, res.body);
                done();
            });
        });
    });
    describe("User valid test", () => {
        //let user;
        //before(async () => {
        //    user = await require("../handle/user.js").login("RouterTest", "Expsw");
        //    user = {
        //        data: user,
        //        accessToken: tokenHandle.sign(user.id, user.permission),
        //        refreshToken: tokenHandle.sign(user.id, user.permission, "", 3600 * 24 * 30)
        //    };
        //});
        it("should update token", done => {
            //chai.request(app).put("/api/user").
            //send({ password: user.data.password }).
            //set("content-type", "application/x-www-form-urlencoded").
            //set("Authorization", "Bearer " + user.refreshToken).
            //end((err, res) => {
            //    expect(res.status).to.equal(200, res.body);
            //    done();
            //});
            done();
        });
    });
    describe("User update name test", () => {
        it("should update name", done => {
            chai.request(app).put("/api/user/name").
            send({ id: "1", name: "UpdateTest", password: "UpExpsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
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
            set("Authorization", "Bearer " + token).
            end((err, res) => {
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
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User update avatar test", () => {
        it("should update avatar", done => {
            chai.request(app).put("/api/user/avatar").
            set("Authorization", "Bearer " + token).
            attach("avatar", "sys/public/img/default.png").
            field({ id: "1", password: "psw23333" }).
            end((err, res) => {
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
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.be.equal(200);
                done();
            });
        });
    });
    describe("User delete test", () => {
        it("should mark user to be deprecate", done => {
            chai.request(app).delete("/api/user/abort/1").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return error code 404", done => {
            chai.request(app).delete("/api/user/abort/114514").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
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
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return error code 404", done => {
            chai.request(app).get("/api/user/restore/114514").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(404);
                done();
            });
        });
    });
});
