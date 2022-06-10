const NotExist = require("../fallback/exist.js")("user");
const isExist = require("../validator/rules.js");
const ValidatorBase = require("./shared.js");

class UserParamValidator extends ValidatorBase {
    constructor(...rules) {
        super([{
            func: isExist,
            message: new NotExist("Param is not exist")
        }, ...rules]);
    }
}

module.exports = UserValidator;
