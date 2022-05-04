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

/***/ "./sys/public/js/element/home/navbar.js":
/*!**********************************************!*\
  !*** ./sys/public/js/element/home/navbar.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"scrollTopFeature\": () => (/* binding */ scrollTopFeature)\n/* harmony export */ });\nlet onTop;\r\n\r\nconst navbarElement = document.querySelector(\".sl-nav .sl-nav_bar\");\r\n\r\nconst scrollTopFeature = () => {\r\n    if (onTop !== !(document.documentElement.scrollTop || document.body.scrollTop)) {\r\n        onTop = !onTop;\r\n       navbarElement.setAttribute(\"class\", onTop ? \"sl-nav_bar\" : \"sl-nav_bar slide-down\");\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/element/home/navbar.js?");

/***/ }),

/***/ "./sys/public/js/element/shared/search.js":
/*!************************************************!*\
  !*** ./sys/public/js/element/shared/search.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"searchFeature\": () => (/* binding */ searchFeature)\n/* harmony export */ });\nconst centerElement = document.querySelector(\".sl-nav .container-extend\");\r\nconst outerElement = document.querySelector(\".sl-nav .bar-outer\");\r\nconst panelElement = document.querySelector(\".sl-nav .search-panel\");\r\nconst searchElement = document.querySelector(\"#nav-search\");\r\n\r\nlet onPanel = {\r\n    inputFocusFlag: false,\r\n    set inputFocus(value) { this.inputFocusFlag = value; this.update(); },\r\n    panelFocusFlag: false,\r\n    set panelFocus(value) { this.panelFocusFlag = value; this.update(); },\r\n    cache: false,\r\n    update: function () {\r\n        const flag = (this.inputFocusFlag || this.panelFocusFlag);\r\n        if (flag === this.cache) return;\r\n        if ((this.cache = flag)) {\r\n            centerElement.setAttribute(\"class\", \"container-extend is-focus\");\r\n            outerElement.setAttribute(\"style\", \"display: block\");\r\n            searchElement.setAttribute(\"class\", \"is-focus\");\r\n            searchElement.setAttribute(\"style\", \"border-radius: 8px 8px 0 0\");\r\n            panelElement.removeAttribute(\"style\");\r\n        } else {\r\n            centerElement.setAttribute(\"class\", \"container-extend\");\r\n            outerElement.setAttribute(\"style\", \"display: none\");\r\n            searchElement.removeAttribute(\"class\");\r\n            searchElement.setAttribute(\"style\", \"border-radius: 8px\");\r\n            panelElement.setAttribute(\"style\", \"display: none\");\r\n        }\r\n    }\r\n}\r\n\r\nconst searchFeature = () => {\r\n    document.querySelector(\"#nav-search .nav-search-clean\").addEventListener(\"click\", () => document.querySelector(\"#nav-search .nav-search-input\").value = \"\");\r\n    document.querySelector(\"#nav-search .nav-search-input\").addEventListener(\"focusout\", () => onPanel.inputFocus = false);\r\n    document.querySelector(\"#nav-search .nav-search-input\").addEventListener(\"focusin\", () => onPanel.inputFocus = true);\r\n    document.querySelector(\"#nav-search .nav-search-input\").addEventListener(\"input\", () => {\r\n\r\n    })\r\n    outerElement.addEventListener(\"click\", () => onPanel.panelFocus = false);\r\n    panelElement.addEventListener(\"mouseover\", () => onPanel.panelFocus = true);\r\n}\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/element/shared/search.js?");

/***/ }),

/***/ "./sys/public/js/element/shared/user.js":
/*!**********************************************!*\
  !*** ./sys/public/js/element/shared/user.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"userFeature\": () => (/* binding */ userFeature)\n/* harmony export */ });\nconst userHolderElement = document.querySelector(\".sl-nav .right-entry-item:first-child\");\r\nconst avatarElement = document.querySelector(\".sl-nav .avatar-container\");\r\nconst userinfoElement = document.querySelector(\".sl-nav .avatar-bottom\");\r\n\r\nlet avatarLock = true, avatarLockId = -1;\r\n\r\nconst isParent = (refNode, otherNode) => {\r\n    if (otherNode == null) return false; // if switch platform\r\n    let parent = otherNode.parentNode;\r\n    do {\r\n        if (refNode === parent) return true;\r\n        parent = parent.parentNode;\r\n    } while (parent);\r\n    return false;\r\n}\r\n\r\nconst enterAvatar = event => {\r\n    if (!isParent(avatarElement, event.relatedTarget) && event.target === avatarElement && avatarLock) {\r\n        avatarLock = false;\r\n        avatarElement.setAttribute(\"class\", \"avatar-container large-avatar\");\r\n        userinfoElement.setAttribute(\"class\", \"avatar-bottom\");\r\n        userinfoElement.setAttribute(\"style\", \"padding-top: 8px;\");\r\n        setTimeout(() => avatarLock = true, 300);\r\n    }\r\n}\r\n\r\nconst leaveAvatar = event => {\r\n    if (!isParent(userHolderElement, event.relatedTarget) && avatarLockId < 0) {\r\n        if (avatarLock) {\r\n            avatarLock = false;\r\n            avatarElement.setAttribute(\"class\", \"avatar-container small-avatar\");\r\n            userinfoElement.setAttribute(\"class\", \"avatar-bottom avatar-bottom-transition\");\r\n            setTimeout(() => {\r\n                userinfoElement.setAttribute(\"style\", \"padding-top: 8px; display: none\");\r\n                avatarLock = true;\r\n            }, 300);\r\n        } else {\r\n            avatarLockId = setTimeout(() => { avatarLockId = -1; leaveAvatar(event); }, 300)\r\n        }\r\n    }\r\n}\r\n\r\nconst userFeature = (user) => {\r\n    if (user != null) {\r\n        avatarElement.addEventListener(\"mouseover\", enterAvatar);\r\n        userHolderElement.addEventListener(\"mouseout\", leaveAvatar);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/element/shared/user.js?");

/***/ }),

/***/ "./sys/public/js/home.js":
/*!*******************************!*\
  !*** ./sys/public/js/home.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _element_home_navbar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./element/home/navbar.js */ \"./sys/public/js/element/home/navbar.js\");\n/* harmony import */ var _element_shared_search_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./element/shared/search.js */ \"./sys/public/js/element/shared/search.js\");\n/* harmony import */ var _element_shared_user_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./element/shared/user.js */ \"./sys/public/js/element/shared/user.js\");\n\r\n\r\n\r\n\r\n//const user = localStorage.getItem(\"user\");\r\n\r\nconst user = {}\r\n\r\nconst avatarElement = document.querySelector(\".sl-nav .avatar-container\");\r\n\r\nif (user != null) {\r\n    document.querySelectorAll(\".sl-nav .login-entry\").forEach(node => node.setAttribute(\"style\", \"display: none\"));\r\n    avatarElement.setAttribute(\"style\", \"display: block\");\r\n} else {\r\n    document.querySelectorAll(\".sl-nav .login-entry\").forEach(node => node.setAttribute(\"style\", \"display: block\"));\r\n    avatarElement.setAttribute(\"style\", \"display: none\");\r\n}\r\n\r\nwindow.onscroll = _element_home_navbar_js__WEBPACK_IMPORTED_MODULE_0__.scrollTopFeature;\r\n\r\nwindow.onload = () => {\r\n    (0,_element_shared_search_js__WEBPACK_IMPORTED_MODULE_1__.searchFeature)();\r\n    (0,_element_shared_user_js__WEBPACK_IMPORTED_MODULE_2__.userFeature)(user);\r\n}\r\n\n\n//# sourceURL=webpack://shaderlab/./sys/public/js/home.js?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./sys/public/js/home.js");
/******/ 	
/******/ })()
;