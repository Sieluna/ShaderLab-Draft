const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;

const isEmail = (string) => emailReg.test(string);

const isEmpty = (string) => string === undefined ? true : string == null ? true : string === "";

const isNumber = (number) => {
    if (typeof number == "number") return true;
    return typeof number == "string" && number.length > 0 ? !Number.isNaN(Number(number)) : false;
}

module.exports = { isEmail, isEmpty, isNumber };
