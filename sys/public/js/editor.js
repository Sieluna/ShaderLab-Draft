let scripts = [];

if (HTMLScriptElement.supports && HTMLScriptElement.supports("importmap")) {
    scripts.push(Object.assign(document.createElement("script"), {
        type: "importmap",
        innerHTML: JSON.stringify({
            imports: {
                tslib: "https://cdn.jsdelivr.net/npm/tslib/tslib.es6.js"
            }
        })
    }));
} else {
    scripts.push(Object.assign(document.createElement("script"), {
        async: true,
        src: "https://cdn.jsdelivr.net/npm/es-module-shims/dist/es-module-shims.min.js"
    }));
    scripts.push(Object.assign(document.createElement("script"), {
        type: "importmap",
        innerHTML: JSON.stringify({
            imports: {
                tslib: "https://cdn.jsdelivr.net/npm/tslib/tslib.es6.js"
            }
        })
    }));
}

scripts.push(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "css/editor.css"
}));

scripts.push(Object.assign(document.createElement("script"), {
    type: "module",
    src: "js/element/editor/index.js"
}));

document.currentScript.after(...scripts);
