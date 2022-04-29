const query = require("./model.js");
const state = require("../config/state.js");

const handle = {
    /**
     *
     * @param {number} user
     * @param {{post:number, content:string}} json
     */
    create: async (user, json) => {
        const targetPost = json.post; // check post with max id
    }
}

module.exports = handle;
