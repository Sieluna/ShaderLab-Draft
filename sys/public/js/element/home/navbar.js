let onTop;

const navbarElement = document.querySelector(".sl-nav .sl-nav_bar");

export const scrollTopFeature = () => {
    if (onTop !== !(document.documentElement.scrollTop || document.body.scrollTop)) {
        onTop = !onTop;
       navbarElement.setAttribute("class", onTop ? "sl-nav_bar" : "sl-nav_bar slide-down");
    }
};
