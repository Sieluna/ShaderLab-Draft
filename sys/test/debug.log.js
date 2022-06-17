const debug = require("../debug/log.js");
const logger = require("../debug/log");

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
    describe("Styled log test", () => {
        const { styles } = require("../debug/style.js");
        Object.keys(styles).forEach(style => {
            it(`should log ${style} message`, () => {
                debug.log[style]("message");
            });
            it(`should log multi ${style} message`, () => {
                debug.log[style]("messageA", "messageB");
            });
            it(`should log multi ${style} message with object`, () => {
                debug.log[style]("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
            });
        });
    });
    describe("Colored log test", () => {
        const { colors } = require("../debug/style.js");
        Object.keys(colors).forEach(color => {
            it(`should log ${color} message`, () => {
                debug.log[color]("message");
            });
            it(`should log multi ${color} message`, () => {
                debug.log[color]("messageA", "messageB");
            });
            it(`should log multi ${color} message with object`, () => {
                debug.log[color]("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
            });
        });
    });
    describe("Styled and colored log test", () => {
        const { styles } = require("../debug/style.js");
        const { colors } = require("../debug/style.js");
        Object.keys(styles).forEach(style => {
            Object.keys(colors).forEach(color => {
                it(`should log ${style} ${color} message`, () => {
                    debug.log[style][color]("message");
                });
                it(`should log multi ${style} ${color} message`, () => {
                    debug.log[style][color]("messageA", "messageB");
                });
                it(`should log multi ${style} ${color} message with object`, () => {
                    debug.log[style][color]("messageA", "messageB", { subA: "messageSubA", subB: "messageSubB" });
                });
                it(`should log multi ${style} ${color} message with anonymous function`, () => {
                    debug.log[style][color]("messageA", "messageB", function () { });
                });
                it(`should log multi ${style} ${color} message with function with name test`, () => {
                    debug.log[style][color]("messageA", "messageB", function test () { });
                });
            });
        });
    });
    describe("Setup debug level", () => {
        ["log", "info", "warn", "noLog"].forEach(msg => {
            it(`should debug with ${msg}`, () => {
                debug.level = debug.levels[msg];
                debug.log(`level${debug.levels[msg]} -=- log`);
                debug.info(`level${debug.levels[msg]} -=- info`);
                debug.warn(`level${debug.levels[msg]} -=- warn`)
            });
        });
        it("Global config debug level", () => {
            debug.level = debug.levels.warn;
            const logger = require("../debug/log.js");
            logger.log("logging");
            logger.info("logging");
            logger.warn("logging");
        });
    });
});
