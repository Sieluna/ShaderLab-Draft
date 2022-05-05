import { lazyLoadFeature } from "./element/login/image.js";
import { fetchFeature } from "./element/shared/response.js";

let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "../home.html";
}

redirect(token);

const submitInfo = (target = "") => {
    fetchFeature(`/api/user${target}`, {
        method: "POST",
        body: new URLSearchParams(new FormData(document.getElementById("panel-input"))),
        redirect: "follow"
    }, result => {
        if (!result) return;
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("token", JSON.stringify({ accessToken: result.accessToken, refreshToken: result.refreshToken }));
        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Login Success!"
        }).then(() => redirect(true));
    });
}

window.onload = () => {
    lazyLoadFeature();
    document.querySelector(".sl-panel > .panel-login > .register").addEventListener("click", () => submitInfo());
    document.querySelector(".sl-panel > .panel-login > .login").addEventListener("click", () => submitInfo("/login"));
}
