import { __awaiter, __generator } from "tslib";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { EngineStore } from "./engineStore.js";
import { Effect } from "../Materials/effect.js";
import { _WarnImport } from "../Misc/devTools.js";
import { Observable } from "../Misc/observable.js";
import { DepthCullingState } from "../States/depthCullingState.js";
import { StencilState } from "../States/stencilState.js";
import { AlphaState } from "../States/alphaCullingState.js";

import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture.js";
import { Logger } from "../Misc/logger.js";
import { IsDocumentAvailable, IsWindowObjectExist } from "../Misc/domManagement.js";
import { WebGLShaderProcessor } from "./WebGL/webGLShaderProcessors.js";
import { WebGL2ShaderProcessor } from "./WebGL/webGL2ShaderProcessors.js";
import { WebGLDataBuffer } from "../Meshes/WebGL/webGLDataBuffer.js";
import { WebGLPipelineContext } from "./WebGL/webGLPipelineContext.js";
import { PerformanceConfigurator } from "./performanceConfigurator.js";
import { WebGLHardwareTexture } from "./WebGL/webGLHardwareTexture.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
import { StencilStateComposer } from "../States/stencilStateComposer.js";
import { ShaderLanguage } from "../Materials/shaderLanguage.js";
/**
 * Keeps track of all the buffer info used in engine.
 */
var BufferPointer = /** @class */ (function () {
    function BufferPointer() {
    }
    return BufferPointer;
}());
/**
 * The base engine class (root of all engines)
 */
var ThinEngine = /** @class */ (function () {
    /**
     * Creates a new engine
     * @param canvasOrContext defines the canvas or WebGL context to use for rendering. If you provide a WebGL context, Babylon.js will not hook events on the canvas (like pointers, keyboards, etc...) so no event observables will be available. This is mostly used when Babylon.js is used as a plugin on a system which already used the WebGL context
     * @param antialias defines enable antialiasing (default: false)
     * @param options defines further options to be sent to the getContext() function
     * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
     */
    function ThinEngine(canvasOrContext, antialias, options, adaptToDeviceRatio) {
        var _this = this;
        /** @hidden */
        this._name = "WebGL";
        /**
         * Gets or sets a boolean that indicates if textures must be forced to power of 2 size even if not required
         */
        this.forcePOTTextures = false;
        /**
         * Gets a boolean indicating if the engine is currently rendering in fullscreen mode
         */
        this.isFullscreen = false;
        /**
         * Gets or sets a boolean indicating if back faces must be culled. If false, front faces are culled instead (true by default)
         * If non null, this takes precedence over the value from the material
         */
        this.cullBackFaces = null;
        /**
         * Gets or sets a boolean indicating if the engine must keep rendering even if the window is not in foreground
         */
        this.renderEvenInBackground = true;
        /**
         * Gets or sets a boolean indicating that cache can be kept between frames
         */
        this.preventCacheWipeBetweenFrames = false;
        /** Gets or sets a boolean indicating if the engine should validate programs after compilation */
        this.validateShaderPrograms = false;
        this._useReverseDepthBuffer = false;
        /**
         * Indicates if the z range in NDC space is 0..1 (value: true) or -1..1 (value: false)
         */
        this.isNDCHalfZRange = false;
        /**
         * Indicates that the origin of the texture/framebuffer space is the bottom left corner. If false, the origin is top left
         */
        this.hasOriginBottomLeft = true;
        /**
         * Gets or sets a boolean indicating that uniform buffers must be disabled even if they are supported
         */
        this.disableUniformBuffers = false;
        /**
         * An event triggered when the engine is disposed.
         */
        this.onDisposeObservable = new Observable();
        this._frameId = 0;
        /** @hidden */
        this._uniformBuffers = new Array();
        /** @hidden */
        this._storageBuffers = new Array();
        /** @hidden */
        this._webGLVersion = 1.0;
        this._windowIsBackground = false;
        this._highPrecisionShadersAllowed = true;
        /** @hidden */
        this._badOS = false;
        /** @hidden */
        this._badDesktopOS = false;
        this._renderingQueueLaunched = false;
        this._activeRenderLoops = new Array();
        // Lost context
        /**
         * Observable signaled when a context lost event is raised
         */
        this.onContextLostObservable = new Observable();
        /**
         * Observable signaled when a context restored event is raised
         */
        this.onContextRestoredObservable = new Observable();
        this._contextWasLost = false;
        /** @hidden */
        this._doNotHandleContextLost = false;
        /**
         * Gets or sets a boolean indicating that vertex array object must be disabled even if they are supported
         */
        this.disableVertexArrayObjects = false;
        // States
        /** @hidden */
        this._colorWrite = true;
        /** @hidden */
        this._colorWriteChanged = true;
        /** @hidden */
        this._depthCullingState = new DepthCullingState();
        /** @hidden */
        this._stencilStateComposer = new StencilStateComposer();
        /** @hidden */
        this._stencilState = new StencilState();
        /** @hidden */
        this._alphaState = new AlphaState();
        /** @hidden */
        this._alphaMode = 1;
        /** @hidden */
        this._alphaEquation = 0;
        // Cache
        /** @hidden */
        this._internalTexturesCache = new Array();
        /** @hidden */
        this._renderTargetWrapperCache = new Array();
        /** @hidden */
        this._activeChannel = 0;
        this._currentTextureChannel = -1;
        /** @hidden */
        this._boundTexturesCache = {};
        this._compiledEffects = {};
        this._vertexAttribArraysEnabled = [];
        this._uintIndicesCurrentlySet = false;
        this._currentBoundBuffer = new Array();
        /** @hidden */
        this._currentFramebuffer = null;
        /** @hidden */
        this._dummyFramebuffer = null;
        this._currentBufferPointers = new Array();
        this._currentInstanceLocations = new Array();
        this._currentInstanceBuffers = new Array();
        this._vaoRecordInProgress = false;
        this._mustWipeVertexAttributes = false;
        this._nextFreeTextureSlots = new Array();
        this._maxSimultaneousTextures = 0;
        this._maxMSAASamplesOverride = null;
        this._activeRequests = new Array();
        /** @hidden */
        this._adaptToDeviceRatio = false;
        /** @hidden */
        this._transformTextureUrl = null;
        /**
         * Gets information about the current host
         */
        this.hostInformation = {
            isMobile: false,
        };
        /**
         * Defines whether the engine has been created with the premultipliedAlpha option on or not.
         */
        this.premultipliedAlpha = true;
        /**
         * Observable event triggered before each texture is initialized
         */
        this.onBeforeTextureInitObservable = new Observable();
        /** @hidden */
        this._isWebGPU = false;
        this._snapshotRenderingMode = 0;
        this._viewportCached = { x: 0, y: 0, z: 0, w: 0 };
        this._unpackFlipYCached = null;
        /**
         * In case you are sharing the context with other applications, it might
         * be interested to not cache the unpack flip y state to ensure a consistent
         * value would be set.
         */
        this.enableUnpackFlipYCached = true;
        this._boundUniforms = {};
        var canvas = null;
        options = options || {};
        this._creationOptions = options;
        // Save this off for use in resize().
        this._adaptToDeviceRatio = adaptToDeviceRatio !== null && adaptToDeviceRatio !== void 0 ? adaptToDeviceRatio : false;
        this._stencilStateComposer.stencilGlobal = this._stencilState;
        PerformanceConfigurator.SetMatrixPrecision(!!options.useHighPrecisionMatrix);
        if (!canvasOrContext) {
            return;
        }
        adaptToDeviceRatio = adaptToDeviceRatio || options.adaptToDeviceRatio || false;
        if (canvasOrContext.getContext) {
            canvas = canvasOrContext;
            this._renderingCanvas = canvas;
            if (antialias !== undefined) {
                options.antialias = antialias;
            }
            if (options.deterministicLockstep === undefined) {
                options.deterministicLockstep = false;
            }
            if (options.lockstepMaxSteps === undefined) {
                options.lockstepMaxSteps = 4;
            }
            if (options.timeStep === undefined) {
                options.timeStep = 1 / 60;
            }
            if (options.preserveDrawingBuffer === undefined) {
                options.preserveDrawingBuffer = false;
            }
            if (options.audioEngine === undefined) {
                options.audioEngine = true;
            }
            if (options.audioEngineOptions !== undefined && options.audioEngineOptions.audioContext !== undefined) {
                this._audioContext = options.audioEngineOptions.audioContext;
            }
            if (options.audioEngineOptions !== undefined && options.audioEngineOptions.audioDestination !== undefined) {
                this._audioDestination = options.audioEngineOptions.audioDestination;
            }
            if (options.stencil === undefined) {
                options.stencil = true;
            }
            if (options.premultipliedAlpha === false) {
                this.premultipliedAlpha = false;
            }
            if (options.xrCompatible === undefined) {
                options.xrCompatible = true;
            }
            this._doNotHandleContextLost = options.doNotHandleContextLost ? true : false;
            // Exceptions
            if (navigator && navigator.userAgent) {
                // Function to check if running on mobile device
                this._checkForMobile = function () {
                    var currentUA = navigator.userAgent;
                    _this.hostInformation.isMobile =
                        currentUA.indexOf("Mobile") !== -1 ||
                            // Needed for iOS 13+ detection on iPad (inspired by solution from https://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
                            (currentUA.indexOf("Mac") !== -1 && IsDocumentAvailable() && "ontouchend" in document);
                };
                // Set initial isMobile value
                this._checkForMobile();
                // Set up event listener to check when window is resized (used to get emulator activation to work properly)
                if (IsWindowObjectExist()) {
                    window.addEventListener("resize", this._checkForMobile);
                }
                var ua = navigator.userAgent;
                for (var _i = 0, _a = ThinEngine.ExceptionList; _i < _a.length; _i++) {
                    var exception = _a[_i];
                    var key = exception.key;
                    var targets = exception.targets;
                    var check = new RegExp(key);
                    if (check.test(ua)) {
                        if (exception.capture && exception.captureConstraint) {
                            var capture = exception.capture;
                            var constraint = exception.captureConstraint;
                            var regex = new RegExp(capture);
                            var matches = regex.exec(ua);
                            if (matches && matches.length > 0) {
                                var capturedValue = parseInt(matches[matches.length - 1]);
                                if (capturedValue >= constraint) {
                                    continue;
                                }
                            }
                        }
                        for (var _b = 0, targets_1 = targets; _b < targets_1.length; _b++) {
                            var target = targets_1[_b];
                            switch (target) {
                                case "uniformBuffer":
                                    this.disableUniformBuffers = true;
                                    break;
                                case "vao":
                                    this.disableVertexArrayObjects = true;
                                    break;
                                case "antialias":
                                    options.antialias = false;
                                    break;
                                case "maxMSAASamples":
                                    this._maxMSAASamplesOverride = 1;
                                    break;
                            }
                        }
                    }
                }
            }
            // Context lost
            if (!this._doNotHandleContextLost) {
                this._onContextLost = function (evt) {
                    evt.preventDefault();
                    _this._contextWasLost = true;
                    Logger.Warn("WebGL context lost.");
                    _this.onContextLostObservable.notifyObservers(_this);
                };
                this._onContextRestored = function () {
                    _this._restoreEngineAfterContextLost(_this._initGLContext.bind(_this));
                };
                canvas.addEventListener("webglcontextlost", this._onContextLost, false);
                canvas.addEventListener("webglcontextrestored", this._onContextRestored, false);
                options.powerPreference = "high-performance";
            }
            // Detect if we are running on a faulty buggy desktop OS.
            this._badDesktopOS = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (this._badDesktopOS) {
                options.xrCompatible = false;
            }
            // GL
            if (!options.disableWebGL2Support) {
                try {
                    this._gl = (canvas.getContext("webgl2", options) || canvas.getContext("experimental-webgl2", options));
                    if (this._gl) {
                        this._webGLVersion = 2.0;
                        this._shaderPlatformName = "WEBGL2";
                        // Prevent weird browsers to lie (yeah that happens!)
                        if (!this._gl.deleteQuery) {
                            this._webGLVersion = 1.0;
                            this._shaderPlatformName = "WEBGL1";
                        }
                    }
                }
                catch (e) {
                    // Do nothing
                }
            }
            if (!this._gl) {
                if (!canvas) {
                    throw new Error("The provided canvas is null or undefined.");
                }
                try {
                    this._gl = (canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options));
                }
                catch (e) {
                    throw new Error("WebGL not supported");
                }
            }
            if (!this._gl) {
                throw new Error("WebGL not supported");
            }
        }
        else {
            this._gl = canvasOrContext;
            this._renderingCanvas = this._gl.canvas;
            if (this._gl.renderbufferStorageMultisample) {
                this._webGLVersion = 2.0;
                this._shaderPlatformName = "WEBGL2";
            }
            else {
                this._shaderPlatformName = "WEBGL1";
            }
            var attributes = this._gl.getContextAttributes();
            if (attributes) {
                options.stencil = attributes.stencil;
            }
        }
        // Ensures a consistent color space unpacking of textures cross browser.
        this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this._gl.NONE);
        if (options.useHighPrecisionFloats !== undefined) {
            this._highPrecisionShadersAllowed = options.useHighPrecisionFloats;
        }
        // Viewport
        var devicePixelRatio = IsWindowObjectExist() ? window.devicePixelRatio || 1.0 : 1.0;
        var limitDeviceRatio = options.limitDeviceRatio || devicePixelRatio;
        this._hardwareScalingLevel = adaptToDeviceRatio ? 1.0 / Math.min(limitDeviceRatio, devicePixelRatio) : 1.0;
        this.resize();
        this._isStencilEnable = options.stencil ? true : false;
        this._initGLContext();
        this._initFeatures();
        // Prepare buffer pointers
        for (var i = 0; i < this._caps.maxVertexAttribs; i++) {
            this._currentBufferPointers[i] = new BufferPointer();
        }
        // Shader processor
        this._shaderProcessor = this.webGLVersion > 1 ? new WebGL2ShaderProcessor() : new WebGLShaderProcessor();
        // Detect if we are running on a faulty buggy OS.
        this._badOS = /iPad/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent);
        // Starting with iOS 14, we can trust the browser
        // let matches = navigator.userAgent.match(/Version\/(\d+)/);
        // if (matches && matches.length === 2) {
        //     if (parseInt(matches[1]) >= 14) {
        //         this._badOS = false;
        //     }
        // }
        var versionToLog = "Babylon.js v".concat(ThinEngine.Version);
        console.log(versionToLog + " - ".concat(this.description));
        // Check setAttribute in case of workers
        if (this._renderingCanvas && this._renderingCanvas.setAttribute) {
            this._renderingCanvas.setAttribute("data-engine", versionToLog);
        }
    }
    Object.defineProperty(ThinEngine, "NpmPackage", {
        /**
         * Returns the current npm package of the sdk
         */
        // Not mixed with Version for tooling purpose.
        get: function () {
            return "babylonjs@5.7.0";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine, "Version", {
        /**
         * Returns the current version of the framework
         */
        get: function () {
            return "5.7.0";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "description", {
        /**
         * Returns a string describing the current engine
         */
        get: function () {
            var description = this.name + this.webGLVersion;
            if (this._caps.parallelShaderCompile) {
                description += " - Parallel shader compilation";
            }
            return description;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "name", {
        /**
         * Gets or sets the name of the engine
         */
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "version", {
        /**
         * Returns the version of the engine
         */
        get: function () {
            return this._webGLVersion;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine, "ShadersRepository", {
        /**
         * Gets or sets the relative url used to load shaders if using the engine in non-minified mode
         */
        get: function () {
            return Effect.ShadersRepository;
        },
        set: function (value) {
            Effect.ShadersRepository = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param shaderLanguage
     * @hidden
     */
    ThinEngine.prototype._getShaderProcessor = function (shaderLanguage) {
        return this._shaderProcessor;
    };
    Object.defineProperty(ThinEngine.prototype, "useReverseDepthBuffer", {
        /**
         * Gets or sets a boolean indicating if depth buffer should be reverse, going from far to near.
         * This can provide greater z depth for distant objects.
         */
        get: function () {
            return this._useReverseDepthBuffer;
        },
        set: function (useReverse) {
            if (useReverse === this._useReverseDepthBuffer) {
                return;
            }
            this._useReverseDepthBuffer = useReverse;
            if (useReverse) {
                this._depthCullingState.depthFunc = 518;
            }
            else {
                this._depthCullingState.depthFunc = 515;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "frameId", {
        /**
         * Gets the current frame id
         */
        get: function () {
            return this._frameId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "supportsUniformBuffers", {
        /**
         * Gets a boolean indicating that the engine supports uniform buffers
         * @see https://doc.babylonjs.com/features/webgl2#uniform-buffer-objets
         */
        get: function () {
            return this.webGLVersion > 1 && !this.disableUniformBuffers;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the options used for engine creation
     * @returns EngineOptions object
     */
    ThinEngine.prototype.getCreationOptions = function () {
        return this._creationOptions;
    };
    Object.defineProperty(ThinEngine.prototype, "_shouldUseHighPrecisionShader", {
        /** @hidden */
        get: function () {
            return !!(this._caps.highPrecisionShaderSupported && this._highPrecisionShadersAllowed);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "needPOTTextures", {
        /**
         * Gets a boolean indicating that only power of 2 textures are supported
         * Please note that you can still use non power of 2 textures but in this case the engine will forcefully convert them
         */
        get: function () {
            return this._webGLVersion < 2 || this.forcePOTTextures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "activeRenderLoops", {
        /**
         * Gets the list of current active render loop functions
         * @returns an array with the current render loop functions
         */
        get: function () {
            return this._activeRenderLoops;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "doNotHandleContextLost", {
        /**
         * Gets or sets a boolean indicating if resources should be retained to be able to handle context lost events
         * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#handling-webgl-context-lost
         */
        get: function () {
            return this._doNotHandleContextLost;
        },
        set: function (value) {
            this._doNotHandleContextLost = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "_supportsHardwareTextureRescaling", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "framebufferDimensionsObject", {
        /**
         * sets the object from which width and height will be taken from when getting render width and height
         * Will fallback to the gl object
         * @param dimensions the framebuffer width and height that will be used.
         */
        set: function (dimensions) {
            this._framebufferDimensionsObject = dimensions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "currentViewport", {
        /**
         * Gets the current viewport
         */
        get: function () {
            return this._cachedViewport;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "emptyTexture", {
        /**
         * Gets the default empty texture
         */
        get: function () {
            if (!this._emptyTexture) {
                this._emptyTexture = this.createRawTexture(new Uint8Array(4), 1, 1, 5, false, false, 1);
            }
            return this._emptyTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "emptyTexture3D", {
        /**
         * Gets the default empty 3D texture
         */
        get: function () {
            if (!this._emptyTexture3D) {
                this._emptyTexture3D = this.createRawTexture3D(new Uint8Array(4), 1, 1, 1, 5, false, false, 1);
            }
            return this._emptyTexture3D;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "emptyTexture2DArray", {
        /**
         * Gets the default empty 2D array texture
         */
        get: function () {
            if (!this._emptyTexture2DArray) {
                this._emptyTexture2DArray = this.createRawTexture2DArray(new Uint8Array(4), 1, 1, 1, 5, false, false, 1);
            }
            return this._emptyTexture2DArray;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "emptyCubeTexture", {
        /**
         * Gets the default empty cube texture
         */
        get: function () {
            if (!this._emptyCubeTexture) {
                var faceData = new Uint8Array(4);
                var cubeData = [faceData, faceData, faceData, faceData, faceData, faceData];
                this._emptyCubeTexture = this.createRawCubeTexture(cubeData, 1, 5, 0, false, false, 1);
            }
            return this._emptyCubeTexture;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "isWebGPU", {
        /**
         * Gets a boolean indicating if the engine runs in WebGPU or not.
         */
        get: function () {
            return this._isWebGPU;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "shaderPlatformName", {
        /**
         * Gets the shader platform name used by the effects.
         */
        get: function () {
            return this._shaderPlatformName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "snapshotRendering", {
        /**
         * Enables or disables the snapshot rendering mode
         * Note that the WebGL engine does not support snapshot rendering so setting the value won't have any effect for this engine
         */
        get: function () {
            return false;
        },
        set: function (activate) {
            // WebGL engine does not support snapshot rendering
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "snapshotRenderingMode", {
        /**
         * Gets or sets the snapshot rendering mode
         */
        get: function () {
            return this._snapshotRenderingMode;
        },
        set: function (mode) {
            this._snapshotRenderingMode = mode;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates a new snapshot at the next frame using the current snapshotRenderingMode
     */
    ThinEngine.prototype.snapshotRenderingReset = function () {
        this.snapshotRendering = false;
    };
    ThinEngine._CreateCanvas = function (width, height) {
        if (typeof document === "undefined") {
            return new OffscreenCanvas(width, height);
        }
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };
    /**
     * Create a canvas. This method is overridden by other engines
     * @param width width
     * @param height height
     * @return ICanvas interface
     */
    ThinEngine.prototype.createCanvas = function (width, height) {
        return ThinEngine._CreateCanvas(width, height);
    };
    /**
     * Create an image to use with canvas
     * @return IImage interface
     */
    ThinEngine.prototype.createCanvasImage = function () {
        return document.createElement("img");
    };
    ThinEngine.prototype._restoreEngineAfterContextLost = function (initEngine) {
        var _this = this;
        // Adding a timeout to avoid race condition at browser level
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var depthTest, depthFunc, depthMask, stencilTest;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._dummyFramebuffer = null;
                        depthTest = this._depthCullingState.depthTest;
                        depthFunc = this._depthCullingState.depthFunc;
                        depthMask = this._depthCullingState.depthMask;
                        stencilTest = this._stencilState.stencilTest;
                        // Rebuild context
                        return [4 /*yield*/, initEngine()];
                    case 1:
                        // Rebuild context
                        _b.sent();
                        // Rebuild effects
                        this._rebuildEffects();
                        (_a = this._rebuildComputeEffects) === null || _a === void 0 ? void 0 : _a.call(this);
                        // Rebuild textures
                        this._rebuildInternalTextures();
                        // Rebuild textures
                        this._rebuildRenderTargetWrappers();
                        // Rebuild buffers
                        this._rebuildBuffers();
                        // Cache
                        this.wipeCaches(true);
                        this._depthCullingState.depthTest = depthTest;
                        this._depthCullingState.depthFunc = depthFunc;
                        this._depthCullingState.depthMask = depthMask;
                        this._stencilState.stencilTest = stencilTest;
                        Logger.Warn(this.name + " context successfully restored.");
                        this.onContextRestoredObservable.notifyObservers(this);
                        this._contextWasLost = false;
                        return [2 /*return*/];
                }
            });
        }); }, 0);
    };
    /**
     * Shared initialization across engines types.
     * @param canvas The canvas associated with this instance of the engine.
     * @param doNotHandleTouchAction Defines that engine should ignore modifying touch action attribute and style
     * @param audioEngine Defines if an audio engine should be created by default
     */
    ThinEngine.prototype._sharedInit = function (canvas, doNotHandleTouchAction, audioEngine) {
        this._renderingCanvas = canvas;
    };
    /**
     * @param shaderLanguage
     * @hidden
     */
    ThinEngine.prototype._getShaderProcessingContext = function (shaderLanguage) {
        return null;
    };
    ThinEngine.prototype._rebuildInternalTextures = function () {
        var currentState = this._internalTexturesCache.slice(); // Do a copy because the rebuild will add proxies
        for (var _i = 0, currentState_1 = currentState; _i < currentState_1.length; _i++) {
            var internalTexture = currentState_1[_i];
            internalTexture._rebuild();
        }
    };
    ThinEngine.prototype._rebuildRenderTargetWrappers = function () {
        var currentState = this._renderTargetWrapperCache.slice(); // Do a copy because the rebuild will add proxies
        for (var _i = 0, currentState_2 = currentState; _i < currentState_2.length; _i++) {
            var renderTargetWrapper = currentState_2[_i];
            renderTargetWrapper._rebuild();
        }
    };
    ThinEngine.prototype._rebuildEffects = function () {
        for (var key in this._compiledEffects) {
            var effect = this._compiledEffects[key];
            effect._pipelineContext = null; // because _prepareEffect will try to dispose this pipeline before recreating it and that would lead to webgl errors
            effect._wasPreviouslyReady = false;
            effect._prepareEffect();
        }
        Effect.ResetCache();
    };
    /**
     * Gets a boolean indicating if all created effects are ready
     * @returns true if all effects are ready
     */
    ThinEngine.prototype.areAllEffectsReady = function () {
        for (var key in this._compiledEffects) {
            var effect = this._compiledEffects[key];
            if (!effect.isReady()) {
                return false;
            }
        }
        return true;
    };
    ThinEngine.prototype._rebuildBuffers = function () {
        // Uniforms
        for (var _i = 0, _a = this._uniformBuffers; _i < _a.length; _i++) {
            var uniformBuffer = _a[_i];
            uniformBuffer._rebuild();
        }
        // Storage buffers
        for (var _b = 0, _c = this._storageBuffers; _b < _c.length; _b++) {
            var storageBuffer = _c[_b];
            storageBuffer._rebuild();
        }
    };
    ThinEngine.prototype._initGLContext = function () {
        // Caps
        this._caps = {
            maxTexturesImageUnits: this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS),
            maxCombinedTexturesImageUnits: this._gl.getParameter(this._gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexTextureImageUnits: this._gl.getParameter(this._gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxTextureSize: this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE),
            maxSamples: this._webGLVersion > 1 ? this._gl.getParameter(this._gl.MAX_SAMPLES) : 1,
            maxCubemapTextureSize: this._gl.getParameter(this._gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            maxRenderTextureSize: this._gl.getParameter(this._gl.MAX_RENDERBUFFER_SIZE),
            maxVertexAttribs: this._gl.getParameter(this._gl.MAX_VERTEX_ATTRIBS),
            maxVaryingVectors: this._gl.getParameter(this._gl.MAX_VARYING_VECTORS),
            maxFragmentUniformVectors: this._gl.getParameter(this._gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxVertexUniformVectors: this._gl.getParameter(this._gl.MAX_VERTEX_UNIFORM_VECTORS),
            parallelShaderCompile: this._gl.getExtension("KHR_parallel_shader_compile") || undefined,
            standardDerivatives: this._webGLVersion > 1 || this._gl.getExtension("OES_standard_derivatives") !== null,
            maxAnisotropy: 1,
            astc: this._gl.getExtension("WEBGL_compressed_texture_astc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_astc"),
            bptc: this._gl.getExtension("EXT_texture_compression_bptc") || this._gl.getExtension("WEBKIT_EXT_texture_compression_bptc"),
            s3tc: this._gl.getExtension("WEBGL_compressed_texture_s3tc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc"),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            s3tc_srgb: this._gl.getExtension("WEBGL_compressed_texture_s3tc_srgb") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc_srgb"),
            pvrtc: this._gl.getExtension("WEBGL_compressed_texture_pvrtc") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
            etc1: this._gl.getExtension("WEBGL_compressed_texture_etc1") || this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_etc1"),
            etc2: this._gl.getExtension("WEBGL_compressed_texture_etc") ||
                this._gl.getExtension("WEBKIT_WEBGL_compressed_texture_etc") ||
                this._gl.getExtension("WEBGL_compressed_texture_es3_0"),
            textureAnisotropicFilterExtension: this._gl.getExtension("EXT_texture_filter_anisotropic") ||
                this._gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
                this._gl.getExtension("MOZ_EXT_texture_filter_anisotropic"),
            uintIndices: this._webGLVersion > 1 || this._gl.getExtension("OES_element_index_uint") !== null,
            fragmentDepthSupported: this._webGLVersion > 1 || this._gl.getExtension("EXT_frag_depth") !== null,
            highPrecisionShaderSupported: false,
            timerQuery: this._gl.getExtension("EXT_disjoint_timer_query_webgl2") || this._gl.getExtension("EXT_disjoint_timer_query"),
            supportOcclusionQuery: this._webGLVersion > 1,
            canUseTimestampForTimerQuery: false,
            drawBuffersExtension: false,
            maxMSAASamples: 1,
            colorBufferFloat: !!(this._webGLVersion > 1 && this._gl.getExtension("EXT_color_buffer_float")),
            textureFloat: this._webGLVersion > 1 || this._gl.getExtension("OES_texture_float") ? true : false,
            textureHalfFloat: this._webGLVersion > 1 || this._gl.getExtension("OES_texture_half_float") ? true : false,
            textureHalfFloatRender: false,
            textureFloatLinearFiltering: false,
            textureFloatRender: false,
            textureHalfFloatLinearFiltering: false,
            vertexArrayObject: false,
            instancedArrays: false,
            textureLOD: this._webGLVersion > 1 || this._gl.getExtension("EXT_shader_texture_lod") ? true : false,
            blendMinMax: false,
            multiview: this._gl.getExtension("OVR_multiview2"),
            oculusMultiview: this._gl.getExtension("OCULUS_multiview"),
            depthTextureExtension: false,
            canUseGLInstanceID: this._webGLVersion > 1,
            canUseGLVertexID: this._webGLVersion > 1,
            supportComputeShaders: false,
            supportSRGBBuffers: false,
            supportTransformFeedbacks: this._webGLVersion > 1,
            textureMaxLevel: this._webGLVersion > 1,
            texture2DArrayMaxLayerCount: this._webGLVersion > 1 ? 256 : 128,
        };
        // Infos
        this._glVersion = this._gl.getParameter(this._gl.VERSION);
        var rendererInfo = this._gl.getExtension("WEBGL_debug_renderer_info");
        if (rendererInfo != null) {
            this._glRenderer = this._gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
            this._glVendor = this._gl.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
        }
        if (!this._glVendor) {
            this._glVendor = this._gl.getParameter(this._gl.VENDOR) || "Unknown vendor";
        }
        if (!this._glRenderer) {
            this._glRenderer = this._gl.getParameter(this._gl.RENDERER) || "Unknown renderer";
        }
        // Constants
        if (this._gl.HALF_FLOAT_OES !== 0x8d61) {
            this._gl.HALF_FLOAT_OES = 0x8d61; // Half floating-point type (16-bit).
        }
        if (this._gl.RGBA16F !== 0x881a) {
            this._gl.RGBA16F = 0x881a; // RGBA 16-bit floating-point color-renderable internal sized format.
        }
        if (this._gl.RGBA32F !== 0x8814) {
            this._gl.RGBA32F = 0x8814; // RGBA 32-bit floating-point color-renderable internal sized format.
        }
        if (this._gl.DEPTH24_STENCIL8 !== 35056) {
            this._gl.DEPTH24_STENCIL8 = 35056;
        }
        // Extensions
        if (this._caps.timerQuery) {
            if (this._webGLVersion === 1) {
                this._gl.getQuery = this._caps.timerQuery.getQueryEXT.bind(this._caps.timerQuery);
            }
            this._caps.canUseTimestampForTimerQuery = this._gl.getQuery(this._caps.timerQuery.TIMESTAMP_EXT, this._caps.timerQuery.QUERY_COUNTER_BITS_EXT) > 0;
        }
        this._caps.maxAnisotropy = this._caps.textureAnisotropicFilterExtension
            ? this._gl.getParameter(this._caps.textureAnisotropicFilterExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;
        this._caps.textureFloatLinearFiltering = this._caps.textureFloat && this._gl.getExtension("OES_texture_float_linear") ? true : false;
        this._caps.textureFloatRender = this._caps.textureFloat && this._canRenderToFloatFramebuffer() ? true : false;
        this._caps.textureHalfFloatLinearFiltering =
            this._webGLVersion > 1 || (this._caps.textureHalfFloat && this._gl.getExtension("OES_texture_half_float_linear")) ? true : false;
        // Compressed formats
        if (this._caps.astc) {
            this._gl.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = this._caps.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
        }
        if (this._caps.bptc) {
            this._gl.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = this._caps.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
        }
        if (this._caps.s3tc_srgb) {
            this._gl.COMPRESSED_SRGB_S3TC_DXT1_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_S3TC_DXT1_EXT;
            this._gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
            this._gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = this._caps.s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        }
        // Checks if some of the format renders first to allow the use of webgl inspector.
        if (this._webGLVersion > 1) {
            if (this._gl.HALF_FLOAT_OES !== 0x140b) {
                this._gl.HALF_FLOAT_OES = 0x140b;
            }
        }
        this._caps.textureHalfFloatRender = this._caps.textureHalfFloat && this._canRenderToHalfFloatFramebuffer();
        // Draw buffers
        if (this._webGLVersion > 1) {
            this._caps.drawBuffersExtension = true;
            this._caps.maxMSAASamples = this._maxMSAASamplesOverride !== null ? this._maxMSAASamplesOverride : this._gl.getParameter(this._gl.MAX_SAMPLES);
        }
        else {
            var drawBuffersExtension = this._gl.getExtension("WEBGL_draw_buffers");
            if (drawBuffersExtension !== null) {
                this._caps.drawBuffersExtension = true;
                this._gl.drawBuffers = drawBuffersExtension.drawBuffersWEBGL.bind(drawBuffersExtension);
                this._gl.DRAW_FRAMEBUFFER = this._gl.FRAMEBUFFER;
                for (var i = 0; i < 16; i++) {
                    this._gl["COLOR_ATTACHMENT" + i + "_WEBGL"] = drawBuffersExtension["COLOR_ATTACHMENT" + i + "_WEBGL"];
                }
            }
        }
        // Depth Texture
        if (this._webGLVersion > 1) {
            this._caps.depthTextureExtension = true;
        }
        else {
            var depthTextureExtension = this._gl.getExtension("WEBGL_depth_texture");
            if (depthTextureExtension != null) {
                this._caps.depthTextureExtension = true;
                this._gl.UNSIGNED_INT_24_8 = depthTextureExtension.UNSIGNED_INT_24_8_WEBGL;
            }
        }
        // Vertex array object
        if (this.disableVertexArrayObjects) {
            this._caps.vertexArrayObject = false;
        }
        else if (this._webGLVersion > 1) {
            this._caps.vertexArrayObject = true;
        }
        else {
            var vertexArrayObjectExtension = this._gl.getExtension("OES_vertex_array_object");
            if (vertexArrayObjectExtension != null) {
                this._caps.vertexArrayObject = true;
                this._gl.createVertexArray = vertexArrayObjectExtension.createVertexArrayOES.bind(vertexArrayObjectExtension);
                this._gl.bindVertexArray = vertexArrayObjectExtension.bindVertexArrayOES.bind(vertexArrayObjectExtension);
                this._gl.deleteVertexArray = vertexArrayObjectExtension.deleteVertexArrayOES.bind(vertexArrayObjectExtension);
            }
        }
        // Instances count
        if (this._webGLVersion > 1) {
            this._caps.instancedArrays = true;
        }
        else {
            var instanceExtension = this._gl.getExtension("ANGLE_instanced_arrays");
            if (instanceExtension != null) {
                this._caps.instancedArrays = true;
                this._gl.drawArraysInstanced = instanceExtension.drawArraysInstancedANGLE.bind(instanceExtension);
                this._gl.drawElementsInstanced = instanceExtension.drawElementsInstancedANGLE.bind(instanceExtension);
                this._gl.vertexAttribDivisor = instanceExtension.vertexAttribDivisorANGLE.bind(instanceExtension);
            }
            else {
                this._caps.instancedArrays = false;
            }
        }
        if (this._gl.getShaderPrecisionFormat) {
            var vertexhighp = this._gl.getShaderPrecisionFormat(this._gl.VERTEX_SHADER, this._gl.HIGH_FLOAT);
            var fragmenthighp = this._gl.getShaderPrecisionFormat(this._gl.FRAGMENT_SHADER, this._gl.HIGH_FLOAT);
            if (vertexhighp && fragmenthighp) {
                this._caps.highPrecisionShaderSupported = vertexhighp.precision !== 0 && fragmenthighp.precision !== 0;
            }
        }
        if (this._webGLVersion > 1) {
            this._caps.blendMinMax = true;
        }
        else {
            var blendMinMaxExtension = this._gl.getExtension("EXT_blend_minmax");
            if (blendMinMaxExtension != null) {
                this._caps.blendMinMax = true;
                this._gl.MAX = blendMinMaxExtension.MAX_EXT;
                this._gl.MIN = blendMinMaxExtension.MIN_EXT;
            }
        }
        // sRGB buffers
        // only run this if not already set to true (in the constructor, for example)
        if (!this._caps.supportSRGBBuffers) {
            if (this._webGLVersion > 1) {
                this._caps.supportSRGBBuffers = true;
            }
            else {
                var sRGBExtension = this._gl.getExtension("EXT_sRGB");
                if (sRGBExtension != null) {
                    this._caps.supportSRGBBuffers = true;
                    this._gl.SRGB = sRGBExtension.SRGB_EXT;
                    this._gl.SRGB8 = sRGBExtension.SRGB_ALPHA_EXT;
                    this._gl.SRGB8_ALPHA8 = sRGBExtension.SRGB_ALPHA_EXT;
                }
            }
            // take into account the forced state that was provided in options
            // When the issue in angle/chrome is fixed the flag should be taken into account only when it is explicitly defined
            this._caps.supportSRGBBuffers = this._caps.supportSRGBBuffers && !!(this._creationOptions && this._creationOptions.forceSRGBBufferSupportState);
        }
        // Depth buffer
        this._depthCullingState.depthTest = true;
        this._depthCullingState.depthFunc = this._gl.LEQUAL;
        this._depthCullingState.depthMask = true;
        // Texture maps
        this._maxSimultaneousTextures = this._caps.maxCombinedTexturesImageUnits;
        for (var slot = 0; slot < this._maxSimultaneousTextures; slot++) {
            this._nextFreeTextureSlots.push(slot);
        }
    };
    ThinEngine.prototype._initFeatures = function () {
        this._features = {
            forceBitmapOverHTMLImageElement: false,
            supportRenderAndCopyToLodForFloatTextures: this._webGLVersion !== 1,
            supportDepthStencilTexture: this._webGLVersion !== 1,
            supportShadowSamplers: this._webGLVersion !== 1,
            uniformBufferHardCheckMatrix: false,
            allowTexturePrefiltering: this._webGLVersion !== 1,
            trackUbosInFrame: false,
            checkUbosContentBeforeUpload: false,
            supportCSM: this._webGLVersion !== 1,
            basisNeedsPOT: this._webGLVersion === 1,
            support3DTextures: this._webGLVersion !== 1,
            needTypeSuffixInShaderConstants: this._webGLVersion !== 1,
            supportMSAA: this._webGLVersion !== 1,
            supportSSAO2: this._webGLVersion !== 1,
            supportExtendedTextureFormats: this._webGLVersion !== 1,
            supportSwitchCaseInShader: this._webGLVersion !== 1,
            supportSyncTextureRead: true,
            needsInvertingBitmap: true,
            useUBOBindingCache: true,
            needShaderCodeInlining: false,
            needToAlwaysBindUniformBuffers: false,
            supportRenderPasses: false,
            _collectUbosUpdatedInFrame: false,
        };
    };
    Object.defineProperty(ThinEngine.prototype, "webGLVersion", {
        /**
         * Gets version of the current webGL context
         * Keep it for back compat - use version instead
         */
        get: function () {
            return this._webGLVersion;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets a string identifying the name of the class
     * @returns "Engine" string
     */
    ThinEngine.prototype.getClassName = function () {
        return "ThinEngine";
    };
    Object.defineProperty(ThinEngine.prototype, "isStencilEnable", {
        /**
         * Returns true if the stencil buffer has been enabled through the creation option of the context.
         */
        get: function () {
            return this._isStencilEnable;
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    ThinEngine.prototype._prepareWorkingCanvas = function () {
        if (this._workingCanvas) {
            return;
        }
        this._workingCanvas = this.createCanvas(1, 1);
        var context = this._workingCanvas.getContext("2d");
        if (context) {
            this._workingContext = context;
        }
    };
    /**
     * Reset the texture cache to empty state
     */
    ThinEngine.prototype.resetTextureCache = function () {
        for (var key in this._boundTexturesCache) {
            if (!Object.prototype.hasOwnProperty.call(this._boundTexturesCache, key)) {
                continue;
            }
            this._boundTexturesCache[key] = null;
        }
        this._currentTextureChannel = -1;
    };
    /**
     * Gets an object containing information about the current engine context
     * @returns an object containing the vendor, the renderer and the version of the current engine context
     */
    ThinEngine.prototype.getInfo = function () {
        return this.getGlInfo();
    };
    /**
     * Gets an object containing information about the current webGL context
     * @returns an object containing the vendor, the renderer and the version of the current webGL context
     */
    ThinEngine.prototype.getGlInfo = function () {
        return {
            vendor: this._glVendor,
            renderer: this._glRenderer,
            version: this._glVersion,
        };
    };
    /**
     * Defines the hardware scaling level.
     * By default the hardware scaling level is computed from the window device ratio.
     * if level = 1 then the engine will render at the exact resolution of the canvas. If level = 0.5 then the engine will render at twice the size of the canvas.
     * @param level defines the level to use
     */
    ThinEngine.prototype.setHardwareScalingLevel = function (level) {
        this._hardwareScalingLevel = level;
        this.resize();
    };
    /**
     * Gets the current hardware scaling level.
     * By default the hardware scaling level is computed from the window device ratio.
     * if level = 1 then the engine will render at the exact resolution of the canvas. If level = 0.5 then the engine will render at twice the size of the canvas.
     * @returns a number indicating the current hardware scaling level
     */
    ThinEngine.prototype.getHardwareScalingLevel = function () {
        return this._hardwareScalingLevel;
    };
    /**
     * Gets the list of loaded textures
     * @returns an array containing all loaded textures
     */
    ThinEngine.prototype.getLoadedTexturesCache = function () {
        return this._internalTexturesCache;
    };
    /**
     * Gets the object containing all engine capabilities
     * @returns the EngineCapabilities object
     */
    ThinEngine.prototype.getCaps = function () {
        return this._caps;
    };
    /**
     * stop executing a render loop function and remove it from the execution array
     * @param renderFunction defines the function to be removed. If not provided all functions will be removed.
     */
    ThinEngine.prototype.stopRenderLoop = function (renderFunction) {
        if (!renderFunction) {
            this._activeRenderLoops = [];
            return;
        }
        var index = this._activeRenderLoops.indexOf(renderFunction);
        if (index >= 0) {
            this._activeRenderLoops.splice(index, 1);
        }
    };
    /** @hidden */
    ThinEngine.prototype._renderLoop = function () {
        if (!this._contextWasLost) {
            var shouldRender = true;
            if (!this.renderEvenInBackground && this._windowIsBackground) {
                shouldRender = false;
            }
            if (shouldRender) {
                // Start new frame
                this.beginFrame();
                for (var index = 0; index < this._activeRenderLoops.length; index++) {
                    var renderFunction = this._activeRenderLoops[index];
                    renderFunction();
                }
                // Present
                this.endFrame();
            }
        }
        if (this._activeRenderLoops.length > 0) {
            this._frameHandler = this._queueNewFrame(this._boundRenderFunction, this.getHostWindow());
        }
        else {
            this._renderingQueueLaunched = false;
        }
    };
    /**
     * Gets the HTML canvas attached with the current webGL context
     * @returns a HTML canvas
     */
    ThinEngine.prototype.getRenderingCanvas = function () {
        return this._renderingCanvas;
    };
    /**
     * Gets the audio context specified in engine initialization options
     * @returns an Audio Context
     */
    ThinEngine.prototype.getAudioContext = function () {
        return this._audioContext;
    };
    /**
     * Gets the audio destination specified in engine initialization options
     * @returns an audio destination node
     */
    ThinEngine.prototype.getAudioDestination = function () {
        return this._audioDestination;
    };
    /**
     * Gets host window
     * @returns the host window object
     */
    ThinEngine.prototype.getHostWindow = function () {
        if (!IsWindowObjectExist()) {
            return null;
        }
        if (this._renderingCanvas && this._renderingCanvas.ownerDocument && this._renderingCanvas.ownerDocument.defaultView) {
            return this._renderingCanvas.ownerDocument.defaultView;
        }
        return window;
    };
    /**
     * Gets the current render width
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render width
     */
    ThinEngine.prototype.getRenderWidth = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.width;
        }
        return this._framebufferDimensionsObject ? this._framebufferDimensionsObject.framebufferWidth : this._gl.drawingBufferWidth;
    };
    /**
     * Gets the current render height
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the current render height
     */
    ThinEngine.prototype.getRenderHeight = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.height;
        }
        return this._framebufferDimensionsObject ? this._framebufferDimensionsObject.framebufferHeight : this._gl.drawingBufferHeight;
    };
    /**
     * Can be used to override the current requestAnimationFrame requester.
     * @param bindedRenderFunction
     * @param requester
     * @hidden
     */
    ThinEngine.prototype._queueNewFrame = function (bindedRenderFunction, requester) {
        return ThinEngine.QueueNewFrame(bindedRenderFunction, requester);
    };
    /**
     * Register and execute a render loop. The engine can have more than one render function
     * @param renderFunction defines the function to continuously execute
     */
    ThinEngine.prototype.runRenderLoop = function (renderFunction) {
        if (this._activeRenderLoops.indexOf(renderFunction) !== -1) {
            return;
        }
        this._activeRenderLoops.push(renderFunction);
        if (!this._renderingQueueLaunched) {
            this._renderingQueueLaunched = true;
            this._boundRenderFunction = this._renderLoop.bind(this);
            this._frameHandler = this._queueNewFrame(this._boundRenderFunction, this.getHostWindow());
        }
    };
    /**
     * Clear the current render buffer or the current render target (if any is set up)
     * @param color defines the color to use
     * @param backBuffer defines if the back buffer must be cleared
     * @param depth defines if the depth buffer must be cleared
     * @param stencil defines if the stencil buffer must be cleared
     */
    ThinEngine.prototype.clear = function (color, backBuffer, depth, stencil) {
        if (stencil === void 0) { stencil = false; }
        var useStencilGlobalOnly = this.stencilStateComposer.useStencilGlobalOnly;
        this.stencilStateComposer.useStencilGlobalOnly = true; // make sure the stencil mask is coming from the global stencil and not from a material (effect) which would currently be in effect
        this.applyStates();
        this.stencilStateComposer.useStencilGlobalOnly = useStencilGlobalOnly;
        var mode = 0;
        if (backBuffer && color) {
            this._gl.clearColor(color.r, color.g, color.b, color.a !== undefined ? color.a : 1.0);
            mode |= this._gl.COLOR_BUFFER_BIT;
        }
        if (depth) {
            if (this.useReverseDepthBuffer) {
                this._depthCullingState.depthFunc = this._gl.GEQUAL;
                this._gl.clearDepth(0.0);
            }
            else {
                this._gl.clearDepth(1.0);
            }
            mode |= this._gl.DEPTH_BUFFER_BIT;
        }
        if (stencil) {
            this._gl.clearStencil(0);
            mode |= this._gl.STENCIL_BUFFER_BIT;
        }
        this._gl.clear(mode);
    };
    /**
     * @param x
     * @param y
     * @param width
     * @param height
     * @hidden
     */
    ThinEngine.prototype._viewport = function (x, y, width, height) {
        if (x !== this._viewportCached.x || y !== this._viewportCached.y || width !== this._viewportCached.z || height !== this._viewportCached.w) {
            this._viewportCached.x = x;
            this._viewportCached.y = y;
            this._viewportCached.z = width;
            this._viewportCached.w = height;
            this._gl.viewport(x, y, width, height);
        }
    };
    /**
     * Set the WebGL's viewport
     * @param viewport defines the viewport element to be used
     * @param requiredWidth defines the width required for rendering. If not provided the rendering canvas' width is used
     * @param requiredHeight defines the height required for rendering. If not provided the rendering canvas' height is used
     */
    ThinEngine.prototype.setViewport = function (viewport, requiredWidth, requiredHeight) {
        var width = requiredWidth || this.getRenderWidth();
        var height = requiredHeight || this.getRenderHeight();
        var x = viewport.x || 0;
        var y = viewport.y || 0;
        this._cachedViewport = viewport;
        this._viewport(x * width, y * height, width * viewport.width, height * viewport.height);
    };
    /**
     * Begin a new frame
     */
    ThinEngine.prototype.beginFrame = function () { };
    /**
     * Enf the current frame
     */
    ThinEngine.prototype.endFrame = function () {
        // Force a flush in case we are using a bad OS.
        if (this._badOS) {
            this.flushFramebuffer();
        }
        this._frameId++;
    };
    /**
     * Resize the view according to the canvas' size
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     */
    ThinEngine.prototype.resize = function (forceSetSize) {
        if (forceSetSize === void 0) { forceSetSize = false; }
        var width;
        var height;
        // Requery hardware scaling level to handle zoomed-in resizing.
        if (this._adaptToDeviceRatio) {
            var devicePixelRatio_1 = IsWindowObjectExist() ? window.devicePixelRatio || 1.0 : 1.0;
            var limitDeviceRatio = this._creationOptions.limitDeviceRatio || devicePixelRatio_1;
            this._hardwareScalingLevel = this._adaptToDeviceRatio ? 1.0 / Math.min(limitDeviceRatio, devicePixelRatio_1) : 1.0;
        }
        if (IsWindowObjectExist()) {
            width = this._renderingCanvas ? this._renderingCanvas.clientWidth || this._renderingCanvas.width : window.innerWidth;
            height = this._renderingCanvas ? this._renderingCanvas.clientHeight || this._renderingCanvas.height : window.innerHeight;
        }
        else {
            width = this._renderingCanvas ? this._renderingCanvas.width : 100;
            height = this._renderingCanvas ? this._renderingCanvas.height : 100;
        }
        this.setSize(width / this._hardwareScalingLevel, height / this._hardwareScalingLevel, forceSetSize);
    };
    /**
     * Force a specific size of the canvas
     * @param width defines the new canvas' width
     * @param height defines the new canvas' height
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     * @returns true if the size was changed
     */
    ThinEngine.prototype.setSize = function (width, height, forceSetSize) {
        if (forceSetSize === void 0) { forceSetSize = false; }
        if (!this._renderingCanvas) {
            return false;
        }
        width = width | 0;
        height = height | 0;
        if (!forceSetSize && this._renderingCanvas.width === width && this._renderingCanvas.height === height) {
            return false;
        }
        this._renderingCanvas.width = width;
        this._renderingCanvas.height = height;
        return true;
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
    ThinEngine.prototype.bindFramebuffer = function (texture, faceIndex, requiredWidth, requiredHeight, forceFullscreenViewport, lodLevel, layer) {
        var _a, _b, _c, _d, _e;
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lodLevel === void 0) { lodLevel = 0; }
        if (layer === void 0) { layer = 0; }
        var webglRTWrapper = texture;
        if (this._currentRenderTarget) {
            this.unBindFramebuffer(this._currentRenderTarget);
        }
        this._currentRenderTarget = texture;
        this._bindUnboundFramebuffer(webglRTWrapper._MSAAFramebuffer ? webglRTWrapper._MSAAFramebuffer : webglRTWrapper._framebuffer);
        var gl = this._gl;
        if (texture.is2DArray) {
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, (_a = texture.texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource, lodLevel, layer);
        }
        else if (texture.isCube) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex, (_b = texture.texture._hardwareTexture) === null || _b === void 0 ? void 0 : _b.underlyingResource, lodLevel);
        }
        var depthStencilTexture = texture._depthStencilTexture;
        if (depthStencilTexture) {
            var attachment = texture._depthStencilTextureWithStencil ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
            if (texture.is2DArray) {
                gl.framebufferTextureLayer(gl.FRAMEBUFFER, attachment, (_c = depthStencilTexture._hardwareTexture) === null || _c === void 0 ? void 0 : _c.underlyingResource, lodLevel, layer);
            }
            else if (texture.isCube) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex, (_d = depthStencilTexture._hardwareTexture) === null || _d === void 0 ? void 0 : _d.underlyingResource, lodLevel);
            }
            else {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, (_e = depthStencilTexture._hardwareTexture) === null || _e === void 0 ? void 0 : _e.underlyingResource, lodLevel);
            }
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
     * Set various states to the webGL context
     * @param culling defines culling state: true to enable culling, false to disable it
     * @param zOffset defines the value to apply to zOffset (0 by default)
     * @param force defines if states must be applied even if cache is up to date
     * @param reverseSide defines if culling must be reversed (CCW if false, CW if true)
     * @param cullBackFaces true to cull back faces, false to cull front faces (if culling is enabled)
     * @param stencil stencil states to set
     * @param zOffsetUnits defines the value to apply to zOffsetUnits (0 by default)
     */
    ThinEngine.prototype.setState = function (culling, zOffset, force, reverseSide, cullBackFaces, stencil, zOffsetUnits) {
        var _a, _b;
        if (zOffset === void 0) { zOffset = 0; }
        if (reverseSide === void 0) { reverseSide = false; }
        if (zOffsetUnits === void 0) { zOffsetUnits = 0; }
        // Culling
        if (this._depthCullingState.cull !== culling || force) {
            this._depthCullingState.cull = culling;
        }
        // Cull face
        var cullFace = ((_b = (_a = this.cullBackFaces) !== null && _a !== void 0 ? _a : cullBackFaces) !== null && _b !== void 0 ? _b : true) ? this._gl.BACK : this._gl.FRONT;
        if (this._depthCullingState.cullFace !== cullFace || force) {
            this._depthCullingState.cullFace = cullFace;
        }
        // Z offset
        this.setZOffset(zOffset);
        this.setZOffsetUnits(zOffsetUnits);
        // Front face
        var frontFace = reverseSide ? this._gl.CW : this._gl.CCW;
        if (this._depthCullingState.frontFace !== frontFace || force) {
            this._depthCullingState.frontFace = frontFace;
        }
        this._stencilStateComposer.stencilMaterial = stencil;
    };
    /**
     * Set the z offset Factor to apply to current rendering
     * @param value defines the offset to apply
     */
    ThinEngine.prototype.setZOffset = function (value) {
        this._depthCullingState.zOffset = this.useReverseDepthBuffer ? -value : value;
    };
    /**
     * Gets the current value of the zOffset Factor
     * @returns the current zOffset Factor state
     */
    ThinEngine.prototype.getZOffset = function () {
        var zOffset = this._depthCullingState.zOffset;
        return this.useReverseDepthBuffer ? -zOffset : zOffset;
    };
    /**
     * Set the z offset Units to apply to current rendering
     * @param value defines the offset to apply
     */
    ThinEngine.prototype.setZOffsetUnits = function (value) {
        this._depthCullingState.zOffsetUnits = this.useReverseDepthBuffer ? -value : value;
    };
    /**
     * Gets the current value of the zOffset Units
     * @returns the current zOffset Units state
     */
    ThinEngine.prototype.getZOffsetUnits = function () {
        var zOffsetUnits = this._depthCullingState.zOffsetUnits;
        return this.useReverseDepthBuffer ? -zOffsetUnits : zOffsetUnits;
    };
    /**
     * @param framebuffer
     * @hidden
     */
    ThinEngine.prototype._bindUnboundFramebuffer = function (framebuffer) {
        if (this._currentFramebuffer !== framebuffer) {
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
            this._currentFramebuffer = framebuffer;
        }
    };
    /** @hidden */
    ThinEngine.prototype._currentFrameBufferIsDefaultFrameBuffer = function () {
        return this._currentFramebuffer === null;
    };
    /**
     * Generates the mipmaps for a texture
     * @param texture texture to generate the mipmaps for
     */
    ThinEngine.prototype.generateMipmaps = function (texture) {
        this._bindTextureDirectly(this._gl.TEXTURE_2D, texture, true);
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
        this._bindTextureDirectly(this._gl.TEXTURE_2D, null);
    };
    /**
     * Unbind the current render target texture from the webGL context
     * @param texture defines the render target wrapper to unbind
     * @param disableGenerateMipMaps defines a boolean indicating that mipmaps must not be generated
     * @param onBeforeUnbind defines a function which will be called before the effective unbind
     */
    ThinEngine.prototype.unBindFramebuffer = function (texture, disableGenerateMipMaps, onBeforeUnbind) {
        var _a;
        if (disableGenerateMipMaps === void 0) { disableGenerateMipMaps = false; }
        var webglRTWrapper = texture;
        this._currentRenderTarget = null;
        // If MSAA, we need to bitblt back to main texture
        var gl = this._gl;
        if (webglRTWrapper._MSAAFramebuffer) {
            if (texture.isMulti) {
                // This texture is part of a MRT texture, we need to treat all attachments
                this.unBindMultiColorAttachmentFramebuffer(texture, disableGenerateMipMaps, onBeforeUnbind);
                return;
            }
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, webglRTWrapper._MSAAFramebuffer);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, webglRTWrapper._framebuffer);
            gl.blitFramebuffer(0, 0, texture.width, texture.height, 0, 0, texture.width, texture.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        }
        if (((_a = texture.texture) === null || _a === void 0 ? void 0 : _a.generateMipMaps) && !disableGenerateMipMaps && !texture.isCube) {
            this.generateMipmaps(texture.texture);
        }
        if (onBeforeUnbind) {
            if (webglRTWrapper._MSAAFramebuffer) {
                // Bind the correct framebuffer
                this._bindUnboundFramebuffer(webglRTWrapper._framebuffer);
            }
            onBeforeUnbind();
        }
        this._bindUnboundFramebuffer(null);
    };
    /**
     * Force a webGL flush (ie. a flush of all waiting webGL commands)
     */
    ThinEngine.prototype.flushFramebuffer = function () {
        this._gl.flush();
    };
    /**
     * Unbind the current render target and bind the default framebuffer
     */
    ThinEngine.prototype.restoreDefaultFramebuffer = function () {
        if (this._currentRenderTarget) {
            this.unBindFramebuffer(this._currentRenderTarget);
        }
        else {
            this._bindUnboundFramebuffer(null);
        }
        if (this._cachedViewport) {
            this.setViewport(this._cachedViewport);
        }
        this.wipeCaches();
    };
    // VBOs
    /** @hidden */
    ThinEngine.prototype._resetVertexBufferBinding = function () {
        this.bindArrayBuffer(null);
        this._cachedVertexBuffers = null;
    };
    /**
     * Creates a vertex buffer
     * @param data the data for the vertex buffer
     * @returns the new WebGL static buffer
     */
    ThinEngine.prototype.createVertexBuffer = function (data) {
        return this._createVertexBuffer(data, this._gl.STATIC_DRAW);
    };
    ThinEngine.prototype._createVertexBuffer = function (data, usage) {
        var vbo = this._gl.createBuffer();
        if (!vbo) {
            throw new Error("Unable to create vertex buffer");
        }
        var dataBuffer = new WebGLDataBuffer(vbo);
        this.bindArrayBuffer(dataBuffer);
        if (data instanceof Array) {
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(data), usage);
        }
        else {
            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, usage);
        }
        this._resetVertexBufferBinding();
        dataBuffer.references = 1;
        return dataBuffer;
    };
    /**
     * Creates a dynamic vertex buffer
     * @param data the data for the dynamic vertex buffer
     * @returns the new WebGL dynamic buffer
     */
    ThinEngine.prototype.createDynamicVertexBuffer = function (data) {
        return this._createVertexBuffer(data, this._gl.DYNAMIC_DRAW);
    };
    ThinEngine.prototype._resetIndexBufferBinding = function () {
        this.bindIndexBuffer(null);
        this._cachedIndexBuffer = null;
    };
    /**
     * Creates a new index buffer
     * @param indices defines the content of the index buffer
     * @param updatable defines if the index buffer must be updatable
     * @returns a new webGL buffer
     */
    ThinEngine.prototype.createIndexBuffer = function (indices, updatable) {
        var vbo = this._gl.createBuffer();
        var dataBuffer = new WebGLDataBuffer(vbo);
        if (!vbo) {
            throw new Error("Unable to create index buffer");
        }
        this.bindIndexBuffer(dataBuffer);
        var data = this._normalizeIndexData(indices);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, data, updatable ? this._gl.DYNAMIC_DRAW : this._gl.STATIC_DRAW);
        this._resetIndexBufferBinding();
        dataBuffer.references = 1;
        dataBuffer.is32Bits = data.BYTES_PER_ELEMENT === 4;
        return dataBuffer;
    };
    ThinEngine.prototype._normalizeIndexData = function (indices) {
        var bytesPerElement = indices.BYTES_PER_ELEMENT;
        if (bytesPerElement === 2) {
            return indices;
        }
        // Check 32 bit support
        if (this._caps.uintIndices) {
            if (indices instanceof Uint32Array) {
                return indices;
            }
            else {
                // number[] or Int32Array, check if 32 bit is necessary
                for (var index = 0; index < indices.length; index++) {
                    if (indices[index] >= 65535) {
                        return new Uint32Array(indices);
                    }
                }
                return new Uint16Array(indices);
            }
        }
        // No 32 bit support, force conversion to 16 bit (values greater 16 bit are lost)
        return new Uint16Array(indices);
    };
    /**
     * Bind a webGL buffer to the webGL context
     * @param buffer defines the buffer to bind
     */
    ThinEngine.prototype.bindArrayBuffer = function (buffer) {
        if (!this._vaoRecordInProgress) {
            this._unbindVertexArrayObject();
        }
        this._bindBuffer(buffer, this._gl.ARRAY_BUFFER);
    };
    /**
     * Bind a specific block at a given index in a specific shader program
     * @param pipelineContext defines the pipeline context to use
     * @param blockName defines the block name
     * @param index defines the index where to bind the block
     */
    ThinEngine.prototype.bindUniformBlock = function (pipelineContext, blockName, index) {
        var program = pipelineContext.program;
        var uniformLocation = this._gl.getUniformBlockIndex(program, blockName);
        this._gl.uniformBlockBinding(program, uniformLocation, index);
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ThinEngine.prototype.bindIndexBuffer = function (buffer) {
        if (!this._vaoRecordInProgress) {
            this._unbindVertexArrayObject();
        }
        this._bindBuffer(buffer, this._gl.ELEMENT_ARRAY_BUFFER);
    };
    ThinEngine.prototype._bindBuffer = function (buffer, target) {
        if (this._vaoRecordInProgress || this._currentBoundBuffer[target] !== buffer) {
            this._gl.bindBuffer(target, buffer ? buffer.underlyingResource : null);
            this._currentBoundBuffer[target] = buffer;
        }
    };
    /**
     * update the bound buffer with the given data
     * @param data defines the data to update
     */
    ThinEngine.prototype.updateArrayBuffer = function (data) {
        this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, data);
    };
    ThinEngine.prototype._vertexAttribPointer = function (buffer, indx, size, type, normalized, stride, offset) {
        var pointer = this._currentBufferPointers[indx];
        if (!pointer) {
            return;
        }
        var changed = false;
        if (!pointer.active) {
            changed = true;
            pointer.active = true;
            pointer.index = indx;
            pointer.size = size;
            pointer.type = type;
            pointer.normalized = normalized;
            pointer.stride = stride;
            pointer.offset = offset;
            pointer.buffer = buffer;
        }
        else {
            if (pointer.buffer !== buffer) {
                pointer.buffer = buffer;
                changed = true;
            }
            if (pointer.size !== size) {
                pointer.size = size;
                changed = true;
            }
            if (pointer.type !== type) {
                pointer.type = type;
                changed = true;
            }
            if (pointer.normalized !== normalized) {
                pointer.normalized = normalized;
                changed = true;
            }
            if (pointer.stride !== stride) {
                pointer.stride = stride;
                changed = true;
            }
            if (pointer.offset !== offset) {
                pointer.offset = offset;
                changed = true;
            }
        }
        if (changed || this._vaoRecordInProgress) {
            this.bindArrayBuffer(buffer);
            this._gl.vertexAttribPointer(indx, size, type, normalized, stride, offset);
        }
    };
    /**
     * @param indexBuffer
     * @hidden
     */
    ThinEngine.prototype._bindIndexBufferWithCache = function (indexBuffer) {
        if (indexBuffer == null) {
            return;
        }
        if (this._cachedIndexBuffer !== indexBuffer) {
            this._cachedIndexBuffer = indexBuffer;
            this.bindIndexBuffer(indexBuffer);
            this._uintIndicesCurrentlySet = indexBuffer.is32Bits;
        }
    };
    ThinEngine.prototype._bindVertexBuffersAttributes = function (vertexBuffers, effect, overrideVertexBuffers) {
        var attributes = effect.getAttributesNames();
        if (!this._vaoRecordInProgress) {
            this._unbindVertexArrayObject();
        }
        this.unbindAllAttributes();
        for (var index = 0; index < attributes.length; index++) {
            var order = effect.getAttributeLocation(index);
            if (order >= 0) {
                var ai = attributes[index];
                var vertexBuffer = null;
                if (overrideVertexBuffers) {
                    vertexBuffer = overrideVertexBuffers[ai];
                }
                if (!vertexBuffer) {
                    vertexBuffer = vertexBuffers[ai];
                }
                if (!vertexBuffer) {
                    continue;
                }
                this._gl.enableVertexAttribArray(order);
                if (!this._vaoRecordInProgress) {
                    this._vertexAttribArraysEnabled[order] = true;
                }
                var buffer = vertexBuffer.getBuffer();
                if (buffer) {
                    this._vertexAttribPointer(buffer, order, vertexBuffer.getSize(), vertexBuffer.type, vertexBuffer.normalized, vertexBuffer.byteStride, vertexBuffer.byteOffset);
                    if (vertexBuffer.getIsInstanced()) {
                        this._gl.vertexAttribDivisor(order, vertexBuffer.getInstanceDivisor());
                        if (!this._vaoRecordInProgress) {
                            this._currentInstanceLocations.push(order);
                            this._currentInstanceBuffers.push(buffer);
                        }
                    }
                }
            }
        }
    };
    /**
     * Records a vertex array object
     * @see https://doc.babylonjs.com/features/webgl2#vertex-array-objects
     * @param vertexBuffers defines the list of vertex buffers to store
     * @param indexBuffer defines the index buffer to store
     * @param effect defines the effect to store
     * @param overrideVertexBuffers defines optional list of avertex buffers that overrides the entries in vertexBuffers
     * @returns the new vertex array object
     */
    ThinEngine.prototype.recordVertexArrayObject = function (vertexBuffers, indexBuffer, effect, overrideVertexBuffers) {
        var vao = this._gl.createVertexArray();
        this._vaoRecordInProgress = true;
        this._gl.bindVertexArray(vao);
        this._mustWipeVertexAttributes = true;
        this._bindVertexBuffersAttributes(vertexBuffers, effect, overrideVertexBuffers);
        this.bindIndexBuffer(indexBuffer);
        this._vaoRecordInProgress = false;
        this._gl.bindVertexArray(null);
        return vao;
    };
    /**
     * Bind a specific vertex array object
     * @see https://doc.babylonjs.com/features/webgl2#vertex-array-objects
     * @param vertexArrayObject defines the vertex array object to bind
     * @param indexBuffer defines the index buffer to bind
     */
    ThinEngine.prototype.bindVertexArrayObject = function (vertexArrayObject, indexBuffer) {
        if (this._cachedVertexArrayObject !== vertexArrayObject) {
            this._cachedVertexArrayObject = vertexArrayObject;
            this._gl.bindVertexArray(vertexArrayObject);
            this._cachedVertexBuffers = null;
            this._cachedIndexBuffer = null;
            this._uintIndicesCurrentlySet = indexBuffer != null && indexBuffer.is32Bits;
            this._mustWipeVertexAttributes = true;
        }
    };
    /**
     * Bind webGl buffers directly to the webGL context
     * @param vertexBuffer defines the vertex buffer to bind
     * @param indexBuffer defines the index buffer to bind
     * @param vertexDeclaration defines the vertex declaration to use with the vertex buffer
     * @param vertexStrideSize defines the vertex stride of the vertex buffer
     * @param effect defines the effect associated with the vertex buffer
     */
    ThinEngine.prototype.bindBuffersDirectly = function (vertexBuffer, indexBuffer, vertexDeclaration, vertexStrideSize, effect) {
        if (this._cachedVertexBuffers !== vertexBuffer || this._cachedEffectForVertexBuffers !== effect) {
            this._cachedVertexBuffers = vertexBuffer;
            this._cachedEffectForVertexBuffers = effect;
            var attributesCount = effect.getAttributesCount();
            this._unbindVertexArrayObject();
            this.unbindAllAttributes();
            var offset = 0;
            for (var index = 0; index < attributesCount; index++) {
                if (index < vertexDeclaration.length) {
                    var order = effect.getAttributeLocation(index);
                    if (order >= 0) {
                        this._gl.enableVertexAttribArray(order);
                        this._vertexAttribArraysEnabled[order] = true;
                        this._vertexAttribPointer(vertexBuffer, order, vertexDeclaration[index], this._gl.FLOAT, false, vertexStrideSize, offset);
                    }
                    offset += vertexDeclaration[index] * 4;
                }
            }
        }
        this._bindIndexBufferWithCache(indexBuffer);
    };
    ThinEngine.prototype._unbindVertexArrayObject = function () {
        if (!this._cachedVertexArrayObject) {
            return;
        }
        this._cachedVertexArrayObject = null;
        this._gl.bindVertexArray(null);
    };
    /**
     * Bind a list of vertex buffers to the webGL context
     * @param vertexBuffers defines the list of vertex buffers to bind
     * @param indexBuffer defines the index buffer to bind
     * @param effect defines the effect associated with the vertex buffers
     * @param overrideVertexBuffers defines optional list of avertex buffers that overrides the entries in vertexBuffers
     */
    ThinEngine.prototype.bindBuffers = function (vertexBuffers, indexBuffer, effect, overrideVertexBuffers) {
        if (this._cachedVertexBuffers !== vertexBuffers || this._cachedEffectForVertexBuffers !== effect) {
            this._cachedVertexBuffers = vertexBuffers;
            this._cachedEffectForVertexBuffers = effect;
            this._bindVertexBuffersAttributes(vertexBuffers, effect, overrideVertexBuffers);
        }
        this._bindIndexBufferWithCache(indexBuffer);
    };
    /**
     * Unbind all instance attributes
     */
    ThinEngine.prototype.unbindInstanceAttributes = function () {
        var boundBuffer;
        for (var i = 0, ul = this._currentInstanceLocations.length; i < ul; i++) {
            var instancesBuffer = this._currentInstanceBuffers[i];
            if (boundBuffer != instancesBuffer && instancesBuffer.references) {
                boundBuffer = instancesBuffer;
                this.bindArrayBuffer(instancesBuffer);
            }
            var offsetLocation = this._currentInstanceLocations[i];
            this._gl.vertexAttribDivisor(offsetLocation, 0);
        }
        this._currentInstanceBuffers.length = 0;
        this._currentInstanceLocations.length = 0;
    };
    /**
     * Release and free the memory of a vertex array object
     * @param vao defines the vertex array object to delete
     */
    ThinEngine.prototype.releaseVertexArrayObject = function (vao) {
        this._gl.deleteVertexArray(vao);
    };
    /**
     * @param buffer
     * @hidden
     */
    ThinEngine.prototype._releaseBuffer = function (buffer) {
        buffer.references--;
        if (buffer.references === 0) {
            this._deleteBuffer(buffer);
            return true;
        }
        return false;
    };
    ThinEngine.prototype._deleteBuffer = function (buffer) {
        this._gl.deleteBuffer(buffer.underlyingResource);
    };
    /**
     * Update the content of a webGL buffer used with instantiation and bind it to the webGL context
     * @param instancesBuffer defines the webGL buffer to update and bind
     * @param data defines the data to store in the buffer
     * @param offsetLocations defines the offsets or attributes information used to determine where data must be stored in the buffer
     */
    ThinEngine.prototype.updateAndBindInstancesBuffer = function (instancesBuffer, data, offsetLocations) {
        this.bindArrayBuffer(instancesBuffer);
        if (data) {
            this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, data);
        }
        if (offsetLocations[0].index !== undefined) {
            this.bindInstancesBuffer(instancesBuffer, offsetLocations, true);
        }
        else {
            for (var index = 0; index < 4; index++) {
                var offsetLocation = offsetLocations[index];
                if (!this._vertexAttribArraysEnabled[offsetLocation]) {
                    this._gl.enableVertexAttribArray(offsetLocation);
                    this._vertexAttribArraysEnabled[offsetLocation] = true;
                }
                this._vertexAttribPointer(instancesBuffer, offsetLocation, 4, this._gl.FLOAT, false, 64, index * 16);
                this._gl.vertexAttribDivisor(offsetLocation, 1);
                this._currentInstanceLocations.push(offsetLocation);
                this._currentInstanceBuffers.push(instancesBuffer);
            }
        }
    };
    /**
     * Bind the content of a webGL buffer used with instantiation
     * @param instancesBuffer defines the webGL buffer to bind
     * @param attributesInfo defines the offsets or attributes information used to determine where data must be stored in the buffer
     * @param computeStride defines Whether to compute the strides from the info or use the default 0
     */
    ThinEngine.prototype.bindInstancesBuffer = function (instancesBuffer, attributesInfo, computeStride) {
        if (computeStride === void 0) { computeStride = true; }
        this.bindArrayBuffer(instancesBuffer);
        var stride = 0;
        if (computeStride) {
            for (var i = 0; i < attributesInfo.length; i++) {
                var ai = attributesInfo[i];
                stride += ai.attributeSize * 4;
            }
        }
        for (var i = 0; i < attributesInfo.length; i++) {
            var ai = attributesInfo[i];
            if (ai.index === undefined) {
                ai.index = this._currentEffect.getAttributeLocationByName(ai.attributeName);
            }
            if (ai.index < 0) {
                continue;
            }
            if (!this._vertexAttribArraysEnabled[ai.index]) {
                this._gl.enableVertexAttribArray(ai.index);
                this._vertexAttribArraysEnabled[ai.index] = true;
            }
            this._vertexAttribPointer(instancesBuffer, ai.index, ai.attributeSize, ai.attributeType || this._gl.FLOAT, ai.normalized || false, stride, ai.offset);
            this._gl.vertexAttribDivisor(ai.index, ai.divisor === undefined ? 1 : ai.divisor);
            this._currentInstanceLocations.push(ai.index);
            this._currentInstanceBuffers.push(instancesBuffer);
        }
    };
    /**
     * Disable the instance attribute corresponding to the name in parameter
     * @param name defines the name of the attribute to disable
     */
    ThinEngine.prototype.disableInstanceAttributeByName = function (name) {
        if (!this._currentEffect) {
            return;
        }
        var attributeLocation = this._currentEffect.getAttributeLocationByName(name);
        this.disableInstanceAttribute(attributeLocation);
    };
    /**
     * Disable the instance attribute corresponding to the location in parameter
     * @param attributeLocation defines the attribute location of the attribute to disable
     */
    ThinEngine.prototype.disableInstanceAttribute = function (attributeLocation) {
        var shouldClean = false;
        var index;
        while ((index = this._currentInstanceLocations.indexOf(attributeLocation)) !== -1) {
            this._currentInstanceLocations.splice(index, 1);
            this._currentInstanceBuffers.splice(index, 1);
            shouldClean = true;
            index = this._currentInstanceLocations.indexOf(attributeLocation);
        }
        if (shouldClean) {
            this._gl.vertexAttribDivisor(attributeLocation, 0);
            this.disableAttributeByIndex(attributeLocation);
        }
    };
    /**
     * Disable the attribute corresponding to the location in parameter
     * @param attributeLocation defines the attribute location of the attribute to disable
     */
    ThinEngine.prototype.disableAttributeByIndex = function (attributeLocation) {
        this._gl.disableVertexAttribArray(attributeLocation);
        this._vertexAttribArraysEnabled[attributeLocation] = false;
        this._currentBufferPointers[attributeLocation].active = false;
    };
    /**
     * Send a draw order
     * @param useTriangles defines if triangles must be used to draw (else wireframe will be used)
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    ThinEngine.prototype.draw = function (useTriangles, indexStart, indexCount, instancesCount) {
        this.drawElementsType(useTriangles ? 0 : 1, indexStart, indexCount, instancesCount);
    };
    /**
     * Draw a list of points
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    ThinEngine.prototype.drawPointClouds = function (verticesStart, verticesCount, instancesCount) {
        this.drawArraysType(2, verticesStart, verticesCount, instancesCount);
    };
    /**
     * Draw a list of unindexed primitives
     * @param useTriangles defines if triangles must be used to draw (else wireframe will be used)
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    ThinEngine.prototype.drawUnIndexed = function (useTriangles, verticesStart, verticesCount, instancesCount) {
        this.drawArraysType(useTriangles ? 0 : 1, verticesStart, verticesCount, instancesCount);
    };
    /**
     * Draw a list of indexed primitives
     * @param fillMode defines the primitive to use
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    ThinEngine.prototype.drawElementsType = function (fillMode, indexStart, indexCount, instancesCount) {
        // Apply states
        this.applyStates();
        this._reportDrawCall();
        // Render
        var drawMode = this._drawMode(fillMode);
        var indexFormat = this._uintIndicesCurrentlySet ? this._gl.UNSIGNED_INT : this._gl.UNSIGNED_SHORT;
        var mult = this._uintIndicesCurrentlySet ? 4 : 2;
        if (instancesCount) {
            this._gl.drawElementsInstanced(drawMode, indexCount, indexFormat, indexStart * mult, instancesCount);
        }
        else {
            this._gl.drawElements(drawMode, indexCount, indexFormat, indexStart * mult);
        }
    };
    /**
     * Draw a list of unindexed primitives
     * @param fillMode defines the primitive to use
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    ThinEngine.prototype.drawArraysType = function (fillMode, verticesStart, verticesCount, instancesCount) {
        // Apply states
        this.applyStates();
        this._reportDrawCall();
        var drawMode = this._drawMode(fillMode);
        if (instancesCount) {
            this._gl.drawArraysInstanced(drawMode, verticesStart, verticesCount, instancesCount);
        }
        else {
            this._gl.drawArrays(drawMode, verticesStart, verticesCount);
        }
    };
    ThinEngine.prototype._drawMode = function (fillMode) {
        switch (fillMode) {
            // Triangle views
            case 0:
                return this._gl.TRIANGLES;
            case 2:
                return this._gl.POINTS;
            case 1:
                return this._gl.LINES;
            // Draw modes
            case 3:
                return this._gl.POINTS;
            case 4:
                return this._gl.LINES;
            case 5:
                return this._gl.LINE_LOOP;
            case 6:
                return this._gl.LINE_STRIP;
            case 7:
                return this._gl.TRIANGLE_STRIP;
            case 8:
                return this._gl.TRIANGLE_FAN;
            default:
                return this._gl.TRIANGLES;
        }
    };
    /** @hidden */
    ThinEngine.prototype._reportDrawCall = function () {
        // Will be implemented by children
    };
    // Shaders
    /**
     * @param effect
     * @hidden
     */
    ThinEngine.prototype._releaseEffect = function (effect) {
        if (this._compiledEffects[effect._key]) {
            delete this._compiledEffects[effect._key];
            var pipelineContext = effect.getPipelineContext();
            if (pipelineContext) {
                this._deletePipelineContext(pipelineContext);
            }
        }
    };
    /**
     * @param pipelineContext
     * @hidden
     */
    ThinEngine.prototype._deletePipelineContext = function (pipelineContext) {
        var webGLPipelineContext = pipelineContext;
        if (webGLPipelineContext && webGLPipelineContext.program) {
            webGLPipelineContext.program.__SPECTOR_rebuildProgram = null;
            this._gl.deleteProgram(webGLPipelineContext.program);
        }
    };
    /** @hidden */
    ThinEngine.prototype._getGlobalDefines = function (defines) {
        if (defines) {
            if (this.isNDCHalfZRange) {
                defines["IS_NDC_HALF_ZRANGE"] = "";
            }
            else {
                delete defines["IS_NDC_HALF_ZRANGE"];
            }
            if (this.useReverseDepthBuffer) {
                defines["USE_REVERSE_DEPTHBUFFER"] = "";
            }
            else {
                delete defines["USE_REVERSE_DEPTHBUFFER"];
            }
            return;
        }
        else {
            var s = "";
            if (this.isNDCHalfZRange) {
                s += "#define IS_NDC_HALF_ZRANGE";
            }
            if (this.useReverseDepthBuffer) {
                if (s) {
                    s += "\n";
                }
                s += "#define USE_REVERSE_DEPTHBUFFER";
            }
            return s;
        }
    };
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
    ThinEngine.prototype.createEffect = function (baseName, attributesNamesOrOptions, uniformsNamesOrEngine, samplers, defines, fallbacks, onCompiled, onError, indexParameters, shaderLanguage) {
        var _a;
        if (shaderLanguage === void 0) { shaderLanguage = ShaderLanguage.GLSL; }
        var vertex = baseName.vertexElement || baseName.vertex || baseName.vertexToken || baseName.vertexSource || baseName;
        var fragment = baseName.fragmentElement || baseName.fragment || baseName.fragmentToken || baseName.fragmentSource || baseName;
        var globalDefines = this._getGlobalDefines();
        var fullDefines = (_a = defines !== null && defines !== void 0 ? defines : attributesNamesOrOptions.defines) !== null && _a !== void 0 ? _a : "";
        if (globalDefines) {
            fullDefines += globalDefines;
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ThinEngine._ConcatenateShader = function (source, defines, shaderVersion) {
        if (shaderVersion === void 0) { shaderVersion = ""; }
        return shaderVersion + (defines ? defines + "\n" : "") + source;
    };
    ThinEngine.prototype._compileShader = function (source, type, defines, shaderVersion) {
        return this._compileRawShader(ThinEngine._ConcatenateShader(source, defines, shaderVersion), type);
    };
    ThinEngine.prototype._compileRawShader = function (source, type) {
        var gl = this._gl;
        var shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
        if (!shader) {
            var error = gl.NO_ERROR;
            var tempError = gl.NO_ERROR;
            while ((tempError = gl.getError()) !== gl.NO_ERROR) {
                error = tempError;
            }
            throw new Error("Something went wrong while creating a gl ".concat(type, " shader object. gl error=").concat(error, ", gl isContextLost=").concat(gl.isContextLost(), ", _contextWasLost=").concat(this._contextWasLost));
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };
    /**
     * @param shader
     * @hidden
     */
    ThinEngine.prototype._getShaderSource = function (shader) {
        return this._gl.getShaderSource(shader);
    };
    /**
     * Directly creates a webGL program
     * @param pipelineContext  defines the pipeline context to attach to
     * @param vertexCode defines the vertex shader code to use
     * @param fragmentCode defines the fragment shader code to use
     * @param context defines the webGL context to use (if not set, the current one will be used)
     * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
     * @returns the new webGL program
     */
    ThinEngine.prototype.createRawShaderProgram = function (pipelineContext, vertexCode, fragmentCode, context, transformFeedbackVaryings) {
        if (transformFeedbackVaryings === void 0) { transformFeedbackVaryings = null; }
        context = context || this._gl;
        var vertexShader = this._compileRawShader(vertexCode, "vertex");
        var fragmentShader = this._compileRawShader(fragmentCode, "fragment");
        return this._createShaderProgram(pipelineContext, vertexShader, fragmentShader, context, transformFeedbackVaryings);
    };
    /**
     * Creates a webGL program
     * @param pipelineContext  defines the pipeline context to attach to
     * @param vertexCode  defines the vertex shader code to use
     * @param fragmentCode defines the fragment shader code to use
     * @param defines defines the string containing the defines to use to compile the shaders
     * @param context defines the webGL context to use (if not set, the current one will be used)
     * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
     * @returns the new webGL program
     */
    ThinEngine.prototype.createShaderProgram = function (pipelineContext, vertexCode, fragmentCode, defines, context, transformFeedbackVaryings) {
        if (transformFeedbackVaryings === void 0) { transformFeedbackVaryings = null; }
        context = context || this._gl;
        var shaderVersion = this._webGLVersion > 1 ? "#version 300 es\n#define WEBGL2 \n" : "";
        var vertexShader = this._compileShader(vertexCode, "vertex", defines, shaderVersion);
        var fragmentShader = this._compileShader(fragmentCode, "fragment", defines, shaderVersion);
        return this._createShaderProgram(pipelineContext, vertexShader, fragmentShader, context, transformFeedbackVaryings);
    };
    /**
     * Inline functions in shader code that are marked to be inlined
     * @param code code to inline
     * @returns inlined code
     */
    ThinEngine.prototype.inlineShaderCode = function (code) {
        // no inlining needed in the WebGL engine
        return code;
    };
    /**
     * Creates a new pipeline context
     * @param shaderProcessingContext defines the shader processing context used during the processing if available
     * @returns the new pipeline
     */
    ThinEngine.prototype.createPipelineContext = function (shaderProcessingContext) {
        var pipelineContext = new WebGLPipelineContext();
        pipelineContext.engine = this;
        if (this._caps.parallelShaderCompile) {
            pipelineContext.isParallelCompiled = true;
        }
        return pipelineContext;
    };
    /**
     * Creates a new material context
     * @returns the new context
     */
    ThinEngine.prototype.createMaterialContext = function () {
        return undefined;
    };
    /**
     * Creates a new draw context
     * @returns the new context
     */
    ThinEngine.prototype.createDrawContext = function () {
        return undefined;
    };
    ThinEngine.prototype._createShaderProgram = function (pipelineContext, vertexShader, fragmentShader, context, transformFeedbackVaryings) {
        if (transformFeedbackVaryings === void 0) { transformFeedbackVaryings = null; }
        var shaderProgram = context.createProgram();
        pipelineContext.program = shaderProgram;
        if (!shaderProgram) {
            throw new Error("Unable to create program");
        }
        context.attachShader(shaderProgram, vertexShader);
        context.attachShader(shaderProgram, fragmentShader);
        context.linkProgram(shaderProgram);
        pipelineContext.context = context;
        pipelineContext.vertexShader = vertexShader;
        pipelineContext.fragmentShader = fragmentShader;
        if (!pipelineContext.isParallelCompiled) {
            this._finalizePipelineContext(pipelineContext);
        }
        return shaderProgram;
    };
    ThinEngine.prototype._finalizePipelineContext = function (pipelineContext) {
        var context = pipelineContext.context;
        var vertexShader = pipelineContext.vertexShader;
        var fragmentShader = pipelineContext.fragmentShader;
        var program = pipelineContext.program;
        var linked = context.getProgramParameter(program, context.LINK_STATUS);
        if (!linked) {
            // Get more info
            // Vertex
            if (!this._gl.getShaderParameter(vertexShader, this._gl.COMPILE_STATUS)) {
                var log = this._gl.getShaderInfoLog(vertexShader);
                if (log) {
                    pipelineContext.vertexCompilationError = log;
                    throw new Error("VERTEX SHADER " + log);
                }
            }
            // Fragment
            if (!this._gl.getShaderParameter(fragmentShader, this._gl.COMPILE_STATUS)) {
                var log = this._gl.getShaderInfoLog(fragmentShader);
                if (log) {
                    pipelineContext.fragmentCompilationError = log;
                    throw new Error("FRAGMENT SHADER " + log);
                }
            }
            var error = context.getProgramInfoLog(program);
            if (error) {
                pipelineContext.programLinkError = error;
                throw new Error(error);
            }
        }
        if (this.validateShaderPrograms) {
            context.validateProgram(program);
            var validated = context.getProgramParameter(program, context.VALIDATE_STATUS);
            if (!validated) {
                var error = context.getProgramInfoLog(program);
                if (error) {
                    pipelineContext.programValidationError = error;
                    throw new Error(error);
                }
            }
        }
        context.deleteShader(vertexShader);
        context.deleteShader(fragmentShader);
        pipelineContext.vertexShader = undefined;
        pipelineContext.fragmentShader = undefined;
        if (pipelineContext.onCompiled) {
            pipelineContext.onCompiled();
            pipelineContext.onCompiled = undefined;
        }
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
     * @param transformFeedbackVaryings
     * @param key
     * @hidden
     */
    ThinEngine.prototype._preparePipelineContext = function (pipelineContext, vertexSourceCode, fragmentSourceCode, createAsRaw, rawVertexSourceCode, rawFragmentSourceCode, rebuildRebind, defines, transformFeedbackVaryings, key) {
        var webGLRenderingState = pipelineContext;
        if (createAsRaw) {
            webGLRenderingState.program = this.createRawShaderProgram(webGLRenderingState, vertexSourceCode, fragmentSourceCode, undefined, transformFeedbackVaryings);
        }
        else {
            webGLRenderingState.program = this.createShaderProgram(webGLRenderingState, vertexSourceCode, fragmentSourceCode, defines, undefined, transformFeedbackVaryings);
        }
        webGLRenderingState.program.__SPECTOR_rebuildProgram = rebuildRebind;
    };
    /**
     * @param pipelineContext
     * @hidden
     */
    ThinEngine.prototype._isRenderingStateCompiled = function (pipelineContext) {
        var webGLPipelineContext = pipelineContext;
        if (this._gl.getProgramParameter(webGLPipelineContext.program, this._caps.parallelShaderCompile.COMPLETION_STATUS_KHR)) {
            this._finalizePipelineContext(webGLPipelineContext);
            return true;
        }
        return false;
    };
    /**
     * @param pipelineContext
     * @param action
     * @hidden
     */
    ThinEngine.prototype._executeWhenRenderingStateIsCompiled = function (pipelineContext, action) {
        var webGLPipelineContext = pipelineContext;
        if (!webGLPipelineContext.isParallelCompiled) {
            action();
            return;
        }
        var oldHandler = webGLPipelineContext.onCompiled;
        if (oldHandler) {
            webGLPipelineContext.onCompiled = function () {
                oldHandler();
                action();
            };
        }
        else {
            webGLPipelineContext.onCompiled = action;
        }
    };
    /**
     * Gets the list of webGL uniform locations associated with a specific program based on a list of uniform names
     * @param pipelineContext defines the pipeline context to use
     * @param uniformsNames defines the list of uniform names
     * @returns an array of webGL uniform locations
     */
    ThinEngine.prototype.getUniforms = function (pipelineContext, uniformsNames) {
        var results = new Array();
        var webGLPipelineContext = pipelineContext;
        for (var index = 0; index < uniformsNames.length; index++) {
            results.push(this._gl.getUniformLocation(webGLPipelineContext.program, uniformsNames[index]));
        }
        return results;
    };
    /**
     * Gets the list of active attributes for a given webGL program
     * @param pipelineContext defines the pipeline context to use
     * @param attributesNames defines the list of attribute names to get
     * @returns an array of indices indicating the offset of each attribute
     */
    ThinEngine.prototype.getAttributes = function (pipelineContext, attributesNames) {
        var results = [];
        var webGLPipelineContext = pipelineContext;
        for (var index = 0; index < attributesNames.length; index++) {
            try {
                results.push(this._gl.getAttribLocation(webGLPipelineContext.program, attributesNames[index]));
            }
            catch (e) {
                results.push(-1);
            }
        }
        return results;
    };
    /**
     * Activates an effect, making it the current one (ie. the one used for rendering)
     * @param effect defines the effect to activate
     */
    ThinEngine.prototype.enableEffect = function (effect) {
        effect = effect !== null && DrawWrapper.IsWrapper(effect) ? effect.effect : effect; // get only the effect, we don't need a Wrapper in the WebGL engine
        if (!effect || effect === this._currentEffect) {
            return;
        }
        this._stencilStateComposer.stencilMaterial = undefined;
        effect = effect;
        // Use program
        this.bindSamplers(effect);
        this._currentEffect = effect;
        if (effect.onBind) {
            effect.onBind(effect);
        }
        if (effect._onBindObservable) {
            effect._onBindObservable.notifyObservers(effect);
        }
    };
    /**
     * Set the value of an uniform to a number (int)
     * @param uniform defines the webGL uniform location where to store the value
     * @param value defines the int number to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setInt = function (uniform, value) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform1i(uniform, value);
        return true;
    };
    /**
     * Set the value of an uniform to a int2
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setInt2 = function (uniform, x, y) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform2i(uniform, x, y);
        return true;
    };
    /**
     * Set the value of an uniform to a int3
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setInt3 = function (uniform, x, y, z) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform3i(uniform, x, y, z);
        return true;
    };
    /**
     * Set the value of an uniform to a int4
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @param w defines the 4th component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setInt4 = function (uniform, x, y, z, w) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform4i(uniform, x, y, z, w);
        return true;
    };
    /**
     * Set the value of an uniform to an array of int32
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setIntArray = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform1iv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of int32 (stored as vec2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setIntArray2 = function (uniform, array) {
        if (!uniform || array.length % 2 !== 0) {
            return false;
        }
        this._gl.uniform2iv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of int32 (stored as vec3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setIntArray3 = function (uniform, array) {
        if (!uniform || array.length % 3 !== 0) {
            return false;
        }
        this._gl.uniform3iv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of int32 (stored as vec4)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of int32 to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setIntArray4 = function (uniform, array) {
        if (!uniform || array.length % 4 !== 0) {
            return false;
        }
        this._gl.uniform4iv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of number
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setArray = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        if (array.length < 1) {
            return false;
        }
        this._gl.uniform1fv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of number (stored as vec2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setArray2 = function (uniform, array) {
        if (!uniform || array.length % 2 !== 0) {
            return false;
        }
        this._gl.uniform2fv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of number (stored as vec3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setArray3 = function (uniform, array) {
        if (!uniform || array.length % 3 !== 0) {
            return false;
        }
        this._gl.uniform3fv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of number (stored as vec4)
     * @param uniform defines the webGL uniform location where to store the value
     * @param array defines the array of number to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setArray4 = function (uniform, array) {
        if (!uniform || array.length % 4 !== 0) {
            return false;
        }
        this._gl.uniform4fv(uniform, array);
        return true;
    };
    /**
     * Set the value of an uniform to an array of float32 (stored as matrices)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrices defines the array of float32 to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setMatrices = function (uniform, matrices) {
        if (!uniform) {
            return false;
        }
        this._gl.uniformMatrix4fv(uniform, false, matrices);
        return true;
    };
    /**
     * Set the value of an uniform to a matrix (3x3)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrix defines the Float32Array representing the 3x3 matrix to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setMatrix3x3 = function (uniform, matrix) {
        if (!uniform) {
            return false;
        }
        this._gl.uniformMatrix3fv(uniform, false, matrix);
        return true;
    };
    /**
     * Set the value of an uniform to a matrix (2x2)
     * @param uniform defines the webGL uniform location where to store the value
     * @param matrix defines the Float32Array representing the 2x2 matrix to store
     * @returns true if the value was set
     */
    ThinEngine.prototype.setMatrix2x2 = function (uniform, matrix) {
        if (!uniform) {
            return false;
        }
        this._gl.uniformMatrix2fv(uniform, false, matrix);
        return true;
    };
    /**
     * Set the value of an uniform to a number (float)
     * @param uniform defines the webGL uniform location where to store the value
     * @param value defines the float number to store
     * @returns true if the value was transferred
     */
    ThinEngine.prototype.setFloat = function (uniform, value) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform1f(uniform, value);
        return true;
    };
    /**
     * Set the value of an uniform to a vec2
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setFloat2 = function (uniform, x, y) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform2f(uniform, x, y);
        return true;
    };
    /**
     * Set the value of an uniform to a vec3
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setFloat3 = function (uniform, x, y, z) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform3f(uniform, x, y, z);
        return true;
    };
    /**
     * Set the value of an uniform to a vec4
     * @param uniform defines the webGL uniform location where to store the value
     * @param x defines the 1st component of the value
     * @param y defines the 2nd component of the value
     * @param z defines the 3rd component of the value
     * @param w defines the 4th component of the value
     * @returns true if the value was set
     */
    ThinEngine.prototype.setFloat4 = function (uniform, x, y, z, w) {
        if (!uniform) {
            return false;
        }
        this._gl.uniform4f(uniform, x, y, z, w);
        return true;
    };
    // States
    /**
     * Apply all cached states (depth, culling, stencil and alpha)
     */
    ThinEngine.prototype.applyStates = function () {
        this._depthCullingState.apply(this._gl);
        this._stencilStateComposer.apply(this._gl);
        this._alphaState.apply(this._gl);
        if (this._colorWriteChanged) {
            this._colorWriteChanged = false;
            var enable = this._colorWrite;
            this._gl.colorMask(enable, enable, enable, enable);
        }
    };
    /**
     * Enable or disable color writing
     * @param enable defines the state to set
     */
    ThinEngine.prototype.setColorWrite = function (enable) {
        if (enable !== this._colorWrite) {
            this._colorWriteChanged = true;
            this._colorWrite = enable;
        }
    };
    /**
     * Gets a boolean indicating if color writing is enabled
     * @returns the current color writing state
     */
    ThinEngine.prototype.getColorWrite = function () {
        return this._colorWrite;
    };
    Object.defineProperty(ThinEngine.prototype, "depthCullingState", {
        /**
         * Gets the depth culling state manager
         */
        get: function () {
            return this._depthCullingState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "alphaState", {
        /**
         * Gets the alpha state manager
         */
        get: function () {
            return this._alphaState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "stencilState", {
        /**
         * Gets the stencil state manager
         */
        get: function () {
            return this._stencilState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine.prototype, "stencilStateComposer", {
        /**
         * Gets the stencil state composer
         */
        get: function () {
            return this._stencilStateComposer;
        },
        enumerable: false,
        configurable: true
    });
    // Textures
    /**
     * Clears the list of texture accessible through engine.
     * This can help preventing texture load conflict due to name collision.
     */
    ThinEngine.prototype.clearInternalTexturesCache = function () {
        this._internalTexturesCache = [];
    };
    /**
     * Force the entire cache to be cleared
     * You should not have to use this function unless your engine needs to share the webGL context with another engine
     * @param bruteForce defines a boolean to force clearing ALL caches (including stencil, detoh and alpha states)
     */
    ThinEngine.prototype.wipeCaches = function (bruteForce) {
        if (this.preventCacheWipeBetweenFrames && !bruteForce) {
            return;
        }
        this._currentEffect = null;
        this._viewportCached.x = 0;
        this._viewportCached.y = 0;
        this._viewportCached.z = 0;
        this._viewportCached.w = 0;
        // Done before in case we clean the attributes
        this._unbindVertexArrayObject();
        if (bruteForce) {
            this._currentProgram = null;
            this.resetTextureCache();
            this._stencilStateComposer.reset();
            this._depthCullingState.reset();
            this._depthCullingState.depthFunc = this._gl.LEQUAL;
            this._alphaState.reset();
            this._alphaMode = 1;
            this._alphaEquation = 0;
            this._colorWrite = true;
            this._colorWriteChanged = true;
            this._unpackFlipYCached = null;
            this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, this._gl.NONE);
            this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
            this._mustWipeVertexAttributes = true;
            this.unbindAllAttributes();
        }
        this._resetVertexBufferBinding();
        this._cachedIndexBuffer = null;
        this._cachedEffectForVertexBuffers = null;
        this.bindIndexBuffer(null);
    };
    /**
     * @param samplingMode
     * @param generateMipMaps
     * @hidden
     */
    ThinEngine.prototype._getSamplingParameters = function (samplingMode, generateMipMaps) {
        var gl = this._gl;
        var magFilter = gl.NEAREST;
        var minFilter = gl.NEAREST;
        switch (samplingMode) {
            case 11:
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_NEAREST;
                }
                else {
                    minFilter = gl.LINEAR;
                }
                break;
            case 3:
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_LINEAR;
                }
                else {
                    minFilter = gl.LINEAR;
                }
                break;
            case 8:
                magFilter = gl.NEAREST;
                if (generateMipMaps) {
                    minFilter = gl.NEAREST_MIPMAP_LINEAR;
                }
                else {
                    minFilter = gl.NEAREST;
                }
                break;
            case 4:
                magFilter = gl.NEAREST;
                if (generateMipMaps) {
                    minFilter = gl.NEAREST_MIPMAP_NEAREST;
                }
                else {
                    minFilter = gl.NEAREST;
                }
                break;
            case 5:
                magFilter = gl.NEAREST;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_NEAREST;
                }
                else {
                    minFilter = gl.LINEAR;
                }
                break;
            case 6:
                magFilter = gl.NEAREST;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_LINEAR;
                }
                else {
                    minFilter = gl.LINEAR;
                }
                break;
            case 7:
                magFilter = gl.NEAREST;
                minFilter = gl.LINEAR;
                break;
            case 1:
                magFilter = gl.NEAREST;
                minFilter = gl.NEAREST;
                break;
            case 9:
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.NEAREST_MIPMAP_NEAREST;
                }
                else {
                    minFilter = gl.NEAREST;
                }
                break;
            case 10:
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.NEAREST_MIPMAP_LINEAR;
                }
                else {
                    minFilter = gl.NEAREST;
                }
                break;
            case 2:
                magFilter = gl.LINEAR;
                minFilter = gl.LINEAR;
                break;
            case 12:
                magFilter = gl.LINEAR;
                minFilter = gl.NEAREST;
                break;
        }
        return {
            min: minFilter,
            mag: magFilter,
        };
    };
    /** @hidden */
    ThinEngine.prototype._createTexture = function () {
        var texture = this._gl.createTexture();
        if (!texture) {
            throw new Error("Unable to create texture");
        }
        return texture;
    };
    /** @hidden */
    ThinEngine.prototype._createHardwareTexture = function () {
        return new WebGLHardwareTexture(this._createTexture(), this._gl);
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
    ThinEngine.prototype._createInternalTexture = function (size, options, delayGPUTextureCreation, source) {
        if (delayGPUTextureCreation === void 0) { delayGPUTextureCreation = true; }
        if (source === void 0) { source = InternalTextureSource.Unknown; }
        var fullOptions = {};
        if (options !== undefined && typeof options === "object") {
            fullOptions.generateMipMaps = options.generateMipMaps;
            fullOptions.type = options.type === undefined ? 0 : options.type;
            fullOptions.samplingMode = options.samplingMode === undefined ? 3 : options.samplingMode;
            fullOptions.format = options.format === undefined ? 5 : options.format;
            fullOptions.useSRGBBuffer = options.useSRGBBuffer === undefined ? false : options.useSRGBBuffer;
        }
        else {
            fullOptions.generateMipMaps = options;
            fullOptions.type = 0;
            fullOptions.samplingMode = 3;
            fullOptions.format = 5;
            fullOptions.useSRGBBuffer = false;
        }
        fullOptions.useSRGBBuffer = fullOptions.useSRGBBuffer && this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || this.isWebGPU);
        if (fullOptions.type === 1 && !this._caps.textureFloatLinearFiltering) {
            // if floating point linear (gl.FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = 1;
        }
        else if (fullOptions.type === 2 && !this._caps.textureHalfFloatLinearFiltering) {
            // if floating point linear (HALF_FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = 1;
        }
        if (fullOptions.type === 1 && !this._caps.textureFloat) {
            fullOptions.type = 0;
            Logger.Warn("Float textures are not supported. Type forced to TEXTURETYPE_UNSIGNED_BYTE");
        }
        var gl = this._gl;
        var texture = new InternalTexture(this, source);
        texture._useSRGBBuffer = !!fullOptions.useSRGBBuffer;
        var width = size.width || size;
        var height = size.height || size;
        var layers = size.layers || 0;
        var filters = this._getSamplingParameters(fullOptions.samplingMode, fullOptions.generateMipMaps ? true : false);
        var target = layers !== 0 ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D;
        var sizedFormat = this._getRGBABufferInternalSizedFormat(fullOptions.type, fullOptions.format, fullOptions.useSRGBBuffer);
        var internalFormat = this._getInternalFormat(fullOptions.format);
        var type = this._getWebGLTextureType(fullOptions.type);
        // Bind
        this._bindTextureDirectly(target, texture);
        if (layers !== 0) {
            texture.is2DArray = true;
            gl.texImage3D(target, 0, sizedFormat, width, height, layers, 0, internalFormat, type, null);
        }
        else {
            gl.texImage2D(target, 0, sizedFormat, width, height, 0, internalFormat, type, null);
        }
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, filters.mag);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, filters.min);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // MipMaps
        if (fullOptions.generateMipMaps) {
            this._gl.generateMipmap(target);
        }
        this._bindTextureDirectly(target, null);
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.depth = layers;
        texture.isReady = true;
        texture.samples = 1;
        texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
        texture.samplingMode = fullOptions.samplingMode;
        texture.type = fullOptions.type;
        texture.format = fullOptions.format;
        this._internalTexturesCache.push(texture);
        return texture;
    };
    /**
     * @param useSRGBBuffer
     * @param noMipmap
     * @hidden
     */
    ThinEngine.prototype._getUseSRGBBuffer = function (useSRGBBuffer, noMipmap) {
        // Generating mipmaps for sRGB textures is not supported in WebGL1 so we must disable the support if mipmaps is enabled
        return useSRGBBuffer && this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || this.isWebGPU || noMipmap);
    };
    ThinEngine.prototype._createTextureBase = function (url, noMipmap, invertY, scene, samplingMode, onLoad, onError, prepareTexture, prepareTextureProcessFunction, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, useSRGBBuffer) {
        var _this = this;
        if (samplingMode === void 0) { samplingMode = 3; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (buffer === void 0) { buffer = null; }
        if (fallback === void 0) { fallback = null; }
        if (format === void 0) { format = null; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        url = url || "";
        var fromData = url.substr(0, 5) === "data:";
        var fromBlob = url.substr(0, 5) === "blob:";
        var isBase64 = fromData && url.indexOf(";base64,") !== -1;
        var texture = fallback ? fallback : new InternalTexture(this, InternalTextureSource.Url);
        var originalUrl = url;
        if (this._transformTextureUrl && !isBase64 && !fallback && !buffer) {
            url = this._transformTextureUrl(url);
        }
        if (originalUrl !== url) {
            texture._originalUrl = originalUrl;
        }
        // establish the file extension, if possible
        var lastDot = url.lastIndexOf(".");
        var extension = forcedExtension ? forcedExtension : lastDot > -1 ? url.substring(lastDot).toLowerCase() : "";
        var loader = null;
        // Remove query string
        var queryStringIndex = extension.indexOf("?");
        if (queryStringIndex > -1) {
            extension = extension.split("?")[0];
        }
        for (var _i = 0, _a = ThinEngine._TextureLoaders; _i < _a.length; _i++) {
            var availableLoader = _a[_i];
            if (availableLoader.canLoad(extension, mimeType)) {
                loader = availableLoader;
                break;
            }
        }
        if (scene) {
            scene._addPendingData(texture);
        }
        texture.url = url;
        texture.generateMipMaps = !noMipmap;
        texture.samplingMode = samplingMode;
        texture.invertY = invertY;
        texture._useSRGBBuffer = this._getUseSRGBBuffer(!!useSRGBBuffer, noMipmap);
        if (!this._doNotHandleContextLost) {
            // Keep a link to the buffer only if we plan to handle context lost
            texture._buffer = buffer;
        }
        var onLoadObserver = null;
        if (onLoad && !fallback) {
            onLoadObserver = texture.onLoadedObservable.add(onLoad);
        }
        if (!fallback) {
            this._internalTexturesCache.push(texture);
        }
        var onInternalError = function (message, exception) {
            if (scene) {
                scene._removePendingData(texture);
            }
            if (url === originalUrl) {
                if (onLoadObserver) {
                    texture.onLoadedObservable.remove(onLoadObserver);
                }
                if (EngineStore.UseFallbackTexture) {
                    _this._createTextureBase(EngineStore.FallbackTexture, noMipmap, texture.invertY, scene, samplingMode, null, onError, prepareTexture, prepareTextureProcessFunction, buffer, texture);
                }
                message = (message || "Unknown error") + (EngineStore.UseFallbackTexture ? " - Fallback texture was used" : "");
                texture.onErrorObservable.notifyObservers({ message: message, exception: exception });
                if (onError) {
                    onError(message, exception);
                }
            }
            else {
                // fall back to the original url if the transformed url fails to load
                Logger.Warn("Failed to load ".concat(url, ", falling back to ").concat(originalUrl));
                _this._createTextureBase(originalUrl, noMipmap, texture.invertY, scene, samplingMode, onLoad, onError, prepareTexture, prepareTextureProcessFunction, buffer, texture, format, forcedExtension, mimeType, loaderOptions, useSRGBBuffer);
            }
        };
        // processing for non-image formats
        if (loader) {
            var callback_1 = function (data) {
                loader.loadData(data, texture, function (width, height, loadMipmap, isCompressed, done, loadFailed) {
                    if (loadFailed) {
                        onInternalError("TextureLoader failed to load data");
                    }
                    else {
                        prepareTexture(texture, extension, scene, { width: width, height: height }, texture.invertY, !loadMipmap, isCompressed, function () {
                            done();
                            return false;
                        }, samplingMode);
                    }
                }, loaderOptions);
            };
            if (!buffer) {
                this._loadFile(url, function (data) { return callback_1(new Uint8Array(data)); }, undefined, scene ? scene.offlineProvider : undefined, true, function (request, exception) {
                    onInternalError("Unable to load " + (request ? request.responseURL : url, exception));
                });
            }
            else {
                if (buffer instanceof ArrayBuffer) {
                    callback_1(new Uint8Array(buffer));
                }
                else if (ArrayBuffer.isView(buffer)) {
                    callback_1(buffer);
                }
                else {
                    if (onError) {
                        onError("Unable to load: only ArrayBuffer or ArrayBufferView is supported", null);
                    }
                }
            }
        }
        else {
            var onload_1 = function (img) {
                if (fromBlob && !_this._doNotHandleContextLost) {
                    // We need to store the image if we need to rebuild the texture
                    // in case of a webgl context lost
                    texture._buffer = img;
                }
                prepareTexture(texture, extension, scene, img, texture.invertY, noMipmap, false, prepareTextureProcessFunction, samplingMode);
            };
            // According to the WebGL spec section 6.10, ImageBitmaps must be inverted on creation.
            // So, we pass imageOrientation to _FileToolsLoadImage() as it may create an ImageBitmap.
            if (!fromData || isBase64) {
                if (buffer && (typeof buffer.decoding === "string" || buffer.close)) {
                    onload_1(buffer);
                }
                else {
                    ThinEngine._FileToolsLoadImage(url, onload_1, onInternalError, scene ? scene.offlineProvider : null, mimeType, texture.invertY && this._features.needsInvertingBitmap ? { imageOrientation: "flipY" } : undefined);
                }
            }
            else if (typeof buffer === "string" || buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer) || buffer instanceof Blob) {
                ThinEngine._FileToolsLoadImage(buffer, onload_1, onInternalError, scene ? scene.offlineProvider : null, mimeType, texture.invertY && this._features.needsInvertingBitmap ? { imageOrientation: "flipY" } : undefined);
            }
            else if (buffer) {
                onload_1(buffer);
            }
        }
        return texture;
    };
    /**
     * Usually called from Texture.ts.
     * Passed information to create a WebGLTexture
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
    ThinEngine.prototype.createTexture = function (url, noMipmap, invertY, scene, samplingMode, onLoad, onError, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, creationFlags, useSRGBBuffer) {
        var _this = this;
        if (samplingMode === void 0) { samplingMode = 3; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (buffer === void 0) { buffer = null; }
        if (fallback === void 0) { fallback = null; }
        if (format === void 0) { format = null; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        return this._createTextureBase(url, noMipmap, invertY, scene, samplingMode, onLoad, onError, this._prepareWebGLTexture.bind(this), function (potWidth, potHeight, img, extension, texture, continuationCallback) {
            var gl = _this._gl;
            var isPot = img.width === potWidth && img.height === potHeight;
            var internalFormat = format
                ? _this._getInternalFormat(format, texture._useSRGBBuffer)
                : extension === ".jpg" && !texture._useSRGBBuffer
                    ? gl.RGB
                    : texture._useSRGBBuffer
                        ? gl.SRGB8_ALPHA8
                        : gl.RGBA;
            var texelFormat = format ? _this._getInternalFormat(format) : extension === ".jpg" && !texture._useSRGBBuffer ? gl.RGB : gl.RGBA;
            if (texture._useSRGBBuffer && _this.webGLVersion === 1) {
                texelFormat = internalFormat;
            }
            if (isPot) {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, texelFormat, gl.UNSIGNED_BYTE, img);
                return false;
            }
            var maxTextureSize = _this._caps.maxTextureSize;
            if (img.width > maxTextureSize || img.height > maxTextureSize || !_this._supportsHardwareTextureRescaling) {
                _this._prepareWorkingCanvas();
                if (!_this._workingCanvas || !_this._workingContext) {
                    return false;
                }
                _this._workingCanvas.width = potWidth;
                _this._workingCanvas.height = potHeight;
                _this._workingContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, potWidth, potHeight);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, texelFormat, gl.UNSIGNED_BYTE, _this._workingCanvas);
                texture.width = potWidth;
                texture.height = potHeight;
                return false;
            }
            else {
                // Using shaders when possible to rescale because canvas.drawImage is lossy
                var source_1 = new InternalTexture(_this, InternalTextureSource.Temp);
                _this._bindTextureDirectly(gl.TEXTURE_2D, source_1, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, texelFormat, gl.UNSIGNED_BYTE, img);
                _this._rescaleTexture(source_1, texture, scene, internalFormat, function () {
                    _this._releaseTexture(source_1);
                    _this._bindTextureDirectly(gl.TEXTURE_2D, texture, true);
                    continuationCallback();
                });
            }
            return true;
        }, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, useSRGBBuffer);
    };
    /**
     * Loads an image as an HTMLImageElement.
     * @param input url string, ArrayBuffer, or Blob to load
     * @param onLoad callback called when the image successfully loads
     * @param onError callback called when the image fails to load
     * @param offlineProvider offline provider for caching
     * @param mimeType optional mime type
     * @param imageBitmapOptions optional the options to use when creating an ImageBitmap
     * @returns the HTMLImageElement of the loaded image
     * @hidden
     */
    ThinEngine._FileToolsLoadImage = function (input, onLoad, onError, offlineProvider, mimeType, imageBitmapOptions) {
        throw _WarnImport("FileTools");
    };
    /**
     * @param source
     * @param destination
     * @param scene
     * @param internalFormat
     * @param onComplete
     * @hidden
     */
    ThinEngine.prototype._rescaleTexture = function (source, destination, scene, internalFormat, onComplete) { };
    /**
     * Creates a raw texture
     * @param data defines the data to store in the texture
     * @param width defines the width of the texture
     * @param height defines the height of the texture
     * @param format defines the format of the data
     * @param generateMipMaps defines if the engine should generate the mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (Texture.NEAREST_SAMPLINGMODE by default)
     * @param compression defines the compression used (null by default)
     * @param type defines the type fo the data (Engine.TEXTURETYPE_UNSIGNED_INT by default)
     * @returns the raw texture inside an InternalTexture
     */
    ThinEngine.prototype.createRawTexture = function (data, width, height, format, generateMipMaps, invertY, samplingMode, compression, type) {
        if (compression === void 0) { compression = null; }
        if (type === void 0) { type = 0; }
        throw _WarnImport("Engine.RawTexture");
    };
    /**
     * Creates a new raw cube texture
     * @param data defines the array of data to use to create each face
     * @param size defines the size of the textures
     * @param format defines the format of the data
     * @param type defines the type of the data (like Engine.TEXTURETYPE_UNSIGNED_INT)
     * @param generateMipMaps  defines if the engine should generate the mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (like Texture.NEAREST_SAMPLINGMODE)
     * @param compression defines the compression used (null by default)
     * @returns the cube texture as an InternalTexture
     */
    ThinEngine.prototype.createRawCubeTexture = function (data, size, format, type, generateMipMaps, invertY, samplingMode, compression) {
        if (compression === void 0) { compression = null; }
        throw _WarnImport("Engine.RawTexture");
    };
    /**
     * Creates a new raw 3D texture
     * @param data defines the data used to create the texture
     * @param width defines the width of the texture
     * @param height defines the height of the texture
     * @param depth defines the depth of the texture
     * @param format defines the format of the texture
     * @param generateMipMaps defines if the engine must generate mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (like Texture.NEAREST_SAMPLINGMODE)
     * @param compression defines the compressed used (can be null)
     * @param textureType defines the compressed used (can be null)
     * @returns a new raw 3D texture (stored in an InternalTexture)
     */
    ThinEngine.prototype.createRawTexture3D = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType) {
        if (compression === void 0) { compression = null; }
        if (textureType === void 0) { textureType = 0; }
        throw _WarnImport("Engine.RawTexture");
    };
    /**
     * Creates a new raw 2D array texture
     * @param data defines the data used to create the texture
     * @param width defines the width of the texture
     * @param height defines the height of the texture
     * @param depth defines the number of layers of the texture
     * @param format defines the format of the texture
     * @param generateMipMaps defines if the engine must generate mip levels
     * @param invertY defines if data must be stored with Y axis inverted
     * @param samplingMode defines the required sampling mode (like Texture.NEAREST_SAMPLINGMODE)
     * @param compression defines the compressed used (can be null)
     * @param textureType defines the compressed used (can be null)
     * @returns a new raw 2D array texture (stored in an InternalTexture)
     */
    ThinEngine.prototype.createRawTexture2DArray = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType) {
        if (compression === void 0) { compression = null; }
        if (textureType === void 0) { textureType = 0; }
        throw _WarnImport("Engine.RawTexture");
    };
    /**
     * @param value
     * @hidden
     */
    ThinEngine.prototype._unpackFlipY = function (value) {
        if (this._unpackFlipYCached !== value) {
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, value ? 1 : 0);
            if (this.enableUnpackFlipYCached) {
                this._unpackFlipYCached = value;
            }
        }
    };
    /** @hidden */
    ThinEngine.prototype._getUnpackAlignement = function () {
        return this._gl.getParameter(this._gl.UNPACK_ALIGNMENT);
    };
    ThinEngine.prototype._getTextureTarget = function (texture) {
        if (texture.isCube) {
            return this._gl.TEXTURE_CUBE_MAP;
        }
        else if (texture.is3D) {
            return this._gl.TEXTURE_3D;
        }
        else if (texture.is2DArray || texture.isMultiview) {
            return this._gl.TEXTURE_2D_ARRAY;
        }
        return this._gl.TEXTURE_2D;
    };
    /**
     * Update the sampling mode of a given texture
     * @param samplingMode defines the required sampling mode
     * @param texture defines the texture to update
     * @param generateMipMaps defines whether to generate mipmaps for the texture
     */
    ThinEngine.prototype.updateTextureSamplingMode = function (samplingMode, texture, generateMipMaps) {
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        var target = this._getTextureTarget(texture);
        var filters = this._getSamplingParameters(samplingMode, texture.generateMipMaps || generateMipMaps);
        this._setTextureParameterInteger(target, this._gl.TEXTURE_MAG_FILTER, filters.mag, texture);
        this._setTextureParameterInteger(target, this._gl.TEXTURE_MIN_FILTER, filters.min);
        if (generateMipMaps) {
            texture.generateMipMaps = true;
            this._gl.generateMipmap(target);
        }
        this._bindTextureDirectly(target, null);
        texture.samplingMode = samplingMode;
    };
    /**
     * Update the dimensions of a texture
     * @param texture texture to update
     * @param width new width of the texture
     * @param height new height of the texture
     * @param depth new depth of the texture
     */
    ThinEngine.prototype.updateTextureDimensions = function (texture, width, height, depth) {
        if (depth === void 0) { depth = 1; }
    };
    /**
     * Update the sampling mode of a given texture
     * @param texture defines the texture to update
     * @param wrapU defines the texture wrap mode of the u coordinates
     * @param wrapV defines the texture wrap mode of the v coordinates
     * @param wrapR defines the texture wrap mode of the r coordinates
     */
    ThinEngine.prototype.updateTextureWrappingMode = function (texture, wrapU, wrapV, wrapR) {
        if (wrapV === void 0) { wrapV = null; }
        if (wrapR === void 0) { wrapR = null; }
        var target = this._getTextureTarget(texture);
        if (wrapU !== null) {
            this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_S, this._getTextureWrapMode(wrapU), texture);
            texture._cachedWrapU = wrapU;
        }
        if (wrapV !== null) {
            this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_T, this._getTextureWrapMode(wrapV), texture);
            texture._cachedWrapV = wrapV;
        }
        if ((texture.is2DArray || texture.is3D) && wrapR !== null) {
            this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_R, this._getTextureWrapMode(wrapR), texture);
            texture._cachedWrapR = wrapR;
        }
        this._bindTextureDirectly(target, null);
    };
    /**
     * @param internalTexture
     * @param size
     * @param generateStencil
     * @param bilinearFiltering
     * @param comparisonFunction
     * @param samples
     * @hidden
     */
    ThinEngine.prototype._setupDepthStencilTexture = function (internalTexture, size, generateStencil, bilinearFiltering, comparisonFunction, samples) {
        if (samples === void 0) { samples = 1; }
        var width = size.width || size;
        var height = size.height || size;
        var layers = size.layers || 0;
        internalTexture.baseWidth = width;
        internalTexture.baseHeight = height;
        internalTexture.width = width;
        internalTexture.height = height;
        internalTexture.is2DArray = layers > 0;
        internalTexture.depth = layers;
        internalTexture.isReady = true;
        internalTexture.samples = samples;
        internalTexture.generateMipMaps = false;
        internalTexture.samplingMode = bilinearFiltering ? 2 : 1;
        internalTexture.type = 0;
        internalTexture._comparisonFunction = comparisonFunction;
        var gl = this._gl;
        var target = this._getTextureTarget(internalTexture);
        var samplingParameters = this._getSamplingParameters(internalTexture.samplingMode, false);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, samplingParameters.mag);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, samplingParameters.min);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (comparisonFunction === 0) {
            gl.texParameteri(target, gl.TEXTURE_COMPARE_FUNC, 515);
            gl.texParameteri(target, gl.TEXTURE_COMPARE_MODE, gl.NONE);
        }
        else {
            gl.texParameteri(target, gl.TEXTURE_COMPARE_FUNC, comparisonFunction);
            gl.texParameteri(target, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
        }
    };
    /**
     * @param texture
     * @param internalFormat
     * @param width
     * @param height
     * @param data
     * @param faceIndex
     * @param lod
     * @hidden
     */
    ThinEngine.prototype._uploadCompressedDataToTextureDirectly = function (texture, internalFormat, width, height, data, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        var gl = this._gl;
        var target = gl.TEXTURE_2D;
        if (texture.isCube) {
            target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex;
        }
        if (texture._useSRGBBuffer) {
            switch (internalFormat) {
                case 36492:
                    internalFormat = gl.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT;
                    break;
                case 37808:
                    internalFormat = gl.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
                    break;
                case 33776:
                    if (this._caps.s3tc_srgb) {
                        internalFormat = gl.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                    }
                    else {
                        // S3TC sRGB extension not supported
                        texture._useSRGBBuffer = false;
                    }
                    break;
                case 33777:
                    if (this._caps.s3tc_srgb) {
                        internalFormat = gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                    }
                    else {
                        // S3TC sRGB extension not supported
                        texture._useSRGBBuffer = false;
                    }
                    break;
                case 33779:
                    if (this._caps.s3tc_srgb) {
                        internalFormat = gl.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
                    }
                    else {
                        // S3TC sRGB extension not supported
                        texture._useSRGBBuffer = false;
                    }
                    break;
                default:
                    // We don't support a sRGB format corresponding to internalFormat, so revert to non sRGB format
                    texture._useSRGBBuffer = false;
                    break;
            }
        }
        this._gl.compressedTexImage2D(target, lod, internalFormat, width, height, 0, data);
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
    ThinEngine.prototype._uploadDataToTextureDirectly = function (texture, imageData, faceIndex, lod, babylonInternalFormat, useTextureWidthAndHeight) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        if (useTextureWidthAndHeight === void 0) { useTextureWidthAndHeight = false; }
        var gl = this._gl;
        var textureType = this._getWebGLTextureType(texture.type);
        var format = this._getInternalFormat(texture.format);
        var internalFormat = babylonInternalFormat === undefined
            ? this._getRGBABufferInternalSizedFormat(texture.type, texture.format, texture._useSRGBBuffer)
            : this._getInternalFormat(babylonInternalFormat, texture._useSRGBBuffer);
        this._unpackFlipY(texture.invertY);
        var target = gl.TEXTURE_2D;
        if (texture.isCube) {
            target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex;
        }
        var lodMaxWidth = Math.round(Math.log(texture.width) * Math.LOG2E);
        var lodMaxHeight = Math.round(Math.log(texture.height) * Math.LOG2E);
        var width = useTextureWidthAndHeight ? texture.width : Math.pow(2, Math.max(lodMaxWidth - lod, 0));
        var height = useTextureWidthAndHeight ? texture.height : Math.pow(2, Math.max(lodMaxHeight - lod, 0));
        gl.texImage2D(target, lod, internalFormat, width, height, 0, format, textureType, imageData);
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
    ThinEngine.prototype.updateTextureData = function (texture, imageData, xOffset, yOffset, width, height, faceIndex, lod, generateMipMaps) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        var gl = this._gl;
        var textureType = this._getWebGLTextureType(texture.type);
        var format = this._getInternalFormat(texture.format);
        this._unpackFlipY(texture.invertY);
        var target = gl.TEXTURE_2D;
        if (texture.isCube) {
            target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex;
        }
        this._bindTextureDirectly(target, texture, true);
        gl.texSubImage2D(target, lod, xOffset, yOffset, width, height, format, textureType, imageData);
        if (generateMipMaps) {
            this._gl.generateMipmap(target);
        }
        this._bindTextureDirectly(target, null);
    };
    /**
     * @param texture
     * @param imageData
     * @param faceIndex
     * @param lod
     * @hidden
     */
    ThinEngine.prototype._uploadArrayBufferViewToTexture = function (texture, imageData, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        var gl = this._gl;
        var bindTarget = texture.isCube ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
        this._bindTextureDirectly(bindTarget, texture, true);
        this._uploadDataToTextureDirectly(texture, imageData, faceIndex, lod);
        this._bindTextureDirectly(bindTarget, null, true);
    };
    ThinEngine.prototype._prepareWebGLTextureContinuation = function (texture, scene, noMipmap, isCompressed, samplingMode) {
        var gl = this._gl;
        if (!gl) {
            return;
        }
        var filters = this._getSamplingParameters(samplingMode, !noMipmap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters.mag);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters.min);
        if (!noMipmap && !isCompressed) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        this._bindTextureDirectly(gl.TEXTURE_2D, null);
        // this.resetTextureCache();
        if (scene) {
            scene._removePendingData(texture);
        }
        texture.onLoadedObservable.notifyObservers(texture);
        texture.onLoadedObservable.clear();
    };
    ThinEngine.prototype._prepareWebGLTexture = function (texture, extension, scene, img, invertY, noMipmap, isCompressed, processFunction, samplingMode) {
        var _this = this;
        if (samplingMode === void 0) { samplingMode = 3; }
        var maxTextureSize = this.getCaps().maxTextureSize;
        var potWidth = Math.min(maxTextureSize, this.needPOTTextures ? ThinEngine.GetExponentOfTwo(img.width, maxTextureSize) : img.width);
        var potHeight = Math.min(maxTextureSize, this.needPOTTextures ? ThinEngine.GetExponentOfTwo(img.height, maxTextureSize) : img.height);
        var gl = this._gl;
        if (!gl) {
            return;
        }
        if (!texture._hardwareTexture) {
            //  this.resetTextureCache();
            if (scene) {
                scene._removePendingData(texture);
            }
            return;
        }
        this._bindTextureDirectly(gl.TEXTURE_2D, texture, true);
        this._unpackFlipY(invertY === undefined ? true : invertY ? true : false);
        texture.baseWidth = img.width;
        texture.baseHeight = img.height;
        texture.width = potWidth;
        texture.height = potHeight;
        texture.isReady = true;
        if (processFunction(potWidth, potHeight, img, extension, texture, function () {
            _this._prepareWebGLTextureContinuation(texture, scene, noMipmap, isCompressed, samplingMode);
        })) {
            // Returning as texture needs extra async steps
            return;
        }
        this._prepareWebGLTextureContinuation(texture, scene, noMipmap, isCompressed, samplingMode);
    };
    /**
     * @param generateStencilBuffer
     * @param generateDepthBuffer
     * @param width
     * @param height
     * @param samples
     * @hidden
     */
    ThinEngine.prototype._setupFramebufferDepthAttachments = function (generateStencilBuffer, generateDepthBuffer, width, height, samples) {
        if (samples === void 0) { samples = 1; }
        var gl = this._gl;
        // Create the depth/stencil buffer
        if (generateStencilBuffer && generateDepthBuffer) {
            return this._createRenderBuffer(width, height, samples, gl.DEPTH_STENCIL, gl.DEPTH24_STENCIL8, gl.DEPTH_STENCIL_ATTACHMENT);
        }
        if (generateDepthBuffer) {
            var depthFormat = gl.DEPTH_COMPONENT16;
            if (this._webGLVersion > 1) {
                depthFormat = gl.DEPTH_COMPONENT32F;
            }
            return this._createRenderBuffer(width, height, samples, depthFormat, depthFormat, gl.DEPTH_ATTACHMENT);
        }
        if (generateStencilBuffer) {
            return this._createRenderBuffer(width, height, samples, gl.STENCIL_INDEX8, gl.STENCIL_INDEX8, gl.STENCIL_ATTACHMENT);
        }
        return null;
    };
    /**
     * @param width
     * @param height
     * @param samples
     * @param internalFormat
     * @param msInternalFormat
     * @param attachment
     * @param unbindBuffer
     * @hidden
     */
    ThinEngine.prototype._createRenderBuffer = function (width, height, samples, internalFormat, msInternalFormat, attachment, unbindBuffer) {
        if (unbindBuffer === void 0) { unbindBuffer = true; }
        var gl = this._gl;
        var renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        if (samples > 1 && gl.renderbufferStorageMultisample) {
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, msInternalFormat, width, height);
        }
        else {
            gl.renderbufferStorage(gl.RENDERBUFFER, internalFormat, width, height);
        }
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, renderBuffer);
        if (unbindBuffer) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }
        return renderBuffer;
    };
    /**
     * @param texture
     * @hidden
     */
    ThinEngine.prototype._releaseTexture = function (texture) {
        var _a;
        this._deleteTexture((_a = texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource);
        // Unbind channels
        this.unbindAllTextures();
        var index = this._internalTexturesCache.indexOf(texture);
        if (index !== -1) {
            this._internalTexturesCache.splice(index, 1);
        }
        // Integrated fixed lod samplers.
        if (texture._lodTextureHigh) {
            texture._lodTextureHigh.dispose();
        }
        if (texture._lodTextureMid) {
            texture._lodTextureMid.dispose();
        }
        if (texture._lodTextureLow) {
            texture._lodTextureLow.dispose();
        }
        // Integrated irradiance map.
        if (texture._irradianceTexture) {
            texture._irradianceTexture.dispose();
        }
    };
    /**
     * @param rtWrapper
     * @hidden
     */
    ThinEngine.prototype._releaseRenderTargetWrapper = function (rtWrapper) {
        var index = this._renderTargetWrapperCache.indexOf(rtWrapper);
        if (index !== -1) {
            this._renderTargetWrapperCache.splice(index, 1);
        }
    };
    ThinEngine.prototype._deleteTexture = function (texture) {
        if (texture) {
            this._gl.deleteTexture(texture);
        }
    };
    ThinEngine.prototype._setProgram = function (program) {
        if (this._currentProgram !== program) {
            this._gl.useProgram(program);
            this._currentProgram = program;
        }
    };
    /**
     * Binds an effect to the webGL context
     * @param effect defines the effect to bind
     */
    ThinEngine.prototype.bindSamplers = function (effect) {
        var webGLPipelineContext = effect.getPipelineContext();
        this._setProgram(webGLPipelineContext.program);
        var samplers = effect.getSamplers();
        for (var index = 0; index < samplers.length; index++) {
            var uniform = effect.getUniform(samplers[index]);
            if (uniform) {
                this._boundUniforms[index] = uniform;
            }
        }
        this._currentEffect = null;
    };
    ThinEngine.prototype._activateCurrentTexture = function () {
        if (this._currentTextureChannel !== this._activeChannel) {
            this._gl.activeTexture(this._gl.TEXTURE0 + this._activeChannel);
            this._currentTextureChannel = this._activeChannel;
        }
    };
    /**
     * @param target
     * @param texture
     * @param forTextureDataUpdate
     * @param force
     * @hidden
     */
    ThinEngine.prototype._bindTextureDirectly = function (target, texture, forTextureDataUpdate, force) {
        var _a, _b;
        if (forTextureDataUpdate === void 0) { forTextureDataUpdate = false; }
        if (force === void 0) { force = false; }
        var wasPreviouslyBound = false;
        var isTextureForRendering = texture && texture._associatedChannel > -1;
        if (forTextureDataUpdate && isTextureForRendering) {
            this._activeChannel = texture._associatedChannel;
        }
        var currentTextureBound = this._boundTexturesCache[this._activeChannel];
        if (currentTextureBound !== texture || force) {
            this._activateCurrentTexture();
            if (texture && texture.isMultiview) {
                //this._gl.bindTexture(target, texture ? texture._colorTextureArray : null);
                console.error(target, texture);
                throw "_bindTextureDirectly called with a multiview texture!";
            }
            else {
                this._gl.bindTexture(target, (_b = (_a = texture === null || texture === void 0 ? void 0 : texture._hardwareTexture) === null || _a === void 0 ? void 0 : _a.underlyingResource) !== null && _b !== void 0 ? _b : null);
            }
            this._boundTexturesCache[this._activeChannel] = texture;
            if (texture) {
                texture._associatedChannel = this._activeChannel;
            }
        }
        else if (forTextureDataUpdate) {
            wasPreviouslyBound = true;
            this._activateCurrentTexture();
        }
        if (isTextureForRendering && !forTextureDataUpdate) {
            this._bindSamplerUniformToChannel(texture._associatedChannel, this._activeChannel);
        }
        return wasPreviouslyBound;
    };
    /**
     * @param channel
     * @param texture
     * @param name
     * @hidden
     */
    ThinEngine.prototype._bindTexture = function (channel, texture, name) {
        if (channel === undefined) {
            return;
        }
        if (texture) {
            texture._associatedChannel = channel;
        }
        this._activeChannel = channel;
        var target = texture ? this._getTextureTarget(texture) : this._gl.TEXTURE_2D;
        this._bindTextureDirectly(target, texture);
    };
    /**
     * Unbind all textures from the webGL context
     */
    ThinEngine.prototype.unbindAllTextures = function () {
        for (var channel = 0; channel < this._maxSimultaneousTextures; channel++) {
            this._activeChannel = channel;
            this._bindTextureDirectly(this._gl.TEXTURE_2D, null);
            this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null);
            if (this.webGLVersion > 1) {
                this._bindTextureDirectly(this._gl.TEXTURE_3D, null);
                this._bindTextureDirectly(this._gl.TEXTURE_2D_ARRAY, null);
            }
        }
    };
    /**
     * Sets a texture to the according uniform.
     * @param channel The texture channel
     * @param uniform The uniform to set
     * @param texture The texture to apply
     * @param name The name of the uniform in the effect
     */
    ThinEngine.prototype.setTexture = function (channel, uniform, texture, name) {
        if (channel === undefined) {
            return;
        }
        if (uniform) {
            this._boundUniforms[channel] = uniform;
        }
        this._setTexture(channel, texture);
    };
    ThinEngine.prototype._bindSamplerUniformToChannel = function (sourceSlot, destination) {
        var uniform = this._boundUniforms[sourceSlot];
        if (!uniform || uniform._currentState === destination) {
            return;
        }
        this._gl.uniform1i(uniform, destination);
        uniform._currentState = destination;
    };
    ThinEngine.prototype._getTextureWrapMode = function (mode) {
        switch (mode) {
            case 1:
                return this._gl.REPEAT;
            case 0:
                return this._gl.CLAMP_TO_EDGE;
            case 2:
                return this._gl.MIRRORED_REPEAT;
        }
        return this._gl.REPEAT;
    };
    ThinEngine.prototype._setTexture = function (channel, texture, isPartOfTextureArray, depthStencilTexture, name) {
        if (isPartOfTextureArray === void 0) { isPartOfTextureArray = false; }
        if (depthStencilTexture === void 0) { depthStencilTexture = false; }
        if (name === void 0) { name = ""; }
        // Not ready?
        if (!texture) {
            if (this._boundTexturesCache[channel] != null) {
                this._activeChannel = channel;
                this._bindTextureDirectly(this._gl.TEXTURE_2D, null);
                this._bindTextureDirectly(this._gl.TEXTURE_CUBE_MAP, null);
                if (this.webGLVersion > 1) {
                    this._bindTextureDirectly(this._gl.TEXTURE_3D, null);
                    this._bindTextureDirectly(this._gl.TEXTURE_2D_ARRAY, null);
                }
            }
            return false;
        }
        // Video
        if (texture.video) {
            this._activeChannel = channel;
            texture.update();
        }
        else if (texture.delayLoadState === 4) {
            // Delay loading
            texture.delayLoad();
            return false;
        }
        var internalTexture;
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
        if (!isPartOfTextureArray && internalTexture) {
            internalTexture._associatedChannel = channel;
        }
        var needToBind = true;
        if (this._boundTexturesCache[channel] === internalTexture) {
            if (!isPartOfTextureArray) {
                this._bindSamplerUniformToChannel(internalTexture._associatedChannel, channel);
            }
            needToBind = false;
        }
        this._activeChannel = channel;
        var target = this._getTextureTarget(internalTexture);
        if (needToBind) {
            this._bindTextureDirectly(target, internalTexture, isPartOfTextureArray);
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
            if (internalTexture._cachedWrapU !== texture.wrapU) {
                internalTexture._cachedWrapU = texture.wrapU;
                this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_S, this._getTextureWrapMode(texture.wrapU), internalTexture);
            }
            if (internalTexture._cachedWrapV !== texture.wrapV) {
                internalTexture._cachedWrapV = texture.wrapV;
                this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_T, this._getTextureWrapMode(texture.wrapV), internalTexture);
            }
            if (internalTexture.is3D && internalTexture._cachedWrapR !== texture.wrapR) {
                internalTexture._cachedWrapR = texture.wrapR;
                this._setTextureParameterInteger(target, this._gl.TEXTURE_WRAP_R, this._getTextureWrapMode(texture.wrapR), internalTexture);
            }
            this._setAnisotropicLevel(target, internalTexture, texture.anisotropicFilteringLevel);
        }
        return true;
    };
    /**
     * Sets an array of texture to the webGL context
     * @param channel defines the channel where the texture array must be set
     * @param uniform defines the associated uniform location
     * @param textures defines the array of textures to bind
     * @param name name of the channel
     */
    ThinEngine.prototype.setTextureArray = function (channel, uniform, textures, name) {
        if (channel === undefined || !uniform) {
            return;
        }
        if (!this._textureUnits || this._textureUnits.length !== textures.length) {
            this._textureUnits = new Int32Array(textures.length);
        }
        for (var i = 0; i < textures.length; i++) {
            var texture = textures[i].getInternalTexture();
            if (texture) {
                this._textureUnits[i] = channel + i;
                texture._associatedChannel = channel + i;
            }
            else {
                this._textureUnits[i] = -1;
            }
        }
        this._gl.uniform1iv(uniform, this._textureUnits);
        for (var index = 0; index < textures.length; index++) {
            this._setTexture(this._textureUnits[index], textures[index], true);
        }
    };
    /**
     * @param target
     * @param internalTexture
     * @param anisotropicFilteringLevel
     * @hidden
     */
    ThinEngine.prototype._setAnisotropicLevel = function (target, internalTexture, anisotropicFilteringLevel) {
        var anisotropicFilterExtension = this._caps.textureAnisotropicFilterExtension;
        if (internalTexture.samplingMode !== 11 &&
            internalTexture.samplingMode !== 3 &&
            internalTexture.samplingMode !== 2) {
            anisotropicFilteringLevel = 1; // Forcing the anisotropic to 1 because else webgl will force filters to linear
        }
        if (anisotropicFilterExtension && internalTexture._cachedAnisotropicFilteringLevel !== anisotropicFilteringLevel) {
            this._setTextureParameterFloat(target, anisotropicFilterExtension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropicFilteringLevel, this._caps.maxAnisotropy), internalTexture);
            internalTexture._cachedAnisotropicFilteringLevel = anisotropicFilteringLevel;
        }
    };
    ThinEngine.prototype._setTextureParameterFloat = function (target, parameter, value, texture) {
        this._bindTextureDirectly(target, texture, true, true);
        this._gl.texParameterf(target, parameter, value);
    };
    ThinEngine.prototype._setTextureParameterInteger = function (target, parameter, value, texture) {
        if (texture) {
            this._bindTextureDirectly(target, texture, true, true);
        }
        this._gl.texParameteri(target, parameter, value);
    };
    /**
     * Unbind all vertex attributes from the webGL context
     */
    ThinEngine.prototype.unbindAllAttributes = function () {
        if (this._mustWipeVertexAttributes) {
            this._mustWipeVertexAttributes = false;
            for (var i = 0; i < this._caps.maxVertexAttribs; i++) {
                this.disableAttributeByIndex(i);
            }
            return;
        }
        for (var i = 0, ul = this._vertexAttribArraysEnabled.length; i < ul; i++) {
            if (i >= this._caps.maxVertexAttribs || !this._vertexAttribArraysEnabled[i]) {
                continue;
            }
            this.disableAttributeByIndex(i);
        }
    };
    /**
     * Force the engine to release all cached effects. This means that next effect compilation will have to be done completely even if a similar effect was already compiled
     */
    ThinEngine.prototype.releaseEffects = function () {
        for (var name_1 in this._compiledEffects) {
            var webGLPipelineContext = this._compiledEffects[name_1].getPipelineContext();
            this._deletePipelineContext(webGLPipelineContext);
        }
        this._compiledEffects = {};
    };
    /**
     * Dispose and release all associated resources
     */
    ThinEngine.prototype.dispose = function () {
        var _a;
        this.stopRenderLoop();
        // Clear observables
        if (this.onBeforeTextureInitObservable) {
            this.onBeforeTextureInitObservable.clear();
        }
        // Empty texture
        if (this._emptyTexture) {
            this._releaseTexture(this._emptyTexture);
            this._emptyTexture = null;
        }
        if (this._emptyCubeTexture) {
            this._releaseTexture(this._emptyCubeTexture);
            this._emptyCubeTexture = null;
        }
        if (this._dummyFramebuffer) {
            this._gl.deleteFramebuffer(this._dummyFramebuffer);
        }
        // Release effects
        this.releaseEffects();
        (_a = this.releaseComputeEffects) === null || _a === void 0 ? void 0 : _a.call(this);
        // Unbind
        this.unbindAllAttributes();
        this._boundUniforms = [];
        // Events
        if (IsWindowObjectExist()) {
            if (this._renderingCanvas) {
                if (!this._doNotHandleContextLost) {
                    this._renderingCanvas.removeEventListener("webglcontextlost", this._onContextLost);
                    this._renderingCanvas.removeEventListener("webglcontextrestored", this._onContextRestored);
                }
                window.removeEventListener("resize", this._checkForMobile);
            }
        }
        this._workingCanvas = null;
        this._workingContext = null;
        this._currentBufferPointers = [];
        this._renderingCanvas = null;
        this._currentProgram = null;
        this._boundRenderFunction = null;
        Effect.ResetCache();
        // Abort active requests
        for (var _i = 0, _b = this._activeRequests; _i < _b.length; _i++) {
            var request = _b[_i];
            request.abort();
        }
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
    };
    /**
     * Attach a new callback raised when context lost event is fired
     * @param callback defines the callback to call
     */
    ThinEngine.prototype.attachContextLostEvent = function (callback) {
        if (this._renderingCanvas) {
            this._renderingCanvas.addEventListener("webglcontextlost", callback, false);
        }
    };
    /**
     * Attach a new callback raised when context restored event is fired
     * @param callback defines the callback to call
     */
    ThinEngine.prototype.attachContextRestoredEvent = function (callback) {
        if (this._renderingCanvas) {
            this._renderingCanvas.addEventListener("webglcontextrestored", callback, false);
        }
    };
    /**
     * Get the current error code of the webGL context
     * @returns the error code
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getError
     */
    ThinEngine.prototype.getError = function () {
        return this._gl.getError();
    };
    ThinEngine.prototype._canRenderToFloatFramebuffer = function () {
        if (this._webGLVersion > 1) {
            return this._caps.colorBufferFloat;
        }
        return this._canRenderToFramebuffer(1);
    };
    ThinEngine.prototype._canRenderToHalfFloatFramebuffer = function () {
        if (this._webGLVersion > 1) {
            return this._caps.colorBufferFloat;
        }
        return this._canRenderToFramebuffer(2);
    };
    // Thank you : http://stackoverflow.com/questions/28827511/webgl-ios-render-to-floating-point-texture
    ThinEngine.prototype._canRenderToFramebuffer = function (type) {
        var gl = this._gl;
        //clear existing errors
        // eslint-disable-next-line no-empty
        while (gl.getError() !== gl.NO_ERROR) { }
        var successful = true;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this._getRGBABufferInternalSizedFormat(type), 1, 1, 0, gl.RGBA, this._getWebGLTextureType(type), null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        successful = successful && status === gl.FRAMEBUFFER_COMPLETE;
        successful = successful && gl.getError() === gl.NO_ERROR;
        //try render by clearing frame buffer's color buffer
        if (successful) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            successful = successful && gl.getError() === gl.NO_ERROR;
        }
        //try reading from frame to ensure render occurs (just creating the FBO is not sufficient to determine if rendering is supported)
        if (successful) {
            //in practice it's sufficient to just read from the backbuffer rather than handle potentially issues reading from the texture
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            var readFormat = gl.RGBA;
            var readType = gl.UNSIGNED_BYTE;
            var buffer = new Uint8Array(4);
            gl.readPixels(0, 0, 1, 1, readFormat, readType, buffer);
            successful = successful && gl.getError() === gl.NO_ERROR;
        }
        //clean up
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //clear accumulated errors
        // eslint-disable-next-line no-empty
        while (!successful && gl.getError() !== gl.NO_ERROR) { }
        return successful;
    };
    /**
     * @param type
     * @hidden
     */
    ThinEngine.prototype._getWebGLTextureType = function (type) {
        if (this._webGLVersion === 1) {
            switch (type) {
                case 1:
                    return this._gl.FLOAT;
                case 2:
                    return this._gl.HALF_FLOAT_OES;
                case 0:
                    return this._gl.UNSIGNED_BYTE;
                case 8:
                    return this._gl.UNSIGNED_SHORT_4_4_4_4;
                case 9:
                    return this._gl.UNSIGNED_SHORT_5_5_5_1;
                case 10:
                    return this._gl.UNSIGNED_SHORT_5_6_5;
            }
            return this._gl.UNSIGNED_BYTE;
        }
        switch (type) {
            case 3:
                return this._gl.BYTE;
            case 0:
                return this._gl.UNSIGNED_BYTE;
            case 4:
                return this._gl.SHORT;
            case 5:
                return this._gl.UNSIGNED_SHORT;
            case 6:
                return this._gl.INT;
            case 7: // Refers to UNSIGNED_INT
                return this._gl.UNSIGNED_INT;
            case 1:
                return this._gl.FLOAT;
            case 2:
                return this._gl.HALF_FLOAT;
            case 8:
                return this._gl.UNSIGNED_SHORT_4_4_4_4;
            case 9:
                return this._gl.UNSIGNED_SHORT_5_5_5_1;
            case 10:
                return this._gl.UNSIGNED_SHORT_5_6_5;
            case 11:
                return this._gl.UNSIGNED_INT_2_10_10_10_REV;
            case 12:
                return this._gl.UNSIGNED_INT_24_8;
            case 13:
                return this._gl.UNSIGNED_INT_10F_11F_11F_REV;
            case 14:
                return this._gl.UNSIGNED_INT_5_9_9_9_REV;
            case 15:
                return this._gl.FLOAT_32_UNSIGNED_INT_24_8_REV;
        }
        return this._gl.UNSIGNED_BYTE;
    };
    /**
     * @param format
     * @param useSRGBBuffer
     * @hidden
     */
    ThinEngine.prototype._getInternalFormat = function (format, useSRGBBuffer) {
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        var internalFormat = useSRGBBuffer ? this._gl.SRGB8_ALPHA8 : this._gl.RGBA;
        switch (format) {
            case 0:
                internalFormat = this._gl.ALPHA;
                break;
            case 1:
                internalFormat = this._gl.LUMINANCE;
                break;
            case 2:
                internalFormat = this._gl.LUMINANCE_ALPHA;
                break;
            case 6:
                internalFormat = this._gl.RED;
                break;
            case 7:
                internalFormat = this._gl.RG;
                break;
            case 4:
                internalFormat = useSRGBBuffer ? this._gl.SRGB : this._gl.RGB;
                break;
            case 5:
                internalFormat = useSRGBBuffer ? this._gl.SRGB8_ALPHA8 : this._gl.RGBA;
                break;
        }
        if (this._webGLVersion > 1) {
            switch (format) {
                case 8:
                    internalFormat = this._gl.RED_INTEGER;
                    break;
                case 9:
                    internalFormat = this._gl.RG_INTEGER;
                    break;
                case 10:
                    internalFormat = this._gl.RGB_INTEGER;
                    break;
                case 11:
                    internalFormat = this._gl.RGBA_INTEGER;
                    break;
            }
        }
        return internalFormat;
    };
    /**
     * @param type
     * @param format
     * @param useSRGBBuffer
     * @hidden
     */
    ThinEngine.prototype._getRGBABufferInternalSizedFormat = function (type, format, useSRGBBuffer) {
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        if (this._webGLVersion === 1) {
            if (format !== undefined) {
                switch (format) {
                    case 0:
                        return this._gl.ALPHA;
                    case 1:
                        return this._gl.LUMINANCE;
                    case 2:
                        return this._gl.LUMINANCE_ALPHA;
                    case 4:
                        return useSRGBBuffer ? this._gl.SRGB : this._gl.RGB;
                }
            }
            return this._gl.RGBA;
        }
        switch (type) {
            case 3:
                switch (format) {
                    case 6:
                        return this._gl.R8_SNORM;
                    case 7:
                        return this._gl.RG8_SNORM;
                    case 4:
                        return this._gl.RGB8_SNORM;
                    case 8:
                        return this._gl.R8I;
                    case 9:
                        return this._gl.RG8I;
                    case 10:
                        return this._gl.RGB8I;
                    case 11:
                        return this._gl.RGBA8I;
                    default:
                        return this._gl.RGBA8_SNORM;
                }
            case 0:
                switch (format) {
                    case 6:
                        return this._gl.R8;
                    case 7:
                        return this._gl.RG8;
                    case 4:
                        return useSRGBBuffer ? this._gl.SRGB8 : this._gl.RGB8; // By default. Other possibilities are RGB565, SRGB8.
                    case 5:
                        return useSRGBBuffer ? this._gl.SRGB8_ALPHA8 : this._gl.RGBA8; // By default. Other possibilities are RGB5_A1, RGBA4, SRGB8_ALPHA8.
                    case 8:
                        return this._gl.R8UI;
                    case 9:
                        return this._gl.RG8UI;
                    case 10:
                        return this._gl.RGB8UI;
                    case 11:
                        return this._gl.RGBA8UI;
                    case 0:
                        return this._gl.ALPHA;
                    case 1:
                        return this._gl.LUMINANCE;
                    case 2:
                        return this._gl.LUMINANCE_ALPHA;
                    default:
                        return this._gl.RGBA8;
                }
            case 4:
                switch (format) {
                    case 8:
                        return this._gl.R16I;
                    case 9:
                        return this._gl.RG16I;
                    case 10:
                        return this._gl.RGB16I;
                    case 11:
                        return this._gl.RGBA16I;
                    default:
                        return this._gl.RGBA16I;
                }
            case 5:
                switch (format) {
                    case 8:
                        return this._gl.R16UI;
                    case 9:
                        return this._gl.RG16UI;
                    case 10:
                        return this._gl.RGB16UI;
                    case 11:
                        return this._gl.RGBA16UI;
                    default:
                        return this._gl.RGBA16UI;
                }
            case 6:
                switch (format) {
                    case 8:
                        return this._gl.R32I;
                    case 9:
                        return this._gl.RG32I;
                    case 10:
                        return this._gl.RGB32I;
                    case 11:
                        return this._gl.RGBA32I;
                    default:
                        return this._gl.RGBA32I;
                }
            case 7: // Refers to UNSIGNED_INT
                switch (format) {
                    case 8:
                        return this._gl.R32UI;
                    case 9:
                        return this._gl.RG32UI;
                    case 10:
                        return this._gl.RGB32UI;
                    case 11:
                        return this._gl.RGBA32UI;
                    default:
                        return this._gl.RGBA32UI;
                }
            case 1:
                switch (format) {
                    case 6:
                        return this._gl.R32F; // By default. Other possibility is R16F.
                    case 7:
                        return this._gl.RG32F; // By default. Other possibility is RG16F.
                    case 4:
                        return this._gl.RGB32F; // By default. Other possibilities are RGB16F, R11F_G11F_B10F, RGB9_E5.
                    case 5:
                        return this._gl.RGBA32F; // By default. Other possibility is RGBA16F.
                    default:
                        return this._gl.RGBA32F;
                }
            case 2:
                switch (format) {
                    case 6:
                        return this._gl.R16F;
                    case 7:
                        return this._gl.RG16F;
                    case 4:
                        return this._gl.RGB16F; // By default. Other possibilities are R11F_G11F_B10F, RGB9_E5.
                    case 5:
                        return this._gl.RGBA16F;
                    default:
                        return this._gl.RGBA16F;
                }
            case 10:
                return this._gl.RGB565;
            case 13:
                return this._gl.R11F_G11F_B10F;
            case 14:
                return this._gl.RGB9_E5;
            case 8:
                return this._gl.RGBA4;
            case 9:
                return this._gl.RGB5_A1;
            case 11:
                switch (format) {
                    case 5:
                        return this._gl.RGB10_A2; // By default. Other possibility is RGB5_A1.
                    case 11:
                        return this._gl.RGB10_A2UI;
                    default:
                        return this._gl.RGB10_A2;
                }
        }
        return useSRGBBuffer ? this._gl.SRGB8_ALPHA8 : this._gl.RGBA8;
    };
    /**
     * @param type
     * @hidden
     */
    ThinEngine.prototype._getRGBAMultiSampleBufferFormat = function (type) {
        if (type === 1) {
            return this._gl.RGBA32F;
        }
        else if (type === 2) {
            return this._gl.RGBA16F;
        }
        return this._gl.RGBA8;
    };
    /**
     * @param url
     * @param onSuccess
     * @param onProgress
     * @param offlineProvider
     * @param useArrayBuffer
     * @param onError
     * @hidden
     */
    ThinEngine.prototype._loadFile = function (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError) {
        var _this = this;
        var request = ThinEngine._FileToolsLoadFile(url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError);
        this._activeRequests.push(request);
        request.onCompleteObservable.add(function (request) {
            _this._activeRequests.splice(_this._activeRequests.indexOf(request), 1);
        });
        return request;
    };
    /**
     * Loads a file from a url
     * @param url url to load
     * @param onSuccess callback called when the file successfully loads
     * @param onProgress callback called while file is loading (if the server supports this mode)
     * @param offlineProvider defines the offline provider for caching
     * @param useArrayBuffer defines a boolean indicating that date must be returned as ArrayBuffer
     * @param onError callback called when the file fails to load
     * @returns a file request object
     * @hidden
     */
    ThinEngine._FileToolsLoadFile = function (url, onSuccess, onProgress, offlineProvider, useArrayBuffer, onError) {
        throw _WarnImport("FileTools");
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
    ThinEngine.prototype.readPixels = function (x, y, width, height, hasAlpha, flushRenderer) {
        if (hasAlpha === void 0) { hasAlpha = true; }
        if (flushRenderer === void 0) { flushRenderer = true; }
        var numChannels = hasAlpha ? 4 : 3;
        var format = hasAlpha ? this._gl.RGBA : this._gl.RGB;
        var data = new Uint8Array(height * width * numChannels);
        if (flushRenderer) {
            this.flushFramebuffer();
        }
        this._gl.readPixels(x, y, width, height, format, this._gl.UNSIGNED_BYTE, data);
        return Promise.resolve(data);
    };
    Object.defineProperty(ThinEngine, "IsSupportedAsync", {
        /**
         * Gets a Promise<boolean> indicating if the engine can be instantiated (ie. if a webGL context can be found)
         */
        get: function () {
            return Promise.resolve(this.isSupported());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThinEngine, "IsSupported", {
        /**
         * Gets a boolean indicating if the engine can be instantiated (ie. if a webGL context can be found)
         */
        get: function () {
            return this.isSupported(); // Backward compat
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets a boolean indicating if the engine can be instantiated (ie. if a webGL context can be found)
     * @returns true if the engine can be created
     * @ignorenaming
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ThinEngine.isSupported = function () {
        if (this._HasMajorPerformanceCaveat !== null) {
            return !this._HasMajorPerformanceCaveat; // We know it is performant so WebGL is supported
        }
        if (this._IsSupported === null) {
            try {
                var tempcanvas = this._CreateCanvas(1, 1);
                var gl = tempcanvas.getContext("webgl") || tempcanvas.getContext("experimental-webgl");
                this._IsSupported = gl != null && !!window.WebGLRenderingContext;
            }
            catch (e) {
                this._IsSupported = false;
            }
        }
        return this._IsSupported;
    };
    Object.defineProperty(ThinEngine, "HasMajorPerformanceCaveat", {
        /**
         * Gets a boolean indicating if the engine can be instantiated on a performant device (ie. if a webGL context can be found and it does not use a slow implementation)
         */
        get: function () {
            if (this._HasMajorPerformanceCaveat === null) {
                try {
                    var tempcanvas = this._CreateCanvas(1, 1);
                    var gl = tempcanvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
                        tempcanvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: true });
                    this._HasMajorPerformanceCaveat = !gl;
                }
                catch (e) {
                    this._HasMajorPerformanceCaveat = false;
                }
            }
            return this._HasMajorPerformanceCaveat;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Find the next highest power of two.
     * @param x Number to start search from.
     * @return Next highest power of two.
     */
    ThinEngine.CeilingPOT = function (x) {
        x--;
        x |= x >> 1;
        x |= x >> 2;
        x |= x >> 4;
        x |= x >> 8;
        x |= x >> 16;
        x++;
        return x;
    };
    /**
     * Find the next lowest power of two.
     * @param x Number to start search from.
     * @return Next lowest power of two.
     */
    ThinEngine.FloorPOT = function (x) {
        x = x | (x >> 1);
        x = x | (x >> 2);
        x = x | (x >> 4);
        x = x | (x >> 8);
        x = x | (x >> 16);
        return x - (x >> 1);
    };
    /**
     * Find the nearest power of two.
     * @param x Number to start search from.
     * @return Next nearest power of two.
     */
    ThinEngine.NearestPOT = function (x) {
        var c = ThinEngine.CeilingPOT(x);
        var f = ThinEngine.FloorPOT(x);
        return c - x > x - f ? f : c;
    };
    /**
     * Get the closest exponent of two
     * @param value defines the value to approximate
     * @param max defines the maximum value to return
     * @param mode defines how to define the closest value
     * @returns closest exponent of two of the given value
     */
    ThinEngine.GetExponentOfTwo = function (value, max, mode) {
        if (mode === void 0) { mode = 2; }
        var pot;
        switch (mode) {
            case 1:
                pot = ThinEngine.FloorPOT(value);
                break;
            case 2:
                pot = ThinEngine.NearestPOT(value);
                break;
            case 3:
            default:
                pot = ThinEngine.CeilingPOT(value);
                break;
        }
        return Math.min(pot, max);
    };
    /**
     * Queue a new function into the requested animation frame pool (ie. this function will be executed byt the browser for the next frame)
     * @param func - the function to be called
     * @param requester - the object that will request the next frame. Falls back to window.
     * @returns frame number
     */
    ThinEngine.QueueNewFrame = function (func, requester) {
        if (!IsWindowObjectExist()) {
            if (typeof requestAnimationFrame !== "undefined") {
                return requestAnimationFrame(func);
            }
            return setTimeout(func, 16);
        }
        if (!requester) {
            requester = window;
        }
        if (requester.requestPostAnimationFrame) {
            return requester.requestPostAnimationFrame(func);
        }
        else if (requester.requestAnimationFrame) {
            return requester.requestAnimationFrame(func);
        }
        else if (requester.msRequestAnimationFrame) {
            return requester.msRequestAnimationFrame(func);
        }
        else if (requester.webkitRequestAnimationFrame) {
            return requester.webkitRequestAnimationFrame(func);
        }
        else if (requester.mozRequestAnimationFrame) {
            return requester.mozRequestAnimationFrame(func);
        }
        else if (requester.oRequestAnimationFrame) {
            return requester.oRequestAnimationFrame(func);
        }
        else {
            return window.setTimeout(func, 16);
        }
    };
    /**
     * Gets host document
     * @returns the host document object
     */
    ThinEngine.prototype.getHostDocument = function () {
        if (this._renderingCanvas && this._renderingCanvas.ownerDocument) {
            return this._renderingCanvas.ownerDocument;
        }
        return document;
    };
    /** Use this array to turn off some WebGL2 features on known buggy browsers version */
    ThinEngine.ExceptionList = [
        { key: "Chrome/63.0", capture: "63\\.0\\.3239\\.(\\d+)", captureConstraint: 108, targets: ["uniformBuffer"] },
        { key: "Firefox/58", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
        { key: "Firefox/59", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
        { key: "Chrome/72.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
        { key: "Chrome/73.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
        { key: "Chrome/74.+?Mobile", capture: null, captureConstraint: null, targets: ["vao"] },
        { key: "Mac OS.+Chrome/71", capture: null, captureConstraint: null, targets: ["vao"] },
        { key: "Mac OS.+Chrome/72", capture: null, captureConstraint: null, targets: ["vao"] },
        { key: "Mac OS.+Chrome", capture: null, captureConstraint: null, targets: ["uniformBuffer"] },
        // desktop osx safari 15.4
        { key: ".*AppleWebKit.*(15.4).*Safari", capture: null, captureConstraint: null, targets: ["antialias", "maxMSAASamples"] },
        // mobile browsers using safari 15.4 on ios
        { key: ".*(15.4).*AppleWebKit.*Safari", capture: null, captureConstraint: null, targets: ["antialias", "maxMSAASamples"] },
    ];
    /** @hidden */
    ThinEngine._TextureLoaders = [];
    // Updatable statics so stick with vars here
    /**
     * Gets or sets the epsilon value used by collision engine
     */
    ThinEngine.CollisionsEpsilon = 0.001;
    // Statics
    ThinEngine._IsSupported = null;
    ThinEngine._HasMajorPerformanceCaveat = null;
    return ThinEngine;
}());
export { ThinEngine };
//# sourceMappingURL=thinEngine.js.map