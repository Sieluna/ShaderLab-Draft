const { URL } = require("url");

/**
 * Resolve http archive to common request
 * @param {object} httpArchive
 * @return {Map<string, {origin:string,method:string,path:string,headers:object}>}
 */
module.exports = httpArchive => {
    const requestsPerOrigin = new Map();
    try {
        for (const entry of httpArchive.log.entries) {
            const { request: { method, url, headers: headerArray, postData } } = entry, headers = {};
            for (const header of headerArray) {
                const { name, value } = header;
                headers[name] = value;
            }
            const { protocol, host, path, hash } = new URL(url), origin = `${protocol}//${host}`;
            let requests = requestsPerOrigin.get(origin);
            if (!requests) { requests = []; requestsPerOrigin.set(origin, requests); }
            const request = { origin, method, path: `${path}${hash || ''}`, headers };
            if (typeof postData == "object" && typeof postData.text == "string")
                request.body = postData.text;
            requests.push(request);
        }
    } catch (err) {
        throw new Error(`Could not parse HAR content: ${err.message}`);
    }
    return requestsPerOrigin;
};
