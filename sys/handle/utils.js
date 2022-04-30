const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
const numberReg = /^[0-9]+$/;

/**
 * @param {any} data
 * @return {boolean}
 */
const isEmpty = data => data === undefined ? true : data == null ? true : typeof data == "number" ? false : data.trim().length === 0;

/**
 * Better to check {@link isEmpty} before use it.
 * @param {string} data
 * @return {boolean}
 */
const isEmail = data => emailReg.test(data);

/**
 * Better to check {@link isEmpty} before use it.
 * @param {string} data
 * @return {boolean}
 */
const isNumber = data => numberReg.test(data);

module.exports = { isEmail, isEmpty, isNumber };
