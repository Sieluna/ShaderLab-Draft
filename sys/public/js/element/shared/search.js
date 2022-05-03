const centerElement = document.querySelector(".sl-nav .container-extend");
const outerElement = document.querySelector(".sl-nav .bar-outer");
const panelElement = document.querySelector(".sl-nav .search-panel");
const searchElement = document.querySelector("#nav-search");

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

export const searchFeature = () => {
    document.querySelector("#nav-search .nav-search-clean").addEventListener("click", () => document.querySelector("#nav-search .nav-search-input").value = "");
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusout", () => onPanel.inputFocus = false);
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusin", () => onPanel.inputFocus = true);
    document.querySelector("#nav-search .nav-search-input").addEventListener("input", () => {

    })
    outerElement.addEventListener("click", () => onPanel.panelFocus = false);
    panelElement.addEventListener("mouseover", () => onPanel.panelFocus = true);
}
