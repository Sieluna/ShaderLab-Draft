const app = require("../app.js");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sequelize = require("../handle/model");

const debug = require("../config/debug.js");
const userHandle = require("../handle/user.js");
const topicHandle = require("../handle/topic.js");
const postHandle = require("../handle/post.js");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Search APIs", () => {
    let code = true;
    before("Database create", () => sequelize.sync({force: true}).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    before("Create init", async () =>{
        for (let i = 1; i < 10; i++) {
            await userHandle.register("PostNameTest" + i, "PostTestPSW");
            await topicHandle.create("TopicNameTest" + i, "http://none", "This is Topic Name" + i);
        }
        await postHandle.create(1, 1, { name: "PostSearch", content: "Some random info" });
        await postHandle.create(1, 1, { name: "SearchPost", content: "Some random info" });
        await postHandle.tagPost("day", 1);
        await postHandle.tagPost("day", 2);
    });
    describe("Search router test", () => {
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/ea").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/se").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and users info", done => {
            chai.request(app).get("/api/search/user/tes").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/post/se").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/post/se").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/tag/day").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/topic/TopicNameTest1").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                debug.log("Search ", res.body);
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
