const app = require("../app.js");
const sequelize = require("../handle/model.js");
const chai = require("chai");

const expect = chai.expect;
chai.use(require("chai-http"));

describe("Topic APIs", () => {
    let token = true;
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("User router create", () => {
        it ("should return code 200, and user info", done => {
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
    describe("Topic router create test", () => {
        it("should return code 200, and topic infos", done => {
            chai.request(app).post("/api/topic").
            set("Authorization", "Bearer " + token).
            attach("icon", "sys/public/img/default.png").
            field({ name: "TestTopic", description: "Description of topic" }).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and topic infos", done => {
            chai.request(app).post("/api/topic").
            send({ name: "TesttopicName" }).
            set("Authorization", "Bearer " + token).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Topic router get All test", () => {
        it("should return code 200, and topic infos", done => {
            chai.request(app).get("/api/topic").
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Topic router get by id test", () => {
        it("should return code 200, topic info with image", done => {
            chai.request(app).put("/api/topic/image/1").
            set("Authorization", "Bearer " + token).
            attach("icon", "sys/public/img/default.png").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, topic info with description", done => {
            chai.request(app).put("/api/topic/description/1").
            send({ description: "123456789123456789123456789123456789" }).
            set("content-type", "application/x-www-form-urlencoded").
            set("Authorization", "Bearer " + token).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
