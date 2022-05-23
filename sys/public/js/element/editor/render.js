import { compileDelegate } from "../../editor/bottom.js";

export const renderFeature = (useDefault = true) => {
    if (useDefault) {

    } else {
        import("./render/babylon.js").then(({ compile, feature }) => {
            compileDelegate(compile);
            feature();
        });
    }
}
