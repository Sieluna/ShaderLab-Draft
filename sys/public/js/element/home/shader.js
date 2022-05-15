import { fetchFeature } from "../shared/response.js";

const holderElement = document.querySelector(".sl-layout .sl-holder");
const recommendElement = document.querySelector(".sl-layout .sl-recommend");

/** @type {ShaderPreview} */
let cache = JSON.parse(localStorage.getItem("cache")) || {};
let shaders = {};

class Shader {
    constructor(shaderData) {
        this.id = shaderData.id;
        this.name = shaderData.name;
        this.avatar = shaderData.user.avatar;
        this.user = shaderData.user.name;
        this.image = shaderData.preview;
        this.content = shaderData.content;
        this.update = shaderData.post_update;
    }

    prefab(data, enableUserTag = true) {
        const shader = document.createElement("div");
        const commonUserDOM = user => enableUserTag ? `<div class="shader-user">${user}</div>` : "";
        const tagUserDOM = user => enableUserTag ? "" : `<div class="shader-user">-- ${user}</div>`;
        shader.className = data;
        shader.innerHTML = `
            <a>
                <div class="shader-preview">
                    <img src="${this.image}">
                    <!--canvas ></canvas-->
                </div>
                <div class="shader-bottom">
                    <img class="shader-avatar" src="${this.avatar}">
                    <div class="shader-text">
                        <h2 class="shader-name">${this.name}</h2>
                        ${commonUserDOM(this.user)}
                    </div>
                    ${tagUserDOM(this.user)}
                </div>
            </a>`;
        return shader;
    }
}

class ShaderPreview extends Shader {
    constructor(shaderData) {
        super(shaderData);
    }

    static init() {
        fetchFeature("/api/post", {
            method: "GET"
        }, result => {
            for (let post of result) {
                cache[post.id] = new ShaderPreview(post);
                shaders[post.id] = cache[post.id].prefab("shader-info");
                holderElement.append(shaders[post.id]);
            }
        });
    }
}

class ShaderRecommend extends Shader {
    constructor(shaderData) {
        super(shaderData);
    }

    static init() {
        fetchFeature("/api/post/recommend", {
            method: "GET"
        }, result => {
            for (let [index, post] of result.entries()) {
                cache[`Recommend_${post.id}`] = new ShaderRecommend(post);
                shaders[`Recommend_${post.id}`] = index === 0 ?
                    cache[`Recommend_${post.id}`].prefab("shader-info top", false) :
                    cache[`Recommend_${post.id}`].prefab("shader-info");
                recommendElement.append(shaders[`Recommend_${post.id}`]);
            }
        });
    }
}

export const shaderFeature = () => {
    ShaderPreview.init();
    ShaderRecommend.init();
}
