"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[665,612],{

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


/***/ }),

/***/ 981:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "searchFeature": () => (/* binding */ searchFeature)
});

;// CONCATENATED MODULE: ./sys/public/js/element/shared/history.js
const historyElement = document.querySelector(".sl-nav__bar .search-panel .search-history");
const cleanElement = document.querySelector(".sl-nav__bar .search-panel .history-clear");
const searchElement = document.querySelector(".sl-nav__bar #nav-search .nav-search-btn");

let history_history = JSON.parse(localStorage.getItem("history")) || {};
let historyCache = [];

const loadHistoryPrefab = (history) => {
    Object.keys(history).sort((a, b) => history[b] - history[a]).forEach((item, index) => {
        if (index < 6) {
            if (historyCache[index]) {
                historyCache[index].innerHTML = `<div>${item}</div>
                                                 <div style="font-size: 16px top: 14px">&#10548</div>`
            } else {
                const element = document.createElement("a");
                element.classList.add("history-item");
                element.innerHTML = `<div>${item}</div>
                                     <div style="font-size: 16px top: 14px">&#10548</div>`
                historyCache[index] = element;
                historyElement.append(historyCache[index]);
            }
        }
    });
}

const historyFeature = (inputData) => {
    loadHistoryPrefab(history_history);
    cleanElement.addEventListener("click", () => {
        document.querySelectorAll(".sl-nav__bar .search-panel .history-item").forEach(node => node.remove());
        localStorage.removeItem("history");
        history_history = {}; historyCache = [];
    });
    searchElement.addEventListener("click", () => {
        if (inputData.value.length > 0) {
            history_history[inputData.value] = Date.now();
            localStorage.setItem("history", JSON.stringify(history_history));
            loadHistoryPrefab(history_history)
        }
    });
}

// EXTERNAL MODULE: ./sys/public/js/element/shared/response.js
var response = __webpack_require__(602);
;// CONCATENATED MODULE: ./sys/public/js/element/shared/search.js



const centerElement = document.querySelector(".sl-nav__bar .container-extend");
const outerElement = document.querySelector(".sl-nav__bar .bar-outer");
const panelElement = document.querySelector(".sl-nav__bar .search-panel");
const search_historyElement = document.querySelector(".sl-nav__bar .search-panel .search-history");
const suggestionElement = document.querySelector(".sl-nav__bar .search-panel .suggestion");
const search_searchElement = document.querySelector(".sl-nav__bar #nav-search");
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
        ;(0,response/* fetchFeature */.z)(`/api/search/post/${searchInputElement.value}`, { method: "GET" }, result => {
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
        search_searchElement.setAttribute("class", "is-focus");
    }

    panelInitClose() {
        centerElement.setAttribute("class", "container-extend");
        outerElement.setAttribute("style", "display: none");
        search_searchElement.removeAttribute("class");
    }

    panelExtendOpen() {
        search_searchElement.setAttribute("style", "border-radius: 8px 8px 0 0");
        panelElement.removeAttribute("style");
    }

    panelExtendClose() {
        search_searchElement.setAttribute("style", "border-radius: 8px");
        panelElement.setAttribute("style", "display: none");
    }

    panelSearchOpen() {
        this.inputSearchFlag = true;
        search_historyElement.setAttribute("style", "display: none");
        suggestionElement.setAttribute("style", "display: block");
    }

    panelSearchClose(closeAll = false) {
        this.inputSearchFlag = false;
        search_historyElement.setAttribute("style", "display: block");
        suggestionElement.setAttribute("style", "display: none");
        if (closeAll) return;
        this.panelExtendOpen();
    }
}

let panel = new Panel();

const searchFeature = () => {
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


/***/ })

}]);