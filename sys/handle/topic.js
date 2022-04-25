const query = require("./sql.js");
const state = require("../config/state.js");

const handle = {
    /**
     * Create a topic.
     * @param json
     */
    create: async json => {
        let name = json.name, image = json.image, description = json.description;
    },
    /**
     * Update topic information.
     * @param json
     */
    update: async json => {
        let name = json.name, image = json.image, description = json.description;

    }
}

module.exports = handle;