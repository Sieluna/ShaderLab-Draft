const { comment } = require("./model.js").models;
const userHandle = require("./user.js");
const state = require("../config/state.js");
const { isNumber, isEmpty, normalizeId } = require("./utils.js");

const handle = {
    /**
     * Count comment by post
     * @param {number|string} post
     * @return {Promise<number>}
     */
    getCommentByPost: async post => {
        if (!isNumber(post)) return state.Empty
        const result = await comment.count({ where: { postId: post } });
        return isNumber(result) ? result : state.NotExist;
    },
    /**
     * Create a comment
     * @param {number|string} user
     * @param {number|string} post
     * @param {string} content
     * @return {Promise<[comment, boolean]|state>}
     */
    create: async (user, post, content) => {
        if (isEmpty(content)) return state.Empty;
        if (content.length < 5) return state.TooShort;
        let userId = await normalizeId(user, userHandle.getUserByName);
        if (userId == null || !isNumber(post)) return state.NotExist;
        return await comment.findOrCreate({ where: { userId: userId, postId: post }, defaults: { content: content } });
    }
}

module.exports = handle;
