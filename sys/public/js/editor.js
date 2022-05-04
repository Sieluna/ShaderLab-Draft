import { stateFeature } from "./element/editor/state.js";
import { babylonFeature } from "./element/editor/render.js";
import { flowFeature, editor, structure } from "./element/editor/action.js";
import { userFeature } from "./element/shared/user.js";
import { searchFeature } from "./element/shared/search.js";


const user = {}

const avatarElement = document.querySelector(".sl-nav .avatar-container");
const panelElement = document.querySelector(".sl-editor #panel");
const postTitleElement = document.querySelector(".sl-editor .post-input");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    avatarElement.setAttribute("style", "display: block");
} else {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: block"));
    avatarElement.setAttribute("style", "display: none");
}

window.onload = () => {
    document.querySelector(".sl-nav .upload-entry").addEventListener("click", () => {
        Object.assign(structure, editor.export());
        for (let dataKey in structure.drawflow.Home.data)
            structure[`glsl_${dataKey}`] = localStorage.getItem(`glsl_${dataKey}`)
        console.log(postTitleElement.value, JSON.stringify(structure));
        //let formData = new FormData();
        //formData.append("topic", "");
        //formData.append("name", postTitleElement.value);
        //formData.append("content", "")
        //fetch("/api/post", {
        //    method: "POST",
        //    headers: new Headers({ "Authorization": "Bearer " + localStorage.getItem("token") }),
        //    body: formData,
        //})
    });
    searchFeature();
    userFeature(user);
    stateFeature();
    babylonFeature();
    flowFeature();
}

export { structure }
