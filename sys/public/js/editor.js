import { EditorState, EditorView, javascriptInstance, glslInstance, instances } from "./editor/instance.js";
import { stateFeature } from "./element/editor/state.js";
import { babylonFeature } from "./element/editor/render.js";
import { flowFeature, editor } from "./element/editor/action.js";
import { userFeature } from "./element/shared/user.js";
import { searchFeature } from "./element/shared/search.js";
import { base, baseVs, baseFs } from "./element/editor/template.js";

const user = {}

const compileElement = document.querySelectorAll(".sl-editor .compile");
const avatarElement = document.querySelector(".sl-nav .avatar-container");
const panelElement = document.querySelector(".sl-editor #panel");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    avatarElement.setAttribute("style", "display: block");
} else {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: block"));
    avatarElement.setAttribute("style", "display: none");
}

let tempId = -1, structure = [];

editor.on("nodeCreated", function(id) {
    if (tempId > 0) document.getElementById(`glsl_${tempId}`).style.display = "none";
    let target = document.createElement("div");
    target.id = `glsl_${id}`;
    panelElement.append(target);
    structure[id] = editor.getNodeFromId(id).name;
    switch (structure[id]) {
        case "vertex":
            glslInstance("glsl_" + id, target, baseVs);
            break;
        case "fragment":
            glslInstance("glsl_" + id, target, baseFs);
            break;
        default:
            glslInstance("glsl_" + id, target, base);
            break;
    }
    tempId = id;
})

editor.on("nodeSelected", function(id) {
    console.log("select", tempId, id, editor.getNodeFromId(id));
    if (tempId == id) return
    let target = document.getElementById(`glsl_${id}`);
    if (target) {
        document.getElementById(`glsl_${tempId}`).style.display = "none";
        target.style.display = "block";
        glslInstance("glsl_" + id, target);
        tempId = id;
    } else {
        document.getElementById(`glsl_${tempId}`).style.display = "none";
        target = document.createElement("div");
        target.id = `glsl_${id}`;
        panelElement.append(target);
        glslInstance("glsl_" + id, target);
        tempId = id;
    }
})

window.onload = () => {
    //document.addEventListener("click", () => {
    //    let formData = new FormData();
    //    formData.append("topic", "");
    //    formData.append("name", "");
    //    formData.append("content", "")
    //    fetch("/api/post", {
    //        method: "POST",
    //        headers: new Headers({ "Authorization": "Bearer " + localStorage.getItem("token") }),
    //        body: formData,
    //    })
    //});
    searchFeature();
    userFeature(user);
    stateFeature();
    babylonFeature();
    flowFeature();
}

export { structure }
