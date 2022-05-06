import { fetchFeature } from "./response.js";

const holderElement = document.querySelector(".sl-layout .sl-holder");

/** @type {Shader} */
let cache = JSON.parse(localStorage.getItem("cache")) || {};
let shaders = {}

class Shader {
    constructor(shaderData) {
        this.name = shaderData.name;
        this.image = shaderData.preview;
        this.user = shaderData.user.name;
        this.content = shaderData.content;
        this.update = shaderData.post_update;
    }

    get prefab() {
        const shader = document.createElement("div");
        shader.classList.add("shader-info");
        shader.innerHTML = `<div class="shader-preview">
                                <img src="${this.image}">
                                <!--canvas ></canvas-->
                            </div>
                            <div class="shader-name">${this.name}</div>
                            <div>${this.user}</div>`
        return shader;
    }

    static init() {
        fetchFeature("/api/post", {
            method: "GET"
        }, result => {
            console.log(result);
            for (let post of result) {
                cache[post.id] = new Shader(post);
                shaders[post.id] = cache[post.id].prefab;
                holderElement.append(shaders[post.id]);
            }
        });
    }
}

export const shaderFeature = token => {
    if (token != null) {
        Shader.init();
    }
}
