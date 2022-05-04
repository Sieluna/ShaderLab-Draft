import Flow from "../../flow/drawflow.js";

const workflowElement = document.getElementById("workflow");
const holderElement = document.querySelector(".sl-editor .flow-holder");
const createElement = document.querySelector(".sl-editor .flow-create");

let mobileItemSelec = '', mobileLastMove = null;
let prefabs = JSON.parse(localStorage.getItem("pipeline")) || {};

const editor = new Flow(workflowElement);
editor.reroute = true;
//const dataToImport = {}
editor.start();
//editor.import(dataToImport);

const addNodeToFlow = (name, posX, posY) => {
    if(editor.editor_mode === "fixed") return false;
    posX = posX * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    posY = posY * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));
    switch (name) {
        case "vertex":
            const vs = `<div><div class="title-box">vertex shader</div></div>`;
            editor.addNode("vertex", 0, 1, posX, posY, "vertex", {}, vs);
            break;
        case "fragment":
            const fs = `<div><div class="title-box">fragment shader</div></div>`;
            editor.addNode("fragment", 1, 0, posX, posY, "fragment", {}, fs);
            break;
        default:
            if (prefabs[name]) {
                const info = `<div><div class="title-box"><input type="text" df-name placeholder="RT name"><br></div></div>`;
                editor.addNode(name, 1, 1, posX, posY, "flow-import", {"name": name}, info);
            }
            break;
    }
}

const drag = event => {
    if (event.type === "touchstart") {
        mobileItemSelec = event.target.closest(".flow-drag").getAttribute("data-node");
    } else {
        event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
    }
}

const drop = event => {
    if (event.type === "touchend") {
        let parent = document.elementFromPoint(mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY).closest("#workflow");
        if (parent != null)
            addNodeToFlow(mobileItemSelec, mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY);
        mobileItemSelec = '';
    } else {
        event.preventDefault();
        let data = event.dataTransfer.getData("node");
        addNodeToFlow(data, event.clientX, event.clientY);
    }
}

const prefab = (node, info) => {
    let data = document.createElement("div");
    data.setAttribute("class", "flow-drag");
    data.setAttribute("draggable", true);
    data.setAttribute("data-node", node);
    data.innerHTML = info;
    return data;
};

const bindEventListener = node => {
    node.addEventListener("dragstart", drag);
    node.addEventListener("touchstart", drag, false);
    node.addEventListener("touchend", drop, false);
    node.addEventListener("touchmove", event => mobileLastMove = event, false);
    holderElement.append(node);
}

export const flowFeature = () => {
    workflowElement.addEventListener("drop", drop);
    workflowElement.addEventListener("dragover", event => event.preventDefault());

    prefabs["vertex"] = prefab("vertex", `<span>VS</span>`);
    bindEventListener(prefabs["vertex"]);
    prefabs["fragment"] = prefab("fragment", `<span>FS</span>`);
    bindEventListener(prefabs["fragment"]);

    createElement.addEventListener("click", () => {
        const name = "buffer" + (Object.keys(prefabs).length - 1);
        prefabs[name] = prefab(name, `<span>Buffer</span>`);
        bindEventListener(prefabs[name]);
    });
}


export { editor };
