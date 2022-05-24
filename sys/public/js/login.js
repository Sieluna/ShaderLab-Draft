let scripts = [];

scripts.push(Object.assign(document.createElement("script"), {
    async: true,
    src: "https://cdn.jsdelivr.net/npm/sweetalert2"
}));

scripts.push(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "css/login.css"
}));

scripts.push(Object.assign(document.createElement("script"), {
    type: "module",
    src: "js/element/login/index.js"
}));

document.currentScript.after(...scripts);
