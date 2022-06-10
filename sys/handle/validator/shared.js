const debug = require("debug")("shaderlab:validate");

/**
 * Validator generator
 * @example
 * ruleA -> {func, message, mask}
 * ruleB -> [{func, message, mask}, {func, message, mask}]
 * @param rules
 */
class ValidatorBase {
    constructor(...rules) {
        this.rulesCache = [];
        rules.forEach(rule => this.add(rule));
    }

    /**
     * Add a rule to validator
     * @param {object[]} options
     * @param {function} options.func
     * @param {object} options.message
     * @param {boolean} options.mask get func(value) and compare with mask
     */
    add(options) {
        let rules = [], settings = Array.isArray(options) ? options: [options];
        for (const { func, message, mask } of settings) {
            rules.push(data => {
                if (func(data) !== (mask ?? true))
                    return typeof message === "function" ? message(data) : message;
            });
        }
        debug("bind callback %o with %o", rules, options);
        this.rulesCache.push(rules);
    }

    /**
     * Check data, element should match with rules
     * @example
     * const result = check(a, b, c, d);
     * @param {any} elements
     * @return {object|undefined} messages
     */
    check(...elements) {
        for (let i = 0; i < Math.min(elements.length, this.rulesCache.length); i++) {
            const element = elements[i], rules = this.rulesCache[i];
            debug("check %o with %o", element, rules);
            for (const rule of rules) {
                const message = rule(element);
                if (message) {
                    debug("get error message %o", message);
                    throw message;
                }
            }
        }
        return true;
    }
}

module.exports = ValidatorBase;
