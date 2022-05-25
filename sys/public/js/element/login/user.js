import { fetchFeature } from "../shared/response.js";
import { swal } from "../shared/alert.js";

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
        swal({
            icon: "success",
            title: "Success",
            text: "Login Success!"
        }).then(() => window.location.href = "home.html");
    });
}

export const userFeature = () => {
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
