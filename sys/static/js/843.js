"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[843],{

/***/ 843:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "userFeature": () => (/* binding */ userFeature)
});

// EXTERNAL MODULE: ./sys/public/js/element/shared/alert.js
var shared_alert = __webpack_require__(492);
;// CONCATENATED MODULE: ./sys/public/js/element/shared/response.js


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
        (0,shared_alert.swal)({
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
        (0,shared_alert.swal)({
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

;// CONCATENATED MODULE: ./sys/public/js/element/login/user.js



const registerElement = document.querySelector(".sl-panel .panel-login .register");
const loginElement = document.querySelector(".sl-panel .panel-login .login");
const loginInputElement = document.querySelector(".sl-panel #panel-input .password input");

const submitInfo = (target = "") => {
    fetchFeature(`/api/user${target}`, {
        method: "POST",
        body: new URLSearchParams(new FormData(document.getElementById("panel-input"))),
        redirect: "follow"
    }, result => {
        if (!result) return;
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("token", JSON.stringify({ accessToken: result.accessToken, refreshToken: result.refreshToken }));
        (0,shared_alert.swal)({
            icon: "success",
            title: "Success",
            text: "Login Success!"
        }).then(() => window.location.href = "home.html");
    });
}

const userFeature = () => {
    registerElement.addEventListener("click", () => {
        submitInfo();
    });
    loginInputElement.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            loginElement.click();
        }
    });
    loginElement.addEventListener("click", () => {
        submitInfo("/login");
    });
}


/***/ })

}]);