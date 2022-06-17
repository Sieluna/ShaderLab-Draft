import { fetchFeature } from "../shared/response.js";
import { swal } from "../shared/alert.js";

const registerElement = document.querySelector(".sl-panel .panel-login .register");
const loginElement = document.querySelector(".sl-panel .panel-login .login");
const loginInputElement = document.querySelector(".sl-panel #panel-input .password input");

const submitInfo = (redirect, target = "") => {
    fetchFeature(`/api/user${target}`, {
        method: "POST",
        body: new URLSearchParams(new FormData(document.getElementById("panel-input"))),
        redirect: "follow"
    }, result => {
        if (!result) return;
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("token", JSON.stringify({ accessToken: result.accessToken, refreshToken: result.refreshToken }));
        swal({
            icon: "success",
            title: "Success",
            text: "Login Success!"
        }).then(() => {
            redirect(true);
        });
    });
}

export const userFeature = (redirect) => {
    registerElement.addEventListener("click", () => {
        submitInfo(redirect, "/signup");
    });
    loginElement.addEventListener("click", () => {
        submitInfo(redirect, "/signin");
    });
    loginInputElement.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            loginElement.click();
        }
    });
}
