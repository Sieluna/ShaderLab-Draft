import type { Nullable } from "../types";
import type { Camera } from "../Cameras/camera";
import type { PostProcessOptions } from "./postProcess";
import { PostProcess } from "./postProcess";
import type { Engine } from "../Engines/engine";
import "../Shaders/highlights.fragment";
/**
 * Extracts highlights from the image
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses
 */
export declare class HighlightsPostProcess extends PostProcess {
    /**
     * Gets a string identifying the name of the class
     * @returns "HighlightsPostProcess" string
     */
    getClassName(): string;
    /**
     * Extracts highlights from the image
     * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses
     * @param name The name of the effect.
     * @param options The required width/height ratio to downsize to before computing the render pass.
     * @param camera The camera to apply the render pass to.
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of texture for the post process (default: Engine.TEXTURETYPE_UNSIGNED_INT)
     */
    constructor(name: string, options: number | PostProcessOptions, camera: Nullable<Camera>, samplingMode?: number, engine?: Engine, reusable?: boolean, textureType?: number);
}
