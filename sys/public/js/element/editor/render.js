import { playState } from "./state.js";

const canvasElement = document.getElementById("render-canvas");
const timeElement = document.querySelector(".sl-editor .renderer-time");
const fpsElement = document.querySelector(".sl-editor .renderer-fps");
let time = "--", engine, scene, shaderMaterial, mesh;

const compile = (vertex, fragment) => {
    if (shaderMaterial) shaderMaterial.dispose(true);

    shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertexSource: localStorage.getItem(vertex),
        fragmentSource: localStorage.getItem(fragment)
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    }, false);

    let refTexture = new BABYLON.Texture("../../../img/editor/ref.jpg", scene);
    refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    let mainTexture = new BABYLON.Texture("../../../img/editor/amiga.jpg", scene);

    shaderMaterial.setTexture("textureSampler", mainTexture);
    shaderMaterial.setTexture("refSampler", refTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
    shaderMaterial.backFaceCulling = false;

    mesh.material = shaderMaterial;

    shaderMaterial.onCompiled = () => console.log("Compile success");
    shaderMaterial.onError = (sender, errors) => console.log("Fail");
}

export const babylonFeature = () => {
    if (BABYLON.Engine.isSupported()) {
        engine = new BABYLON.Engine(canvasElement, true);
        scene = new BABYLON.Scene(engine);

        mesh = BABYLON.Mesh.CreateTorusKnot("mesh", 2, 0.5, 128, 64, 2, 3, scene)

        let camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);

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
            timeElement.textContent = isNaN(time) ? time : time.toFixed(1);
            fpsElement.textContent = engine.getFps().toFixed() + " fps";
        }, 100);
    }
}
