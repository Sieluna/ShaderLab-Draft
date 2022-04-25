const query = require("./sql.js");
const crypto = require("crypto");
const state = require("../config/state.js");

const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
const isEmpty = (string) => string === undefined ? true : string == null ? true : string === "";

const handle = {
    /**
     * @param {string} data
     * @return {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}|null}
     */
    getUserById: async data => {
        const result = await query('select * from users where user_id = ?', [data]);
        return result.length > 0 ? result[0] : null;
    },
    /**
     * @param {string} data
     * @return {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}|null}
     */
    getUserByName: async data => {
        const result = await query('select * from users where user_name = ?', [data]);
        return result.length > 0 ? result[0] : null;
    },
    /**
     * @param {string} data
     * @return {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}|null}
     */
    getUserByEmail: async data => {
        const result = await query('select * from users where user_email = ?', [data]);
        return result.length > 0 ? result[0] : null;
    },
    /** @return {number} */
    getLastId: async () => {
        const result = await query('select max(user_id) as max from users');
        return result[0].max;
    },
    /**
     * login by user_email or user_name
     * @param {{account:string,password:string}} json
     * @return {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}|number|null}
     */
    login: async json => {
        let account = json.account, password = json.password, user;
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        if (emailReg.test(account) && account.length <= 64)
            user = await handle.getUserByEmail(account);
        else if (account.length <= 16)
            user = await handle.getUserByName(account)
        else return state.OverSize;
        return user != null ?
            user.user_password === crypto.createHash("md5").update(account + password).digest("hex") ? user : state.NotCorrect : state.NotExist;
    },
    /**
     * Register
     * @param {{account:string,password:string}} json
     * @return {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}|number|null}
     */
    register: async json => {
        let account = json.account, password = json.password;
        if (isEmpty(account) || isEmpty(password)) return state.Empty;
        password = crypto.createHash("md5").update(account + password).digest("hex");
        let fallback = emailReg.test(account) ?
            await query('insert into users (user_name, user_email, user_password) values (?, ?, ?);', ["user_" + (await handle.getLastId() + 1), account, password]) :
            await query('insert into users (user_name, user_password) values (?, ?);', [account, password]);
        return fallback.affectedRows > 0 ? await handle.getUserById(fallback.insertId) : fallback;
    },
    /**
     * Update user mysql
     * @param {{user_id:number,user_name:string,user_avatar:string,user_email:string,user_password:string,user_create:string,user_introduction:string}} json
     */
    update: async json => {
        return await query('update users set user_name = ?, user_avatar = ?, user_email = ?, user_password = ?, user_introduction = ? where user_id = ?',
            [json.user_name, json.user_avatar, json.user_email, json.user_password, json.user_introduction, json.user_id]);
    },
}

module.exports = handle;