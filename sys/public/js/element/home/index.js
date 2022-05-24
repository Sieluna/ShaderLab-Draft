let token = JSON.parse(localStorage.getItem("token"));
let user = JSON.parse(localStorage.getItem("user"));

window.onscroll = () => {
    import("./navbar.js").then(({ scrollTopFeature }) => scrollTopFeature());
};

window.onload = () => {
    import("./page.js").then(({ navigate, layout }) => {
        document.body.insertAdjacentHTML("beforeend", navigate);
        import("../shared/refresh.js").then(({ refreshFeature }) => refreshFeature(token, user));
        import("../shared/avatar.js").then(({ userFeature }) => userFeature(token, user));
        import("../shared/search.js").then(({ searchFeature }) => searchFeature());
        import("./locate.js").then(({ returnTopFeature }) => returnTopFeature(200));
        import("./filter.js").then(({ filterFeature }) => filterFeature());
        document.body.insertAdjacentHTML("beforeend", layout);
        import("./shader.js").then(({ shaderFeature }) => shaderFeature());
    });
};
