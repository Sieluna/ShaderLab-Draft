const shadowRoot = document.querySelector("sl-nav").shadowRoot;

const userHolderElement = shadowRoot.querySelector(".sl-nav__bar .right-entry-item:first-child");
const avatarElements = shadowRoot.querySelectorAll(".sl-nav__bar .avatar-container");
const loginElements = shadowRoot.querySelectorAll(".sl-nav__bar .login-entry");
const userinfoElement = shadowRoot.querySelector(".sl-nav__bar .avatar-bottom");
const leftAvatar = shadowRoot.querySelector(".sl-nav__bar .left-entry-item .avatar-container");
const rightAvatar = shadowRoot.querySelector(".sl-nav__bar .right-entry-item .avatar-container");

const avatarIconElements = shadowRoot.querySelectorAll(".sl-nav__bar .avatar-container img");
const nameElement = shadowRoot.querySelector(".sl-nav__bar .avatar-bottom .userinfo-name");
const logoutElement = shadowRoot.querySelector(".sl-nav__bar .avatar-bottom .userinfo-logout");

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

export const userFeature = (token, user) => {
    if (token && user) {
        nameElement.textContent = user.name;
        avatarIconElements.forEach(image => {
            image.src = user.avatar ?? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89B8AAskB44g04okAAAAASUVORK5CYII=";
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
                window.location.href = "login.html";
            });
        });
        avatarElements.forEach(node =>
            node.setAttribute("style", "display: none"));
    }
}
