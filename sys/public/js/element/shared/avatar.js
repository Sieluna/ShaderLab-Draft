const userHolderElement = document.querySelector(".sl-nav .right-entry-item:first-child");
const avatarElements = document.querySelectorAll(".sl-nav .avatar-container");
const loginElements = document.querySelectorAll(".sl-nav .login-entry");
const userinfoElement = document.querySelector(".sl-nav .avatar-bottom");
const leftAvatar = document.querySelector(".sl-nav .left-entry-item .avatar-container");
const rightAvatar = document.querySelector(".sl-nav .right-entry-item .avatar-container");

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

export const userFeature = token => {
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
