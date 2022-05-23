const navbarElement = document.querySelector(".sl-nav__bar");

let onTop;

export const scrollTopFeature = () => {
    if (onTop !== !(document.documentElement.scrollTop || document.body.scrollTop)) {
        onTop = !onTop;
        if (onTop)
            navbarElement.classList.remove("slide-down");
        else
            navbarElement.classList.add("slide-down");
    }
};
