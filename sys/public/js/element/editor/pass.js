import { baseVs, baseFs } from "./flow/template.js";

export class Pass {
    constructor(scene, name, option) {
        this.scene = scene;
        this.name = name;
        this.material = new BABYLON.ShaderMaterial(
            `${name}Material`,
            scene, {
                vertexSource: typeof option.vs == "string" ? option.vs : baseVs,
                fragmentSource: typeof option.fs == "string" ? option.fs : baseFs
            },
            typeof option.settings == "object" ? option.settings : {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time"]
            }
        );
    }

    attach(size = 512) {
        this.renderTarget = new BABYLON.RenderTargetTexture(`${this.name}Texture`, size, this.scene);
        this.scene.customRenderTargets.push(this.renderTarget);
        this.material.setTexture("textureSampler", this.renderTarget);
        return this.material;
    }
}

export class Forward extends Pass{
    constructor(scene, name, option) {
        super(scene, name, option);
    }

    attach(image) {
        let texture;
        if (image.includes("/"))
            texture = new BABYLON.Texture(image, this.scene);
        else
            texture = new BABYLON.Texture(image, this.scene);
        this.material.setTexture("textureSampler", texture);
        this.material.backFaceCulling = false;
    }
}
