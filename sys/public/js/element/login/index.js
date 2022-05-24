import { lazyLoadFeature } from "./image.js";
import { userFeature } from "./user.js";

let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "home.html";
}

redirect(token);

window.onload = () => {
    lazyLoadFeature();
    userFeature(token);
}
