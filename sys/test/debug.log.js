const debug = require("../debug/log.js");

describe("Debug Log test", () => {
    describe("Log test", () => {
        it("should log a message", () => {
            debug.log("message");
        });
        it("should log multi message", () => {
            debug.log("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log bold test", () => {
        it("should log  message", () => {
            debug.log.bold("message");
        });
        it("should log multi message", () => {
            debug.log.bold("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.bold("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log italic test", () => {
        it("should log  message", () => {
            debug.log.italic("message");
        });
        it("should log multi message", () => {
            debug.log.italic("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.italic("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log underline test", () => {
        it("should log  message", () => {
            debug.log.underline("message");
        });
        it("should log multi message", () => {
            debug.log.underline("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.underline("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log inverse test", () => {
        it("should log  message", () => {
            debug.log.inverse("message");
        });
        it("should log multi message", () => {
            debug.log.inverse("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.inverse("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log white test", () => {
        it("should log  message", () => {
            debug.log.white("message");
        });
        it("should log multi message", () => {
            debug.log.white("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.white("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log grey test", () => {
        it("should log  message", () => {
            debug.log.grey("message");
        });
        it("should log multi message", () => {
            debug.log.grey("messageA", "messageB");
        });
        it("should log multi message with object", () => {
            debug.log.grey("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log black test", () => {
        it("should log  message", () => {
            debug.log.black("message");
        });
        it("should log multi message", () => {
            debug.log.black("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.black("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log blue test", () => {
        it("should log  message", () => {
            debug.log.blue("message");
        });
        it("should log multi message", () => {
            debug.log.blue("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.blue("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log cyan test", () => {
        it("should log  message", () => {
            debug.log.cyan("message");
        });
        it("should log multi message", () => {
            debug.log.cyan("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.cyan("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log green test", () => {
        it("should log  message", () => {
            debug.log.green("message");
        });
        it("should log multi message", () => {
            debug.log.green("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.green("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log magenta test", () => {
        it("should log  message", () => {
            debug.log.magenta("message");
        });
        it("should log multi message", () => {
            debug.log.magenta("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.magenta("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log red test", () => {
        it("should log  message", () => {
            debug.log.red("message");
        });
        it("should log multi message", () => {
            debug.log.red("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.red("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log yellow test", () => {
        it("should log  message", () => {
            debug.log.yellow("message");
        });
        it("should log multi message", () => {
            debug.log.yellow("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.yellow("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log underline white test", () => {
        it("should log  message", () => {
            debug.log.underline.white("message");
        });
        it("should log multi message", () => {
            debug.log.underline.white("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.underline.white("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
    });
    describe("Log underline white test", () => {
        it("should log  message", () => {
            debug.log.underline.red("message");
        });
        it("should log multi message", () => {
            debug.log.underline.red("messageA", "messageB", "messageC");
        });
        it("should log multi message with object", () => {
            debug.log.underline.red("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
        });
        it("should log multi message with anonymous function", () => {
            debug.log.underline.red("messageA", "messageB", function () { });
        });
        it("should log multi message with function with name test", () => {
            debug.log.underline.red("messageA", "messageB", function test () { });
        });
    });
    describe("Setup debug level", () => {
        it("should debug with warn only", () => {
            debug.level = 1;
            debug.log("log");
            debug.info("info");
            debug.warn("warn")
        });
    });
});
