import { __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { Logger } from "../../../Misc/logger.js";
import { serialize, SerializationHelper } from "../../../Misc/decorators.js";
import { Vector3, TmpVectors } from "../../../Maths/math.vector.js";
import { Camera } from "../../../Cameras/camera.js";
import { Texture } from "../../../Materials/Textures/texture.js";
import { DynamicTexture } from "../../../Materials/Textures/dynamicTexture.js";
import { PostProcess } from "../../../PostProcesses/postProcess.js";
import { PostProcessRenderPipeline } from "../../../PostProcesses/RenderPipeline/postProcessRenderPipeline.js";
import { PostProcessRenderEffect } from "../../../PostProcesses/RenderPipeline/postProcessRenderEffect.js";
import { PassPostProcess } from "../../../PostProcesses/passPostProcess.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { EngineStore } from "../../../Engines/engineStore.js";
import { SSAO2Configuration } from "../../../Rendering/ssao2Configuration.js";

import "../../../PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent.js";
import "../../../Shaders/ssao2.fragment.js";
import "../../../Shaders/ssaoCombine.fragment.js";
/**
 * Render pipeline to produce ssao effect
 */
var SSAO2RenderingPipeline = /** @class */ (function (_super) {
    __extends(SSAO2RenderingPipeline, _super);
    /**
     * @constructor
     * @param name The rendering pipeline name
     * @param scene The scene linked to this pipeline
     * @param ratio The size of the postprocesses. Can be a number shared between passes or an object for more precision: { ssaoRatio: 0.5, blurRatio: 1.0 }
     * @param cameras The array of cameras that the rendering pipeline will be attached to
     * @param forceGeometryBuffer Set to true if you want to use the legacy geometry buffer renderer
     * @param textureType The texture type used by the different post processes created by SSAO (default: 0)
     */
    function SSAO2RenderingPipeline(name, scene, ratio, cameras, forceGeometryBuffer, textureType) {
        if (forceGeometryBuffer === void 0) { forceGeometryBuffer = false; }
        if (textureType === void 0) { textureType = 0; }
        var _this = _super.call(this, scene.getEngine(), name) || this;
        // Members
        /**
         * @ignore
         * The PassPostProcess id in the pipeline that contains the original scene color
         */
        _this.SSAOOriginalSceneColorEffect = "SSAOOriginalSceneColorEffect";
        /**
         * @ignore
         * The SSAO PostProcess id in the pipeline
         */
        _this.SSAORenderEffect = "SSAORenderEffect";
        /**
         * @ignore
         * The horizontal blur PostProcess id in the pipeline
         */
        _this.SSAOBlurHRenderEffect = "SSAOBlurHRenderEffect";
        /**
         * @ignore
         * The vertical blur PostProcess id in the pipeline
         */
        _this.SSAOBlurVRenderEffect = "SSAOBlurVRenderEffect";
        /**
         * @ignore
         * The PostProcess id in the pipeline that combines the SSAO-Blur output with the original scene color (SSAOOriginalSceneColorEffect)
         */
        _this.SSAOCombineRenderEffect = "SSAOCombineRenderEffect";
        /**
         * The output strength of the SSAO post-process. Default value is 1.0.
         */
        _this.totalStrength = 1.0;
        /**
         * Maximum depth value to still render AO. A smooth falloff makes the dimming more natural, so there will be no abrupt shading change.
         */
        _this.maxZ = 100.0;
        /**
         * In order to save performances, SSAO radius is clamped on close geometry. This ratio changes by how much
         */
        _this.minZAspect = 0.2;
        _this._samples = 8;
        _this._textureSamples = 1;
        /**
         * Force rendering the geometry through geometry buffer
         */
        _this._forceGeometryBuffer = false;
        _this._expensiveBlur = true;
        /**
         * The radius around the analyzed pixel used by the SSAO post-process. Default value is 2.0
         */
        _this.radius = 2.0;
        /**
         * The base color of the SSAO post-process
         * The final result is "base + ssao" between [0, 1]
         */
        _this.base = 0;
        _this._bits = new Uint32Array(1);
        _this._scene = scene;
        _this._ratio = ratio;
        _this._forceGeometryBuffer = forceGeometryBuffer;
        if (!_this.isSupported) {
            Logger.Error("The current engine does not support SSAO 2.");
            return _this;
        }
        var ssaoRatio = _this._ratio.ssaoRatio || ratio;
        var blurRatio = _this._ratio.blurRatio || ratio;
        // Set up assets
        if (_this._forceGeometryBuffer) {
            scene.enableGeometryBufferRenderer();
        }
        else {
            scene.enablePrePassRenderer();
        }
        _this._createRandomTexture();
        _this._originalColorPostProcess = new PassPostProcess("SSAOOriginalSceneColor", 1.0, null, Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), undefined, textureType);
        _this._originalColorPostProcess.samples = _this.textureSamples;
        _this._createSSAOPostProcess(1.0, textureType);
        _this._createBlurPostProcess(ssaoRatio, blurRatio, textureType);
        _this._createSSAOCombinePostProcess(blurRatio, textureType);
        // Set up pipeline
        _this.addEffect(new PostProcessRenderEffect(scene.getEngine(), _this.SSAOOriginalSceneColorEffect, function () {
            return _this._originalColorPostProcess;
        }, true));
        _this.addEffect(new PostProcessRenderEffect(scene.getEngine(), _this.SSAORenderEffect, function () {
            return _this._ssaoPostProcess;
        }, true));
        _this.addEffect(new PostProcessRenderEffect(scene.getEngine(), _this.SSAOBlurHRenderEffect, function () {
            return _this._blurHPostProcess;
        }, true));
        _this.addEffect(new PostProcessRenderEffect(scene.getEngine(), _this.SSAOBlurVRenderEffect, function () {
            return _this._blurVPostProcess;
        }, true));
        _this.addEffect(new PostProcessRenderEffect(scene.getEngine(), _this.SSAOCombineRenderEffect, function () {
            return _this._ssaoCombinePostProcess;
        }, true));
        // Finish
        scene.postProcessRenderPipelineManager.addPipeline(_this);
        if (cameras) {
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(name, cameras);
        }
        return _this;
    }
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "samples", {
        get: function () {
            return this._samples;
        },
        /**
         * Number of samples used for the SSAO calculations. Default value is 8
         */
        set: function (n) {
            this._samples = n;
            this._ssaoPostProcess.updateEffect(this._getDefinesForSSAO());
            this._sampleSphere = this._generateHemisphere();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "textureSamples", {
        get: function () {
            return this._textureSamples;
        },
        /**
         * Number of samples to use for antialiasing
         */
        set: function (n) {
            this._textureSamples = n;
            if (this._prePassRenderer) {
                this._prePassRenderer.samples = n;
            }
            else {
                this._originalColorPostProcess.samples = n;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "_geometryBufferRenderer", {
        get: function () {
            if (!this._forceGeometryBuffer) {
                return null;
            }
            return this._scene.geometryBufferRenderer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "_prePassRenderer", {
        get: function () {
            if (this._forceGeometryBuffer) {
                return null;
            }
            return this._scene.prePassRenderer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "expensiveBlur", {
        get: function () {
            return this._expensiveBlur;
        },
        /**
         * If bilateral blur should be used
         */
        set: function (b) {
            this._blurHPostProcess.updateEffect("#define BILATERAL_BLUR\n#define BILATERAL_BLUR_H\n#define SAMPLES 16\n#define EXPENSIVE " + (b ? "1" : "0") + "\n", null, [
                "textureSampler",
                "depthSampler",
            ]);
            this._blurVPostProcess.updateEffect("#define BILATERAL_BLUR\n#define SAMPLES 16\n#define EXPENSIVE " + (b ? "1" : "0") + "\n", null, ["textureSampler", "depthSampler"]);
            this._expensiveBlur = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline, "IsSupported", {
        /**
         *  Support test.
         */
        get: function () {
            var engine = EngineStore.LastCreatedEngine;
            if (!engine) {
                return false;
            }
            return engine._features.supportSSAO2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SSAO2RenderingPipeline.prototype, "scene", {
        /**
         * Gets active scene
         */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    // Public Methods
    /**
     * Get the class name
     * @returns "SSAO2RenderingPipeline"
     */
    SSAO2RenderingPipeline.prototype.getClassName = function () {
        return "SSAO2RenderingPipeline";
    };
    /**
     * Removes the internal pipeline assets and detaches the pipeline from the scene cameras
     * @param disableGeometryBufferRenderer
     */
    SSAO2RenderingPipeline.prototype.dispose = function (disableGeometryBufferRenderer) {
        if (disableGeometryBufferRenderer === void 0) { disableGeometryBufferRenderer = false; }
        for (var i = 0; i < this._scene.cameras.length; i++) {
            var camera = this._scene.cameras[i];
            this._originalColorPostProcess.dispose(camera);
            this._ssaoPostProcess.dispose(camera);
            this._blurHPostProcess.dispose(camera);
            this._blurVPostProcess.dispose(camera);
            this._ssaoCombinePostProcess.dispose(camera);
        }
        this._randomTexture.dispose();
        if (disableGeometryBufferRenderer) {
            this._scene.disableGeometryBufferRenderer();
        }
        this._scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(this._name, this._scene.cameras);
        _super.prototype.dispose.call(this);
    };
    // Private Methods
    SSAO2RenderingPipeline.prototype._createBlurPostProcess = function (ssaoRatio, blurRatio, textureType) {
        var _this = this;
        this._samplerOffsets = [];
        var expensive = this.expensiveBlur;
        for (var i = -8; i < 8; i++) {
            this._samplerOffsets.push(i * 2 + 0.5);
        }
        this._blurHPostProcess = new PostProcess("BlurH", "ssao2", ["outSize", "samplerOffsets", "near", "far", "radius"], ["depthSampler"], ssaoRatio, null, Texture.TRILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, "#define BILATERAL_BLUR\n#define BILATERAL_BLUR_H\n#define SAMPLES 16\n#define EXPENSIVE " + (expensive ? "1" : "0") + "\n", textureType);
        this._blurHPostProcess.onApply = function (effect) {
            if (!_this._scene.activeCamera) {
                return;
            }
            effect.setFloat("outSize", _this._ssaoCombinePostProcess.width > 0 ? _this._ssaoCombinePostProcess.width : _this._originalColorPostProcess.width);
            effect.setFloat("near", _this._scene.activeCamera.minZ);
            effect.setFloat("far", _this._scene.activeCamera.maxZ);
            effect.setFloat("radius", _this.radius);
            if (_this._geometryBufferRenderer) {
                effect.setTexture("depthSampler", _this._geometryBufferRenderer.getGBuffer().textures[0]);
            }
            else if (_this._prePassRenderer) {
                effect.setTexture("depthSampler", _this._prePassRenderer.getRenderTarget().textures[_this._prePassRenderer.getIndex(5)]);
            }
            effect.setArray("samplerOffsets", _this._samplerOffsets);
        };
        this._blurVPostProcess = new PostProcess("BlurV", "ssao2", ["outSize", "samplerOffsets", "near", "far", "radius"], ["depthSampler"], blurRatio, null, Texture.TRILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, "#define BILATERAL_BLUR\n#define BILATERAL_BLUR_V\n#define SAMPLES 16\n#define EXPENSIVE " + (expensive ? "1" : "0") + "\n", textureType);
        this._blurVPostProcess.onApply = function (effect) {
            if (!_this._scene.activeCamera) {
                return;
            }
            effect.setFloat("outSize", _this._ssaoCombinePostProcess.height > 0 ? _this._ssaoCombinePostProcess.height : _this._originalColorPostProcess.height);
            effect.setFloat("near", _this._scene.activeCamera.minZ);
            effect.setFloat("far", _this._scene.activeCamera.maxZ);
            effect.setFloat("radius", _this.radius);
            if (_this._geometryBufferRenderer) {
                effect.setTexture("depthSampler", _this._geometryBufferRenderer.getGBuffer().textures[0]);
            }
            else if (_this._prePassRenderer) {
                effect.setTexture("depthSampler", _this._prePassRenderer.getRenderTarget().textures[_this._prePassRenderer.getIndex(5)]);
            }
            effect.setArray("samplerOffsets", _this._samplerOffsets);
        };
        this._blurHPostProcess.samples = this.textureSamples;
        this._blurVPostProcess.samples = this.textureSamples;
    };
    /** @hidden */
    SSAO2RenderingPipeline.prototype._rebuild = function () {
        _super.prototype._rebuild.call(this);
    };
    //Van der Corput radical inverse
    SSAO2RenderingPipeline.prototype._radicalInverse_VdC = function (i) {
        this._bits[0] = i;
        this._bits[0] = ((this._bits[0] << 16) | (this._bits[0] >> 16)) >>> 0;
        this._bits[0] = ((this._bits[0] & 0x55555555) << 1) | (((this._bits[0] & 0xaaaaaaaa) >>> 1) >>> 0);
        this._bits[0] = ((this._bits[0] & 0x33333333) << 2) | (((this._bits[0] & 0xcccccccc) >>> 2) >>> 0);
        this._bits[0] = ((this._bits[0] & 0x0f0f0f0f) << 4) | (((this._bits[0] & 0xf0f0f0f0) >>> 4) >>> 0);
        this._bits[0] = ((this._bits[0] & 0x00ff00ff) << 8) | (((this._bits[0] & 0xff00ff00) >>> 8) >>> 0);
        return this._bits[0] * 2.3283064365386963e-10; // / 0x100000000 or / 4294967296
    };
    SSAO2RenderingPipeline.prototype._hammersley = function (i, n) {
        return [i / n, this._radicalInverse_VdC(i)];
    };
    SSAO2RenderingPipeline.prototype._hemisphereSample_uniform = function (u, v) {
        var phi = v * 2.0 * Math.PI;
        // rejecting samples that are close to tangent plane to avoid z-fighting artifacts
        var cosTheta = 1.0 - (u * 0.85 + 0.15);
        var sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);
        return new Vector3(Math.cos(phi) * sinTheta, Math.sin(phi) * sinTheta, cosTheta);
    };
    SSAO2RenderingPipeline.prototype._generateHemisphere = function () {
        var numSamples = this.samples;
        var result = [];
        var vector;
        var i = 0;
        while (i < numSamples) {
            if (numSamples < 16) {
                vector = this._hemisphereSample_uniform(Math.random(), Math.random());
            }
            else {
                var rand = this._hammersley(i, numSamples);
                vector = this._hemisphereSample_uniform(rand[0], rand[1]);
            }
            result.push(vector.x, vector.y, vector.z);
            i++;
        }
        return result;
    };
    SSAO2RenderingPipeline.prototype._getDefinesForSSAO = function () {
        var defines = "#define SAMPLES " + this.samples + "\n#define SSAO";
        return defines;
    };
    SSAO2RenderingPipeline.prototype._createSSAOPostProcess = function (ratio, textureType) {
        var _this = this;
        this._sampleSphere = this._generateHemisphere();
        var defines = this._getDefinesForSSAO();
        var samplers = ["randomSampler", "depthSampler", "normalSampler"];
        this._ssaoPostProcess = new PostProcess("ssao2", "ssao2", [
            "sampleSphere",
            "samplesFactor",
            "randTextureTiles",
            "totalStrength",
            "radius",
            "base",
            "range",
            "projection",
            "near",
            "far",
            "texelSize",
            "xViewport",
            "yViewport",
            "maxZ",
            "minZAspect",
            "depthProjection",
        ], samplers, ratio, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, defines, textureType);
        this._ssaoPostProcess.onApply = function (effect) {
            var _a, _b, _c, _d;
            if (!_this._scene.activeCamera) {
                return;
            }
            effect.setArray3("sampleSphere", _this._sampleSphere);
            effect.setFloat("randTextureTiles", 32.0);
            effect.setFloat("samplesFactor", 1 / _this.samples);
            effect.setFloat("totalStrength", _this.totalStrength);
            effect.setFloat2("texelSize", 1 / _this._ssaoPostProcess.width, 1 / _this._ssaoPostProcess.height);
            effect.setFloat("radius", _this.radius);
            effect.setFloat("maxZ", _this.maxZ);
            effect.setFloat("minZAspect", _this.minZAspect);
            effect.setFloat("base", _this.base);
            effect.setFloat("near", _this._scene.activeCamera.minZ);
            effect.setFloat("far", _this._scene.activeCamera.maxZ);
            if (_this._scene.activeCamera.mode === Camera.PERSPECTIVE_CAMERA) {
                effect.setMatrix3x3("depthProjection", SSAO2RenderingPipeline.PERSPECTIVE_DEPTH_PROJECTION);
                effect.setFloat("xViewport", Math.tan(_this._scene.activeCamera.fov / 2) * _this._scene.getEngine().getAspectRatio(_this._scene.activeCamera, true));
                effect.setFloat("yViewport", Math.tan(_this._scene.activeCamera.fov / 2));
            }
            else {
                var halfWidth = _this._scene.getEngine().getRenderWidth() / 2.0;
                var halfHeight = _this._scene.getEngine().getRenderHeight() / 2.0;
                var orthoLeft = (_a = _this._scene.activeCamera.orthoLeft) !== null && _a !== void 0 ? _a : -halfWidth;
                var orthoRight = (_b = _this._scene.activeCamera.orthoRight) !== null && _b !== void 0 ? _b : halfWidth;
                var orthoBottom = (_c = _this._scene.activeCamera.orthoBottom) !== null && _c !== void 0 ? _c : -halfHeight;
                var orthoTop = (_d = _this._scene.activeCamera.orthoTop) !== null && _d !== void 0 ? _d : halfHeight;
                effect.setMatrix3x3("depthProjection", SSAO2RenderingPipeline.ORTHO_DEPTH_PROJECTION);
                effect.setFloat("xViewport", (orthoRight - orthoLeft) * 0.5);
                effect.setFloat("yViewport", (orthoTop - orthoBottom) * 0.5);
            }
            effect.setMatrix("projection", _this._scene.getProjectionMatrix());
            if (_this._geometryBufferRenderer) {
                effect.setTexture("depthSampler", _this._geometryBufferRenderer.getGBuffer().textures[0]);
                effect.setTexture("normalSampler", _this._geometryBufferRenderer.getGBuffer().textures[1]);
            }
            else if (_this._prePassRenderer) {
                effect.setTexture("depthSampler", _this._prePassRenderer.getRenderTarget().textures[_this._prePassRenderer.getIndex(5)]);
                effect.setTexture("normalSampler", _this._prePassRenderer.getRenderTarget().textures[_this._prePassRenderer.getIndex(6)]);
            }
            effect.setTexture("randomSampler", _this._randomTexture);
        };
        this._ssaoPostProcess.samples = this.textureSamples;
        if (!this._forceGeometryBuffer) {
            this._ssaoPostProcess._prePassEffectConfiguration = new SSAO2Configuration();
        }
    };
    SSAO2RenderingPipeline.prototype._createSSAOCombinePostProcess = function (ratio, textureType) {
        var _this = this;
        this._ssaoCombinePostProcess = new PostProcess("ssaoCombine", "ssaoCombine", [], ["originalColor", "viewport"], ratio, null, Texture.BILINEAR_SAMPLINGMODE, this._scene.getEngine(), false, undefined, textureType);
        this._ssaoCombinePostProcess.onApply = function (effect) {
            var viewport = _this._scene.activeCamera.viewport;
            effect.setVector4("viewport", TmpVectors.Vector4[0].copyFromFloats(viewport.x, viewport.y, viewport.width, viewport.height));
            effect.setTextureFromPostProcessOutput("originalColor", _this._originalColorPostProcess);
        };
        this._ssaoCombinePostProcess.samples = this.textureSamples;
    };
    SSAO2RenderingPipeline.prototype._createRandomTexture = function () {
        var size = 128;
        this._randomTexture = new DynamicTexture("SSAORandomTexture", size, this._scene, false, Texture.TRILINEAR_SAMPLINGMODE);
        this._randomTexture.wrapU = Texture.WRAP_ADDRESSMODE;
        this._randomTexture.wrapV = Texture.WRAP_ADDRESSMODE;
        var context = this._randomTexture.getContext();
        var rand = function (min, max) {
            return Math.random() * (max - min) + min;
        };
        var randVector = Vector3.Zero();
        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                randVector.x = rand(0.0, 1.0);
                randVector.y = rand(0.0, 1.0);
                randVector.z = 0.0;
                randVector.normalize();
                randVector.scaleInPlace(255);
                randVector.x = Math.floor(randVector.x);
                randVector.y = Math.floor(randVector.y);
                context.fillStyle = "rgb(" + randVector.x + ", " + randVector.y + ", " + randVector.z + ")";
                context.fillRect(x, y, 1, 1);
            }
        }
        this._randomTexture.update(false);
    };
    /**
     * Serialize the rendering pipeline (Used when exporting)
     * @returns the serialized object
     */
    SSAO2RenderingPipeline.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "SSAO2RenderingPipeline";
        return serializationObject;
    };
    /**
     * Parse the serialized pipeline
     * @param source Source pipeline.
     * @param scene The scene to load the pipeline to.
     * @param rootUrl The URL of the serialized pipeline.
     * @returns An instantiated pipeline from the serialized object.
     */
    SSAO2RenderingPipeline.Parse = function (source, scene, rootUrl) {
        return SerializationHelper.Parse(function () { return new SSAO2RenderingPipeline(source._name, scene, source._ratio); }, source, scene, rootUrl);
    };
    SSAO2RenderingPipeline.ORTHO_DEPTH_PROJECTION = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    SSAO2RenderingPipeline.PERSPECTIVE_DEPTH_PROJECTION = [0, 0, 0, 0, 0, 0, 1, 1, 1];
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "totalStrength", void 0);
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "maxZ", void 0);
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "minZAspect", void 0);
    __decorate([
        serialize("samples")
    ], SSAO2RenderingPipeline.prototype, "_samples", void 0);
    __decorate([
        serialize("textureSamples")
    ], SSAO2RenderingPipeline.prototype, "_textureSamples", void 0);
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "_ratio", void 0);
    __decorate([
        serialize("expensiveBlur")
    ], SSAO2RenderingPipeline.prototype, "_expensiveBlur", void 0);
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "radius", void 0);
    __decorate([
        serialize()
    ], SSAO2RenderingPipeline.prototype, "base", void 0);
    return SSAO2RenderingPipeline;
}(PostProcessRenderPipeline));
export { SSAO2RenderingPipeline };
RegisterClass("BABYLON.SSAO2RenderingPipeline", SSAO2RenderingPipeline);
//# sourceMappingURL=ssao2RenderingPipeline.js.map