"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[996],{

/***/ 996:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "background": () => (/* binding */ background),
/* harmony export */   "navigate": () => (/* binding */ navigate),
/* harmony export */   "panel": () => (/* binding */ panel)
/* harmony export */ });
const background = `
    <div class="sl-background" data-large="./img/login/background.jpg">
        <img src="/img/login/background.min.jpg" class="small" alt="">
    </div>
`;

const navigate = `
    <div class="sl-nav">
        <div class="nav-label">ShaderLab</div>
    </div>
`;

const panel = `
    <main class="sl-panel">
        <div class="panel-title">ShaderLab</div>
        <form id="panel-input">
            <div class="account">
                <span>Account</span>
                <input type="text" name="account" placeholder="E-mail address / ShaderLab ID" autocomplete="off" maxlength="16" spellcheck="false">
            </div>
            <div class="password">
                <div class="left">
                    <span>Password</span>
                    <input type="password" name="password" placeholder="password" autocomplete="off" maxlength="45" spellcheck="false">
                </div>
                <span class="forget">fogot?</span>
            </div>
        </form>
        <div class="panel-login">
            <div class="register">Register</div>
            <div class="login">Login</div>
        </div>
        <div class="panel-third">
            <div class="title">Third-party</div>
            <div class="sns">
                <span class="github">Github</span>
                <span class="google">Google</span>
            </div>
        </div>
    </main>
`;


/***/ })

}]);