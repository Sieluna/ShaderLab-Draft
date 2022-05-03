import { EditorState, EditorView, javascriptInstance, glslInstance, instances } from "./editor/instance.js";
import { stateFeature } from "./element/editor/state.js";
import { babylonFeature } from "./element/editor/render.js";
import { flowFeature } from "./element/editor/action.js";
import { userFeature } from "./element/shared/user.js";
import { searchFeature } from "./element/shared/search.js";

const user = {}

const avatar = document.querySelector(".sl-nav .avatar-container");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    avatar.setAttribute("style", "display: block");
} else {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: block"));
    avatar.setAttribute("style", "display: none");
}


window.view = new EditorView({
    state: glslInstance("buffer1"),
    parent: document.querySelector("#panel")
})

window.onload = () => {
    searchFeature();
    userFeature(user);
    stateFeature();
    babylonFeature();
    flowFeature();
}
