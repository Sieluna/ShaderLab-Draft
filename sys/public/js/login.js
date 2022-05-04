import { lazyLoadFeature } from "./element/login/image.js"

let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "../home.html";
}

redirect(token);

const submitInfo = (target = "") => {
    fetch("/api/user" + target, {
        method: "POST",
        body: new URLSearchParams(new FormData(document.getElementById("panel-input"))),
        redirect: "follow"
    }).then(res => {
        return res.json();
    }).then(json => {
        switch (json.status) {
            case 200:
                localStorage.setItem("token", json.data.token);
                redirect(true);
                break;
            default:
                alert(json.msg);
        }
    });
}

window.onload = () => {
    lazyLoadFeature();
    document.querySelector(".sl-panel > .panel-login > .register").addEventListener("click", () => submitInfo());
    document.querySelector(".sl-panel > .panel-login > .login").addEventListener("click", () => submitInfo("/login"));
}
