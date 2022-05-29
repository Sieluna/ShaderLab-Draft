import { default as Flow } from "../../flow/drawflow.js";
import { glslInstance, instances, javascriptInstance } from "../../editor/instance.js";
import { baseFs, baseVs, baseFeature } from "./flow/template.js";
import { structure } from "./flow/structure.js";
import { linkEventListener, bindEventListener, drop } from "./flow/action.js";

const shadowRoot = document.querySelector("sl-editor").shadowRoot;

const workflowElement = shadowRoot.getElementById("sl-editor__workflow");
const createElement = shadowRoot.querySelector(".sl-editor__pipeline .flow-create");
const panelElement = shadowRoot.querySelector(".sl-editor__code #panel");

export let prefabs = {};
let prefabLinks = {}, tempId = -1;

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

/**
 * Create a node
 * @param id id of the node create
 */
const nodeCreate = id => {
    if (tempId > 0) shadowRoot.getElementById(`code_${tempId}`).style.display = "none";
    let target = document.createElement("div");
    target.id = `code_${id}`;
    panelElement.append(target);
    structure.drawflow.Home.data[id] = editor.getNodeFromId(id).name;
    console.log("Node Create ", tempId, id, editor.getNodeFromId(id), structure.drawflow.Home.data);
    switch (structure.drawflow.Home.data[id]) {
        case "vertex":
            glslInstance(`code_${id}`, target, baseVs);
            break;
        case "fragment":
            glslInstance(`code_${id}`, target, baseFs);
            break;
        default:
            if (editor.getNodeFromId(id).name.includes("custom"))
                javascriptInstance(`code_${id}`, target, baseFeature);
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
        let target = shadowRoot.getElementById(`code_${id}`);
        if (target) {
            if (tempId > 0) shadowRoot.getElementById(`code_${tempId}`).style.display = "none";
            target.style.display = "block";
            tempId = id;
        } else {
            if (tempId > 0) shadowRoot.getElementById(`code_${tempId}`).style.display = "none";
            target = document.createElement("div");
            target.id = `code_${id}`;
            panelElement.append(target);
            tempId = id;
        }
    })

    editor.on("nodeRemoved", function(id) {
        delete structure.drawflow.Home.data[id];
        localStorage.removeItem(`code_${id}`);
        instances[`code_${id}`].destroy();
        shadowRoot.getElementById(`code_${tempId}`).remove();
        tempId = -1;
    });

    nodeCreate(1); nodeCreate(2);

    workflowElement.addEventListener("drop", drop);
    workflowElement.addEventListener("dragover", event => event.preventDefault());

    prefabs["vertex"] = prefab("vertex", `<img src="/img/editor/shader.svg" alt=""><span>VS</span>`);
    bindEventListener(prefabs["vertex"]);
    prefabs["fragment"] = prefab("fragment", `<img src="/img/editor/shader.svg" alt=""><span>FS</span>`);
    bindEventListener(prefabs["fragment"]);
    prefabs["image"] = prefab("image", `<img src="/img/editor/image.svg" alt=""><span>Image</span>`);
    bindEventListener(prefabs["image"]);
    prefabs["mesh"] = prefab("mesh", `<img src="/img/editor/grid.svg" alt=""><span>Mesh</span>`);
    bindEventListener(prefabs["mesh"]);
    prefabs["buffer"] = prefab("buffer", `<img src="/img/editor/buffer.svg" alt=""><span>Buffer</span>`)
    bindEventListener(prefabs["buffer"]);

    createElement.addEventListener("click", () => {
        const index = (Object.keys(prefabs).length - 4);
        const name = "custom" + index;
        prefabs[name] = prefab(name, `<img src="/img/editor/code.svg" alt=""><span>Node ${index}</span>`);
        bindEventListener(prefabs[name]);
        console.log(prefabs);
    });
}


export { editor, structure };
