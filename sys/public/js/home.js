import { scrollTopFeature } from "./element/home/navbar.js";
import { searchFeature } from "./element/shared/search.js";
import { userFeature } from "./element/shared/avatar.js";
import { refreshFeature } from "./element/shared/refresh.js";
import { shaderFeature } from "./element/home/shader.js";
import { filterFeature } from "./element/home/filter.js";
import { returnTopFeature } from "./element/home/locate.js";

let token = JSON.parse(localStorage.getItem("token"));
let user = JSON.parse(localStorage.getItem("user"));

window.onscroll = scrollTopFeature;

window.onload = () => {
    refreshFeature(token, user);
    userFeature(token, user);
    returnTopFeature(200);
    searchFeature();
    filterFeature();
    shaderFeature();
}
