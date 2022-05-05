const { topic } = require("./model.js").models;
const state = require("../config/state.js");
const { isEmpty, isNumber } = require("./utils.js")

const handle = {
    /**
     * Get topic data, a wrapper of {@link getTopicById} and {@link getTopicByName}
     * @param {number|string} data
     * @return {Promise<user|state>}
     */
    getTopic: async data => {
        if (isEmpty(data)) return state.Empty;
        return isNumber(data) ? await handle.getTopicById(data) : await handle.getTopicByName(data);
    },
    /**
     * Get topic data by id (unsafe)
     * @param {number} id
     * @return {Promise<user|state>}
     */
    getTopicById: async id => {
        const result = await topic.findByPk(id);
        return result ? result : state.NotExist;
    },
    /**
     * Get topic data by name (unsafe)
     * @param {string} name
     * @return {Promise<user|state>}
     */
    getTopicByName: async name => {
        return (await topic.findOrCreate({ where: { name: name }}))[0];
    },
    /**
     * Get the last index in the table
     * @param {number} [offset] the offset of the counter
     * @return {Promise<number>}
     */
    getLastId: async (offset = 0) => {
        return await topic.max("topic_id") + offset;
    },
    /**
     * Get all topics
     * @param {number|string} [limit]
     * @return {Promise<topic[]>}
     */
    getAllTopics: async limit => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await topic.findAll({ limit: limit });
        } else {
            return await topic.findAll();
        }
    },
    /**
     * Create a topic.
     * @param {number|string} name
     * @param {string} image
     * @param {string} description
     * @return {Promise<topic|state>}
     */
    create: async (name, image, description) => {
        if (isEmpty(name) || isEmpty(description)) return state.Empty;
        if (isNumber(name)) return state.NotCorrect;
        if (name.length > 32 || description.length > 250) return state.OverSize;
        return await topic.create({ name: name, image: image, description: description });
    },
    /**
     * Create a topic by name
     * @param {string} name
     * @return {Promise<topic|state>}
     */
    createByName: async name => {
        if (isEmpty(name) || isNumber(name)) return state.NotCorrect;
        if (name.length > 32) return state.OverSize;
        return await topic.create({ name: name });
    },
    /**
     * Update topic information (unsafe)
     * @param {number|string} id
     * @param {string} image
     * @param {string} description
     * @return {Promise<[number,topic]>}
     */
    updateById: async (id, image, description) => {
        if (!isNumber(id) || isEmpty(image) || isEmpty(description)) return state.Empty;
        return await topic.update({ image: image, description: description }, { where: { id: id }});
    },
    /**
     * Update topic name by id
     * @param {number|string} id
     * @param {string} image
     * @return {Promise<[number,topic]>}
     */
    updateImageById: async (id, image) => {
        if (!isNumber(id) || isEmpty(image)) return state.Empty;
        return await topic.update({ image: image }, { where: { id: id }});
    },
    /**
     * Update topic description by id
     * @param {number|string} id
     * @param {string} description
     * @return {Promise<[number,topic]>}
     */
    updateDescriptionById: async (id, description) => {
        if (!isNumber(id) || isEmpty(description)) return state.Empty;
        if (description.length > 250) return state.OverSize;
        return await topic.update({ description: description }, { where: { id: id }});
    }
}

module.exports = handle;
