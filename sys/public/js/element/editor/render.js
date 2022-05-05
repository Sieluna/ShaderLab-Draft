import { structure } from "./action.js";
import { playState } from "./state.js";
import { compileDelegate } from "../../editor/bottom.js";

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

compileDelegate(() => {
    if (shaderMaterial) shaderMaterial.dispose(true);

    document.getElementById("vertexShaderCode").innerHTML = localStorage.getItem("glsl_" + search("vertex"));
    document.getElementById("fragmentShaderCode").innerHTML = localStorage.getItem("glsl_" + search("fragment"));

    shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertexElement: "vertexShaderCode",
        fragmentElement: "fragmentShaderCode",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    }, false);

    let refTexture = new BABYLON.Texture("img/editor/ref.jpg", scene);
    refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    let mainTexture = new BABYLON.Texture("img/editor/amiga.jpg", scene);

    shaderMaterial.setTexture("textureSampler", mainTexture);
    shaderMaterial.setTexture("refSampler", refTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
    shaderMaterial.backFaceCulling = false;

    mesh.material = shaderMaterial;

    shaderMaterial.onCompiled = () => console.log("Compile success");
    shaderMaterial.onError = (sender, errors) => console.log("Fail");
})

export const screenShotFeature = (width, height) => {
    BABYLON.Tools.CreateScreenshot(engine, camera, { width: width, height: height }, function (data) {
        console.log(data);
    });
}

export const babylonFeature = () => {
    if (BABYLON.Engine.isSupported()) {
        engine = new BABYLON.Engine(canvasElement, true);
        scene = new BABYLON.Scene(engine);

        mesh = BABYLON.Mesh.CreateTorusKnot("mesh", 2, 0.5, 128, 64, 2, 3, scene)

        camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);

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
