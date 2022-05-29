const backgroundElement = document.querySelector(".sl-background");
const smallBackgroundElement = backgroundElement.querySelector(".small");

export const lazyLoadFeature = () => {
    let img = new Image();
    img.src = smallBackgroundElement.src;
    img.onload = () => smallBackgroundElement.classList.add("loaded");

    let imgLarge = new Image();
    imgLarge.src = backgroundElement.dataset.large;
    imgLarge.alt = "Large Background"
    imgLarge.onload = () => imgLarge.classList.add("loaded");

    backgroundElement.appendChild(imgLarge);
}
