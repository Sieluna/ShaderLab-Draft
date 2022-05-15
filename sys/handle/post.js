const { Sequelize } = require("sequelize");
const { user, post } = require("./model.js").models;
const userHandle = require("./user.js");
const topicHandle = require("./topic.js");
const tagHandle = require("./tag.js");
const thumbHandle = require("./thumb.js");
const commentHandle = require("./comment.js");
const state = require("../config/state.js");
const { isNumber, isEmpty, normalizeId } = require("./utils.js");

const handle = {
    /**
     * Get post by id (unsafe)
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    getPostById: async id => {
        const result = await post.findByPk(id);
        return result ? result : state.NotExist;
    },
    /**
     * Get and view post by id
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    getViewPostById: async id => {
        if (!isNumber(id)) return state.Empty;
        const result = await handle.getPostById(id);
        if (result) await post.increment({ views: 1 }, { where: { id: id } });
        return result;
    },
    /**
     * Get posts by name (unsafe)
     * @param {string} name
     * @return {Promise<post[]|state>}
     */
    getPostsByName: async name => {
        const result = await post.findAll({ where: { name: name }});
        return result ? result : state.NotExist;
    },
    /**
     * Get the last index in the table
     * @param {number} [offset] the offset of the counter
     * @return {Promise<number>}
     */
    getLastId: async (offset = 0) => {
        return await post.max("post_id") + offset;
    },
    /**
     * Get all posts with rank
     * @param {name|string} [limit]
     * @return {Promise<post[]|state>}
     */
    getAllPosts: async limit => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await post.findAll({ include: { model: user, attributes: ["name", "avatar"] }, limit: limit });
        } else {
            return await post.findAll({ include: { model: user, attributes: ["name", "avatar"] }});
        }
    },
    /**
     * Get all posts with rank
     * @param {number|string} [limit]
     * @param {"ASC"|"DESC"} [order]
     * @return {Promise<post[]|state>}
     */
    getAllPostsByRank: async (limit, order = "DESC") => {
        if (isEmpty(order)) return state.Empty;
        const option = {
            include: { model: user, attributes: ["name", "avatar"] },
            attributes: {
                include: [
                    [ Sequelize.literal(`(SELECT count(*) FROM thumbs WHERE thumbs.thumb_post = post.post_id)`), "post_thumbs" ],
                    [ Sequelize.literal(`(SELECT count(*) FROM comments WHERE comments.comment_post = post.post_id)`), "post_comments" ]
                ]
            },
            order: [[ Sequelize.literal(`(post_views * 0.1) + post_thumbs + (post_comments * 2)`), order ]],
        };
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            option.limit = limit;
            const result = await post.findAll(option);
            return result.length > 0 ? result : state.NotExist;
        } else {
            const result = await post.findAll(option);
            return result.length > 0 ? result : state.NotExist;
        }
    },
    /**
     * Get rank by id
     * @param {number|string} id
     * @return {Promise<number>}
     */
    getPostRankById: async id => {
        let view = handle.getPostViewsById(id), thumb = handle.getPostThumbsById(id), comment = handle.getPostCommentsById(id);
        return (await view * 0.1) + await thumb + (await comment * 2);
    },
    /**
     * Get number of views by id
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    getPostViewsById: async id => {
        if (!isNumber(id)) return state.Empty
        const result = await post.findByPk(id);
        return isNumber(result.views) ? result.views : state.NotExist;
    },
    /**
     * Get number of thumbs by id
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    getPostThumbsById: async id => {
        return thumbHandle.getThumbsByPost(id);
    },
    /**
     * Get number of comments by id
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    getPostCommentsById: async id => {
        return commentHandle.getCommentByPost(id);
    },
    /**
     * Count posts
     * @return {Promise<number>}
     */
    countPost: async () => {
        return await post.count();
    },
    /**
     * View a post (unsafe)
     * @param {number|string} id
     * @return {Promise<post|state>}
     */
    viewPost: async id => {
        return await post.increment({ views: 1 }, { where: { id: id } });
    },
    /**
     * Thumb a post
     * @param {number|string} user
     * @param {number|string} post
     * @return {Promise<[post,boolean]|state>}
     */
    thumbPost: async (user, post) => {
        return thumbHandle.create(user, post);
    },
    /**
     * Commont a post
     * @param {number|string} user
     * @param {number|string} post
     * @param {string} content
     * @return {Promise<[post,boolean]|state>}
     */
    commentPost: async (user, post, content) => {
        return commentHandle.create(user, post, content);
    },
    /**
     * Mark post some tags
     * @alias tagHandle.create
     * @param {string} tagName
     * @param {number|string} post
     * @return {Promise<void>}
     */
    tagPost: async (tagName, post) => {
        return tagHandle.create(tagName, post);
    },
    /**
     * Create a post
     * @param {number|string} user
     * @param {number|string} topic
     * @param {{name:string,preview:string,content:string}} data
     * @return {Promise<post|state>}
     */
    create: async (user, topic, data) => {
        const { name, preview, content } = data;
        if (isEmpty(user) || isEmpty(topic) || isEmpty(name) || isEmpty(content)) return state.Empty;
        let userId = normalizeId(user, userHandle.getUserByName), topicId = normalizeId(topic, topicHandle.getTopicByName);
        if ((await userId) == null || (await topicId) == null) return state.NotExist;
        return await post.create({ name: name, preview: preview, content: content, userId: await userId, topicId: await topicId });
    },
    /**
     * Deprecate post by id
     * @param {number|string} id
     * @return {Promise<number|state>} number of rows effected
     */
    deprecateById: async id => {
        if (!isNumber(id)) return state.Empty;
        const result = await post.destroy({ where: { id: id }});
        return Number(result) > 0 ?  result : state.NotExist;
    },
    /**
     * Restore post by id
     * @param {number|string} id
     * @return {Promise<number|state>} number of rows effected
     */
    restoreById: async id => {
        if (!isNumber(id)) return state.Empty;
        const result = await post.restore({ where: { id: id }});
        return Number(result) > 0 ? result : state.NotExist;
    }
}

module.exports = handle;
