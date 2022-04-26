const app = require("../app.js")
const chai = require("chai");
const chaiHttp = require("chai-http");

const expect = chai.expect;
chai.use(chaiHttp);

describe("User APIs", () => {
    describe("User router register test", () => {
        it("should return code 200, and user info", done => {
            chai.request(app).post("/api/user/register").
            send({ user_account: "RouterTest", user_password: "Expsw" }).
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router get All test", () => {
        it("should return code 200, and user infos", done => {
            chai.request(app).post("/api/user/getAll").
            send().
            set("content-type", "application/x-www-form-urlencoded").
            end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
    describe("User router login test", () => {
        it("should return code 200, user info", done => {
            chai.request(app).post("/user/login").
                send({ user_account: "RouterTest", user_password: "Expsw" }).
                set("content-type", "application/x-www-form-urlencoded").
                end((err, res) => {
                    expect(res.status).to.equal(200);
                    done();
                });
        })
    })
});