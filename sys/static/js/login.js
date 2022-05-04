/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./sys/public/js/element/login/image.js":
/*!**********************************************!*\
  !*** ./sys/public/js/element/login/image.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"lazyLoadFeature\": () => (/* binding */ lazyLoadFeature)\n/* harmony export */ });\nlet backgroundElement = document.querySelector(\".sl-background\"),\r\n    smallBackgroundElement = backgroundElement.querySelector(\".small\");\r\n\r\nconst lazyLoadFeature = () => {\r\n    let img = new Image();\r\n    img.src = smallBackgroundElement.src;\r\n    img.onload = () => smallBackgroundElement.classList.add(\"loaded\");\r\n\r\n    let imgLarge = new Image();\r\n    imgLarge.src = backgroundElement.dataset.large;\r\n    imgLarge.onload = () => imgLarge.classList.add(\"loaded\");\r\n\r\n    backgroundElement.appendChild(imgLarge);\r\n}\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/element/login/image.js?");

/***/ }),

/***/ "./sys/public/js/login.js":
/*!********************************!*\
  !*** ./sys/public/js/login.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _element_login_image_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element/login/image.js */ \"./sys/public/js/element/login/image.js\");\n\r\n\r\nlet token = localStorage.getItem(\"token\");\r\n\r\nconst redirect = (existData) => {\r\n    if (existData)\r\n        window.location.href = \"../home.html\";\r\n}\r\n\r\nredirect(token);\r\n\r\nconst submitInfo = (target = \"\") => {\r\n    fetch(\"/api/user\" + target, {\r\n        method: \"POST\",\r\n        body: new URLSearchParams(new FormData(document.getElementById(\"panel-input\"))),\r\n        redirect: \"follow\"\r\n    }).then(res => {\r\n        return res.json();\r\n    }).then(json => {\r\n        switch (json.status) {\r\n            case 200:\r\n                localStorage.setItem(\"token\", json.data.token);\r\n                redirect(true);\r\n                break;\r\n            default:\r\n                alert(json.msg);\r\n        }\r\n    });\r\n}\r\n\r\nwindow.onload = () => {\r\n    ;(0,_element_login_image_js__WEBPACK_IMPORTED_MODULE_0__.lazyLoadFeature)();\r\n    document.querySelector(\".sl-panel > .panel-login > .register\").addEventListener(\"click\", () => submitInfo());\r\n    document.querySelector(\".sl-panel > .panel-login > .login\").addEventListener(\"click\", () => submitInfo(\"/login\"));\r\n}\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/login.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./sys/public/js/login.js");
/******/ 	
/******/ })()
;