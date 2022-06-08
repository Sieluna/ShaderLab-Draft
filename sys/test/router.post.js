const app = require("../app.js");
const sequelize = require("../handle/model.js");
const chai = require("chai");

const expect = chai.expect;
chai.use(require("chai-http"));

describe("Post APIs", () => {
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
    describe("Post router create test", () => {
        it ("should return code 200, and user info", done => {
            chai.request(app).post("/api/post").
            set("Authorization", "Bearer " + token).
            attach("preview", "sys/public/img/default.png").
            field({ topic: "PostTopicTest", name: "PostTest", content: "123456789" }).
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Post router get post test", () => {
        it ("should return code 200, and lots of posts", done => {
            chai.request(app).get("/api/post").
            set("Authorization", "Bearer " + token).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Post router get post recommend test", () => {
        it ("should return code 200, and 8 posts", done => {
            chai.request(app).get("/api/post/recommend").
            set("Authorization", "Bearer " + token).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
