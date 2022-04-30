const query = require("./sql.js");
const state = require("../config/state.js");

const handle = {
    /** @return {number} */
    getLastId: async () => {
        const result = await query('select max(post_id) as max from posts');
        return result[0].max;
    },
    /**
     *
     * @param {number} user
     * @param {number} topic
     * @param {{name:string,content:string}} json
     */
    create: async (user, topic, json) => {
        const reuslt = await query('call createPost(?, ?, ?, ?)', [user, topic, json.name, json.content]);
    },
}

module.exports = handle;