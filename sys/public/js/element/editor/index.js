const token = JSON.parse(localStorage.getItem("token"));
const user = JSON.parse(localStorage.getItem("user"));

window.onload = () => {
    import("../shared/alert.js").then(({ alertFeature }) => alertFeature());
    import("./page/navigate.js").then(({ NavigateElement }) => {
        document.body.insertAdjacentElement("afterbegin", new NavigateElement());
        import("../shared/refresh.js").then(({ refreshFeature }) => refreshFeature(token, user));
        import("../shared/avatar.js").then(({ userFeature }) => userFeature(token, user));
        import("../shared/search.js").then(({ searchFeature }) => searchFeature("editor"));
    });
    import("./page/editor.js").then(({ EditorElement }) => {
        document.body.insertAdjacentElement("beforeend", new EditorElement());
        import("./state.js").then(({ stateFeature }) => stateFeature());
        import("./flow.js").then(({ flowFeature }) => flowFeature());
        import("./render.js").then(({ renderFeature }) => renderFeature(false));
        import("./upload.js").then(({ uploadFeature }) => uploadFeature());
    })
};
