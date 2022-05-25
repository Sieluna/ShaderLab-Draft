"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[644],{

/***/ 644:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scrollTopFeature": () => (/* binding */ scrollTopFeature)
/* harmony export */ });
const navbarElement = document.querySelector(".sl-nav__bar");

let onTop;

const scrollTopFeature = () => {
    if (onTop !== !(document.documentElement.scrollTop || document.body.scrollTop)) {
        onTop = !onTop;
        if (onTop)
            navbarElement.classList.remove("slide-down");
        else
            navbarElement.classList.add("slide-down");
    }
};


/***/ })

}]);