const userHolderElement = document.querySelector(".sl-nav .right-entry-item:first-child");
const avatarElement = document.querySelector(".sl-nav .avatar-container");
const userinfoElement = document.querySelector(".sl-nav .avatar-bottom");

let avatarLock = true, avatarLockId = -1;

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
    if (!isParent(avatarElement, event.relatedTarget) && event.target === avatarElement && avatarLock) {
        avatarLock = false;
        avatarElement.setAttribute("class", "avatar-container large-avatar");
        userinfoElement.setAttribute("class", "avatar-bottom");
        userinfoElement.setAttribute("style", "padding-top: 8px;");
        setTimeout(() => avatarLock = true, 300);
    }
}

const leaveAvatar = event => {
    if (!isParent(userHolderElement, event.relatedTarget) && avatarLockId < 0) {
        if (avatarLock) {
            avatarLock = false;
            avatarElement.setAttribute("class", "avatar-container small-avatar");
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

export const userFeature = (user) => {
    if (user != null) {
        avatarElement.addEventListener("mouseover", enterAvatar);
        userHolderElement.addEventListener("mouseout", leaveAvatar);
    }
}
