const { Sequelize } = require("sequelize");
const { tag } = require("./model.js").models;
const state = require("../config/state.js");
const { isEmpty, isNumber } = require("./utils.js");

const handle = {
    /**
     * Get all tags
     * @param {number|string} [limit]
     * @return {Promise<tag[]|state>}
     */
    getAllTags: async limit => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await tag.findAll({ limit: limit });
        } else {
            return await tag.findAll();
        }
    },
    /**
     * Get grouped tags
     * @param {number|string} limit
     * @return {Promise<tag[]|state>}
     */
    getGroupTags: async limit => {
        const option = {
            attributes: [[ Sequelize.fn("DISTINCT", Sequelize.col("tag_name")), "name" ]]
        };
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            option.limit = limit;
            const result = await tag.findAll(option);
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await tag.findAll(option);
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Create a tag
     * @param {string} tagName
     * @param {number|string} post
     * @return {Promise<[tag,boolean]|state>}
     */
    create: async (tagName, post) => {
        if (!isNumber(post) || isEmpty(tagName)) return state.Empty;
        if (tagName.length > 32) return state.OverSize;
        return await tag.findOrCreate({ where: { name: tagName, postId: post }});
    }
}

module.exports = handle;
