const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "./static/data/user" });

const userHandle = require("../handle/user.js");
const state = require("../config/state.js");

/* why post? password should not show in url */
router.post("/login", async (req, res, next) => {
    const user = await userHandle.login({ account: req.body.account, password: req.body.password });
    switch (user) {
        case state.OverSize:
            res.send({ code: 400, msg: "Not valid account or password", data: null });
            break;
        case state.NotCorrect:
            res.send({ code: 400, msg: "Password incorrect!", data: null });
            break;
        case state.NotExist:
            res.send({ code: 400, msg: "Account not exist!", data: null });
            break;
        case state.Empty:
            res.send({ code: 400, msg: "Account or password can not be empty.", data: null });
            break;
        default:
            res.send({ code: 200, msg: "Login success!", data: user });
            break;
    }
});

router.post("/register", async (req, res, next) => {
    const user = await userHandle.register({ account: req.body.account, password: req.body.password });
    switch (user) {
        case state.Duplicate:
            res.send({ code: 400, msg: "Account already exist", data: null });
            break;
        case state.OverSize:
            res.send({ code: 400, msg: "Account or password is too long", data: null });
            break;
        case state.Empty:
            res.send({ code: 400, msg: "Account or password can not be empty.", data: null });
            break;
        default:
            res.send({ code: 200, msg: "Register success!", data: user });
            break;
    }
});

router.post('/update', upload.single("image"), async (req, res, next) => {
    const user = await userHandle.update({account: req.query.account, password: req.query.password});
    switch (user) {
        case state.Duplicate:
            res.send({ code: 400, msg: "Account already exist", data: null });
            break;
        case state.OverSize:
            res.send({ code: 400, msg: "Account or password is too long", data: null });
            break;
        case state.NotCorrect:
            res.send({ code: 400, msg: "Register fail!", data: null });
            break;
        default:
            res.send({ code: 200, msg: "Register success!", data: user });
            break;
    }
});

module.exports = router;