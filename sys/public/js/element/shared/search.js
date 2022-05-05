import { historyFeature } from "./history.js";
import { fetchFeature } from "./response.js";

const centerElement = document.querySelector(".sl-nav .container-extend");
const outerElement = document.querySelector(".sl-nav .bar-outer");
const panelElement = document.querySelector(".sl-nav .search-panel");
const historyElement = document.querySelector(".sl-nav .search-panel .search-history");
const searchElement = document.querySelector(".sl-nav #nav-search");
const suggestionElement = document.querySelector(".sl-nav .search-panel .suggestion");
const searchInputElement = document.querySelector(".sl-nav #nav-search .nav-search-input");

let onPanel = {
    inputFocusFlag: false,
    set inputFocus(value) { this.inputFocusFlag = value; this.update(); },
    panelFocusFlag: false,
    set panelFocus(value) { this.panelFocusFlag = value; this.update(); },
    cache: false,
    update: function () {
        const flag = (this.inputFocusFlag || this.panelFocusFlag);
        if (flag === this.cache) return;
        if ((this.cache = flag)) {
            centerElement.setAttribute("class", "container-extend is-focus");
            outerElement.setAttribute("style", "display: block");
            searchElement.setAttribute("class", "is-focus");
            if (none) return;
            searchElement.setAttribute("style", "border-radius: 8px 8px 0 0");
            panelElement.removeAttribute("style");
        } else {
            centerElement.setAttribute("class", "container-extend");
            outerElement.setAttribute("style", "display: none");
            searchElement.removeAttribute("class");
            searchElement.setAttribute("style", "border-radius: 8px");
            panelElement.setAttribute("style", "display: none");
        }
    }
}

let list = [], none = false;

const loadSuggestionPrefabs = (limit) => {
    const suggestionPrefab = (content, ref) => {
        if (!ref) {
            let item = document.createElement("a");
            item.className = "suggestion-item";
            item.innerText = content;
            suggestionElement.append(item);
            return item;
        } else {
            ref.className = content == "" ? "" : "suggestion-item";
            ref.innerText = content;
            return ref;
        }
    }
    fetchFeature(`/api/search/post/${searchInputElement.value}`, {
        method: "GET",
    }, result => {
        if (typeof result == "string") {
            none = true;
            searchElement.setAttribute("style", "border-radius: 8px");
            panelElement.setAttribute("style", "display: none");
        } else {
            none = false;
            searchElement.setAttribute("style", "border-radius: 8px 8px 0 0");
            panelElement.setAttribute("style", "display: block");
        }
        for (let i = 0; i < limit; i++) {
            list[i] = suggestionPrefab(!!result ? result[i].name : "", list[i]);
        }
    });
}

export const searchFeature = () => {
    historyFeature(searchInputElement);
    document.querySelector("#nav-search .nav-search-clean").addEventListener("click", () =>{
        searchInputElement.value = "";
        historyElement.setAttribute("style", "display: block");
        suggestionElement.setAttribute("style", "display: none");
    });
    document.querySelector("#nav-search .nav-search-clean").addEventListener("mouseover", () => onPanel.panelFocus = true);
    searchInputElement.addEventListener("focusout", () => onPanel.inputFocus = false);
    searchInputElement.addEventListener("focusin", () => onPanel.inputFocus = true);
    searchInputElement.addEventListener("input", () => {
        if (searchInputElement.value.length > 0) {
            historyElement.setAttribute("style", "display: none");
            suggestionElement.setAttribute("style", "display: block");
            loadSuggestionPrefabs(6);
        } else {
            historyElement.setAttribute("style", "display: block");
            suggestionElement.setAttribute("style", "display: none");
        }
    })
    outerElement.addEventListener("click", () => onPanel.panelFocus = false);
    panelElement.addEventListener("mouseover", () => onPanel.panelFocus = true);
}
