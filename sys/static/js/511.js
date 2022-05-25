"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[511],{

/***/ 511:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "uploadFeature": () => (/* binding */ uploadFeature)
/* harmony export */ });
/* harmony import */ var _flow_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(854);


const postTitleElement = document.querySelector(".sl-editor .post-input");

const uploadFeature = () => {
    document.querySelector(".sl-nav .upload-entry").addEventListener("click", () => {
        Object.assign(_flow_js__WEBPACK_IMPORTED_MODULE_0__.structure, _flow_js__WEBPACK_IMPORTED_MODULE_0__.editor["export"]());
        for (let dataKey in _flow_js__WEBPACK_IMPORTED_MODULE_0__.structure.drawflow.Home.data)
            _flow_js__WEBPACK_IMPORTED_MODULE_0__.structure[`code_${dataKey}`] = localStorage.getItem(`code_${dataKey}`)
        console.log(postTitleElement.value, JSON.stringify(_flow_js__WEBPACK_IMPORTED_MODULE_0__.structure));
        let formData = new FormData();
        formData.append("topic", "");
        formData.append("name", postTitleElement.value);
        formData.append("content", JSON.stringify(_flow_js__WEBPACK_IMPORTED_MODULE_0__.structure))
        fetch("/api/post", {
            method: "POST",
            headers: new Headers({ "Authorization": "Bearer " + localStorage.getItem("token") }),
            body: formData,
        }).then(res => {
            return res.json();
        }).then(json => {
            switch (json.status) {
                case 200:
                    alert(json.msg)
                    break;
                default:
                    alert(json.msg);
            }
        })
    });
};


/***/ })

}]);