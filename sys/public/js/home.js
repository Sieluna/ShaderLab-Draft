let scripts = [];

scripts.push(Object.assign(document.createElement("script"), {
    async: true,
    src: "https://cdn.jsdelivr.net/npm/sweetalert2"
}));

scripts.push(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "css/home.css"
}));

scripts.push(Object.assign(document.createElement("script"), {
    type: "module",
    src: "js/element/home/index.js"
}));

document.currentScript.after(...scripts);
