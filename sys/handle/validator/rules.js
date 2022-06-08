module.exports = {
    isEmpty: data => {
        switch (typeof data) {
            case "undefined":
                return true;
            case "string":
                return data.trim().length === 0;
            case "number":
                return false;
            default:
                return data == null;
        }
    },
    isString: data => {
        if (typeof data === "string") return true;
        if (typeof data !== "object") return false;
        return data instanceof String ? true : Object.prototype.toString.call(data) == "[object String]";
    },
    /**
     * Check email (unsafe [have to work with isString])
     * @param {string} data
     * @return {boolean}
     */
    isEmail: data => {
        const emailParts = data.split("@");
        if(emailParts.length !== 2) return false;
        const account = emailParts[0], address = emailParts[1];
        if (account.length > 64 || address.length > 255) return false;
        const domainParts = address.split('.');
        if (domainParts.some(part => part.length > 63)) return false;
        return /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/.test(data);
    },
    isPureNumber: data => {
        if (typeof data === "number") return true;
        if (typeof data !== "object") return false;
        return data instanceof Number ? true : Object.prototype.toString.call(data) === "[object Number]";
    },
    isNumber: data => {
        return /^[0-9]+$/.test(data)
    }
}
