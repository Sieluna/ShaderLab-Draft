"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[649],{

/***/ 649:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "lazyLoadFeature": () => (/* binding */ lazyLoadFeature)
/* harmony export */ });
const backgroundElement = document.querySelector(".sl-background");
const smallBackgroundElement = backgroundElement.querySelector(".small");

const lazyLoadFeature = () => {
    let img = new Image();
    img.src = smallBackgroundElement.src;
    img.onload = () => smallBackgroundElement.classList.add("loaded");

    let imgLarge = new Image();
    imgLarge.src = backgroundElement.dataset.large;
    imgLarge.onload = () => imgLarge.classList.add("loaded");

    backgroundElement.appendChild(imgLarge);
}


/***/ })

}]);