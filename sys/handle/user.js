const { user } = require("./sql.js").models;
const crypto = require("crypto");
const state = require("../config/state.js");

const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
const isEmpty = (string) => string === undefined ? true : string == null ? true : string === "";

const handle = {
    /**
     * @param {number} id
     * @return {any|null}
     */
    getUserById: async id => {
        const result = await user.findByPk(id);
        return result ? result : null;
    },
    /**
     * @param {string} name
     * @return {any|null}
     */
    getUserByName: async name => {
        const result = await user.findOne({ where: { name: name }});
        return result ? result : null;
    },
    /**
     * @param {string} email
     * @return {any|null}
     */
    getUserByEmail: async email => {
        const result = await user.findOne({ where: { email: email }});
        return result ? result : null;
    },
    /** @return {number} */
    getLastId: async () => {
        return await user.max("user_id");
    },
    /**
     * @param {number} [num]
     * @return any[]
     */
    getAllUsers: async (num) => {
        return num ? await user.findAll({ limit: num }) : await user.findAll();
    },
    /**
     * login by email or name
     * @param {{account:string,password:string}} json
     * @return {any|number|null}
     */
    login: async json => {
        let account = json.account, password = json.password, user;
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        password = crypto.createHash("md5").update(account + password).digest("hex");
        if (emailReg.test(account) && account.length <= 64)
            user = await handle.getUserByEmail(account);
        else if (account.length <= 16)
            user = await handle.getUserByName(account)
        else return state.OverSize;
        return user != null ? user.password === password ? user : state.NotCorrect : state.NotExist;
    },
    /**
     * Register
     * @param {{account:string,password:string}} json
     * @return {any|number|null}
     */
    register: async json => {
        let account = json.account, password = json.password;
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        if (emailReg.test(account) && (account.length <= 64))
            return await user.create({ email: account, password: password });
        else if (account.length <= 16)
            return await user.create({ name: account, password: password });
        else return state.OverSize;
    },
    /**
     * Update user mysql
     * @param {number} userId id
     * @param partial data
     * @param [partial.id] id
     * @param [partial.name] name
     * @param [partial.avatar] avatar
     * @param [partial.email] email
     * @param [partial.password] password
     * @param [partial.introduction] introduction
     */
    update: async (userId, partial) => {
        return await user.update(partial, { where: { id: userId }});
    },
    abort: async id => {
        const result = await user.destroy({ where: { id: id }});
        return result > 0 ?  result : null
    }
}

module.exports = handle;