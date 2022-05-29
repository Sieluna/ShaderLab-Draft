let token = JSON.parse(localStorage.getItem("token"));
let user = JSON.parse(localStorage.getItem("user"));

window.onscroll = () => {
    import("./navbar.js").then(({ scrollTopFeature }) => scrollTopFeature());
};

window.onload = () => {
    import("../shared/alert.js").then(({ alertFeature }) => alertFeature());
    import("./page/navigate.js").then(({ NavigateElement }) => {
        document.body.insertAdjacentElement("afterbegin", new NavigateElement());
        import("../shared/refresh.js").then(({ refreshFeature }) => refreshFeature(token, user));
        import("../shared/avatar.js").then(({ userFeature }) => userFeature(token, user));
        import("../shared/search.js").then(({ searchFeature }) => searchFeature());
        import("./locate.js").then(({ returnTopFeature }) => returnTopFeature(200));
        import("./filter.js").then(({ filterFeature }) => filterFeature());
    });
    import("./page/layout.js").then(({ LayoutElement }) => {
        document.body.insertAdjacentElement("beforeend", new LayoutElement());
        import("./shader.js").then(({ shaderFeature }) => shaderFeature());
    });
};
