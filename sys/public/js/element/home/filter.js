import { fetchFeature } from "../shared/response.js";

const shadowRoot = document.querySelector("sl-nav").shadowRoot;

const topicElement = shadowRoot.querySelector(".sl-nav__filter .topic-filter");
const tagElements = shadowRoot.querySelector(".sl-nav__filter .tag-filter");

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
        fetchFeature("/api/topic", {
            method: "GET"
        }, result => {
            if (Symbol.iterator in Object(result)) {
                for (let topic of result) {
                    cache[`Topic_${topic.id}`] = new Topic(topic);
                    filter[`Topic_${topic.id}`] = cache[`Topic_${topic.id}`].prefab(topic.name);
                    topicElement.append(filter[`Topic_${topic.id}`]);
                }
            }
        });
    }
}

class Tag extends Filter {
    constructor(tagData) {
        super(tagData.id, tagData.name);
    }

    static init() {
        fetchFeature("/api/tag", {
            method: "GET"
        }, result => {
            if (Symbol.iterator in Object(result)) {
                for (let tag of result) {
                    cache[`Tag_${tag.id}`] = new Tag(tag);
                    filter[`Tag_${tag.id}`] = cache[`Tag_${tag.id}`].prefab(`# ${tag.name}`);
                    tagElements.append(filter[`Tag_${tag.id}`]);
                }
            }
        });
    }
}

export const filterFeature = () => {
    Topic.init();
    Tag.init();
}
