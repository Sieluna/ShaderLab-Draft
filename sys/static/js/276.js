"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[276],{

/***/ 276:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "renderFeature": () => (/* binding */ renderFeature)
/* harmony export */ });
/* harmony import */ var _editor_bottom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(275);


const renderFeature = (useDefault = true) => {
    if (useDefault) {

    } else {
        Promise.all(/* import() */[__webpack_require__.e(854), __webpack_require__.e(139)]).then(__webpack_require__.bind(__webpack_require__, 139)).then(({ compile, feature }) => {
            (0,_editor_bottom_js__WEBPACK_IMPORTED_MODULE_0__/* .compileDelegate */ .W)(compile);
            feature();
        });
    }
}


/***/ })

}]);