const morgan = require("morgan");

module.exports = {
    clusterEnable: false,
    /**
     * Resolve proxy rules to current
     * @param {Request} req
     * @param {string[]} rules
     * @return {string}
     */
    resolveProxy: (req, rules) => {
        let path = req.url, target = rules["default"];
        for (const pathPrefix in rules) {
            const pathEndSlash = pathPrefix.slice(-1)  === "/";
            const pathPrefixRegexp = new RegExp(pathEndSlash ? pathPrefix : `(${pathPrefix})(?:\\W|$)`);
            const testPrefixMatch = pathPrefixRegexp.exec(path);
            if (testPrefixMatch && testPrefixMatch.index === 0) {
                const urlPrefix = testPrefixMatch[pathEndSlash ? 0 : 1];
                req.url = path.replace(urlPrefix, "");
                target = rules[pathPrefix];
                for (let i = 0; i < testPrefixMatch; i++)
                    target = target.replace("$" + i, testPrefixMatch[i + (pathEndSlash ? 0 : 1)])
                break;
            }
        }
        return target;
    },
    logger: () => morgan(function format(tokens, req, res) {
        const status = (typeof res.headersSent != "boolean" ? Boolean(res._header) : res.headersSent) ? res.statusCode : undefined;
        const color = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
        if (!format[color]) format[color] = morgan.compile(`    \x1b[90m>\x1b[0m :method :url \x1b[${color}m:status\x1b[0m :response-time ms - :res[content-length]`);
        return  format[color](tokens, req, res);
    }),
}
