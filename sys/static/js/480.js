"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[480,612],{

/***/ 519:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filterFeature": () => (/* binding */ filterFeature)
/* harmony export */ });
/* harmony import */ var _shared_response_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(602);


const topicElement = document.querySelector(".sl-nav__filter .topic-filter");
const tagElements = document.querySelector(".sl-nav__filter .tag-filter");

/** @type {ShaderPreview} */
let cache = JSON.parse(localStorage.getItem("cache")) || {};
let filter = {};
let random = [...Array(45).keys()].map((number, index, all) => {
    const j = index + Math.floor(Math.random() * (all.length - index)), v = all[j];
    all[j] = number;
    return v * 8;
});

class Filter {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    prefab(content) {
        const filter = document.createElement("div");
        filter.style.backgroundColor = `hsl(${random.pop()}, 32%, 63%)`;
        filter.className = "filter-item";
        filter.innerHTML = `<div>${content}</div>`;
        filter.addEventListener("click", () => {

        });
        return filter;
    }
}

class Topic extends Filter {
    constructor(topicData) {
        super(topicData.id, topicData.name);
        this.image = topicData.image;
        this.description = topicData.description;
    }

    static init() {
        (0,_shared_response_js__WEBPACK_IMPORTED_MODULE_0__/* .fetchFeature */ .z)("/api/topic", {
            method: "GET"
        }, result => {
            for (let topic of result) {
                cache[`Topic_${topic.id}`] = new Topic(topic);
                filter[`Topic_${topic.id}`] = cache[`Topic_${topic.id}`].prefab(topic.name);
                topicElement.append(filter[`Topic_${topic.id}`]);
            }
        });
    }
}

class Tag extends Filter {
    constructor(tagData) {
        super(tagData.id, tagData.name);
    }

    static init() {
        (0,_shared_response_js__WEBPACK_IMPORTED_MODULE_0__/* .fetchFeature */ .z)("/api/tag", {
            method: "GET"
        }, result => {
            for (let tag of result) {
                cache[`Tag_${tag.id}`] = new Tag(tag);
                filter[`Tag_${tag.id}`] = cache[`Tag_${tag.id}`].prefab(`# ${tag.name}`);
                tagElements.append(filter[`Tag_${tag.id}`]);
            }
        });
    }
}

const filterFeature = () => {
    Topic.init();
    Tag.init();
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