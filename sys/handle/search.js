const { user, tag, post, topic } = require("./model.js").models;
const state = require("../config/state.js");
const { Op } = require("sequelize");
const { isEmpty, isNumber } = require("./utils.js");

const handle = {
    /**
     * Search posts with keywords
     * @param {string} keyword
     * @param {"startsWith"|"endsWith"|"substring"} type
     * @param {number|string} limit
     * @return {Promise<post[]|number>}
     */
    searchPostsByName: async (keyword, limit, type = "substring") => {
        if (isEmpty(keyword)) return state.Empty;
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            const result = await post.findAll({ attributes: ["id", "name"], where: { name: { [Op[type]]: `${keyword}` }}, limit: limit });
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await post.findAll({ attributes: ["id", "name"], where: { name: { [Op[type]]: `${keyword}` }}});
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Search users with keywords
     * @param {string} keyword
     * @param {"startsWith"|"endsWith"|"substring"} type
     * @param {number|string} limit
     * @return {Promise<post[]|number>}
     */
    searchUserByName: async (keyword, limit, type = "substring") => {
        if (isEmpty(keyword)) return state.Empty;
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            const result = await user.findAll({ where: { name: { [Op[type]]: `${keyword}` }},  limit: limit });
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await user.findAll({ where: { name: { [Op[type]]: `${keyword}` }}});
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Search posts with keywords
     * @param {string} keyword
     * @param {"startsWith"|"endsWith"|"substring"} type
     * @param {number|string} limit
     * @return {Promise<post[]|number>}
     */
    SearchPostsByContent: async (keyword, limit, type = "substring") => {
        if (isEmpty(keyword)) return state.Empty;
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            const result = await post.findAll({ where: { name: { [Op[type]]: `${keyword}` }}, limit: limit });
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await post.findAll({ where: { name: { [Op[type]]: `${keyword}` }}});
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Search posts by tag
     * @param {string} tagName
     * @param {number|string} limit
     * @return {Promise<post[]|number>}
     */
    searchPostsByTag: async (tagName, limit) => {
        if (isEmpty(tagName)) return state.Empty;
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            const result = await tag.findAll({ include: post, where: { name: tagName }, limit: limit });
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await tag.findAll({ include: post, where: { name: tagName }});
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Search posts by topic
     * @param {string} topicName
     * @param {number|string} limit
     * @return {Promise<post[]|number>}
     */
    searchPostsByTopic: async (topicName, limit) => {
        if (isEmpty(topicName)) return state.Empty;
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            const result = await post.findAll({ include: [{ model: topic, where: { name: topicName }}], limit: limit });
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await post.findAll({ include: [{ model: topic, where: { name: topicName }}]});
            return result.length > 0 ? result : state.NotExist;
        }
    }
}

module.exports = handle;
