import { scrollTopFeature } from "./element/home/navbar.js";
import { searchFeature } from "./element/shared/search.js";
import { userFeature } from "./element/shared/avatar.js";
import { refreshFeature } from "./element/shared/refresh.js";

const token = JSON.parse(localStorage.getItem("token"));
const user = JSON.parse(localStorage.getItem("user"));

window.onscroll = scrollTopFeature;

window.onload = () => {
    refreshFeature(token, user);
    userFeature(token, user);
    searchFeature();
}
