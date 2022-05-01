const { sign, verify } = require("../handle/token.js");
const expect = require("chai").expect;

describe("Token test", () => {
    let req, res;
    beforeEach(() => { req = {}; res = {}; });
    it("should sign with one argument", () => {
        expect(sign({id: "22", other: "22", test: ""})).to.be.ok;
        expect(sign("22", "22", "")).to.be.ok;
    });
    it("should work with a valid string token", done => {
        const token = sign({ name: "foo" });
        req.headers = {};
        req.headers.authorization = "Bearer " + token;
        verify(req, res, err => {
            expect(req.auth.name).to.be.equal("foo");
            done();
        });
    });
    it("should skip on CORS preflight", done => {
        const corsReq = {};
        corsReq.method = "OPTIONS";
        corsReq.headers = { "access-control-request-headers": "sasa, sras,  authorization" };
        verify(corsReq, res, err => {
            expect(!err).to.be.ok;
            done();
        });
    });
    it("should throw if authorization header is malformed", done => {
        req.headers = {};
        req.headers.authorization = "wrong";
        verify(req, res, err => {
            expect(err).to.be.ok;
            expect(err.code).to.be.equal("CREDENTIALS_BAD_FORMAT");
            done();
        });
    });
    it("should throw if authorization header is not Bearer", () => {
        req.headers = {};
        req.headers.authorization = "Basic foobar";
        verify(req, res, err => {
            expect(err).to.be.ok;
            expect(err.code).to.be.equal("CREDENTIALS_BAD_SCHEME");
        });
    });
    it("should throw if authorization header is not well-formatted jwt", done => {
        req.headers = {};
        req.headers.authorization = "Bearer wrongjwt";
        verify(req, res, err => {
            expect(err).to.be.ok;
            expect(err.code).to.be.equal("INVALID_TOKEN");
            done();
        });
    });
    it("should throw if jwt is an invalid json", done => {
        req.headers = {};
        req.headers.authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo";
        verify(req, res, err => {
            expect(err).to.be.ok;
            expect(err.code).to.be.equal("INVALID_TOKEN");
            done();
        });
    });
});
