import { playState } from "../state.js";
import { structure } from "../flow.js";
import { Engine, Scene, ArcRotateCamera, MeshBuilder, ShaderMaterial, Texture, Vector3 } from "https://cdn.jsdelivr.net/npm/@babylonjs/core/index.js";

const canvasElement = document.getElementById("render-canvas");
const timeElement = document.querySelector(".sl-editor .renderer-time");
const fpsElement = document.querySelector(".sl-editor .renderer-fps");

let time = 0, engine, scene, camera, shaderMaterial, mesh;

const search = target => {
    for (let dataKey in structure.drawflow.Home.data) {
        if (structure.drawflow.Home.data[dataKey] === target)
            return dataKey;
    }
}

export const compile = () => {
    if (shaderMaterial) shaderMaterial.dispose(true);

    shaderMaterial = new ShaderMaterial("shader", scene, {
        vertexSource: localStorage.getItem("code_" + search("vertex")),
        fragmentSource: localStorage.getItem("code_" + search("fragment")),
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    }, false);

    let refTexture = new Texture("img/editor/ref.jpg", scene);
    refTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
    refTexture.wrapV = Texture.CLAMP_ADDRESSMODE;

    let mainTexture = new Texture("img/editor/amiga.jpg", scene);

    shaderMaterial.setTexture("textureSampler", mainTexture);
    shaderMaterial.setTexture("refSampler", refTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", Vector3.Zero());
    shaderMaterial.backFaceCulling = false;

    mesh.material = shaderMaterial;

    shaderMaterial.onCompiled = () => console.log("Compile success");
    shaderMaterial.onError = () => console.log("Fail");
};

export const feature = () => {
    if (Engine.isSupported()) {
        engine = new Engine(canvasElement, true);
        scene = new Scene(engine);

        mesh = MeshBuilder.CreateTorusKnot("mesh", { radius: 2, tube: 0.5, radialSegments: 128, tubularSegments: 64, p: 2, q: 3 }, scene)

        camera = new ArcRotateCamera("Camera", 0, Math.PI / 2, 12, Vector3.Zero(), scene);

        camera.attachControl(canvasElement, false);
        camera.lowerRadiusLimit = 1;
        camera.minZ = 1.0;

        engine.runRenderLoop(function () {
            if (playState === false) return;
            if (shaderMaterial) {
                shaderMaterial.setFloat("time", time);
                time += 0.02;
                shaderMaterial.setVector3("cameraPosition", camera.position);
            }
            scene.render();
        });

        window.addEventListener("resize", () => engine.resize());

        setInterval(() => {
            timeElement.textContent = time === 0 ? "--" : time.toFixed(1);
            fpsElement.textContent = engine.getFps().toFixed() + " fps";
        }, 100);
    }
}
