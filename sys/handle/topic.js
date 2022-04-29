const { topic } = require("./model.js").models;
const path = require("path");
const fs = require("fs");
const state = require("../config/state.js");
const { isEmpty, isNumber } = require("./utils.js")

const handle = {
    getTopic: async data => {
        if (isEmpty(data)) return state.Empty;
        return isNumber(data) ? await handle.getUserById(data) : await handle.getTopicByName(data);
    },
    getTopicById: async id => {
        const result = await topic.findByPk(id);
        return result ? result : state.NotExist;
    },
    getTopicByName: async name => {
        const result = await topic.findOne({ where: { name: name }});
        return result ? result : state.NotExist;
    },
    /** @return {number} */
    getLastId: async () => {
        return await topic.max("topic_id");
    },
    /**
     * @param {number} [num]
     * @return any[]
     */
    getAllTopics: async num => {
        if (num) {
            if (!isNumber(num)) return state.Empty;
            return await topic.findAll({ limit: num });
        } else {
            return await topic.findAll();
        }
    },
    /**
     * Create a topic.
     * @param name
     * @param image
     * @param description
     * @return {any}
     */
    create: async (name, image, description) => {
        if (isEmpty(name) || isEmpty(description)) return state.Empty;
        if (name.length < 32 || description.length < 250) return state.OverSize;
        return await topic.create({ name: name, image: image, description: description });
    },
    createByName: async name => {
        if (isEmpty(name)) return state.Empty;
        if (name.length < 32) return state.OverSize;
        return await topic.create({ name: name });
    },
    /**
     * Update topic information.
     * @param id
     * @param image
     * @param description
     */
    updateById: async (id, image, description) => {
        if (isEmpty(description)) return state.Empty;
        return await topic.update({ image: fs.readFileSync(path.join(__dirname, "../static/data/user", image.name)), description: description }, { where: { id: id }});
    },
    uploadImageById: async (id, image) => {
        if (!isNumber(id)) return state.Empty;
        return await topic.update({ image: fs.readFileSync(path.join(__dirname, "../static/data/user", image.name)) }, { where: { id: id }});
    },
    updateDescriptionById: async (id, description) => {
        if (!isNumber(id)) return state.Empty;
        if (description.length < 250) return state.OverSize;
        return await topic.update({ description: description }, { where: { id: id }});
    }
}

module.exports = handle;
