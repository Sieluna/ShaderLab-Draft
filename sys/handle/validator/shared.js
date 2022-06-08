const NotExist = require("../fallback/exist.js")("default");

class ValidatorBase {
    constructor(...rules) {
        this.ruleCache = [];
        this.defaultRule = [{
            func: this.isExist,
            message: new NotExist("Param is missing")
        }];
        for (const rule of [...this.defaultRule, ...rules]) {
            this.add(rule.func, rule.message, rule.reverse);
        }
    }

    /**
     * Add a rule to validator
     * @param {function} func
     * @param {object} message
     * @param {boolean} mask get func(value) and compare with mask
     */
    add(func, message, mask = true) {
        this.ruleCache.push(data => {
            if (func(data) !== mask) {
                return message;
            }
        });
    }

    /**
     * Check data
     * ```javascript
     * const result = check(a, b, c, d);
     * ```
     * @param {any} elements
     * @return {object|undefined} messages
     */
    check(...elements) {
        for (const element of elements) {
            for (const rule of this.ruleCache) {
                const message = rule(element);
                if (message) return message;
            }
        }
        return true;
    }

    isExist(data) {
        switch (typeof data) {
            case "undefined":
                return false;
            case "string":
                return data.trim().length > 0;
            case "number":
                return true;
            default:
                return data !== null;
        }
    }
}

module.exports = ValidatorBase;
