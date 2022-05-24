import { vsNode, fsNode, imageNode, meshNode, bufferNode, customNode } from "./node.js";
import { editor, prefabs } from "../flow.js";

const holderElement = document.querySelector(".sl-editor .flow-holder");

const lockElement = document.querySelector(".sl-editor #workflow .workflow-lock .lock");
const unlockElement = document.querySelector(".sl-editor #workflow .workflow-lock .unlock");
const minusElement = document.querySelector(".sl-editor #workflow .workflow-zoom .minus");
const fitElement = document.querySelector(".sl-editor #workflow .workflow-zoom .fit");
const plusElement = document.querySelector(".sl-editor #workflow .workflow-zoom .plus");

let mobileItemSelec = '', mobileLastMove = null;

const addNodeToFlow = (name, posX, posY) => {
    if(editor.editor_mode == "fixed") return false;
    posX = posX * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    posY = posY * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));
    switch (name) {
        case "vertex":
            editor.addNode("vertex", 1, 1, posX, posY, "vertex", {}, vsNode);
            break;
        case "fragment":
            editor.addNode("fragment", 1, 0, posX, posY, "fragment", {}, fsNode);
            break;
        case "image":
            editor.addNode("image", 0, 1, posX, posY, "image", {}, imageNode);
            break;
        case "mesh":
            editor.addNode("mesh", 0, 1, posX, posY, "mesh", {}, meshNode);
            break;
        case "buffer":
            editor.addNode("buffer", 0, 1, posX, posY, "buffer", { name: name }, bufferNode);
            break;
        default:
            if (prefabs[name])
                editor.addNode(name, 0, 1, posX, posY, "custom", { name: name }, customNode);
            break;
    }
};

const changeMode = option => {
    if(option == "lock") {
        lockElement.style.display = "none";
        unlockElement.style.display = "block";
    } else {
        lockElement.style.display = "block";
        unlockElement.style.display = "none";
    }
};

export const drag = event => {
    if (event.type == "touchstart") {
        mobileItemSelec = event.target.closest(".flow-drag").getAttribute("data-node");
    } else {
        event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
    }
};

export const drop = event => {
    if (event.type == "touchend") {
        let parent = document.elementFromPoint(mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY).closest("#workflow");
        if (parent != null)
            addNodeToFlow(mobileItemSelec, mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY);
        mobileItemSelec = '';
    } else {
        event.preventDefault();
        let data = event.dataTransfer.getData("node");
        addNodeToFlow(data, event.clientX, event.clientY);
    }
};

export const linkEventListener = () => {
    editor.zoom_reset(0.8);
    lockElement.addEventListener("click", () => {
        editor.editor_mode = "fixed";
        changeMode("lock");
    });
    unlockElement.addEventListener("click", () => {
        editor.editor_mode = "edit";
        changeMode("unlock");
    });
    minusElement.addEventListener("click", () => editor.zoom_out());
    fitElement.addEventListener("click", () => editor.zoom_reset());
    plusElement.addEventListener("click", () => editor.zoom_in());
};

export const bindEventListener = node => {
    node.addEventListener("dragstart", drag);
    node.addEventListener("touchstart", drag, false);
    node.addEventListener("touchend", drop, false);
    node.addEventListener("touchmove", event => mobileLastMove = event, false);
    holderElement.append(node);
};
