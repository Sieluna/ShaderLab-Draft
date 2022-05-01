const { isEmpty, isNumber, isEmail } = require("../handle/utils.js");
const expect = require("chai").expect;

describe("Utils test", () => {
    let mix  = "abcde12345",
        num = 12345,
        str = "12345",
        email = "121e12e12e@212312.com",
        undef = undefined,
        empty = "",
        none = null;
    describe("is Empty test", () => {
        it("undefined should return true", () => {
            expect(isEmpty(undef)).to.be.true;
        });
        it("null should return true", () => {
            expect(isEmpty(empty)).to.be.true;
        });
        it("null should return true", () => {
            expect(isEmpty(none)).to.be.true;
        });
        it("a string should return false", () => {
            expect(isEmpty(mix)).to.be.false;
        });
        it("a number should retunr false", () => {
            expect(isEmpty(num)).to.be.false;
        });
    });
    describe("is Email test", () => {
        it("undefined should return false", () => {
            expect(isEmail(undef)).to.be.false;
        });
        it("empty should return false", () => {
            expect(isEmail(empty)).to.be.false;
        });
        it("null should return false", () => {
            expect(isEmail(none)).to.be.false;
        });
        it("a random should return false", () => {
            expect(isEmail(mix)).to.be.false;
        });
        it("a number should retunr false", () => {
            expect(isEmail(num)).to.be.false;
        });
        it("a email should return true", () => {
            expect(isEmail(email)).to.be.true;
        });
    });
    describe("is Number test", () => {
        it("undefined should return false", () => {
            expect(isNumber(undef)).to.be.false;
        });
        it("empty should return false", () => {
            expect(isNumber(empty)).to.be.false;
        });
        it("null should return false", () => {
            expect(isNumber(none)).to.be.false;
        });
        it("a random should return false", () => {
            expect(isNumber(mix)).to.be.false;
        });
        it("a num should return true", () => {
            expect(isNumber(num)).to.be.true;
        });
        it("a num should return true", () => {
            expect(isNumber(str)).to.be.true;
        });
    });
});
