const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("home", {
        title: "Shader Lab",
        theme: "#ffe5e5"
    });
});

router.get("/login", (req, res) => {
    res.render("login", {
        title: "Shader Lab",
        theme: "#e5fffc",
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
        title: "Shader Lab",
        theme: "#f2ffe5"
    });
});

module.exports = router;
