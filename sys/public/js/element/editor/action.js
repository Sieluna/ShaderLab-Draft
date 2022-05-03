import Flow from "../../flow/drawflow.js";

const workflowElement = document.getElementById("workflow");

let mobileItemSelec = '', mobileLastMove = null;

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
        case "vertex-shader":
            const vs = `
                <div>
                  <div class="title-box">A vertex shader node</div>
                </div>
                `;
            editor.addNode("vertex-shader", 0,  1, posX, posY, "vertex-shader", {}, vs );
            break;
        case "fragment-shader":
            const fs = `
                <div>
                  <div class="title-box">A fragment shader node</div>
                </div>
                `;
            editor.addNode("fragment-shader", 1,  0, posX, posY, "fragment-shader", {}, fs );
            break;
        default:
    }
}

const drag = event => {
    if (event.type === "touchstart") {
        mobileItemSelec = event.target.closest(".drag-flow").getAttribute("data-node");
    } else {
        console.log(event, event.target.getAttribute("data-node"))
        event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
    }
}

const drop = event => {
    if (event.type === "touchend") {
        let parent = document.elementFromPoint(mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY).closest("#workflow");
        if (parent != null) {
            addNodeToFlow(mobileItemSelec, mobileLastMove.touches[0].clientX, mobileLastMove.touches[0].clientY);
        }
        mobileItemSelec = '';
    } else {
        event.preventDefault();
        let data = event.dataTransfer.getData("node");
        addNodeToFlow(data, event.clientX, event.clientY);
    }
}

export const flowFeature = () => {
    const elements = document.getElementsByClassName("drag-flow");
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("dragstart", drag);
        elements[i].addEventListener("touchstart", drag, false);
        elements[i].addEventListener("touchend", drop, false);
        elements[i].addEventListener("touchmove", event => mobileLastMove = event, false);
    }

    workflowElement.addEventListener("drop", drop);

    workflowElement.addEventListener("dragover", event => event.preventDefault());
}
