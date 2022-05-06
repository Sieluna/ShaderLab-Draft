const app = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sequelize = require("../handle/model");

const debug = require("../config/debug.js");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Post APIs", () => {
    let code = true;
    before("Database create", () => sequelize.sync({force: true}).then(() => sequelize.authenticate().catch(error => code = error)));
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
    describe("Post router create test", () => {
        it ("should return code 200, and user info", done => {
            chai.request(app).post("/api/post").
            set("Authorization", "Bearer " + code).
            attach("preview", "sys/public/img/home/sponza.jpg").
            field({ topic: "PostTopicTest", name: "PostTest", content: "123456789" }).
            end((err, res) => {
                debug.log("Create ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Post router get post test", () => {
        it ("should return code 200, and lots of posts", done => {
            chai.request(app).get("/api/post").
            set("Authorization", "Bearer " + code).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Get all ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Post router get post recommend test", () => {
        it ("should return code 200, and 8 posts", done => {
            chai.request(app).get("/api/post/recommend").
            set("Authorization", "Bearer " + code).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Get Recommends ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
