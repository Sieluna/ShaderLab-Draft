let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "home.html";
}

redirect(token);

let imageLoad = false;

const loading = () => {
    imageLoad = true;
    import("./image.js").then(({ lazyLoadFeature }) => lazyLoadFeature());
}

window.onresize = () => { if (!imageLoad) loading(); }

window.onload = () => {
    if (window.innerWidth > 500) loading();
    import("../shared/alert.js").then(({ alertFeature }) => alertFeature());
    import("./user.js").then(({ userFeature }) => userFeature(token));
};
