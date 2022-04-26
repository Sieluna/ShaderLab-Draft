const express = require("express");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "./static/data/user") });

const userHandle = require("../handle/user.js");
const state = require("../config/state.js");
const { getIdParam } = require("./utils.js");

module.exports = {
    "getAll": {
        method: "get",
        params: "",
        lambda: async (req, res) => {
            const users = await userHandle.getAllUsers();
            res.status(200).json(users);
        }
    },
    "getById": {
        method: "get",
        params: ["/:id"],
        lambda: async (req, res) => {
            try {
                const id = getIdParam(req);
                const user = await userHandle.getUserById(Number.parseInt(req.params.id, 10));
                user ? res.status(200).json(user) : res.status(404).send("User not found");
            } catch(error) {
                console.log(error);
            }
        }
    },
    "login": {
        method: "post",
        params: ["login"],
        lambda: async (req, res) => {
            if (req.body.account || req.body.password) res.status(403).send("Error body");
            const user = await userHandle.login({ account: req.body.account, password: req.body.password });
            switch (user) {
                case state.OverSize:
                    res.status(400).send("Not valid account or password");
                    break;
                case state.NotCorrect:
                    res.status(400).send("Password incorrect!");
                    break;
                case state.NotExist:
                    res.status(400).send("Account not exist!");
                    break;
                case state.Empty:
                    res.status(400).send("Account or password can not be empty.");
                    break;
                default:
                    res.status(200).json({ msg: "Login success!", data: user });
                    break;
            }
        }
    },
    "create": {
        method: "post",
        params: "",
        lambda: async (req, res) => {
            if (req.body.account || req.body.password) res.status(403).send("Error body");
            const user = await userHandle.register({ account: req.body.account, password: req.body.password });
            switch (user) {
                case state.Duplicate:
                    res.status(400).send("Account already exist");
                    break;
                case state.OverSize:
                    res.status(400).send("Account or password is too long");
                    break;
                case state.Empty:
                    res.status(400).send("Account or password can not be empty.");
                    break;
                default:
                    res.status(200).json({ msg: "Register success!", data: user });
                    break;
            }
        }
    },
    "update": {
        method: "put",
        params: ["/:id"],
        lambda: async (req, res) => {
            try {
                const id = getIdParam(req);
                if (req.body.id === id) {
                    const user = await userHandle.update(id, req.body);
                } else {
                    return res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`)
                }
            } catch(error) {
                console.log(error);
            }
        }
    },
    "delete": {
        method: "delete",
        params: ["/:id"],
        lambda: async (req, res) => {
            try {
                const id = getIdParam(req);
                const effect = await userHandle.abort(id);
                effect ? res.status(200).end() : res.status(404).send("User could not find");
            } catch(error) {
                console.log(error);
            }
        }
    }
}