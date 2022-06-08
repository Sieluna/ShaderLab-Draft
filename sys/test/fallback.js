const Exception = require("../handle/fallback/shared.js");
const expect = require("chai").expect;

describe("Fallback exception test", () => {
    describe("base exception test", () => {
        let instance;
        it("Create new instance", () => {
            instance = new Exception("test");
            expect(instance).to.be.an.instanceOf(Exception);
        });
        it("Get exception Name", () => {
            const name = instance.exceptionName;
            expect(name).to.be.equal("TEST_EXCEPTION");
        });
    });
    describe("exist exception test", () => {
        let required, instance;
        before(() => required = require("../handle/fallback/exist.js")("test"));
        it("Create new instance", () => {
            instance = new required("Test error message");
            expect(instance).to.be.an.instanceOf(Exception);
            expect(instance).to.have.property("name").to.be.equal("TEST_NOTEXIST");
            expect(instance).to.have.property("status").to.be.equal(400);
            expect(instance).to.have.property("message").to.be.equal("Test error message");
        });
    });
    describe("authorized exception test", () => {
        let required, instance;
        before(() => required = require("../handle/fallback/authorize.js")("test"));
        it("Create new instance", () => {
            instance = new required("Test error message");
            expect(instance).to.be.an.instanceOf(Exception);
            expect(instance).to.have.property("name").to.be.equal("TEST_UNAUTHORIZED");
            expect(instance).to.have.property("status").to.be.equal(401);
            expect(instance).to.have.property("message").to.be.equal("Test error message");
        });
    });
});
