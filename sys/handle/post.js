const { post, thumb } = require("./model.js").models;
const state = require("../config/state.js");

const handle = {
    /**
     * @param {number} id
     * @return {any|null}
     */
    getPostById: async id => {
        const result = await post.findByPk(id);
        return result ? result : state.NotExist;
    },
    /**
     * @param {string} name
     * @return {any|null}
     */
    getPostByName: async name => {
        const result = await post.findOne({ where: { name: name }});
        return result ? result : state.NotExist;
    },
    /** @return {number} */
    getLastId: async () => {
        return await post.max("post_id");
    },
    /**
     * @param {number} [num]
     * @return {any[]}
     */
    getAllPost: async num => {
        return num ? await post.findAll({ limit: num }) : await post.findAll();
    },
    getPostRankById: async id => {

    },
    /**
     * @param {boolean} [order] true -> asc, false -> desc
     * @param {number} [num]
     * @return {any[]}
     */
    getAllPostByRank: async (order, num) => {
        return num ? await post.findAll({ order: [], limit: num }) : await post.findAll();
    },
    thumbPost: async (user, post) => {
        return await thumb.create({}, { include: [{ association: user}] })
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
