import { defaultConfig } from "./default.js";
import { EditorView, ViewPlugin } from "./dist/view/index.js";
import { EditorState } from "./dist/state/index.js";
import { javascript } from "./dist/javascript.js";
import { glsl } from "./dist/glsl.js";
import { wordCounter } from "./bottom.js";
import { glslHoverRef } from "./hover.js";

export let instances = {};

export const glslInstance = (name, dom, override = null) => {
    if (instances[name]) return instances[name];
    instances[name] = new EditorView({
        state: EditorState.create({
            doc: override ? override : localStorage.getItem(name),
            extensions: [
                defaultConfig,
                EditorView.lineWrapping, // css white-space
                glsl,
                wordCounter,
                glslHoverRef,
                ViewPlugin.fromClass(class {
                    constructor(view) { localStorage.setItem(name, view.state.doc); }
                    update(update) { if (update.docChanged) localStorage.setItem(name, update.state.doc); }
                    destroy() { delete instances[name]; }
                })
            ]
        }),
        parent: dom
    });
    return instances[name];
}

export const javascriptInstance = (name, dom, override = null) => {
    if (instances[name]) return instances[name];
    instances[name] = new EditorView({
        state: EditorState.create({
            doc:  override ? override : localStorage.getItem(name),
            extensions: [
                defaultConfig,
                EditorView.lineWrapping, // css white-space
                javascript(),
                wordCounter,
                ViewPlugin.fromClass(class {
                    constructor(view) { localStorage.setItem(name, view.state.doc); }
                    update(update) { if (update.docChanged) localStorage.setItem(name, update.state.doc); }
                    destroy() { delete instances[name] }
                })
            ]
        }),
        parent: dom
    });
    return instances[name];
}

export { EditorView } from "./dist/view/index.js";
export { EditorState } from "./dist/state/index.js";
