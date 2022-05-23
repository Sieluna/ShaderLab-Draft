import { stateFeature } from "./element/editor/state.js";
import { renderFeature } from "./element/editor/render.js";
import { flowFeature, editor, structure } from "./element/editor/flow.js";
import { userFeature } from "./element/shared/avatar.js";
import { searchFeature } from "./element/shared/search.js";
import { refreshFeature } from "./element/shared/refresh.js";

const token = JSON.parse(localStorage.getItem("token"));
const user = JSON.parse(localStorage.getItem("user"));

const postTitleElement = document.querySelector(".sl-editor .post-input");

window.onload = () => {
    document.querySelector(".sl-nav .upload-entry").addEventListener("click", () => {
        Object.assign(structure, editor.export());
        for (let dataKey in structure.drawflow.Home.data)
            structure[`glsl_${dataKey}`] = localStorage.getItem(`glsl_${dataKey}`)
        console.log(postTitleElement.value, JSON.stringify(structure));
        let formData = new FormData();
        formData.append("topic", "");
        formData.append("name", postTitleElement.value);
        formData.append("content", JSON.stringify(structure))
        fetch("/api/post", {
            method: "POST",
            headers: new Headers({ "Authorization": "Bearer " + localStorage.getItem("token") }),
            body: formData,
        }).then(res => {
            return res.json();
        }).then(json => {
            switch (json.status) {
                case 200:
                    alert(json.msg)
                    break;
                default:
                    alert(json.msg);
            }
        })
    });
    refreshFeature(token, user);
    userFeature(token, user);
    searchFeature();
    stateFeature();
    flowFeature();
    renderFeature(false);
}

export { structure }
