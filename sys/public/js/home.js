//const user = localStorage.getItem("user");
const user = {}

const center = document.querySelector(".sl-nav .container-extend");
const outer = document.querySelector(".sl-nav .bar-outer");
const panel = document.querySelector(".sl-nav .search-panel");
const search = document.querySelector("#nav-search");
const userContainer = document.querySelector(".sl-nav .right-entry-item:first-child");
const avatar = document.querySelector(".sl-nav .avatar-container");
const userinfo = document.querySelector(".sl-nav .avatar-bottom");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    avatar.setAttribute("style", "display: block");
} else {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: block"));
    avatar.setAttribute("style", "display: none");
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

const isParent = (refNode, otherNode) => {
    if (otherNode == null) return false; // if switch platform
    let parent = otherNode.parentNode;
    do {
        if (refNode === parent) return true;
        parent = parent.parentNode;
    } while (parent);
    return false;
}

let avatarLock = true, avatarLockId = -1;

const enterAvatar = event => {
    if (!isParent(avatar, event.relatedTarget) && event.target === avatar && avatarLock) {
        avatarLock = false;
        avatar.setAttribute("class", "avatar-container large-avatar");
        userinfo.setAttribute("class", "avatar-bottom");
        userinfo.setAttribute("style", "padding-top: 8px;");
        setTimeout(() => avatarLock = true, 300);
    }
}

const leaveAvatar = event => {
    if (!isParent(userContainer, event.relatedTarget) && avatarLockId < 0) {
        if (avatarLock) {
            avatarLock = false;
            avatar.setAttribute("class", "avatar-container small-avatar");
            userinfo.setAttribute("class", "avatar-bottom avatar-bottom-transition");
            setTimeout(() => {
                userinfo.setAttribute("style", "padding-top: 8px; display: none");
                avatarLock = true;
            }, 300);
        } else {
            avatarLockId = setTimeout(() => { avatarLockId = -1; leaveAvatar(event); }, 300)
        }
    }
}

window.onload = () => {
    document.querySelector("#nav-search .nav-search-clean").addEventListener("click", () => document.querySelector("#nav-search .nav-search-input").value = "");
    /* Search */
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusout", () => onPanel.inputFocus = false);
    document.querySelector("#nav-search .nav-search-input").addEventListener("focusin", () => onPanel.inputFocus = true);
    document.querySelector("#nav-search .nav-search-input").addEventListener("input", () => {

    })
    outer.addEventListener("click", () => onPanel.panelFocus = false);
    panel.addEventListener("mouseover", () => onPanel.panelFocus = true);

    if (user != null) {
        avatar.addEventListener("mouseover", enterAvatar);
        userContainer.addEventListener("mouseout", leaveAvatar);
    }
}
