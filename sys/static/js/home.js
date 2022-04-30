const user = localStorage.getItem("user");

const center = document.querySelector(".sl-nav .container-extend");
const outer = document.querySelector(".sl-nav .bar-outer");
const panel = document.querySelector(".sl-nav .search-panel");
const search = document.querySelector("#nav-search");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    document.querySelectorAll(".sl-nav .avatar-container").forEach(node => node.setAttribute("style", "display: block"));
    //document.querySelector(".sl-nav .avatar-container .user-entry > ")
} else {
}

let onTop;
window.onscroll = () => {
    if (onTop !== !(document.documentElement.scrollTop || document.body.scrollTop)) {
        onTop = !onTop;
        document.querySelector(".sl-nav .sl-nav_bar").setAttribute("class", onTop ? "sl-nav_bar" : "sl-nav_bar slide-down");
    }
};

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
            center.setAttribute("class", "container-extend is-focus");
            outer.setAttribute("style", "display: block");
            search.setAttribute("class", "is-focus");
            search.setAttribute("style", "border-radius: 8px 8px 0 0");
            panel.removeAttribute("style");
        } else {
            center.setAttribute("class", "container-extend");
            outer.setAttribute("style", "display: none");
            search.removeAttribute("class");
            search.setAttribute("style", "border-radius: 8px");
            panel.setAttribute("style", "display: none");
        }
    }
}

window.onload = () => {
    document.querySelector("#nav-search .nav-search-clean").addEventListener("click", () => {
        document.querySelector("#nav-search .nav-search-input").value = "";
    });

    /* Search */
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusout", () => onPanel.inputFocus = false);
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusin", () => onPanel.inputFocus = true);
    outer.addEventListener("click", () => onPanel.panelFocus = false);
    panel.addEventListener("mouseover", () => onPanel.panelFocus = true);


}