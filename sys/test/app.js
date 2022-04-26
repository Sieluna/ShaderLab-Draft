const expect = require("chai").expect;

const path = require("path");

const join = (base, others) => typeof others === "string" ? path.posix.join(base, others) :
                                Array.isArray(others) ? path.posix.join(base, ...others) : base;

describe("App function test", () => {
    let url;
    describe("Path join test", () => {
        beforeEach(() => {
            const single = "/:single\\";
            const multi = ["objA", "objB"];
            const empty = "";
            url = path.posix.join(join(`/api/${single}`, multi), empty);
        });
        it("should return the forward slash", () => {
            console.log(url)
            expect(url).to.be.equal("/api/:single\\/objA/objB");
        });
    });
});