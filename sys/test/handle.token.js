const jwt = require("jsonwebtoken");
const expressToken = require("../handle/token.js");
const expect = require("chai").expect;

describe("Token test", () => {
    let req, res, secret = "shhhhhh";
    beforeEach(() => { req = {}; res = {}; });
    describe("failure tests", () => {
        it("support unless skip", done => {
            req.originalUrl = "/index.html";
            expressToken({ secret: "shhhh", algorithms: ["HS256"] }).unless({ path: "/index.html" })(req, res, err => {
                expect(!err).to.be.ok;
                done();
            });
        });
        it("should skip on CORS preflight", done => {
            const corsReq = {};
            corsReq.method = "OPTIONS";
            corsReq.headers = { "access-control-request-headers": "sasa, sras,  authorization" };
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(corsReq, res, err => {
                expect(!err).to.be.ok;
                done();
            });
        });
        it("should throw if authorization header is malformed", done => {
            req.headers = {};
            req.headers.authorization = "wrong";
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("credentials_bad_format");
                done();
            });
        });
        it("should throw if authorization header is not Bearer", () => {
            req.headers = {};
            req.headers.authorization = "Basic foobar";
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("credentials_bad_scheme");
            });
        });
        it('should next if authorization header is not Bearer and credentialsRequired is false', done => {
            req.headers = {};
            req.headers.authorization = "Basic foobar";
            expressToken({ secret: "shhhh", algorithms: ["HS256"], credentialsRequired: false })(req, res, err => {
                expect(typeof err === "undefined").to.be.ok;
                done();
            });
        });
        it("should throw if authorization header is not well-formatted jwt", done => {
            req.headers = {};
            req.headers.authorization = "Bearer wrongjwt";
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                done();
            });
        });
        it("should throw if jwt is an invalid json", done => {
            req.headers = {};
            req.headers.authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yJ1c2VybmFtZSI6InNhZ3VpYXIiLCJpYXQiOjE0NzEwMTg2MzUsImV4cCI6MTQ3MzYxMDYzNX0.foo";
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                done();
            });
        });
        it("should throw if authorization header is not valid jwt", done => {
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "different-shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("invalid signature");
                done()
            });
        });
        it("should throw if audience is not expected", done => {
            const token = jwt.sign({ foo: "bar", aud: "expected-audience" }, secret, { expiresIn: 500 });
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "shhhhhh", algorithms: ["HS256"], audience: "not-expected-audience" })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("jwt audience invalid. expected: not-expected-audience");
                done();
            });
        });
        it("should throw if token is expired", done => {
            const token = jwt.sign({ foo: "bar", exp: 1382412921 }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "shhhhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.inner.name).to.be.equal("TokenExpiredError");
                expect(err.message).to.be.equal("jwt expired");
                done();
            });
        });
        it("should throw if token issuer is wrong", done => {
            const token = jwt.sign({ foo: "bar", iss: "http://foo" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "shhhhhh", algorithms: ["HS256"], issuer: "http://wrong" })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("jwt issuer invalid. expected: http://wrong");
                done();
            });
        });
        it("should throw error when signature is wrong", done => {
            const tempsecret = "shhh";
            const token = jwt.sign({ foo: "bar", iss: "http://www" }, tempsecret);
            const newContent = Buffer.from("{foo: 'bar', edg: 'ar'}").toString("base64");
            const splitetToken = token.split(".");
            splitetToken[1] = newContent;
            const newToken = splitetToken.join(".");
            req.headers = [];
            req.headers.authorization = "Bearer " + newToken;
            expressToken({ secret: tempsecret, algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("invalid token");
                done();
            });
        });
        it("should throw error if token is expired even with when credentials are not required", done => {
            const token = jwt.sign({ foo: "bar", exp: 1382412921 }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: secret, credentialsRequired: false, algorithms: ["HS256"] })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("jwt expired");
                done();
            });
        });
        it("should throw error if token is invalid even with when credentials are not required", done => {
            const secret = 'shhhhhh';
            const token = jwt.sign({ foo: "bar", exp: 1382412921 }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "not the secret", algorithms: ["HS256"], credentialsRequired: false })(req, res, err => {
                console.log(err);
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("invalid_token");
                expect(err.message).to.be.equal("invalid signature");
                done();
            });
        });
    });
    describe("work tests", () => {
        it("should work if authorization header is valid jwt", done => {
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: secret, algorithms: ["HS256"] })(req, res, () => {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should work if authorization header is valid with a buffer secret", done => {
            const secret = Buffer.from("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "base64");
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: secret, algorithms: ["HS256"] })(req, res, function () {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should work if Authorization header is capitalized (lambda environment)", done => {
            const secret = Buffer.from("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "base64");
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.headers.Authorization = "Bearer " + token;
            expressToken({ secret: secret, algorithms: ["HS256"] })(req, res, err => {
                if (err) { return done(err); }
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should work if no authorization header and credentials are not required", done => {
            expressToken({ secret: "shhhh", algorithms: ["HS256"], credentialsRequired: false })(req, res, done);
        });
        it("should not work if no authorization header", done => {
            expressToken({ secret: "shhhh", algorithms: ["HS256"] })(req, res, err => {
                expect(typeof err !== "undefined").to.be.ok;
                done();
            });
        });
        it("should produce a stack trace that includes the failure reason", done => {
            const token = jwt.sign({ foo: "bar" }, "secretA");
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: "secretB", algorithms: ["HS256"] })(req, res, err => {
                const index = err.stack.indexOf("UnauthorizedError: invalid signature")
                expect(index).to.be.equal(0);
                done();
            });
        });
        it("should work with a custom getToken function", done => {
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.query = {};
            req.query.token = token;
            function getTokenFromQuery(req) { return req.query.token; }
            expressToken({
                secret: secret,
                algorithms: ["HS256"],
                getToken: getTokenFromQuery
            })(req, res, () => {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should work with an async getToken function", done => {
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.query = {};
            req.query.token = token;
            function getTokenFromQuery(req) { return Promise.resolve(req.query.token); }
            expressToken({
                secret: secret,
                algorithms: ["HS256"],
                getToken: getTokenFromQuery
            })(req, res, () => {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should work with a secretCallback function that accepts header argument", done => {
            const getSecret = async (req, token) => {
                expect(token.header.alg).to.be.equal("HS256");
                expect(token.payload.foo).to.be.equal("bar");
                return secret;
            };
            const token = jwt.sign({ foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: getSecret, algorithms: ["HS256"] })(req, res, () => {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
    });
    describe("Revoked jwts test", () => {
        const revoked_id = "1234";
        const middleware = expressToken({
            secret: secret,
            algorithms: ["HS256"],
            isRevoked: async (req, token) => typeof token.payload !== "string" && token.payload.jti === revoked_id
        });
        it("should throw if token is revoked", () => {
            const token = jwt.sign({ jti: revoked_id, foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            middleware(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("revoked_token");
                expect(err.message).to.be.equal("The token has been revoked.");
            });
        });
        it("should work if token is not revoked", () => {
            const token = jwt.sign({ jti: "1233", foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            middleware(req, res, () => expect(req.auth.foo).to.be.equal("bar"));
        });
        it("should throw if error occurs checking if token is revoked", done => {
            const token = jwt.sign({ jti: revoked_id, foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({
                secret: secret,
                algorithms: ["HS256"],
                isRevoked: async () => { throw new Error("An error ocurred"); }
            })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.message).to.be.equal("An error ocurred")
                done();
            });
        });
    });
    describe("String tokens test", () => {
        it("should work with a valid string token", done => {
            const token = jwt.sign("foo", secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({ secret: secret, algorithms: ["HS256"] })(req, res, () => {
                expect(req.auth).to.be.equal("foo");
                done();
            });
        });
    });
    describe("multitenancy", () => {
        const tenants = { "a": { secret: "secret-a" }};
        const secretCallback = (req, token) => {
            const issuer = (token.payload).iss;
            if (tenants[issuer]) return tenants[issuer].secret;
            throw new Error("Could not find secret for issuer.");
        };
        const middleware = expressToken({ secret: secretCallback, algorithms: ["HS256"] });
        it("should retrieve secret using callback", done => {
            const token = jwt.sign({ foo: "bar" }, tenants.a.secret, { issuer: "a" });
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            middleware(req, res, () => {
                expect(req.auth.foo).to.be.equal("bar");
                done();
            });
        });
        it("should throw if an error ocurred when retrieving the token", done => {
            const token = jwt.sign({ iss: "inexistent", foo: "bar" }, secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            middleware(req, res, err => {
                expect(err).to.be.ok;
                expect(err.message).to.be.equal("Could not find secret for issuer.");
                done();
            });
        });
        it("should fail if token is revoked", done => {
            const token = jwt.sign({ iss: "a", foo: "bar" }, tenants.a.secret);
            req.headers = {};
            req.headers.authorization = "Bearer " + token;
            expressToken({
                secret: secretCallback,
                algorithms: ["HS256"],
                isRevoked: async () => true
            })(req, res, err => {
                expect(err).to.be.ok;
                expect(err.code).to.be.equal("revoked_token");
                expect(err.message).to.be.equal("The token has been revoked.");
                done();
            });
        });
    });
});