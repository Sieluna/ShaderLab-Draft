
import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import type { Scene } from "../scene";
import { InternalTexture } from "../Materials/Textures/internalTexture";
import type { IOfflineProvider } from "../Offline/IOfflineProvider";
import type { ILoadingScreen } from "../Loading/loadingScreen";
import type { WebGLPipelineContext } from "./WebGL/webGLPipelineContext";
import type { IPipelineContext } from "./IPipelineContext";
import type { ICustomAnimationFrameRequester } from "../Misc/customAnimationFrameRequester";
import type { EngineOptions } from "./thinEngine";
import { ThinEngine } from "./thinEngine";
import type { IViewportLike, IColor4Like } from "../Maths/math.like";
import type { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture";
import { PerformanceMonitor } from "../Misc/performanceMonitor";
import type { DataBuffer } from "../Buffers/dataBuffer";
import { PerfCounter } from "../Misc/perfCounter";
import type { RenderTargetWrapper } from "./renderTargetWrapper";
import "./Extensions/engine.alpha";
import "./Extensions/engine.readTexture";
import "./Extensions/engine.dynamicBuffer";
import type { IAudioEngine } from "../Audio/Interfaces/IAudioEngine";
declare type Material = import("../Materials/material").Material;
declare type PostProcess = import("../PostProcesses/postProcess").PostProcess;
/**
 * Defines the interface used by display changed events
 */
export interface IDisplayChangedEventArgs {
    /** Gets the vrDisplay object (if any) */
    vrDisplay: Nullable<any>;
    /** Gets a boolean indicating if webVR is supported */
    vrSupported: boolean;
}
/**
 * Defines the interface used by objects containing a viewport (like a camera)
 */
interface IViewportOwnerLike {
    /**
     * Gets or sets the viewport
     */
    viewport: IViewportLike;
}
/**
 * The engine class is responsible for interfacing with all lower-level APIs such as WebGL and Audio
 */
export declare class Engine extends ThinEngine {
    /** Defines that alpha blending is disabled */
    static readonly ALPHA_DISABLE = 0;
    /** Defines that alpha blending to SRC ALPHA * SRC + DEST */
    static readonly ALPHA_ADD = 1;
    /** Defines that alpha blending to SRC ALPHA * SRC + (1 - SRC ALPHA) * DEST */
    static readonly ALPHA_COMBINE = 2;
    /** Defines that alpha blending to DEST - SRC * DEST */
    static readonly ALPHA_SUBTRACT = 3;
    /** Defines that alpha blending to SRC * DEST */
    static readonly ALPHA_MULTIPLY = 4;
    /** Defines that alpha blending to SRC ALPHA * SRC + (1 - SRC) * DEST */
    static readonly ALPHA_MAXIMIZED = 5;
    /** Defines that alpha blending to SRC + DEST */
    static readonly ALPHA_ONEONE = 6;
    /** Defines that alpha blending to SRC + (1 - SRC ALPHA) * DEST */
    static readonly ALPHA_PREMULTIPLIED = 7;
    /**
     * Defines that alpha blending to SRC + (1 - SRC ALPHA) * DEST
     * Alpha will be set to (1 - SRC ALPHA) * DEST ALPHA
     */
    static readonly ALPHA_PREMULTIPLIED_PORTERDUFF = 8;
    /** Defines that alpha blending to CST * SRC + (1 - CST) * DEST */
    static readonly ALPHA_INTERPOLATE = 9;
    /**
     * Defines that alpha blending to SRC + (1 - SRC) * DEST
     * Alpha will be set to SRC ALPHA + (1 - SRC ALPHA) * DEST ALPHA
     */
    static readonly ALPHA_SCREENMODE = 10;
    /** Defines that the resource is not delayed*/
    static readonly DELAYLOADSTATE_NONE = 0;
    /** Defines that the resource was successfully delay loaded */
    static readonly DELAYLOADSTATE_LOADED = 1;
    /** Defines that the resource is currently delay loading */
    static readonly DELAYLOADSTATE_LOADING = 2;
    /** Defines that the resource is delayed and has not started loading */
    static readonly DELAYLOADSTATE_NOTLOADED = 4;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will never pass. i.e. Nothing will be drawn */
    static readonly NEVER = 512;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will always pass. i.e. Pixels will be drawn in the order they are drawn */
    static readonly ALWAYS = 519;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than the stored value */
    static readonly LESS = 513;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is equals to the stored value */
    static readonly EQUAL = 514;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than or equal to the stored value */
    static readonly LEQUAL = 515;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than the stored value */
    static readonly GREATER = 516;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than or equal to the stored value */
    static readonly GEQUAL = 518;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is not equal to the stored value */
    static readonly NOTEQUAL = 517;
    /** Passed to stencilOperation to specify that stencil value must be kept */
    static readonly KEEP = 7680;
    /** Passed to stencilOperation to specify that stencil value must be replaced */
    static readonly REPLACE = 7681;
    /** Passed to stencilOperation to specify that stencil value must be incremented */
    static readonly INCR = 7682;
    /** Passed to stencilOperation to specify that stencil value must be decremented */
    static readonly DECR = 7683;
    /** Passed to stencilOperation to specify that stencil value must be inverted */
    static readonly INVERT = 5386;
    /** Passed to stencilOperation to specify that stencil value must be incremented with wrapping */
    static readonly INCR_WRAP = 34055;
    /** Passed to stencilOperation to specify that stencil value must be decremented with wrapping */
    static readonly DECR_WRAP = 34056;
    /** Texture is not repeating outside of 0..1 UVs */
    static readonly TEXTURE_CLAMP_ADDRESSMODE = 0;
    /** Texture is repeating outside of 0..1 UVs */
    static readonly TEXTURE_WRAP_ADDRESSMODE = 1;
    /** Texture is repeating and mirrored */
    static readonly TEXTURE_MIRROR_ADDRESSMODE = 2;
    /** ALPHA */
    static readonly TEXTUREFORMAT_ALPHA = 0;
    /** LUMINANCE */
    static readonly TEXTUREFORMAT_LUMINANCE = 1;
    /** LUMINANCE_ALPHA */
    static readonly TEXTUREFORMAT_LUMINANCE_ALPHA = 2;
    /** RGB */
    static readonly TEXTUREFORMAT_RGB = 4;
    /** RGBA */
    static readonly TEXTUREFORMAT_RGBA = 5;
    /** RED */
    static readonly TEXTUREFORMAT_RED = 6;
    /** RED (2nd reference) */
    static readonly TEXTUREFORMAT_R = 6;
    /** RG */
    static readonly TEXTUREFORMAT_RG = 7;
    /** RED_INTEGER */
    static readonly TEXTUREFORMAT_RED_INTEGER = 8;
    /** RED_INTEGER (2nd reference) */
    static readonly TEXTUREFORMAT_R_INTEGER = 8;
    /** RG_INTEGER */
    static readonly TEXTUREFORMAT_RG_INTEGER = 9;
    /** RGB_INTEGER */
    static readonly TEXTUREFORMAT_RGB_INTEGER = 10;
    /** RGBA_INTEGER */
    static readonly TEXTUREFORMAT_RGBA_INTEGER = 11;
    /** UNSIGNED_BYTE */
    static readonly TEXTURETYPE_UNSIGNED_BYTE = 0;
    /** UNSIGNED_BYTE (2nd reference) */
    static readonly TEXTURETYPE_UNSIGNED_INT = 0;
    /** FLOAT */
    static readonly TEXTURETYPE_FLOAT = 1;
    /** HALF_FLOAT */
    static readonly TEXTURETYPE_HALF_FLOAT = 2;
    /** BYTE */
    static readonly TEXTURETYPE_BYTE = 3;
    /** SHORT */
    static readonly TEXTURETYPE_SHORT = 4;
    /** UNSIGNED_SHORT */
    static readonly TEXTURETYPE_UNSIGNED_SHORT = 5;
    /** INT */
    static readonly TEXTURETYPE_INT = 6;
    /** UNSIGNED_INT */
    static readonly TEXTURETYPE_UNSIGNED_INTEGER = 7;
    /** UNSIGNED_SHORT_4_4_4_4 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_4_4_4_4 = 8;
    /** UNSIGNED_SHORT_5_5_5_1 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_5_5_5_1 = 9;
    /** UNSIGNED_SHORT_5_6_5 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_5_6_5 = 10;
    /** UNSIGNED_INT_2_10_10_10_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_2_10_10_10_REV = 11;
    /** UNSIGNED_INT_24_8 */
    static readonly TEXTURETYPE_UNSIGNED_INT_24_8 = 12;
    /** UNSIGNED_INT_10F_11F_11F_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_10F_11F_11F_REV = 13;
    /** UNSIGNED_INT_5_9_9_9_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_5_9_9_9_REV = 14;
    /** FLOAT_32_UNSIGNED_INT_24_8_REV */
    static readonly TEXTURETYPE_FLOAT_32_UNSIGNED_INT_24_8_REV = 15;
    /** nearest is mag = nearest and min = nearest and mip = none */
    static readonly TEXTURE_NEAREST_SAMPLINGMODE = 1;
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    static readonly TEXTURE_BILINEAR_SAMPLINGMODE = 2;
    /** Trilinear is mag = linear and min = linear and mip = linear */
    static readonly TEXTURE_TRILINEAR_SAMPLINGMODE = 3;
    /** nearest is mag = nearest and min = nearest and mip = linear */
    static readonly TEXTURE_NEAREST_NEAREST_MIPLINEAR = 8;
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    static readonly TEXTURE_LINEAR_LINEAR_MIPNEAREST = 11;
    /** Trilinear is mag = linear and min = linear and mip = linear */
    static readonly TEXTURE_LINEAR_LINEAR_MIPLINEAR = 3;
    /** mag = nearest and min = nearest and mip = nearest */
    static readonly TEXTURE_NEAREST_NEAREST_MIPNEAREST = 4;
    /** mag = nearest and min = linear and mip = nearest */
    static readonly TEXTURE_NEAREST_LINEAR_MIPNEAREST = 5;
    /** mag = nearest and min = linear and mip = linear */
    static readonly TEXTURE_NEAREST_LINEAR_MIPLINEAR = 6;
    /** mag = nearest and min = linear and mip = none */
    static readonly TEXTURE_NEAREST_LINEAR = 7;
    /** mag = nearest and min = nearest and mip = none */
    static readonly TEXTURE_NEAREST_NEAREST = 1;
    /** mag = linear and min = nearest and mip = nearest */
    static readonly TEXTURE_LINEAR_NEAREST_MIPNEAREST = 9;
    /** mag = linear and min = nearest and mip = linear */
    static readonly TEXTURE_LINEAR_NEAREST_MIPLINEAR = 10;
    /** mag = linear and min = linear and mip = none */
    static readonly TEXTURE_LINEAR_LINEAR = 2;
    /** mag = linear and min = nearest and mip = none */
    static readonly TEXTURE_LINEAR_NEAREST = 12;
    /** Explicit coordinates mode */
    static readonly TEXTURE_EXPLICIT_MODE = 0;
    /** Spherical coordinates mode */
    static readonly TEXTURE_SPHERICAL_MODE = 1;
    /** Planar coordinates mode */
    static readonly TEXTURE_PLANAR_MODE = 2;
    /** Cubic coordinates mode */
    static readonly TEXTURE_CUBIC_MODE = 3;
    /** Projection coordinates mode */
    static readonly TEXTURE_PROJECTION_MODE = 4;
    /** Skybox coordinates mode */
    static readonly TEXTURE_SKYBOX_MODE = 5;
    /** Inverse Cubic coordinates mode */
    static readonly TEXTURE_INVCUBIC_MODE = 6;
    /** Equirectangular coordinates mode */
    static readonly TEXTURE_EQUIRECTANGULAR_MODE = 7;
    /** Equirectangular Fixed coordinates mode */
    static readonly TEXTURE_FIXED_EQUIRECTANGULAR_MODE = 8;
    /** Equirectangular Fixed Mirrored coordinates mode */
    static readonly TEXTURE_FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
    /** Defines that texture rescaling will use a floor to find the closer power of 2 size */
    static readonly SCALEMODE_FLOOR = 1;
    /** Defines that texture rescaling will look for the nearest power of 2 size */
    static readonly SCALEMODE_NEAREST = 2;
    /** Defines that texture rescaling will use a ceil to find the closer power of 2 size */
    static readonly SCALEMODE_CEILING = 3;
    /**
     * Returns the current npm package of the sdk
     */
    static get NpmPackage(): string;
    /**
     * Returns the current version of the framework
     */
    static get Version(): string;
    /** Gets the list of created engines */
    static get Instances(): Engine[];
    /**
     * Gets the latest created engine
     */
    static get LastCreatedEngine(): Nullable<Engine>;
    /**
     * Gets the latest created scene
     */
    static get LastCreatedScene(): Nullable<Scene>;
    /** @hidden */
    /**
     * Engine abstraction for loading and creating an image bitmap from a given source string.
     * @param imageSource source to load the image from.
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap.
     */
    _createImageBitmapFromSource(imageSource: string, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    /**
     * Engine abstraction for createImageBitmap
     * @param image source for image
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap
     */
    createImageBitmap(image: ImageBitmapSource, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    /**
     * Resize an image and returns the image data as an uint8array
     * @param image image to resize
     * @param bufferWidth destination buffer width
     * @param bufferHeight destination buffer height
     * @returns an uint8array containing RGBA values of bufferWidth * bufferHeight size
     */
    resizeImageBitmap(image: HTMLImageElement | ImageBitmap, bufferWidth: number, bufferHeight: number): Uint8Array;
    /**
     * Will flag all materials in all scenes in all engines as dirty to trigger new shader compilation
     * @param flag defines which part of the materials must be marked as dirty
     * @param predicate defines a predicate used to filter which materials should be affected
     */
    static MarkAllMaterialsAsDirty(flag: number, predicate?: (mat: Material) => boolean): void;
    /**
     * Method called to create the default loading screen.
     * This can be overridden in your own app.
     * @param canvas The rendering canvas element
     * @returns The loading screen
     */
    static DefaultLoadingScreenFactory(canvas: HTMLCanvasElement): ILoadingScreen;
    /**
     * Method called to create the default rescale post process on each engine.
     */
    static _RescalePostProcessFactory: Nullable<(engine: Engine) => PostProcess>;
    /**
     * Gets or sets a boolean to enable/disable IndexedDB support and avoid XHR on .manifest
     **/
    enableOfflineSupport: boolean;
    /**
     * Gets or sets a boolean to enable/disable checking manifest if IndexedDB support is enabled (js will always consider the database is up to date)
     **/
    disableManifestCheck: boolean;
    /**
     * Gets the list of created scenes
     */
    scenes: Scene[];
    /** @hidden */
    _virtualScenes: Scene[];
    /**
     * Event raised when a new scene is created
     */
    onNewSceneAddedObservable: Observable<Scene>;
    /**
     * Gets the list of created postprocesses
     */
    postProcesses: import("../PostProcesses/postProcess").PostProcess[];
    /**
     * Gets a boolean indicating if the pointer is currently locked
     */
    isPointerLock: boolean;
    /**
     * Observable event triggered each time the rendering canvas is resized
     */
    onResizeObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas loses focus
     */
    onCanvasBlurObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas gains focus
     */
    onCanvasFocusObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas receives pointerout event
     */
    onCanvasPointerOutObservable: Observable<PointerEvent>;
    /**
     * Observable raised when the engine begins a new frame
     */
    onBeginFrameObservable: Observable<Engine>;
    /**
     * If set, will be used to request the next animation frame for the render loop
     */
    customAnimationFrameRequester: Nullable<ICustomAnimationFrameRequester>;
    /**
     * Observable raised when the engine ends the current frame
     */
    onEndFrameObservable: Observable<Engine>;
    /**
     * Observable raised when the engine is about to compile a shader
     */
    onBeforeShaderCompilationObservable: Observable<Engine>;
    /**
     * Observable raised when the engine has just compiled a shader
     */
    onAfterShaderCompilationObservable: Observable<Engine>;
    /**
     * Gets the audio engine
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music
     * @ignorenaming
     */
    static audioEngine: Nullable<IAudioEngine>;
    /**
     * Default AudioEngine factory responsible of creating the Audio Engine.
     * By default, this will create a BabylonJS Audio Engine if the workload has been embedded.
     */
    static AudioEngineFactory: (hostElement: Nullable<HTMLElement>, audioContext: Nullable<AudioContext>, audioDestination: Nullable<AudioDestinationNode | MediaStreamAudioDestinationNode>) => IAudioEngine;
    /**
     * Default offline support factory responsible of creating a tool used to store data locally.
     * By default, this will create a Database object if the workload has been embedded.
     */
    static OfflineProviderFactory: (urlToScene: string, callbackManifestChecked: (checked: boolean) => any, disableManifestCheck: boolean) => IOfflineProvider;
    private _loadingScreen;
    private _pointerLockRequested;
    private _rescalePostProcess;
    protected _deterministicLockstep: boolean;
    protected _lockstepMaxSteps: number;
    protected _timeStep: number;
    protected get _supportsHardwareTextureRescaling(): boolean;
    private _fps;
    private _deltaTime;
    /** @hidden */
    _drawCalls: PerfCounter;
    /** Gets or sets the tab index to set to the rendering canvas. 1 is the minimum value to set to be able to capture keyboard events */
    canvasTabIndex: number;
    /**
     * Turn this value on if you want to pause FPS computation when in background
     */
    disablePerformanceMonitorInBackground: boolean;
    private _performanceMonitor;
    /**
     * Gets the performance monitor attached to this engine
     * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#engineinstrumentation
     */
    get performanceMonitor(): PerformanceMonitor;
    private _onFocus;
    private _onBlur;
    private _onCanvasPointerOut;
    private _onCanvasBlur;
    private _onCanvasFocus;
    private _onFullscreenChange;
    private _onPointerLockChange;
    protected _compatibilityMode: boolean;
    /**
     * (WebGPU only) True (default) to be in compatibility mode, meaning rendering all existing scenes without artifacts (same rendering than WebGL).
     * Setting the property to false will improve performances but may not work in some scenes if some precautions are not taken.
     * See https://doc.babylonjs.com/advanced_topics/webGPU/webGPUOptimization/webGPUNonCompatibilityMode for more details
     */
    get compatibilityMode(): boolean;
    set compatibilityMode(mode: boolean);
    /**
     * Gets the HTML element used to attach event listeners
     * @returns a HTML element
     */
    getInputElement(): Nullable<HTMLElement>;
    /**
     * Creates a new engine
     * @param canvasOrContext defines the canvas or WebGL context to use for rendering. If you provide a WebGL context, Babylon.js will not hook events on the canvas (like pointers, keyboards, etc...) so no event observables will be available. This is mostly used when Babylon.js is used as a plugin on a system which already used the WebGL context
     * @param antialias defines enable antialiasing (default: false)
     * @param options defines further options to be sent to the getContext() function
     * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
     */
    constructor(canvasOrContext: Nullable<HTMLCanvasElement | OffscreenCanvas | WebGLRenderingContext | WebGL2RenderingContext>, antialias?: boolean, options?: EngineOptions, adaptToDeviceRatio?: boolean);
    /**
     * Shared initialization across engines types.
     * @param canvas The canvas associated with this instance of the engine.
     * @param doNotHandleTouchAction Defines that engine should ignore modifying touch action attribute and style
     * @param audioEngine Defines if an audio engine should be created by default
     */
    protected _sharedInit(canvas: HTMLCanvasElement, doNotHandleTouchAction: boolean, audioEngine: boolean): void;
    /**
     * Gets current aspect ratio
     * @param viewportOwner defines the camera to use to get the aspect ratio
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the aspect ratio
     */
    getAspectRatio(viewportOwner: IViewportOwnerLike, useScreen?: boolean): number;
    /**
     * Gets current screen aspect ratio
     * @returns a number defining the aspect ratio
     */
    getScreenAspectRatio(): number;
    /**
     * Gets the client rect of the HTML canvas attached with the current webGL context
     * @returns a client rectangle
     */
    getRenderingCanvasClientRect(): Nullable<ClientRect>;
    /**
     * Gets the client rect of the HTML element used for events
     * @returns a client rectangle
     */
    getInputElementClientRect(): Nullable<ClientRect>;
    /**
     * Gets a boolean indicating that the engine is running in deterministic lock step mode
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns true if engine is in deterministic lock step mode
     */
    isDeterministicLockStep(): boolean;
    /**
     * Gets the max steps when engine is running in deterministic lock step
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns the max steps
     */
    getLockstepMaxSteps(): number;
    /**
     * Returns the time in ms between steps when using deterministic lock step.
     * @returns time step in (ms)
     */
    getTimeStep(): number;
    /**
     * Force the mipmap generation for the given render target texture
     * @param texture defines the render target texture to use
     * @param unbind defines whether or not to unbind the texture after generation. Defaults to true.
     */
    generateMipMapsForCubemap(texture: InternalTexture, unbind?: boolean): void;
    /** States */
    /**
     * Gets a boolean indicating if depth testing is enabled
     * @returns the current state
     */
    getDepthBuffer(): boolean;
    /**
     * Enable or disable depth buffering
     * @param enable defines the state to set
     */
    setDepthBuffer(enable: boolean): void;
    /**
     * Gets a boolean indicating if depth writing is enabled
     * @returns the current depth writing state
     */
    getDepthWrite(): boolean;
    /**
     * Enable or disable depth writing
     * @param enable defines the state to set
     */
    setDepthWrite(enable: boolean): void;
    /**
     * Gets a boolean indicating if stencil buffer is enabled
     * @returns the current stencil buffer state
     */
    getStencilBuffer(): boolean;
    /**
     * Enable or disable the stencil buffer
     * @param enable defines if the stencil buffer must be enabled or disabled
     */
    setStencilBuffer(enable: boolean): void;
    /**
     * Gets the current stencil mask
     * @returns a number defining the new stencil mask to use
     */
    getStencilMask(): number;
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    setStencilMask(mask: number): void;
    /**
     * Gets the current stencil function
     * @returns a number defining the stencil function to use
     */
    getStencilFunction(): number;
    /**
     * Gets the current stencil reference value
     * @returns a number defining the stencil reference value to use
     */
    getStencilFunctionReference(): number;
    /**
     * Gets the current stencil mask
     * @returns a number defining the stencil mask to use
     */
    getStencilFunctionMask(): number;
    /**
     * Sets the current stencil function
     * @param stencilFunc defines the new stencil function to use
     */
    setStencilFunction(stencilFunc: number): void;
    /**
     * Sets the current stencil reference
     * @param reference defines the new stencil reference to use
     */
    setStencilFunctionReference(reference: number): void;
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    setStencilFunctionMask(mask: number): void;
    /**
     * Gets the current stencil operation when stencil fails
     * @returns a number defining stencil operation to use when stencil fails
     */
    getStencilOperationFail(): number;
    /**
     * Gets the current stencil operation when depth fails
     * @returns a number defining stencil operation to use when depth fails
     */
    getStencilOperationDepthFail(): number;
    /**
     * Gets the current stencil operation when stencil passes
     * @returns a number defining stencil operation to use when stencil passes
     */
    getStencilOperationPass(): number;
    /**
     * Sets the stencil operation to use when stencil fails
     * @param operation defines the stencil operation to use when stencil fails
     */
    setStencilOperationFail(operation: number): void;
    /**
     * Sets the stencil operation to use when depth fails
     * @param operation defines the stencil operation to use when depth fails
     */
    setStencilOperationDepthFail(operation: number): void;
    /**
     * Sets the stencil operation to use when stencil passes
     * @param operation defines the stencil operation to use when stencil passes
     */
    setStencilOperationPass(operation: number): void;
    /**
     * Sets a boolean indicating if the dithering state is enabled or disabled
     * @param value defines the dithering state
     */
    setDitheringState(value: boolean): void;
    /**
     * Sets a boolean indicating if the rasterizer state is enabled or disabled
     * @param value defines the rasterizer state
     */
    setRasterizerState(value: boolean): void;
    /**
     * Gets the current depth function
     * @returns a number defining the depth function
     */
    getDepthFunction(): Nullable<number>;
    /**
     * Sets the current depth function
     * @param depthFunc defines the function to use
     */
    setDepthFunction(depthFunc: number): void;
    /**
     * Sets the current depth function to GREATER
     */
    setDepthFunctionToGreater(): void;
    /**
     * Sets the current depth function to GEQUAL
     */
    setDepthFunctionToGreaterOrEqual(): void;
    /**
     * Sets the current depth function to LESS
     */
    setDepthFunctionToLess(): void;
    /**
     * Sets the current depth function to LEQUAL
     */
    setDepthFunctionToLessOrEqual(): void;
    private _cachedStencilBuffer;
    private _cachedStencilFunction;
    private _cachedStencilMask;
    private _cachedStencilOperationPass;
    private _cachedStencilOperationFail;
    private _cachedStencilOperationDepthFail;
    private _cachedStencilReference;
    /**
     * Caches the the state of the stencil buffer
     */
    cacheStencilState(): void;
    /**
     * Restores the state of the stencil buffer
     */
    restoreStencilState(): void;
    /**
     * Directly set the WebGL Viewport
     * @param x defines the x coordinate of the viewport (in screen space)
     * @param y defines the y coordinate of the viewport (in screen space)
     * @param width defines the width of the viewport (in screen space)
     * @param height defines the height of the viewport (in screen space)
     * @return the current viewport Object (if any) that is being replaced by this call. You can restore this viewport later on to go back to the original state
     */
    setDirectViewport(x: number, y: number, width: number, height: number): Nullable<IViewportLike>;
    /**
     * Executes a scissor clear (ie. a clear on a specific portion of the screen)
     * @param x defines the x-coordinate of the bottom left corner of the clear rectangle
     * @param y defines the y-coordinate of the corner of the clear rectangle
     * @param width defines the width of the clear rectangle
     * @param height defines the height of the clear rectangle
     * @param clearColor defines the clear color
     */
    scissorClear(x: number, y: number, width: number, height: number, clearColor: IColor4Like): void;
    /**
     * Enable scissor test on a specific rectangle (ie. render will only be executed on a specific portion of the screen)
     * @param x defines the x-coordinate of the bottom left corner of the clear rectangle
     * @param y defines the y-coordinate of the corner of the clear rectangle
     * @param width defines the width of the clear rectangle
     * @param height defines the height of the clear rectangle
     */
    enableScissor(x: number, y: number, width: number, height: number): void;
    /**
     * Disable previously set scissor test rectangle
     */
    disableScissor(): void;
    /**
     * @param numDrawCalls
     * @hidden
     */
    _reportDrawCall(numDrawCalls?: number): void;
    /**
     * Initializes a webVR display and starts listening to display change events
     * The onVRDisplayChangedObservable will be notified upon these changes
     * @returns The onVRDisplayChangedObservable
     */
    initWebVR(): Observable<IDisplayChangedEventArgs>;
    /** @hidden */
    _prepareVRComponent(): void;
    /**
     * @param canvas
     * @param document
     * @hidden
     */
    _connectVREvents(canvas?: HTMLCanvasElement, document?: any): void;
    /** @hidden */
    _submitVRFrame(): void;
    /**
     * Call this function to leave webVR mode
     * Will do nothing if webVR is not supported or if there is no webVR device
     * @see https://doc.babylonjs.com/how_to/webvr_camera
     */
    disableVR(): void;
    /**
     * Gets a boolean indicating that the system is in VR mode and is presenting
     * @returns true if VR mode is engaged
     */
    isVRPresenting(): boolean;
    /** @hidden */
    _requestVRFrame(): void;
    /**
     * @param url
     * @param offlineProvider
     * @param useArrayBuffer
     * @hidden
     */
    _loadFileAsync(url: string, offlineProvider?: IOfflineProvider, useArrayBuffer?: boolean): Promise<string | ArrayBuffer>;
    /**
     * Gets the source code of the vertex shader associated with a specific webGL program
     * @param program defines the program to use
     * @returns a string containing the source code of the vertex shader associated with the program
     */
    getVertexShaderSource(program: WebGLProgram): Nullable<string>;
    /**
     * Gets the source code of the fragment shader associated with a specific webGL program
     * @param program defines the program to use
     * @returns a string containing the source code of the fragment shader associated with the program
     */
    getFragmentShaderSource(program: WebGLProgram): Nullable<string>;
    /**
     * Sets a depth stencil texture from a render target to the according uniform.
     * @param channel The texture channel
     * @param uniform The uniform to set
     * @param texture The render target texture containing the depth stencil texture to apply
     * @param name The texture name
     */
    setDepthStencilTexture(channel: number, uniform: Nullable<WebGLUniformLocation>, texture: Nullable<RenderTargetTexture>, name?: string): void;
    /**
     * Sets a texture to the webGL context from a postprocess
     * @param channel defines the channel to use
     * @param postProcess defines the source postprocess
     * @param name name of the channel
     */
    setTextureFromPostProcess(channel: number, postProcess: Nullable<PostProcess>, name: string): void;
    /**
     * Binds the output of the passed in post process to the texture channel specified
     * @param channel The channel the texture should be bound to
     * @param postProcess The post process which's output should be bound
     * @param name name of the channel
     */
    setTextureFromPostProcessOutput(channel: number, postProcess: Nullable<PostProcess>, name: string): void;
    protected _rebuildBuffers(): void;
    /** @hidden */
    _renderFrame(): void;
    _renderLoop(): void;
    /** @hidden */
    _renderViews(): boolean;
    /**
     * Toggle full screen mode
     * @param requestPointerLock defines if a pointer lock should be requested from the user
     */
    switchFullscreen(requestPointerLock: boolean): void;
    /**
     * Enters full screen mode
     * @param requestPointerLock defines if a pointer lock should be requested from the user
     */
    enterFullscreen(requestPointerLock: boolean): void;
    /**
     * Exits full screen mode
     */
    exitFullscreen(): void;
    /**
     * Enters Pointerlock mode
     */
    enterPointerlock(): void;
    /**
     * Exits Pointerlock mode
     */
    exitPointerlock(): void;
    /**
     * Begin a new frame
     */
    beginFrame(): void;
    /**
     * End the current frame
     */
    endFrame(): void;
    /**
     * Resize the view according to the canvas' size
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     */
    resize(forceSetSize?: boolean): void;
    /**
     * Force a specific size of the canvas
     * @param width defines the new canvas' width
     * @param height defines the new canvas' height
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     * @returns true if the size was changed
     */
    setSize(width: number, height: number, forceSetSize?: boolean): boolean;
    _deletePipelineContext(pipelineContext: IPipelineContext): void;
    createShaderProgram(pipelineContext: IPipelineContext, vertexCode: string, fragmentCode: string, defines: Nullable<string>, context?: WebGLRenderingContext, transformFeedbackVaryings?: Nullable<string[]>): WebGLProgram;
    protected _createShaderProgram(pipelineContext: WebGLPipelineContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, context: WebGLRenderingContext, transformFeedbackVaryings?: Nullable<string[]>): WebGLProgram;
    /**
     * @param texture
     * @hidden
     */
    _releaseTexture(texture: InternalTexture): void;
    /**
     * @param rtWrapper
     * @hidden
     */
    _releaseRenderTargetWrapper(rtWrapper: RenderTargetWrapper): void;
    protected static _RenderPassIdCounter: number;
    /**
     * Gets or sets the current render pass id
     */
    currentRenderPassId: number;
    private _renderPassNames;
    /**
     * Gets the names of the render passes that are currently created
     * @returns list of the render pass names
     */
    getRenderPassNames(): string[];
    /**
     * Gets the name of the current render pass
     * @returns name of the current render pass
     */
    getCurrentRenderPassName(): string;
    /**
     * Creates a render pass id
     * @param name Name of the render pass (for debug purpose only)
     * @returns the id of the new render pass
     */
    createRenderPassId(name?: string): number;
    /**
     * Releases a render pass id
     * @param id id of the render pass to release
     */
    releaseRenderPassId(id: number): void;
    /**
     * @hidden
     * Rescales a texture
     * @param source input texture
     * @param destination destination texture
     * @param scene scene to use to render the resize
     * @param internalFormat format to use when resizing
     * @param onComplete callback to be called when resize has completed
     */
    _rescaleTexture(source: InternalTexture, destination: InternalTexture, scene: Nullable<any>, internalFormat: number, onComplete: () => void): void;
    /**
     * Gets the current framerate
     * @returns a number representing the framerate
     */
    getFps(): number;
    /**
     * Gets the time spent between current and previous frame
     * @returns a number representing the delta time in ms
     */
    getDeltaTime(): number;
    private _measureFps;
    /**
     * Wraps an external web gl texture in a Babylon texture.
     * @param texture defines the external texture
     * @returns the babylon internal texture
     */
    wrapWebGLTexture(texture: WebGLTexture): InternalTexture;
    /**
     * @param texture
     * @param image
     * @param faceIndex
     * @param lod
     * @hidden
     */
    _uploadImageToTexture(texture: InternalTexture, image: HTMLImageElement | ImageBitmap, faceIndex?: number, lod?: number): void;
    /**
     * Updates a depth texture Comparison Mode and Function.
     * If the comparison Function is equal to 0, the mode will be set to none.
     * Otherwise, this only works in webgl 2 and requires a shadow sampler in the shader.
     * @param texture The texture to set the comparison function for
     * @param comparisonFunction The comparison function to set, 0 if no comparison required
     */
    updateTextureComparisonFunction(texture: InternalTexture, comparisonFunction: number): void;
    /**
     * Creates a webGL buffer to use with instantiation
     * @param capacity defines the size of the buffer
     * @returns the webGL buffer
     */
    createInstancesBuffer(capacity: number): DataBuffer;
    /**
     * Delete a webGL buffer used with instantiation
     * @param buffer defines the webGL buffer to delete
     */
    deleteInstancesBuffer(buffer: WebGLBuffer): void;
    private _clientWaitAsync;
    /**
     * @param x
     * @param y
     * @param w
     * @param h
     * @param format
     * @param type
     * @param outputBuffer
     * @hidden
     */
    _readPixelsAsync(x: number, y: number, w: number, h: number, format: number, type: number, outputBuffer: ArrayBufferView): Promise<ArrayBufferView> | null;
    dispose(): void;
    private _disableTouchAction;
    /**
     * Display the loading screen
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    displayLoadingUI(): void;
    /**
     * Hide the loading screen
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    hideLoadingUI(): void;
    /**
     * Gets the current loading screen object
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    get loadingScreen(): ILoadingScreen;
    /**
     * Sets the current loading screen object
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingScreen(loadingScreen: ILoadingScreen);
    /**
     * Sets the current loading screen text
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingUIText(text: string);
    /**
     * Sets the current loading screen background color
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingUIBackgroundColor(color: string);
    /**
     * creates and returns a new video element
     * @param constraints video constraints
     * @returns video element
     */
    createVideoElement(constraints: MediaTrackConstraints): any;
    /** Pointerlock and fullscreen */
    /**
     * Ask the browser to promote the current element to pointerlock mode
     * @param element defines the DOM element to promote
     */
    static _RequestPointerlock(element: HTMLElement): void;
    /**
     * Asks the browser to exit pointerlock mode
     */
    static _ExitPointerlock(): void;
    /**
     * Ask the browser to promote the current element to fullscreen rendering mode
     * @param element defines the DOM element to promote
     */
    static _RequestFullscreen(element: HTMLElement): void;
    /**
     * Asks the browser to exit fullscreen mode
     */
    static _ExitFullscreen(): void;
    /**
     * Get Font size information
     * @param font font name
     * @return an object containing ascent, height and descent
     */
    getFontOffset(font: string): {
        ascent: number;
        height: number;
        descent: number;
    };
}
export {};

// Mixins
declare global{
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/naming-convention */
// Mixins
interface Window {
    mozIndexedDB: IDBFactory;
    webkitIndexedDB: IDBFactory;
    msIndexedDB: IDBFactory;
    webkitURL: typeof URL;
    mozRequestAnimationFrame(callback: FrameRequestCallback): number;
    oRequestAnimationFrame(callback: FrameRequestCallback): number;
    WebGLRenderingContext: WebGLRenderingContext;
    CANNON: any;
    AudioContext: AudioContext;
    webkitAudioContext: AudioContext;
    PointerEvent: any;
    Math: Math;
    Uint8Array: Uint8ArrayConstructor;
    Float32Array: Float32ArrayConstructor;
    mozURL: typeof URL;
    msURL: typeof URL;
    DracoDecoderModule: any;
    setImmediate(handler: (...args: any[]) => void): number;
}

interface HTMLCanvasElement {
    requestPointerLock(): void;
    msRequestPointerLock?(): void;
    mozRequestPointerLock?(): void;
    webkitRequestPointerLock?(): void;

    /** Track whether a record is in progress */
    isRecording: boolean;
    /** Capture Stream method defined by some browsers */
    captureStream(fps?: number): MediaStream;
}

interface CanvasRenderingContext2D {
    msImageSmoothingEnabled: boolean;
}

// Babylon Extension to enable UIEvents to work with our IUIEvents
interface UIEvent {
    inputIndex: number;
}

interface MouseEvent {
    mozMovementX: number;
    mozMovementY: number;
    webkitMovementX: number;
    webkitMovementY: number;
    msMovementX: number;
    msMovementY: number;
}

interface Navigator {
    mozGetVRDevices: (any: any) => any;
    webkitGetUserMedia(constraints: MediaStreamConstraints, successCallback: any, errorCallback: any): void;
    mozGetUserMedia(constraints: MediaStreamConstraints, successCallback: any, errorCallback: any): void;
    msGetUserMedia(constraints: MediaStreamConstraints, successCallback: any, errorCallback: any): void;

    webkitGetGamepads(): Gamepad[];
    msGetGamepads(): Gamepad[];
    webkitGamepads(): Gamepad[];
}

interface HTMLVideoElement {
    mozSrcObject: any;
}

interface Math {
    fround(x: number): number;
    imul(a: number, b: number): number;
    log2(x: number): number;
}

interface OffscreenCanvas extends EventTarget {
    width: number;
    height: number;
}

var OffscreenCanvas: {
    prototype: OffscreenCanvas;
    new (width: number, height: number): OffscreenCanvas;
};

/* eslint-disable @typescript-eslint/naming-convention */
interface WebGLRenderingContext {
    drawArraysInstanced(mode: number, first: number, count: number, primcount: number): void;
    drawElementsInstanced(mode: number, count: number, type: number, offset: number, primcount: number): void;
    vertexAttribDivisor(index: number, divisor: number): void;

    createVertexArray(): any;
    bindVertexArray(vao?: WebGLVertexArrayObject | null): void;
    deleteVertexArray(vao: WebGLVertexArrayObject): void;

    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;
    renderbufferStorageMultisample?(target: number, samples: number, internalformat: number, width: number, height: number): void;

    bindBufferBase(target: number, index: number, buffer: WebGLBuffer | null): void;
    getUniformBlockIndex(program: WebGLProgram, uniformBlockName: string): number;
    uniformBlockBinding(program: WebGLProgram, uniformBlockIndex: number, uniformBlockBinding: number): void;

    // Queries
    createQuery(): WebGLQuery;
    deleteQuery(query: WebGLQuery): void;
    beginQuery(target: number, query: WebGLQuery): void;
    endQuery(target: number): void;
    getQueryParameter(query: WebGLQuery, pname: number): any;
    getQuery(target: number, pname: number): any;

    MAX_SAMPLES: number;
    RGBA8: number;
    READ_FRAMEBUFFER: number;
    DRAW_FRAMEBUFFER: number;
    UNIFORM_BUFFER: number;

    HALF_FLOAT_OES: number;
    RGBA16F: number;
    RGBA32F: number;
    R32F: number;
    RG32F: number;
    RGB32F: number;
    R16F: number;
    RG16F: number;
    RGB16F: number;
    RED: number;
    RG: number;
    R8: number;
    RG8: number;
    SRGB: number;
    SRGB8: number;
    SRGB8_ALPHA8: number;

    COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR: number;
    COMPRESSED_SRGB_S3TC_DXT1_EXT: number;
    COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: number;
    COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT: number;
    COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT: number;

    UNSIGNED_INT_24_8: number;
    DEPTH24_STENCIL8: number;

    MIN: number;
    MAX: number;

    /* Multiple Render Targets */
    drawBuffers(buffers: number[]): void;
    readBuffer(src: number): void;

    readonly COLOR_ATTACHMENT0: number; // 0x8CE1
    readonly COLOR_ATTACHMENT1: number; // 0x8CE2
    readonly COLOR_ATTACHMENT2: number; // 0x8CE3
    readonly COLOR_ATTACHMENT3: number; // 0x8CE4

    // Occlusion Query
    ANY_SAMPLES_PASSED_CONSERVATIVE: number;
    ANY_SAMPLES_PASSED: number;
    QUERY_RESULT_AVAILABLE: number;
    QUERY_RESULT: number;
}

interface WebGLProgram {
    __SPECTOR_rebuildProgram?:
        | ((vertexSourceCode: string, fragmentSourceCode: string, onCompiled: (program: WebGLProgram) => void, onError: (message: string) => void) => void)
        | null;
}

interface EXT_disjoint_timer_query {
    QUERY_COUNTER_BITS_EXT: number;
    TIME_ELAPSED_EXT: number;
    TIMESTAMP_EXT: number;
    GPU_DISJOINT_EXT: number;
    QUERY_RESULT_EXT: number;
    QUERY_RESULT_AVAILABLE_EXT: number;
    queryCounterEXT(query: WebGLQuery, target: number): void;
    createQueryEXT(): WebGLQuery;
    beginQueryEXT(target: number, query: WebGLQuery): void;
    endQueryEXT(target: number): void;
    getQueryObjectEXT(query: WebGLQuery, target: number): any;
    deleteQueryEXT(query: WebGLQuery): void;
}

interface WebGLUniformLocation {
    _currentState: any;
}

/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/naming-convention */
// Type definitions for WebGL 2, Editor's Draft Fri Feb 24 16:10:18 2017 -0800
// Project: https://www.khronos.org/registry/webgl/specs/latest/2.0/
// Definitions by: Nico Kemnitz <https://github.com/nkemnitz/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface WebGLRenderingContext {
    readonly RASTERIZER_DISCARD: number;
    readonly DEPTH_COMPONENT24: number;
    readonly TEXTURE_3D: number;
    readonly TEXTURE_2D_ARRAY: number;
    readonly TEXTURE_COMPARE_FUNC: number;
    readonly TEXTURE_COMPARE_MODE: number;
    readonly TEXTURE_MAX_LEVEL: number;
    readonly COMPARE_REF_TO_TEXTURE: number;
    readonly TEXTURE_WRAP_R: number;
    readonly HALF_FLOAT: number;
    readonly RGB8: number;
    readonly RED_INTEGER: number;
    readonly RG_INTEGER: number;
    readonly RGB_INTEGER: number;
    readonly RGBA_INTEGER: number;
    readonly R8_SNORM: number;
    readonly RG8_SNORM: number;
    readonly RGB8_SNORM: number;
    readonly RGBA8_SNORM: number;
    readonly R8I: number;
    readonly RG8I: number;
    readonly RGB8I: number;
    readonly RGBA8I: number;
    readonly R8UI: number;
    readonly RG8UI: number;
    readonly RGB8UI: number;
    readonly RGBA8UI: number;
    readonly R16I: number;
    readonly RG16I: number;
    readonly RGB16I: number;
    readonly RGBA16I: number;
    readonly R16UI: number;
    readonly RG16UI: number;
    readonly RGB16UI: number;
    readonly RGBA16UI: number;
    readonly R32I: number;
    readonly RG32I: number;
    readonly RGB32I: number;
    readonly RGBA32I: number;
    readonly R32UI: number;
    readonly RG32UI: number;
    readonly RGB32UI: number;
    readonly RGBA32UI: number;
    readonly RGB10_A2UI: number;
    readonly R11F_G11F_B10F: number;
    readonly RGB9_E5: number;
    readonly RGB10_A2: number;
    readonly UNSIGNED_INT_2_10_10_10_REV: number;
    readonly UNSIGNED_INT_10F_11F_11F_REV: number;
    readonly UNSIGNED_INT_5_9_9_9_REV: number;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
    readonly DEPTH_COMPONENT32F: number;

    texImage3D(
        target: number,
        level: number,
        internalformat: number,
        width: number,
        height: number,
        depth: number,
        border: number,
        format: number,
        type: number,
        pixels: ArrayBufferView | null
    ): void;
    texImage3D(
        target: number,
        level: number,
        internalformat: number,
        width: number,
        height: number,
        depth: number,
        border: number,
        format: number,
        type: number,
        pixels: ArrayBufferView,
        offset: number
    ): void;
    texImage3D(
        target: number,
        level: number,
        internalformat: number,
        width: number,
        height: number,
        depth: number,
        border: number,
        format: number,
        type: number,
        pixels: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): void;

    framebufferTextureLayer(target: number, attachment: number, texture: WebGLTexture | null, level: number, layer: number): void;

    compressedTexImage3D(
        target: number,
        level: number,
        internalformat: number,
        width: number,
        height: number,
        depth: number,
        border: number,
        data: ArrayBufferView,
        offset?: number,
        length?: number
    ): void;

    readonly TRANSFORM_FEEDBACK: number;
    readonly INTERLEAVED_ATTRIBS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER: number;
    createTransformFeedback(): WebGLTransformFeedback;
    deleteTransformFeedback(transformFeedbac: WebGLTransformFeedback): void;
    bindTransformFeedback(target: number, transformFeedback: WebGLTransformFeedback | null): void;
    beginTransformFeedback(primitiveMode: number): void;
    endTransformFeedback(): void;
    transformFeedbackVaryings(program: WebGLProgram, varyings: string[], bufferMode: number): void;

    clearBufferfv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number | null): void;
    clearBufferiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number | null): void;
    clearBufferuiv(buffer: number, drawbuffer: number, values: ArrayBufferView, srcOffset: number | null): void;
    clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;
}

interface ImageBitmap {
    readonly width: number;
    readonly height: number;
    close(): void;
}

interface WebGLQuery {}

var WebGLQuery: {
    prototype: WebGLQuery;
    new (): WebGLQuery;
};

interface WebGLSampler {}

var WebGLSampler: {
    prototype: WebGLSampler;
    new (): WebGLSampler;
};

interface WebGLSync {}

var WebGLSync: {
    prototype: WebGLSync;
    new (): WebGLSync;
};

interface WebGLTransformFeedback {}

var WebGLTransformFeedback: {
    prototype: WebGLTransformFeedback;
    new (): WebGLTransformFeedback;
};

interface WebGLVertexArrayObject {}

var WebGLVertexArrayObject: {
    prototype: WebGLVertexArrayObject;
    new (): WebGLVertexArrayObject;
};

/* eslint-disable @typescript-eslint/naming-convention */
interface GPUObjectBase {
    label: string | undefined;
}

interface GPUObjectDescriptorBase {
    label?: string;
}

interface GPUSupportedLimits {
    readonly maxTextureDimension1D: GPUSize32;
    readonly maxTextureDimension2D: GPUSize32;
    readonly maxTextureDimension3D: GPUSize32;
    readonly maxTextureArrayLayers: GPUSize32;
    readonly maxBindGroups: GPUSize32;
    readonly maxDynamicUniformBuffersPerPipelineLayout: GPUSize32;
    readonly maxDynamicStorageBuffersPerPipelineLayout: GPUSize32;
    readonly maxSampledTexturesPerShaderStage: GPUSize32;
    readonly maxSamplersPerShaderStage: GPUSize32;
    readonly maxStorageBuffersPerShaderStage: GPUSize32;
    readonly maxStorageTexturesPerShaderStage: GPUSize32;
    readonly maxUniformBuffersPerShaderStage: GPUSize32;
    readonly maxUniformBufferBindingSize: GPUSize64;
    readonly maxStorageBufferBindingSize: GPUSize64;
    readonly minUniformBufferOffsetAlignment: GPUSize32;
    readonly minStorageBufferOffsetAlignment: GPUSize32;
    readonly maxVertexBuffers: GPUSize32;
    readonly maxVertexAttributes: GPUSize32;
    readonly maxVertexBufferArrayStride: GPUSize32;
    readonly maxInterStageShaderComponents: GPUSize32;
    readonly maxComputeWorkgroupStorageSize: GPUSize32;
    readonly maxComputeInvocationsPerWorkgroup: GPUSize32;
    readonly maxComputeWorkgroupSizeX: GPUSize32;
    readonly maxComputeWorkgroupSizeY: GPUSize32;
    readonly maxComputeWorkgroupSizeZ: GPUSize32;
    readonly maxComputeWorkgroupsPerDimension: GPUSize32;
}

type GPUSupportedFeatures = ReadonlySet<string>;

type GPUPredefinedColorSpace = "srgb";

interface Navigator {
    readonly gpu: GPU | undefined;
}

interface WorkerNavigator {
    readonly gpu: GPU | undefined;
}

class GPU {
    private __brand: void;
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}

interface GPURequestAdapterOptions {
    powerPreference?: GPUPowerPreference;
    forceFallbackAdapter?: boolean /* default=false */;
}

type GPUPowerPreference = "low-power" | "high-performance";

class GPUAdapter {
    // https://michalzalecki.com/nominal-typing-in-typescript/#approach-1-class-with-a-private-property
    private __brand: void;
    readonly name: string;
    readonly features: GPUSupportedFeatures;
    readonly limits: GPUSupportedLimits;
    readonly isFallbackAdapter: boolean;

    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
}

interface GPUDeviceDescriptor extends GPUObjectDescriptorBase {
    requiredFeatures?: GPUFeatureName[] /* default=[] */;
    requiredLimits?: { [name: string]: GPUSize64 } /* default={} */;
}

type GPUFeatureName =
    | "depth-clip-control"
    | "depth24unorm-stencil8"
    | "depth32float-stencil8"
    | "texture-compression-bc"
    | "texture-compression-etc2"
    | "texture-compression-astc"
    | "timestamp-query"
    | "indirect-first-instance";

class GPUDevice extends EventTarget implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    readonly features: GPUSupportedFeatures;
    readonly limits: GPUSupportedLimits;

    readonly queue: GPUQueue;

    destroy(): void;

    createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
    createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
    createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler;
    importExternalTexture(descriptor: GPUExternalTextureDescriptor): GPUExternalTexture;

    createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
    createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;

    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;

    createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
    createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
    createComputePipelineAsync(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline>;
    createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline>;

    createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
    createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder;

    createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet;

    readonly lost: Promise<GPUDeviceLostInfo>;
    pushErrorScope(filter: GPUErrorFilter): void;
    popErrorScope(): Promise<GPUError | undefined>;
    onuncapturederror: Event | undefined;
}

class GPUBuffer implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    mapAsync(mode: GPUMapModeFlags, offset?: GPUSize64 /*default=0*/, size?: GPUSize64): Promise<void>;
    getMappedRange(offset?: GPUSize64 /*default=0*/, size?: GPUSize64): ArrayBuffer;
    unmap(): void;

    destroy(): void;
}

interface GPUBufferDescriptor extends GPUObjectDescriptorBase {
    size: GPUSize64;
    usage: GPUBufferUsageFlags;
    mappedAtCreation: boolean /* default=false */;
}

type GPUBufferUsageFlags = number;

type GPUMapModeFlags = number;

class GPUTexture implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
    destroy(): void;
}

interface GPUTextureDescriptor extends GPUObjectDescriptorBase {
    size: GPUExtent3D;
    mipLevelCount?: GPUIntegerCoordinate /* default=1 */;
    sampleCount?: GPUSize32 /* default=1 */;
    dimension?: GPUTextureDimension /* default="2d" */;
    format: GPUTextureFormat;
    usage: GPUTextureUsageFlags;
    viewFormats?: GPUTextureFormat[] /* default=[] */;
}

type GPUTextureDimension = "1d" | "2d" | "3d";

type GPUTextureUsageFlags = number;

class GPUTextureView implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUTextureViewDescriptor extends GPUObjectDescriptorBase {
    format: GPUTextureFormat;
    dimension: GPUTextureViewDimension;
    aspect?: GPUTextureAspect /* default="all" */;
    baseMipLevel?: GPUIntegerCoordinate /* default=0 */;
    mipLevelCount: GPUIntegerCoordinate;
    baseArrayLayer?: GPUIntegerCoordinate /* default=0*/;
    arrayLayerCount: GPUIntegerCoordinate;
}

type GPUTextureViewDimension = "1d" | "2d" | "2d-array" | "cube" | "cube-array" | "3d";

type GPUTextureAspect = "all" | "stencil-only" | "depth-only";

type GPUTextureFormat =
    // 8-bit formats
    | "r8unorm"
    | "r8snorm"
    | "r8uint"
    | "r8sint"

    // 16-bit formats
    | "r16uint"
    | "r16sint"
    | "r16float"
    | "rg8unorm"
    | "rg8snorm"
    | "rg8uint"
    | "rg8sint"

    // 32-bit formats
    | "r32uint"
    | "r32sint"
    | "r32float"
    | "rg16uint"
    | "rg16sint"
    | "rg16float"
    | "rgba8unorm"
    | "rgba8unorm-srgb"
    | "rgba8snorm"
    | "rgba8uint"
    | "rgba8sint"
    | "bgra8unorm"
    | "bgra8unorm-srgb"
    // Packed 32-bit formats
    | "rgb9e5ufloat"
    | "rgb10a2unorm"
    | "rg11b10ufloat"

    // 64-bit formats
    | "rg32uint"
    | "rg32sint"
    | "rg32float"
    | "rgba16uint"
    | "rgba16sint"
    | "rgba16float"

    // 128-bit formats
    | "rgba32uint"
    | "rgba32sint"
    | "rgba32float"

    // Depth and stencil formats
    | "stencil8"
    | "depth16unorm"
    | "depth24plus"
    | "depth24plus-stencil8"
    | "depth32float"

    // "depth24unorm-stencil8" feature
    | "depth24unorm-stencil8"

    // "depth32float-stencil8" feature
    | "depth32float-stencil8"

    // BC compressed formats usable if "texture-compression-bc" is both
    // supported by the device/user agent and enabled in requestDevice.
    | "bc1-rgba-unorm"
    | "bc1-rgba-unorm-srgb"
    | "bc2-rgba-unorm"
    | "bc2-rgba-unorm-srgb"
    | "bc3-rgba-unorm"
    | "bc3-rgba-unorm-srgb"
    | "bc4-r-unorm"
    | "bc4-r-snorm"
    | "bc5-rg-unorm"
    | "bc5-rg-snorm"
    | "bc6h-rgb-ufloat"
    | "bc6h-rgb-float"
    | "bc7-rgba-unorm"
    | "bc7-rgba-unorm-srgb"

    // ETC2 compressed formats usable if "texture-compression-etc2" is both
    // supported by the device/user agent and enabled in requestDevice.
    | "etc2-rgb8unorm"
    | "etc2-rgb8unorm-srgb"
    | "etc2-rgb8a1unorm"
    | "etc2-rgb8a1unorm-srgb"
    | "etc2-rgba8unorm"
    | "etc2-rgba8unorm-srgb"
    | "eac-r11unorm"
    | "eac-r11snorm"
    | "eac-rg11unorm"
    | "eac-rg11snorm"

    // ASTC compressed formats usable if "texture-compression-astc" is both
    // supported by the device/user agent and enabled in requestDevice.
    | "astc-4x4-unorm"
    | "astc-4x4-unorm-srgb"
    | "astc-5x4-unorm"
    | "astc-5x4-unorm-srgb"
    | "astc-5x5-unorm"
    | "astc-5x5-unorm-srgb"
    | "astc-6x5-unorm"
    | "astc-6x5-unorm-srgb"
    | "astc-6x6-unorm"
    | "astc-6x6-unorm-srgb"
    | "astc-8x5-unorm"
    | "astc-8x5-unorm-srgb"
    | "astc-8x6-unorm"
    | "astc-8x6-unorm-srgb"
    | "astc-8x8-unorm"
    | "astc-8x8-unorm-srgb"
    | "astc-10x5-unorm"
    | "astc-10x5-unorm-srgb"
    | "astc-10x6-unorm"
    | "astc-10x6-unorm-srgb"
    | "astc-10x8-unorm"
    | "astc-10x8-unorm-srgb"
    | "astc-10x10-unorm"
    | "astc-10x10-unorm-srgb"
    | "astc-12x10-unorm"
    | "astc-12x10-unorm-srgb"
    | "astc-12x12-unorm"
    | "astc-12x12-unorm-srgb";

class GPUExternalTexture implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUExternalTextureDescriptor extends GPUObjectDescriptorBase {
    source: HTMLVideoElement;
    colorSpace?: GPUPredefinedColorSpace /* default="srgb" */;
}

class GPUSampler implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUSamplerDescriptor extends GPUObjectDescriptorBase {
    addressModeU?: GPUAddressMode /* default="clamp-to-edge" */;
    addressModeV?: GPUAddressMode /* default="clamp-to-edge" */;
    addressModeW?: GPUAddressMode /* default="clamp-to-edge" */;
    magFilter?: GPUFilterMode /* default="nearest" */;
    minFilter?: GPUFilterMode /* default="nearest" */;
    mipmapFilter?: GPUFilterMode /* default="nearest" */;
    lodMinClamp?: number /* default=0 */;
    lodMaxClamp?: number /* default=32 */;
    compare?: GPUCompareFunction;
    maxAnisotropy?: number /* default=1 */;
}

type GPUAddressMode = "clamp-to-edge" | "repeat" | "mirror-repeat";

type GPUFilterMode = "nearest" | "linear";

type GPUCompareFunction = "never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always";

class GPUBindGroupLayout implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUBindGroupLayoutDescriptor extends GPUObjectDescriptorBase {
    entries: GPUBindGroupLayoutEntry[];
}

type GPUShaderStageFlags = number;

interface GPUBindGroupLayoutEntry {
    binding: GPUIndex32;
    visibility: GPUShaderStageFlags;

    buffer?: GPUBufferBindingLayout;
    sampler?: GPUSamplerBindingLayout;
    texture?: GPUTextureBindingLayout;
    storageTexture?: GPUStorageTextureBindingLayout;
    externalTexture?: GPUExternalTextureBindingLayout;
}

type GPUBufferBindingType = "uniform" | "storage" | "read-only-storage";

interface GPUBufferBindingLayout {
    type?: GPUBufferBindingType /* default="uniform" */;
    hasDynamicOffset?: boolean /* default=false */;
    minBindingSize?: GPUSize64 /* default=0 */;
}

type GPUSamplerBindingType = "filtering" | "non-filtering" | "comparison";

interface GPUSamplerBindingLayout {
    type?: GPUSamplerBindingType /* default="filtering" */;
}

type GPUTextureSampleType = "float" | "unfilterable-float" | "depth" | "sint" | "uint";

interface GPUTextureBindingLayout {
    sampleType?: GPUTextureSampleType /* default="float" */;
    viewDimension?: GPUTextureViewDimension /* default="2d" */;
    multisampled?: boolean /* default=false */;
}

type GPUStorageTextureAccess = "write-only";

interface GPUStorageTextureBindingLayout {
    access?: GPUStorageTextureAccess /* default=write-only */;
    format: GPUTextureFormat;
    viewDimension?: GPUTextureViewDimension /* default="2d" */;
}

interface GPUExternalTextureBindingLayout {}

class GPUBindGroup implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUBindGroupDescriptor extends GPUObjectDescriptorBase {
    layout: GPUBindGroupLayout;
    entries: GPUBindGroupEntry[];
}

type GPUBindingResource = GPUSampler | GPUTextureView | GPUBufferBinding | GPUExternalTexture;

interface GPUBindGroupEntry {
    binding: GPUIndex32;
    resource: GPUBindingResource;
}

interface GPUBufferBinding {
    buffer: GPUBuffer;
    offset?: GPUSize64 /* default=0 */;
    size?: GPUSize64 /* default=size_of_buffer - offset */;
}

class GPUPipelineLayout implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUPipelineLayoutDescriptor extends GPUObjectDescriptorBase {
    bindGroupLayouts: GPUBindGroupLayout[];
}

class GPUShaderModule implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    compilationInfo(): Promise<GPUCompilationInfo>;
}

interface GPUShaderModuleCompilationHint {
    layout: GPUPipelineLayout;
}

interface GPUShaderModuleDescriptor extends GPUObjectDescriptorBase {
    code: string | Uint32Array;
    sourceMap?: object;
    hints?: { [name: string]: GPUShaderModuleCompilationHint };
}

type GPUCompilationMessageType = "error" | "warning" | "info";

interface GPUCompilationMessage {
    readonly message: string;
    readonly type: GPUCompilationMessageType;
    readonly lineNum: number;
    readonly linePos: number;
    readonly offset: number;
    readonly length: number;
}

interface GPUCompilationInfo {
    readonly messages: readonly GPUCompilationMessage[];
}

interface GPUPipelineDescriptorBase extends GPUObjectDescriptorBase {
    layout?: GPUPipelineLayout;
}

interface GPUPipelineBase {
    getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUProgrammableStage {
    module: GPUShaderModule;
    entryPoint: string | Uint32Array;
    constants?: { [name: string]: GPUPipelineConstantValue };
}

type GPUPipelineConstantValue = number; // May represent WGSL’s bool, f32, i32, u32.

class GPUComputePipeline implements GPUObjectBase, GPUPipelineBase {
    private __brand: void;
    label: string | undefined;

    getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUComputePipelineDescriptor extends GPUPipelineDescriptorBase {
    compute: GPUProgrammableStage;
}

class GPURenderPipeline implements GPUObjectBase, GPUPipelineBase {
    private __brand: void;
    label: string | undefined;

    getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPURenderPipelineDescriptor extends GPUPipelineDescriptorBase {
    vertex: GPUVertexState;
    primitive?: GPUPrimitiveState /* default={} */;
    depthStencil?: GPUDepthStencilState;
    multisample?: GPUMultisampleState /* default={} */;
    fragment?: GPUFragmentState;
}

type GPUPrimitiveTopology = "point-list" | "line-list" | "line-strip" | "triangle-list" | "triangle-strip";

interface GPUPrimitiveState {
    topology?: GPUPrimitiveTopology /* default="triangle-list" */;
    stripIndexFormat?: GPUIndexFormat;
    frontFace?: GPUFrontFace /* default="ccw" */;
    cullMode?: GPUCullMode /* default="none" */;

    // Requires "depth-clip-control" feature.
    unclippedDepth?: boolean /* default=false */;
}

type GPUFrontFace = "ccw" | "cw";

type GPUCullMode = "none" | "front" | "back";

interface GPUMultisampleState {
    count?: GPUSize32 /* default=1 */;
    mask?: GPUSampleMask /* default=0xFFFFFFFF */;
    alphaToCoverageEnabled?: boolean /* default=false */;
}

interface GPUFragmentState extends GPUProgrammableStage {
    targets: (GPUColorTargetState | null | undefined)[];
}

interface GPUColorTargetState {
    format: GPUTextureFormat;

    blend?: GPUBlendState;
    writeMask?: GPUColorWriteFlags /* default=0xF - GPUColorWrite.ALL */;
}

interface GPUBlendState {
    color: GPUBlendComponent;
    alpha: GPUBlendComponent;
}

type GPUColorWriteFlags = number;

interface GPUBlendComponent {
    operation?: GPUBlendOperation /* default="add" */;
    srcFactor?: GPUBlendFactor /* default="one" */;
    dstFactor?: GPUBlendFactor /* default="zero" */;
}

type GPUBlendFactor =
    | "zero"
    | "one"
    | "src"
    | "one-minus-src"
    | "src-alpha"
    | "one-minus-src-alpha"
    | "dst"
    | "one-minus-dst"
    | "dst-alpha"
    | "one-minus-dst-alpha"
    | "src-alpha-saturated"
    | "constant"
    | "one-minus-constant";

type GPUBlendOperation = "add" | "subtract" | "reverse-subtract" | "min" | "max";

interface GPUDepthStencilState {
    format: GPUTextureFormat;

    depthWriteEnabled?: boolean /* default=false */;
    depthCompare?: GPUCompareFunction /* default="always" */;

    stencilFront?: GPUStencilStateFace /* default={} */;
    stencilBack?: GPUStencilStateFace /* default={} */;

    stencilReadMask?: GPUStencilValue /* default=0xFFFFFFFF */;
    stencilWriteMask?: GPUStencilValue /* default=0xFFFFFFFF */;

    depthBias?: GPUDepthBias /* default=0 */;
    depthBiasSlopeScale?: number /* default= 0 */;
    depthBiasClamp?: number /* default=0 */;
}

interface GPUStencilStateFace {
    compare?: GPUCompareFunction /* default="always" */;
    failOp?: GPUStencilOperation /* default="keep" */;
    depthFailOp?: GPUStencilOperation /* default="keep" */;
    passOp?: GPUStencilOperation /* default="keep" */;
}

type GPUStencilOperation = "keep" | "zero" | "replace" | "invert" | "increment-clamp" | "decrement-clamp" | "increment-wrap" | "decrement-wrap";

type GPUIndexFormat = "uint16" | "uint32";

type GPUVertexFormat =
    | "uint8x2"
    | "uint8x4"
    | "sint8x2"
    | "sint8x4"
    | "unorm8x2"
    | "unorm8x4"
    | "snorm8x2"
    | "snorm8x4"
    | "uint16x2"
    | "uint16x4"
    | "sint16x2"
    | "sint16x4"
    | "unorm16x2"
    | "unorm16x4"
    | "snorm16x2"
    | "snorm16x4"
    | "float16x2"
    | "float16x4"
    | "float32"
    | "float32x2"
    | "float32x3"
    | "float32x4"
    | "uint32"
    | "uint32x2"
    | "uint32x3"
    | "uint32x4"
    | "sint32"
    | "sint32x2"
    | "sint32x3"
    | "sint32x4";

type GPUVertexStepMode = "vertex" | "instance";

interface GPUVertexState extends GPUProgrammableStage {
    buffers?: GPUVertexBufferLayout[] /* default=[] */;
}

interface GPUVertexBufferLayout {
    arrayStride: GPUSize64;
    stepMode?: GPUVertexStepMode /* default="vertex" */;
    attributes: GPUVertexAttribute[];
}

interface GPUVertexAttribute {
    format: GPUVertexFormat;
    offset: GPUSize64;
    shaderLocation: GPUIndex32;
}

class GPUCommandBuffer implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPUCommandBufferDescriptor extends GPUObjectDescriptorBase {}

interface GPUCommandsMixin {}

class GPUCommandEncoder implements GPUObjectBase, GPUCommandsMixin, GPUDebugCommandsMixin {
    private __brand: void;
    label: string | undefined;

    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
    beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder;

    copyBufferToBuffer(source: GPUBuffer, sourceOffset: GPUSize64, destination: GPUBuffer, destinationOffset: GPUSize64, size: GPUSize64): void;
    copyBufferToTexture(source: GPUImageCopyBuffer, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void;
    copyTextureToBuffer(source: GPUImageCopyTexture, destination: GPUImageCopyBuffer, copySize: GPUExtent3D): void;
    copyTextureToTexture(source: GPUImageCopyTexture, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void;
    clearBuffer(buffer: GPUBuffer, offset?: GPUSize64 /* default=0 */, size?: GPUSize64): void;

    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;

    writeTimestamp(querySet: GPUQuerySet, queryIndex: GPUSize32): void;

    resolveQuerySet(querySet: GPUQuerySet, firstQuery: GPUSize32, queryCount: GPUSize32, destination: GPUBuffer, destinationOffset: GPUSize64): void;

    finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer;
}

interface GPUCommandEncoderDescriptor extends GPUObjectDescriptorBase {}

interface GPUImageDataLayout {
    offset?: GPUSize64 /* default=0 */;
    bytesPerRow: GPUSize32;
    rowsPerImage?: GPUSize32;
}

interface GPUImageCopyBuffer extends GPUImageDataLayout {
    buffer: GPUBuffer;
}

interface GPUImageCopyTexture {
    texture: GPUTexture;
    mipLevel?: GPUIntegerCoordinate /* default=0 */;
    origin?: GPUOrigin3D /* default={} */;
    aspect?: GPUTextureAspect /* default="all" */;
}

interface GPUImageCopyTextureTagged extends GPUImageCopyTexture {
    colorSpace?: GPUPredefinedColorSpace /* default="srgb" */;
    premultipliedAlpha?: boolean /* default=false */;
}

interface GPUImageCopyExternalImage {
    source: ImageBitmap | HTMLCanvasElement | OffscreenCanvas;
    origin?: GPUOrigin2D /* default={} */;
    flipY?: boolean /* default=false */;
}

interface GPUProgrammablePassEncoder {
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: GPUBufferDynamicOffset[]): void;
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32): void;

    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;
}

interface GPUDebugCommandsMixin {
    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;
}

class GPUComputePassEncoder implements GPUObjectBase, GPUCommandsMixin, GPUDebugCommandsMixin, GPUProgrammablePassEncoder {
    private __brand: void;
    label: string | undefined;

    setBindGroup(index: number, bindGroup: GPUBindGroup, dynamicOffsets?: GPUBufferDynamicOffset[]): void;
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32): void;

    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;

    setPipeline(pipeline: GPUComputePipeline): void;
    dispatch(workgroupCountX: GPUSize32, workgroupCountY?: GPUSize32 /* default=1 */, workgroupCountZ?: GPUSize32 /* default=1 */): void;
    dispatchIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;

    end(): void;
}

type GPUComputePassTimestampLocation = "beginning" | "end";

interface GPUComputePassTimestampWrite {
    querySet: GPUQuerySet;
    queryIndex: GPUSize32;
    location: GPUComputePassTimestampLocation;
}

type GPUComputePassTimestampWrites = Array<GPUComputePassTimestampWrite>;

interface GPUComputePassDescriptor extends GPUObjectDescriptorBase {
    timestampWrites?: GPUComputePassTimestampWrites /* default=[] */;
}

interface GPURenderEncoderBase {
    setPipeline(pipeline: GPURenderPipeline): void;

    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;
    setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;

    draw(vertexCount: GPUSize32, instanceCount?: GPUSize32 /* default=1 */, firstVertex?: GPUSize32 /* default=0 */, firstInstance?: GPUSize32 /* default=0 */): void;
    drawIndexed(
        indexCount: GPUSize32,
        instanceCount?: GPUSize32 /* default=1 */,
        firstIndex?: GPUSize32 /* default=0 */,
        baseVertex?: GPUSignedOffset32 /* default=0 */,
        firstInstance?: GPUSize32 /* default=0 */
    ): void;

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
}

class GPURenderPassEncoder implements GPUObjectBase, GPUCommandsMixin, GPUDebugCommandsMixin, GPUProgrammablePassEncoder, GPURenderEncoderBase {
    private __brand: void;
    label: string | undefined;

    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: GPUBufferDynamicOffset[]): void;
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32): void;

    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;

    setPipeline(pipeline: GPURenderPipeline): void;

    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;
    setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;

    draw(vertexCount: GPUSize32, instanceCount?: GPUSize32 /* default=1 */, firstVertex?: GPUSize32 /* default=0 */, firstInstance?: GPUSize32 /* default=0 */): void;
    drawIndexed(
        indexCount: GPUSize32,
        instanceCount?: GPUSize32 /* default=1 */,
        firstIndex?: GPUSize32 /* default=0 */,
        baseVertex?: GPUSignedOffset32 /* default=0 */,
        firstInstance?: GPUSize32 /* default=0 */
    ): void;

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;

    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): void;

    setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate): void;

    setBlendConstant(color: GPUColor): void;
    setStencilReference(reference: GPUStencilValue): void;

    beginOcclusionQuery(queryIndex: GPUSize32): void;
    endOcclusionQuery(): void;

    executeBundles(bundles: GPURenderBundle[]): void;
    end(): void;
}

type GPURenderPassTimestampLocation = "beginning" | "end";

interface GPURenderPassTimestampWrite {
    querySet: GPUQuerySet;
    queryIndex: GPUSize32;
    location: GPURenderPassTimestampLocation;
}

type GPURenderPassTimestampWrites = Array<GPURenderPassTimestampWrite>;

interface GPURenderPassDescriptor extends GPUObjectDescriptorBase {
    colorAttachments: (GPURenderPassColorAttachment | null | undefined)[];
    depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
    occlusionQuerySet?: GPUQuerySet;
    timestampWrites?: GPURenderPassTimestampWrites /* default=[] */;
}

interface GPURenderPassColorAttachment {
    view: GPUTextureView;
    resolveTarget?: GPUTextureView;

    clearValue?: GPUColor;
    loadOp: GPULoadOp;
    storeOp: GPUStoreOp;
}

interface GPURenderPassDepthStencilAttachment {
    view: GPUTextureView;

    depthClearValue?: number /* default=0 */;
    depthLoadOp: GPULoadOp;
    depthStoreOp: GPUStoreOp;
    depthReadOnly?: boolean /* default=false */;

    stencilClearValue?: GPUStencilValue /* default=0 */;
    stencilLoadOp?: GPULoadOp;
    stencilStoreOp?: GPUStoreOp;
    stencilReadOnly?: boolean /* default=false */;
}

type GPULoadOp = "load" | "clear";

type GPUStoreOp = "store" | "discard";

interface GPURenderPassLayout extends GPUObjectDescriptorBase {
    colorFormats: (GPUTextureFormat | null | undefined)[];
    depthStencilFormat?: GPUTextureFormat;
    sampleCount?: GPUSize32 /* default=1 */;
}

class GPURenderBundle implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;
}

interface GPURenderBundleDescriptor extends GPUObjectDescriptorBase {}

class GPURenderBundleEncoder implements GPUObjectBase, GPUCommandsMixin, GPUDebugCommandsMixin, GPUProgrammablePassEncoder, GPURenderEncoderBase {
    private __brand: void;
    label: string | undefined;

    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: GPUBufferDynamicOffset[]): void;
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32): void;

    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;

    setPipeline(pipeline: GPURenderPipeline): void;

    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;
    setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, offset?: GPUSize64 /* default=0 */, size?: GPUSize64 /* default=0 */): void;

    draw(vertexCount: GPUSize32, instanceCount?: GPUSize32 /* default=1 */, firstVertex?: GPUSize32 /* default=0 */, firstInstance?: GPUSize32 /* default=0 */): void;
    drawIndexed(
        indexCount: GPUSize32,
        instanceCount?: GPUSize32 /* default=1 */,
        firstIndex?: GPUSize32 /* default=0 */,
        baseVertex?: GPUSignedOffset32 /* default=0 */,
        firstInstance?: GPUSize32 /* default=0 */
    ): void;

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): void;

    finish(descriptor?: GPURenderBundleDescriptor): GPURenderBundle;
}

interface GPURenderBundleEncoderDescriptor extends GPURenderPassLayout {
    depthReadOnly?: boolean /* default=false */;
    stencilReadOnly?: boolean /* default=false */;
}

class GPUQueue implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    submit(commandBuffers: GPUCommandBuffer[]): void;

    onSubmittedWorkDone(): Promise<void>;

    writeBuffer(buffer: GPUBuffer, bufferOffset: GPUSize64, data: BufferSource, dataOffset?: GPUSize64 /* default=0 */, size?: GPUSize64): void;

    writeTexture(destination: GPUImageCopyTexture, data: BufferSource, dataLayout: GPUImageDataLayout, size: GPUExtent3D): void;

    copyExternalImageToTexture(source: GPUImageCopyExternalImage, destination: GPUImageCopyTextureTagged, copySize: GPUExtent3D): void;
}

class GPUQuerySet implements GPUObjectBase {
    private __brand: void;
    label: string | undefined;

    destroy(): void;
}

interface GPUQuerySetDescriptor extends GPUObjectDescriptorBase {
    type: GPUQueryType;
    count: GPUSize32;
}

type GPUQueryType = "occlusion" | "timestamp";

class GPUCanvasContext {
    private __brand: void;

    readonly canvas: HTMLCanvasElement | OffscreenCanvas;

    configure(configuration?: GPUCanvasConfiguration): void;
    unconfigure(): void;

    getPreferredFormat(adapter: GPUAdapter): GPUTextureFormat;
    getCurrentTexture(): GPUTexture;
}

type GPUCanvasCompositingAlphaMode = "opaque" | "premultiplied";

interface GPUCanvasConfiguration extends GPUObjectDescriptorBase {
    device: GPUDevice;
    format: GPUTextureFormat;
    usage?: GPUTextureUsageFlags /* default=0x10 - GPUTextureUsage.RENDER_ATTACHMENT */;
    viewFormats?: GPUTextureFormat[] /* default=[] */;
    colorSpace?: GPUPredefinedColorSpace /* default="srgb" */;
    compositingAlphaMode?: GPUCanvasCompositingAlphaMode /* default="opaque" */;
    size: GPUExtent3D;
}

type GPUDeviceLostReason = "destroyed";

class GPUDeviceLostInfo {
    private __brand: void;
    readonly reason?: GPUDeviceLostReason;
    readonly message: string;
}

type GPUErrorFilter = "out-of-memory" | "validation";

class GPUOutOfMemoryError {
    private __brand: void;
    constructor();
}

class GPUValidationError {
    private __brand: void;
    constructor(message: string);
    readonly message: string;
}

type GPUError = GPUOutOfMemoryError | GPUValidationError;

class GPUUncapturedErrorEvent extends Event {
    private __brand: void;
    constructor(type: string, gpuUncapturedErrorEventInitDict: GPUUncapturedErrorEventInit);
    readonly error: GPUError;
}

interface GPUUncapturedErrorEventInit extends EventInit {
    error: GPUError;
}

type GPUBufferDynamicOffset = number; /* unsigned long */
type GPUStencilValue = number; /* unsigned long */
type GPUSampleMask = number; /* unsigned long */
type GPUDepthBias = number; /* long */
type GPUSize64 = number; /* unsigned long long */
type GPUIntegerCoordinate = number; /* unsigned long */
type GPUIndex32 = number; /* unsigned long */
type GPUSize32 = number; /* unsigned long */
type GPUSignedOffset32 = number; /* long */

interface GPUColorDict {
    r: number;
    g: number;
    b: number;
    a: number;
}
type GPUColor = [number, number, number, number] | GPUColorDict;

interface GPUOrigin2DDict {
    x?: GPUIntegerCoordinate /* default=0 */;
    y?: GPUIntegerCoordinate /* default=0 */;
}
type GPUOrigin2D = [GPUIntegerCoordinate, GPUIntegerCoordinate] | GPUOrigin2DDict;

interface GPUOrigin3DDict {
    x?: GPUIntegerCoordinate /* default=0 */;
    y?: GPUIntegerCoordinate /* default=0 */;
    z?: GPUIntegerCoordinate /* default=0 */;
}
type GPUOrigin3D = [GPUIntegerCoordinate, GPUIntegerCoordinate, GPUIntegerCoordinate] | GPUOrigin3DDict;

interface GPUExtent3DDict {
    width: GPUIntegerCoordinate;
    height?: GPUIntegerCoordinate /* default=1 */;
    depthOrArrayLayers?: GPUIntegerCoordinate /* default=1 */;
}
type GPUExtent3D = [GPUIntegerCoordinate, GPUIntegerCoordinate, GPUIntegerCoordinate] | GPUExtent3DDict;

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
// Type definitions for WebVR API
// Project: https://w3c.github.io/webvr/
// Definitions by: six a <https://github.com/lostfictions>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

interface VRDisplay extends EventTarget {
    /**
     * Dictionary of capabilities describing the VRDisplay.
     */
    readonly capabilities: VRDisplayCapabilities;

    /**
     * z-depth defining the far plane of the eye view frustum
     * enables mapping of values in the render target depth
     * attachment to scene coordinates. Initially set to 10000.0.
     */
    depthFar: number;

    /**
     * z-depth defining the near plane of the eye view frustum
     * enables mapping of values in the render target depth
     * attachment to scene coordinates. Initially set to 0.01.
     */
    depthNear: number;

    /**
     * An identifier for this distinct VRDisplay. Used as an
     * association point in the Gamepad API.
     */
    readonly displayId: number;

    /**
     * A display name, a user-readable name identifying it.
     */
    readonly displayName: string;
    readonly isConnected: boolean;
    readonly isPresenting: boolean;

    /**
     * If this VRDisplay supports room-scale experiences, the optional
     * stage attribute contains details on the room-scale parameters.
     */
    readonly stageParameters: VRStageParameters | null;

    /**
     * Passing the value returned by `requestAnimationFrame` to
     * `cancelAnimationFrame` will unregister the callback.
     * @param handle Define the handle of the request to cancel
     */
    cancelAnimationFrame(handle: number): void;

    /**
     * Stops presenting to the VRDisplay.
     * @returns a promise to know when it stopped
     */
    exitPresent(): Promise<void>;

    /**
     * Return the current VREyeParameters for the given eye.
     * @param whichEye Define the eye we want the parameter for
     * @returns the eye parameters
     */
    getEyeParameters(whichEye: string): VREyeParameters;

    /**
     * Populates the passed VRFrameData with the information required to render
     * the current frame.
     * @param frameData Define the data structure to populate
     * @returns true if ok otherwise false
     */
    getFrameData(frameData: VRFrameData): boolean;

    /**
     * Get the layers currently being presented.
     * @returns the list of VR layers
     */
    getLayers(): VRLayer[];

    /**
     * Return a VRPose containing the future predicted pose of the VRDisplay
     * when the current frame will be presented. The value returned will not
     * change until JavaScript has returned control to the browser.
     *
     * The VRPose will contain the position, orientation, velocity,
     * and acceleration of each of these properties.
     * @returns the pose object
     */
    getPose(): VRPose;

    /**
     * Return the current instantaneous pose of the VRDisplay, with no
     * prediction applied.
     * @returns the current instantaneous pose
     */
    getImmediatePose(): VRPose;

    /**
     * The callback passed to `requestAnimationFrame` will be called
     * any time a new frame should be rendered. When the VRDisplay is
     * presenting the callback will be called at the native refresh
     * rate of the HMD. When not presenting this function acts
     * identically to how window.requestAnimationFrame acts. Content should
     * make no assumptions of frame rate or vsync behavior as the HMD runs
     * asynchronously from other displays and at differing refresh rates.
     * @param callback Define the action to run next frame
     * @returns the request handle it
     */
    requestAnimationFrame(callback: FrameRequestCallback): number;

    /**
     * Begin presenting to the VRDisplay. Must be called in response to a user gesture.
     * Repeat calls while already presenting will update the VRLayers being displayed.
     * @param layers Define the list of layer to present
     * @returns a promise to know when the request has been fulfilled
     */
    requestPresent(layers: VRLayer[]): Promise<void>;

    /**
     * Reset the pose for this display, treating its current position and
     * orientation as the "origin/zero" values. VRPose.position,
     * VRPose.orientation, and VRStageParameters.sittingToStandingTransform may be
     * updated when calling resetPose(). This should be called in only
     * sitting-space experiences.
     */
    resetPose(): void;

    /**
     * The VRLayer provided to the VRDisplay will be captured and presented
     * in the HMD. Calling this function has the same effect on the source
     * canvas as any other operation that uses its source image, and canvases
     * created without preserveDrawingBuffer set to true will be cleared.
     * @param pose Define the pose to submit
     */
    submitFrame(pose?: VRPose): void;
}

var VRDisplay: {
    prototype: VRDisplay;
    new (): VRDisplay;
};

interface VRLayer {
    leftBounds?: number[] | Float32Array | null;
    rightBounds?: number[] | Float32Array | null;
    source?: HTMLCanvasElement | null;
}

interface VRDisplayCapabilities {
    readonly canPresent: boolean;
    readonly hasExternalDisplay: boolean;
    readonly hasOrientation: boolean;
    readonly hasPosition: boolean;
    readonly maxLayers: number;
}

interface VREyeParameters {
    /** @deprecated */
    readonly fieldOfView: VRFieldOfView;
    readonly offset: Float32Array;
    readonly renderHeight: number;
    readonly renderWidth: number;
}

interface VRFieldOfView {
    readonly downDegrees: number;
    readonly leftDegrees: number;
    readonly rightDegrees: number;
    readonly upDegrees: number;
}

interface VRFrameData {
    readonly leftProjectionMatrix: Float32Array;
    readonly leftViewMatrix: Float32Array;
    readonly pose: VRPose;
    readonly rightProjectionMatrix: Float32Array;
    readonly rightViewMatrix: Float32Array;
    readonly timestamp: number;
}

interface VRPose {
    readonly angularAcceleration: Float32Array | null;
    readonly angularVelocity: Float32Array | null;
    readonly linearAcceleration: Float32Array | null;
    readonly linearVelocity: Float32Array | null;
    readonly orientation: Float32Array | null;
    readonly position: Float32Array | null;
    readonly timestamp: number;
}

interface VRStageParameters {
    sittingToStandingTransform?: Float32Array;
    sizeX?: number;
    sizeY?: number;
}

interface Navigator {
    getVRDisplays(): Promise<VRDisplay[]>;
    readonly activeVRDisplays: ReadonlyArray<VRDisplay>;
}

interface Window {
    onvrdisplayconnected: ((this: Window, ev: Event) => any) | null;
    onvrdisplaydisconnected: ((this: Window, ev: Event) => any) | null;
    onvrdisplaypresentchange: ((this: Window, ev: Event) => any) | null;
    addEventListener(type: "vrdisplayconnected", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "vrdisplaydisconnected", listener: (ev: Event) => any, useCapture?: boolean): void;
    addEventListener(type: "vrdisplaypresentchange", listener: (ev: Event) => any, useCapture?: boolean): void;
}

interface Gamepad {
    readonly displayId: number;
}

var VRFrameData: any;

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Available session modes
 */
type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

/**
 * Reference space types
 */
type XRReferenceSpaceType = "viewer" | "local" | "local-floor" | "unbounded";
type XRBoundedReferenceSpaceType = "bounded-floor";

type XREnvironmentBlendMode = "opaque" | "additive" | "alpha-blend";

type XRVisibilityState = "visible" | "visible-blurred" | "hidden";

/**
 * Handedness types
 */
type XRHandedness = "none" | "left" | "right";

/**
 * InputSource target ray modes
 */
type XRTargetRayMode = "gaze" | "tracked-pointer" | "screen";

/**
 * Eye types
 */
type XREye = "none" | "left" | "right";

/**
 * Type of XR events available
 */
type XREventType =
    | "devicechange"
    | "visibilitychange"
    | "end"
    | "inputsourceschange"
    | "select"
    | "selectstart"
    | "selectend"
    | "squeeze"
    | "squeezestart"
    | "squeezeend"
    | "reset"
    | "eyetrackingstart"
    | "eyetrackingend";

type XRDOMOverlayType = "screen" | "floating" | "head-locked";

type XRReflectionFormat = "srgba8" | "rgba16f";

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

type XRPlaneSet = Set<XRPlane>;
type XRAnchorSet = Set<XRAnchor>;

type XREventHandler = (callback: any) => void;

interface XRLayer extends EventTarget {}

type XRDOMOverlayInit = {
    /**
     * The root attribute specifies the overlay element that will be displayed to the user as the content of the DOM overlay. This is a required attribute, there is no default.
     */
    root: Element;
};

type XRLightProbeInit = {
    reflectionFormat: XRReflectionFormat;
};

interface XRSessionInit {
    optionalFeatures?: string[];
    requiredFeatures?: string[];
    trackedImages?: XRTrackedImageInit[];
    /**
     * When 'dom-overly' is (optionally) requested the application MUST provide configuration for the DOM overlay
     */
    domOverlay?: XRDOMOverlayInit;
}

interface XRSessionEvent extends Event {
    readonly session: XRSession;
}

interface XRSystem {
    isSessionSupported: (sessionMode: XRSessionMode) => Promise<boolean>;
    requestSession: (sessionMode: XRSessionMode, sessionInit?: any) => Promise<XRSession>;
}

interface XRViewport {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

interface XRWebGLLayerInit {
    antialias?: boolean;
    depth?: boolean;
    stencil?: boolean;
    alpha?: boolean;
    multiview?: boolean;
    framebufferScaleFactor?: number;
}

// https://www.w3.org/TR/webxrlayers-1/#XRWebGLBindingtype
class XRWebGLBinding {
    constructor(xrSession: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext);
    getReflectionCubeMap: (lightProbe: XRLightProbe) => WebGLTexture;

    // https://immersive-web.github.io/layers/#XRWebGLBindingtype
    createProjectionLayer(init: XRProjectionLayerInit): XRProjectionLayer;
    getSubImage(layer: XRCompositionLayer, frame: XRFrame, eye?: XREye): XRWebGLSubImage;
    getViewSubImage(layer: XRProjectionLayer, view: XRView): XRWebGLSubImage;
}

class XRWebGLLayer implements XRLayer {
    static getNativeFramebufferScaleFactor(session: XRSession): number;
    constructor(session: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext, layerInit?: XRWebGLLayerInit);
    readonly antialias: boolean;
    readonly framebuffer: WebGLFramebuffer;
    readonly framebufferWidth: number;
    readonly framebufferHeight: number;
    readonly ignoreDepthValues: boolean;
    fixedFoveation?: number | null;
    getViewport: (view: XRView) => XRViewport;

    // Methods for EventTarget required through XRLayer
    addEventListener(): void;
    dispatchEvent(): boolean;
    removeEventListener(): void;
}

type XRLayerLayout = "default" | "mono" | "stereo" | "stereo-left-right" | "stereo-top-bottom";

// https://immersive-web.github.io/layers/#xrcompositionlayertype
interface XRCompositionLayer extends XRLayer {
    layout: XRLayerLayout;

    blendTextureSourceAlpha: boolean;
    chromaticAberrationCorrection: boolean;
    mipLevels: number;

    needsRedraw: boolean;

    destroy(): void;
}

type XRTextureType = "texture" | "texture-array";

interface XRProjectionLayerInit {
    textureType: XRTextureType; //  Default  "texture";
    colorFormat: GLenum; //  Default 0x1908, RGBA
    depthFormat: GLenum; //  Default 0x1902, DEPTH_COMPONENT
    scaleFactor: number; //  Default 1.0;
}

interface XRProjectionLayer extends XRCompositionLayer {
    textureWidth: number;
    textureHeight: number;
    textureArrayLength: number;

    ignoreDepthValues: boolean;
    fixedFoveation?: number;
}

interface XRSubImage {
    viewport: XRViewport;
}

interface XRWebGLSubImage extends XRSubImage {
    colorTexture: WebGLTexture;
    depthStencilTexture?: WebGLTexture;
    imageIndex?: number;
    textureWidth: number;
    textureHeight: number;
}

// tslint:disable-next-line no-empty-interface
interface XRSpace extends EventTarget {}

interface XRRenderState {
    readonly baseLayer?: XRWebGLLayer;
    readonly depthFar: number;
    readonly depthNear: number;
    readonly inlineVerticalFieldOfView?: number;
    readonly layers?: XRLayer[];
}

// https://immersive-web.github.io/webxr/#dictdef-xrrenderstateinit
interface XRRenderStateInit {
    baseLayer?: XRWebGLLayer;
    depthFar: number;
    depthNear: number;
    inlineVerticalFieldOfView?: number;
    layers?: XRLayer[];
}

interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
    onreset: XREventHandler;
}

interface XRBoundedReferenceSpace extends XRSpace {
    readonly boundsGeometry: DOMPointReadOnly[];
}

interface XRInputSource {
    readonly handedness: XRHandedness;
    readonly targetRayMode: XRTargetRayMode;
    readonly targetRaySpace: XRSpace;
    readonly gripSpace?: XRSpace;
    readonly gamepad?: Gamepad;
    readonly profiles: Array<string>;
    readonly hand?: XRHand;
}

interface XRLightEstimate {
    readonly sphericalHarmonicsCoefficients: Float32Array;
    readonly primaryLightDirection: DOMPointReadOnly;
    readonly primaryLightIntensity: DOMPointReadOnly;
}

interface XRPose {
    readonly transform: XRRigidTransform;
    readonly emulatedPosition: boolean;
    readonly linearVelocity?: DOMPointReadOnly;
    readonly angularVelocity?: DOMPointReadOnly;
}

interface XRWorldInformation {
    detectedPlanes?: XRPlaneSet;
}

interface XRFrame {
    readonly session: XRSession;
    getPose(space: XRSpace, baseSpace: XRSpace): XRPose | undefined;
    fillPoses?(spaces: XRSpace[], baseSpace: XRSpace, transforms: Float32Array): boolean;
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined;

    // AR
    getHitTestResults(hitTestSource: XRHitTestSource): Array<XRHitTestResult>;
    getHitTestResultsForTransientInput(hitTestSource: XRTransientInputHitTestSource): Array<XRTransientInputHitTestResult>;
    // Anchors
    trackedAnchors?: XRAnchorSet;
    createAnchor?(pose: XRRigidTransform, space: XRSpace): Promise<XRAnchor>;
    // World geometries. DEPRECATED
    worldInformation?: XRWorldInformation;
    detectedPlanes?: XRPlaneSet;
    // Hand tracking
    getJointPose?(joint: XRJointSpace, baseSpace: XRSpace): XRJointPose;
    fillJointRadii?(jointSpaces: XRJointSpace[], radii: Float32Array): boolean;
    // Image tracking
    getImageTrackingResults?(): Array<XRImageTrackingResult>;
    getLightEstimate(xrLightProbe: XRLightProbe): XRLightEstimate;
}

interface XRInputSourceEvent extends Event {
    readonly frame: XRFrame;
    readonly inputSource: XRInputSource;
}

interface XREyeTrackingSourceEvent extends Event {
    readonly gazeSpace: XRSpace;
}

type XRInputSourceArray = XRInputSource[];

type XRDOMOverlayState = {
    /**
     * set if supported, or is null if the feature is not supported
     */
    type: XRDOMOverlayType | null;
};

interface XRLightProbe extends EventTarget {
    readonly probeSpace: XRSpace;
    onreflectionchange: XREventHandler;
}

interface XRSession {
    addEventListener(type: XREventType, listener: XREventHandler, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: XREventType, listener: XREventHandler, options?: boolean | EventListenerOptions): void;
    /**
     * Returns a list of this session's XRInputSources, each representing an input device
     * used to control the camera and/or scene.
     */
    readonly inputSources: Array<XRInputSource>;
    /**
     * object which contains options affecting how the imagery is rendered.
     * This includes things such as the near and far clipping planes
     */
    readonly renderState: XRRenderState;
    readonly visibilityState: XRVisibilityState;
    /**
     * Removes a callback from the animation frame painting callback from
     * XRSession's set of animation frame rendering callbacks, given the
     * identifying handle returned by a previous call to requestAnimationFrame().
     */
    cancelAnimationFrame: (handle: number) => void;
    /**
     * Ends the WebXR session. Returns a promise which resolves when the
     * session has been shut down.
     */
    end(): Promise<void>;
    /**
     * Schedules the specified method to be called the next time the user agent
     * is working on rendering an animation frame for the WebXR device. Returns an
     * integer value which can be used to identify the request for the purposes of
     * canceling the callback using cancelAnimationFrame(). This method is comparable
     * to the Window.requestAnimationFrame() method.
     */
    requestAnimationFrame: (callback: XRFrameRequestCallback) => number;
    /**
     * Requests that a new XRReferenceSpace of the specified type be created.
     * Returns a promise which resolves with the XRReferenceSpace or
     * XRBoundedReferenceSpace which was requested, or throws a NotSupportedError if
     * the requested space type isn't supported by the device.
     */
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    requestReferenceSpace(type: XRBoundedReferenceSpaceType): Promise<XRBoundedReferenceSpace>;

    /**
     * The XRSession interface is extended with the ability to create new XRLightProbe instances.
     * XRLightProbe instances have a session object, which is the XRSession that created this XRLightProbe.
     *
     * Can reject with with a "NotSupportedError" DOMException
     */
    requestLightProbe(options?: XRLightProbeInit): Promise<XRLightProbe>;

    updateRenderState(state: XRRenderStateInit): void;

    onend: XREventHandler;
    oneyetrackingstart: XREventHandler;
    oneyetrackingend: XREventHandler;
    oninputsourceschange: XREventHandler;
    onselect: XREventHandler;
    onselectstart: XREventHandler;
    onselectend: XREventHandler;
    onsqueeze: XREventHandler;
    onsqueezestart: XREventHandler;
    onsqueezeend: XREventHandler;
    onvisibilitychange: XREventHandler;

    // hit test
    requestHitTestSource?(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
    requestHitTestSourceForTransientInput?(options: XRTransientInputHitTestOptionsInit): Promise<XRTransientInputHitTestSource>;

    // legacy AR hit test
    requestHitTest?(ray: XRRay, referenceSpace: XRReferenceSpace): Promise<XRHitResult[]>;

    // legacy plane detection
    updateWorldTrackingState?(options: { planeDetectionState?: { enabled: boolean } }): void;

    // image tracking
    getTrackedImageScores?(): Promise<XRImageTrackingScore[]>;

    /**
     * Provided when the optional 'dom-overlay' feature is requested.
     */
    readonly domOverlayState?: XRDOMOverlayState;
    /**
     * Indicates the XRReflectionFormat most closely supported by the underlying XR device
     */
    readonly preferredReflectionFormat?: XRReflectionFormat;

    readonly frameRate?: number;
    readonly supportedFrameRates?: Float32Array;
    updateTargetFrameRate(rate: number): Promise<void>;
}

interface XRViewerPose extends XRPose {
    readonly views: Array<XRView>;
}

class XRRigidTransform {
    constructor(position?: DOMPointInit, direction?: DOMPointInit);
    position: DOMPointReadOnly;
    orientation: DOMPointReadOnly;
    matrix: Float32Array;
    inverse: XRRigidTransform;
}

interface XRView {
    readonly eye: XREye;
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
    readonly recommendedViewportScale?: number;
    requestViewportScale(scale: number): void;
}

interface XRInputSourceChangeEvent extends Event {
    session: XRSession;
    removed: Array<XRInputSource>;
    added: Array<XRInputSource>;
}

// Experimental/Draft features
class XRRay {
    constructor(transformOrOrigin: XRRigidTransform | DOMPointInit, direction?: DOMPointInit);
    origin: DOMPointReadOnly;
    direction: DOMPointReadOnly;
    matrix: Float32Array;
}

enum XRHitTestTrackableType {
    "point",
    "plane",
    "mesh",
}

interface XRHitResult {
    hitMatrix: Float32Array;
}

interface XRTransientInputHitTestResult {
    readonly inputSource: XRInputSource;
    readonly results: Array<XRHitTestResult>;
}

interface XRHitTestResult {
    getPose(baseSpace: XRSpace): XRPose | undefined;
    // When anchor system is enabled
    createAnchor?(pose: XRRigidTransform): Promise<XRAnchor>;
}

interface XRHitTestSource {
    cancel(): void;
}

interface XRTransientInputHitTestSource {
    cancel(): void;
}

interface XRHitTestOptionsInit {
    space: XRSpace;
    entityTypes?: Array<XRHitTestTrackableType>;
    offsetRay?: XRRay;
}

interface XRTransientInputHitTestOptionsInit {
    profile: string;
    entityTypes?: Array<XRHitTestTrackableType>;
    offsetRay?: XRRay;
}

interface XRAnchor {
    anchorSpace: XRSpace;
    delete(): void;
}

interface XRPlane {
    orientation: "Horizontal" | "Vertical";
    planeSpace: XRSpace;
    polygon: Array<DOMPointReadOnly>;
    lastChangedTime: number;
}

interface XRJointSpace extends XRSpace {}

interface XRJointPose extends XRPose {
    radius: number | undefined;
}

// to be extended
type XRHandJoint = string;

interface XRHand extends Iterable<XRJointSpace> {
    readonly size: number;

    [index: number]: XRJointSpace;

    get(joint: XRHandJoint): XRJointSpace;

    readonly WRIST: number;

    readonly THUMB_METACARPAL: number;
    readonly THUMB_PHALANX_PROXIMAL: number;
    readonly THUMB_PHALANX_DISTAL: number;
    readonly THUMB_PHALANX_TIP: number;

    readonly INDEX_METACARPAL: number;
    readonly INDEX_PHALANX_PROXIMAL: number;
    readonly INDEX_PHALANX_INTERMEDIATE: number;
    readonly INDEX_PHALANX_DISTAL: number;
    readonly INDEX_PHALANX_TIP: number;

    readonly MIDDLE_METACARPAL: number;
    readonly MIDDLE_PHALANX_PROXIMAL: number;
    readonly MIDDLE_PHALANX_INTERMEDIATE: number;
    readonly MIDDLE_PHALANX_DISTAL: number;
    readonly MIDDLE_PHALANX_TIP: number;

    readonly RING_METACARPAL: number;
    readonly RING_PHALANX_PROXIMAL: number;
    readonly RING_PHALANX_INTERMEDIATE: number;
    readonly RING_PHALANX_DISTAL: number;
    readonly RING_PHALANX_TIP: number;

    readonly LITTLE_METACARPAL: number;
    readonly LITTLE_PHALANX_PROXIMAL: number;
    readonly LITTLE_PHALANX_INTERMEDIATE: number;
    readonly LITTLE_PHALANX_DISTAL: number;
    readonly LITTLE_PHALANX_TIP: number;
}

type XRImageTrackingState = "tracked" | "emulated";
type XRImageTrackingScore = "untrackable" | "trackable";

interface XRTrackedImageInit {
    image: ImageBitmap;
    widthInMeters: number;
}

interface XRImageTrackingResult {
    readonly imageSpace: XRSpace;
    readonly index: number;
    readonly trackingState: XRImageTrackingState;
    readonly measuredWidthInMeters: number;
}

// This file contains native only extensions for WebXR. These APIs are not supported in the browser yet.
// They are intended for use with either Babylon Native https://github.com/BabylonJS/BabylonNative or
// Babylon React Native: https://github.com/BabylonJS/BabylonReactNative

type XRSceneObjectType = "unknown" | "background" | "wall" | "floor" | "ceiling" | "platform" | "inferred" | "world";

interface XRSceneObject {
    type: XRSceneObjectType;
}

interface XRFieldOfView {
    angleLeft: number;
    angleRight: number;
    angleUp: number;
    angleDown: number;
}

interface XRFrustum {
    position: DOMPointReadOnly;
    orientation: DOMPointReadOnly;
    fieldOfView: XRFieldOfView;
    farDistance: number;
}

interface XRPlane {
    parentSceneObject?: XRSceneObject;
}

interface XRMesh {
    meshSpace: XRSpace;
    positions: Float32Array;
    indices: Uint32Array;
    normals?: Float32Array;
    lastChangedTime: number;
    parentSceneObject?: XRSceneObject;
}

interface XRFrustumDetectionBoundary {
    type: "frustum";
    frustum: XRFrustum;
}

interface XRSphereDetectionBoundary {
    type: "sphere";
    radius: number;
}

interface XRBoxDetectionBoundary {
    type: "box";
    extent: DOMPointReadOnly;
}

type XRDetectionBoundary = XRFrustumDetectionBoundary | XRSphereDetectionBoundary | XRBoxDetectionBoundary;

interface XRGeometryDetectorOptions {
    detectionBoundary?: XRDetectionBoundary;
    updateInterval?: number;
}

interface XRSession {
    trySetFeaturePointCloudEnabled(enabled: boolean): boolean;
    trySetPreferredPlaneDetectorOptions(preferredOptions: XRGeometryDetectorOptions): boolean;
    trySetMeshDetectorEnabled(enabled: boolean): boolean;
    trySetPreferredMeshDetectorOptions(preferredOptions: XRGeometryDetectorOptions): boolean;
}

interface XRFrame {
    featurePointCloud?: Array<number>;
}

type XRMeshSet = Set<XRMesh>;

interface XRWorldInformation {
    detectedMeshes?: XRMeshSet;
}

}