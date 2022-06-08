let scripts = [];

scripts.push(Object.assign(document.createElement("script"), {
    type: "text/javascript",
    src: "js/element/compile.js"
}));

scripts.push(scripts.push(Object.assign(document.createElement("script"), {
    innerHTML: `
    fetch("login.part.html").then(data => data.text()).then(text => {
        document.body.innerHTML = new compiler(text, {
            page: { home: "./home.html" },
            image: {
                large: "./img/login/background.webp",
                small: "./img/login/background.min.webp"
            }
        }).generate;
    });
    `
})));

scripts.push(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "css/login.css"
}));

scripts.push(Object.assign(document.createElement("script"), {
    type: "module",
    src: "js/element/login/index.js"
}));

document.head.append(...scripts);
