const { user } = require("./model.js").models;
const crypto = require("crypto");
const state = require("../config/state.js");
const { isEmail, isEmpty, isNumber } = require("./utils.js");

const safeProperty = ["id", "name", "avatar", "email", "password", "introduction"];

const handle = {
    /**
     * Get user data, a wrapper of {@link getUserById} and {@link getUserNameOrEmail}
     * @param {number|string} data
     * @return {Promise<user|state>}
     */
    getUser: async data => {
        if (isEmpty(data)) return state.Empty;
        return isNumber(data) ? await handle.getUserById(data) : await handle.getUserNameOrEmail(data);
    },
    /**
     * Get user data by id (unsafe)
     * @param {number|string} id
     * @return {Promise<user|state>}
     */
    getUserById: async id => {
        const result = await user.findByPk(id);
        return result ? result : state.NotExist;
    },
    /**
     * Get user data by name (unsafe)
     * @param {string} name
     * @return {Promise<user|state>}
     */
    getUserByName: async name => {
        const result = await user.findOne({ where: { name: name }});
        return result ? result : state.NotExist;
    },
    /**
     * Get user data by email (unsafe)
     * @param {string} email
     * @return {Promise<user|state>}
     */
    getUserByEmail: async email => {
        const result = await user.findOne({ where: { email: email }});
        return result ? result : state.NotExist;
    },
    /**
     * Get user by name or email
     * @param {string} data
     * @return {Promise<user|state>}
     */
    getUserNameOrEmail: async data => {
        if (isEmail(data) && data.length <= 250)
            return await handle.getUserByEmail(data);
        else if (data.length <= 16)
            return await handle.getUserByName(data);
        else return state.OverSize;
    },
    /**
     * Get the last index in the table
     * @param {number} [offset] the offset of the counter
     * @return {Promise<number>}
     */
    getLastId: async (offset = 0) => {
        return await user.max("user_id") + offset;
    },
    /**
     * Get all users
     * @param {number|string} [limit]
     * @return {Promise<user[]>}
     */
    getAllUsers: async limit => {
        if (limit) {
            if (!isNumber(limit)) return state.Empty;
            return await user.findAll({ limit: limit });
        } else {
            return await user.findAll();
        }
    },
    /**
     * Login by email or name
     * @param {string} account
     * @param {string} password
     * @return {Promise<user|state>}
     */
    login: async (account, password) => {
        let tempPsw, user;
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        user = await handle.getUserNameOrEmail(account);
        tempPsw = crypto.createHash("md5").update(user.name + password).digest("hex");
        return user.password ? user.password === tempPsw ? user : state.NotCorrect : user;
    },
    /**
     * Register by email or name
     * @param {string} account
     * @param {string} password
     * @return {Promise<user|state>}
     */
    register: async (account, password) => {
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        if (isEmail(account) && account.length <= 250) {
            if ((await handle.getUserByName(account)).id) return state.Duplicate;
            return await user.create({ name: "User_" + (await handle.getLastId(1)), email: account, password: password });
        } else if (account.length <= 16) {
            if ((await handle.getUserByName(account)).id) return state.Duplicate;
            return await user.create({ name: account, password: password });
        } else return state.OverSize;
    },
    /**
     * Update user mysql Admin entrance (unsafe)
     * @param {number|string} id id
     * @param data data
     * @param [data.id] id
     * @param [data.name] name
     * @param [data.avatar] avatar
     * @param [data.email] email
     * @param [data.password] password
     * @param [data.introduction] introduction
     * @return {Promise<[number,user]>}
     */
    updateById: async (id, data) => {
        if (!isNumber(id)) return state.Empty;
        let rebuild = {}; Object.keys(data).forEach(property => {
            if (property !== "id" && safeProperty.includes(property))
                rebuild[property] = data[property];
        });
        return await user.update(rebuild, { where: { id: id }, individualHooks: true});
    },
    /**
     * Update user name by id
     * @param {number|string} id
     * @param {string} account
     * @param {string} password
     * @return {Promise<[number,user]>}
     */
    updateNameById: async (id, account, password) => {
        if (!isNumber(id) || isEmpty(account) || isEmpty(password)) return state.Empty;
        return await user.update({ name: account, password: password }, { where: { id: id }, individualHooks: true });
    },
    /**
     * Update user avatar(url) by id
     * @param {number|string} id
     * @param {string} image
     * @return {Promise<[number,user]>}
     */
    updateAvatarById: async (id, image) => {
        if (!isNumber(id) || isEmpty(image)) return state.Empty;
        return await user.update({ avatar: image }, { where: { id: id }, individualHooks: true });
    },
    /**
     * Update user email by id
     * @param {number|string} id
     * @param {string} email
     * @return {Promise<[number,user]>}
     */
    updateEmailById: async (id, email) => {
        if (!isNumber(id) || isEmpty(email)) return state.Empty;
        return await user.update({ email: email }, { where: { id: id }, individualHooks: true });
    },
    /**
     * Update user password by id
     * @param {number|string} id
     * @param {string} password
     * @return {Promise<[number,user]>}
     */
    updatePasswordById: async (id, password) => {
        if (!isNumber(id) || isEmpty(password)) return state.Empty;
        return await user.update({ password: password }, { where: { id: id }, individualHooks: true });
    },
    /**
     * Update user introduction by id
     * @param {number|string} id
     * @param {string} text
     * @return {Promise<[number,user]>}
     */
    updateIntroductionById: async (id, text) => {
        if (!isNumber(id) || isEmpty(text)) return state.Empty;
        return await user.update({ introduction: text }, { where: { id: id }, individualHooks: true });
    },
    /**
     * Deprecate user by id
     * @param {number|string} id
     * @return {Promise<number|state>} number of rows effected
     */
    deprecateById: async id => {
        if (!isNumber(id)) return state.Empty;
        const result = await user.destroy({ where: { id: id }});
        return Number(result) > 0 ?  result : state.NotExist;
    },
    /**
     * Restore user by id
     * @param {number|string} id
     * @return {Promise<number|state>} number of rows effected
     */
    restoreById: async id => {
        if (!isNumber(id)) return state.Empty;
        const result = await user.restore({ where: { id: id }});
        return Number(result) > 0 ? result : state.NotExist;
    }
};

module.exports = handle;
