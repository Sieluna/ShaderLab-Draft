let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "home.html";
}

redirect(token);

window.onload = () => {
    import("./page.js").then(({ background, navigate, panel }) => {
        document.body.insertAdjacentHTML("beforeend", background);
        import("./image.js").then(({ lazyLoadFeature }) => lazyLoadFeature());
        document.body.insertAdjacentHTML("beforeend", panel);
        import("./user.js").then(({ userFeature }) => userFeature(token));
        document.body.insertAdjacentHTML("beforeend", navigate);
    });
};
