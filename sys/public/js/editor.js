import { EditorState, EditorView, javascriptInstance, glslInstance, instances } from "./editor/instance.js";
import { stateFeature } from "./element/editor/state.js";
import { babylonFeature } from "./element/editor/render.js";
import { flowFeature } from "./element/editor/action.js";

window.view = new EditorView({
    state: glslInstance("buffer1"),
    parent: document.querySelector("#panel")
})

window.onload = () => {
    stateFeature();
    babylonFeature();
    flowFeature();
}
