const pause = "M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28", play = "M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26";

const shadowRoot = document.querySelector("sl-editor").shadowRoot;

const anim = shadowRoot.getElementById("state-animation");

let flip = true;

export const stateFeature = () => {
    shadowRoot.querySelector(".sl-editor__renderer .renderer-state").addEventListener("click", () => {
        flip = !flip;
        anim.setAttribute("from", flip ? pause : play);
        anim.setAttribute("to", flip ? play : pause);
        anim.beginElement();
    });
}

export { flip as playState };

