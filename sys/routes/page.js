const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("home", {
        title: "Shader Lab"
    });
});

router.get("/login", (req, res) => {
    res.render("login", {
        title: "Shader Lab",
        page: {
            home: "/"
        },
        image: {
            large: "/img/login/background.webp",
            small: "/img/login/background.min.webp"
        }
    });
});

router.get("/editor", (req, res) => {
    res.render("editor", {
        title: "Shader Lab"
    });
});

module.exports = router;
