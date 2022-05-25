"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[322,612],{

/***/ 224:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "shaderFeature": () => (/* binding */ shaderFeature)
/* harmony export */ });
/* harmony import */ var _shared_response_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(602);


const holderElement = document.querySelector(".sl-layout__holder");
const recommendElement = document.querySelector(".sl-layout__recommend");

/** @type {Shader} Shader Cache */
let cache = JSON.parse(localStorage.getItem("cache")) || {};
/** @type {{HTMLElement}} Shadow Element*/
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
        (0,_shared_response_js__WEBPACK_IMPORTED_MODULE_0__/* .fetchFeature */ .z)("/api/post", {
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
        (0,_shared_response_js__WEBPACK_IMPORTED_MODULE_0__/* .fetchFeature */ .z)("/api/post/recommend", {
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

const shaderFeature = () => {
    ShaderPreview.init();
    ShaderRecommend.init();
}


/***/ }),

/***/ 602:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "z": () => (/* binding */ fetchFeature)
/* harmony export */ });
/* harmony import */ var _alert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(492);


/**
 * protobuff desgin ->
 * - text: error case text content for error only
 * - json: success data only
 */

const handleResponse = response => {
    let contentType = response.headers.get("content-type");
    if (contentType.includes("application/json")) {
        return handleJsonResponse(response);
    } else if (contentType.includes("text/html")) {
        return handleTextResponse(response);
    } else {
        (0,_alert_js__WEBPACK_IMPORTED_MODULE_0__.swal)({
            icon: "error",
            title: "Oops...",
            text: `Check ${contentType}`,
        });
    }
};

const handleJsonResponse = response => response.json().then(json =>{
    if (response.ok)
        return json;
});

const handleTextResponse = response => response.text().then(text => {
    if (response.ok)
        return text;
    else {
        (0,_alert_js__WEBPACK_IMPORTED_MODULE_0__.swal)({
            icon: "error",
            title: "Oops...",
            text: text,
        });
        return null;
    }
});

const fetchFeature = (input, init, callback) =>
    fetch(input, init).
    then(handleResponse).
    then(callback).
    catch(error => console.log(error));


/***/ })

}]);