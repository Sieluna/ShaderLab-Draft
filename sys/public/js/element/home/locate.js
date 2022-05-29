const shadowRoot = document.querySelector("sl-nav").shadowRoot;

const homeElement = shadowRoot.querySelector(".sl-nav__bar .home-entry");

let timer = null;

export const returnTopFeature = (anim) => {
    homeElement.addEventListener("click", () => {
        cancelAnimationFrame(timer);
        let startTime = +new Date();
        let b = document.body.scrollTop || document.documentElement.scrollTop, c = b;
        timer = requestAnimationFrame(function func(){
            let t = anim - Math.max(0, startTime - (+new Date()) + anim);
            document.documentElement.scrollTop = document.body.scrollTop = t * (-c) / anim + b;
            timer = requestAnimationFrame(func);
            if(t == anim) cancelAnimationFrame(timer);
        });
    });
};
