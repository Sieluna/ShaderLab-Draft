"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[419],{

/***/ 419:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "refreshFeature": () => (/* binding */ refreshFeature)
/* harmony export */ });
/* harmony import */ var _response_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(602);


let params = new URLSearchParams();

const refreshFeature = (token, user) => {
    if (user != null && token != null) {
        Object.entries(user).forEach(([key, value]) => params.append(key, value));
        (0,_response_js__WEBPACK_IMPORTED_MODULE_0__/* .fetchFeature */ .z)("/api/user", {
            method: "PUT",
            headers: new Headers([["Authorization", `Bearer ${token.refreshToken}`]]),
            body: params,
            redirect: "follow"
        }, result => {
            if (result == null) return;
            localStorage.setItem("token", JSON.stringify({ accessToken: result.accessToken, refreshToken: token.refreshToken }));
        });
    }
}


/***/ }),

/***/ 602:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "z": () => (/* binding */ fetchFeature)
/* harmony export */ });
/* harmony import */ var _alert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(492);


/**
 * protobuff desgin ->
 * - text: error case text content for error only
 * - json: success data only
 */

const handleResponse = response => {
    let contentType = response.headers.get("content-type");
    if (contentType.includes("application/json")) {
        return handleJsonResponse(response);
    } else if (contentType.includes("text/html")) {
        return handleTextResponse(response);
    } else {
        (0,_alert_js__WEBPACK_IMPORTED_MODULE_0__.swal)({
            icon: "error",
            title: "Oops...",
            text: `Check ${contentType}`,
        });
    }
};

const handleJsonResponse = response => response.json().then(json =>{
    if (response.ok)
        return json;
});

const handleTextResponse = response => response.text().then(text => {
    if (response.ok)
        return text;
    else {
        (0,_alert_js__WEBPACK_IMPORTED_MODULE_0__.swal)({
            icon: "error",
            title: "Oops...",
            text: text,
        });
        return null;
    }
});

const fetchFeature = (input, init, callback) =>
    fetch(input, init).
    then(handleResponse).
    then(callback).
    catch(error => console.log(error));


/***/ })

}]);