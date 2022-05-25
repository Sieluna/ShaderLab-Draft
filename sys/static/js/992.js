"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[992],{

/***/ 992:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "returnTopFeature": () => (/* binding */ returnTopFeature)
/* harmony export */ });
const homeElement = document.querySelector(".sl-nav__bar .home-entry");

let timer = null;

const returnTopFeature = (anim) => {
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


/***/ })

}]);