import "../../../css/editor.css" assert { type: "css" };

const token = JSON.parse(localStorage.getItem("token"));
const user = JSON.parse(localStorage.getItem("user"));

window.onload = () => {
    import("../shared/alert.js").then(({ alertFeature }) => alertFeature());
    import("./page.js").then(({ navigate, editor }) => {
        document.body.insertAdjacentHTML("beforeend", navigate);
        import("../shared/refresh.js").then(({ refreshFeature }) => refreshFeature(token, user));
        import("../shared/avatar.js").then(({ userFeature }) => userFeature(token, user));
        import("../shared/search.js").then(({ searchFeature }) => searchFeature());
        document.body.insertAdjacentHTML("beforeend", editor);
        import("./state.js").then(({ stateFeature }) => stateFeature());
        import("./flow.js").then(({ flowFeature }) => flowFeature());
        import("./render.js").then(({ renderFeature }) => renderFeature(false));
        import("./upload.js").then(({ uploadFeature }) => uploadFeature());
        for (let i = 0; i < 25; i++)
            document.body.insertAdjacentHTML("beforeend", "<br/>");
    });
};
