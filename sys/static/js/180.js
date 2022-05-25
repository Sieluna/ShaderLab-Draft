"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[180],{

/***/ 180:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "playState": () => (/* binding */ flip),
/* harmony export */   "stateFeature": () => (/* binding */ stateFeature)
/* harmony export */ });
const pause = "M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28", play = "M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26";

const anim = document.getElementById("state-animation");

let flip = true;

const stateFeature = () => {
    document.querySelector(".sl-editor .renderer-state").addEventListener("click", () => {
        flip = !flip;
        anim.setAttribute("from", flip ? pause : play);
        anim.setAttribute("to", flip ? play : pause);
        anim.beginElement();
    });
}





/***/ })

}]);