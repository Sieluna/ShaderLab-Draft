import { historyFeature } from "./history.js";
import { fetchFeature } from "./response.js";

const centerElement = document.querySelector(".sl-nav__bar .container-extend");
const outerElement = document.querySelector(".sl-nav__bar .bar-outer");
const panelElement = document.querySelector(".sl-nav__bar .search-panel");
const historyElement = document.querySelector(".sl-nav__bar .search-panel .search-history");
const suggestionElement = document.querySelector(".sl-nav__bar .search-panel .suggestion");
const searchElement = document.querySelector(".sl-nav__bar #nav-search");
const searchInputElement = document.querySelector(".sl-nav__bar #nav-search .nav-search-input");
const searchCleanElement = document.querySelector(".sl-nav__bar #nav-search .nav-search-clean");
const searchButtonElement = document.querySelector(".sl-nav__bar #nav-search .nav-search-btn");

const mainElement = document.querySelector(".sl-layout__holder");

class Panel {
    constructor() {
        this.suggestionCache = [];
        this.inputExistFlag = true;
        this.inputFocusFlag = false;
        this.panelFocusFlag = false;
        this.inputSearchFlag = false;
    }

    loadSuggestionPrefabs(limit) {
        const suggestionPrefab = (content, ref) => {
            if (!ref) {
                let item = document.createElement("a");
                item.className = content == "" ? "" : "suggestion-item";
                item.innerText = content;
                suggestionElement.append(item);
                return item;
            } else {
                ref.className = content == "" ? "" : "suggestion-item";
                ref.innerText = content;
                return ref;
            }
        }
        fetchFeature(`/api/search/post/${searchInputElement.value}`, { method: "GET" }, result => {
            if (typeof result == "string" || result == undefined) {
                for (let i = 0; i < limit; i++)
                    this.suggestionCache[i] = suggestionPrefab("", this.suggestionCache[i]);
                this.inputExistFlag = false;
                this.panelExtendClose();
            } else {
                for (let i = 0; i < limit; i++)
                    this.suggestionCache[i] = suggestionPrefab(result[i] !== undefined ? result[i].name : "", this.suggestionCache[i]);
                this.inputExistFlag = true;
                this.panelExtendOpen();
            }
        });
    }

    set inputFocus(value) {
        this.inputFocusFlag = value;
        this.update();
    }

    set panelFocus(value) {
        this.panelFocusFlag = value;
        this.update();
    }

    update() {
        const flag = (this.inputFocusFlag || this.panelFocusFlag);
        if (this.inputSearchFlag) {
            this.panelSearchOpen();
        } else {
            this.panelSearchClose();
        }
        if (flag === this.cache) return;
        if ((this.cache = flag)) {
            this.panelInitOpen();
            if (this.inputExistFlag)
                this.panelExtendOpen();
        } else {
            this.panelInitClose();
            this.panelExtendClose();
        }
    }

    searchClean() {
        searchInputElement.value = "";
        searchInputElement.blur();
    }

    panelInitOpen() {
        centerElement.setAttribute("class", "container-extend is-focus");
        outerElement.setAttribute("style", "display: block");
        searchElement.setAttribute("class", "is-focus");
    }

    panelInitClose() {
        centerElement.setAttribute("class", "container-extend");
        outerElement.setAttribute("style", "display: none");
        searchElement.removeAttribute("class");
    }

    panelExtendOpen() {
        searchElement.setAttribute("style", "border-radius: 8px 8px 0 0");
        panelElement.removeAttribute("style");
    }

    panelExtendClose() {
        searchElement.setAttribute("style", "border-radius: 8px");
        panelElement.setAttribute("style", "display: none");
    }

    panelSearchOpen() {
        this.inputSearchFlag = true;
        historyElement.setAttribute("style", "display: none");
        suggestionElement.setAttribute("style", "display: block");
    }

    panelSearchClose(closeAll = false) {
        this.inputSearchFlag = false;
        historyElement.setAttribute("style", "display: block");
        suggestionElement.setAttribute("style", "display: none");
        if (closeAll) return;
        this.panelExtendOpen();
    }
}

let panel = new Panel();

export const searchFeature = () => {
    historyFeature(searchInputElement);
    searchCleanElement.addEventListener("click", () =>{
        panel.panelSearchClose();
        panel.searchClean();
    });
    searchCleanElement.addEventListener("mouseover", () => panel.panelFocus = true);
    searchInputElement.addEventListener("focusout", () => panel.inputFocus = false);
    searchInputElement.addEventListener("focusin", () => panel.inputFocus = true);
    searchInputElement.addEventListener("input", () => {
        if (searchInputElement.value.length > 0) {
            panel.panelSearchOpen();
            panel.loadSuggestionPrefabs(6);
        } else {
            panel.panelSearchClose();
            panel.inputExistFlag = true;
        }
    });
    searchInputElement.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchButtonElement.click();
        }
    });
    searchButtonElement.addEventListener("click", () => {
        panel.panelSearchClose(true);
        panel.searchClean();
        mainElement.scrollIntoView({ block: "start", inline: "start", behavior: "smooth" });
    });
    outerElement.addEventListener("click", () => panel.panelFocus = false);
    panelElement.addEventListener("mouseover", () => panel.panelFocus = true);
}
