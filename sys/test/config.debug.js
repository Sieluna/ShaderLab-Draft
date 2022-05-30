const debug = require("../config/debug.js");

describe("Debug test", () => {
    describe("Log test", () => {
        it("should log a message", () => {
            debug.log("message");
        });
        it("should log multi message", () => {
            debug.log("messageA", "messageB", "messageC");
        });
    });
    describe("Log bold test", () => {
        it("should log  message", () => {
            debug.log.bold("message");
        });
        it("should log multi message", () => {
            debug.log.bold("messageA", "messageB", "messageC");
        });
    });
    describe("Log italic test", () => {
        it("should log  message", () => {
            debug.log.italic("message");
        });
        it("should log multi message", () => {
            debug.log.italic("messageA", "messageB", "messageC");
        });
    });
    describe("Log underline test", () => {
        it("should log  message", () => {
            debug.log.underline("message");
        });
        it("should log multi message", () => {
            debug.log.underline("messageA", "messageB", "messageC");
        });
    });
    describe("Log inverse test", () => {
        it("should log  message", () => {
            debug.log.inverse("message");
        });
        it("should log multi message", () => {
            debug.log.inverse("messageA", "messageB", "messageC");
        });
    });
    describe("Log white test", () => {
        it("should log  message", () => {
            debug.log.white("message");
        });
        it("should log multi message", () => {
            debug.log.white("messageA", "messageB", "messageC");
        });
    });
    describe("Log grey test", () => {
        it("should log  message", () => {
            debug.log.grey("message");
        });
        it("should log multi message", () => {
            debug.log.grey("messageA", "messageB", "messageC");
        });
    });
    describe("Log black test", () => {
        it("should log  message", () => {
            debug.log.black("message");
        });
        it("should log multi message", () => {
            debug.log.black("messageA", "messageB", "messageC");
        });
    });
    describe("Log blue test", () => {
        it("should log  message", () => {
            debug.log.blue("message");
        });
        it("should log multi message", () => {
            debug.log.blue("messageA", "messageB", "messageC");
        });
    });
    describe("Log cyan test", () => {
        it("should log  message", () => {
            debug.log.cyan("message");
        });
        it("should log multi message", () => {
            debug.log.cyan("messageA", "messageB", "messageC");
        });
    });
    describe("Log green test", () => {
        it("should log  message", () => {
            debug.log.green("message");
        });
        it("should log multi message", () => {
            debug.log.green("messageA", "messageB", "messageC");
        });
    });
    describe("Log magenta test", () => {
        it("should log  message", () => {
            debug.log.magenta("message");
        });
        it("should log multi message", () => {
            debug.log.magenta("messageA", "messageB", "messageC");
        });
    });
    describe("Log red test", () => {
        it("should log  message", () => {
            debug.log.red("message");
        });
        it("should log multi message", () => {
            debug.log.red("messageA", "messageB", "messageC");
        });
    });
    describe("Log yellow test", () => {
        it("should log  message", () => {
            debug.log.yellow("message");
        });
        it("should log multi message", () => {
            debug.log.yellow("messageA", "messageB", "messageC");
        });
    });
    describe("Log underline white test", () => {
        it("should log  message", () => {
            debug.log.underline.white("message");
        });
        it("should log multi message", () => {
            debug.log.underline.white("messageA", "messageB", "messageC");
        });
    });
});
