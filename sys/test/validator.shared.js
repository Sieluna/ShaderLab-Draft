const { isExist, isEmpty, isString, isEmail, isNumber } = require("../handle/validator/rules.js");
const NotExist = require("../handle/fallback/exist.js")("Test");
const Invalid = require("../handle/fallback/invalid.js")("Test");
const Exception = require("../handle/fallback/shared.js");
const Validator = require("../handle/validator/shared.js");
const expect = require("chai").expect;

describe("Validator test", () => {
    let mix  = "abcde12345",
        num = 12345,
        email = "abcde12345@mail.com",
        undef = undefined, empty = "", none = null;
    describe("new validator", () => {
        let validator;
        it("should create a validator", () => {
            validator = new Validator({
                func: isExist,
                message: new NotExist("Doing Validator creation test")
            });
            expect(validator).to.be.an.instanceof(Validator);
        });
        it("should check number is exist", () => {
            const result = validator.check(num);
            expect(result).to.be.true;
        });
        it("should check undefined not exist", () => {
            try {
                validator.check(undef);
            } catch (err) {
                expect(err.message).to.be.equal("Doing Validator creation test");
            }
        });
        it("should add a rule for second element", () => {
            validator.add({ func: isEmpty, message: new NotExist("This is empty"), mask: false });
            expect(validator.rulesCache).to.be.lengthOf(2);
        });
        it("should check not empty for second element", () => {
            const result = validator.check(mix, num);
            expect(result).to.be.true;
        });
        it("should check one empty for second element", () => {
            try {
                validator.check(mix, undef);
            } catch (err) {
                expect(err.message).to.be.equal("This is empty");
            }
        });
        it("should create a validator with multi rules", () => {
            validator = new Validator([{
                func: isExist,
                message: new NotExist("Balabala")
            }, {
                func: isEmail,
                message: new Invalid("HalaHala")
            }]);
        });
        it("should check email is valid", () => {
            const result = validator.check(email);
            expect(result).to.be.true;
        });
        it("should check element is exist", () => {
            try {
                validator.check(empty);
            } catch (err) {
                expect(err.message).to.be.equal("Balabala")
            }
        });
        it("should check mix with not valid", () => {
            try {
                validator.check(mix);
            } catch (err) {
                expect(err.message).to.be.equal("HalaHala")
            }
        });
        it("should create validator with functional message", () => {
            validator = new Validator({
                func: isExist,
                message: data => new NotExist(data)
            }, {
                func: isNumber,
                message: data => new Exception(data)
            });
        });
        it("should check exist for first element", () => {
            try {
                validator.check(none);
            } catch (err) {
                expect(err.message).to.be.equal(none);
            }
        });
        it("should check number for first element", () => {
            try {
                validator.check(mix);
            } catch (err) {
                expect(err.message).to.be.equal(mix);
            }
        });
    });
});
