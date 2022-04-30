const {getUserRank} = require("./utils");
const rank = require("../config/rank");
const postHandle = require("../handle/user");

module.exports = {
    "getAll": {
        method: "get",
        params: "",
        lambda: async (req, res) => {
            if (getUserRank(req) < rank.User) res.status(400).send("Login for more feature");
            const users = await userHandle.getAllUsers();
            res.status(200).json(users);
        }
    },
    "getById": {

    }
};