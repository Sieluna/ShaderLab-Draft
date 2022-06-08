const { sign, verify } = require("../handle/token.js");
const expect = require("chai").expect;

describe("Token handle test", () => {
    let req, res;
    beforeEach(() => { req = {}; res = {}; });
    it("should sign with one argument", async () => {
        const token = await sign({ id: "22", other: "22", test: "" });
        expect(token).to.be.ok;
    });
    it("should work with a valid string token", async () => {
        const token = await sign({ name: "foo" });
        req.headers = {};
        req.headers.authorization = "Bearer " + token;
        verify()(req, res, err => {
            expect(req).to.have.property("auth");
            expect(req.auth).to.have.property("name");
            expect(req.auth.name).to.be.equal("foo");
        });
    });
    it("should throw if authorization header is malformed", done => {
        req.headers = {};
        req.headers.authorization = "wrong";
        verify()(req, res, err => {
            expect(err).to.be.ok;
            done();
        });
    });
    it("should throw if authorization header is not Bearer", () => {
        req.headers = {};
        req.headers.authorization = "Basic foobar";
        verify()(req, res, err => {
            console.log(err)
            expect(err).to.be.ok;
        });
    });
    it("should throw if authorization header is not well-formatted jwt", () => {
        req.headers = {};
        req.headers.authorization = "Bearer wrongjwt";
        verify()(req, res, err => {
            console.log(err)
        });
    });
    it("should throw if jwt is an invalid json", () => {
        req.headers = {};
        req.headers.authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo";
        verify()(req, res, err => {
            console.log(err)
        });
    });
});
