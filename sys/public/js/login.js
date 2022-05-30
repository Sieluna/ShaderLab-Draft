import { Compiler } from "./element/compile.js";

let scripts = [];

scripts.push(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "css/login.css"
}));

scripts.push(Object.assign(document.createElement("script"), {
    type: "module",
    src: "js/element/login/index.js"
}));

fetch("login.part.html").then(data => data.text()).then(text => {
    document.body.innerHTML = new Compiler(text, {
        page: { home: "./home.html" },
        image: {
            large: "./img/login/background.webp",
            small: "./img/login/background.min.webp"
        }
    }).generate;
});

document.head.append(...scripts);
