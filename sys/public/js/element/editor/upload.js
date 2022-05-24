import { editor, structure } from "./flow.js";

const postTitleElement = document.querySelector(".sl-editor .post-input");

export const uploadFeature = () => {
    document.querySelector(".sl-nav .upload-entry").addEventListener("click", () => {
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
