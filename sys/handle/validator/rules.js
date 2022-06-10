const rules = {
    /**
     * check is it exist
     * @param {any} data
     * @return {boolean}
     */
    isExist: (data) => {
        switch (typeof data) {
            case "undefined":
                return false;
            case "string":
                return data.trim().length > 0;
            case "number":
                return true;
            case "function":
                return true;
            case "boolean":
                return true;
            default:
                return data !== null ? Object.keys(data).length > 0: false;
        }
    },
    /**
     * Check is it empty (normally should add reverse mask)
     * @param {any} data
     * @return {boolean}
     */
    isEmpty: data => {
        switch (typeof data) {
            case "undefined":
                return true;
            case "string":
                return data.trim().length === 0;
            case "number":
                return false;
            case "boolean":
                return false;
            case "function":
                return false;
            default:
                return data !== null ?  Object.keys(data).length === 0: true;
        }
    },
    /**
     * Check is it a string
     * @param {any} data
     * @return {boolean}
     */
    isString: data => {
        if (typeof data === "string") return true;
        if (typeof data !== "object") return false;
        return data instanceof String ? true : Object.prototype.toString.call(data) == "[object String]";
    },
    /**
     * Check is it a email
     * @param {any} data
     * @return {boolean}
     */
    isEmail: data => {
        if (typeof data !== "string") return false;
        const emailParts = data.split("@");
        if(emailParts.length !== 2) return false;
        const account = emailParts[0], address = emailParts[1];
        if (account.length > 64 || address.length > 255) return false;
        const domainParts = address.split('.');
        if (domainParts.some(part => part.length > 63)) return false;
        return /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/.test(data);
    },
    /**
     * Check is it a number
     * @param {any} data
     * @return {boolean}
     */
    isNumber: data => {
        if (typeof data === "number") return data - data === 0;
        if (typeof data === "string" && data.trim() !== '') return Number.isFinite ? Number.isFinite(+data) : isFinite(+data);
        return false;
    }
}

module.exports = rules;
