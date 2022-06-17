// An example test of express function.

const express = require("express");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-http"));

const app = express();

describe("A test with next function", () => {
    let a, b, c;
    beforeEach(() => {
        a = undefined;
        b = undefined;
        c = undefined;
    });
    describe("separate functions", () => {
        before(() => {
            app.get("/test1", (req, res, next)  => { a = true; return next(); });
            app.get("/test1", (req, res, next)  => { b = true; return next(); });
            app.get("/test1", (req, res, next)  => { c = true; return next(); });
        });
        it("should return three true", done => {
            chai.request(app).get("/test1").
            end((err, res) => {
                expect(a).to.be.true;
                expect(b).to.be.true;
                expect(c).to.be.true;
                done();
            });
        })
    });
    describe("chain functions", () => {
        before(() => {
            app.get("/test2", (req, res, next)  => { a = true; return next(); },
                              (req, res, next)  => { b = true; return next(); },
                              (req, res, next)  => { c = true; return next(); });
        });
        it("should return three true", done => {
            chai.request(app).get("/test2").
            end((err, res) => {
                expect(a).to.be.true;
                expect(b).to.be.true;
                expect(c).to.be.true;
                done();
            });
        })
    });
    describe("handle next message", () => {
        before(() => {
            app.get("/test3", (req, res, next)  => { a = true; return next({ flag: true }); },
                              (req, res, next)  => { b = true; return next("balabala"); }, /* Skipped */
                              (err, req, res, next)  => { c = err.flag; return next(); }); /* handle error */
        });
        it("should return two true", done => {
            chai.request(app).get("/test3").
            end((err, res) => {
                expect(a).to.be.true;
                expect(b).to.be.undefined;
                expect(c).to.be.true;
                done();
            });
        })
    });
    describe("handle multi next message", () => {
        before(() => {
            app.get("/test4", (req, res, next)  => { a = true; return next({ flag: true }); },
                              (req, res, next)  => { console.log("hahaha"); return next(new Error("skipped")); }, /* Skipped */
                              (err, req, res, next)  => { b = err.flag; return next(); }, /* Handle error above*/
                              (req, res, next)  => { return next({ flag: true }); }, /* New routes */
                              (err, req, res, next) => { c = err.flag; return next(); }); /* no next could not close pipe */
        });
        it("should return three true", done => {
            chai.request(app).get("/test4").
            end((err, res) => {
                expect(a).to.be.true;
                expect(b).to.be.true;
                expect(c).to.be.true;
                done();
            });
        })
    });
    describe("handle multi next message with multi error", () => {
        before(() => {
            app.get("/test4", (req, res, next)  => { a = true; return next({ flag: true }); },
                (req, res, next)  => { console.log("hahaha"); return next(new Error("skipped")); }, /* Skipped */
                (err, req, res, next)  => { b = err.flag; return next({ flag: true }); }, /* Handle error above*/
                (req, res, next)  => { console.log("hahaha"); return next(new Error("skipped")); }, /* Skipped */
                (err, req, res, next) => { c = err.flag; return next(); }); /* no next could not close pipe */
        });
        it("should return three true", done => {
            chai.request(app).get("/test4").
            end((err, res) => {
                expect(a).to.be.true;
                expect(b).to.be.true;
                expect(c).to.be.true;
                done();
            });
        })
    });
});
