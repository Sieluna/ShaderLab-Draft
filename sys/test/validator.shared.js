const { isEmpty, isString, isEmail, isNumber } = require("../handle/validator/rules.js");
const Validator = require("../handle/validator/shared.js");
const Exception = require("../handle/fallback/shared.js");
const expect = require("chai").expect;

describe("Validator test", () => {
    let mix  = "abcde12345",
        num = 12345,
        str = "12345",
        email = "121e12e12e@212312.com",
        undef = undefined,
        empty = "",
        none = null;
    describe("is Empty test", () => {
        it("undefined should return true", () => {
            const result = isEmpty(undef);
            expect(result).to.be.true;
        });
        it("null should return true", () => {
            const result = isEmpty(empty);
            expect(result).to.be.true;
        });
        it("null should return true", () => {
            const result = isEmpty(none);
            expect(result).to.be.true;
        });
        it("a string should return false", () => {
            const result = isEmpty(mix);
            expect(result).to.be.false;
        });
        it("a number should return false", () => {
            const result = isEmpty(num);
            expect(result).to.be.false;
        });
        it("a function should return false", () => {
            const result = isEmpty(() => {});
            expect(result).to.be.false;
        });
    });
    describe("is Email test", () => {
        // unsafe not support undefined, not string, null
        it("empty should return false", () => {
            const result = isEmail(empty);
            expect(result).to.be.false;
        });
        it("a random should return false", () => {
            const result = isEmail(mix);
            expect(result).to.be.false;
        });
        it("a email should return true", () => {
            const result = isEmail(email);
            expect(result).to.be.true;
        });
    });
    describe("is Number test", () => {
        it("undefined should return false", () => {
            const result = isNumber(undef);
            expect(result).to.be.false;
        });
        it("empty should return false", () => {
            const result = isNumber(empty);
            expect(result).to.be.false;
        });
        it("null should return false", () => {
            const result = isNumber(none);
            expect(result).to.be.false;
        });
        it("a random should return false", () => {
            const result = isNumber(mix);
            expect(result).to.be.false;
        });
        it("a num should return true", () => {
            const result = isNumber(num);
            expect(result).to.be.true;
        });
        it("a num should return true", () => {
            const result = isNumber(str);
            expect(result).to.be.true;
        });
    });
    describe("is Exist test", () => {
        let validator = new Validator();
        it("undefined should return false", () => {
            const result = validator.isExist(undef);
            expect(result).to.be.false;
        });
        it("null should return false", () => {
            const result = validator.isExist(empty);
            expect(result).to.be.false;
        });
        it("null should return false", () => {
            const result = validator.isExist(none)
            expect(result).to.be.false;
        });
        it("a string should return true", () => {
            const result = validator.isExist(mix)
            expect(result).to.be.true;
        });
        it("a number should return true", () => {
            const result = validator.isExist(num)
            expect(result).to.be.true;
        });
        it("a function should return true", () => {
            const result = validator.isExist(() => {});
            expect(result).to.be.true;
        });
    });
    describe("new validator", () => {
        let validator;
        it("should create a validator", () => {
            validator = new Validator();
            expect(validator).to.be.an.instanceof(Validator);
        });
        it("should check exist number", () => {
            const result = validator.check(num);
            expect(result).to.be.true;
        });
        it("should check not exist", () => {
            const result = validator.check(undef);
            expect(result).to.be.an.instanceof(Exception);
        });
        it("should add a rule", () => {
            validator.add(isEmpty, "This is empty", false);
            expect(validator.ruleCache).to.be.lengthOf(2);
        });
        it("should check not empty", () => {
            const notEmpty = validator.check(mix, num);
            expect(notEmpty).to.be.true;
        });
        it("should check one empty", () => {
            const oneEmpty = validator.check(mix, num, undef);
            expect(oneEmpty).to.be.an.instanceof(Exception);
        });
        it("should add multi rules", () => {
            validator.add(isNumber, "This is not a number", true);
            expect(validator.ruleCache).to.be.lengthOf(3);
        });
        it("should check not empty and number", () => {
            const notEmptyNumber = validator.check(num);
            expect(notEmptyNumber).to.be.true;
        });
        it("should check numbers", () => {
            const notNumber = validator.check(num, mix);
            expect(notNumber).to.be.equal("This is not a number");
        });
        it("should check one empty", () => {
            const oneEmpty = validator.check(num, undef);
            expect(oneEmpty).to.be.an.instanceof(Exception);
        });
        it("should create a validator with multi rules", () => {
            validator = new Validator({
                func: isString,
                message: new Exception("Balabala"),
                reverse: true
            }, {
                func: isEmail,
                message: new Exception("HalaHala"),
                reverse: true
            });
        });
        it("should check email", () => {
            const result = validator.check(email);
            expect(result).to.be.true;
        })
    });
});
