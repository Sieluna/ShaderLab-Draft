import Flow from "../../flow/drawflow.js";
import { glslInstance, instances } from "../../editor/instance.js";
import { base, baseFs, baseVs } from "./flow/template.js";
import { structure } from "./flow/structure.js";
import { linkEventListener, bindEventListener, drop } from "./flow/action.js";

const workflowElement = document.getElementById("workflow");
const createElement = document.querySelector(".sl-editor .flow-create");
const panelElement = document.querySelector(".sl-editor #panel");

export let prefabs = {};

let tempId = -1;

const editor = new Flow(workflowElement);
editor.start();
editor.import(structure);

const prefab = (node, info) => {
    let data = document.createElement("div");
    data.setAttribute("class", "flow-drag");
    data.setAttribute("draggable", true);
    data.setAttribute("data-node", node);
    data.innerHTML = info;
    return data;
};

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
    linkEventListener();

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
    prefabs["image"] = prefab("image", `<span>Image</span>`);
    bindEventListener(prefabs["image"]);
    prefabs["mesh"] = prefab("mesh", `<span>Mesh</span>`);
    bindEventListener(prefabs["mesh"]);

    createElement.addEventListener("click", () => {
        const index = (Object.keys(prefabs).length - 3);
        const name = "buffer" + index;
        prefabs[name] = prefab(name, `<span>Buffer${index}</span>`);
        bindEventListener(prefabs[name]);
    });
}


export { editor, structure };
