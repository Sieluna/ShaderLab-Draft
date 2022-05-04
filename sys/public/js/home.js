import { scrollTopFeature } from "./element/home/navbar.js";
import { searchFeature } from "./element/shared/search.js";
import { userFeature } from "./element/shared/user.js";

//const user = localStorage.getItem("user");

const user = {}

const avatarElement = document.querySelector(".sl-nav .avatar-container");

if (user != null) {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: none"));
    avatarElement.setAttribute("style", "display: block");
} else {
    document.querySelectorAll(".sl-nav .login-entry").forEach(node => node.setAttribute("style", "display: block"));
    avatarElement.setAttribute("style", "display: none");
}

window.onscroll = scrollTopFeature;

window.onload = () => {
    searchFeature();
    userFeature(user);
}
