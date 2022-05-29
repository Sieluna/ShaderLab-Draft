const expect = require("chai").expect;
const path = require("path");

const join = (base, others) => typeof others === "string" ? path.posix.join(base, others) :
                                Array.isArray(others) ? path.posix.join(base, ...others) : base;

describe("App test", () => {
    let url;
    describe("App function test", () => {
        describe("Path join test", () => {
            beforeEach(() => {
                const single = "/:single\\";
                const multi = ["objA", "objB"];
                const empty = "";
                url = path.posix.join(join(`/api/${single}`, multi), empty);
            });
            it("should return the forward slash", () => {
                expect(url).to.be.equal("/api/:single\\/objA/objB");
            });
        });
        describe("Open params into array", () => {
            const data = [(a, b) => a + b, (a, b) => a - b];
            const func = (a, b) => a(2, 1) + b(2, 1);
            it("should return sum of 3 and 1 equal to 4", () => {
                expect(func(...data)).to.be.equal(4);
            });
        });
        describe("Object length", () => {
            const data = { a: "1", b: "2", c: "3" };
            const str = "123";
            it("should be equal to 3", () => {
                expect(Object.values(data).length).to.be.equal(3);
            })
        });
    });
    describe("App engine test", () => {
        describe("Bench")
    });
});
