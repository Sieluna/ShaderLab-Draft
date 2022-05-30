const { Sequelize } = require("sequelize");
const { thumb } = require("./model.js").models;
const userHandle = require("./user.js");
const state = require("../config/state.js");
const { isNumber, normalizeId } = require("./utils.js");

const handle = {
    /**
     * Get thumbs by user
     * @param {number} user user id
     * @return {Promise<number>}
     */
    getThumbsByUser: async user => {
        if (!isNumber(user)) return state.Empty
        const result = await thumb.count({ where: { userId: user } });
        return isNumber(result) ? result : state.NotExist;
    },
    /**
     * Get thumbs by post
     * @param {number} post post id
     * @return {Promise<number>}
     */
    getThumbsByPost: async post => {
        if (!isNumber(post)) return state.Empty
        const result = await thumb.count({ where: { postId: post } });
        return isNumber(result) ? result : state.NotExist;
    },
    /**
     * Create a thumb by user and post
     * @param {number|string} user user id
     * @param {number|string} post post id
     * @return {Promise<[thumb,boolean]>}
     */
    create: async (user, post) => {
        let userId = await normalizeId(user, userHandle.getUserByName);
        if (userId == null || !isNumber(post)) return state.NotExist;
        return await thumb.findOrCreate({ where: { userId: userId, postId: post } });
    },
    remove: async (user, post) => {

    }
}

module.exports = handle;
