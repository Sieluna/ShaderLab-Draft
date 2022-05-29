const app = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sequelize = require("../handle/model");

const debug = require("../config/debug.js");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Topic APIs", () => {
    let code = true;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("User router create", () => {
        it ("should return code 200, and user info", done => {
            chai.request(app).post("/api/user").
            send({ account: "RouterTest", password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Register ", res.body);
                code = res.body.accessToken;
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Topic router create test", () => {
        it("should return code 200, and topic infos", done => {
            chai.request(app).post("/api/topic").
            set("Authorization", "Bearer " + code).
            attach("icon", "sys/public/img/default.png").
            field({ name: "TestTopic", description: "Description of topic" }).
            end((err, res) => {
                debug.log("Get All", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and topic infos", done => {
            chai.request(app).post("/api/topic").
            send({ name: "TesttopicName" }).
            set("Authorization", "Bearer " + code).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Get All", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Topic router get All test", () => {
        it("should return code 200, and topic infos", done => {
            chai.request(app).get("/api/topic").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log("Get All", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Topic router get by id test", () => {
        it("should return code 200, topic info", done => {
            chai.request(app).put("/api/topic/image/1").
            set("Authorization", "Bearer " + code).
            attach("icon", "sys/public/img/default.png").
            end((err, res) => {
                debug.log(res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, topic info", done => {
            chai.request(app).put("/api/topic/description/1").
            send({ description: "123456789123456789123456789123456789" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + code).
            end((err, res) => {
                debug.log(res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
