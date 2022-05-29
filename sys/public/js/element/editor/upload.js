import { editor, structure } from "./flow.js";

const navShadowRoot = document.querySelector("sl-nav").shadowRoot;
const editorShadowRoot = document.querySelector("sl-editor").shadowRoot;

const postTitleElement = editorShadowRoot.querySelector(".sl-editor__code .post-input");

export const uploadFeature = () => {
    navShadowRoot.querySelector(".upload-entry").addEventListener("click", () => {
        Object.assign(structure, editor.export());
        for (let dataKey in structure.drawflow.Home.data)
            structure[`code_${dataKey}`] = localStorage.getItem(`code_${dataKey}`)
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
};
