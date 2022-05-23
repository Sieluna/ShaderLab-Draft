const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const upload = multer({
    fileFilter: (req, file, callback) => {
        const acceptableMime = [".webp", ".jpeg", ".png", ".jpg", ".gif"];
        callback(null, acceptableMime.includes(path.extname(file.originalname)))
    },
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, "../static/data/user"), // upload target
        filename: function (req, file, callback) {
            let extName = path.extname(file.originalname), fileName = req.auth.id;
            fs.stat(path.resolve(__dirname, "../static/data/user/", fileName + extName), (err, stat) => {
                if (err == null)
                    fs.unlink(path.resolve(__dirname, "../static/data/user/", fileName + extName), () => callback(null, fileName + extName));
                else if (err.code === "ENOENT")
                    callback(null, fileName + extName);
            });
        }
    })
});

const state = require("../config/state.js");
const userHandle = require("../handle/user.js");
const tokenHandle = require("../handle/token.js");

const router = express.Router();

router.get("/", tokenHandle.verify, async (req, res) => {
    const users = await userHandle.getAllUsers(50);
    switch (users) {
        case state.Empty:
            res.status(400).send("Param is empty");
            break;
        default:
            res.status(200).json(users);
            break;
    }
});

router.get("/:id", tokenHandle.verify, async (req, res) => {
    const user = await userHandle.getUser(req.params.id);
    switch (user) {
        case state.NotExist:
            res.status(404).send("User not found");
            break;
        case state.Empty:
            res.status(400).send("Param is empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.post("/login", async (req, res) => {
    const user = await userHandle.login(req.body.account, req.body.password);
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
            res.status(200).json({ data: user, accessToken: tokenHandle.sign(user.id, user.permission), refreshToken: tokenHandle.sign(user.id, user.permission, "", 3600 * 24 * 30) });
            break;
    }
});

router.post("/", async (req, res) => {
    const user = await userHandle.register(req.body.account, req.body.password);
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
            res.status(200).json({ data: await userHandle.getUserById(user.id), accessToken: tokenHandle.sign(user.id, user.permission), refreshToken: tokenHandle.sign(user.id, user.permission, "", 3600 * 24 * 30) });
            break;
    }
});

router.put("/", tokenHandle.verify, async (req, res) => {
    const result = await userHandle.valid(req.auth.id, req.body.password);
    switch (result) {
        case state.OverSize:
            res.status(400).send("Not valid token");
            break;
        case state.Empty:
            res.status(400).send("Not valid body");
            break;
        case state.NotExist:
            res.status(404).send("Invalid token");
            break;
        default:
            if (result.flag) res.status(200).json({ accessToken: tokenHandle.sign(result.data.id, result.data.permission) });
            break;
    }
});

//router.put("/", tokenHandle.verify, async (req, res) => {
//    if (req.auth.id == req.body.id) {
//        const user = await userHandle.updateById(id, req.body);
//        switch (user) {
//            case state.Empty:
//                res.status(400).send("Id could not be empty");
//                break;
//            default:
//                res.status(200).json(user);
//                break;
//        }
//    } else {
//        return res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`)
//    }
//});

router.put("/name", tokenHandle.verify, async (req, res) => {
    const user = await userHandle.updateNameById(req.body.id, req.body.name, req.body.password);
    switch (user) {
        case state.Empty:
            res.status(400).send("Id could not be empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.put("/avatar", tokenHandle.verify, upload.single("avatar"), async (req, res) => {
    const user = await userHandle.updateAvatarById(req.body.id, path.relative(path.resolve(__dirname, "../"), req.file.path).replaceAll("\\", "/"));
    switch (user) {
        case state.Empty:
            res.status(400).send("Id could not be empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.put("/email", tokenHandle.verify, async (req, res) => {
    const user = await userHandle.updateEmailById(req.body.id, req.body.email);
    switch (user) {
        case state.Empty:
            res.status(400).send("Id could not be empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.put("/password", tokenHandle.verify, async (req, res) => {
    const user = await userHandle.updatePasswordById(req.body.id, req.body.password);
    switch (user) {
        case state.Empty:
            res.status(400).send("Id could not be empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.put("/introduction", tokenHandle.verify, async (req, res) => {
    const user = await userHandle.updateIntroductionById(req.body.id, req.body.introduction);
    switch (user) {
        case state.Empty:
            res.status(400).send("Id could not be empty");
            break;
        default:
            res.status(200).json(user);
            break;
    }
});

router.delete("/abort/:id", tokenHandle.verify, async (req, res) => {
    const effect = await userHandle.deprecateById(req.params.id);
    switch (effect) {
        case state.NotExist:
            res.status(404).send("User could not find");
            break;
        case state.Empty:
            res.status(400).send("Params not exist");
            break;
        default:
            res.status(200).end();
            break;
    }
});

router.get("/restore/:id", tokenHandle.verify, async (req, res) => {
    const effect = await userHandle.restoreById(req.params.id);
    switch (effect) {
        case state.NotExist:
            res.status(404).send("User could not find");
            break;
        case state.Empty:
            res.status(400).send("Params not exist");
            break;
        default:
            res.status(200).end();
            break;
    }
});

module.exports = router;
