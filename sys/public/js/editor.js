import { EditorState, EditorView, config } from "./editor/loader.js";
import { javascript } from "./editor/dist/javascript.js";
import { glsl } from "./editor/dist/glsl.js";
import { HoverRef } from "./editor/hover.js";

let glState = EditorState.create({ doc:
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n\n' +
        'uniform vec2 u_resolution;\n' +
        'uniform vec2 u_mouse;\n' +
        'uniform float u_time;\n\n' +
        'void main() {\n' +
        '   vec2 st = gl_FragCoord.xy/u_resolution.xy;\n' +
        '   st.x *= u_resolution.x/u_resolution.y;\n\n' +
        '   vec3 color = vec3(0.);\n' +
        '   color = vec3(st.x,st.y,abs(sin(u_time)));\n\n' +
        '   gl_FragColor = vec4(color,1.0);\n' +
        '}', extensions: [
        config,
        glsl(),
        HoverRef
    ] });
window.view = new EditorView({ state: glState, parent: document.getElementById("panel") });

let engine, scene, mesh, shaderMaterial;

const compile = () => {
    if (shaderMaterial) shaderMaterial.dispose(true);
    shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertexElement: "vertex-shader-code",
        fragmentElement: "fragment-shader-code",
    }, {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    }, false);

    let refTexture = new BABYLON.Texture("../img/editor/ref.jpg", scene);
    refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    let mainTexture = new BABYLON.Texture("../img/editor/amiga.jpg", scene);

    shaderMaterial.setTexture("textureSampler", mainTexture);
    shaderMaterial.setTexture("refSampler", refTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
    shaderMaterial.backFaceCulling = false;

    mesh.material = shaderMaterial;

    shaderMaterial.onCompiled = () => console.log("Compile success");

    shaderMaterial.onError = (sender, errors) => console.log("Fail");
}

window.onload = () => {
    if (BABYLON.Engine.isSupported()) {
        let canvas = document.getElementById("render-canvas");
        engine = new BABYLON.Engine(canvas, true);
        scene = new BABYLON.Scene(engine);
        let camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);

        camera.attachControl(canvas, false);
        camera.lowerRadiusLimit = 1;
        camera.minZ = 1.0;

        let time = 0;
        engine.runRenderLoop(function () {
            if (shaderMaterial) {
                shaderMaterial.setFloat("time", time);
                time += 0.02;

                shaderMaterial.setVector3("cameraPosition", camera.position);
            }
            scene.render();
        });

        window.addEventListener("resize", () => engine.resize());
    }
}
