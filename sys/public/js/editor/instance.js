import { defaultConfig } from "./default.js";
import { EditorView, ViewPlugin } from "./dist/view/index.js";
import { EditorState } from "./dist/state/index.js";
import { javascript } from "./dist/javascript.js";
import { glsl } from "./dist/glsl.js";
import { wordCounter } from "./count.js";
import { glslHoverRef } from "./hover.js";

export let instances = {};

export const glslInstance = (name) => {
    instances[name] = EditorState.create({
        doc: localStorage.getItem(name) ||
           '#ifdef GL_ES\n' +
           'precision mediump float;\n' +
           '#endif\n\n' +
           'uniform vec2 u_resolution;\n' +
           'uniform vec2 u_mouse;\n' +
           'uniform float u_time;\n\n' +
           'void main() {\n' +
           '  vec2 st = gl_FragCoord.xy/u_resolution.xy;\n' +
           '  st.x *= u_resolution.x/u_resolution.y;\n\n' +
           '  vec3 color = vec3(0.);\n' +
           '  color = vec3(st.x,st.y,abs(sin(u_time)));\n\n' +
           '  gl_FragColor = vec4(color,1.0);\n' +
           '}',
        extensions: [
            defaultConfig,
            EditorView.lineWrapping, // css white-space
            glsl,
            wordCounter,
            glslHoverRef,
            ViewPlugin.fromClass(class {
                constructor(view) { localStorage.setItem(name, view.state.doc); }
                update(update) { if (update.docChanged) localStorage.setItem(name, update.state.doc); }
                destroy() { delete instances[name] }
            })
        ]
    });
    return instances[name];
}

export const javascriptInstance = (name) => {
    instances[name] = EditorState.create({
        doc: localStorage.getItem(name) ||
            'function hello(who = "world") {\n' +
            '  console.log(`Hello, ${who}!`)\n' +
            '}',
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
    });
    return instances[name];
}

export { EditorView } from "./dist/view/index.js";
export { EditorState } from "./dist/state/index.js";
