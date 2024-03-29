import { __decorate, __extends } from "tslib";
import { serialize, SerializationHelper } from "../../../Misc/decorators.js";
import { Observable } from "../../../Misc/observable.js";
import { Logger } from "../../../Misc/logger.js";
import { Texture } from "../../../Materials/Textures/texture.js";

import { GlowLayer } from "../../../Layers/glowLayer.js";
import { SharpenPostProcess } from "../../../PostProcesses/sharpenPostProcess.js";
import { ImageProcessingPostProcess } from "../../../PostProcesses/imageProcessingPostProcess.js";
import { ChromaticAberrationPostProcess } from "../../../PostProcesses/chromaticAberrationPostProcess.js";
import { GrainPostProcess } from "../../../PostProcesses/grainPostProcess.js";
import { FxaaPostProcess } from "../../../PostProcesses/fxaaPostProcess.js";
import { PostProcessRenderPipeline } from "../../../PostProcesses/RenderPipeline/postProcessRenderPipeline.js";
import { PostProcessRenderEffect } from "../../../PostProcesses/RenderPipeline/postProcessRenderEffect.js";
import { DepthOfFieldEffect, DepthOfFieldEffectBlurLevel } from "../../../PostProcesses/depthOfFieldEffect.js";
import { BloomEffect } from "../../../PostProcesses/bloomEffect.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
import { EngineStore } from "../../../Engines/engineStore.js";
import "../../../PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent.js";
/**
 * The default rendering pipeline can be added to a scene to apply common post processing effects such as anti-aliasing or depth of field.
 * See https://doc.babylonjs.com/how_to/using_default_rendering_pipeline
 */
var DefaultRenderingPipeline = /** @class */ (function (_super) {
    __extends(DefaultRenderingPipeline, _super);
    /**
     * @constructor
     * @param name - The rendering pipeline name (default: "")
     * @param hdr - If high dynamic range textures should be used (default: true)
     * @param scene - The scene linked to this pipeline (default: the last created scene)
     * @param cameras - The array of cameras that the rendering pipeline will be attached to (default: scene.cameras)
     * @param automaticBuild - if false, you will have to manually call prepare() to update the pipeline (default: true)
     */
    function DefaultRenderingPipeline(name, hdr, scene, cameras, automaticBuild) {
        if (name === void 0) { name = ""; }
        if (hdr === void 0) { hdr = true; }
        if (scene === void 0) { scene = EngineStore.LastCreatedScene; }
        if (automaticBuild === void 0) { automaticBuild = true; }
        var _this = _super.call(this, scene.getEngine(), name) || this;
        _this._camerasToBeAttached = [];
        /**
         * ID of the sharpen post process,
         */
        _this.SharpenPostProcessId = "SharpenPostProcessEffect";
        /**
         * @ignore
         * ID of the image processing post process;
         */
        _this.ImageProcessingPostProcessId = "ImageProcessingPostProcessEffect";
        /**
         * @ignore
         * ID of the Fast Approximate Anti-Aliasing post process;
         */
        _this.FxaaPostProcessId = "FxaaPostProcessEffect";
        /**
         * ID of the chromatic aberration post process,
         */
        _this.ChromaticAberrationPostProcessId = "ChromaticAberrationPostProcessEffect";
        /**
         * ID of the grain post process
         */
        _this.GrainPostProcessId = "GrainPostProcessEffect";
        /**
         * Glow post process which adds a glow to emissive areas of the image
         */
        _this._glowLayer = null;
        /**
         * Animations which can be used to tweak settings over a period of time
         */
        _this.animations = [];
        _this._imageProcessingConfigurationObserver = null;
        // Values
        _this._sharpenEnabled = false;
        _this._bloomEnabled = false;
        _this._depthOfFieldEnabled = false;
        _this._depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
        _this._fxaaEnabled = false;
        _this._imageProcessingEnabled = true;
        _this._bloomScale = 0.5;
        _this._chromaticAberrationEnabled = false;
        _this._grainEnabled = false;
        _this._buildAllowed = true;
        /**
         * This is triggered each time the pipeline has been built.
         */
        _this.onBuildObservable = new Observable();
        _this._resizeObserver = null;
        _this._hardwareScaleLevel = 1.0;
        _this._bloomKernel = 64;
        /**
         * Specifies the weight of the bloom in the final rendering
         */
        _this._bloomWeight = 0.15;
        /**
         * Specifies the luma threshold for the area that will be blurred by the bloom
         */
        _this._bloomThreshold = 0.9;
        _this._samples = 1;
        _this._hasCleared = false;
        _this._prevPostProcess = null;
        _this._prevPrevPostProcess = null;
        _this._depthOfFieldSceneObserver = null;
        _this._cameras = cameras || scene.cameras;
        _this._cameras = _this._cameras.slice();
        _this._camerasToBeAttached = _this._cameras.slice();
        _this._buildAllowed = automaticBuild;
        // Initialize
        _this._scene = scene;
        var caps = _this._scene.getEngine().getCaps();
        _this._hdr = hdr && (caps.textureHalfFloatRender || caps.textureFloatRender);
        // Misc
        if (_this._hdr) {
            if (caps.textureHalfFloatRender) {
                _this._defaultPipelineTextureType = 2;
            }
            else if (caps.textureFloatRender) {
                _this._defaultPipelineTextureType = 1;
            }
        }
        else {
            _this._defaultPipelineTextureType = 0;
        }
        // Attach
        scene.postProcessRenderPipelineManager.addPipeline(_this);
        var engine = _this._scene.getEngine();
        // Create post processes before hand so they can be modified before enabled.
        // Block compilation flag is set to true to avoid compilation prior to use, these will be updated on first use in build pipeline.
        _this.sharpen = new SharpenPostProcess("sharpen", 1.0, null, Texture.BILINEAR_SAMPLINGMODE, engine, false, _this._defaultPipelineTextureType, true);
        _this._sharpenEffect = new PostProcessRenderEffect(engine, _this.SharpenPostProcessId, function () {
            return _this.sharpen;
        }, true);
        _this.depthOfField = new DepthOfFieldEffect(_this._scene, null, _this._depthOfFieldBlurLevel, _this._defaultPipelineTextureType, true);
        _this.bloom = new BloomEffect(_this._scene, _this._bloomScale, _this._bloomWeight, _this.bloomKernel, _this._defaultPipelineTextureType, true);
        _this.chromaticAberration = new ChromaticAberrationPostProcess("ChromaticAberration", engine.getRenderWidth(), engine.getRenderHeight(), 1.0, null, Texture.BILINEAR_SAMPLINGMODE, engine, false, _this._defaultPipelineTextureType, true);
        _this._chromaticAberrationEffect = new PostProcessRenderEffect(engine, _this.ChromaticAberrationPostProcessId, function () {
            return _this.chromaticAberration;
        }, true);
        _this.grain = new GrainPostProcess("Grain", 1.0, null, Texture.BILINEAR_SAMPLINGMODE, engine, false, _this._defaultPipelineTextureType, true);
        _this._grainEffect = new PostProcessRenderEffect(engine, _this.GrainPostProcessId, function () {
            return _this.grain;
        }, true);
        _this._resizeObserver = engine.onResizeObservable.add(function () {
            _this._hardwareScaleLevel = engine.getHardwareScalingLevel();
            _this.bloomKernel = _this._bloomKernel;
        });
        _this._imageProcessingConfigurationObserver = _this._scene.imageProcessingConfiguration.onUpdateParameters.add(function () {
            _this.bloom._downscale._exposure = _this._scene.imageProcessingConfiguration.exposure;
            if (_this.imageProcessingEnabled !== _this._scene.imageProcessingConfiguration.isEnabled) {
                _this._imageProcessingEnabled = _this._scene.imageProcessingConfiguration.isEnabled;
                _this._buildPipeline();
            }
        });
        _this._buildPipeline();
        return _this;
    }
    Object.defineProperty(DefaultRenderingPipeline.prototype, "scene", {
        /**
         * Gets active scene
         */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "sharpenEnabled", {
        get: function () {
            return this._sharpenEnabled;
        },
        /**
         * Enable or disable the sharpen process from the pipeline
         */
        set: function (enabled) {
            if (this._sharpenEnabled === enabled) {
                return;
            }
            this._sharpenEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "bloomKernel", {
        /**
         * Specifies the size of the bloom blur kernel, relative to the final output size
         */
        get: function () {
            return this._bloomKernel;
        },
        set: function (value) {
            this._bloomKernel = value;
            this.bloom.kernel = value / this._hardwareScaleLevel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "bloomWeight", {
        get: function () {
            return this._bloomWeight;
        },
        /**
         * The strength of the bloom.
         */
        set: function (value) {
            if (this._bloomWeight === value) {
                return;
            }
            this.bloom.weight = value;
            this._bloomWeight = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "bloomThreshold", {
        get: function () {
            return this._bloomThreshold;
        },
        /**
         * The luminance threshold to find bright areas of the image to bloom.
         */
        set: function (value) {
            if (this._bloomThreshold === value) {
                return;
            }
            this.bloom.threshold = value;
            this._bloomThreshold = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "bloomScale", {
        get: function () {
            return this._bloomScale;
        },
        /**
         * The scale of the bloom, lower value will provide better performance.
         */
        set: function (value) {
            if (this._bloomScale === value) {
                return;
            }
            this._bloomScale = value;
            // recreate bloom and dispose old as this setting is not dynamic
            this._rebuildBloom();
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "bloomEnabled", {
        get: function () {
            return this._bloomEnabled;
        },
        /**
         * Enable or disable the bloom from the pipeline
         */
        set: function (enabled) {
            if (this._bloomEnabled === enabled) {
                return;
            }
            this._bloomEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    DefaultRenderingPipeline.prototype._rebuildBloom = function () {
        // recreate bloom and dispose old as this setting is not dynamic
        var oldBloom = this.bloom;
        this.bloom = new BloomEffect(this._scene, this.bloomScale, this._bloomWeight, this.bloomKernel, this._defaultPipelineTextureType, false);
        this.bloom.threshold = oldBloom.threshold;
        for (var i = 0; i < this._cameras.length; i++) {
            oldBloom.disposeEffects(this._cameras[i]);
        }
    };
    Object.defineProperty(DefaultRenderingPipeline.prototype, "depthOfFieldEnabled", {
        /**
         * If the depth of field is enabled.
         */
        get: function () {
            return this._depthOfFieldEnabled;
        },
        set: function (enabled) {
            if (this._depthOfFieldEnabled === enabled) {
                return;
            }
            this._depthOfFieldEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "depthOfFieldBlurLevel", {
        /**
         * Blur level of the depth of field effect. (Higher blur will effect performance)
         */
        get: function () {
            return this._depthOfFieldBlurLevel;
        },
        set: function (value) {
            if (this._depthOfFieldBlurLevel === value) {
                return;
            }
            this._depthOfFieldBlurLevel = value;
            // recreate dof and dispose old as this setting is not dynamic
            var oldDof = this.depthOfField;
            this.depthOfField = new DepthOfFieldEffect(this._scene, null, this._depthOfFieldBlurLevel, this._defaultPipelineTextureType, false);
            this.depthOfField.focalLength = oldDof.focalLength;
            this.depthOfField.focusDistance = oldDof.focusDistance;
            this.depthOfField.fStop = oldDof.fStop;
            this.depthOfField.lensSize = oldDof.lensSize;
            for (var i = 0; i < this._cameras.length; i++) {
                oldDof.disposeEffects(this._cameras[i]);
            }
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "fxaaEnabled", {
        get: function () {
            return this._fxaaEnabled;
        },
        /**
         * If the anti aliasing is enabled.
         */
        set: function (enabled) {
            if (this._fxaaEnabled === enabled) {
                return;
            }
            this._fxaaEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "samples", {
        get: function () {
            return this._samples;
        },
        /**
         * MSAA sample count, setting this to 4 will provide 4x anti aliasing. (default: 1)
         */
        set: function (sampleCount) {
            if (this._samples === sampleCount) {
                return;
            }
            this._samples = sampleCount;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "imageProcessingEnabled", {
        get: function () {
            return this._imageProcessingEnabled;
        },
        /**
         * If image processing is enabled.
         */
        set: function (enabled) {
            if (this._imageProcessingEnabled === enabled) {
                return;
            }
            this._scene.imageProcessingConfiguration.isEnabled = enabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "glowLayerEnabled", {
        get: function () {
            return this._glowLayer != null;
        },
        /**
         * If glow layer is enabled. (Adds a glow effect to emmissive materials)
         */
        set: function (enabled) {
            if (enabled && !this._glowLayer) {
                this._glowLayer = new GlowLayer("", this._scene);
            }
            else if (!enabled && this._glowLayer) {
                this._glowLayer.dispose();
                this._glowLayer = null;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "glowLayer", {
        /**
         * Gets the glow layer (or null if not defined)
         */
        get: function () {
            return this._glowLayer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "chromaticAberrationEnabled", {
        get: function () {
            return this._chromaticAberrationEnabled;
        },
        /**
         * Enable or disable the chromaticAberration process from the pipeline
         */
        set: function (enabled) {
            if (this._chromaticAberrationEnabled === enabled) {
                return;
            }
            this._chromaticAberrationEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultRenderingPipeline.prototype, "grainEnabled", {
        get: function () {
            return this._grainEnabled;
        },
        /**
         * Enable or disable the grain process from the pipeline
         */
        set: function (enabled) {
            if (this._grainEnabled === enabled) {
                return;
            }
            this._grainEnabled = enabled;
            this._buildPipeline();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get the class name
     * @returns "DefaultRenderingPipeline"
     */
    DefaultRenderingPipeline.prototype.getClassName = function () {
        return "DefaultRenderingPipeline";
    };
    /**
     * Force the compilation of the entire pipeline.
     */
    DefaultRenderingPipeline.prototype.prepare = function () {
        var previousState = this._buildAllowed;
        this._buildAllowed = true;
        this._buildPipeline();
        this._buildAllowed = previousState;
    };
    DefaultRenderingPipeline.prototype._setAutoClearAndTextureSharing = function (postProcess, skipTextureSharing) {
        if (skipTextureSharing === void 0) { skipTextureSharing = false; }
        if (this._hasCleared) {
            postProcess.autoClear = false;
        }
        else {
            postProcess.autoClear = true;
            this._scene.autoClear = false;
            this._hasCleared = true;
        }
        if (!skipTextureSharing) {
            if (this._prevPrevPostProcess) {
                postProcess.shareOutputWith(this._prevPrevPostProcess);
            }
            else {
                postProcess.useOwnOutput();
            }
            if (this._prevPostProcess) {
                this._prevPrevPostProcess = this._prevPostProcess;
            }
            this._prevPostProcess = postProcess;
        }
    };
    DefaultRenderingPipeline.prototype._buildPipeline = function () {
        var _this = this;
        if (!this._buildAllowed) {
            return;
        }
        this._scene.autoClear = true;
        var engine = this._scene.getEngine();
        this._disposePostProcesses();
        if (this._cameras !== null) {
            this._scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(this._name, this._cameras);
            // get back cameras to be used to reattach pipeline
            this._cameras = this._camerasToBeAttached.slice();
        }
        this._reset();
        this._prevPostProcess = null;
        this._prevPrevPostProcess = null;
        this._hasCleared = false;
        if (this.depthOfFieldEnabled) {
            // Multi camera suport
            if (this._cameras.length > 1) {
                for (var _i = 0, _a = this._cameras; _i < _a.length; _i++) {
                    var camera = _a[_i];
                    var depthRenderer = this._scene.enableDepthRenderer(camera);
                    depthRenderer.useOnlyInActiveCamera = true;
                }
                this._depthOfFieldSceneObserver = this._scene.onAfterRenderTargetsRenderObservable.add(function (scene) {
                    if (_this._cameras.indexOf(scene.activeCamera) > -1) {
                        _this.depthOfField.depthTexture = scene.enableDepthRenderer(scene.activeCamera).getDepthMap();
                    }
                });
            }
            else {
                this._scene.onAfterRenderTargetsRenderObservable.remove(this._depthOfFieldSceneObserver);
                var depthRenderer = this._scene.enableDepthRenderer(this._cameras[0]);
                this.depthOfField.depthTexture = depthRenderer.getDepthMap();
            }
            if (!this.depthOfField._isReady()) {
                this.depthOfField._updateEffects();
            }
            this.addEffect(this.depthOfField);
            this._setAutoClearAndTextureSharing(this.depthOfField._effects[0], true);
        }
        else {
            this._scene.onAfterRenderTargetsRenderObservable.remove(this._depthOfFieldSceneObserver);
        }
        if (this.bloomEnabled) {
            if (!this.bloom._isReady()) {
                this.bloom._updateEffects();
            }
            this.addEffect(this.bloom);
            this._setAutoClearAndTextureSharing(this.bloom._effects[0], true);
        }
        if (this._imageProcessingEnabled) {
            this.imageProcessing = new ImageProcessingPostProcess("imageProcessing", 1.0, null, Texture.BILINEAR_SAMPLINGMODE, engine, false, this._defaultPipelineTextureType, this.scene.imageProcessingConfiguration);
            if (this._hdr) {
                this.addEffect(new PostProcessRenderEffect(engine, this.ImageProcessingPostProcessId, function () {
                    return _this.imageProcessing;
                }, true));
                this._setAutoClearAndTextureSharing(this.imageProcessing);
            }
            else {
                this._scene.imageProcessingConfiguration.applyByPostProcess = false;
            }
            if (!this.cameras || this.cameras.length === 0) {
                this._scene.imageProcessingConfiguration.applyByPostProcess = false;
            }
            if (!this.imageProcessing.getEffect()) {
                this.imageProcessing._updateParameters();
            }
        }
        if (this.sharpenEnabled) {
            if (!this.sharpen.isReady()) {
                this.sharpen.updateEffect();
            }
            this.addEffect(this._sharpenEffect);
            this._setAutoClearAndTextureSharing(this.sharpen);
        }
        if (this.grainEnabled) {
            if (!this.grain.isReady()) {
                this.grain.updateEffect();
            }
            this.addEffect(this._grainEffect);
            this._setAutoClearAndTextureSharing(this.grain);
        }
        if (this.chromaticAberrationEnabled) {
            if (!this.chromaticAberration.isReady()) {
                this.chromaticAberration.updateEffect();
            }
            this.addEffect(this._chromaticAberrationEffect);
            this._setAutoClearAndTextureSharing(this.chromaticAberration);
        }
        if (this.fxaaEnabled) {
            this.fxaa = new FxaaPostProcess("fxaa", 1.0, null, Texture.BILINEAR_SAMPLINGMODE, engine, false, this._defaultPipelineTextureType);
            this.addEffect(new PostProcessRenderEffect(engine, this.FxaaPostProcessId, function () {
                return _this.fxaa;
            }, true));
            this._setAutoClearAndTextureSharing(this.fxaa, true);
        }
        if (this._cameras !== null) {
            this._scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(this._name, this._cameras);
        }
        // In multicamera mode, the scene needs to autoclear in between cameras.
        if (this._scene.activeCameras && this._scene.activeCameras.length > 1) {
            this._scene.autoClear = true;
        }
        if (!this._enableMSAAOnFirstPostProcess(this.samples) && this.samples > 1) {
            Logger.Warn("MSAA failed to enable, MSAA is only supported in browsers that support webGL >= 2.0");
        }
        this.onBuildObservable.notifyObservers(this);
    };
    DefaultRenderingPipeline.prototype._disposePostProcesses = function (disposeNonRecreated) {
        if (disposeNonRecreated === void 0) { disposeNonRecreated = false; }
        for (var i = 0; i < this._cameras.length; i++) {
            var camera = this._cameras[i];
            if (this.imageProcessing) {
                this.imageProcessing.dispose(camera);
            }
            if (this.fxaa) {
                this.fxaa.dispose(camera);
            }
            // These are created in the constructor and should not be disposed on every pipeline change
            if (disposeNonRecreated) {
                if (this.sharpen) {
                    this.sharpen.dispose(camera);
                }
                if (this.depthOfField) {
                    this._scene.onAfterRenderTargetsRenderObservable.remove(this._depthOfFieldSceneObserver);
                    this.depthOfField.disposeEffects(camera);
                }
                if (this.bloom) {
                    this.bloom.disposeEffects(camera);
                }
                if (this.chromaticAberration) {
                    this.chromaticAberration.dispose(camera);
                }
                if (this.grain) {
                    this.grain.dispose(camera);
                }
                if (this._glowLayer) {
                    this._glowLayer.dispose();
                }
            }
        }
        this.imageProcessing = null;
        this.fxaa = null;
        if (disposeNonRecreated) {
            this.sharpen = null;
            this._sharpenEffect = null;
            this.depthOfField = null;
            this.bloom = null;
            this.chromaticAberration = null;
            this._chromaticAberrationEffect = null;
            this.grain = null;
            this._grainEffect = null;
            this._glowLayer = null;
        }
    };
    /**
     * Adds a camera to the pipeline
     * @param camera the camera to be added
     */
    DefaultRenderingPipeline.prototype.addCamera = function (camera) {
        this._camerasToBeAttached.push(camera);
        this._buildPipeline();
    };
    /**
     * Removes a camera from the pipeline
     * @param camera the camera to remove
     */
    DefaultRenderingPipeline.prototype.removeCamera = function (camera) {
        var index = this._camerasToBeAttached.indexOf(camera);
        this._camerasToBeAttached.splice(index, 1);
        this._buildPipeline();
    };
    /**
     * Dispose of the pipeline and stop all post processes
     */
    DefaultRenderingPipeline.prototype.dispose = function () {
        this.onBuildObservable.clear();
        this._disposePostProcesses(true);
        this._scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(this._name, this._cameras);
        this._scene.autoClear = true;
        if (this._resizeObserver) {
            this._scene.getEngine().onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        this._scene.imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingConfigurationObserver);
        _super.prototype.dispose.call(this);
    };
    /**
     * Serialize the rendering pipeline (Used when exporting)
     * @returns the serialized object
     */
    DefaultRenderingPipeline.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "DefaultRenderingPipeline";
        return serializationObject;
    };
    /**
     * Parse the serialized pipeline
     * @param source Source pipeline.
     * @param scene The scene to load the pipeline to.
     * @param rootUrl The URL of the serialized pipeline.
     * @returns An instantiated pipeline from the serialized object.
     */
    DefaultRenderingPipeline.Parse = function (source, scene, rootUrl) {
        return SerializationHelper.Parse(function () { return new DefaultRenderingPipeline(source._name, source._name._hdr, scene); }, source, scene, rootUrl);
    };
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "sharpenEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "bloomKernel", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "_bloomWeight", void 0);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "_bloomThreshold", void 0);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "_hdr", void 0);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "bloomWeight", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "bloomThreshold", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "bloomScale", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "bloomEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "depthOfFieldEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "depthOfFieldBlurLevel", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "fxaaEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "samples", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "imageProcessingEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "glowLayerEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "chromaticAberrationEnabled", null);
    __decorate([
        serialize()
    ], DefaultRenderingPipeline.prototype, "grainEnabled", null);
    return DefaultRenderingPipeline;
}(PostProcessRenderPipeline));
export { DefaultRenderingPipeline };
RegisterClass("BABYLON.DefaultRenderingPipeline", DefaultRenderingPipeline);
//# sourceMappingURL=defaultRenderingPipeline.js.map