const app = require("../app.js");
const sequelize = require("../handle/model.js");
const chai = require("chai");

const expect = chai.expect;
chai.use(require("chai-http"));

describe("Search APIs", () => {
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    before(async () => require("../config/inject.js")());
    describe("Search router test", () => {
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/po").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/pp").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Search user test", () => {
        it("should return code 200, and users info", done => {
            chai.request(app).get("/api/search/user/tes").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Search post test", () => {
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/post/se").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Search tag test", () => {
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/tag/day").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("Search topic test", () => {
        it("should return code 200, and post info", done => {
            chai.request(app).get("/api/search/topic/DefaultTopic1").
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    })
});
