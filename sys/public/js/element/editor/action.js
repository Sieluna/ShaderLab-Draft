import Flow from "../../flow/drawflow.js";
import { glslInstance, instances } from "../../editor/instance.js";
import { base, baseFs, baseVs } from "./template.js";

const workflowElement = document.getElementById("workflow");
const holderElement = document.querySelector(".sl-editor .flow-holder");
const createElement = document.querySelector(".sl-editor .flow-create");
const panelElement = document.querySelector(".sl-editor #panel");

let mobileItemSelec = '', mobileLastMove = null;
let tempId = -1, prefabs = {};
export let structure = {
    "drawflow": {
        "Home": {
            "data":{
                "1":{"id":1,"name":"vertex","data":{},"class":"vertex","html":"<div><div class=\"title-box\">vertex shader</div></div>","typenode":false,"inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":1,"pos_y":51},
                "2":{"id":2,"name":"fragment","data":{},"class":"fragment","html":"<div><div class=\"title-box\">fragment shader</div></div>","typenode":false,"inputs":{"input_1":{"connections":[{"node":"1","input":"output_1"}]}},"outputs":{},"pos_x":160,"pos_y":51}
            }
        }
    }
};

const editor = new Flow(workflowElement);
editor.reroute = true;
editor.start();
editor.import(structure);

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

const nodeCreate = id => {
    if (tempId > 0) document.getElementById(`glsl_${tempId}`).style.display = "none";
    let target = document.createElement("div");
    target.id = `glsl_${id}`;
    panelElement.append(target);
    structure.drawflow.Home.data[id] = editor.getNodeFromId(id).name;
    console.log("Node Create ", tempId, id, editor.getNodeFromId(id), structure.drawflow.Home.data);
    switch (structure.drawflow.Home.data[id]) {
        case "vertex":
            glslInstance(`glsl_${id}`, target, baseVs);
            break;
        case "fragment":
            glslInstance(`glsl_${id}`, target, baseFs);
            break;
        default:
            glslInstance(`glsl_${id}`, target, base);
            break;
    }
    tempId = id;
}

export const flowFeature = () => {
    editor.on("nodeCreated", nodeCreate);

    editor.on("nodeSelected", function(id) {
        console.log("select", tempId, id, editor.getNodeFromId(id));
        if (tempId == id) return;
        let target = document.getElementById(`glsl_${id}`);
        if (target) {
            if (tempId > 0) document.getElementById(`glsl_${tempId}`).style.display = "none";
            target.style.display = "block";
            glslInstance("glsl_" + id, target);
            tempId = id;
        } else {
            if (tempId > 0) document.getElementById(`glsl_${tempId}`).style.display = "none";
            target = document.createElement("div");
            target.id = `glsl_${id}`;
            panelElement.append(target);
            glslInstance("glsl_" + id, target);
            tempId = id;
        }
    })

    editor.on("nodeRemoved", function(id) {
        delete structure.drawflow.Home.data[id];
        localStorage.removeItem(`glsl_${id}`);
        instances[`glsl_${id}`].destroy();
        document.getElementById(`glsl_${tempId}`).remove();
        tempId = -1;
    });

    nodeCreate(1); nodeCreate(2);

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
