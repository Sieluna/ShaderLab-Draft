const { Sequelize } = require("sequelize");
const { user, topic, post, thumb, comment } = require("./model.js").models;
const userHandle = require("./user.js");
const topicHandle = require("./topic.js");
const state = require("../config/state.js");
const { isNumber, isEmpty } = require("./utils");

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
    getPostsByName: async name => {
        const result = await post.findAll({ where: { name: name }});
        return result ? result : state.NotExist;
    },
    /** @return {number} */
    getLastId: async (offset = 0) => {
        return await post.max("post_id") + offset;
    },
    /**
     * @param {name|string} [limit]
     * @return {any[]}
     */
    getAllPosts: async limit => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await post.findAll({ limit: limit });
        } else {
            return await post.findAll();
        }
    },
    /**
     * @param {number} [limit]
     * @param {boolean} [order] true -> asc, false -> desc
     * @return {any[]}
     */
    getAllPostByRank: async (limit, order = false) => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await post.findAll({
                attributes: {
                    include: [
                        [ Sequelize.literal(`(SELECT count(*) FROM thumbs WHERE thumbs.thumb_post = post.post_id)`), "post_thumbs" ],
                        [ Sequelize.literal(`(SELECT count(*) FROM comments WHERE comments.comment_post = post.post_id)`), "post_comments" ]
                    ]
                },
                order: [[ Sequelize.literal(`(post_views * 0.1) + post_thumbs + (post_comments * 2)`), order ? "ASC": "DESC" ]],
                limit: limit
            });
        } else {
            return await post.findAll({
                attributes: {
                    include: [
                        [ Sequelize.literal(`(SELECT count(*) FROM thumbs WHERE thumbs.thumb_post = post.post_id)`), "post_thumbs" ],
                        [ Sequelize.literal(`(SELECT count(*) FROM comments WHERE comments.comment_post = post.post_id)`), "post_comments" ]
                    ]
                },
                order: [[ Sequelize.literal(`(post_views * 0.1) + post_thumbs + (post_comments * 2)`), order ? "ASC": "DESC" ]]
            });
        }
    },
    getPostRankById: async id => {
        let view = handle.getPostViewsById(id), thumb = handle.getPostThumbsById(id), comment = handle.getPostCommentsById(id);
        return (await view * 0.1) + await thumb + (await comment * 2);
    },
    getPostViewsById: async id => {
        if (!isNumber(id)) return state.Empty
        const result = await post.findByPk(id);
        return isNumber(result.views) ? result.views : state.NotExist;
    },
    getPostThumbsById: async id => {
        if (!isNumber(id)) return state.Empty
        const result = await thumb.count({ where: { postId: id } });
        return isNumber(result) ? result : state.NotExist;
    },
    getPostCommentsById: async id => {
        if (!isNumber(id)) return state.Empty
        const result = await comment.count({ where: { postId: id } });
        return isNumber(result) ? result : state.NotExist;
    },
    viewPost: async id => {
        if (!isNumber(id)) return state.Empty;
        return await post.increment({ views: 1 }, { where: { id: id } });
    },
    thumbPost: async (user, post) => {
        const check = async (target, handle) => {
            if (isNumber(target)) return target;
            const ref = await handle(target);
            return ref ? ref.id : null;
        }
        let userId = await check(user, userHandle.getUserByName),
            postId = await check(post, topicHandle.getTopicByName);
        if (userId == null || postId == null) return state.NotExist;
        return await thumb.findOrCreate({ where: { userId: userId, postId: postId } });
    },
    commentPost: async (user, post, content) => {
        if (isEmpty(content)) return state.Empty;
        if (content.length < 5) return state.TooShort;
        const check = async (target, handle) => {
            if (isNumber(target)) return target;
            const ref = await handle(target);
            return ref ? ref.id : null;
        }
        let userId = await check(user, userHandle.getUserByName),
            postId = await check(post, topicHandle.getTopicByName);
        if (userId == null || postId == null) return state.NotExist;
        return await comment.findOrCreate({ where: { userId: userId, postId: postId }, defaults: { content: content } });
    },
    /**
     * @param {number|string} user
     * @param {number|string} topic
     * @param {{name:string,preview:string,content:string}} data
     */
    create: async (user, topic, data) => {
        const { name, preview, content } = data;
        if (isEmpty(user) || isEmpty(topic) || isEmpty(name) || isEmpty(content)) return state.Empty;
        const check = async (target, handle) => {
            if (isNumber(target)) return target;
            const ref = await handle(target);
            return ref ? ref.id : null;
        }
        let userId = await check(user, userHandle.getUserByName),
            topicId = await check(topic, topicHandle.getTopicByName);
        if (userId == null || topicId == null) return state.NotExist;
        return post.create({ name: name, preview: preview, content: content, userId: userId, topicId: topicId });
    },
}

module.exports = handle;
