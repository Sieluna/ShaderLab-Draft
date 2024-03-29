import { __assign, __extends } from "tslib";
import { Logger } from "../Misc/logger.js";
import { IsWindowObjectExist } from "../Misc/domManagement.js";
import { Color4 } from "../Maths/math.js";
import { Engine } from "../Engines/engine.js";
import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture.js";
import { Effect } from "../Materials/effect.js";

import * as WebGPUConstants from "./WebGPU/webgpuConstants.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { WebGPUPipelineContext } from "./WebGPU/webgpuPipelineContext.js";
import { WebGPUShaderProcessorGLSL } from "./WebGPU/webgpuShaderProcessorsGLSL.js";
import { WebGPUShaderProcessorWGSL } from "./WebGPU/webgpuShaderProcessorsWGSL.js";
import { WebGPUShaderProcessingContext } from "./WebGPU/webgpuShaderProcessingContext.js";
import { Tools } from "../Misc/tools.js";
import { WebGPUTextureHelper } from "./WebGPU/webgpuTextureHelper.js";
import { WebGPUBufferManager } from "./WebGPU/webgpuBufferManager.js";
import { WebGPUHardwareTexture } from "./WebGPU/webgpuHardwareTexture.js";
import { UniformBuffer } from "../Materials/uniformBuffer.js";
import { WebGPURenderPassWrapper } from "./WebGPU/webgpuRenderPassWrapper.js";
import { WebGPUCacheSampler } from "./WebGPU/webgpuCacheSampler.js";
import { WebGPUCacheRenderPipelineTree } from "./WebGPU/webgpuCacheRenderPipelineTree.js";
import { WebGPUStencilStateComposer } from "./WebGPU/webgpuStencilStateComposer.js";
import { WebGPUDepthCullingState } from "./WebGPU/webgpuDepthCullingState.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import { WebGPUMaterialContext } from "./WebGPU/webgpuMaterialContext.js";
import { WebGPUDrawContext } from "./WebGPU/webgpuDrawContext.js";
import { WebGPUCacheBindGroups } from "./WebGPU/webgpuCacheBindGroups.js";
import { WebGPUClearQuad } from "./WebGPU/webgpuClearQuad.js";
import { WebGPURenderItemBlendColor, WebGPURenderItemScissor, WebGPURenderItemStencilRef, WebGPURenderItemViewport, WebGPUBundleList } from "./WebGPU/webgpuBundleList.js";
import { WebGPUTimestampQuery } from "./WebGPU/webgpuTimestampQuery.js";
import { WebGPUOcclusionQuery } from "./WebGPU/webgpuOcclusionQuery.js";
import { Observable } from "../Misc/observable.js";
import { ShaderCodeInliner } from "./Processors/shaderCodeInliner.js";
import { WebGPUTintWASM } from "./WebGPU/webgpuTintWASM.js";
import { WebGPUShaderProcessor } from "./WebGPU/webgpuShaderProcessor.js";
import { ShaderLanguage } from "../Materials/shaderLanguage.js";
import { WebGPUSnapshotRendering } from "./WebGPU/webgpuSnapshotRendering.js";
import { PerformanceConfigurator } from "./performanceConfigurator.js";
/**
 * The web GPU engine class provides support for WebGPU version of babylon.js.
 * @since 5.0.0
 */
var WebGPUEngine = /** @class */ (function (_super) {
    __extends(WebGPUEngine, _super);
    /**
     * Create a new instance of the gpu engine.
     * @param canvas Defines the canvas to use to display the result
     * @param options Defines the options passed to the engine to create the GPU context dependencies
     */
    function WebGPUEngine(canvas, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        var _a, _b, _c, _d;
        _this = _super.call(this, null) || this;
        // Page Life cycle and constants
        _this._uploadEncoderDescriptor = { label: "upload" };
        _this._renderEncoderDescriptor = { label: "render" };
        _this._renderTargetEncoderDescriptor = { label: "renderTarget" };
        /** @hidden */
        _this._clearDepthValue = 1;
        /** @hidden */
        _this._clearReverseDepthValue = 0;
        /** @hidden */
        _this._clearStencilValue = 0;
        _this._defaultSampleCount = 4; // Only supported value for now.
        _this._glslang = null;
        _this._tintWASM = null;
        /** @hidden */
        _this._compiledComputeEffects = {};
        /** @hidden */
        _this._counters = {
            numEnableEffects: 0,
            numEnableDrawWrapper: 0,
            numBundleCreationNonCompatMode: 0,
            numBundleReuseNonCompatMode: 0,
        };
        /**
         * Counters from last frame
         */
        _this.countersLastFrame = {
            numEnableEffects: 0,
            numEnableDrawWrapper: 0,
            numBundleCreationNonCompatMode: 0,
            numBundleReuseNonCompatMode: 0,
        };
        /**
         * Max number of uncaptured error messages to log
         */
        _this.numMaxUncapturedErrors = 20;
        _this._commandBuffers = [null, null, null];
        // Frame Buffer Life Cycle (recreated for each render target pass)
        /** @hidden */
        _this._currentRenderPass = null;
        /** @hidden */
        _this._mainRenderPassWrapper = new WebGPURenderPassWrapper();
        /** @hidden */
        _this._rttRenderPassWrapper = new WebGPURenderPassWrapper();
        /** @hidden */
        _this._pendingDebugCommands = [];
        /** @hidden */
        _this._onAfterUnbindFrameBufferObservable = new Observable();
        _this._currentOverrideVertexBuffers = null;
        _this._currentIndexBuffer = null;
        _this._colorWriteLocal = true;
        _this._forceEnableEffect = false;
        // TODO WEBGPU remove those variables when code stabilized
        /** @hidden */
        _this.dbgShowShaderCode = false;
        /** @hidden */
        _this.dbgSanityChecks = true;
        /** @hidden */
        _this.dbgVerboseLogsForFirstFrames = false;
        /** @hidden */
        _this.dbgVerboseLogsNumFrames = 10;
        /** @hidden */
        _this.dbgLogIfNotDrawWrapper = true;
        /** @hidden */
        _this.dbgShowEmptyEnableEffectCalls = true;
        //------------------------------------------------------------------------------
        //                              Dynamic WebGPU States
        //------------------------------------------------------------------------------
        // index 0 is for main render pass, 1 for RTT render pass
        _this._viewportsCurrent = [
            { x: 0, y: 0, w: 0, h: 0 },
            { x: 0, y: 0, w: 0, h: 0 },
        ];
        _this._scissorsCurrent = [
            { x: 0, y: 0, w: 0, h: 0 },
            { x: 0, y: 0, w: 0, h: 0 },
        ];
        _this._scissorCached = { x: 0, y: 0, z: 0, w: 0 };
        _this._stencilRefsCurrent = [-1, -1];
        _this._blendColorsCurrent = [
            [null, null, null, null],
            [null, null, null, null],
        ];
        _this._name = "WebGPU";
        _this.isNDCHalfZRange = true;
        _this.hasOriginBottomLeft = false;
        options.deviceDescriptor = options.deviceDescriptor || {};
        options.swapChainFormat = options.swapChainFormat || WebGPUConstants.TextureFormat.BGRA8Unorm;
        options.antialiasing = options.antialiasing === undefined ? true : options.antialiasing;
        options.stencil = (_a = options.stencil) !== null && _a !== void 0 ? _a : true;
        options.enableGPUDebugMarkers = (_b = options.enableGPUDebugMarkers) !== null && _b !== void 0 ? _b : false;
        PerformanceConfigurator.SetMatrixPrecision(!!options.useHighPrecisionMatrix);
        Logger.Log("Babylon.js v".concat(Engine.Version, " - ").concat(_this.description, " engine"));
        if (!navigator.gpu) {
            Logger.Error("WebGPU is not supported by your browser.");
            return _this;
        }
        _this._isWebGPU = true;
        _this._shaderPlatformName = "WEBGPU";
        if (options.deterministicLockstep === undefined) {
            options.deterministicLockstep = false;
        }
        if (options.lockstepMaxSteps === undefined) {
            options.lockstepMaxSteps = 4;
        }
        if (options.audioEngine === undefined) {
            options.audioEngine = true;
        }
        _this._deterministicLockstep = options.deterministicLockstep;
        _this._lockstepMaxSteps = options.lockstepMaxSteps;
        _this._timeStep = options.timeStep || 1 / 60;
        _this._doNotHandleContextLost = !!options.doNotHandleContextLost;
        _this._canvas = canvas;
        _this._options = options;
        _this.premultipliedAlpha = (_c = options.premultipliedAlpha) !== null && _c !== void 0 ? _c : true;
        var devicePixelRatio = IsWindowObjectExist() ? window.devicePixelRatio || 1.0 : 1.0;
        var limitDeviceRatio = options.limitDeviceRatio || devicePixelRatio;
        var adaptToDeviceRatio = (_d = options.adaptToDeviceRatio) !== null && _d !== void 0 ? _d : false;
        _this._hardwareScalingLevel = adaptToDeviceRatio ? 1.0 / Math.min(limitDeviceRatio, devicePixelRatio) : 1.0;
        _this._mainPassSampleCount = options.antialiasing ? _this._defaultSampleCount : 1;
        _this._isStencilEnable = options.stencil;
        _this._sharedInit(canvas, !!options.doNotHandleTouchAction, options.audioEngine);
        _this._shaderProcessor = new WebGPUShaderProcessorGLSL();
        _this._shaderProcessorWGSL = new WebGPUShaderProcessorWGSL();
        return _this;
    }
    Object.defineProperty(WebGPUEngine.prototype, "snapshotRenderingMode", {
        /**
         * Gets or sets the snapshot rendering mode
         */
        get: function () {
            return this._snapshotRendering.mode;
        },
        set: function (mode) {
            this._snapshotRendering.mode = mode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a new snapshot at the next frame using the current snapshotRenderingMode
     */
    WebGPUEngine.prototype.snapshotRenderingReset = function () {
        this._snapshotRendering.reset();
    };
    Object.defineProperty(WebGPUEngine.prototype, "snapshotRendering", {
        /**
         * Enables or disables the snapshot rendering mode
         * Note that the WebGL engine does not support snapshot rendering so setting the value won't have any effect for this engine
         */
        get: function () {
            return this._snapshotRendering.enabled;
        },
        set: function (activate) {
            this._snapshotRendering.enabled = activate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "disableCacheSamplers", {
        /**
         * Sets this to true to disable the cache for the samplers. You should do it only for testing purpose!
         */
        get: function () {
            return this._cacheSampler ? this._cacheSampler.disabled : false;
        },
        set: function (disable) {
            if (this._cacheSampler) {
                this._cacheSampler.disabled = disable;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "disableCacheRenderPipelines", {
        /**
         * Sets this to true to disable the cache for the render pipelines. You should do it only for testing purpose!
         */
        get: function () {
            return this._cacheRenderPipeline ? this._cacheRenderPipeline.disabled : false;
        },
        set: function (disable) {
            if (this._cacheRenderPipeline) {
                this._cacheRenderPipeline.disabled = disable;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "disableCacheBindGroups", {
        /**
         * Sets this to true to disable the cache for the bind groups. You should do it only for testing purpose!
         */
        get: function () {
            return this._cacheBindGroups ? this._cacheBindGroups.disabled : false;
        },
        set: function (disable) {
            if (this._cacheBindGroups) {
                this._cacheBindGroups.disabled = disable;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine, "IsSupportedAsync", {
        /**
         * Gets a Promise<boolean> indicating if the engine can be instantiated (ie. if a WebGPU context can be found)
         */
        get: function () {
            return !navigator.gpu
                ? Promise.resolve(false)
                : navigator.gpu
                    .requestAdapter()
                    .then(function (adapter) { return !!adapter; }, function () { return false; })
                    .catch(function () { return false; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine, "IsSupported", {
        /**
         * Not supported by WebGPU, you should call IsSupportedAsync instead!
         */
        get: function () {
            Logger.Warn("You must call IsSupportedAsync for WebGPU!");
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "supportsUniformBuffers", {
        /**
         * Gets a boolean indicating that the engine supports uniform buffers
         */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "supportedExtensions", {
        /** Gets the supported extensions by the WebGPU adapter */
        get: function () {
            return this._adapterSupportedExtensions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "enabledExtensions", {
        /** Gets the currently enabled extensions on the WebGPU device */
        get: function () {
            return this._deviceEnabledExtensions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "description", {
        /**
         * Returns a string describing the current engine
         */
        get: function () {
            var description = this.name + this.version;
            return description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "version", {
        /**
         * Returns the version of the engine
         */
        get: function () {
            return 1;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets an object containing information about the current engine context
     * @returns an object containing the vendor, the renderer and the version of the current engine context
     */
    WebGPUEngine.prototype.getInfo = function () {
        return {
            vendor: "unknown vendor",
            renderer: "unknown renderer",
            version: "unknown version",
        };
    };
    Object.defineProperty(WebGPUEngine.prototype, "compatibilityMode", {
        /**
         * (WebGPU only) True (default) to be in compatibility mode, meaning rendering all existing scenes without artifacts (same rendering than WebGL).
         * Setting the property to false will improve performances but may not work in some scenes if some precautions are not taken.
         * See https://doc.babylonjs.com/advanced_topics/webGPU/webGPUOptimization/webGPUNonCompatibilityMode for more details
         */
        get: function () {
            return this._compatibilityMode;
        },
        set: function (mode) {
            this._compatibilityMode = mode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WebGPUEngine.prototype, "currentSampleCount", {
        /** @hidden */
        get: function () {
            return this._currentRenderTarget ? this._currentRenderTarget.samples : this._mainPassSampleCount;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Create a new instance of the gpu engine asynchronously
     * @param canvas Defines the canvas to use to display the result
     * @param options Defines the options passed to the engine to create the GPU context dependencies
     * @returns a promise that resolves with the created engine
     */
    WebGPUEngine.CreateAsync = function (canvas, options) {
        if (options === void 0) { options = {}; }
        var engine = new WebGPUEngine(canvas, options);
        return new Promise(function (resolve) {
            engine.initAsync(options.glslangOptions, options.twgslOptions).then(function () { return resolve(engine); });
        });
    };
    //------------------------------------------------------------------------------
    //                              Initialization
    //------------------------------------------------------------------------------
    /**
     * Initializes the WebGPU context and dependencies.
     * @param glslangOptions Defines the GLSLang compiler options if necessary
     * @param twgslOptions Defines the Twgsl compiler options if necessary
     * @returns a promise notifying the readiness of the engine.
     */
    WebGPUEngine.prototype.initAsync = function (glslangOptions, twgslOptions) {
        var _this = this;
        var _a;
        return this._initGlslang(glslangOptions !== null && glslangOptions !== void 0 ? glslangOptions : (_a = this._options) === null || _a === void 0 ? void 0 : _a.glslangOptions)
            .then(function (glslang) {
            var _a;
            _this._glslang = glslang;
            _this._tintWASM = WebGPUEngine.UseTWGSL ? new WebGPUTintWASM() : null;
            return _this._tintWASM
                ? _this._tintWASM.initTwgsl(twgslOptions !== null && twgslOptions !== void 0 ? twgslOptions : (_a = _this._options) === null || _a === void 0 ? void 0 : _a.twgslOptions).then(function () {
                    return navigator.gpu.requestAdapter(_this._options);
                }, function (msg) {
                    Logger.Error("Can not initialize twgsl!");
                    Logger.Error(msg);
                    throw Error("WebGPU initializations stopped.");
                })
                : navigator.gpu.requestAdapter(_this._options);
        }, function (msg) {
            Logger.Error("Can not initialize glslang!");
            Logger.Error(msg);
            throw Error("WebGPU initializations stopped.");
        })
            .then(function (adapter) {
            var _a;
            if (!adapter) {
                throw "Could not retrieve a WebGPU adapter (adapter is null).";
            }
            else {
                _this._adapter = adapter;
                _this._adapterSupportedExtensions = [];
                (_a = _this._adapter.features) === null || _a === void 0 ? void 0 : _a.forEach(function (feature) { return _this._adapterSupportedExtensions.push(feature); });
                var deviceDescriptor = _this._options.deviceDescriptor;
                if (deviceDescriptor === null || deviceDescriptor === void 0 ? void 0 : deviceDescriptor.requiredFeatures) {
                    var requestedExtensions = deviceDescriptor.requiredFeatures;
                    var validExtensions = [];
                    for (var _i = 0, requestedExtensions_1 = requestedExtensions; _i < requestedExtensions_1.length; _i++) {
                        var extension = requestedExtensions_1[_i];
                        if (_this._adapterSupportedExtensions.indexOf(extension) !== -1) {
                            validExtensions.push(extension);
                        }
                    }
                    deviceDescriptor.requiredFeatures = validExtensions;
                }
                return _this._adapter.requestDevice(_this._options.deviceDescriptor);
            }
        })
            .then(function (device) {
            var _a, _b;
            _this._device = device;
            _this._deviceEnabledExtensions = [];
            (_a = _this._device.features) === null || _a === void 0 ? void 0 : _a.forEach(function (feature) { return _this._deviceEnabledExtensions.push(feature); });
            var numUncapturedErrors = -1;
            _this._device.addEventListener("uncapturederror", function (event) {
                if (++numUncapturedErrors < _this.numMaxUncapturedErrors) {
                    Logger.Warn("WebGPU uncaptured error (".concat(numUncapturedErrors + 1, "): ").concat(event.error, " - ").concat(event.error.message));
                }
                else if (numUncapturedErrors++ === _this.numMaxUncapturedErrors) {
                    Logger.Warn("WebGPU uncaptured error: too many warnings (".concat(_this.numMaxUncapturedErrors, "), no more warnings will be reported to the console for this engine."));
                }
            });
            if (!_this._doNotHandleContextLost) {
                (_b = _this._device.lost) === null || _b === void 0 ? void 0 : _b.then(function (info) {
                    _this._contextWasLost = true;
                    Logger.Warn("WebGPU context lost. " + info);
                    _this.onContextLostObservable.notifyObservers(_this);
                    _this._restoreEngineAfterContextLost(_this.initAsync.bind(_this));
                });
            }
        }, function (e) {
            Logger.Error("Could not retrieve a WebGPU device.");
            Logger.Error(e);
        })
            .then(function () {
            _this._bufferManager = new WebGPUBufferManager(_this._device);
            _this._textureHelper = new WebGPUTextureHelper(_this._device, _this._glslang, _this._tintWASM, _this._bufferManager);
            _this._cacheSampler = new WebGPUCacheSampler(_this._device);
            _this._cacheBindGroups = new WebGPUCacheBindGroups(_this._device, _this._cacheSampler, _this);
            _this._timestampQuery = new WebGPUTimestampQuery(_this._device, _this._bufferManager);
            _this._occlusionQuery = _this._device.createQuerySet ? new WebGPUOcclusionQuery(_this, _this._device, _this._bufferManager) : undefined;
            _this._bundleList = new WebGPUBundleList(_this._device);
            _this._bundleListRenderTarget = new WebGPUBundleList(_this._device);
            _this._snapshotRendering = new WebGPUSnapshotRendering(_this, _this._snapshotRenderingMode, _this._bundleList, _this._bundleListRenderTarget);
            _this._ubInvertY = _this._bufferManager.createBuffer(new Float32Array([-1, 0]), WebGPUConstants.BufferUsage.Uniform | WebGPUConstants.BufferUsage.CopyDst);
            _this._ubDontInvertY = _this._bufferManager.createBuffer(new Float32Array([1, 0]), WebGPUConstants.BufferUsage.Uniform | WebGPUConstants.BufferUsage.CopyDst);
            if (_this.dbgVerboseLogsForFirstFrames) {
                if (_this._count === undefined) {
                    _this._count = 0;
                    console.log("%c frame #" + _this._count + " - begin", "background: #ffff00");
                }
            }
            _this._uploadEncoder = _this._device.createCommandEncoder(_this._uploadEncoderDescriptor);
            _this._renderEncoder = _this._device.createCommandEncoder(_this._renderEncoderDescriptor);
            _this._renderTargetEncoder = _this._device.createCommandEncoder(_this._renderTargetEncoderDescriptor);
            _this._emptyVertexBuffer = new VertexBuffer(_this, [0], "", false, false, 1, false, 0, 1);
            _this._initializeLimits();
            _this._cacheRenderPipeline = new WebGPUCacheRenderPipelineTree(_this._device, _this._emptyVertexBuffer, !_this._caps.textureFloatLinearFiltering);
            _this._depthCullingState = new WebGPUDepthCullingState(_this._cacheRenderPipeline);
            _this._stencilStateComposer = new WebGPUStencilStateComposer(_this._cacheRenderPipeline);
            _this._stencilStateComposer.stencilGlobal = _this._stencilState;
            _this._depthCullingState.depthTest = true;
            _this._depthCullingState.depthFunc = 515;
            _this._depthCullingState.depthMask = true;
            _this._textureHelper.setCommandEncoder(_this._uploadEncoder);
            _this._clearQuad = new WebGPUClearQuad(_this._device, _this, _this._emptyVertexBuffer);
            _this._defaultDrawContext = _this.createDrawContext();
            _this._currentDrawContext = _this._defaultDrawContext;
            _this._defaultMaterialContext = _this.createMaterialContext();
            _this._currentMaterialContext = _this._defaultMaterialContext;
            _this._initializeContextAndSwapChain();
            _this._initializeMainAttachments();
            _this.resize();
        })
            .catch(function (e) {
            Logger.Error("Can not create WebGPU Device and/or context.");
            Logger.Error(e);
            if (console.trace) {
                console.trace();
            }
        });
    };
    WebGPUEngine.prototype._initGlslang = function (glslangOptions) {
        glslangOptions = glslangOptions || {};
        glslangOptions = __assign(__assign({}, WebGPUEngine._GLSLslangDefaultOptions), glslangOptions);
        if (glslangOptions.glslang) {
            return Promise.resolve(glslangOptions.glslang);
        }
        if (self.glslang) {
            return self.glslang(glslangOptions.wasmPath);
        }
        if (glslangOptions.jsPath && glslangOptions.wasmPath) {
            if (IsWindowObjectExist()) {
                return Tools.LoadScriptAsync(glslangOptions.jsPath).then(function () {
                    return self.glslang(glslangOptions.wasmPath);
                });
            }
            else {
                importScripts(glslangOptions.jsPath);
                return self.glslang(glslangOptions.wasmPath);
            }
        }
        return Promise.reject("gslang is not available.");
    };
    WebGPUEngine.prototype._initializeLimits = function () {
        // Init caps
        // TODO WEBGPU Real Capability check once limits will be working.
        this._caps = {
            maxTexturesImageUnits: 16,
            maxVertexTextureImageUnits: 16,
            maxCombinedTexturesImageUnits: 32,
            maxTextureSize: 8192,
            maxCubemapTextureSize: 2048,
            maxRenderTextureSize: 8192,
            maxVertexAttribs: 16,
            maxVaryingVectors: 15,
            maxFragmentUniformVectors: 1024,
            maxVertexUniformVectors: 1024,
            standardDerivatives: true,
            astc: (this._deviceEnabledExtensions.indexOf(WebGPUConstants.FeatureName.TextureCompressionASTC) >= 0 ? true : undefined),
            s3tc: (this._deviceEnabledExtensions.indexOf(WebGPUConstants.FeatureName.TextureCompressionBC) >= 0 ? true : undefined),
            pvrtc: null,
            etc1: null,
            etc2: (this._deviceEnabledExtensions.indexOf(WebGPUConstants.FeatureName.TextureCompressionETC2) >= 0 ? true : undefined),
            bptc: this._deviceEnabledExtensions.indexOf(WebGPUConstants.FeatureName.TextureCompressionBC) >= 0 ? true : undefined,
            maxAnisotropy: 4,
            uintIndices: true,
            fragmentDepthSupported: true,
            highPrecisionShaderSupported: true,
            colorBufferFloat: true,
            textureFloat: true,
            textureFloatLinearFiltering: false,
            textureFloatRender: true,
            textureHalfFloat: true,
            textureHalfFloatLinearFiltering: true,
            textureHalfFloatRender: true,
            textureLOD: true,
            drawBuffersExtension: true,
            depthTextureExtension: true,
            vertexArrayObject: false,
            instancedArrays: true,
            timerQuery: typeof BigUint64Array !== "undefined" && this.enabledExtensions.indexOf(WebGPUConstants.FeatureName.TimestampQuery) !== -1 ? true : undefined,
            supportOcclusionQuery: typeof BigUint64Array !== "undefined",
            canUseTimestampForTimerQuery: true,
            multiview: false,
            oculusMultiview: false,
            parallelShaderCompile: undefined,
            blendMinMax: true,
            maxMSAASamples: 4,
            canUseGLInstanceID: true,
            canUseGLVertexID: true,
            supportComputeShaders: true,
            supportSRGBBuffers: true,
            supportTransformFeedbacks: false,
            textureMaxLevel: true,
            texture2DArrayMaxLayerCount: 2048,
        };
        this._caps.parallelShaderCompile = null;
        this._features = {
            forceBitmapOverHTMLImageElement: true,
            supportRenderAndCopyToLodForFloatTextures: true,
            supportDepthStencilTexture: true,
            supportShadowSamplers: true,
            uniformBufferHardCheckMatrix: false,
            allowTexturePrefiltering: true,
            trackUbosInFrame: true,
            checkUbosContentBeforeUpload: true,
            supportCSM: true,
            basisNeedsPOT: false,
            support3DTextures: true,
            needTypeSuffixInShaderConstants: true,
            supportMSAA: true,
            supportSSAO2: true,
            supportExtendedTextureFormats: true,
            supportSwitchCaseInShader: true,
            supportSyncTextureRead: false,
            needsInvertingBitmap: false,
            useUBOBindingCache: false,
            needShaderCodeInlining: true,
            needToAlwaysBindUniformBuffers: true,
            supportRenderPasses: true,
            _collectUbosUpdatedInFrame: false,
        };
    };
    WebGPUEngine.prototype._initializeContextAndSwapChain = function () {
        this._context = this._canvas.getContext("webgpu");
        this._configureContext(this._canvas.width, this._canvas.height);
        this._colorFormat = this._options.swapChainFormat;
        this._mainRenderPassWrapper.colorAttachmentGPUTextures = [new WebGPUHardwareTexture()];
        this._mainRenderPassWrapper.colorAttachmentGPUTextures[0].format = this._colorFormat;
    };
    // Set default values as WebGL with depth and stencil attachment for the broadest Compat.
    WebGPUEngine.prototype._initializeMainAttachments = function () {
        var _a;
        this._mainTextureExtends = {
            width: this.getRenderWidth(),
            height: this.getRenderHeight(),
            depthOrArrayLayers: 1,
        };
        var bufferDataUpdate = new Float32Array([this.getRenderHeight()]);
        this._bufferManager.setSubData(this._ubInvertY, 4, bufferDataUpdate);
        this._bufferManager.setSubData(this._ubDontInvertY, 4, bufferDataUpdate);
        var mainColorAttachments;
        if (this._options.antialiasing) {
            var mainTextureDescriptor = {
                size: this._mainTextureExtends,
                mipLevelCount: 1,
                sampleCount: this._mainPassSampleCount,
                dimension: WebGPUConstants.TextureDimension.E2d,
                format: this._options.swapChainFormat,
                usage: WebGPUConstants.TextureUsage.RenderAttachment,
            };
            (_a = this._mainTexture) === null || _a === void 0 ? void 0 : _a.destroy();
            this._mainTexture = this._device.createTexture(mainTextureDescriptor);
            mainColorAttachments = [
                {
                    view: this._mainTexture.createView(),
                    clearValue: new Color4(0, 0, 0, 1),
                    loadOp: WebGPUConstants.LoadOp.Clear,
                    storeOp: WebGPUConstants.StoreOp.Store, // don't use StoreOp.Discard, else using several cameras with different viewports or using scissors will fail because we call beginRenderPass / endPass several times for the same color attachment!
                },
            ];
        }
        else {
            mainColorAttachments = [
                {
                    view: undefined,
                    clearValue: new Color4(0, 0, 0, 1),
                    loadOp: WebGPUConstants.LoadOp.Clear,
                    storeOp: WebGPUConstants.StoreOp.Store,
                },
            ];
        }
        this._mainRenderPassWrapper.depthTextureFormat = this.isStencilEnable ? WebGPUConstants.TextureFormat.Depth24PlusStencil8 : WebGPUConstants.TextureFormat.Depth32Float;
        this._setDepthTextureFormat(this._mainRenderPassWrapper);
        var depthTextureDescriptor = {
            size: this._mainTextureExtends,
            mipLevelCount: 1,
            sampleCount: this._mainPassSampleCount,
            dimension: WebGPUConstants.TextureDimension.E2d,
            format: this._mainRenderPassWrapper.depthTextureFormat,
            usage: WebGPUConstants.TextureUsage.RenderAttachment,
        };
        if (this._depthTexture) {
            this._depthTexture.destroy();
        }
        this._depthTexture = this._device.createTexture(depthTextureDescriptor);
        var mainDepthAttachment = {
            view: this._depthTexture.createView(),
            depthClearValue: this._clearDepthValue,
            depthLoadOp: WebGPUConstants.LoadOp.Clear,
            depthStoreOp: WebGPUConstants.StoreOp.Store,
            stencilClearValue: this._clearStencilValue,
            stencilLoadOp: !this.isStencilEnable ? undefined : WebGPUConstants.LoadOp.Clear,
            stencilStoreOp: !this.isStencilEnable ? undefined : WebGPUConstants.StoreOp.Store,
        };
        this._mainRenderPassWrapper.renderPassDescriptor = {
            colorAttachments: mainColorAttachments,
            depthStencilAttachment: mainDepthAttachment,
        };
        if (this._mainRenderPassWrapper.renderPass !== null) {
            this._endMainRenderPass();
        }
    };
    WebGPUEngine.prototype._configureContext = function (width, height) {
        this._context.configure({
            device: this._device,
            format: this._options.swapChainFormat,
            usage: WebGPUConstants.TextureUsage.RenderAttachment | WebGPUConstants.TextureUsage.CopySrc,
            compositingAlphaMode: this.premultipliedAlpha ? WebGPUConstants.CanvasCompositingAlphaMode.Premultiplied : WebGPUConstants.CanvasCompositingAlphaMode.Opaque,
            size: {
                width: width,
                height: height,
                depthOrArrayLayers: 1,
            },
        });
    };
    /**
     * Force a specific size of the canvas
     * @param width defines the new canvas' width
     * @param height defines the new canvas' height
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     * @returns true if the size was changed
     */
    WebGPUEngine.prototype.setSize = function (width, height, forceSetSize) {
        if (forceSetSize === void 0) { forceSetSize = false; }
        if (!_super.prototype.setSize.call(this, width, height, forceSetSize)) {
            return false;
        }
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - setSize called -", width, height);
            }
        }
        this._configureContext(width, height);
        this._initializeMainAttachments();
        if (this.snapshotRendering) {
            // reset snapshot rendering so that the next frame will record a new list of bundles
            this.snapshotRenderingReset();
        }
        return true;
    };
    /**
     * @param shaderLanguage
     * @hidden
     */
    WebGPUEngine.prototype._getShaderProcessor = function (shaderLanguage) {
        if (shaderLanguage === ShaderLanguage.WGSL) {
            return this._shaderProcessorWGSL;
        }
        return this._shaderProcessor;
    };
    /**
     * @param shaderLanguage
     * @hidden
     */
    WebGPUEngine.prototype._getShaderProcessingContext = function (shaderLanguage) {
        return new WebGPUShaderProcessingContext(shaderLanguage);
    };
    //------------------------------------------------------------------------------
    //                          Static Pipeline WebGPU States
    //------------------------------------------------------------------------------
    /** @hidden */
    WebGPUEngine.prototype.applyStates = function () {
        this._stencilStateComposer.apply();
        this._cacheRenderPipeline.setAlphaBlendEnabled(this._alphaState.alphaBlend);
    };
    /**
     * Force the entire cache to be cleared
     * You should not have to use this function unless your engine needs to share the WebGPU context with another engine
     * @param bruteForce defines a boolean to force clearing ALL caches (including stencil, detoh and alpha states)
     */
    WebGPUEngine.prototype.wipeCaches = function (bruteForce) {
        if (this.preventCacheWipeBetweenFrames && !bruteForce) {
            return;
        }
        //this._currentEffect = null; // can't reset _currentEffect, else some crashes can occur (for eg in ProceduralTexture which calls bindFrameBuffer (which calls wipeCaches) after having called enableEffect and before drawing into the texture)
        // _forceEnableEffect = true assumes the role of _currentEffect = null
        this._forceEnableEffect = true;
        this._currentIndexBuffer = null;
        this._currentOverrideVertexBuffers = null;
        this._cacheRenderPipeline.setBuffers(null, null, null);
        if (bruteForce) {
            this._stencilStateComposer.reset();
            this._depthCullingState.reset();
            this._depthCullingState.depthFunc = 515;
            this._alphaState.reset();
            this._alphaMode = 1;
            this._alphaEquation = 0;
            this._cacheRenderPipeline.setAlphaBlendFactors(this._alphaState._blendFunctionParameters, this._alphaState._blendEquationParameters);
            this._cacheRenderPipeline.setAlphaBlendEnabled(false);
            this.setColorWrite(true);
        }
        this._cachedVertexBuffers = null;
        this._cachedIndexBuffer = null;
        this._cachedEffectForVertexBuffers = null;
    };
    /**
     * Enable or disable color writing
     * @param enable defines the state to set
     */
    WebGPUEngine.prototype.setColorWrite = function (enable) {
        this._colorWriteLocal = enable;
        this._cacheRenderPipeline.setWriteMask(enable ? 0xf : 0);
    };
    /**
     * Gets a boolean indicating if color writing is enabled
     * @returns the current color writing state
     */
    WebGPUEngine.prototype.getColorWrite = function () {
        return this._colorWriteLocal;
    };
    WebGPUEngine.prototype._resetCurrentViewport = function (index) {
        this._viewportsCurrent[index].x = 0;
        this._viewportsCurrent[index].y = 0;
        this._viewportsCurrent[index].w = 0;
        this._viewportsCurrent[index].h = 0;
        if (index === 1) {
            this._viewportCached.x = 0;
            this._viewportCached.y = 0;
            this._viewportCached.z = 0;
            this._viewportCached.w = 0;
        }
    };
    WebGPUEngine.prototype._mustUpdateViewport = function (renderPass) {
        var index = renderPass === this._mainRenderPassWrapper.renderPass ? 0 : 1;
        var x = this._viewportCached.x, y = this._viewportCached.y, w = this._viewportCached.z, h = this._viewportCached.w;
        var update = this._viewportsCurrent[index].x !== x || this._viewportsCurrent[index].y !== y || this._viewportsCurrent[index].w !== w || this._viewportsCurrent[index].h !== h;
        if (update) {
            this._viewportsCurrent[index].x = this._viewportCached.x;
            this._viewportsCurrent[index].y = this._viewportCached.y;
            this._viewportsCurrent[index].w = this._viewportCached.z;
            this._viewportsCurrent[index].h = this._viewportCached.w;
        }
        return update;
    };
    WebGPUEngine.prototype._applyViewport = function (renderPass) {
        var y = Math.floor(this._viewportCached.y);
        var h = Math.floor(this._viewportCached.w);
        if (!this._currentRenderTarget) {
            y = this.getRenderHeight() - y - h;
        }
        renderPass.setViewport(Math.floor(this._viewportCached.x), y, Math.floor(this._viewportCached.z), h, 0, 1);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - viewport applied - (", this._viewportCached.x, this._viewportCached.y, this._viewportCached.z, this._viewportCached.w, ") current pass is main pass=" + (renderPass === this._mainRenderPassWrapper.renderPass));
            }
        }
    };
    /**
     * @param x
     * @param y
     * @param width
     * @param height
     * @hidden
     */
    WebGPUEngine.prototype._viewport = function (x, y, width, height) {
        this._viewportCached.x = x;
        this._viewportCached.y = y;
        this._viewportCached.z = width;
        this._viewportCached.w = height;
    };
    WebGPUEngine.prototype._resetCurrentScissor = function (index) {
        this._scissorsCurrent[index].x = 0;
        this._scissorsCurrent[index].y = 0;
        this._scissorsCurrent[index].w = 0;
        this._scissorsCurrent[index].h = 0;
    };
    WebGPUEngine.prototype._mustUpdateScissor = function (renderPass) {
        var index = renderPass === this._mainRenderPassWrapper.renderPass ? 0 : 1;
        var x = this._scissorCached.x, y = this._scissorCached.y, w = this._scissorCached.z, h = this._scissorCached.w;
        var update = this._scissorsCurrent[index].x !== x || this._scissorsCurrent[index].y !== y || this._scissorsCurrent[index].w !== w || this._scissorsCurrent[index].h !== h;
        if (update) {
            this._scissorsCurrent[index].x = this._scissorCached.x;
            this._scissorsCurrent[index].y = this._scissorCached.y;
            this._scissorsCurrent[index].w = this._scissorCached.z;
            this._scissorsCurrent[index].h = this._scissorCached.w;
        }
        return update;
    };
    WebGPUEngine.prototype._applyScissor = function (renderPass) {
        renderPass.setScissorRect(this._scissorCached.x, this._currentRenderTarget ? this._scissorCached.y : this.getRenderHeight() - this._scissorCached.w - this._scissorCached.y, this._scissorCached.z, this._scissorCached.w);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - scissor applied - (", this._scissorCached.x, this._scissorCached.y, this._scissorCached.z, this._scissorCached.w, ") current pass is main pass=" + (renderPass === this._mainRenderPassWrapper.renderPass));
            }
        }
    };
    WebGPUEngine.prototype._scissorIsActive = function () {
        return this._scissorCached.x !== 0 || this._scissorCached.y !== 0 || this._scissorCached.z !== 0 || this._scissorCached.w !== 0;
    };
    WebGPUEngine.prototype.enableScissor = function (x, y, width, height) {
        this._scissorCached.x = x;
        this._scissorCached.y = y;
        this._scissorCached.z = width;
        this._scissorCached.w = height;
    };
    WebGPUEngine.prototype.disableScissor = function () {
        this._scissorCached.x = 0;
        this._scissorCached.y = 0;
        this._scissorCached.z = 0;
        this._scissorCached.w = 0;
        this._resetCurrentScissor(0);
        this._resetCurrentScissor(1);
    };
    WebGPUEngine.prototype._resetCurrentStencilRef = function (index) {
        this._stencilRefsCurrent[index] = -1;
    };
    WebGPUEngine.prototype._mustUpdateStencilRef = function (renderPass) {
        var index = renderPass === this._mainRenderPassWrapper.renderPass ? 0 : 1;
        var update = this._stencilStateComposer.funcRef !== this._stencilRefsCurrent[index];
        if (update) {
            this._stencilRefsCurrent[index] = this._stencilStateComposer.funcRef;
        }
        return update;
    };
    /**
     * @param renderPass
     * @hidden
     */
    WebGPUEngine.prototype._applyStencilRef = function (renderPass) {
        var _a;
        renderPass.setStencilReference((_a = this._stencilStateComposer.funcRef) !== null && _a !== void 0 ? _a : 0);
    };
    WebGPUEngine.prototype._resetCurrentColorBlend = function (index) {
        this._blendColorsCurrent[index][0] = this._blendColorsCurrent[index][1] = this._blendColorsCurrent[index][2] = this._blendColorsCurrent[index][3] = null;
    };
    WebGPUEngine.prototype._mustUpdateBlendColor = function (renderPass) {
        var index = renderPass === this._mainRenderPassWrapper.renderPass ? 0 : 1;
        var colorBlend = this._alphaState._blendConstants;
        var update = colorBlend[0] !== this._blendColorsCurrent[index][0] ||
            colorBlend[1] !== this._blendColorsCurrent[index][1] ||
            colorBlend[2] !== this._blendColorsCurrent[index][2] ||
            colorBlend[3] !== this._blendColorsCurrent[index][3];
        if (update) {
            this._blendColorsCurrent[index][0] = colorBlend[0];
            this._blendColorsCurrent[index][1] = colorBlend[1];
            this._blendColorsCurrent[index][2] = colorBlend[2];
            this._blendColorsCurrent[index][3] = colorBlend[3];
        }
        return update;
    };
    WebGPUEngine.prototype._applyBlendColor = function (renderPass) {
        renderPass.setBlendConstant(this._alphaState._blendConstants);
    };
    /**
     * Clear the current render buffer or the current render target (if any is set up)
     * @param color defines the color to use
     * @param backBuffer defines if the back buffer must be cleared
     * @param depth defines if the depth buffer must be cleared
     * @param stencil defines if the stencil buffer must be cleared
     */
    WebGPUEngine.prototype.clear = function (color, backBuffer, depth, stencil) {
        if (stencil === void 0) { stencil = false; }
        // Some PGs are using color3...
        if (color && color.a === undefined) {
            color.a = 1;
        }
        var hasScissor = this._scissorIsActive();
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - clear called - backBuffer=", backBuffer, " depth=", depth, " stencil=", stencil, " scissor is active=", hasScissor);
            }
        }
        // We need to recreate the render pass so that the new parameters for clear color / depth / stencil are taken into account
        if (this._currentRenderTarget) {
            if (hasScissor) {
                if (!this._rttRenderPassWrapper.renderPass) {
                    this._startRenderTargetRenderPass(this._currentRenderTarget, false, backBuffer ? color : null, depth, stencil);
                }
                if (!this.compatibilityMode) {
                    this._bundleListRenderTarget.addItem(new WebGPURenderItemScissor(this._scissorCached.x, this._scissorCached.y, this._scissorCached.z, this._scissorCached.w));
                }
                else {
                    this._applyScissor(this._currentRenderPass);
                }
                this._clearFullQuad(backBuffer ? color : null, depth, stencil);
            }
            else {
                if (this._currentRenderPass) {
                    this._endRenderTargetRenderPass();
                }
                this._startRenderTargetRenderPass(this._currentRenderTarget, true, backBuffer ? color : null, depth, stencil);
            }
        }
        else {
            if (!this._mainRenderPassWrapper.renderPass || !hasScissor) {
                this._startMainRenderPass(!hasScissor, backBuffer ? color : null, depth, stencil);
            }
            if (hasScissor) {
                if (!this.compatibilityMode) {
                    this._bundleList.addItem(new WebGPURenderItemScissor(this._scissorCached.x, this._scissorCached.y, this._scissorCached.z, this._scissorCached.w));
                }
                else {
                    this._applyScissor(this._currentRenderPass);
                }
                this._clearFullQuad(backBuffer ? color : null, depth, stencil);
            }
        }
    };
    WebGPUEngine.prototype._clearFullQuad = function (clearColor, clearDepth, clearStencil) {
        var _a, _b, _c;
        var renderPass = !this.compatibilityMode ? null : this._getCurrentRenderPass();
        var renderPassIndex = this._getCurrentRenderPassIndex();
        var bundleList = renderPassIndex === 0 ? this._bundleList : this._bundleListRenderTarget;
        this._clearQuad.setColorFormat(this._colorFormat);
        this._clearQuad.setDepthStencilFormat(this._depthTextureFormat);
        this._clearQuad.setMRTAttachments((_a = this._cacheRenderPipeline.mrtAttachments) !== null && _a !== void 0 ? _a : [], (_b = this._cacheRenderPipeline.mrtTextureArray) !== null && _b !== void 0 ? _b : [], this._cacheRenderPipeline.mrtTextureCount);
        if (!this.compatibilityMode) {
            bundleList.addItem(new WebGPURenderItemStencilRef(this._clearStencilValue));
        }
        else {
            renderPass.setStencilReference(this._clearStencilValue);
        }
        var bundle = this._clearQuad.clear(renderPass, clearColor, clearDepth, clearStencil, this.currentSampleCount);
        if (!this.compatibilityMode) {
            bundleList.addBundle(bundle);
            bundleList.addItem(new WebGPURenderItemStencilRef((_c = this._stencilStateComposer.funcRef) !== null && _c !== void 0 ? _c : 0));
            this._reportDrawCall();
        }
        else {
            this._applyStencilRef(renderPass);
        }
    };
    //------------------------------------------------------------------------------
    //                              Vertex/Index/Storage Buffers
    //------------------------------------------------------------------------------
    /**
     * Creates a vertex buffer
     * @param data the data for the vertex buffer
     * @returns the new buffer
     */
    WebGPUEngine.prototype.createVertexBuffer = function (data) {
        var view;
        if (data instanceof Array) {
            view = new Float32Array(data);
        }
        else if (data instanceof ArrayBuffer) {
            view = new Uint8Array(data);
        }
        else {
            view = data;
        }
        var dataBuffer = this._bufferManager.createBuffer(view, WebGPUConstants.BufferUsage.Vertex | WebGPUConstants.BufferUsage.CopyDst);
        return dataBuffer;
    };
    /**
     * Creates a vertex buffer
     * @param data the data for the dynamic vertex buffer
     * @returns the new buffer
     */
    WebGPUEngine.prototype.createDynamicVertexBuffer = function (data) {
        return this.createVertexBuffer(data);
    };
    /**
     * Creates a new index buffer
     * @param indices defines the content of the index buffer
     * @returns a new buffer
     */
    WebGPUEngine.prototype.createIndexBuffer = function (indices) {
        var is32Bits = true;
        var view;
        if (indices instanceof Uint32Array || indices instanceof Int32Array) {
            view = indices;
        }
        else if (indices instanceof Uint16Array) {
            view = indices;
            is32Bits = false;
        }
        else {
            if (indices.length > 65535) {
                view = new Uint32Array(indices);
            }
            else {
                view = new Uint16Array(indices);
                is32Bits = false;
            }
        }
        var dataBuffer = this._bufferManager.createBuffer(view, WebGPUConstants.BufferUsage.Index | WebGPUConstants.BufferUsage.CopyDst);
        dataBuffer.is32Bits = is32Bits;
        return dataBuffer;
    };
    /**
     * @param data
     * @param creationFlags
     * @hidden
     */
    WebGPUEngine.prototype._createBuffer = function (data, creationFlags) {
        var view;
        if (data instanceof Array) {
            view = new Float32Array(data);
        }
        else if (data instanceof ArrayBuffer) {
            view = new Uint8Array(data);
        }
        else {
            view = data;
        }
        var flags = 0;
        if (creationFlags & 1) {
            flags |= WebGPUConstants.BufferUsage.CopySrc;
        }
        if (creationFlags & 2) {
            flags |= WebGPUConstants.BufferUsage.CopyDst;
        }
        if (creationFlags & 4) {
            flags |= WebGPUConstants.BufferUsage.Uniform;
        }
        if (creationFlags & 8) {
            flags |= WebGPUConstants.BufferUsage.Vertex;
        }
        if (creationFlags & 16) {
            flags |= WebGPUConstants.BufferUsage.Index;
        }
        if (creationFlags & 32) {
            flags |= WebGPUConstants.BufferUsage.Storage;
        }
        return this._bufferManager.createBuffer(view, flags);
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.bindBuffersDirectly = function () {
        throw "Not implemented on WebGPU";
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.updateAndBindInstancesBuffer = function () {
        throw "Not implemented on WebGPU";
    };
    /**
     * Bind a list of vertex buffers with the engine
     * @param vertexBuffers defines the list of vertex buffers to bind
     * @param indexBuffer defines the index buffer to bind
     * @param effect defines the effect associated with the vertex buffers
     * @param overrideVertexBuffers defines optional list of avertex buffers that overrides the entries in vertexBuffers
     */
    WebGPUEngine.prototype.bindBuffers = function (vertexBuffers, indexBuffer, effect, overrideVertexBuffers) {
        this._currentIndexBuffer = indexBuffer;
        this._currentOverrideVertexBuffers = overrideVertexBuffers !== null && overrideVertexBuffers !== void 0 ? overrideVertexBuffers : null;
        this._cacheRenderPipeline.setBuffers(vertexBuffers, indexBuffer, this._currentOverrideVertexBuffers);
    };
    /**
     * @param buffer
     * @hidden
     */
    WebGPUEngine.prototype._releaseBuffer = function (buffer) {
        return this._bufferManager.releaseBuffer(buffer);
    };
    //------------------------------------------------------------------------------
    //                              Effects
    //------------------------------------------------------------------------------
    /**
     * Create a new effect (used to store vertex/fragment shaders)
     * @param baseName defines the base name of the effect (The name of file without .fragment.fx or .vertex.fx)
     * @param attributesNamesOrOptions defines either a list of attribute names or an IEffectCreationOptions object
     * @param uniformsNamesOrEngine defines either a list of uniform names or the engine to use
     * @param samplers defines an array of string used to represent textures
     * @param defines defines the string containing the defines to use to compile the shaders
     * @param fallbacks defines the list of potential fallbacks to use if shader compilation fails
     * @param onCompiled defines a function to call when the effect creation is successful
     * @param onError defines a function to call when the effect creation has failed
     * @param indexParameters defines an object containing the index values to use to compile shaders (like the maximum number of simultaneous lights)
     * @param shaderLanguage the language the shader is written in (default: GLSL)
     * @returns the new Effect
     */
    WebGPUEngine.prototype.createEffect = function (baseName, attributesNamesOrOptions, uniformsNamesOrEngine, samplers, defines, fallbacks, onCompiled, onError, indexParameters, shaderLanguage) {
        var _a;
        if (shaderLanguage === void 0) { shaderLanguage = ShaderLanguage.GLSL; }
        var vertex = baseName.vertexElement || baseName.vertex || baseName.vertexToken || baseName.vertexSource || baseName;
        var fragment = baseName.fragmentElement || baseName.fragment || baseName.fragmentToken || baseName.fragmentSource || baseName;
        var globalDefines = this._getGlobalDefines();
        var fullDefines = (_a = defines !== null && defines !== void 0 ? defines : attributesNamesOrOptions.defines) !== null && _a !== void 0 ? _a : "";
        if (globalDefines) {
            fullDefines += "\n" + globalDefines;
        }
        var name = vertex + "+" + fragment + "@" + fullDefines;
        if (this._compiledEffects[name]) {
            var compiledEffect = this._compiledEffects[name];
            if (onCompiled && compiledEffect.isReady()) {
                onCompiled(compiledEffect);
            }
            return compiledEffect;
        }
        var effect = new Effect(baseName, attributesNamesOrOptions, uniformsNamesOrEngine, samplers, this, defines, fallbacks, onCompiled, onError, indexParameters, name, shaderLanguage);
        this._compiledEffects[name] = effect;
        return effect;
    };
    WebGPUEngine.prototype._compileRawShaderToSpirV = function (source, type) {
        return this._glslang.compileGLSL(source, type);
    };
    WebGPUEngine.prototype._compileShaderToSpirV = function (source, type, defines, shaderVersion) {
        return this._compileRawShaderToSpirV(shaderVersion + (defines ? defines + "\n" : "") + source, type);
    };
    WebGPUEngine.prototype._getWGSLShader = function (source, type, defines) {
        if (defines) {
            defines = "//" + defines.split("\n").join("\n//") + "\n";
        }
        else {
            defines = "";
        }
        return defines + source;
    };
    WebGPUEngine.prototype._createPipelineStageDescriptor = function (vertexShader, fragmentShader, shaderLanguage) {
        if (this._tintWASM && shaderLanguage === ShaderLanguage.GLSL) {
            vertexShader = this._tintWASM.convertSpirV2WGSL(vertexShader);
            fragmentShader = this._tintWASM.convertSpirV2WGSL(fragmentShader);
        }
        return {
            vertexStage: {
                module: this._device.createShaderModule({
                    code: vertexShader,
                }),
                entryPoint: "main",
            },
            fragmentStage: {
                module: this._device.createShaderModule({
                    code: fragmentShader,
                }),
                entryPoint: "main",
            },
        };
    };
    WebGPUEngine.prototype._compileRawPipelineStageDescriptor = function (vertexCode, fragmentCode, shaderLanguage) {
        var vertexShader = shaderLanguage === ShaderLanguage.GLSL ? this._compileRawShaderToSpirV(vertexCode, "vertex") : vertexCode;
        var fragmentShader = shaderLanguage === ShaderLanguage.GLSL ? this._compileRawShaderToSpirV(fragmentCode, "fragment") : fragmentCode;
        return this._createPipelineStageDescriptor(vertexShader, fragmentShader, shaderLanguage);
    };
    WebGPUEngine.prototype._compilePipelineStageDescriptor = function (vertexCode, fragmentCode, defines, shaderLanguage) {
        this.onBeforeShaderCompilationObservable.notifyObservers(this);
        var shaderVersion = "#version 450\n";
        var vertexShader = shaderLanguage === ShaderLanguage.GLSL ? this._compileShaderToSpirV(vertexCode, "vertex", defines, shaderVersion) : this._getWGSLShader(vertexCode, "vertex", defines);
        var fragmentShader = shaderLanguage === ShaderLanguage.GLSL
            ? this._compileShaderToSpirV(fragmentCode, "fragment", defines, shaderVersion)
            : this._getWGSLShader(fragmentCode, "fragment", defines);
        var program = this._createPipelineStageDescriptor(vertexShader, fragmentShader, shaderLanguage);
        this.onAfterShaderCompilationObservable.notifyObservers(this);
        return program;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.createRawShaderProgram = function () {
        throw "Not available on WebGPU";
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.createShaderProgram = function () {
        throw "Not available on WebGPU";
    };
    /**
     * Inline functions in shader code that are marked to be inlined
     * @param code code to inline
     * @returns inlined code
     */
    WebGPUEngine.prototype.inlineShaderCode = function (code) {
        var sci = new ShaderCodeInliner(code);
        sci.debug = false;
        sci.processCode();
        return sci.code;
    };
    /**
     * Creates a new pipeline context
     * @param shaderProcessingContext defines the shader processing context used during the processing if available
     * @returns the new pipeline
     */
    WebGPUEngine.prototype.createPipelineContext = function (shaderProcessingContext) {
        return new WebGPUPipelineContext(shaderProcessingContext, this);
    };
    /**
     * Creates a new material context
     * @returns the new context
     */
    WebGPUEngine.prototype.createMaterialContext = function () {
        return new WebGPUMaterialContext();
    };
    /**
     * Creates a new draw context
     * @returns the new context
     */
    WebGPUEngine.prototype.createDrawContext = function () {
        return new WebGPUDrawContext(this._bufferManager);
    };
    /**
     * @param pipelineContext
     * @param vertexSourceCode
     * @param fragmentSourceCode
     * @param createAsRaw
     * @param rawVertexSourceCode
     * @param rawFragmentSourceCode
     * @param rebuildRebind
     * @param defines
     * @hidden
     */
    WebGPUEngine.prototype._preparePipelineContext = function (pipelineContext, vertexSourceCode, fragmentSourceCode, createAsRaw, rawVertexSourceCode, rawFragmentSourceCode, rebuildRebind, defines) {
        var webGpuContext = pipelineContext;
        var shaderLanguage = webGpuContext.shaderProcessingContext.shaderLanguage;
        if (this.dbgShowShaderCode) {
            console.log(defines);
            console.log(vertexSourceCode);
            console.log(fragmentSourceCode);
        }
        webGpuContext.sources = {
            fragment: fragmentSourceCode,
            vertex: vertexSourceCode,
            rawVertex: rawVertexSourceCode,
            rawFragment: rawFragmentSourceCode,
        };
        if (createAsRaw) {
            webGpuContext.stages = this._compileRawPipelineStageDescriptor(vertexSourceCode, fragmentSourceCode, shaderLanguage);
        }
        else {
            webGpuContext.stages = this._compilePipelineStageDescriptor(vertexSourceCode, fragmentSourceCode, defines, shaderLanguage);
        }
    };
    /**
     * Gets the list of active attributes for a given WebGPU program
     * @param pipelineContext defines the pipeline context to use
     * @param attributesNames defines the list of attribute names to get
     * @returns an array of indices indicating the offset of each attribute
     */
    WebGPUEngine.prototype.getAttributes = function (pipelineContext, attributesNames) {
        var results = new Array(attributesNames.length);
        var gpuPipelineContext = pipelineContext;
        for (var i = 0; i < attributesNames.length; i++) {
            var attributeName = attributesNames[i];
            var attributeLocation = gpuPipelineContext.shaderProcessingContext.availableAttributes[attributeName];
            if (attributeLocation === undefined) {
                continue;
            }
            results[i] = attributeLocation;
        }
        return results;
    };
    /**
     * Activates an effect, making it the current one (ie. the one used for rendering)
     * @param effect defines the effect to activate
     */
    WebGPUEngine.prototype.enableEffect = function (effect) {
        if (!effect) {
            return;
        }
        var isNewEffect = true;
        if (!DrawWrapper.IsWrapper(effect)) {
            isNewEffect = effect !== this._currentEffect;
            this._currentEffect = effect;
            this._currentMaterialContext = this._defaultMaterialContext;
            this._currentDrawContext = this._defaultDrawContext;
            this._counters.numEnableEffects++;
            if (this.dbgLogIfNotDrawWrapper) {
                Logger.Warn("enableEffect has been called with an Effect and not a Wrapper! effect.uniqueId=".concat(effect.uniqueId, ", effect.name=").concat(effect.name, ", effect.name.vertex=").concat(effect.name.vertex, ", effect.name.fragment=").concat(effect.name.fragment), 10);
            }
        }
        else if (!effect.effect ||
            (effect.effect === this._currentEffect &&
                effect.materialContext === this._currentMaterialContext &&
                effect.drawContext === this._currentDrawContext &&
                !this._forceEnableEffect)) {
            if (!effect.effect && this.dbgShowEmptyEnableEffectCalls) {
                console.error("drawWrapper=", effect);
                throw "Invalid call to enableEffect: the effect property is empty!";
            }
            return;
        }
        else {
            isNewEffect = effect.effect !== this._currentEffect;
            this._currentEffect = effect.effect;
            this._currentMaterialContext = effect.materialContext;
            this._currentDrawContext = effect.drawContext;
            this._counters.numEnableDrawWrapper++;
            if (!this._currentMaterialContext) {
                console.error("drawWrapper=", effect);
                throw "Invalid call to enableEffect: the materialContext property is empty!";
            }
        }
        this._stencilStateComposer.stencilMaterial = undefined;
        this._forceEnableEffect = isNewEffect || this._forceEnableEffect ? false : this._forceEnableEffect;
        if (isNewEffect) {
            if (this._currentEffect.onBind) {
                this._currentEffect.onBind(this._currentEffect);
            }
            if (this._currentEffect._onBindObservable) {
                this._currentEffect._onBindObservable.notifyObservers(this._currentEffect);
            }
        }
    };
    /**
     * @param effect
     * @hidden
     */
    WebGPUEngine.prototype._releaseEffect = function (effect) {
        if (this._compiledEffects[effect._key]) {
            delete this._compiledEffects[effect._key];
            this._deletePipelineContext(effect.getPipelineContext());
        }
    };
    /**
     * Force the engine to release all cached effects. This means that next effect compilation will have to be done completely even if a similar effect was already compiled
     */
    WebGPUEngine.prototype.releaseEffects = function () {
        for (var name_1 in this._compiledEffects) {
            var webGPUPipelineContext = this._compiledEffects[name_1].getPipelineContext();
            this._deletePipelineContext(webGPUPipelineContext);
        }
        this._compiledEffects = {};
    };
    WebGPUEngine.prototype._deletePipelineContext = function (pipelineContext) {
        var webgpuPipelineContext = pipelineContext;
        if (webgpuPipelineContext) {
            pipelineContext.dispose();
        }
    };
    Object.defineProperty(WebGPUEngine.prototype, "needPOTTextures", {
        //------------------------------------------------------------------------------
        //                              Textures
        //------------------------------------------------------------------------------
        /**
         * Gets a boolean indicating that only power of 2 textures are supported
         * Please note that you can still use non power of 2 textures but in this case the engine will forcefully convert them
         */
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    WebGPUEngine.prototype._createHardwareTexture = function () {
        return new WebGPUHardwareTexture();
    };
    /**
     * @param texture
     * @hidden
     */
    WebGPUEngine.prototype._releaseTexture = function (texture) {
        var index = this._internalTexturesCache.indexOf(texture);
        if (index !== -1) {
            this._internalTexturesCache.splice(index, 1);
        }
        this._textureHelper.releaseTexture(texture);
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype._getRGBABufferInternalSizedFormat = function () {
        return 5;
    };
    WebGPUEngine.prototype.updateTextureComparisonFunction = function (texture, comparisonFunction) {
        texture._comparisonFunction = comparisonFunction;
    };
    /**
     * Creates an internal texture without binding it to a framebuffer
     * @hidden
     * @param size defines the size of the texture
     * @param options defines the options used to create the texture
     * @param delayGPUTextureCreation true to delay the texture creation the first time it is really needed. false to create it right away
     * @param source source type of the texture
     * @returns a new internal texture
     */
    WebGPUEngine.prototype._createInternalTexture = function (size, options, delayGPUTextureCreation, source) {
        var _a, _b, _c;
        if (delayGPUTextureCreation === void 0) { delayGPUTextureCreation = true; }
        if (source === void 0) { source = InternalTextureSource.Unknown; }
        var fullOptions = {};
        if (options !== undefined && typeof options === "object") {
            fullOptions.generateMipMaps = options.generateMipMaps;
            fullOptions.type = options.type === undefined ? 0 : options.type;
            fullOptions.samplingMode = options.samplingMode === undefined ? 3 : options.samplingMode;
            fullOptions.format = options.format === undefined ? 5 : options.format;
            fullOptions.samples = (_a = options.samples) !== null && _a !== void 0 ? _a : 1;
            fullOptions.creationFlags = (_b = options.creationFlags) !== null && _b !== void 0 ? _b : 0;
            fullOptions.useSRGBBuffer = (_c = options.useSRGBBuffer) !== null && _c !== void 0 ? _c : false;
        }
        else {
            fullOptions.generateMipMaps = options;
            fullOptions.type = 0;
            fullOptions.samplingMode = 3;
            fullOptions.format = 5;
            fullOptions.samples = 1;
            fullOptions.creationFlags = 0;
            fullOptions.useSRGBBuffer = false;
        }
        if (fullOptions.type === 1 && !this._caps.textureFloatLinearFiltering) {
            fullOptions.samplingMode = 1;
        }
        else if (fullOptions.type === 2 && !this._caps.textureHalfFloatLinearFiltering) {
            fullOptions.samplingMode = 1;
        }
        if (fullOptions.type === 1 && !this._caps.textureFloat) {
            fullOptions.type = 0;
            Logger.Warn("Float textures are not supported. Type forced to TEXTURETYPE_UNSIGNED_BYTE");
        }
        var texture = new InternalTexture(this, source);
        var width = size.width || size;
        var height = size.height || size;
        var layers = size.layers || 0;
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.depth = layers;
        texture.isReady = true;
        texture.samples = fullOptions.samples;
        texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
        texture.samplingMode = fullOptions.samplingMode;
        texture.type = fullOptions.type;
        texture.format = fullOptions.format;
        texture.is2DArray = layers > 0;
        texture._cachedWrapU = 0;
        texture._cachedWrapV = 0;
        texture._useSRGBBuffer = fullOptions.useSRGBBuffer;
        this._internalTexturesCache.push(texture);
        if (!delayGPUTextureCreation) {
            this._textureHelper.createGPUTextureForInternalTexture(texture, width, height, layers || 1, fullOptions.creationFlags);
        }
        return texture;
    };
    /**
     * Usually called from Texture.ts.
     * Passed information to create a hardware texture
     * @param url defines a value which contains one of the following:
     * * A conventional http URL, e.g. 'http://...' or 'file://...'
     * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
     * * An indicator that data being passed using the buffer parameter, e.g. 'data:mytexture.jpg'
     * @param noMipmap defines a boolean indicating that no mipmaps shall be generated.  Ignored for compressed textures.  They must be in the file
     * @param invertY when true, image is flipped when loaded.  You probably want true. Certain compressed textures may invert this if their default is inverted (eg. ktx)
     * @param scene needed for loading to the correct scene
     * @param samplingMode mode with should be used sample / access the texture (Default: Texture.TRILINEAR_SAMPLINGMODE)
     * @param onLoad optional callback to be called upon successful completion
     * @param onError optional callback to be called upon failure
     * @param buffer a source of a file previously fetched as either a base64 string, an ArrayBuffer (compressed or image format), HTMLImageElement (image format), or a Blob
     * @param fallback an internal argument in case the function must be called again, due to etc1 not having alpha capabilities
     * @param format internal format.  Default: RGB when extension is '.jpg' else RGBA.  Ignored for compressed textures
     * @param forcedExtension defines the extension to use to pick the right loader
     * @param mimeType defines an optional mime type
     * @param loaderOptions options to be passed to the loader
     * @param creationFlags specific flags to use when creating the texture (1 for storage textures, for eg)
     * @param useSRGBBuffer defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU).
     * @returns a InternalTexture for assignment back into BABYLON.Texture
     */
    WebGPUEngine.prototype.createTexture = function (url, noMipmap, invertY, scene, samplingMode, onLoad, onError, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, creationFlags, useSRGBBuffer) {
        var _this = this;
        if (samplingMode === void 0) { samplingMode = 3; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (buffer === void 0) { buffer = null; }
        if (fallback === void 0) { fallback = null; }
        if (format === void 0) { format = null; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        return this._createTextureBase(url, noMipmap, invertY, scene, samplingMode, onLoad, onError, function (texture, extension, scene, img, invertY, noMipmap, isCompressed, processFunction) {
            var _a;
            var imageBitmap = img; // we will never get an HTMLImageElement in WebGPU
            texture.baseWidth = imageBitmap.width;
            texture.baseHeight = imageBitmap.height;
            texture.width = imageBitmap.width;
            texture.height = imageBitmap.height;
            texture.format = format !== null && format !== void 0 ? format : -1;
            processFunction(texture.width, texture.height, imageBitmap, extension, texture, function () { });
            if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
                // the texture could have been created before reaching this point so don't recreate it if already existing
                var gpuTextureWrapper = _this._textureHelper.createGPUTextureForInternalTexture(texture, imageBitmap.width, imageBitmap.height, undefined, creationFlags);
                if (WebGPUTextureHelper.IsImageBitmap(imageBitmap)) {
                    _this._textureHelper.updateTexture(imageBitmap, texture, imageBitmap.width, imageBitmap.height, texture.depth, gpuTextureWrapper.format, 0, 0, invertY, false, 0, 0);
                    if (!noMipmap && !isCompressed) {
                        _this._generateMipmaps(texture, _this._uploadEncoder);
                    }
                }
            }
            else if (!noMipmap && !isCompressed) {
                _this._generateMipmaps(texture, _this._uploadEncoder);
            }
            if (scene) {
                scene._removePendingData(texture);
            }
            texture.isReady = true;
            texture.onLoadedObservable.notifyObservers(texture);
            texture.onLoadedObservable.clear();
        }, function () { return false; }, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, useSRGBBuffer);
    };
    /**
     * Wraps an external web gpu texture in a Babylon texture.
     * @param texture defines the external texture
     * @returns the babylon internal texture
     */
    WebGPUEngine.prototype.wrapWebGPUTexture = function (texture) {
        var hardwareTexture = new WebGPUHardwareTexture(texture);
        var internalTexture = new InternalTexture(this, InternalTextureSource.Unknown, true);
        internalTexture._hardwareTexture = hardwareTexture;
        internalTexture.isReady = true;
        return internalTexture;
    };
    /**
     * Wraps an external web gl texture in a Babylon texture.
     * @returns the babylon internal texture
     */
    WebGPUEngine.prototype.wrapWebGLTexture = function () {
        throw new Error("wrapWebGLTexture is not supported, use wrapWebGPUTexture instead.");
    };
    WebGPUEngine.prototype.generateMipMapsForCubemap = function (texture) {
        var _a;
        if (texture.generateMipMaps) {
            var gpuTexture = (_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource;
            if (!gpuTexture) {
                this._textureHelper.createGPUTextureForInternalTexture(texture);
            }
            this._generateMipmaps(texture, texture.source === InternalTextureSource.RenderTarget || texture.source === InternalTextureSource.MultiRenderTarget ? this._renderTargetEncoder : undefined);
        }
    };
    /**
     * Update the sampling mode of a given texture
     * @param samplingMode defines the required sampling mode
     * @param texture defines the texture to update
     * @param generateMipMaps defines whether to generate mipmaps for the texture
     */
    WebGPUEngine.prototype.updateTextureSamplingMode = function (samplingMode, texture, generateMipMaps) {
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        if (generateMipMaps) {
            texture.generateMipMaps = true;
            this._generateMipmaps(texture);
        }
        texture.samplingMode = samplingMode;
    };
    /**
     * Update the sampling mode of a given texture
     * @param texture defines the texture to update
     * @param wrapU defines the texture wrap mode of the u coordinates
     * @param wrapV defines the texture wrap mode of the v coordinates
     * @param wrapR defines the texture wrap mode of the r coordinates
     */
    WebGPUEngine.prototype.updateTextureWrappingMode = function (texture, wrapU, wrapV, wrapR) {
        if (wrapV === void 0) { wrapV = null; }
        if (wrapR === void 0) { wrapR = null; }
        if (wrapU !== null) {
            texture._cachedWrapU = wrapU;
        }
        if (wrapV !== null) {
            texture._cachedWrapV = wrapV;
        }
        if ((texture.is2DArray || texture.is3D) && wrapR !== null) {
            texture._cachedWrapR = wrapR;
        }
    };
    /**
     * Update the dimensions of a texture
     * @param texture texture to update
     * @param width new width of the texture
     * @param height new height of the texture
     * @param depth new depth of the texture
     */
    WebGPUEngine.prototype.updateTextureDimensions = function (texture, width, height, depth) {
        if (depth === void 0) { depth = 1; }
        if (!texture._hardwareTexture) {
            // the gpu texture is not created yet, so when it is it will be created with the right dimensions
            return;
        }
        if (texture.width === width && texture.height === height && texture.depth === depth) {
            return;
        }
        var additionalUsages = texture._hardwareTexture.textureAdditionalUsages;
        texture._hardwareTexture.release(); // don't defer the releasing! Else we will release at the end of this frame the gpu texture we are about to create in the next line...
        this._textureHelper.createGPUTextureForInternalTexture(texture, width, height, depth, additionalUsages);
    };
    /**
     * @param name
     * @param texture
     * @param baseName
     * @hidden
     */
    WebGPUEngine.prototype._setInternalTexture = function (name, texture, baseName) {
        baseName = baseName !== null && baseName !== void 0 ? baseName : name;
        if (this._currentEffect) {
            var webgpuPipelineContext = this._currentEffect._pipelineContext;
            var availableTexture = webgpuPipelineContext.shaderProcessingContext.availableTextures[baseName];
            this._currentMaterialContext.setTexture(name, texture);
            if (availableTexture && availableTexture.autoBindSampler) {
                var samplerName = baseName + WebGPUShaderProcessor.AutoSamplerSuffix;
                this._currentMaterialContext.setSampler(samplerName, texture); // we can safely cast to InternalTexture because ExternalTexture always has autoBindSampler = false
            }
        }
    };
    /**
     * Sets a texture to the according uniform.
     * @param channel The texture channel
     * @param unused unused parameter
     * @param texture The texture to apply
     * @param name The name of the uniform in the effect
     */
    WebGPUEngine.prototype.setTexture = function (channel, unused, texture, name) {
        this._setTexture(channel, texture, false, false, name, name);
    };
    /**
     * Sets an array of texture to the WebGPU context
     * @param channel defines the channel where the texture array must be set
     * @param unused unused parameter
     * @param textures defines the array of textures to bind
     * @param name name of the channel
     */
    WebGPUEngine.prototype.setTextureArray = function (channel, unused, textures, name) {
        for (var index = 0; index < textures.length; index++) {
            this._setTexture(-1, textures[index], true, false, name + index.toString(), name);
        }
    };
    WebGPUEngine.prototype._setTexture = function (channel, texture, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPartOfTextureArray, depthStencilTexture, name, baseName) {
        if (isPartOfTextureArray === void 0) { isPartOfTextureArray = false; }
        if (depthStencilTexture === void 0) { depthStencilTexture = false; }
        if (name === void 0) { name = ""; }
        // name == baseName for a texture that is not part of a texture array
        // Else, name is something like 'myTexture0' / 'myTexture1' / ... and baseName is 'myTexture'
        // baseName is used to look up the texture in the shaderProcessingContext.availableTextures map
        // name is used to look up the texture in the _currentMaterialContext.textures map
        baseName = baseName !== null && baseName !== void 0 ? baseName : name;
        if (this._currentEffect) {
            if (!texture) {
                this._currentMaterialContext.setTexture(name, null);
                return false;
            }
            // Video
            if (texture.video) {
                texture.update();
            }
            else if (texture.delayLoadState === 4) {
                // Delay loading
                texture.delayLoad();
                return false;
            }
            var internalTexture = null;
            if (depthStencilTexture) {
                internalTexture = texture.depthStencilTexture;
            }
            else if (texture.isReady()) {
                internalTexture = texture.getInternalTexture();
            }
            else if (texture.isCube) {
                internalTexture = this.emptyCubeTexture;
            }
            else if (texture.is3D) {
                internalTexture = this.emptyTexture3D;
            }
            else if (texture.is2DArray) {
                internalTexture = this.emptyTexture2DArray;
            }
            else {
                internalTexture = this.emptyTexture;
            }
            if (internalTexture && !internalTexture.isMultiview) {
                // CUBIC_MODE and SKYBOX_MODE both require CLAMP_TO_EDGE.  All other modes use REPEAT.
                if (internalTexture.isCube && internalTexture._cachedCoordinatesMode !== texture.coordinatesMode) {
                    internalTexture._cachedCoordinatesMode = texture.coordinatesMode;
                    var textureWrapMode = texture.coordinatesMode !== 3 && texture.coordinatesMode !== 5
                        ? 1
                        : 0;
                    texture.wrapU = textureWrapMode;
                    texture.wrapV = textureWrapMode;
                }
                internalTexture._cachedWrapU = texture.wrapU;
                internalTexture._cachedWrapV = texture.wrapV;
                if (internalTexture.is3D) {
                    internalTexture._cachedWrapR = texture.wrapR;
                }
                this._setAnisotropicLevel(0, internalTexture, texture.anisotropicFilteringLevel);
            }
            this._setInternalTexture(name, internalTexture, baseName);
        }
        else {
            if (this.dbgVerboseLogsForFirstFrames) {
                if (this._count === undefined) {
                    this._count = 0;
                }
                if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                    console.log("frame #" + this._count + " - _setTexture called with a null _currentEffect! texture=", texture);
                }
            }
        }
        return true;
    };
    /**
     * @param target
     * @param internalTexture
     * @param anisotropicFilteringLevel
     * @hidden
     */
    WebGPUEngine.prototype._setAnisotropicLevel = function (target, internalTexture, anisotropicFilteringLevel) {
        if (internalTexture._cachedAnisotropicFilteringLevel !== anisotropicFilteringLevel) {
            internalTexture._cachedAnisotropicFilteringLevel = Math.min(anisotropicFilteringLevel, this._caps.maxAnisotropy);
        }
    };
    /**
     * @param channel
     * @param texture
     * @param name
     * @hidden
     */
    WebGPUEngine.prototype._bindTexture = function (channel, texture, name) {
        if (channel === undefined) {
            return;
        }
        this._setInternalTexture(name, texture);
    };
    /**
     * Generates the mipmaps for a texture
     * @param texture texture to generate the mipmaps for
     */
    WebGPUEngine.prototype.generateMipmaps = function (texture) {
        this._generateMipmaps(texture, this._renderTargetEncoder);
    };
    /**
     * @param texture
     * @param commandEncoder
     * @hidden
     */
    WebGPUEngine.prototype._generateMipmaps = function (texture, commandEncoder) {
        var gpuHardwareTexture = texture._hardwareTexture;
        if (!gpuHardwareTexture) {
            return;
        }
        // try as much as possible to use the command encoder corresponding to the current pass.
        // If not possible (because the pass is started - generateMipmaps itself creates a pass and it's not allowed to have a pass inside a pass), use _uploadEncoder
        commandEncoder =
            commandEncoder !== null && commandEncoder !== void 0 ? commandEncoder : (this._currentRenderTarget && !this._currentRenderPass ? this._renderTargetEncoder : !this._currentRenderPass ? this._renderEncoder : this._uploadEncoder);
        var format = texture._hardwareTexture.format;
        var mipmapCount = WebGPUTextureHelper.ComputeNumMipmapLevels(texture.width, texture.height);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - generate mipmaps called - width=", texture.width, "height=", texture.height, "isCube=", texture.isCube);
            }
        }
        if (texture.isCube) {
            this._textureHelper.generateCubeMipmaps(gpuHardwareTexture, format, mipmapCount, commandEncoder);
        }
        else {
            this._textureHelper.generateMipmaps(gpuHardwareTexture, format, mipmapCount, 0, commandEncoder);
        }
    };
    /**
     * Update a portion of an internal texture
     * @param texture defines the texture to update
     * @param imageData defines the data to store into the texture
     * @param xOffset defines the x coordinates of the update rectangle
     * @param yOffset defines the y coordinates of the update rectangle
     * @param width defines the width of the update rectangle
     * @param height defines the height of the update rectangle
     * @param faceIndex defines the face index if texture is a cube (0 by default)
     * @param lod defines the lod level to update (0 by default)
     * @param generateMipMaps defines whether to generate mipmaps or not
     */
    WebGPUEngine.prototype.updateTextureData = function (texture, imageData, xOffset, yOffset, width, height, faceIndex, lod, generateMipMaps) {
        var _a;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        var gpuTextureWrapper = texture._hardwareTexture;
        if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
            gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture);
        }
        var data = new Uint8Array(imageData.buffer, imageData.byteOffset, imageData.byteLength);
        this._textureHelper.updateTexture(data, texture, width, height, texture.depth, gpuTextureWrapper.format, faceIndex, lod, texture.invertY, false, xOffset, yOffset);
        if (generateMipMaps) {
            this._generateMipmaps(texture, this._renderTargetEncoder);
        }
    };
    /**
     * @param texture
     * @param internalFormat
     * @param width
     * @param height
     * @param imageData
     * @param faceIndex
     * @param lod
     * @hidden
     */
    WebGPUEngine.prototype._uploadCompressedDataToTextureDirectly = function (texture, internalFormat, width, height, imageData, faceIndex, lod) {
        var _a;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        var gpuTextureWrapper = texture._hardwareTexture;
        if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
            texture.format = internalFormat;
            gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture, width, height);
        }
        var data = new Uint8Array(imageData.buffer, imageData.byteOffset, imageData.byteLength);
        this._textureHelper.updateTexture(data, texture, width, height, texture.depth, gpuTextureWrapper.format, faceIndex, lod, false, false, 0, 0);
    };
    /**
     * @param texture
     * @param imageData
     * @param faceIndex
     * @param lod
     * @param babylonInternalFormat
     * @param useTextureWidthAndHeight
     * @hidden
     */
    WebGPUEngine.prototype._uploadDataToTextureDirectly = function (texture, imageData, faceIndex, lod, babylonInternalFormat, useTextureWidthAndHeight) {
        var _a;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        if (useTextureWidthAndHeight === void 0) { useTextureWidthAndHeight = false; }
        var lodMaxWidth = Math.round(Math.log(texture.width) * Math.LOG2E);
        var lodMaxHeight = Math.round(Math.log(texture.height) * Math.LOG2E);
        var width = useTextureWidthAndHeight ? texture.width : Math.pow(2, Math.max(lodMaxWidth - lod, 0));
        var height = useTextureWidthAndHeight ? texture.height : Math.pow(2, Math.max(lodMaxHeight - lod, 0));
        var gpuTextureWrapper = texture._hardwareTexture;
        if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
            gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture, width, height);
        }
        var data = new Uint8Array(imageData.buffer, imageData.byteOffset, imageData.byteLength);
        this._textureHelper.updateTexture(data, texture, width, height, texture.depth, gpuTextureWrapper.format, faceIndex, lod, texture.invertY, false, 0, 0);
    };
    /**
     * @param texture
     * @param imageData
     * @param faceIndex
     * @param lod
     * @hidden
     */
    WebGPUEngine.prototype._uploadArrayBufferViewToTexture = function (texture, imageData, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        this._uploadDataToTextureDirectly(texture, imageData, faceIndex, lod);
    };
    /**
     * @param texture
     * @param image
     * @param faceIndex
     * @param lod
     * @hidden
     */
    WebGPUEngine.prototype._uploadImageToTexture = function (texture, image, faceIndex, lod) {
        var _a;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        var gpuTextureWrapper = texture._hardwareTexture;
        if (!((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource)) {
            gpuTextureWrapper = this._textureHelper.createGPUTextureForInternalTexture(texture);
        }
        var bitmap = image; // in WebGPU we will always get an ImageBitmap, not an HTMLImageElement
        var width = Math.ceil(texture.width / (1 << lod));
        var height = Math.ceil(texture.height / (1 << lod));
        this._textureHelper.updateTexture(bitmap, texture, width, height, texture.depth, gpuTextureWrapper.format, faceIndex, lod, texture.invertY, false, 0, 0);
    };
    /**
     * Reads pixels from the current frame buffer. Please note that this function can be slow
     * @param x defines the x coordinate of the rectangle where pixels must be read
     * @param y defines the y coordinate of the rectangle where pixels must be read
     * @param width defines the width of the rectangle where pixels must be read
     * @param height defines the height of the rectangle where pixels must be read
     * @param hasAlpha defines whether the output should have alpha or not (defaults to true)
     * @param flushRenderer true to flush the renderer from the pending commands before reading the pixels
     * @returns a ArrayBufferView promise (Uint8Array) containing RGBA colors
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    WebGPUEngine.prototype.readPixels = function (x, y, width, height, hasAlpha, flushRenderer) {
        if (hasAlpha === void 0) { hasAlpha = true; }
        if (flushRenderer === void 0) { flushRenderer = true; }
        var renderPassWrapper = this._rttRenderPassWrapper.renderPass ? this._rttRenderPassWrapper : this._mainRenderPassWrapper;
        var hardwareTexture = renderPassWrapper.colorAttachmentGPUTextures[0];
        if (!hardwareTexture) {
            // we are calling readPixels for a render pass with no color texture bound
            return Promise.resolve(new Uint8Array(0));
        }
        var gpuTexture = hardwareTexture.underlyingResource;
        var gpuTextureFormat = hardwareTexture.format;
        if (!gpuTexture) {
            // we are calling readPixels before startMainRenderPass has been called and no RTT is bound, so swapChainTexture is not setup yet!
            return Promise.resolve(new Uint8Array(0));
        }
        if (flushRenderer) {
            this.flushFramebuffer();
        }
        return this._textureHelper.readPixels(gpuTexture, x, y, width, height, gpuTextureFormat);
    };
    //------------------------------------------------------------------------------
    //                              Frame management
    //------------------------------------------------------------------------------
    /**
     * Begin a new frame
     */
    WebGPUEngine.prototype.beginFrame = function () {
        _super.prototype.beginFrame.call(this);
    };
    /**
     * End the current frame
     */
    WebGPUEngine.prototype.endFrame = function () {
        this._snapshotRendering.endFrame(this._mainRenderPassWrapper.renderPass);
        this._endMainRenderPass();
        this._timestampQuery.endFrame(this._renderEncoder);
        this.flushFramebuffer(false);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - counters");
            }
        }
        this._textureHelper.destroyDeferredTextures();
        this._bufferManager.destroyDeferredBuffers();
        if (this._features._collectUbosUpdatedInFrame) {
            if (this.dbgVerboseLogsForFirstFrames) {
                if (this._count === undefined) {
                    this._count = 0;
                }
                if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                    var list = [];
                    for (var name_2 in UniformBuffer._UpdatedUbosInFrame) {
                        list.push(name_2 + ":" + UniformBuffer._UpdatedUbosInFrame[name_2]);
                    }
                    console.log("frame #" + this._count + " - updated ubos -", list.join(", "));
                }
            }
            UniformBuffer._UpdatedUbosInFrame = {};
        }
        this.countersLastFrame.numEnableEffects = this._counters.numEnableEffects;
        this.countersLastFrame.numEnableDrawWrapper = this._counters.numEnableDrawWrapper;
        this.countersLastFrame.numBundleCreationNonCompatMode = this._counters.numBundleCreationNonCompatMode;
        this.countersLastFrame.numBundleReuseNonCompatMode = this._counters.numBundleReuseNonCompatMode;
        this._counters.numEnableEffects = 0;
        this._counters.numEnableDrawWrapper = 0;
        this._counters.numBundleCreationNonCompatMode = 0;
        this._counters.numBundleReuseNonCompatMode = 0;
        this._cacheRenderPipeline.endFrame();
        this._cacheBindGroups.endFrame();
        this._pendingDebugCommands.length = 0;
        _super.prototype.endFrame.call(this);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (this._count < this.dbgVerboseLogsNumFrames) {
                console.log("%c frame #" + this._count + " - end", "background: #ffff00");
            }
            if (this._count < this.dbgVerboseLogsNumFrames) {
                this._count++;
                if (this._count !== this.dbgVerboseLogsNumFrames) {
                    console.log("%c frame #" + this._count + " - begin", "background: #ffff00");
                }
            }
        }
    };
    /**
     * Force a WebGPU flush (ie. a flush of all waiting commands)
     * @param reopenPass true to reopen at the end of the function the pass that was active when entering the function
     */
    WebGPUEngine.prototype.flushFramebuffer = function (reopenPass) {
        if (reopenPass === void 0) { reopenPass = true; }
        // we need to end the current render pass (main or rtt) if any as we are not allowed to submit the command buffers when being in a pass
        var currentRenderPassIsNULL = !this._currentRenderPass;
        var currentPasses = 0; // 0 if no pass, 1 for rtt, 2 for main pass
        if (this._currentRenderPass && this._currentRenderTarget) {
            currentPasses |= 1;
            this._endRenderTargetRenderPass();
        }
        if (this._mainRenderPassWrapper.renderPass) {
            currentPasses |= 2;
            this._endMainRenderPass();
        }
        this._commandBuffers[0] = this._uploadEncoder.finish();
        this._commandBuffers[1] = this._renderTargetEncoder.finish();
        this._commandBuffers[2] = this._renderEncoder.finish();
        this._device.queue.submit(this._commandBuffers);
        this._uploadEncoder = this._device.createCommandEncoder(this._uploadEncoderDescriptor);
        this._renderEncoder = this._device.createCommandEncoder(this._renderEncoderDescriptor);
        this._renderTargetEncoder = this._device.createCommandEncoder(this._renderTargetEncoderDescriptor);
        this._timestampQuery.startFrame(this._uploadEncoder);
        this._textureHelper.setCommandEncoder(this._uploadEncoder);
        this._bundleList.reset();
        this._bundleListRenderTarget.reset();
        // restart the render pass
        if (reopenPass) {
            if (currentPasses & 2) {
                this._startMainRenderPass(false);
            }
            if (currentPasses & 1) {
                this._startRenderTargetRenderPass(this._currentRenderTarget, false, null, false, false);
            }
            if (currentRenderPassIsNULL && this._currentRenderTarget) {
                this._currentRenderPass = null;
            }
        }
    };
    /** @hidden */
    WebGPUEngine.prototype._currentFrameBufferIsDefaultFrameBuffer = function () {
        return this._currentRenderTarget === null;
    };
    //------------------------------------------------------------------------------
    //                              Render Pass
    //------------------------------------------------------------------------------
    WebGPUEngine.prototype._startRenderTargetRenderPass = function (renderTargetWrapper, setClearStates, clearColor, clearDepth, clearStencil) {
        var _a, _b, _c;
        var rtWrapper = renderTargetWrapper;
        var depthStencilTexture = rtWrapper._depthStencilTexture;
        var gpuDepthStencilWrapper = depthStencilTexture === null || depthStencilTexture === void 0 ? void 0 : depthStencilTexture._hardwareTexture;
        var gpuDepthStencilTexture = gpuDepthStencilWrapper === null || gpuDepthStencilWrapper === void 0 ? void 0 : gpuDepthStencilWrapper.underlyingResource;
        var gpuDepthStencilMSAATexture = gpuDepthStencilWrapper === null || gpuDepthStencilWrapper === void 0 ? void 0 : gpuDepthStencilWrapper.msaaTexture;
        var depthTextureView = gpuDepthStencilTexture === null || gpuDepthStencilTexture === void 0 ? void 0 : gpuDepthStencilTexture.createView(this._rttRenderPassWrapper.depthAttachmentViewDescriptor);
        var depthMSAATextureView = gpuDepthStencilMSAATexture === null || gpuDepthStencilMSAATexture === void 0 ? void 0 : gpuDepthStencilMSAATexture.createView(this._rttRenderPassWrapper.depthAttachmentViewDescriptor);
        var depthTextureHasStencil = gpuDepthStencilWrapper ? WebGPUTextureHelper.HasStencilAspect(gpuDepthStencilWrapper.format) : false;
        var colorAttachments = [];
        if (this.useReverseDepthBuffer) {
            this.setDepthFunctionToGreaterOrEqual();
        }
        var mustClearColor = setClearStates && clearColor;
        var mustClearDepth = setClearStates && clearDepth;
        var mustClearStencil = setClearStates && clearStencil;
        if (rtWrapper._attachments && rtWrapper.isMulti) {
            // multi render targets
            if (!this._mrtAttachments || this._mrtAttachments.length === 0) {
                this._mrtAttachments = rtWrapper._defaultAttachments;
            }
            for (var i = 0; i < this._mrtAttachments.length; ++i) {
                var index = this._mrtAttachments[i]; // if index == 0 it means the texture should not be written to => at render pass creation time, it means we should not clear it
                var mrtTexture = rtWrapper.textures[i];
                var gpuMRTWrapper = mrtTexture === null || mrtTexture === void 0 ? void 0 : mrtTexture._hardwareTexture;
                var gpuMRTTexture = gpuMRTWrapper === null || gpuMRTWrapper === void 0 ? void 0 : gpuMRTWrapper.underlyingResource;
                if (gpuMRTWrapper && gpuMRTTexture) {
                    var viewDescriptor = __assign(__assign({}, this._rttRenderPassWrapper.colorAttachmentViewDescriptor), { format: gpuMRTWrapper.format });
                    var gpuMSAATexture = gpuMRTWrapper.msaaTexture;
                    var colorTextureView = gpuMRTTexture.createView(viewDescriptor);
                    var colorMSAATextureView = gpuMSAATexture === null || gpuMSAATexture === void 0 ? void 0 : gpuMSAATexture.createView(viewDescriptor);
                    colorAttachments.push({
                        view: colorMSAATextureView ? colorMSAATextureView : colorTextureView,
                        resolveTarget: gpuMSAATexture ? colorTextureView : undefined,
                        clearValue: index !== 0 && mustClearColor ? clearColor : undefined,
                        loadOp: index !== 0 && mustClearColor ? WebGPUConstants.LoadOp.Clear : WebGPUConstants.LoadOp.Load,
                        storeOp: WebGPUConstants.StoreOp.Store,
                    });
                }
            }
            this._cacheRenderPipeline.setMRT(rtWrapper.textures, this._mrtAttachments.length);
            this._cacheRenderPipeline.setMRTAttachments(this._mrtAttachments);
        }
        else {
            // single render target
            var internalTexture = rtWrapper.texture;
            if (internalTexture) {
                var gpuWrapper = internalTexture._hardwareTexture;
                var gpuTexture = gpuWrapper.underlyingResource;
                var gpuMSAATexture = gpuWrapper.msaaTexture;
                var colorTextureView = gpuTexture.createView(this._rttRenderPassWrapper.colorAttachmentViewDescriptor);
                var colorMSAATextureView = gpuMSAATexture === null || gpuMSAATexture === void 0 ? void 0 : gpuMSAATexture.createView(this._rttRenderPassWrapper.colorAttachmentViewDescriptor);
                colorAttachments.push({
                    view: colorMSAATextureView ? colorMSAATextureView : colorTextureView,
                    resolveTarget: gpuMSAATexture ? colorTextureView : undefined,
                    clearValue: mustClearColor ? clearColor : undefined,
                    loadOp: mustClearColor ? WebGPUConstants.LoadOp.Clear : WebGPUConstants.LoadOp.Load,
                    storeOp: WebGPUConstants.StoreOp.Store,
                });
            }
            else {
                colorAttachments.push(null);
            }
        }
        (_a = this._debugPushGroup) === null || _a === void 0 ? void 0 : _a.call(this, "render target pass", 1);
        this._rttRenderPassWrapper.renderPassDescriptor = {
            colorAttachments: colorAttachments,
            depthStencilAttachment: depthStencilTexture && gpuDepthStencilTexture
                ? {
                    view: depthMSAATextureView ? depthMSAATextureView : depthTextureView,
                    depthClearValue: mustClearDepth ? (this.useReverseDepthBuffer ? this._clearReverseDepthValue : this._clearDepthValue) : undefined,
                    depthLoadOp: mustClearDepth ? WebGPUConstants.LoadOp.Clear : WebGPUConstants.LoadOp.Load,
                    depthStoreOp: WebGPUConstants.StoreOp.Store,
                    stencilClearValue: rtWrapper._depthStencilTextureWithStencil && mustClearStencil ? this._clearStencilValue : undefined,
                    stencilLoadOp: !depthTextureHasStencil
                        ? undefined
                        : rtWrapper._depthStencilTextureWithStencil && mustClearStencil
                            ? WebGPUConstants.LoadOp.Clear
                            : WebGPUConstants.LoadOp.Load,
                    stencilStoreOp: !depthTextureHasStencil ? undefined : WebGPUConstants.StoreOp.Store,
                }
                : undefined,
            occlusionQuerySet: ((_b = this._occlusionQuery) === null || _b === void 0 ? void 0 : _b.hasQueries) ? this._occlusionQuery.querySet : undefined,
        };
        this._rttRenderPassWrapper.renderPass = this._renderTargetEncoder.beginRenderPass(this._rttRenderPassWrapper.renderPassDescriptor);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                var internalTexture = rtWrapper.texture;
                console.log("frame #" + this._count + " - render target begin pass - internalTexture.uniqueId=", internalTexture.uniqueId, "width=", internalTexture.width, "height=", internalTexture.height, this._rttRenderPassWrapper.renderPassDescriptor);
            }
        }
        this._currentRenderPass = this._rttRenderPassWrapper.renderPass;
        (_c = this._debugFlushPendingCommands) === null || _c === void 0 ? void 0 : _c.call(this);
        this._resetCurrentViewport(1);
        this._resetCurrentScissor(1);
        this._resetCurrentStencilRef(1);
        this._resetCurrentColorBlend(1);
        if (!gpuDepthStencilWrapper || !WebGPUTextureHelper.HasStencilAspect(gpuDepthStencilWrapper.format)) {
            this._stencilStateComposer.enabled = false;
        }
    };
    /** @hidden */
    WebGPUEngine.prototype._endRenderTargetRenderPass = function () {
        var _a, _b, _c, _d;
        if (this._currentRenderPass) {
            var gpuWrapper = (_a = this._currentRenderTarget.texture) === null || _a === void 0 ? void 0 : _a._hardwareTexture;
            if (gpuWrapper && !this._snapshotRendering.endRenderTargetPass(this._currentRenderPass, gpuWrapper) && !this.compatibilityMode) {
                this._bundleListRenderTarget.run(this._currentRenderPass);
                this._bundleListRenderTarget.reset();
            }
            this._currentRenderPass.end();
            if (this.dbgVerboseLogsForFirstFrames) {
                if (this._count === undefined) {
                    this._count = 0;
                }
                if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                    console.log("frame #" + this._count + " - render target end pass - internalTexture.uniqueId=", (_c = (_b = this._currentRenderTarget) === null || _b === void 0 ? void 0 : _b.texture) === null || _c === void 0 ? void 0 : _c.uniqueId);
                }
            }
            (_d = this._debugPopGroup) === null || _d === void 0 ? void 0 : _d.call(this, 1);
            this._resetCurrentViewport(1);
            this._resetCurrentScissor(1);
            this._resetCurrentStencilRef(1);
            this._resetCurrentColorBlend(1);
            this._currentRenderPass = null;
            this._rttRenderPassWrapper.reset();
        }
    };
    WebGPUEngine.prototype._getCurrentRenderPass = function () {
        if (this._currentRenderTarget && !this._currentRenderPass) {
            // delayed creation of the render target pass, but we now need to create it as we are requested the render pass
            this._startRenderTargetRenderPass(this._currentRenderTarget, false, null, false, false);
        }
        else if (!this._currentRenderPass) {
            this._startMainRenderPass(false);
        }
        return this._currentRenderPass;
    };
    /** @hidden */
    WebGPUEngine.prototype._getCurrentRenderPassIndex = function () {
        return this._currentRenderPass === null ? -1 : this._currentRenderPass === this._mainRenderPassWrapper.renderPass ? 0 : 1;
    };
    WebGPUEngine.prototype._startMainRenderPass = function (setClearStates, clearColor, clearDepth, clearStencil) {
        var _a, _b, _c;
        if (this._mainRenderPassWrapper.renderPass) {
            this._endMainRenderPass();
        }
        if (this.useReverseDepthBuffer) {
            this.setDepthFunctionToGreaterOrEqual();
        }
        var mustClearColor = setClearStates && clearColor;
        var mustClearDepth = setClearStates && clearDepth;
        var mustClearStencil = setClearStates && clearStencil;
        this._mainRenderPassWrapper.renderPassDescriptor.colorAttachments[0].clearValue = mustClearColor ? clearColor : undefined;
        this._mainRenderPassWrapper.renderPassDescriptor.colorAttachments[0].loadOp = mustClearColor ? WebGPUConstants.LoadOp.Clear : WebGPUConstants.LoadOp.Load;
        this._mainRenderPassWrapper.renderPassDescriptor.depthStencilAttachment.depthClearValue = mustClearDepth
            ? this.useReverseDepthBuffer
                ? this._clearReverseDepthValue
                : this._clearDepthValue
            : undefined;
        this._mainRenderPassWrapper.renderPassDescriptor.depthStencilAttachment.depthLoadOp = mustClearDepth ? WebGPUConstants.LoadOp.Clear : WebGPUConstants.LoadOp.Load;
        this._mainRenderPassWrapper.renderPassDescriptor.depthStencilAttachment.stencilClearValue = mustClearStencil ? this._clearStencilValue : undefined;
        this._mainRenderPassWrapper.renderPassDescriptor.depthStencilAttachment.stencilLoadOp = !this.isStencilEnable
            ? undefined
            : mustClearStencil
                ? WebGPUConstants.LoadOp.Clear
                : WebGPUConstants.LoadOp.Load;
        this._mainRenderPassWrapper.renderPassDescriptor.occlusionQuerySet = ((_a = this._occlusionQuery) === null || _a === void 0 ? void 0 : _a.hasQueries) ? this._occlusionQuery.querySet : undefined;
        this._swapChainTexture = this._context.getCurrentTexture();
        this._mainRenderPassWrapper.colorAttachmentGPUTextures[0].set(this._swapChainTexture);
        // Resolve in case of MSAA
        if (this._options.antialiasing) {
            this._mainRenderPassWrapper.renderPassDescriptor.colorAttachments[0].resolveTarget = this._swapChainTexture.createView();
        }
        else {
            this._mainRenderPassWrapper.renderPassDescriptor.colorAttachments[0].view = this._swapChainTexture.createView();
        }
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - main begin pass - texture width=" + this._mainTextureExtends.width, " height=" + this._mainTextureExtends.height, this._mainRenderPassWrapper.renderPassDescriptor);
            }
        }
        (_b = this._debugPushGroup) === null || _b === void 0 ? void 0 : _b.call(this, "main pass", 0);
        this._currentRenderPass = this._renderEncoder.beginRenderPass(this._mainRenderPassWrapper.renderPassDescriptor);
        this._mainRenderPassWrapper.renderPass = this._currentRenderPass;
        (_c = this._debugFlushPendingCommands) === null || _c === void 0 ? void 0 : _c.call(this);
        this._resetCurrentViewport(0);
        this._resetCurrentScissor(0);
        this._resetCurrentStencilRef(0);
        this._resetCurrentColorBlend(0);
        if (!this._isStencilEnable) {
            this._stencilStateComposer.enabled = false;
        }
    };
    WebGPUEngine.prototype._endMainRenderPass = function () {
        var _a;
        if (this._mainRenderPassWrapper.renderPass !== null) {
            this._snapshotRendering.endMainRenderPass();
            if (!this.compatibilityMode && !this._snapshotRendering.play) {
                this._bundleList.run(this._mainRenderPassWrapper.renderPass);
                this._bundleList.reset();
            }
            this._mainRenderPassWrapper.renderPass.end();
            if (this.dbgVerboseLogsForFirstFrames) {
                if (this._count === undefined) {
                    this._count = 0;
                }
                if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                    console.log("frame #" + this._count + " - main end pass");
                }
            }
            (_a = this._debugPopGroup) === null || _a === void 0 ? void 0 : _a.call(this, 0);
            this._resetCurrentViewport(0);
            this._resetCurrentScissor(0);
            this._resetCurrentStencilRef(0);
            this._resetCurrentColorBlend(0);
            if (this._mainRenderPassWrapper.renderPass === this._currentRenderPass) {
                this._currentRenderPass = null;
            }
            this._mainRenderPassWrapper.reset(false);
        }
    };
    /**
     * Binds the frame buffer to the specified texture.
     * @param texture The render target wrapper to render to
     * @param faceIndex The face of the texture to render to in case of cube texture
     * @param requiredWidth The width of the target to render to
     * @param requiredHeight The height of the target to render to
     * @param forceFullscreenViewport Forces the viewport to be the entire texture/screen if true
     * @param lodLevel defines the lod level to bind to the frame buffer
     * @param layer defines the 2d array index to bind to frame buffer to
     */
    WebGPUEngine.prototype.bindFramebuffer = function (texture, faceIndex, requiredWidth, requiredHeight, forceFullscreenViewport, lodLevel, layer) {
        var _a, _b;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lodLevel === void 0) { lodLevel = 0; }
        if (layer === void 0) { layer = 0; }
        var hardwareTexture = (_a = texture.texture) === null || _a === void 0 ? void 0 : _a._hardwareTexture;
        if (this._currentRenderTarget) {
            this.unBindFramebuffer(this._currentRenderTarget);
        }
        this._currentRenderTarget = texture;
        if (hardwareTexture) {
            hardwareTexture._currentLayer = texture.isCube ? layer * 6 + faceIndex : layer;
        }
        this._rttRenderPassWrapper.colorAttachmentGPUTextures[0] = hardwareTexture;
        this._rttRenderPassWrapper.depthTextureFormat = this._currentRenderTarget._depthStencilTexture
            ? WebGPUTextureHelper.GetWebGPUTextureFormat(-1, this._currentRenderTarget._depthStencilTexture.format)
            : undefined;
        this._setDepthTextureFormat(this._rttRenderPassWrapper);
        this._setColorFormat(this._rttRenderPassWrapper);
        this._rttRenderPassWrapper.colorAttachmentViewDescriptor = {
            format: this._colorFormat,
            dimension: WebGPUConstants.TextureViewDimension.E2d,
            mipLevelCount: 1,
            baseArrayLayer: texture.isCube ? layer * 6 + faceIndex : layer,
            baseMipLevel: lodLevel,
            arrayLayerCount: 1,
            aspect: WebGPUConstants.TextureAspect.All,
        };
        this._rttRenderPassWrapper.depthAttachmentViewDescriptor = {
            format: this._depthTextureFormat,
            dimension: WebGPUConstants.TextureViewDimension.E2d,
            mipLevelCount: 1,
            baseArrayLayer: texture.isCube ? layer * 6 + faceIndex : layer,
            baseMipLevel: 0,
            arrayLayerCount: 1,
            aspect: WebGPUConstants.TextureAspect.All,
        };
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - bindFramebuffer called - internalTexture.uniqueId=", (_b = texture.texture) === null || _b === void 0 ? void 0 : _b.uniqueId, "face=", faceIndex, "lodLevel=", lodLevel, "layer=", layer, this._rttRenderPassWrapper.colorAttachmentViewDescriptor, this._rttRenderPassWrapper.depthAttachmentViewDescriptor);
            }
        }
        this._currentRenderPass = null; // lazy creation of the render pass, hoping the render pass will be created by a call to clear()...
        if (this.snapshotRendering && this.snapshotRenderingMode === 1) {
            // force the creation of the render pass as we know in fast snapshot rendering mode clear() won't be called
            this._getCurrentRenderPass();
        }
        if (this._cachedViewport && !forceFullscreenViewport) {
            this.setViewport(this._cachedViewport, requiredWidth, requiredHeight);
        }
        else {
            if (!requiredWidth) {
                requiredWidth = texture.width;
                if (lodLevel) {
                    requiredWidth = requiredWidth / Math.pow(2, lodLevel);
                }
            }
            if (!requiredHeight) {
                requiredHeight = texture.height;
                if (lodLevel) {
                    requiredHeight = requiredHeight / Math.pow(2, lodLevel);
                }
            }
            this._viewport(0, 0, requiredWidth, requiredHeight);
        }
        this.wipeCaches();
    };
    /**
     * Unbind the current render target texture from the WebGPU context
     * @param texture defines the render target wrapper to unbind
     * @param disableGenerateMipMaps defines a boolean indicating that mipmaps must not be generated
     * @param onBeforeUnbind defines a function which will be called before the effective unbind
     */
    WebGPUEngine.prototype.unBindFramebuffer = function (texture, disableGenerateMipMaps, onBeforeUnbind) {
        var _a, _b;
        if (disableGenerateMipMaps === void 0) { disableGenerateMipMaps = false; }
        var saveCRT = this._currentRenderTarget;
        this._currentRenderTarget = null; // to be iso with thinEngine, this._currentRenderTarget must be null when onBeforeUnbind is called
        if (onBeforeUnbind) {
            onBeforeUnbind();
        }
        this._currentRenderTarget = saveCRT;
        if (this._currentRenderPass && this._currentRenderPass !== this._mainRenderPassWrapper.renderPass) {
            this._endRenderTargetRenderPass();
        }
        if (((_a = texture.texture) === null || _a === void 0 ? void 0 : _a.generateMipMaps) && !disableGenerateMipMaps && !texture.isCube) {
            this._generateMipmaps(texture.texture);
        }
        this._currentRenderTarget = null;
        this._onAfterUnbindFrameBufferObservable.notifyObservers(this);
        if (this.dbgVerboseLogsForFirstFrames) {
            if (this._count === undefined) {
                this._count = 0;
            }
            if (!this._count || this._count < this.dbgVerboseLogsNumFrames) {
                console.log("frame #" + this._count + " - unBindFramebuffer called - internalTexture.uniqueId=", (_b = texture.texture) === null || _b === void 0 ? void 0 : _b.uniqueId);
            }
        }
        this._mrtAttachments = [];
        this._cacheRenderPipeline.setMRT([]);
        this._cacheRenderPipeline.setMRTAttachments(this._mrtAttachments);
        this._currentRenderPass = this._mainRenderPassWrapper.renderPass;
        this._setDepthTextureFormat(this._mainRenderPassWrapper);
        this._setColorFormat(this._mainRenderPassWrapper);
    };
    /**
     * Unbind the current render target and bind the default framebuffer
     */
    WebGPUEngine.prototype.restoreDefaultFramebuffer = function () {
        if (this._currentRenderTarget) {
            this.unBindFramebuffer(this._currentRenderTarget);
        }
        else {
            this._currentRenderPass = this._mainRenderPassWrapper.renderPass;
            this._setDepthTextureFormat(this._mainRenderPassWrapper);
            this._setColorFormat(this._mainRenderPassWrapper);
        }
        if (this._currentRenderPass) {
            if (this._cachedViewport) {
                this.setViewport(this._cachedViewport);
            }
        }
        this.wipeCaches();
    };
    //------------------------------------------------------------------------------
    //                              Render
    //------------------------------------------------------------------------------
    /**
     * @param wrapper
     * @hidden
     */
    WebGPUEngine.prototype._setColorFormat = function (wrapper) {
        var _a, _b;
        var format = (_b = (_a = wrapper.colorAttachmentGPUTextures[0]) === null || _a === void 0 ? void 0 : _a.format) !== null && _b !== void 0 ? _b : null;
        this._cacheRenderPipeline.setColorFormat(format);
        if (this._colorFormat === format) {
            return;
        }
        this._colorFormat = format;
    };
    /**
     * @param wrapper
     * @hidden
     */
    WebGPUEngine.prototype._setDepthTextureFormat = function (wrapper) {
        this._cacheRenderPipeline.setDepthStencilFormat(wrapper.depthTextureFormat);
        if (this._depthTextureFormat === wrapper.depthTextureFormat) {
            return;
        }
        this._depthTextureFormat = wrapper.depthTextureFormat;
    };
    WebGPUEngine.prototype.setDitheringState = function () {
        // Does not exist in WebGPU
    };
    WebGPUEngine.prototype.setRasterizerState = function () {
        // Does not exist in WebGPU
    };
    /**
     * Set various states to the webGL context
     * @param culling defines culling state: true to enable culling, false to disable it
     * @param zOffset defines the value to apply to zOffset (0 by default)
     * @param force defines if states must be applied even if cache is up to date
     * @param reverseSide defines if culling must be reversed (CCW if false, CW if true)
     * @param cullBackFaces true to cull back faces, false to cull front faces (if culling is enabled)
     * @param stencil stencil states to set
     * @param zOffsetUnits defines the value to apply to zOffsetUnits (0 by default)
     */
    WebGPUEngine.prototype.setState = function (culling, zOffset, force, reverseSide, cullBackFaces, stencil, zOffsetUnits) {
        var _a, _b;
        if (zOffset === void 0) { zOffset = 0; }
        if (reverseSide === void 0) { reverseSide = false; }
        if (zOffsetUnits === void 0) { zOffsetUnits = 0; }
        // Culling
        if (this._depthCullingState.cull !== culling || force) {
            this._depthCullingState.cull = culling;
        }
        // Cull face
        var cullFace = ((_b = (_a = this.cullBackFaces) !== null && _a !== void 0 ? _a : cullBackFaces) !== null && _b !== void 0 ? _b : true) ? 1 : 2;
        if (this._depthCullingState.cullFace !== cullFace || force) {
            this._depthCullingState.cullFace = cullFace;
        }
        // Z offset
        this.setZOffset(zOffset);
        this.setZOffsetUnits(zOffsetUnits);
        // Front face
        var frontFace = reverseSide ? (this._currentRenderTarget ? 1 : 2) : this._currentRenderTarget ? 2 : 1;
        if (this._depthCullingState.frontFace !== frontFace || force) {
            this._depthCullingState.frontFace = frontFace;
        }
        this._stencilStateComposer.stencilMaterial = stencil;
    };
    WebGPUEngine.prototype._applyRenderPassChanges = function (renderPass, bundleList) {
        var _a;
        var mustUpdateViewport = this._mustUpdateViewport(renderPass);
        var mustUpdateScissor = this._mustUpdateScissor(renderPass);
        var mustUpdateStencilRef = !this._stencilStateComposer.enabled ? false : this._mustUpdateStencilRef(renderPass);
        var mustUpdateBlendColor = !this._alphaState.alphaBlend ? false : this._mustUpdateBlendColor(renderPass);
        if (bundleList) {
            if (mustUpdateViewport) {
                bundleList.addItem(new WebGPURenderItemViewport(this._viewportCached.x, this._viewportCached.y, this._viewportCached.z, this._viewportCached.w));
            }
            if (mustUpdateScissor) {
                bundleList.addItem(new WebGPURenderItemScissor(this._scissorCached.x, this._scissorCached.y, this._scissorCached.z, this._scissorCached.w));
            }
            if (mustUpdateStencilRef) {
                bundleList.addItem(new WebGPURenderItemStencilRef((_a = this._stencilStateComposer.funcRef) !== null && _a !== void 0 ? _a : 0));
            }
            if (mustUpdateBlendColor) {
                bundleList.addItem(new WebGPURenderItemBlendColor(this._alphaState._blendConstants.slice()));
            }
        }
        else {
            if (mustUpdateViewport) {
                this._applyViewport(renderPass);
            }
            if (mustUpdateScissor) {
                this._applyScissor(renderPass);
            }
            if (mustUpdateStencilRef) {
                this._applyStencilRef(renderPass);
            }
            if (mustUpdateBlendColor) {
                this._applyBlendColor(renderPass);
            }
        }
    };
    WebGPUEngine.prototype._draw = function (drawType, fillMode, start, count, instancesCount) {
        var _a;
        var renderPass = this._getCurrentRenderPass();
        var renderPassIndex = this._getCurrentRenderPassIndex();
        var bundleList = renderPassIndex === 0 ? this._bundleList : this._bundleListRenderTarget;
        this.applyStates();
        var webgpuPipelineContext = this._currentEffect._pipelineContext;
        this.bindUniformBufferBase(this._currentRenderTarget ? this._ubInvertY : this._ubDontInvertY, 0, WebGPUShaderProcessor.InternalsUBOName);
        if (webgpuPipelineContext.uniformBuffer) {
            webgpuPipelineContext.uniformBuffer.update();
            this.bindUniformBufferBase(webgpuPipelineContext.uniformBuffer.getBuffer(), 0, WebGPUShaderProcessor.LeftOvertUBOName);
        }
        if (this._snapshotRendering.play) {
            this._reportDrawCall();
            return;
        }
        if (!this.compatibilityMode &&
            (this._currentDrawContext.isDirty(this._currentMaterialContext.updateId) || this._currentMaterialContext.isDirty || this._currentMaterialContext.forceBindGroupCreation)) {
            this._currentDrawContext.fastBundle = undefined;
        }
        var useFastPath = !this.compatibilityMode && this._currentDrawContext.fastBundle;
        var renderPass2 = renderPass;
        if (useFastPath || this._snapshotRendering.record) {
            this._applyRenderPassChanges(renderPass, bundleList);
            if (!this._snapshotRendering.record) {
                this._counters.numBundleReuseNonCompatMode++;
                if (this._currentDrawContext.indirectDrawBuffer) {
                    this._currentDrawContext.setIndirectData(count, instancesCount || 1, start);
                }
                bundleList.addBundle(this._currentDrawContext.fastBundle);
                this._reportDrawCall();
                return;
            }
            renderPass2 = bundleList.getBundleEncoder(this._cacheRenderPipeline.colorFormats, this._depthTextureFormat, this.currentSampleCount); // for snapshot recording mode
            bundleList.numDrawCalls++;
        }
        var textureState = 0;
        if (!this._caps.textureFloatLinearFiltering && this._currentMaterialContext.hasFloatTextures) {
            var bitVal = 1;
            for (var i = 0; i < webgpuPipelineContext.shaderProcessingContext.textureNames.length; ++i) {
                var textureName = webgpuPipelineContext.shaderProcessingContext.textureNames[i];
                var texture = (_a = this._currentMaterialContext.textures[textureName]) === null || _a === void 0 ? void 0 : _a.texture;
                if ((texture === null || texture === void 0 ? void 0 : texture.type) === 1) {
                    textureState |= bitVal;
                }
                bitVal = bitVal << 1;
            }
        }
        var pipeline = this._cacheRenderPipeline.getRenderPipeline(fillMode, this._currentEffect, this.currentSampleCount, textureState);
        var bindGroups = this._cacheBindGroups.getBindGroups(webgpuPipelineContext, this._currentDrawContext, this._currentMaterialContext);
        if (!this._snapshotRendering.record) {
            this._applyRenderPassChanges(renderPass, !this.compatibilityMode ? bundleList : null);
            if (!this.compatibilityMode) {
                this._counters.numBundleCreationNonCompatMode++;
                renderPass2 = this._device.createRenderBundleEncoder({
                    colorFormats: this._cacheRenderPipeline.colorFormats,
                    depthStencilFormat: this._depthTextureFormat,
                    sampleCount: this.currentSampleCount,
                });
            }
        }
        // bind pipeline
        renderPass2.setPipeline(pipeline);
        // bind index/vertex buffers
        if (this._currentIndexBuffer) {
            renderPass2.setIndexBuffer(this._currentIndexBuffer.underlyingResource, this._currentIndexBuffer.is32Bits ? WebGPUConstants.IndexFormat.Uint32 : WebGPUConstants.IndexFormat.Uint16, 0);
        }
        var vertexBuffers = this._cacheRenderPipeline.vertexBuffers;
        for (var index = 0; index < vertexBuffers.length; index++) {
            var vertexBuffer = vertexBuffers[index];
            var buffer = vertexBuffer.getBuffer();
            if (buffer) {
                renderPass2.setVertexBuffer(index, buffer.underlyingResource, vertexBuffer._validOffsetRange ? 0 : vertexBuffer.byteOffset);
            }
        }
        // bind bind groups
        for (var i = 0; i < bindGroups.length; i++) {
            renderPass2.setBindGroup(i, bindGroups[i]);
        }
        // draw
        var nonCompatMode = !this.compatibilityMode && !this._snapshotRendering.record;
        if (nonCompatMode && this._currentDrawContext.indirectDrawBuffer) {
            this._currentDrawContext.setIndirectData(count, instancesCount || 1, start);
            if (drawType === 0) {
                renderPass2.drawIndexedIndirect(this._currentDrawContext.indirectDrawBuffer, 0);
            }
            else {
                renderPass2.drawIndirect(this._currentDrawContext.indirectDrawBuffer, 0);
            }
        }
        else if (drawType === 0) {
            renderPass2.drawIndexed(count, instancesCount || 1, start, 0, 0);
        }
        else {
            renderPass2.draw(count, instancesCount || 1, start, 0);
        }
        if (nonCompatMode) {
            this._currentDrawContext.fastBundle = renderPass2.finish();
            bundleList.addBundle(this._currentDrawContext.fastBundle);
        }
        this._reportDrawCall();
    };
    /**
     * Draw a list of indexed primitives
     * @param fillMode defines the primitive to use
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    WebGPUEngine.prototype.drawElementsType = function (fillMode, indexStart, indexCount, instancesCount) {
        if (instancesCount === void 0) { instancesCount = 1; }
        this._draw(0, fillMode, indexStart, indexCount, instancesCount);
    };
    /**
     * Draw a list of unindexed primitives
     * @param fillMode defines the primitive to use
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    WebGPUEngine.prototype.drawArraysType = function (fillMode, verticesStart, verticesCount, instancesCount) {
        if (instancesCount === void 0) { instancesCount = 1; }
        this._currentIndexBuffer = null;
        this._draw(1, fillMode, verticesStart, verticesCount, instancesCount);
    };
    //------------------------------------------------------------------------------
    //                              Dispose
    //------------------------------------------------------------------------------
    /**
     * Dispose and release all associated resources
     */
    WebGPUEngine.prototype.dispose = function () {
        var _a, _b, _c;
        (_a = this._mainTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this._mainTextureLastCopy) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this._depthTexture) === null || _c === void 0 ? void 0 : _c.destroy();
        _super.prototype.dispose.call(this);
    };
    //------------------------------------------------------------------------------
    //                              Misc
    //------------------------------------------------------------------------------
    /**
     * Gets the current render width
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render width
     */
    WebGPUEngine.prototype.getRenderWidth = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.width;
        }
        return this._canvas.width;
    };
    /**
     * Gets the current render height
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render height
     */
    WebGPUEngine.prototype.getRenderHeight = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.height;
        }
        return this._canvas.height;
    };
    /**
     * Gets the HTML canvas attached with the current WebGPU context
     * @returns a HTML canvas
     */
    WebGPUEngine.prototype.getRenderingCanvas = function () {
        return this._canvas;
    };
    //------------------------------------------------------------------------------
    //                              Errors
    //------------------------------------------------------------------------------
    /**
     * Get the current error code of the WebGPU context
     * @returns the error code
     */
    WebGPUEngine.prototype.getError = function () {
        // TODO WEBGPU. from the webgpu errors.
        return 0;
    };
    //------------------------------------------------------------------------------
    //                              Unused WebGPU
    //------------------------------------------------------------------------------
    /**
     * @hidden
     */
    WebGPUEngine.prototype.bindSamplers = function () { };
    /**
     * @hidden
     */
    WebGPUEngine.prototype._bindTextureDirectly = function () {
        return false;
    };
    /**
     * Gets a boolean indicating if all created effects are ready
     * @returns always true - No parallel shader compilation
     */
    WebGPUEngine.prototype.areAllEffectsReady = function () {
        return true;
    };
    /**
     * @param pipelineContext
     * @param action
     * @hidden
     */
    WebGPUEngine.prototype._executeWhenRenderingStateIsCompiled = function (pipelineContext, action) {
        // No parallel shader compilation.
        // No Async, so direct launch
        action();
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype._isRenderingStateCompiled = function () {
        // No parallel shader compilation.
        return true;
    };
    /** @hidden */
    WebGPUEngine.prototype._getUnpackAlignement = function () {
        return 1;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype._unpackFlipY = function () { };
    /**
     * @hidden
     */
    WebGPUEngine.prototype._bindUnboundFramebuffer = function () {
        throw "_bindUnboundFramebuffer is not implementedin WebGPU! You probably want to use restoreDefaultFramebuffer or unBindFramebuffer instead";
    };
    // TODO WEBGPU. All of the below should go once engine split with baseEngine.
    /**
     * @hidden
     */
    WebGPUEngine.prototype._getSamplingParameters = function () {
        throw "_getSamplingParameters is not available in WebGPU";
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.getUniforms = function () {
        return [];
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setIntArray = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setIntArray2 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setIntArray3 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setIntArray4 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setArray = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setArray2 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setArray3 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setArray4 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setMatrices = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setMatrix3x3 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setMatrix2x2 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setFloat = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setFloat2 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setFloat3 = function () {
        return false;
    };
    /**
     * @hidden
     */
    WebGPUEngine.prototype.setFloat4 = function () {
        return false;
    };
    // Default glslang options.
    WebGPUEngine._GLSLslangDefaultOptions = {
        jsPath: "https://preview.babylonjs.com/glslang/glslang.js",
        wasmPath: "https://preview.babylonjs.com/glslang/glslang.wasm",
    };
    /** true to enable using TintWASM to convert Spir-V to WGSL */
    WebGPUEngine.UseTWGSL = true;
    return WebGPUEngine;
}(Engine));
export { WebGPUEngine };
//# sourceMappingURL=webgpuEngine.js.map