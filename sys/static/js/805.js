"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[805],{

/***/ 805:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "userFeature": () => (/* binding */ userFeature)
/* harmony export */ });
const userHolderElement = document.querySelector(".sl-nav__bar .right-entry-item:first-child");
const avatarElements = document.querySelectorAll(".sl-nav__bar .avatar-container");
const loginElements = document.querySelectorAll(".sl-nav__bar .login-entry");
const userinfoElement = document.querySelector(".sl-nav__bar .avatar-bottom");
const leftAvatar = document.querySelector(".sl-nav__bar .left-entry-item .avatar-container");
const rightAvatar = document.querySelector(".sl-nav__bar .right-entry-item .avatar-container");

const avatarIconElements = document.querySelectorAll(".sl-nav__bar .avatar-container img");
const nameElement = document.querySelector(".sl-nav__bar .avatar-bottom .userinfo-name");
const logoutElement = document.querySelector(".sl-nav__bar .avatar-bottom .userinfo-logout");

let avatarLock = true, avatarLockId = -1, avatarAnim = true;

const isParent = (refNode, otherNode) => {
    if (otherNode == null) return false; // if switch platform
    let parent = otherNode.parentNode;
    do {
        if (refNode === parent) return true;
        parent = parent.parentNode;
    } while (parent);
    return false;
}

const enterAvatar = event => {
    if (avatarAnim) {
        rightAvatar.querySelector(".user-entry-large").setAttribute("style", "visibility: visible");
        avatarAnim = false;
    }
    if (!isParent(rightAvatar, event.relatedTarget) && event.target === rightAvatar && avatarLock) {
        avatarLock = false;
        rightAvatar.setAttribute("class", "avatar-container large-avatar");
        userinfoElement.setAttribute("class", "avatar-bottom");
        userinfoElement.setAttribute("style", "padding-top: 8px;");
        setTimeout(() => avatarLock = true, 300);
    }
}

const leaveAvatar = event => {
    if (!isParent(userHolderElement, event.relatedTarget) && avatarLockId < 0) {
        if (avatarLock) {
            avatarLock = false;
            rightAvatar.setAttribute("class", "avatar-container small-avatar");
            userinfoElement.setAttribute("class", "avatar-bottom avatar-bottom-transition");
            setTimeout(() => {
                userinfoElement.setAttribute("style", "padding-top: 8px; display: none");
                avatarLock = true;
            }, 300);
        } else {
            avatarLockId = setTimeout(() => { avatarLockId = -1; leaveAvatar(event); }, 300)
        }
    }
}

const userFeature = (token, user) => {
    if (token && user) {
        nameElement.textContent = user.name;
        avatarIconElements.forEach(image => {
            if (user.avatar) {
                image.src = user.avatar;
            } else {
                image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89B8AAskB44g04okAAAAASUVORK5CYII=";
            }
        });
        logoutElement.addEventListener("click", () => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            location.reload();
        });
    }
    if (window.innerWidth < 800) {
        leftAvatar.setAttribute("style", "display: block");
        rightAvatar.setAttribute("style", "display: none");
    } else {
        leftAvatar.setAttribute("style", "display: none");
        rightAvatar.setAttribute("style", "display: block");
    }
    if (token != null) {
        loginElements.forEach((node) => node.setAttribute("style", "display: none"));
        avatarElements.forEach((node, index) => {
            node.setAttribute("style", "display: block");
            if (index > 0) rightAvatar.addEventListener("mouseover", enterAvatar);
        });
        userHolderElement.addEventListener("mouseout", leaveAvatar);
    } else {
        loginElements.forEach(node => {
            node.setAttribute("style", "display: block");
            node.addEventListener("click", () => {
                window.location.href = "./login.html";
            });
        });
        avatarElements.forEach(node =>
            node.setAttribute("style", "display: none"));
    }
}


/***/ })

}]);