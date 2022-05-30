let token = localStorage.getItem("token");

const redirect = (existData = true) => {
    if (existData)
        window.location.href = "home.html";
}

redirect(token);

const loading = () => {
    if (loading.loaded) return;
    loading.loaded = true;
    import("./image.js").then(({lazyLoadFeature}) => lazyLoadFeature());
}

window.onresize = () => loading();

window.onload = () => {
    if (window.innerWidth > 500) loading();
    import("../shared/alert.js").then(({ alertFeature }) => alertFeature());
    import("./user.js").then(({ userFeature }) => userFeature(redirect));
};
