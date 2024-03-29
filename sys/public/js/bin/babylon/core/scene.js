import { __assign, __extends } from "tslib";
import { Tools } from "./Misc/tools.js";
import { PrecisionDate } from "./Misc/precisionDate.js";
import { Observable } from "./Misc/observable.js";
import { SmartArrayNoDuplicate, SmartArray } from "./Misc/smartArray.js";
import { StringDictionary } from "./Misc/stringDictionary.js";
import { Tags } from "./Misc/tags.js";
import { Vector3, Matrix, TmpVectors } from "./Maths/math.vector.js";
import { AbstractScene } from "./abstractScene.js";
import { ImageProcessingConfiguration } from "./Materials/imageProcessingConfiguration.js";
import { UniformBuffer } from "./Materials/uniformBuffer.js";
import { PickingInfo } from "./Collisions/pickingInfo.js";
import { ActionEvent } from "./Actions/actionEvent.js";
import { PostProcessManager } from "./PostProcesses/postProcessManager.js";
import { RenderingManager } from "./Rendering/renderingManager.js";
import { Stage } from "./sceneComponent.js";

import { IsWindowObjectExist } from "./Misc/domManagement.js";
import { EngineStore } from "./Engines/engineStore.js";
import { _WarnImport } from "./Misc/devTools.js";
import { InputManager } from "./Inputs/scene.inputManager.js";
import { PerfCounter } from "./Misc/perfCounter.js";
import { Color4, Color3 } from "./Maths/math.color.js";
import { Frustum } from "./Maths/math.frustum.js";
import { UniqueIdGenerator } from "./Misc/uniqueIdGenerator.js";
import { ReadFile, RequestFile, LoadFile } from "./Misc/fileTools.js";
import { LightConstants } from "./Lights/lightConstants.js";
import { ComputePressureObserverWrapper } from "./Misc/computePressure.js";
import { SliceTools } from "./Misc/sliceTools.js";
/**
 * Represents a scene to be rendered by the engine.
 * @see https://doc.babylonjs.com/features/scene
 */
var Scene = /** @class */ (function (_super) {
    __extends(Scene, _super);
    /**
     * Creates a new Scene
     * @param engine defines the engine to use to render this scene
     * @param options defines the scene options
     */
    function Scene(engine, options) {
        var _this = _super.call(this) || this;
        // Members
        /** @hidden */
        _this._inputManager = new InputManager(_this);
        /** Define this parameter if you are using multiple cameras and you want to specify which one should be used for pointer position */
        _this.cameraToUseForPointers = null;
        /** @hidden */
        _this._isScene = true;
        /** @hidden */
        _this._blockEntityCollection = false;
        /**
         * Gets or sets a boolean that indicates if the scene must clear the render buffer before rendering a frame
         */
        _this.autoClear = true;
        /**
         * Gets or sets a boolean that indicates if the scene must clear the depth and stencil buffers before rendering a frame
         */
        _this.autoClearDepthAndStencil = true;
        /**
         * Defines the color used to clear the render buffer (Default is (0.2, 0.2, 0.3, 1.0))
         */
        _this.clearColor = new Color4(0.2, 0.2, 0.3, 1.0);
        /**
         * Defines the color used to simulate the ambient color (Default is (0, 0, 0))
         */
        _this.ambientColor = new Color3(0, 0, 0);
        /**
         * Intensity of the environment in all pbr material.
         * This dims or reinforces the IBL lighting overall (reflection and diffuse).
         * As in the majority of the scene they are the same (exception for multi room and so on),
         * this is easier to reference from here than from all the materials.
         */
        _this.environmentIntensity = 1;
        _this._forceWireframe = false;
        _this._skipFrustumClipping = false;
        _this._forcePointsCloud = false;
        /**
         * Gets or sets a boolean indicating if animations are enabled
         */
        _this.animationsEnabled = true;
        _this._animationPropertiesOverride = null;
        /**
         * Gets or sets a boolean indicating if a constant deltatime has to be used
         * This is mostly useful for testing purposes when you do not want the animations to scale with the framerate
         */
        _this.useConstantAnimationDeltaTime = false;
        /**
         * Gets or sets a boolean indicating if the scene must keep the meshUnderPointer property updated
         * Please note that it requires to run a ray cast through the scene on every frame
         */
        _this.constantlyUpdateMeshUnderPointer = false;
        /**
         * Defines the HTML cursor to use when hovering over interactive elements
         */
        _this.hoverCursor = "pointer";
        /**
         * Defines the HTML default cursor to use (empty by default)
         */
        _this.defaultCursor = "";
        /**
         * Defines whether cursors are handled by the scene.
         */
        _this.doNotHandleCursors = false;
        /**
         * This is used to call preventDefault() on pointer down
         * in order to block unwanted artifacts like system double clicks
         */
        _this.preventDefaultOnPointerDown = true;
        /**
         * This is used to call preventDefault() on pointer up
         * in order to block unwanted artifacts like system double clicks
         */
        _this.preventDefaultOnPointerUp = true;
        // Metadata
        /**
         * Gets or sets user defined metadata
         */
        _this.metadata = null;
        /**
         * For internal use only. Please do not use.
         */
        _this.reservedDataStore = null;
        /**
         * Use this array to add regular expressions used to disable offline support for specific urls
         */
        _this.disableOfflineSupportExceptionRules = new Array();
        /**
         * An event triggered when the scene is disposed.
         */
        _this.onDisposeObservable = new Observable();
        _this._onDisposeObserver = null;
        /**
         * An event triggered before rendering the scene (right after animations and physics)
         */
        _this.onBeforeRenderObservable = new Observable();
        _this._onBeforeRenderObserver = null;
        /**
         * An event triggered after rendering the scene
         */
        _this.onAfterRenderObservable = new Observable();
        /**
         * An event triggered after rendering the scene for an active camera (When scene.render is called this will be called after each camera)
         */
        _this.onAfterRenderCameraObservable = new Observable();
        _this._onAfterRenderObserver = null;
        /**
         * An event triggered before animating the scene
         */
        _this.onBeforeAnimationsObservable = new Observable();
        /**
         * An event triggered after animations processing
         */
        _this.onAfterAnimationsObservable = new Observable();
        /**
         * An event triggered before draw calls are ready to be sent
         */
        _this.onBeforeDrawPhaseObservable = new Observable();
        /**
         * An event triggered after draw calls have been sent
         */
        _this.onAfterDrawPhaseObservable = new Observable();
        /**
         * An event triggered when the scene is ready
         */
        _this.onReadyObservable = new Observable();
        /**
         * An event triggered before rendering a camera
         */
        _this.onBeforeCameraRenderObservable = new Observable();
        _this._onBeforeCameraRenderObserver = null;
        /**
         * An event triggered after rendering a camera
         */
        _this.onAfterCameraRenderObservable = new Observable();
        _this._onAfterCameraRenderObserver = null;
        /**
         * An event triggered when active meshes evaluation is about to start
         */
        _this.onBeforeActiveMeshesEvaluationObservable = new Observable();
        /**
         * An event triggered when active meshes evaluation is done
         */
        _this.onAfterActiveMeshesEvaluationObservable = new Observable();
        /**
         * An event triggered when particles rendering is about to start
         * Note: This event can be trigger more than once per frame (because particles can be rendered by render target textures as well)
         */
        _this.onBeforeParticlesRenderingObservable = new Observable();
        /**
         * An event triggered when particles rendering is done
         * Note: This event can be trigger more than once per frame (because particles can be rendered by render target textures as well)
         */
        _this.onAfterParticlesRenderingObservable = new Observable();
        /**
         * An event triggered when SceneLoader.Append or SceneLoader.Load or SceneLoader.ImportMesh were successfully executed
         */
        _this.onDataLoadedObservable = new Observable();
        /**
         * An event triggered when a camera is created
         */
        _this.onNewCameraAddedObservable = new Observable();
        /**
         * An event triggered when a camera is removed
         */
        _this.onCameraRemovedObservable = new Observable();
        /**
         * An event triggered when a light is created
         */
        _this.onNewLightAddedObservable = new Observable();
        /**
         * An event triggered when a light is removed
         */
        _this.onLightRemovedObservable = new Observable();
        /**
         * An event triggered when a geometry is created
         */
        _this.onNewGeometryAddedObservable = new Observable();
        /**
         * An event triggered when a geometry is removed
         */
        _this.onGeometryRemovedObservable = new Observable();
        /**
         * An event triggered when a transform node is created
         */
        _this.onNewTransformNodeAddedObservable = new Observable();
        /**
         * An event triggered when a transform node is removed
         */
        _this.onTransformNodeRemovedObservable = new Observable();
        /**
         * An event triggered when a mesh is created
         */
        _this.onNewMeshAddedObservable = new Observable();
        /**
         * An event triggered when a mesh is removed
         */
        _this.onMeshRemovedObservable = new Observable();
        /**
         * An event triggered when a skeleton is created
         */
        _this.onNewSkeletonAddedObservable = new Observable();
        /**
         * An event triggered when a skeleton is removed
         */
        _this.onSkeletonRemovedObservable = new Observable();
        /**
         * An event triggered when a material is created
         */
        _this.onNewMaterialAddedObservable = new Observable();
        /**
         * An event triggered when a multi material is created
         */
        _this.onNewMultiMaterialAddedObservable = new Observable();
        /**
         * An event triggered when a material is removed
         */
        _this.onMaterialRemovedObservable = new Observable();
        /**
         * An event triggered when a multi material is removed
         */
        _this.onMultiMaterialRemovedObservable = new Observable();
        /**
         * An event triggered when a texture is created
         */
        _this.onNewTextureAddedObservable = new Observable();
        /**
         * An event triggered when a texture is removed
         */
        _this.onTextureRemovedObservable = new Observable();
        /**
         * An event triggered when render targets are about to be rendered
         * Can happen multiple times per frame.
         */
        _this.onBeforeRenderTargetsRenderObservable = new Observable();
        /**
         * An event triggered when render targets were rendered.
         * Can happen multiple times per frame.
         */
        _this.onAfterRenderTargetsRenderObservable = new Observable();
        /**
         * An event triggered before calculating deterministic simulation step
         */
        _this.onBeforeStepObservable = new Observable();
        /**
         * An event triggered after calculating deterministic simulation step
         */
        _this.onAfterStepObservable = new Observable();
        /**
         * An event triggered when the activeCamera property is updated
         */
        _this.onActiveCameraChanged = new Observable();
        /**
         * This Observable will be triggered before rendering each renderingGroup of each rendered camera.
         * The RenderingGroupInfo class contains all the information about the context in which the observable is called
         * If you wish to register an Observer only for a given set of renderingGroup, use the mask with a combination of the renderingGroup index elevated to the power of two (1 for renderingGroup 0, 2 for renderingrOup1, 4 for 2 and 8 for 3)
         */
        _this.onBeforeRenderingGroupObservable = new Observable();
        /**
         * This Observable will be triggered after rendering each renderingGroup of each rendered camera.
         * The RenderingGroupInfo class contains all the information about the context in which the observable is called
         * If you wish to register an Observer only for a given set of renderingGroup, use the mask with a combination of the renderingGroup index elevated to the power of two (1 for renderingGroup 0, 2 for renderingrOup1, 4 for 2 and 8 for 3)
         */
        _this.onAfterRenderingGroupObservable = new Observable();
        /**
         * This Observable will when a mesh has been imported into the scene.
         */
        _this.onMeshImportedObservable = new Observable();
        /**
         * This Observable will when an animation file has been imported into the scene.
         */
        _this.onAnimationFileImportedObservable = new Observable();
        // Animations
        /** @hidden */
        _this._registeredForLateAnimationBindings = new SmartArrayNoDuplicate(256);
        /**
         * Gets or sets a boolean indicating if the user want to entirely skip the picking phase when a pointer move event occurs.
         */
        _this.skipPointerMovePicking = false;
        /**
         * Gets or sets a boolean indicating if the user want to entirely skip the picking phase when a pointer down event occurs.
         */
        _this.skipPointerDownPicking = false;
        /**
         * This observable event is triggered when any ponter event is triggered. It is registered during Scene.attachControl() and it is called BEFORE the 3D engine process anything (mesh/sprite picking for instance).
         * You have the possibility to skip the process and the call to onPointerObservable by setting PointerInfoPre.skipOnPointerObservable to true
         */
        _this.onPrePointerObservable = new Observable();
        /**
         * Observable event triggered each time an input event is received from the rendering canvas
         */
        _this.onPointerObservable = new Observable();
        // Keyboard
        /**
         * This observable event is triggered when any keyboard event si raised and registered during Scene.attachControl()
         * You have the possibility to skip the process and the call to onKeyboardObservable by setting KeyboardInfoPre.skipOnPointerObservable to true
         */
        _this.onPreKeyboardObservable = new Observable();
        /**
         * Observable event triggered each time an keyboard event is received from the hosting window
         */
        _this.onKeyboardObservable = new Observable();
        // Coordinates system
        _this._useRightHandedSystem = false;
        // Deterministic lockstep
        _this._timeAccumulator = 0;
        _this._currentStepId = 0;
        _this._currentInternalStep = 0;
        // Fog
        _this._fogEnabled = true;
        _this._fogMode = Scene.FOGMODE_NONE;
        /**
         * Gets or sets the fog color to use
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * (Default is Color3(0.2, 0.2, 0.3))
         */
        _this.fogColor = new Color3(0.2, 0.2, 0.3);
        /**
         * Gets or sets the fog density to use
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * (Default is 0.1)
         */
        _this.fogDensity = 0.1;
        /**
         * Gets or sets the fog start distance to use
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * (Default is 0)
         */
        _this.fogStart = 0;
        /**
         * Gets or sets the fog end distance to use
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * (Default is 1000)
         */
        _this.fogEnd = 1000.0;
        /**
         * Flag indicating if we need to store previous matrices when rendering
         */
        _this.needsPreviousWorldMatrices = false;
        // Lights
        _this._shadowsEnabled = true;
        _this._lightsEnabled = true;
        /** All of the active cameras added to this scene. */
        _this.activeCameras = new Array();
        // Textures
        _this._texturesEnabled = true;
        // Physics
        /**
         * Gets or sets a boolean indicating if physic engines are enabled on this scene
         */
        _this.physicsEnabled = true;
        // Particles
        /**
         * Gets or sets a boolean indicating if particles are enabled on this scene
         */
        _this.particlesEnabled = true;
        // Sprites
        /**
         * Gets or sets a boolean indicating if sprites are enabled on this scene
         */
        _this.spritesEnabled = true;
        // Skeletons
        _this._skeletonsEnabled = true;
        // Lens flares
        /**
         * Gets or sets a boolean indicating if lens flares are enabled on this scene
         */
        _this.lensFlaresEnabled = true;
        // Collisions
        /**
         * Gets or sets a boolean indicating if collisions are enabled on this scene
         * @see https://doc.babylonjs.com/babylon101/cameras,_mesh_collisions_and_gravity
         */
        _this.collisionsEnabled = true;
        /**
         * Defines the gravity applied to this scene (used only for collisions)
         * @see https://doc.babylonjs.com/babylon101/cameras,_mesh_collisions_and_gravity
         */
        _this.gravity = new Vector3(0, -9.807, 0);
        // Postprocesses
        /**
         * Gets or sets a boolean indicating if postprocesses are enabled on this scene
         */
        _this.postProcessesEnabled = true;
        // Customs render targets
        /**
         * Gets or sets a boolean indicating if render targets are enabled on this scene
         */
        _this.renderTargetsEnabled = true;
        /**
         * Gets or sets a boolean indicating if next render targets must be dumped as image for debugging purposes
         * We recommend not using it and instead rely on Spector.js: http://spector.babylonjs.com
         */
        _this.dumpNextRenderTargets = false;
        /**
         * The list of user defined render targets added to the scene
         */
        _this.customRenderTargets = new Array();
        /**
         * Gets the list of meshes imported to the scene through SceneLoader
         */
        _this.importedMeshesFiles = new Array();
        // Probes
        /**
         * Gets or sets a boolean indicating if probes are enabled on this scene
         */
        _this.probesEnabled = true;
        _this._meshesForIntersections = new SmartArrayNoDuplicate(256);
        // Procedural textures
        /**
         * Gets or sets a boolean indicating if procedural textures are enabled on this scene
         */
        _this.proceduralTexturesEnabled = true;
        // Performance counters
        _this._totalVertices = new PerfCounter();
        /** @hidden */
        _this._activeIndices = new PerfCounter();
        /** @hidden */
        _this._activeParticles = new PerfCounter();
        /** @hidden */
        _this._activeBones = new PerfCounter();
        /** @hidden */
        _this._animationTime = 0;
        /**
         * Gets or sets a general scale for animation speed
         * @see https://www.babylonjs-playground.com/#IBU2W7#3
         */
        _this.animationTimeScale = 1;
        _this._renderId = 0;
        _this._frameId = 0;
        _this._executeWhenReadyTimeoutId = null;
        _this._intermediateRendering = false;
        _this._defaultFrameBufferCleared = false;
        _this._viewUpdateFlag = -1;
        _this._projectionUpdateFlag = -1;
        /** @hidden */
        _this._toBeDisposed = new Array(256);
        _this._activeRequests = new Array();
        /** @hidden */
        _this._pendingData = new Array();
        _this._isDisposed = false;
        /**
         * Gets or sets a boolean indicating that all submeshes of active meshes must be rendered
         * Use this boolean to avoid computing frustum clipping on submeshes (This could help when you are CPU bound)
         */
        _this.dispatchAllSubMeshesOfActiveMeshes = false;
        _this._activeMeshes = new SmartArray(256);
        _this._processedMaterials = new SmartArray(256);
        _this._renderTargets = new SmartArrayNoDuplicate(256);
        _this._materialsRenderTargets = new SmartArrayNoDuplicate(256);
        /** @hidden */
        _this._activeParticleSystems = new SmartArray(256);
        _this._activeSkeletons = new SmartArrayNoDuplicate(32);
        _this._softwareSkinnedMeshes = new SmartArrayNoDuplicate(32);
        /** @hidden */
        _this._activeAnimatables = new Array();
        _this._transformMatrix = Matrix.Zero();
        /**
         * Gets or sets a boolean indicating if lights must be sorted by priority (off by default)
         * This is useful if there are more lights that the maximum simulteanous authorized
         */
        _this.requireLightSorting = false;
        /**
         * @hidden
         * Backing store of defined scene components.
         */
        _this._components = [];
        /**
         * @hidden
         * Backing store of defined scene components.
         */
        _this._serializableComponents = [];
        /**
         * List of components to register on the next registration step.
         */
        _this._transientComponents = [];
        /**
         * @hidden
         * Defines the actions happening before camera updates.
         */
        _this._beforeCameraUpdateStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening before clear the canvas.
         */
        _this._beforeClearStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening before clear the canvas.
         */
        _this._beforeRenderTargetClearStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions when collecting render targets for the frame.
         */
        _this._gatherRenderTargetsStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening for one camera in the frame.
         */
        _this._gatherActiveCameraRenderTargetsStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening during the per mesh ready checks.
         */
        _this._isReadyForMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening before evaluate active mesh checks.
         */
        _this._beforeEvaluateActiveMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening during the evaluate sub mesh checks.
         */
        _this._evaluateSubMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening during the active mesh stage.
         */
        _this._preActiveMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening during the per camera render target step.
         */
        _this._cameraDrawRenderTargetStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just before the active camera is drawing.
         */
        _this._beforeCameraDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just before a render target is drawing.
         */
        _this._beforeRenderTargetDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just before a rendering group is drawing.
         */
        _this._beforeRenderingGroupDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just before a mesh is drawing.
         */
        _this._beforeRenderingMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just after a mesh has been drawn.
         */
        _this._afterRenderingMeshStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just after a rendering group has been drawn.
         */
        _this._afterRenderingGroupDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just after the active camera has been drawn.
         */
        _this._afterCameraDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just after a render target has been drawn.
         */
        _this._afterRenderTargetDrawStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening just after rendering all cameras and computing intersections.
         */
        _this._afterRenderStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening when a pointer move event happens.
         */
        _this._pointerMoveStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening when a pointer down event happens.
         */
        _this._pointerDownStage = Stage.Create();
        /**
         * @hidden
         * Defines the actions happening when a pointer up event happens.
         */
        _this._pointerUpStage = Stage.Create();
        /**
         * an optional map from Geometry Id to Geometry index in the 'geometries' array
         */
        _this._geometriesByUniqueId = null;
        _this._defaultMeshCandidates = {
            data: [],
            length: 0
        };
        _this._defaultSubMeshCandidates = {
            data: [],
            length: 0
        };
        _this._preventFreeActiveMeshesAndRenderingGroups = false;
        /** @hidden */
        _this._activeMeshesFrozen = false;
        _this._activeMeshesFrozenButKeepClipping = false;
        _this._skipEvaluateActiveMeshesCompletely = false;
        /** @hidden */
        _this._allowPostProcessClearColor = true;
        /**
         * User updatable function that will return a deterministic frame time when engine is in deterministic lock step mode
         */
        _this.getDeterministicFrameTime = function () {
            return _this._engine.getTimeStep();
        };
        _this._blockMaterialDirtyMechanism = false;
        /**
         * Internal perfCollector instance used for sharing between inspector and playground.
         * Marked as protected to allow sharing between prototype extensions, but disallow access at toplevel.
         */
        _this._perfCollector = null;
        /**
         * An event triggered when the cpu usage/speed meets certain thresholds.
         * Note: Compute pressure is an experimental API.
         */
        _this.onComputePressureChanged = new Observable();
        var fullOptions = __assign({ useGeometryUniqueIdsMap: true, useMaterialMeshMap: true, useClonedMeshMap: true, virtual: false }, options);
        _this._engine = engine || EngineStore.LastCreatedEngine;
        if (!fullOptions.virtual) {
            EngineStore._LastCreatedScene = _this;
            _this._engine.scenes.push(_this);
        }
        else {
            _this._engine._virtualScenes.push(_this);
        }
        _this._uid = null;
        _this._renderingManager = new RenderingManager(_this);
        if (PostProcessManager) {
            _this.postProcessManager = new PostProcessManager(_this);
        }
        if (IsWindowObjectExist()) {
            _this.attachControl();
        }
        // Uniform Buffer
        _this._createUbo();
        // Default Image processing definition
        if (ImageProcessingConfiguration) {
            _this._imageProcessingConfiguration = new ImageProcessingConfiguration();
        }
        _this.setDefaultCandidateProviders();
        if (fullOptions.useGeometryUniqueIdsMap) {
            _this._geometriesByUniqueId = {};
        }
        _this.useMaterialMeshMap = fullOptions.useMaterialMeshMap;
        _this.useClonedMeshMap = fullOptions.useClonedMeshMap;
        if (!options || !options.virtual) {
            _this._engine.onNewSceneAddedObservable.notifyObservers(_this);
        }
        if (ComputePressureObserverWrapper.IsAvailable) {
            _this._computePressureObserver = new ComputePressureObserverWrapper(function (update) {
                _this.onComputePressureChanged.notifyObservers(update);
            }, {
                // Thresholds divide the interval [0.0 .. 1.0] into ranges.
                cpuUtilizationThresholds: [0.25, 0.5, 0.75, 0.9],
                cpuSpeedThresholds: [0.5]
            });
            _this._computePressureObserver.observe();
        }
        return _this;
    }
    /**
     * Factory used to create the default material.
     * @param scene The scene to create the material for
     * @returns The default material
     */
    Scene.DefaultMaterialFactory = function (scene) {
        throw _WarnImport("StandardMaterial");
    };
    /**
     * Factory used to create the a collision coordinator.
     * @returns The collision coordinator
     */
    Scene.CollisionCoordinatorFactory = function () {
        throw _WarnImport("DefaultCollisionCoordinator");
    };
    Object.defineProperty(Scene.prototype, "environmentTexture", {
        /**
         * Texture used in all pbr material as the reflection texture.
         * As in the majority of the scene they are the same (exception for multi room and so on),
         * this is easier to reference from here than from all the materials.
         */
        get: function () {
            return this._environmentTexture;
        },
        /**
         * Texture used in all pbr material as the reflection texture.
         * As in the majority of the scene they are the same (exception for multi room and so on),
         * this is easier to set here than in all the materials.
         */
        set: function (value) {
            if (this._environmentTexture === value) {
                return;
            }
            this._environmentTexture = value;
            this.markAllMaterialsAsDirty(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "imageProcessingConfiguration", {
        /**
         * Default image processing configuration used either in the rendering
         * Forward main pass or through the imageProcessingPostProcess if present.
         * As in the majority of the scene they are the same (exception for multi camera),
         * this is easier to reference from here than from all the materials and post process.
         *
         * No setter as we it is a shared configuration, you can set the values instead.
         */
        get: function () {
            return this._imageProcessingConfiguration;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "forceWireframe", {
        get: function () {
            return this._forceWireframe;
        },
        /**
         * Gets or sets a boolean indicating if all rendering must be done in wireframe
         */
        set: function (value) {
            if (this._forceWireframe === value) {
                return;
            }
            this._forceWireframe = value;
            this.markAllMaterialsAsDirty(16);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "skipFrustumClipping", {
        get: function () {
            return this._skipFrustumClipping;
        },
        /**
         * Gets or sets a boolean indicating if we should skip the frustum clipping part of the active meshes selection
         */
        set: function (value) {
            if (this._skipFrustumClipping === value) {
                return;
            }
            this._skipFrustumClipping = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "forcePointsCloud", {
        get: function () {
            return this._forcePointsCloud;
        },
        /**
         * Gets or sets a boolean indicating if all rendering must be done in point cloud
         */
        set: function (value) {
            if (this._forcePointsCloud === value) {
                return;
            }
            this._forcePointsCloud = value;
            this.markAllMaterialsAsDirty(16);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "animationPropertiesOverride", {
        /**
         * Gets or sets the animation properties override
         */
        get: function () {
            return this._animationPropertiesOverride;
        },
        set: function (value) {
            this._animationPropertiesOverride = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "onDispose", {
        /** Sets a function to be executed when this scene is disposed. */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "beforeRender", {
        /** Sets a function to be executed before rendering this scene */
        set: function (callback) {
            if (this._onBeforeRenderObserver) {
                this.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
            }
            if (callback) {
                this._onBeforeRenderObserver = this.onBeforeRenderObservable.add(callback);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "afterRender", {
        /** Sets a function to be executed after rendering this scene */
        set: function (callback) {
            if (this._onAfterRenderObserver) {
                this.onAfterRenderObservable.remove(this._onAfterRenderObserver);
            }
            if (callback) {
                this._onAfterRenderObserver = this.onAfterRenderObservable.add(callback);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "beforeCameraRender", {
        /** Sets a function to be executed before rendering a camera*/
        set: function (callback) {
            if (this._onBeforeCameraRenderObserver) {
                this.onBeforeCameraRenderObservable.remove(this._onBeforeCameraRenderObserver);
            }
            this._onBeforeCameraRenderObserver = this.onBeforeCameraRenderObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "afterCameraRender", {
        /** Sets a function to be executed after rendering a camera*/
        set: function (callback) {
            if (this._onAfterCameraRenderObserver) {
                this.onAfterCameraRenderObservable.remove(this._onAfterCameraRenderObserver);
            }
            this._onAfterCameraRenderObserver = this.onAfterCameraRenderObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "unTranslatedPointer", {
        /**
         * Gets the pointer coordinates without any translation (ie. straight out of the pointer event)
         */
        get: function () {
            return this._inputManager.unTranslatedPointer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene, "DragMovementThreshold", {
        /**
         * Gets or sets the distance in pixel that you have to move to prevent some events. Default is 10 pixels
         */
        get: function () {
            return InputManager.DragMovementThreshold;
        },
        set: function (value) {
            InputManager.DragMovementThreshold = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene, "LongPressDelay", {
        /**
         * Time in milliseconds to wait to raise long press events if button is still pressed. Default is 500 ms
         */
        get: function () {
            return InputManager.LongPressDelay;
        },
        set: function (value) {
            InputManager.LongPressDelay = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene, "DoubleClickDelay", {
        /**
         * Time in milliseconds to wait to raise long press events if button is still pressed. Default is 300 ms
         */
        get: function () {
            return InputManager.DoubleClickDelay;
        },
        set: function (value) {
            InputManager.DoubleClickDelay = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene, "ExclusiveDoubleClickMode", {
        /** If you need to check double click without raising a single click at first click, enable this flag */
        get: function () {
            return InputManager.ExclusiveDoubleClickMode;
        },
        set: function (value) {
            InputManager.ExclusiveDoubleClickMode = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Bind the current view position to an effect.
     * @param effect The effect to be bound
     * @param variableName name of the shader variable that will hold the eye position
     * @param isVector3 true to indicates that variableName is a Vector3 and not a Vector4
     * @return the computed eye position
     */
    Scene.prototype.bindEyePosition = function (effect, variableName, isVector3) {
        var _a;
        if (variableName === void 0) { variableName = "vEyePosition"; }
        if (isVector3 === void 0) { isVector3 = false; }
        var eyePosition = this._forcedViewPosition
            ? this._forcedViewPosition
            : this._mirroredCameraPosition
                ? this._mirroredCameraPosition
                : (_a = this.activeCamera.globalPosition) !== null && _a !== void 0 ? _a : this.activeCamera.devicePosition;
        var invertNormal = this.useRightHandedSystem === (this._mirroredCameraPosition != null);
        TmpVectors.Vector4[0].set(eyePosition.x, eyePosition.y, eyePosition.z, invertNormal ? -1 : 1);
        if (effect) {
            if (isVector3) {
                effect.setFloat3(variableName, TmpVectors.Vector4[0].x, TmpVectors.Vector4[0].y, TmpVectors.Vector4[0].z);
            }
            else {
                effect.setVector4(variableName, TmpVectors.Vector4[0]);
            }
        }
        return TmpVectors.Vector4[0];
    };
    /**
     * Update the scene ubo before it can be used in rendering processing
     * @returns the scene UniformBuffer
     */
    Scene.prototype.finalizeSceneUbo = function () {
        var ubo = this.getSceneUniformBuffer();
        var eyePosition = this.bindEyePosition(null);
        ubo.updateFloat4("vEyePosition", eyePosition.x, eyePosition.y, eyePosition.z, eyePosition.w);
        ubo.update();
        return ubo;
    };
    Object.defineProperty(Scene.prototype, "useRightHandedSystem", {
        get: function () {
            return this._useRightHandedSystem;
        },
        /**
         * Gets or sets a boolean indicating if the scene must use right-handed coordinates system
         */
        set: function (value) {
            if (this._useRightHandedSystem === value) {
                return;
            }
            this._useRightHandedSystem = value;
            this.markAllMaterialsAsDirty(16);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the step Id used by deterministic lock step
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @param newStepId defines the step Id
     */
    Scene.prototype.setStepId = function (newStepId) {
        this._currentStepId = newStepId;
    };
    /**
     * Gets the step Id used by deterministic lock step
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns the step Id
     */
    Scene.prototype.getStepId = function () {
        return this._currentStepId;
    };
    /**
     * Gets the internal step used by deterministic lock step
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns the internal step
     */
    Scene.prototype.getInternalStep = function () {
        return this._currentInternalStep;
    };
    Object.defineProperty(Scene.prototype, "fogEnabled", {
        get: function () {
            return this._fogEnabled;
        },
        /**
         * Gets or sets a boolean indicating if fog is enabled on this scene
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * (Default is true)
         */
        set: function (value) {
            if (this._fogEnabled === value) {
                return;
            }
            this._fogEnabled = value;
            this.markAllMaterialsAsDirty(16);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "fogMode", {
        get: function () {
            return this._fogMode;
        },
        /**
         * Gets or sets the fog mode to use
         * @see https://doc.babylonjs.com/babylon101/environment#fog
         * | mode | value |
         * | --- | --- |
         * | FOGMODE_NONE | 0 |
         * | FOGMODE_EXP | 1 |
         * | FOGMODE_EXP2 | 2 |
         * | FOGMODE_LINEAR | 3 |
         */
        set: function (value) {
            if (this._fogMode === value) {
                return;
            }
            this._fogMode = value;
            this.markAllMaterialsAsDirty(16);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "prePass", {
        /**
         * Flag indicating that the frame buffer binding is handled by another component
         */
        get: function () {
            return !!this.prePassRenderer && this.prePassRenderer.defaultRT.enabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "shadowsEnabled", {
        get: function () {
            return this._shadowsEnabled;
        },
        /**
         * Gets or sets a boolean indicating if shadows are enabled on this scene
         */
        set: function (value) {
            if (this._shadowsEnabled === value) {
                return;
            }
            this._shadowsEnabled = value;
            this.markAllMaterialsAsDirty(2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "lightsEnabled", {
        get: function () {
            return this._lightsEnabled;
        },
        /**
         * Gets or sets a boolean indicating if lights are enabled on this scene
         */
        set: function (value) {
            if (this._lightsEnabled === value) {
                return;
            }
            this._lightsEnabled = value;
            this.markAllMaterialsAsDirty(2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "activeCamera", {
        /** Gets or sets the current active camera */
        get: function () {
            return this._activeCamera;
        },
        set: function (value) {
            if (value === this._activeCamera) {
                return;
            }
            this._activeCamera = value;
            this.onActiveCameraChanged.notifyObservers(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "defaultMaterial", {
        /** The default material used on meshes when no material is affected */
        get: function () {
            if (!this._defaultMaterial) {
                this._defaultMaterial = Scene.DefaultMaterialFactory(this);
            }
            return this._defaultMaterial;
        },
        /** The default material used on meshes when no material is affected */
        set: function (value) {
            this._defaultMaterial = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "texturesEnabled", {
        get: function () {
            return this._texturesEnabled;
        },
        /**
         * Gets or sets a boolean indicating if textures are enabled on this scene
         */
        set: function (value) {
            if (this._texturesEnabled === value) {
                return;
            }
            this._texturesEnabled = value;
            this.markAllMaterialsAsDirty(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "skeletonsEnabled", {
        get: function () {
            return this._skeletonsEnabled;
        },
        /**
         * Gets or sets a boolean indicating if skeletons are enabled on this scene
         */
        set: function (value) {
            if (this._skeletonsEnabled === value) {
                return;
            }
            this._skeletonsEnabled = value;
            this.markAllMaterialsAsDirty(8);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "collisionCoordinator", {
        /** @hidden */
        get: function () {
            if (!this._collisionCoordinator) {
                this._collisionCoordinator = Scene.CollisionCoordinatorFactory();
                this._collisionCoordinator.init(this);
            }
            return this._collisionCoordinator;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "frustumPlanes", {
        /**
         * Gets the list of frustum planes (built from the active camera)
         */
        get: function () {
            return this._frustumPlanes;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Registers the transient components if needed.
     */
    Scene.prototype._registerTransientComponents = function () {
        // Register components that have been associated lately to the scene.
        if (this._transientComponents.length > 0) {
            for (var _i = 0, _a = this._transientComponents; _i < _a.length; _i++) {
                var component = _a[_i];
                component.register();
            }
            this._transientComponents = [];
        }
    };
    /**
     * @hidden
     * Add a component to the scene.
     * Note that the ccomponent could be registered on th next frame if this is called after
     * the register component stage.
     * @param component Defines the component to add to the scene
     */
    Scene.prototype._addComponent = function (component) {
        this._components.push(component);
        this._transientComponents.push(component);
        var serializableComponent = component;
        if (serializableComponent.addFromContainer && serializableComponent.serialize) {
            this._serializableComponents.push(serializableComponent);
        }
    };
    /**
     * @hidden
     * Gets a component from the scene.
     * @param name defines the name of the component to retrieve
     * @returns the component or null if not present
     */
    Scene.prototype._getComponent = function (name) {
        for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
            var component = _a[_i];
            if (component.name === name) {
                return component;
            }
        }
        return null;
    };
    /**
     * Gets a string identifying the name of the class
     * @returns "Scene" string
     */
    Scene.prototype.getClassName = function () {
        return "Scene";
    };
    /**
     * @hidden
     */
    Scene.prototype._getDefaultMeshCandidates = function () {
        this._defaultMeshCandidates.data = this.meshes;
        this._defaultMeshCandidates.length = this.meshes.length;
        return this._defaultMeshCandidates;
    };
    /**
     * @param mesh
     * @hidden
     */
    Scene.prototype._getDefaultSubMeshCandidates = function (mesh) {
        this._defaultSubMeshCandidates.data = mesh.subMeshes;
        this._defaultSubMeshCandidates.length = mesh.subMeshes.length;
        return this._defaultSubMeshCandidates;
    };
    /**
     * Sets the default candidate providers for the scene.
     * This sets the getActiveMeshCandidates, getActiveSubMeshCandidates, getIntersectingSubMeshCandidates
     * and getCollidingSubMeshCandidates to their default function
     */
    Scene.prototype.setDefaultCandidateProviders = function () {
        this.getActiveMeshCandidates = this._getDefaultMeshCandidates.bind(this);
        this.getActiveSubMeshCandidates = this._getDefaultSubMeshCandidates.bind(this);
        this.getIntersectingSubMeshCandidates = this._getDefaultSubMeshCandidates.bind(this);
        this.getCollidingSubMeshCandidates = this._getDefaultSubMeshCandidates.bind(this);
    };
    Object.defineProperty(Scene.prototype, "meshUnderPointer", {
        /**
         * Gets the mesh that is currently under the pointer
         */
        get: function () {
            return this._inputManager.meshUnderPointer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "pointerX", {
        /**
         * Gets or sets the current on-screen X position of the pointer
         */
        get: function () {
            return this._inputManager.pointerX;
        },
        set: function (value) {
            this._inputManager.pointerX = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "pointerY", {
        /**
         * Gets or sets the current on-screen Y position of the pointer
         */
        get: function () {
            return this._inputManager.pointerY;
        },
        set: function (value) {
            this._inputManager.pointerY = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the cached material (ie. the latest rendered one)
     * @returns the cached material
     */
    Scene.prototype.getCachedMaterial = function () {
        return this._cachedMaterial;
    };
    /**
     * Gets the cached effect (ie. the latest rendered one)
     * @returns the cached effect
     */
    Scene.prototype.getCachedEffect = function () {
        return this._cachedEffect;
    };
    /**
     * Gets the cached visibility state (ie. the latest rendered one)
     * @returns the cached visibility state
     */
    Scene.prototype.getCachedVisibility = function () {
        return this._cachedVisibility;
    };
    /**
     * Gets a boolean indicating if the current material / effect / visibility must be bind again
     * @param material defines the current material
     * @param effect defines the current effect
     * @param visibility defines the current visibility state
     * @returns true if one parameter is not cached
     */
    Scene.prototype.isCachedMaterialInvalid = function (material, effect, visibility) {
        if (visibility === void 0) { visibility = 1; }
        return this._cachedEffect !== effect || this._cachedMaterial !== material || this._cachedVisibility !== visibility;
    };
    /**
     * Gets the engine associated with the scene
     * @returns an Engine
     */
    Scene.prototype.getEngine = function () {
        return this._engine;
    };
    /**
     * Gets the total number of vertices rendered per frame
     * @returns the total number of vertices rendered per frame
     */
    Scene.prototype.getTotalVertices = function () {
        return this._totalVertices.current;
    };
    Object.defineProperty(Scene.prototype, "totalVerticesPerfCounter", {
        /**
         * Gets the performance counter for total vertices
         * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#instrumentation
         */
        get: function () {
            return this._totalVertices;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the total number of active indices rendered per frame (You can deduce the number of rendered triangles by dividing this number by 3)
     * @returns the total number of active indices rendered per frame
     */
    Scene.prototype.getActiveIndices = function () {
        return this._activeIndices.current;
    };
    Object.defineProperty(Scene.prototype, "totalActiveIndicesPerfCounter", {
        /**
         * Gets the performance counter for active indices
         * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#instrumentation
         */
        get: function () {
            return this._activeIndices;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the total number of active particles rendered per frame
     * @returns the total number of active particles rendered per frame
     */
    Scene.prototype.getActiveParticles = function () {
        return this._activeParticles.current;
    };
    Object.defineProperty(Scene.prototype, "activeParticlesPerfCounter", {
        /**
         * Gets the performance counter for active particles
         * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#instrumentation
         */
        get: function () {
            return this._activeParticles;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the total number of active bones rendered per frame
     * @returns the total number of active bones rendered per frame
     */
    Scene.prototype.getActiveBones = function () {
        return this._activeBones.current;
    };
    Object.defineProperty(Scene.prototype, "activeBonesPerfCounter", {
        /**
         * Gets the performance counter for active bones
         * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#instrumentation
         */
        get: function () {
            return this._activeBones;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the array of active meshes
     * @returns an array of AbstractMesh
     */
    Scene.prototype.getActiveMeshes = function () {
        return this._activeMeshes;
    };
    /**
     * Gets the animation ratio (which is 1.0 is the scene renders at 60fps and 2 if the scene renders at 30fps, etc.)
     * @returns a number
     */
    Scene.prototype.getAnimationRatio = function () {
        return this._animationRatio !== undefined ? this._animationRatio : 1;
    };
    /**
     * Gets an unique Id for the current render phase
     * @returns a number
     */
    Scene.prototype.getRenderId = function () {
        return this._renderId;
    };
    /**
     * Gets an unique Id for the current frame
     * @returns a number
     */
    Scene.prototype.getFrameId = function () {
        return this._frameId;
    };
    /** Call this function if you want to manually increment the render Id*/
    Scene.prototype.incrementRenderId = function () {
        this._renderId++;
    };
    Scene.prototype._createUbo = function () {
        this.setSceneUniformBuffer(this.createSceneUniformBuffer());
    };
    /**
     * Use this method to simulate a pointer move on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     * @returns the current scene
     */
    Scene.prototype.simulatePointerMove = function (pickResult, pointerEventInit) {
        this._inputManager.simulatePointerMove(pickResult, pointerEventInit);
        return this;
    };
    /**
     * Use this method to simulate a pointer down on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     * @returns the current scene
     */
    Scene.prototype.simulatePointerDown = function (pickResult, pointerEventInit) {
        this._inputManager.simulatePointerDown(pickResult, pointerEventInit);
        return this;
    };
    /**
     * Use this method to simulate a pointer up on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     * @param doubleTap indicates that the pointer up event should be considered as part of a double click (false by default)
     * @returns the current scene
     */
    Scene.prototype.simulatePointerUp = function (pickResult, pointerEventInit, doubleTap) {
        this._inputManager.simulatePointerUp(pickResult, pointerEventInit, doubleTap);
        return this;
    };
    /**
     * Gets a boolean indicating if the current pointer event is captured (meaning that the scene has already handled the pointer down)
     * @param pointerId defines the pointer id to use in a multi-touch scenario (0 by default)
     * @returns true if the pointer was captured
     */
    Scene.prototype.isPointerCaptured = function (pointerId) {
        if (pointerId === void 0) { pointerId = 0; }
        return this._inputManager.isPointerCaptured(pointerId);
    };
    /**
     * Attach events to the canvas (To handle actionManagers triggers and raise onPointerMove, onPointerDown and onPointerUp
     * @param attachUp defines if you want to attach events to pointerup
     * @param attachDown defines if you want to attach events to pointerdown
     * @param attachMove defines if you want to attach events to pointermove
     */
    Scene.prototype.attachControl = function (attachUp, attachDown, attachMove) {
        if (attachUp === void 0) { attachUp = true; }
        if (attachDown === void 0) { attachDown = true; }
        if (attachMove === void 0) { attachMove = true; }
        this._inputManager.attachControl(attachUp, attachDown, attachMove);
    };
    /** Detaches all event handlers*/
    Scene.prototype.detachControl = function () {
        this._inputManager.detachControl();
    };
    /**
     * This function will check if the scene can be rendered (textures are loaded, shaders are compiled)
     * Delay loaded resources are not taking in account
     * @param checkRenderTargets true to also check that the meshes rendered as part of a render target are ready (default: true)
     * @return true if all required resources are ready
     */
    Scene.prototype.isReady = function (checkRenderTargets) {
        if (checkRenderTargets === void 0) { checkRenderTargets = true; }
        if (this._isDisposed) {
            return false;
        }
        var index;
        var engine = this.getEngine();
        var isReady = true;
        // Pending data
        if (this._pendingData.length > 0) {
            isReady = false;
        }
        // Meshes
        if (checkRenderTargets) {
            this._processedMaterials.reset();
            this._materialsRenderTargets.reset();
        }
        for (index = 0; index < this.meshes.length; index++) {
            var mesh = this.meshes[index];
            if (!mesh.subMeshes || mesh.subMeshes.length === 0) {
                continue;
            }
            if (!mesh.isReady(true)) {
                isReady = false;
                continue;
            }
            var hardwareInstancedRendering = mesh.hasThinInstances ||
                mesh.getClassName() === "InstancedMesh" ||
                mesh.getClassName() === "InstancedLinesMesh" ||
                (engine.getCaps().instancedArrays && mesh.instances.length > 0);
            // Is Ready For Mesh
            for (var _i = 0, _a = this._isReadyForMeshStage; _i < _a.length; _i++) {
                var step = _a[_i];
                if (!step.action(mesh, hardwareInstancedRendering)) {
                    isReady = false;
                }
            }
            if (!checkRenderTargets) {
                continue;
            }
            var mat = mesh.material || this.defaultMaterial;
            if (mat) {
                if (mat._storeEffectOnSubMeshes) {
                    for (var _b = 0, _c = mesh.subMeshes; _b < _c.length; _b++) {
                        var subMesh = _c[_b];
                        var material = subMesh.getMaterial();
                        if (material && material.hasRenderTargetTextures && material.getRenderTargetTextures != null) {
                            if (this._processedMaterials.indexOf(material) === -1) {
                                this._processedMaterials.push(material);
                                this._materialsRenderTargets.concatWithNoDuplicate(material.getRenderTargetTextures());
                            }
                        }
                    }
                }
                else {
                    if (mat.hasRenderTargetTextures && mat.getRenderTargetTextures != null) {
                        if (this._processedMaterials.indexOf(mat) === -1) {
                            this._processedMaterials.push(mat);
                            this._materialsRenderTargets.concatWithNoDuplicate(mat.getRenderTargetTextures());
                        }
                    }
                }
            }
        }
        if (!isReady) {
            return false;
        }
        // Effects
        if (!engine.areAllEffectsReady()) {
            return false;
        }
        // Render targets
        if (checkRenderTargets) {
            for (index = 0; index < this._materialsRenderTargets.length; ++index) {
                var rtt = this._materialsRenderTargets.data[index];
                if (!rtt.isReadyForRendering()) {
                    return false;
                }
            }
        }
        // Geometries
        for (index = 0; index < this.geometries.length; index++) {
            var geometry = this.geometries[index];
            if (geometry.delayLoadState === 2) {
                return false;
            }
        }
        // Post-processes
        if (this.activeCameras && this.activeCameras.length > 0) {
            for (var _d = 0, _e = this.activeCameras; _d < _e.length; _d++) {
                var camera = _e[_d];
                if (!camera.isReady(true)) {
                    return false;
                }
            }
        }
        else if (this.activeCamera) {
            if (!this.activeCamera.isReady(true)) {
                return false;
            }
        }
        // Particles
        for (var _f = 0, _g = this.particleSystems; _f < _g.length; _f++) {
            var particleSystem = _g[_f];
            if (!particleSystem.isReady()) {
                return false;
            }
        }
        return true;
    };
    /** Resets all cached information relative to material (including effect and visibility) */
    Scene.prototype.resetCachedMaterial = function () {
        this._cachedMaterial = null;
        this._cachedEffect = null;
        this._cachedVisibility = null;
    };
    /**
     * Registers a function to be called before every frame render
     * @param func defines the function to register
     */
    Scene.prototype.registerBeforeRender = function (func) {
        this.onBeforeRenderObservable.add(func);
    };
    /**
     * Unregisters a function called before every frame render
     * @param func defines the function to unregister
     */
    Scene.prototype.unregisterBeforeRender = function (func) {
        this.onBeforeRenderObservable.removeCallback(func);
    };
    /**
     * Registers a function to be called after every frame render
     * @param func defines the function to register
     */
    Scene.prototype.registerAfterRender = function (func) {
        this.onAfterRenderObservable.add(func);
    };
    /**
     * Unregisters a function called after every frame render
     * @param func defines the function to unregister
     */
    Scene.prototype.unregisterAfterRender = function (func) {
        this.onAfterRenderObservable.removeCallback(func);
    };
    Scene.prototype._executeOnceBeforeRender = function (func) {
        var _this = this;
        var execFunc = function () {
            func();
            setTimeout(function () {
                _this.unregisterBeforeRender(execFunc);
            });
        };
        this.registerBeforeRender(execFunc);
    };
    /**
     * The provided function will run before render once and will be disposed afterwards.
     * A timeout delay can be provided so that the function will be executed in N ms.
     * The timeout is using the browser's native setTimeout so time percision cannot be guaranteed.
     * @param func The function to be executed.
     * @param timeout optional delay in ms
     */
    Scene.prototype.executeOnceBeforeRender = function (func, timeout) {
        var _this = this;
        if (timeout !== undefined) {
            setTimeout(function () {
                _this._executeOnceBeforeRender(func);
            }, timeout);
        }
        else {
            this._executeOnceBeforeRender(func);
        }
    };
    /**
     * @param data
     * @hidden
     */
    Scene.prototype._addPendingData = function (data) {
        this._pendingData.push(data);
    };
    /**
     * @param data
     * @hidden
     */
    Scene.prototype._removePendingData = function (data) {
        var wasLoading = this.isLoading;
        var index = this._pendingData.indexOf(data);
        if (index !== -1) {
            this._pendingData.splice(index, 1);
        }
        if (wasLoading && !this.isLoading) {
            this.onDataLoadedObservable.notifyObservers(this);
        }
    };
    /**
     * Returns the number of items waiting to be loaded
     * @returns the number of items waiting to be loaded
     */
    Scene.prototype.getWaitingItemsCount = function () {
        return this._pendingData.length;
    };
    Object.defineProperty(Scene.prototype, "isLoading", {
        /**
         * Returns a boolean indicating if the scene is still loading data
         */
        get: function () {
            return this._pendingData.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Registers a function to be executed when the scene is ready
     * @param {Function} func - the function to be executed
     * @param checkRenderTargets true to also check that the meshes rendered as part of a render target are ready (default: false)
     */
    Scene.prototype.executeWhenReady = function (func, checkRenderTargets) {
        var _this = this;
        if (checkRenderTargets === void 0) { checkRenderTargets = false; }
        this.onReadyObservable.add(func);
        if (this._executeWhenReadyTimeoutId !== null) {
            return;
        }
        this._executeWhenReadyTimeoutId = setTimeout(function () {
            _this._checkIsReady(checkRenderTargets);
        }, 150);
    };
    /**
     * Returns a promise that resolves when the scene is ready
     * @param checkRenderTargets true to also check that the meshes rendered as part of a render target are ready (default: false)
     * @returns A promise that resolves when the scene is ready
     */
    Scene.prototype.whenReadyAsync = function (checkRenderTargets) {
        var _this = this;
        if (checkRenderTargets === void 0) { checkRenderTargets = false; }
        return new Promise(function (resolve) {
            _this.executeWhenReady(function () {
                resolve();
            }, checkRenderTargets);
        });
    };
    /**
     * @param checkRenderTargets
     * @hidden
     */
    Scene.prototype._checkIsReady = function (checkRenderTargets) {
        var _this = this;
        if (checkRenderTargets === void 0) { checkRenderTargets = false; }
        this._registerTransientComponents();
        if (this.isReady(checkRenderTargets)) {
            this.onReadyObservable.notifyObservers(this);
            this.onReadyObservable.clear();
            this._executeWhenReadyTimeoutId = null;
            return;
        }
        if (this._isDisposed) {
            this.onReadyObservable.clear();
            this._executeWhenReadyTimeoutId = null;
            return;
        }
        this._executeWhenReadyTimeoutId = setTimeout(function () {
            _this._checkIsReady(checkRenderTargets);
        }, 100);
    };
    Object.defineProperty(Scene.prototype, "animatables", {
        /**
         * Gets all animatable attached to the scene
         */
        get: function () {
            return this._activeAnimatables;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Resets the last animation time frame.
     * Useful to override when animations start running when loading a scene for the first time.
     */
    Scene.prototype.resetLastAnimationTimeFrame = function () {
        this._animationTimeLast = PrecisionDate.Now;
    };
    // Matrix
    /**
     * Gets the current view matrix
     * @returns a Matrix
     */
    Scene.prototype.getViewMatrix = function () {
        return this._viewMatrix;
    };
    /**
     * Gets the current projection matrix
     * @returns a Matrix
     */
    Scene.prototype.getProjectionMatrix = function () {
        return this._projectionMatrix;
    };
    /**
     * Gets the current transform matrix
     * @returns a Matrix made of View * Projection
     */
    Scene.prototype.getTransformMatrix = function () {
        return this._transformMatrix;
    };
    /**
     * Sets the current transform matrix
     * @param viewL defines the View matrix to use
     * @param projectionL defines the Projection matrix to use
     * @param viewR defines the right View matrix to use (if provided)
     * @param projectionR defines the right Projection matrix to use (if provided)
     */
    Scene.prototype.setTransformMatrix = function (viewL, projectionL, viewR, projectionR) {
        // clear the multiviewSceneUbo if no viewR and projectionR are defined
        if (!viewR && !projectionR && this._multiviewSceneUbo) {
            this._multiviewSceneUbo.dispose();
            this._multiviewSceneUbo = null;
        }
        if (this._viewUpdateFlag === viewL.updateFlag && this._projectionUpdateFlag === projectionL.updateFlag) {
            return;
        }
        this._viewUpdateFlag = viewL.updateFlag;
        this._projectionUpdateFlag = projectionL.updateFlag;
        this._viewMatrix = viewL;
        this._projectionMatrix = projectionL;
        this._viewMatrix.multiplyToRef(this._projectionMatrix, this._transformMatrix);
        // Update frustum
        if (!this._frustumPlanes) {
            this._frustumPlanes = Frustum.GetPlanes(this._transformMatrix);
        }
        else {
            Frustum.GetPlanesToRef(this._transformMatrix, this._frustumPlanes);
        }
        if (this._multiviewSceneUbo && this._multiviewSceneUbo.useUbo) {
            this._updateMultiviewUbo(viewR, projectionR);
        }
        else if (this._sceneUbo.useUbo) {
            this._sceneUbo.updateMatrix("viewProjection", this._transformMatrix);
            this._sceneUbo.updateMatrix("view", this._viewMatrix);
            this._sceneUbo.updateMatrix("projection", this._projectionMatrix);
        }
    };
    /**
     * Gets the uniform buffer used to store scene data
     * @returns a UniformBuffer
     */
    Scene.prototype.getSceneUniformBuffer = function () {
        return this._multiviewSceneUbo ? this._multiviewSceneUbo : this._sceneUbo;
    };
    /**
     * Creates a scene UBO
     * @param name name of the uniform buffer (optional, for debugging purpose only)
     * @returns a new ubo
     */
    Scene.prototype.createSceneUniformBuffer = function (name) {
        var sceneUbo = new UniformBuffer(this._engine, undefined, false, name !== null && name !== void 0 ? name : "scene");
        sceneUbo.addUniform("viewProjection", 16);
        sceneUbo.addUniform("view", 16);
        sceneUbo.addUniform("projection", 16);
        sceneUbo.addUniform("vEyePosition", 4);
        return sceneUbo;
    };
    /**
     * Sets the scene ubo
     * @param ubo the ubo to set for the scene
     */
    Scene.prototype.setSceneUniformBuffer = function (ubo) {
        this._sceneUbo = ubo;
        this._viewUpdateFlag = -1;
        this._projectionUpdateFlag = -1;
    };
    /**
     * Gets an unique (relatively to the current scene) Id
     * @returns an unique number for the scene
     */
    Scene.prototype.getUniqueId = function () {
        return UniqueIdGenerator.UniqueId;
    };
    /**
     * Add a mesh to the list of scene's meshes
     * @param newMesh defines the mesh to add
     * @param recursive if all child meshes should also be added to the scene
     */
    Scene.prototype.addMesh = function (newMesh, recursive) {
        var _this = this;
        if (recursive === void 0) { recursive = false; }
        if (this._blockEntityCollection) {
            return;
        }
        this.meshes.push(newMesh);
        newMesh._resyncLightSources();
        if (!newMesh.parent) {
            newMesh._addToSceneRootNodes();
        }
        this.onNewMeshAddedObservable.notifyObservers(newMesh);
        if (recursive) {
            newMesh.getChildMeshes().forEach(function (m) {
                _this.addMesh(m);
            });
        }
    };
    /**
     * Remove a mesh for the list of scene's meshes
     * @param toRemove defines the mesh to remove
     * @param recursive if all child meshes should also be removed from the scene
     * @returns the index where the mesh was in the mesh list
     */
    Scene.prototype.removeMesh = function (toRemove, recursive) {
        var _this = this;
        if (recursive === void 0) { recursive = false; }
        var index = this.meshes.indexOf(toRemove);
        if (index !== -1) {
            // Remove from the scene if mesh found
            this.meshes[index] = this.meshes[this.meshes.length - 1];
            this.meshes.pop();
            if (!toRemove.parent) {
                toRemove._removeFromSceneRootNodes();
            }
        }
        this._inputManager._invalidateMesh(toRemove);
        this.onMeshRemovedObservable.notifyObservers(toRemove);
        if (recursive) {
            toRemove.getChildMeshes().forEach(function (m) {
                _this.removeMesh(m);
            });
        }
        return index;
    };
    /**
     * Add a transform node to the list of scene's transform nodes
     * @param newTransformNode defines the transform node to add
     */
    Scene.prototype.addTransformNode = function (newTransformNode) {
        if (this._blockEntityCollection) {
            return;
        }
        if (newTransformNode.getScene() === this && newTransformNode._indexInSceneTransformNodesArray !== -1) {
            // Already there?
            return;
        }
        newTransformNode._indexInSceneTransformNodesArray = this.transformNodes.length;
        this.transformNodes.push(newTransformNode);
        if (!newTransformNode.parent) {
            newTransformNode._addToSceneRootNodes();
        }
        this.onNewTransformNodeAddedObservable.notifyObservers(newTransformNode);
    };
    /**
     * Remove a transform node for the list of scene's transform nodes
     * @param toRemove defines the transform node to remove
     * @returns the index where the transform node was in the transform node list
     */
    Scene.prototype.removeTransformNode = function (toRemove) {
        var index = toRemove._indexInSceneTransformNodesArray;
        if (index !== -1) {
            if (index !== this.transformNodes.length - 1) {
                var lastNode = this.transformNodes[this.transformNodes.length - 1];
                this.transformNodes[index] = lastNode;
                lastNode._indexInSceneTransformNodesArray = index;
            }
            toRemove._indexInSceneTransformNodesArray = -1;
            this.transformNodes.pop();
            if (!toRemove.parent) {
                toRemove._removeFromSceneRootNodes();
            }
        }
        this.onTransformNodeRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Remove a skeleton for the list of scene's skeletons
     * @param toRemove defines the skeleton to remove
     * @returns the index where the skeleton was in the skeleton list
     */
    Scene.prototype.removeSkeleton = function (toRemove) {
        var index = this.skeletons.indexOf(toRemove);
        if (index !== -1) {
            // Remove from the scene if found
            this.skeletons.splice(index, 1);
            this.onSkeletonRemovedObservable.notifyObservers(toRemove);
            // Clean active container
            this._executeActiveContainerCleanup(this._activeSkeletons);
        }
        return index;
    };
    /**
     * Remove a morph target for the list of scene's morph targets
     * @param toRemove defines the morph target to remove
     * @returns the index where the morph target was in the morph target list
     */
    Scene.prototype.removeMorphTargetManager = function (toRemove) {
        var index = this.morphTargetManagers.indexOf(toRemove);
        if (index !== -1) {
            // Remove from the scene if found
            this.morphTargetManagers.splice(index, 1);
        }
        return index;
    };
    /**
     * Remove a light for the list of scene's lights
     * @param toRemove defines the light to remove
     * @returns the index where the light was in the light list
     */
    Scene.prototype.removeLight = function (toRemove) {
        var index = this.lights.indexOf(toRemove);
        if (index !== -1) {
            // Remove from meshes
            for (var _i = 0, _a = this.meshes; _i < _a.length; _i++) {
                var mesh = _a[_i];
                mesh._removeLightSource(toRemove, false);
            }
            // Remove from the scene if mesh found
            this.lights.splice(index, 1);
            this.sortLightsByPriority();
            if (!toRemove.parent) {
                toRemove._removeFromSceneRootNodes();
            }
        }
        this.onLightRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Remove a camera for the list of scene's cameras
     * @param toRemove defines the camera to remove
     * @returns the index where the camera was in the camera list
     */
    Scene.prototype.removeCamera = function (toRemove) {
        var index = this.cameras.indexOf(toRemove);
        if (index !== -1) {
            // Remove from the scene if mesh found
            this.cameras.splice(index, 1);
            if (!toRemove.parent) {
                toRemove._removeFromSceneRootNodes();
            }
        }
        // Remove from activeCameras
        if (this.activeCameras) {
            var index2 = this.activeCameras.indexOf(toRemove);
            if (index2 !== -1) {
                // Remove from the scene if mesh found
                this.activeCameras.splice(index2, 1);
            }
        }
        // Reset the activeCamera
        if (this.activeCamera === toRemove) {
            if (this.cameras.length > 0) {
                this.activeCamera = this.cameras[0];
            }
            else {
                this.activeCamera = null;
            }
        }
        this.onCameraRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Remove a particle system for the list of scene's particle systems
     * @param toRemove defines the particle system to remove
     * @returns the index where the particle system was in the particle system list
     */
    Scene.prototype.removeParticleSystem = function (toRemove) {
        var index = this.particleSystems.indexOf(toRemove);
        if (index !== -1) {
            this.particleSystems.splice(index, 1);
            // Clean active container
            this._executeActiveContainerCleanup(this._activeParticleSystems);
        }
        return index;
    };
    /**
     * Remove a animation for the list of scene's animations
     * @param toRemove defines the animation to remove
     * @returns the index where the animation was in the animation list
     */
    Scene.prototype.removeAnimation = function (toRemove) {
        var index = this.animations.indexOf(toRemove);
        if (index !== -1) {
            this.animations.splice(index, 1);
        }
        return index;
    };
    /**
     * Will stop the animation of the given target
     * @param target - the target
     * @param animationName - the name of the animation to stop (all animations will be stopped if both this and targetMask are empty)
     * @param targetMask - a function that determines if the animation should be stopped based on its target (all animations will be stopped if both this and animationName are empty)
     */
    Scene.prototype.stopAnimation = function (target, animationName, targetMask) {
        // Do nothing as code will be provided by animation component
    };
    /**
     * Removes the given animation group from this scene.
     * @param toRemove The animation group to remove
     * @returns The index of the removed animation group
     */
    Scene.prototype.removeAnimationGroup = function (toRemove) {
        var index = this.animationGroups.indexOf(toRemove);
        if (index !== -1) {
            this.animationGroups.splice(index, 1);
        }
        return index;
    };
    /**
     * Removes the given multi-material from this scene.
     * @param toRemove The multi-material to remove
     * @returns The index of the removed multi-material
     */
    Scene.prototype.removeMultiMaterial = function (toRemove) {
        var index = this.multiMaterials.indexOf(toRemove);
        if (index !== -1) {
            this.multiMaterials.splice(index, 1);
        }
        this.onMultiMaterialRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Removes the given material from this scene.
     * @param toRemove The material to remove
     * @returns The index of the removed material
     */
    Scene.prototype.removeMaterial = function (toRemove) {
        var index = toRemove._indexInSceneMaterialArray;
        if (index !== -1 && index < this.materials.length) {
            if (index !== this.materials.length - 1) {
                var lastMaterial = this.materials[this.materials.length - 1];
                this.materials[index] = lastMaterial;
                lastMaterial._indexInSceneMaterialArray = index;
            }
            toRemove._indexInSceneMaterialArray = -1;
            this.materials.pop();
        }
        this.onMaterialRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Removes the given action manager from this scene.
     * @param toRemove The action manager to remove
     * @returns The index of the removed action manager
     */
    Scene.prototype.removeActionManager = function (toRemove) {
        var index = this.actionManagers.indexOf(toRemove);
        if (index !== -1) {
            this.actionManagers.splice(index, 1);
        }
        return index;
    };
    /**
     * Removes the given texture from this scene.
     * @param toRemove The texture to remove
     * @returns The index of the removed texture
     */
    Scene.prototype.removeTexture = function (toRemove) {
        var index = this.textures.indexOf(toRemove);
        if (index !== -1) {
            this.textures.splice(index, 1);
        }
        this.onTextureRemovedObservable.notifyObservers(toRemove);
        return index;
    };
    /**
     * Adds the given light to this scene
     * @param newLight The light to add
     */
    Scene.prototype.addLight = function (newLight) {
        if (this._blockEntityCollection) {
            return;
        }
        this.lights.push(newLight);
        this.sortLightsByPriority();
        if (!newLight.parent) {
            newLight._addToSceneRootNodes();
        }
        // Add light to all meshes (To support if the light is removed and then re-added)
        for (var _i = 0, _a = this.meshes; _i < _a.length; _i++) {
            var mesh = _a[_i];
            if (mesh.lightSources.indexOf(newLight) === -1) {
                mesh.lightSources.push(newLight);
                mesh._resyncLightSources();
            }
        }
        this.onNewLightAddedObservable.notifyObservers(newLight);
    };
    /**
     * Sorts the list list based on light priorities
     */
    Scene.prototype.sortLightsByPriority = function () {
        if (this.requireLightSorting) {
            this.lights.sort(LightConstants.CompareLightsPriority);
        }
    };
    /**
     * Adds the given camera to this scene
     * @param newCamera The camera to add
     */
    Scene.prototype.addCamera = function (newCamera) {
        if (this._blockEntityCollection) {
            return;
        }
        this.cameras.push(newCamera);
        this.onNewCameraAddedObservable.notifyObservers(newCamera);
        if (!newCamera.parent) {
            newCamera._addToSceneRootNodes();
        }
    };
    /**
     * Adds the given skeleton to this scene
     * @param newSkeleton The skeleton to add
     */
    Scene.prototype.addSkeleton = function (newSkeleton) {
        if (this._blockEntityCollection) {
            return;
        }
        this.skeletons.push(newSkeleton);
        this.onNewSkeletonAddedObservable.notifyObservers(newSkeleton);
    };
    /**
     * Adds the given particle system to this scene
     * @param newParticleSystem The particle system to add
     */
    Scene.prototype.addParticleSystem = function (newParticleSystem) {
        if (this._blockEntityCollection) {
            return;
        }
        this.particleSystems.push(newParticleSystem);
    };
    /**
     * Adds the given animation to this scene
     * @param newAnimation The animation to add
     */
    Scene.prototype.addAnimation = function (newAnimation) {
        if (this._blockEntityCollection) {
            return;
        }
        this.animations.push(newAnimation);
    };
    /**
     * Adds the given animation group to this scene.
     * @param newAnimationGroup The animation group to add
     */
    Scene.prototype.addAnimationGroup = function (newAnimationGroup) {
        if (this._blockEntityCollection) {
            return;
        }
        this.animationGroups.push(newAnimationGroup);
    };
    /**
     * Adds the given multi-material to this scene
     * @param newMultiMaterial The multi-material to add
     */
    Scene.prototype.addMultiMaterial = function (newMultiMaterial) {
        if (this._blockEntityCollection) {
            return;
        }
        this.multiMaterials.push(newMultiMaterial);
        this.onNewMultiMaterialAddedObservable.notifyObservers(newMultiMaterial);
    };
    /**
     * Adds the given material to this scene
     * @param newMaterial The material to add
     */
    Scene.prototype.addMaterial = function (newMaterial) {
        if (this._blockEntityCollection) {
            return;
        }
        if (newMaterial.getScene() === this && newMaterial._indexInSceneMaterialArray !== -1) {
            // Already there??
            return;
        }
        newMaterial._indexInSceneMaterialArray = this.materials.length;
        this.materials.push(newMaterial);
        this.onNewMaterialAddedObservable.notifyObservers(newMaterial);
    };
    /**
     * Adds the given morph target to this scene
     * @param newMorphTargetManager The morph target to add
     */
    Scene.prototype.addMorphTargetManager = function (newMorphTargetManager) {
        if (this._blockEntityCollection) {
            return;
        }
        this.morphTargetManagers.push(newMorphTargetManager);
    };
    /**
     * Adds the given geometry to this scene
     * @param newGeometry The geometry to add
     */
    Scene.prototype.addGeometry = function (newGeometry) {
        if (this._blockEntityCollection) {
            return;
        }
        if (this._geometriesByUniqueId) {
            this._geometriesByUniqueId[newGeometry.uniqueId] = this.geometries.length;
        }
        this.geometries.push(newGeometry);
    };
    /**
     * Adds the given action manager to this scene
     * @param newActionManager The action manager to add
     */
    Scene.prototype.addActionManager = function (newActionManager) {
        this.actionManagers.push(newActionManager);
    };
    /**
     * Adds the given texture to this scene.
     * @param newTexture The texture to add
     */
    Scene.prototype.addTexture = function (newTexture) {
        if (this._blockEntityCollection) {
            return;
        }
        this.textures.push(newTexture);
        this.onNewTextureAddedObservable.notifyObservers(newTexture);
    };
    /**
     * Switch active camera
     * @param newCamera defines the new active camera
     * @param attachControl defines if attachControl must be called for the new active camera (default: true)
     */
    Scene.prototype.switchActiveCamera = function (newCamera, attachControl) {
        if (attachControl === void 0) { attachControl = true; }
        var canvas = this._engine.getInputElement();
        if (!canvas) {
            return;
        }
        if (this.activeCamera) {
            this.activeCamera.detachControl();
        }
        this.activeCamera = newCamera;
        if (attachControl) {
            newCamera.attachControl();
        }
    };
    /**
     * sets the active camera of the scene using its Id
     * @param id defines the camera's Id
     * @return the new active camera or null if none found.
     */
    Scene.prototype.setActiveCameraById = function (id) {
        var camera = this.getCameraById(id);
        if (camera) {
            this.activeCamera = camera;
            return camera;
        }
        return null;
    };
    /**
     * sets the active camera of the scene using its name
     * @param name defines the camera's name
     * @returns the new active camera or null if none found.
     */
    Scene.prototype.setActiveCameraByName = function (name) {
        var camera = this.getCameraByName(name);
        if (camera) {
            this.activeCamera = camera;
            return camera;
        }
        return null;
    };
    /**
     * get an animation group using its name
     * @param name defines the material's name
     * @return the animation group or null if none found.
     */
    Scene.prototype.getAnimationGroupByName = function (name) {
        for (var index = 0; index < this.animationGroups.length; index++) {
            if (this.animationGroups[index].name === name) {
                return this.animationGroups[index];
            }
        }
        return null;
    };
    /**
     * Get a material using its unique id
     * @param uniqueId defines the material's unique id
     * @return the material or null if none found.
     */
    Scene.prototype.getMaterialByUniqueID = function (uniqueId) {
        for (var index = 0; index < this.materials.length; index++) {
            if (this.materials[index].uniqueId === uniqueId) {
                return this.materials[index];
            }
        }
        return null;
    };
    /**
     * get a material using its id
     * @param id defines the material's Id
     * @return the material or null if none found.
     */
    Scene.prototype.getMaterialById = function (id) {
        for (var index = 0; index < this.materials.length; index++) {
            if (this.materials[index].id === id) {
                return this.materials[index];
            }
        }
        return null;
    };
    /**
     * Gets a the last added material using a given id
     * @param id defines the material's Id
     * @param allowMultiMaterials determines whether multimaterials should be considered
     * @return the last material with the given id or null if none found.
     */
    Scene.prototype.getLastMaterialById = function (id, allowMultiMaterials) {
        if (allowMultiMaterials === void 0) { allowMultiMaterials = false; }
        for (var index = this.materials.length - 1; index >= 0; index--) {
            if (this.materials[index].id === id) {
                return this.materials[index];
            }
        }
        if (allowMultiMaterials) {
            for (var index = this.multiMaterials.length - 1; index >= 0; index--) {
                if (this.multiMaterials[index].id === id) {
                    return this.multiMaterials[index];
                }
            }
        }
        return null;
    };
    /**
     * Gets a material using its name
     * @param name defines the material's name
     * @return the material or null if none found.
     */
    Scene.prototype.getMaterialByName = function (name) {
        for (var index = 0; index < this.materials.length; index++) {
            if (this.materials[index].name === name) {
                return this.materials[index];
            }
        }
        return null;
    };
    /**
     * Get a texture using its unique id
     * @param uniqueId defines the texture's unique id
     * @return the texture or null if none found.
     */
    Scene.prototype.getTextureByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.textures.length; index++) {
            if (this.textures[index].uniqueId === uniqueId) {
                return this.textures[index];
            }
        }
        return null;
    };
    /**
     * Gets a texture using its name
     * @param name defines the texture's name
     * @return the texture or null if none found.
     */
    Scene.prototype.getTextureByName = function (name) {
        for (var index = 0; index < this.textures.length; index++) {
            if (this.textures[index].name === name) {
                return this.textures[index];
            }
        }
        return null;
    };
    /**
     * Gets a camera using its Id
     * @param id defines the Id to look for
     * @returns the camera or null if not found
     */
    Scene.prototype.getCameraById = function (id) {
        for (var index = 0; index < this.cameras.length; index++) {
            if (this.cameras[index].id === id) {
                return this.cameras[index];
            }
        }
        return null;
    };
    /**
     * Gets a camera using its unique Id
     * @param uniqueId defines the unique Id to look for
     * @returns the camera or null if not found
     */
    Scene.prototype.getCameraByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.cameras.length; index++) {
            if (this.cameras[index].uniqueId === uniqueId) {
                return this.cameras[index];
            }
        }
        return null;
    };
    /**
     * Gets a camera using its name
     * @param name defines the camera's name
     * @return the camera or null if none found.
     */
    Scene.prototype.getCameraByName = function (name) {
        for (var index = 0; index < this.cameras.length; index++) {
            if (this.cameras[index].name === name) {
                return this.cameras[index];
            }
        }
        return null;
    };
    /**
     * Gets a bone using its Id
     * @param id defines the bone's Id
     * @return the bone or null if not found
     */
    Scene.prototype.getBoneById = function (id) {
        for (var skeletonIndex = 0; skeletonIndex < this.skeletons.length; skeletonIndex++) {
            var skeleton = this.skeletons[skeletonIndex];
            for (var boneIndex = 0; boneIndex < skeleton.bones.length; boneIndex++) {
                if (skeleton.bones[boneIndex].id === id) {
                    return skeleton.bones[boneIndex];
                }
            }
        }
        return null;
    };
    /**
     * Gets a bone using its id
     * @param name defines the bone's name
     * @return the bone or null if not found
     */
    Scene.prototype.getBoneByName = function (name) {
        for (var skeletonIndex = 0; skeletonIndex < this.skeletons.length; skeletonIndex++) {
            var skeleton = this.skeletons[skeletonIndex];
            for (var boneIndex = 0; boneIndex < skeleton.bones.length; boneIndex++) {
                if (skeleton.bones[boneIndex].name === name) {
                    return skeleton.bones[boneIndex];
                }
            }
        }
        return null;
    };
    /**
     * Gets a light node using its name
     * @param name defines the the light's name
     * @return the light or null if none found.
     */
    Scene.prototype.getLightByName = function (name) {
        for (var index = 0; index < this.lights.length; index++) {
            if (this.lights[index].name === name) {
                return this.lights[index];
            }
        }
        return null;
    };
    /**
     * Gets a light node using its Id
     * @param id defines the light's Id
     * @return the light or null if none found.
     */
    Scene.prototype.getLightById = function (id) {
        for (var index = 0; index < this.lights.length; index++) {
            if (this.lights[index].id === id) {
                return this.lights[index];
            }
        }
        return null;
    };
    /**
     * Gets a light node using its scene-generated unique Id
     * @param uniqueId defines the light's unique Id
     * @return the light or null if none found.
     */
    Scene.prototype.getLightByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.lights.length; index++) {
            if (this.lights[index].uniqueId === uniqueId) {
                return this.lights[index];
            }
        }
        return null;
    };
    /**
     * Gets a particle system by Id
     * @param id defines the particle system Id
     * @return the corresponding system or null if none found
     */
    Scene.prototype.getParticleSystemById = function (id) {
        for (var index = 0; index < this.particleSystems.length; index++) {
            if (this.particleSystems[index].id === id) {
                return this.particleSystems[index];
            }
        }
        return null;
    };
    /**
     * Gets a geometry using its Id
     * @param id defines the geometry's Id
     * @return the geometry or null if none found.
     */
    Scene.prototype.getGeometryById = function (id) {
        for (var index = 0; index < this.geometries.length; index++) {
            if (this.geometries[index].id === id) {
                return this.geometries[index];
            }
        }
        return null;
    };
    Scene.prototype._getGeometryByUniqueId = function (uniqueId) {
        if (this._geometriesByUniqueId) {
            var index = this._geometriesByUniqueId[uniqueId];
            if (index !== undefined) {
                return this.geometries[index];
            }
        }
        else {
            for (var index = 0; index < this.geometries.length; index++) {
                if (this.geometries[index].uniqueId === uniqueId) {
                    return this.geometries[index];
                }
            }
        }
        return null;
    };
    /**
     * Add a new geometry to this scene
     * @param geometry defines the geometry to be added to the scene.
     * @param force defines if the geometry must be pushed even if a geometry with this id already exists
     * @return a boolean defining if the geometry was added or not
     */
    Scene.prototype.pushGeometry = function (geometry, force) {
        if (!force && this._getGeometryByUniqueId(geometry.uniqueId)) {
            return false;
        }
        this.addGeometry(geometry);
        this.onNewGeometryAddedObservable.notifyObservers(geometry);
        return true;
    };
    /**
     * Removes an existing geometry
     * @param geometry defines the geometry to be removed from the scene
     * @return a boolean defining if the geometry was removed or not
     */
    Scene.prototype.removeGeometry = function (geometry) {
        var index;
        if (this._geometriesByUniqueId) {
            index = this._geometriesByUniqueId[geometry.uniqueId];
            if (index === undefined) {
                return false;
            }
        }
        else {
            index = this.geometries.indexOf(geometry);
            if (index < 0) {
                return false;
            }
        }
        if (index !== this.geometries.length - 1) {
            var lastGeometry = this.geometries[this.geometries.length - 1];
            if (lastGeometry) {
                this.geometries[index] = lastGeometry;
                if (this._geometriesByUniqueId) {
                    this._geometriesByUniqueId[lastGeometry.uniqueId] = index;
                    this._geometriesByUniqueId[geometry.uniqueId] = undefined;
                }
            }
        }
        this.geometries.pop();
        this.onGeometryRemovedObservable.notifyObservers(geometry);
        return true;
    };
    /**
     * Gets the list of geometries attached to the scene
     * @returns an array of Geometry
     */
    Scene.prototype.getGeometries = function () {
        return this.geometries;
    };
    /**
     * Gets the first added mesh found of a given Id
     * @param id defines the Id to search for
     * @return the mesh found or null if not found at all
     */
    Scene.prototype.getMeshById = function (id) {
        for (var index = 0; index < this.meshes.length; index++) {
            if (this.meshes[index].id === id) {
                return this.meshes[index];
            }
        }
        return null;
    };
    /**
     * Gets a list of meshes using their Id
     * @param id defines the Id to search for
     * @returns a list of meshes
     */
    Scene.prototype.getMeshesById = function (id) {
        return this.meshes.filter(function (m) {
            return m.id === id;
        });
    };
    /**
     * Gets the first added transform node found of a given Id
     * @param id defines the Id to search for
     * @return the found transform node or null if not found at all.
     */
    Scene.prototype.getTransformNodeById = function (id) {
        for (var index = 0; index < this.transformNodes.length; index++) {
            if (this.transformNodes[index].id === id) {
                return this.transformNodes[index];
            }
        }
        return null;
    };
    /**
     * Gets a transform node with its auto-generated unique Id
     * @param uniqueId defines the unique Id to search for
     * @return the found transform node or null if not found at all.
     */
    Scene.prototype.getTransformNodeByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.transformNodes.length; index++) {
            if (this.transformNodes[index].uniqueId === uniqueId) {
                return this.transformNodes[index];
            }
        }
        return null;
    };
    /**
     * Gets a list of transform nodes using their Id
     * @param id defines the Id to search for
     * @returns a list of transform nodes
     */
    Scene.prototype.getTransformNodesById = function (id) {
        return this.transformNodes.filter(function (m) {
            return m.id === id;
        });
    };
    /**
     * Gets a mesh with its auto-generated unique Id
     * @param uniqueId defines the unique Id to search for
     * @return the found mesh or null if not found at all.
     */
    Scene.prototype.getMeshByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.meshes.length; index++) {
            if (this.meshes[index].uniqueId === uniqueId) {
                return this.meshes[index];
            }
        }
        return null;
    };
    /**
     * Gets a the last added mesh using a given Id
     * @param id defines the Id to search for
     * @return the found mesh or null if not found at all.
     */
    Scene.prototype.getLastMeshById = function (id) {
        for (var index = this.meshes.length - 1; index >= 0; index--) {
            if (this.meshes[index].id === id) {
                return this.meshes[index];
            }
        }
        return null;
    };
    /**
     * Gets a the last added node (Mesh, Camera, Light) using a given Id
     * @param id defines the Id to search for
     * @return the found node or null if not found at all
     */
    Scene.prototype.getLastEntryById = function (id) {
        var index;
        for (index = this.meshes.length - 1; index >= 0; index--) {
            if (this.meshes[index].id === id) {
                return this.meshes[index];
            }
        }
        for (index = this.transformNodes.length - 1; index >= 0; index--) {
            if (this.transformNodes[index].id === id) {
                return this.transformNodes[index];
            }
        }
        for (index = this.cameras.length - 1; index >= 0; index--) {
            if (this.cameras[index].id === id) {
                return this.cameras[index];
            }
        }
        for (index = this.lights.length - 1; index >= 0; index--) {
            if (this.lights[index].id === id) {
                return this.lights[index];
            }
        }
        return null;
    };
    /**
     * Gets a node (Mesh, Camera, Light) using a given Id
     * @param id defines the Id to search for
     * @return the found node or null if not found at all
     */
    Scene.prototype.getNodeById = function (id) {
        var mesh = this.getMeshById(id);
        if (mesh) {
            return mesh;
        }
        var transformNode = this.getTransformNodeById(id);
        if (transformNode) {
            return transformNode;
        }
        var light = this.getLightById(id);
        if (light) {
            return light;
        }
        var camera = this.getCameraById(id);
        if (camera) {
            return camera;
        }
        var bone = this.getBoneById(id);
        if (bone) {
            return bone;
        }
        return null;
    };
    /**
     * Gets a node (Mesh, Camera, Light) using a given name
     * @param name defines the name to search for
     * @return the found node or null if not found at all.
     */
    Scene.prototype.getNodeByName = function (name) {
        var mesh = this.getMeshByName(name);
        if (mesh) {
            return mesh;
        }
        var transformNode = this.getTransformNodeByName(name);
        if (transformNode) {
            return transformNode;
        }
        var light = this.getLightByName(name);
        if (light) {
            return light;
        }
        var camera = this.getCameraByName(name);
        if (camera) {
            return camera;
        }
        var bone = this.getBoneByName(name);
        if (bone) {
            return bone;
        }
        return null;
    };
    /**
     * Gets a mesh using a given name
     * @param name defines the name to search for
     * @return the found mesh or null if not found at all.
     */
    Scene.prototype.getMeshByName = function (name) {
        for (var index = 0; index < this.meshes.length; index++) {
            if (this.meshes[index].name === name) {
                return this.meshes[index];
            }
        }
        return null;
    };
    /**
     * Gets a transform node using a given name
     * @param name defines the name to search for
     * @return the found transform node or null if not found at all.
     */
    Scene.prototype.getTransformNodeByName = function (name) {
        for (var index = 0; index < this.transformNodes.length; index++) {
            if (this.transformNodes[index].name === name) {
                return this.transformNodes[index];
            }
        }
        return null;
    };
    /**
     * Gets a skeleton using a given Id (if many are found, this function will pick the last one)
     * @param id defines the Id to search for
     * @return the found skeleton or null if not found at all.
     */
    Scene.prototype.getLastSkeletonById = function (id) {
        for (var index = this.skeletons.length - 1; index >= 0; index--) {
            if (this.skeletons[index].id === id) {
                return this.skeletons[index];
            }
        }
        return null;
    };
    /**
     * Gets a skeleton using a given auto generated unique id
     * @param  uniqueId defines the unique id to search for
     * @return the found skeleton or null if not found at all.
     */
    Scene.prototype.getSkeletonByUniqueId = function (uniqueId) {
        for (var index = 0; index < this.skeletons.length; index++) {
            if (this.skeletons[index].uniqueId === uniqueId) {
                return this.skeletons[index];
            }
        }
        return null;
    };
    /**
     * Gets a skeleton using a given id (if many are found, this function will pick the first one)
     * @param id defines the id to search for
     * @return the found skeleton or null if not found at all.
     */
    Scene.prototype.getSkeletonById = function (id) {
        for (var index = 0; index < this.skeletons.length; index++) {
            if (this.skeletons[index].id === id) {
                return this.skeletons[index];
            }
        }
        return null;
    };
    /**
     * Gets a skeleton using a given name
     * @param name defines the name to search for
     * @return the found skeleton or null if not found at all.
     */
    Scene.prototype.getSkeletonByName = function (name) {
        for (var index = 0; index < this.skeletons.length; index++) {
            if (this.skeletons[index].name === name) {
                return this.skeletons[index];
            }
        }
        return null;
    };
    /**
     * Gets a morph target manager  using a given id (if many are found, this function will pick the last one)
     * @param id defines the id to search for
     * @return the found morph target manager or null if not found at all.
     */
    Scene.prototype.getMorphTargetManagerById = function (id) {
        for (var index = 0; index < this.morphTargetManagers.length; index++) {
            if (this.morphTargetManagers[index].uniqueId === id) {
                return this.morphTargetManagers[index];
            }
        }
        return null;
    };
    /**
     * Gets a morph target using a given id (if many are found, this function will pick the first one)
     * @param id defines the id to search for
     * @return the found morph target or null if not found at all.
     */
    Scene.prototype.getMorphTargetById = function (id) {
        for (var managerIndex = 0; managerIndex < this.morphTargetManagers.length; ++managerIndex) {
            var morphTargetManager = this.morphTargetManagers[managerIndex];
            for (var index = 0; index < morphTargetManager.numTargets; ++index) {
                var target = morphTargetManager.getTarget(index);
                if (target.id === id) {
                    return target;
                }
            }
        }
        return null;
    };
    /**
     * Gets a morph target using a given name (if many are found, this function will pick the first one)
     * @param name defines the name to search for
     * @return the found morph target or null if not found at all.
     */
    Scene.prototype.getMorphTargetByName = function (name) {
        for (var managerIndex = 0; managerIndex < this.morphTargetManagers.length; ++managerIndex) {
            var morphTargetManager = this.morphTargetManagers[managerIndex];
            for (var index = 0; index < morphTargetManager.numTargets; ++index) {
                var target = morphTargetManager.getTarget(index);
                if (target.name === name) {
                    return target;
                }
            }
        }
        return null;
    };
    /**
     * Gets a post process using a given name (if many are found, this function will pick the first one)
     * @param name defines the name to search for
     * @return the found post process or null if not found at all.
     */
    Scene.prototype.getPostProcessByName = function (name) {
        for (var postProcessIndex = 0; postProcessIndex < this.postProcesses.length; ++postProcessIndex) {
            var postProcess = this.postProcesses[postProcessIndex];
            if (postProcess.name === name) {
                return postProcess;
            }
        }
        return null;
    };
    /**
     * Gets a boolean indicating if the given mesh is active
     * @param mesh defines the mesh to look for
     * @returns true if the mesh is in the active list
     */
    Scene.prototype.isActiveMesh = function (mesh) {
        return this._activeMeshes.indexOf(mesh) !== -1;
    };
    Object.defineProperty(Scene.prototype, "uid", {
        /**
         * Return a unique id as a string which can serve as an identifier for the scene
         */
        get: function () {
            if (!this._uid) {
                this._uid = Tools.RandomId();
            }
            return this._uid;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an externally attached data from its key.
     * This method call will fail and return false, if such key already exists.
     * If you don't care and just want to get the data no matter what, use the more convenient getOrAddExternalDataWithFactory() method.
     * @param key the unique key that identifies the data
     * @param data the data object to associate to the key for this Engine instance
     * @return true if no such key were already present and the data was added successfully, false otherwise
     */
    Scene.prototype.addExternalData = function (key, data) {
        if (!this._externalData) {
            this._externalData = new StringDictionary();
        }
        return this._externalData.add(key, data);
    };
    /**
     * Get an externally attached data from its key
     * @param key the unique key that identifies the data
     * @return the associated data, if present (can be null), or undefined if not present
     */
    Scene.prototype.getExternalData = function (key) {
        if (!this._externalData) {
            return null;
        }
        return this._externalData.get(key);
    };
    /**
     * Get an externally attached data from its key, create it using a factory if it's not already present
     * @param key the unique key that identifies the data
     * @param factory the factory that will be called to create the instance if and only if it doesn't exists
     * @return the associated data, can be null if the factory returned null.
     */
    Scene.prototype.getOrAddExternalDataWithFactory = function (key, factory) {
        if (!this._externalData) {
            this._externalData = new StringDictionary();
        }
        return this._externalData.getOrAddWithFactory(key, factory);
    };
    /**
     * Remove an externally attached data from the Engine instance
     * @param key the unique key that identifies the data
     * @return true if the data was successfully removed, false if it doesn't exist
     */
    Scene.prototype.removeExternalData = function (key) {
        return this._externalData.remove(key);
    };
    Scene.prototype._evaluateSubMesh = function (subMesh, mesh, initialMesh) {
        if (initialMesh.hasInstances ||
            initialMesh.isAnInstance ||
            this.dispatchAllSubMeshesOfActiveMeshes ||
            this._skipFrustumClipping ||
            mesh.alwaysSelectAsActiveMesh ||
            mesh.subMeshes.length === 1 ||
            subMesh.isInFrustum(this._frustumPlanes)) {
            for (var _i = 0, _a = this._evaluateSubMeshStage; _i < _a.length; _i++) {
                var step = _a[_i];
                step.action(mesh, subMesh);
            }
            var material = subMesh.getMaterial();
            if (material !== null && material !== undefined) {
                // Render targets
                if (material.hasRenderTargetTextures && material.getRenderTargetTextures != null) {
                    if (this._processedMaterials.indexOf(material) === -1) {
                        this._processedMaterials.push(material);
                        this._materialsRenderTargets.concatWithNoDuplicate(material.getRenderTargetTextures());
                    }
                }
                // Dispatch
                this._renderingManager.dispatch(subMesh, mesh, material);
            }
        }
    };
    /**
     * Clear the processed materials smart array preventing retention point in material dispose.
     */
    Scene.prototype.freeProcessedMaterials = function () {
        this._processedMaterials.dispose();
    };
    Object.defineProperty(Scene.prototype, "blockfreeActiveMeshesAndRenderingGroups", {
        /** Gets or sets a boolean blocking all the calls to freeActiveMeshes and freeRenderingGroups
         * It can be used in order to prevent going through methods freeRenderingGroups and freeActiveMeshes several times to improve performance
         * when disposing several meshes in a row or a hierarchy of meshes.
         * When used, it is the responsibility of the user to blockfreeActiveMeshesAndRenderingGroups back to false.
         */
        get: function () {
            return this._preventFreeActiveMeshesAndRenderingGroups;
        },
        set: function (value) {
            if (this._preventFreeActiveMeshesAndRenderingGroups === value) {
                return;
            }
            if (value) {
                this.freeActiveMeshes();
                this.freeRenderingGroups();
            }
            this._preventFreeActiveMeshesAndRenderingGroups = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clear the active meshes smart array preventing retention point in mesh dispose.
     */
    Scene.prototype.freeActiveMeshes = function () {
        if (this.blockfreeActiveMeshesAndRenderingGroups) {
            return;
        }
        this._activeMeshes.dispose();
        if (this.activeCamera && this.activeCamera._activeMeshes) {
            this.activeCamera._activeMeshes.dispose();
        }
        if (this.activeCameras) {
            for (var i = 0; i < this.activeCameras.length; i++) {
                var activeCamera = this.activeCameras[i];
                if (activeCamera && activeCamera._activeMeshes) {
                    activeCamera._activeMeshes.dispose();
                }
            }
        }
    };
    /**
     * Clear the info related to rendering groups preventing retention points during dispose.
     */
    Scene.prototype.freeRenderingGroups = function () {
        if (this.blockfreeActiveMeshesAndRenderingGroups) {
            return;
        }
        if (this._renderingManager) {
            this._renderingManager.freeRenderingGroups();
        }
        if (this.textures) {
            for (var i = 0; i < this.textures.length; i++) {
                var texture = this.textures[i];
                if (texture && texture.renderList) {
                    texture.freeRenderingGroups();
                }
            }
        }
    };
    /** @hidden */
    Scene.prototype._isInIntermediateRendering = function () {
        return this._intermediateRendering;
    };
    /**
     * Use this function to stop evaluating active meshes. The current list will be keep alive between frames
     * @param skipEvaluateActiveMeshes defines an optional boolean indicating that the evaluate active meshes step must be completely skipped
     * @param onSuccess optional success callback
     * @param onError optional error callback
     * @param freezeMeshes defines if meshes should be frozen (true by default)
     * @param keepFrustumCulling defines if you want to keep running the frustum clipping (false by default)
     * @returns the current scene
     */
    Scene.prototype.freezeActiveMeshes = function (skipEvaluateActiveMeshes, onSuccess, onError, freezeMeshes, keepFrustumCulling) {
        var _this = this;
        if (skipEvaluateActiveMeshes === void 0) { skipEvaluateActiveMeshes = false; }
        if (freezeMeshes === void 0) { freezeMeshes = true; }
        if (keepFrustumCulling === void 0) { keepFrustumCulling = false; }
        this.executeWhenReady(function () {
            if (!_this.activeCamera) {
                onError && onError("No active camera found");
                return;
            }
            if (!_this._frustumPlanes) {
                _this.updateTransformMatrix();
            }
            _this._evaluateActiveMeshes();
            _this._activeMeshesFrozen = true;
            _this._activeMeshesFrozenButKeepClipping = keepFrustumCulling;
            _this._skipEvaluateActiveMeshesCompletely = skipEvaluateActiveMeshes;
            if (freezeMeshes) {
                for (var index = 0; index < _this._activeMeshes.length; index++) {
                    _this._activeMeshes.data[index]._freeze();
                }
            }
            onSuccess && onSuccess();
        });
        return this;
    };
    /**
     * Use this function to restart evaluating active meshes on every frame
     * @returns the current scene
     */
    Scene.prototype.unfreezeActiveMeshes = function () {
        for (var index = 0; index < this.meshes.length; index++) {
            var mesh = this.meshes[index];
            if (mesh._internalAbstractMeshDataInfo) {
                mesh._internalAbstractMeshDataInfo._isActive = false;
            }
        }
        for (var index = 0; index < this._activeMeshes.length; index++) {
            this._activeMeshes.data[index]._unFreeze();
        }
        this._activeMeshesFrozen = false;
        return this;
    };
    Scene.prototype._executeActiveContainerCleanup = function (container) {
        var isInFastMode = this._engine.snapshotRendering && this._engine.snapshotRenderingMode === 1;
        if (!isInFastMode && this._activeMeshesFrozen && this._activeMeshes.length) {
            return; // Do not execute in frozen mode
        }
        // We need to ensure we are not in the rendering loop
        this.onBeforeRenderObservable.addOnce(function () { return container.dispose(); });
    };
    Scene.prototype._evaluateActiveMeshes = function () {
        var _a;
        if (this._engine.snapshotRendering && this._engine.snapshotRenderingMode === 1) {
            if (this._activeMeshes.length > 0) {
                (_a = this.activeCamera) === null || _a === void 0 ? void 0 : _a._activeMeshes.reset();
                this._activeMeshes.reset();
                this._renderingManager.reset();
                this._processedMaterials.reset();
                this._activeParticleSystems.reset();
                this._activeSkeletons.reset();
                this._softwareSkinnedMeshes.reset();
            }
            return;
        }
        if (this._activeMeshesFrozen && this._activeMeshes.length) {
            if (!this._skipEvaluateActiveMeshesCompletely) {
                var len_1 = this._activeMeshes.length;
                for (var i = 0; i < len_1; i++) {
                    var mesh = this._activeMeshes.data[i];
                    mesh.computeWorldMatrix();
                }
            }
            if (this._activeParticleSystems) {
                var psLength = this._activeParticleSystems.length;
                for (var i = 0; i < psLength; i++) {
                    this._activeParticleSystems.data[i].animate();
                }
            }
            return;
        }
        if (!this.activeCamera) {
            return;
        }
        this.onBeforeActiveMeshesEvaluationObservable.notifyObservers(this);
        this.activeCamera._activeMeshes.reset();
        this._activeMeshes.reset();
        this._renderingManager.reset();
        this._processedMaterials.reset();
        this._activeParticleSystems.reset();
        this._activeSkeletons.reset();
        this._softwareSkinnedMeshes.reset();
        this._materialsRenderTargets.reset();
        for (var _i = 0, _b = this._beforeEvaluateActiveMeshStage; _i < _b.length; _i++) {
            var step = _b[_i];
            step.action();
        }
        // Determine mesh candidates
        var meshes = this.getActiveMeshCandidates();
        // Check each mesh
        var len = meshes.length;
        for (var i = 0; i < len; i++) {
            var mesh = meshes.data[i];
            mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate = false;
            if (mesh.isBlocked) {
                continue;
            }
            this._totalVertices.addCount(mesh.getTotalVertices(), false);
            if (!mesh.isReady() || !mesh.isEnabled() || mesh.scaling.hasAZeroComponent) {
                continue;
            }
            mesh.computeWorldMatrix();
            // Intersections
            if (mesh.actionManager && mesh.actionManager.hasSpecificTriggers2(12, 13)) {
                this._meshesForIntersections.pushNoDuplicate(mesh);
            }
            // Switch to current LOD
            var meshToRender = this.customLODSelector ? this.customLODSelector(mesh, this.activeCamera) : mesh.getLOD(this.activeCamera);
            mesh._internalAbstractMeshDataInfo._currentLOD = meshToRender;
            mesh._internalAbstractMeshDataInfo._currentLODIsUpToDate = true;
            if (meshToRender === undefined || meshToRender === null) {
                continue;
            }
            // Compute world matrix if LOD is billboard
            if (meshToRender !== mesh && meshToRender.billboardMode !== 0) {
                meshToRender.computeWorldMatrix();
            }
            mesh._preActivate();
            if (mesh.isVisible &&
                mesh.visibility > 0 &&
                (mesh.layerMask & this.activeCamera.layerMask) !== 0 &&
                (this._skipFrustumClipping || mesh.alwaysSelectAsActiveMesh || mesh.isInFrustum(this._frustumPlanes))) {
                this._activeMeshes.push(mesh);
                this.activeCamera._activeMeshes.push(mesh);
                if (meshToRender !== mesh) {
                    meshToRender._activate(this._renderId, false);
                }
                for (var _c = 0, _d = this._preActiveMeshStage; _c < _d.length; _c++) {
                    var step = _d[_c];
                    step.action(mesh);
                }
                if (mesh._activate(this._renderId, false)) {
                    if (!mesh.isAnInstance) {
                        meshToRender._internalAbstractMeshDataInfo._onlyForInstances = false;
                    }
                    else {
                        if (mesh._internalAbstractMeshDataInfo._actAsRegularMesh) {
                            meshToRender = mesh;
                        }
                    }
                    meshToRender._internalAbstractMeshDataInfo._isActive = true;
                    this._activeMesh(mesh, meshToRender);
                }
                mesh._postActivate();
            }
        }
        this.onAfterActiveMeshesEvaluationObservable.notifyObservers(this);
        // Particle systems
        if (this.particlesEnabled) {
            this.onBeforeParticlesRenderingObservable.notifyObservers(this);
            for (var particleIndex = 0; particleIndex < this.particleSystems.length; particleIndex++) {
                var particleSystem = this.particleSystems[particleIndex];
                if (!particleSystem.isStarted() || !particleSystem.emitter) {
                    continue;
                }
                var emitter = particleSystem.emitter;
                if (!emitter.position || emitter.isEnabled()) {
                    this._activeParticleSystems.push(particleSystem);
                    particleSystem.animate();
                    this._renderingManager.dispatchParticles(particleSystem);
                }
            }
            this.onAfterParticlesRenderingObservable.notifyObservers(this);
        }
    };
    Scene.prototype._activeMesh = function (sourceMesh, mesh) {
        if (this._skeletonsEnabled && mesh.skeleton !== null && mesh.skeleton !== undefined) {
            if (this._activeSkeletons.pushNoDuplicate(mesh.skeleton)) {
                mesh.skeleton.prepare();
                this._activeBones.addCount(mesh.skeleton.bones.length, false);
            }
            if (!mesh.computeBonesUsingShaders) {
                this._softwareSkinnedMeshes.pushNoDuplicate(mesh);
            }
        }
        if (mesh && mesh.subMeshes && mesh.subMeshes.length > 0) {
            var subMeshes = this.getActiveSubMeshCandidates(mesh);
            var len = subMeshes.length;
            for (var i = 0; i < len; i++) {
                var subMesh = subMeshes.data[i];
                this._evaluateSubMesh(subMesh, mesh, sourceMesh);
            }
        }
    };
    /**
     * Update the transform matrix to update from the current active camera
     * @param force defines a boolean used to force the update even if cache is up to date
     */
    Scene.prototype.updateTransformMatrix = function (force) {
        if (!this.activeCamera) {
            return;
        }
        if (this.activeCamera._renderingMultiview) {
            var leftCamera = this.activeCamera._rigCameras[0];
            var rightCamera = this.activeCamera._rigCameras[1];
            this.setTransformMatrix(leftCamera.getViewMatrix(), leftCamera.getProjectionMatrix(force), rightCamera.getViewMatrix(), rightCamera.getProjectionMatrix(force));
        }
        else {
            this.setTransformMatrix(this.activeCamera.getViewMatrix(), this.activeCamera.getProjectionMatrix(force));
        }
    };
    Scene.prototype._bindFrameBuffer = function (camera, clear) {
        if (clear === void 0) { clear = true; }
        if (camera && camera._multiviewTexture) {
            camera._multiviewTexture._bindFrameBuffer();
        }
        else if (camera && camera.outputRenderTarget) {
            camera.outputRenderTarget._bindFrameBuffer();
        }
        else {
            if (!this._engine._currentFrameBufferIsDefaultFrameBuffer()) {
                this._engine.restoreDefaultFramebuffer();
            }
        }
        if (clear) {
            this._clearFrameBuffer(camera);
        }
    };
    Scene.prototype._clearFrameBuffer = function (camera) {
        // we assume the framebuffer currently bound is the right one
        if (camera && camera._multiviewTexture) {
            // no clearing?
        }
        else if (camera && camera.outputRenderTarget) {
            var rtt = camera.outputRenderTarget;
            if (rtt.onClearObservable.hasObservers()) {
                rtt.onClearObservable.notifyObservers(this._engine);
            }
            else if (!rtt.skipInitialClear) {
                this._engine.clear(rtt.clearColor || this.clearColor, !rtt._cleared, true, true);
                rtt._cleared = true;
            }
        }
        else {
            if (!this._defaultFrameBufferCleared) {
                this._defaultFrameBufferCleared = true;
                this._clear();
            }
            else {
                this._engine.clear(null, false, true, true);
            }
        }
    };
    /**
     * @param camera
     * @param rigParent
     * @param bindFrameBuffer
     * @hidden
     */
    Scene.prototype._renderForCamera = function (camera, rigParent, bindFrameBuffer) {
        var _a, _b, _c;
        if (bindFrameBuffer === void 0) { bindFrameBuffer = true; }
        if (camera && camera._skipRendering) {
            return;
        }
        var engine = this._engine;
        // Use _activeCamera instead of activeCamera to avoid onActiveCameraChanged
        this._activeCamera = camera;
        if (!this.activeCamera) {
            throw new Error("Active camera not set");
        }
        // Viewport
        engine.setViewport(this.activeCamera.viewport);
        // Camera
        this.resetCachedMaterial();
        this._renderId++;
        if (!this.prePass && bindFrameBuffer) {
            var skipInitialClear = true;
            if (camera._renderingMultiview && camera.outputRenderTarget) {
                skipInitialClear = camera.outputRenderTarget.skipInitialClear;
                if (this.autoClear) {
                    camera.outputRenderTarget.skipInitialClear = false;
                }
            }
            this._bindFrameBuffer(this._activeCamera);
            if (camera._renderingMultiview && camera.outputRenderTarget) {
                camera.outputRenderTarget.skipInitialClear = skipInitialClear;
            }
        }
        this.updateTransformMatrix();
        this.onBeforeCameraRenderObservable.notifyObservers(this.activeCamera);
        // Meshes
        this._evaluateActiveMeshes();
        // Software skinning
        for (var softwareSkinnedMeshIndex = 0; softwareSkinnedMeshIndex < this._softwareSkinnedMeshes.length; softwareSkinnedMeshIndex++) {
            var mesh = this._softwareSkinnedMeshes.data[softwareSkinnedMeshIndex];
            mesh.applySkeleton(mesh.skeleton);
        }
        // Render targets
        this.onBeforeRenderTargetsRenderObservable.notifyObservers(this);
        this._renderTargets.concatWithNoDuplicate(this._materialsRenderTargets);
        if (camera.customRenderTargets && camera.customRenderTargets.length > 0) {
            this._renderTargets.concatWithNoDuplicate(camera.customRenderTargets);
        }
        if (rigParent && rigParent.customRenderTargets && rigParent.customRenderTargets.length > 0) {
            this._renderTargets.concatWithNoDuplicate(rigParent.customRenderTargets);
        }
        if (this.environmentTexture && this.environmentTexture.isRenderTarget) {
            this._renderTargets.pushNoDuplicate(this.environmentTexture);
        }
        // Collects render targets from external components.
        for (var _i = 0, _d = this._gatherActiveCameraRenderTargetsStage; _i < _d.length; _i++) {
            var step = _d[_i];
            step.action(this._renderTargets);
        }
        var needRebind = false;
        if (this.renderTargetsEnabled) {
            this._intermediateRendering = true;
            if (this._renderTargets.length > 0) {
                Tools.StartPerformanceCounter("Render targets", this._renderTargets.length > 0);
                for (var renderIndex = 0; renderIndex < this._renderTargets.length; renderIndex++) {
                    var renderTarget = this._renderTargets.data[renderIndex];
                    if (renderTarget._shouldRender()) {
                        this._renderId++;
                        var hasSpecialRenderTargetCamera = renderTarget.activeCamera && renderTarget.activeCamera !== this.activeCamera;
                        renderTarget.render(hasSpecialRenderTargetCamera, this.dumpNextRenderTargets);
                        needRebind = true;
                    }
                }
                Tools.EndPerformanceCounter("Render targets", this._renderTargets.length > 0);
                this._renderId++;
            }
            for (var _e = 0, _f = this._cameraDrawRenderTargetStage; _e < _f.length; _e++) {
                var step = _f[_e];
                needRebind = step.action(this.activeCamera) || needRebind;
            }
            this._intermediateRendering = false;
        }
        this._engine.currentRenderPassId = (_c = (_b = (_a = camera.outputRenderTarget) === null || _a === void 0 ? void 0 : _a.renderPassId) !== null && _b !== void 0 ? _b : camera.renderPassId) !== null && _c !== void 0 ? _c : 0;
        // Restore framebuffer after rendering to targets
        if (needRebind && !this.prePass) {
            this._bindFrameBuffer(this._activeCamera, false);
        }
        this.onAfterRenderTargetsRenderObservable.notifyObservers(this);
        // Prepare Frame
        if (this.postProcessManager && !camera._multiviewTexture && !this.prePass) {
            this.postProcessManager._prepareFrame();
        }
        // Before Camera Draw
        for (var _g = 0, _h = this._beforeCameraDrawStage; _g < _h.length; _g++) {
            var step = _h[_g];
            step.action(this.activeCamera);
        }
        // Render
        this.onBeforeDrawPhaseObservable.notifyObservers(this);
        if (engine.snapshotRendering && engine.snapshotRenderingMode === 1) {
            this.finalizeSceneUbo();
        }
        this._renderingManager.render(null, null, true, true);
        this.onAfterDrawPhaseObservable.notifyObservers(this);
        // After Camera Draw
        for (var _j = 0, _k = this._afterCameraDrawStage; _j < _k.length; _j++) {
            var step = _k[_j];
            step.action(this.activeCamera);
        }
        // Finalize frame
        if (this.postProcessManager && !camera._multiviewTexture) {
            // if the camera has an output render target, render the post process to the render target
            var texture = camera.outputRenderTarget ? camera.outputRenderTarget.renderTarget : undefined;
            this.postProcessManager._finalizeFrame(camera.isIntermediate, texture);
        }
        // Reset some special arrays
        this._renderTargets.reset();
        this.onAfterCameraRenderObservable.notifyObservers(this.activeCamera);
    };
    Scene.prototype._processSubCameras = function (camera, bindFrameBuffer) {
        if (bindFrameBuffer === void 0) { bindFrameBuffer = true; }
        if (camera.cameraRigMode === 0 || camera._renderingMultiview) {
            if (camera._renderingMultiview && !this._multiviewSceneUbo) {
                this._createMultiviewUbo();
            }
            this._renderForCamera(camera, undefined, bindFrameBuffer);
            this.onAfterRenderCameraObservable.notifyObservers(camera);
            return;
        }
        if (camera._useMultiviewToSingleView) {
            this._renderMultiviewToSingleView(camera);
        }
        else {
            // rig cameras
            this.onBeforeCameraRenderObservable.notifyObservers(camera);
            for (var index = 0; index < camera._rigCameras.length; index++) {
                this._renderForCamera(camera._rigCameras[index], camera);
            }
        }
        // Use _activeCamera instead of activeCamera to avoid onActiveCameraChanged
        this._activeCamera = camera;
        this.updateTransformMatrix();
        this.onAfterRenderCameraObservable.notifyObservers(camera);
    };
    Scene.prototype._checkIntersections = function () {
        for (var index = 0; index < this._meshesForIntersections.length; index++) {
            var sourceMesh = this._meshesForIntersections.data[index];
            if (!sourceMesh.actionManager) {
                continue;
            }
            var _loop_1 = function (actionIndex) {
                var action = sourceMesh.actionManager.actions[actionIndex];
                if (action.trigger === 12 || action.trigger === 13) {
                    var parameters = action.getTriggerParameter();
                    var otherMesh_1 = parameters.mesh ? parameters.mesh : parameters;
                    var areIntersecting = otherMesh_1.intersectsMesh(sourceMesh, parameters.usePreciseIntersection);
                    var currentIntersectionInProgress = sourceMesh._intersectionsInProgress.indexOf(otherMesh_1);
                    if (areIntersecting && currentIntersectionInProgress === -1) {
                        if (action.trigger === 12) {
                            action._executeCurrent(ActionEvent.CreateNew(sourceMesh, undefined, otherMesh_1));
                            sourceMesh._intersectionsInProgress.push(otherMesh_1);
                        }
                        else if (action.trigger === 13) {
                            sourceMesh._intersectionsInProgress.push(otherMesh_1);
                        }
                    }
                    else if (!areIntersecting && currentIntersectionInProgress > -1) {
                        //They intersected, and now they don't.
                        //is this trigger an exit trigger? execute an event.
                        if (action.trigger === 13) {
                            action._executeCurrent(ActionEvent.CreateNew(sourceMesh, undefined, otherMesh_1));
                        }
                        //if this is an exit trigger, or no exit trigger exists, remove the id from the intersection in progress array.
                        if (!sourceMesh.actionManager.hasSpecificTrigger(13, function (parameter) {
                            var parameterMesh = parameter.mesh ? parameter.mesh : parameter;
                            return otherMesh_1 === parameterMesh;
                        }) ||
                            action.trigger === 13) {
                            sourceMesh._intersectionsInProgress.splice(currentIntersectionInProgress, 1);
                        }
                    }
                }
            };
            for (var actionIndex = 0; sourceMesh.actionManager && actionIndex < sourceMesh.actionManager.actions.length; actionIndex++) {
                _loop_1(actionIndex);
            }
        }
    };
    /**
     * @param step
     * @hidden
     */
    Scene.prototype._advancePhysicsEngineStep = function (step) {
        // Do nothing. Code will be replaced if physics engine component is referenced
    };
    /** @hidden */
    Scene.prototype._animate = function () {
        // Nothing to do as long as Animatable have not been imported.
    };
    /** Execute all animations (for a frame) */
    Scene.prototype.animate = function () {
        if (this._engine.isDeterministicLockStep()) {
            var deltaTime = Math.max(Scene.MinDeltaTime, Math.min(this._engine.getDeltaTime(), Scene.MaxDeltaTime)) + this._timeAccumulator;
            var defaultFrameTime = this._engine.getTimeStep();
            var defaultFPS = 1000.0 / defaultFrameTime / 1000.0;
            var stepsTaken = 0;
            var maxSubSteps = this._engine.getLockstepMaxSteps();
            var internalSteps = Math.floor(deltaTime / defaultFrameTime);
            internalSteps = Math.min(internalSteps, maxSubSteps);
            while (deltaTime > 0 && stepsTaken < internalSteps) {
                this.onBeforeStepObservable.notifyObservers(this);
                // Animations
                this._animationRatio = defaultFrameTime * defaultFPS;
                this._animate();
                this.onAfterAnimationsObservable.notifyObservers(this);
                // Physics
                if (this.physicsEnabled) {
                    this._advancePhysicsEngineStep(defaultFrameTime);
                }
                this.onAfterStepObservable.notifyObservers(this);
                this._currentStepId++;
                stepsTaken++;
                deltaTime -= defaultFrameTime;
            }
            this._timeAccumulator = deltaTime < 0 ? 0 : deltaTime;
        }
        else {
            // Animations
            var deltaTime = this.useConstantAnimationDeltaTime ? 16 : Math.max(Scene.MinDeltaTime, Math.min(this._engine.getDeltaTime(), Scene.MaxDeltaTime));
            this._animationRatio = deltaTime * (60.0 / 1000.0);
            this._animate();
            this.onAfterAnimationsObservable.notifyObservers(this);
            // Physics
            if (this.physicsEnabled) {
                this._advancePhysicsEngineStep(deltaTime);
            }
        }
    };
    Scene.prototype._clear = function () {
        if (this.autoClearDepthAndStencil || this.autoClear) {
            this._engine.clear(this.clearColor, this.autoClear || this.forceWireframe || this.forcePointsCloud, this.autoClearDepthAndStencil, this.autoClearDepthAndStencil);
        }
    };
    Scene.prototype._checkCameraRenderTarget = function (camera) {
        var _a;
        if ((camera === null || camera === void 0 ? void 0 : camera.outputRenderTarget) && !(camera === null || camera === void 0 ? void 0 : camera.isRigCamera)) {
            camera.outputRenderTarget._cleared = false;
        }
        if ((_a = camera === null || camera === void 0 ? void 0 : camera.rigCameras) === null || _a === void 0 ? void 0 : _a.length) {
            for (var i = 0; i < camera.rigCameras.length; ++i) {
                var rtt = camera.rigCameras[i].outputRenderTarget;
                if (rtt) {
                    rtt._cleared = false;
                }
            }
        }
    };
    /**
     * Resets the draw wrappers cache of all meshes
     * @param passId If provided, releases only the draw wrapper corresponding to this render pass id
     */
    Scene.prototype.resetDrawCache = function (passId) {
        if (!this.meshes) {
            return;
        }
        for (var _i = 0, _a = this.meshes; _i < _a.length; _i++) {
            var mesh = _a[_i];
            mesh.resetDrawCache(passId);
        }
    };
    /**
     * Render the scene
     * @param updateCameras defines a boolean indicating if cameras must update according to their inputs (true by default)
     * @param ignoreAnimations defines a boolean indicating if animations should not be executed (false by default)
     */
    Scene.prototype.render = function (updateCameras, ignoreAnimations) {
        var _a, _b, _c;
        if (updateCameras === void 0) { updateCameras = true; }
        if (ignoreAnimations === void 0) { ignoreAnimations = false; }
        if (this.isDisposed) {
            return;
        }
        if (this.onReadyObservable.hasObservers() && this._executeWhenReadyTimeoutId === null) {
            this._checkIsReady();
        }
        this._frameId++;
        this._defaultFrameBufferCleared = false;
        this._checkCameraRenderTarget(this.activeCamera);
        if ((_a = this.activeCameras) === null || _a === void 0 ? void 0 : _a.length) {
            this.activeCameras.forEach(this._checkCameraRenderTarget);
        }
        // Register components that have been associated lately to the scene.
        this._registerTransientComponents();
        this._activeParticles.fetchNewFrame();
        this._totalVertices.fetchNewFrame();
        this._activeIndices.fetchNewFrame();
        this._activeBones.fetchNewFrame();
        this._meshesForIntersections.reset();
        this.resetCachedMaterial();
        this.onBeforeAnimationsObservable.notifyObservers(this);
        // Actions
        if (this.actionManager) {
            this.actionManager.processTrigger(11);
        }
        // Animations
        if (!ignoreAnimations) {
            this.animate();
        }
        // Before camera update steps
        for (var _i = 0, _d = this._beforeCameraUpdateStage; _i < _d.length; _i++) {
            var step = _d[_i];
            step.action();
        }
        // Update Cameras
        if (updateCameras) {
            if (this.activeCameras && this.activeCameras.length > 0) {
                for (var cameraIndex = 0; cameraIndex < this.activeCameras.length; cameraIndex++) {
                    var camera = this.activeCameras[cameraIndex];
                    camera.update();
                    if (camera.cameraRigMode !== 0) {
                        // rig cameras
                        for (var index = 0; index < camera._rigCameras.length; index++) {
                            camera._rigCameras[index].update();
                        }
                    }
                }
            }
            else if (this.activeCamera) {
                this.activeCamera.update();
                if (this.activeCamera.cameraRigMode !== 0) {
                    // rig cameras
                    for (var index = 0; index < this.activeCamera._rigCameras.length; index++) {
                        this.activeCamera._rigCameras[index].update();
                    }
                }
            }
        }
        // Before render
        this.onBeforeRenderObservable.notifyObservers(this);
        var engine = this.getEngine();
        // Customs render targets
        this.onBeforeRenderTargetsRenderObservable.notifyObservers(this);
        var currentActiveCamera = ((_b = this.activeCameras) === null || _b === void 0 ? void 0 : _b.length) ? this.activeCameras[0] : this.activeCamera;
        if (this.renderTargetsEnabled) {
            Tools.StartPerformanceCounter("Custom render targets", this.customRenderTargets.length > 0);
            this._intermediateRendering = true;
            for (var customIndex = 0; customIndex < this.customRenderTargets.length; customIndex++) {
                var renderTarget = this.customRenderTargets[customIndex];
                if (renderTarget._shouldRender()) {
                    this._renderId++;
                    this.activeCamera = renderTarget.activeCamera || this.activeCamera;
                    if (!this.activeCamera) {
                        throw new Error("Active camera not set");
                    }
                    // Viewport
                    engine.setViewport(this.activeCamera.viewport);
                    // Camera
                    this.updateTransformMatrix();
                    renderTarget.render(currentActiveCamera !== this.activeCamera, this.dumpNextRenderTargets);
                }
            }
            Tools.EndPerformanceCounter("Custom render targets", this.customRenderTargets.length > 0);
            this._intermediateRendering = false;
            this._renderId++;
        }
        this._engine.currentRenderPassId = (_c = currentActiveCamera === null || currentActiveCamera === void 0 ? void 0 : currentActiveCamera.renderPassId) !== null && _c !== void 0 ? _c : 0;
        // Restore back buffer
        this.activeCamera = currentActiveCamera;
        if (this._activeCamera && this._activeCamera.cameraRigMode !== 22 && !this.prePass) {
            this._bindFrameBuffer(this._activeCamera, false);
        }
        this.onAfterRenderTargetsRenderObservable.notifyObservers(this);
        for (var _e = 0, _f = this._beforeClearStage; _e < _f.length; _e++) {
            var step = _f[_e];
            step.action();
        }
        // Clear
        this._clearFrameBuffer(this.activeCamera);
        // Collects render targets from external components.
        for (var _g = 0, _h = this._gatherRenderTargetsStage; _g < _h.length; _g++) {
            var step = _h[_g];
            step.action(this._renderTargets);
        }
        // Multi-cameras?
        if (this.activeCameras && this.activeCameras.length > 0) {
            for (var cameraIndex = 0; cameraIndex < this.activeCameras.length; cameraIndex++) {
                this._processSubCameras(this.activeCameras[cameraIndex], cameraIndex > 0);
            }
        }
        else {
            if (!this.activeCamera) {
                throw new Error("No camera defined");
            }
            this._processSubCameras(this.activeCamera, !!this.activeCamera.outputRenderTarget);
        }
        // Intersection checks
        this._checkIntersections();
        // Executes the after render stage actions.
        for (var _j = 0, _k = this._afterRenderStage; _j < _k.length; _j++) {
            var step = _k[_j];
            step.action();
        }
        // After render
        if (this.afterRender) {
            this.afterRender();
        }
        this.onAfterRenderObservable.notifyObservers(this);
        // Cleaning
        if (this._toBeDisposed.length) {
            for (var index = 0; index < this._toBeDisposed.length; index++) {
                var data = this._toBeDisposed[index];
                if (data) {
                    data.dispose();
                }
            }
            this._toBeDisposed = [];
        }
        if (this.dumpNextRenderTargets) {
            this.dumpNextRenderTargets = false;
        }
        this._activeBones.addCount(0, true);
        this._activeIndices.addCount(0, true);
        this._activeParticles.addCount(0, true);
        this._engine.restoreDefaultFramebuffer();
    };
    /**
     * Freeze all materials
     * A frozen material will not be updatable but should be faster to render
     */
    Scene.prototype.freezeMaterials = function () {
        for (var i = 0; i < this.materials.length; i++) {
            this.materials[i].freeze();
        }
    };
    /**
     * Unfreeze all materials
     * A frozen material will not be updatable but should be faster to render
     */
    Scene.prototype.unfreezeMaterials = function () {
        for (var i = 0; i < this.materials.length; i++) {
            this.materials[i].unfreeze();
        }
    };
    /**
     * Releases all held resources
     */
    Scene.prototype.dispose = function () {
        var _a;
        if (this.isDisposed) {
            return;
        }
        this.beforeRender = null;
        this.afterRender = null;
        this.metadata = null;
        this.skeletons = [];
        this.morphTargetManagers = [];
        this._transientComponents = [];
        this._isReadyForMeshStage.clear();
        this._beforeEvaluateActiveMeshStage.clear();
        this._evaluateSubMeshStage.clear();
        this._preActiveMeshStage.clear();
        this._cameraDrawRenderTargetStage.clear();
        this._beforeCameraDrawStage.clear();
        this._beforeRenderTargetDrawStage.clear();
        this._beforeRenderingGroupDrawStage.clear();
        this._beforeRenderingMeshStage.clear();
        this._afterRenderingMeshStage.clear();
        this._afterRenderingGroupDrawStage.clear();
        this._afterCameraDrawStage.clear();
        this._afterRenderTargetDrawStage.clear();
        this._afterRenderStage.clear();
        this._beforeCameraUpdateStage.clear();
        this._beforeClearStage.clear();
        this._gatherRenderTargetsStage.clear();
        this._gatherActiveCameraRenderTargetsStage.clear();
        this._pointerMoveStage.clear();
        this._pointerDownStage.clear();
        this._pointerUpStage.clear();
        this.importedMeshesFiles = new Array();
        if (this.stopAllAnimations) {
            this.stopAllAnimations();
        }
        this.resetCachedMaterial();
        // Smart arrays
        if (this.activeCamera) {
            this.activeCamera._activeMeshes.dispose();
            this.activeCamera = null;
        }
        this._activeMeshes.dispose();
        this._renderingManager.dispose();
        this._processedMaterials.dispose();
        this._activeParticleSystems.dispose();
        this._activeSkeletons.dispose();
        this._softwareSkinnedMeshes.dispose();
        this._renderTargets.dispose();
        this._materialsRenderTargets.dispose();
        this._registeredForLateAnimationBindings.dispose();
        this._meshesForIntersections.dispose();
        this._toBeDisposed = [];
        // Abort active requests
        var activeRequests = this._activeRequests.slice();
        for (var _i = 0, activeRequests_1 = activeRequests; _i < activeRequests_1.length; _i++) {
            var request = activeRequests_1[_i];
            request.abort();
        }
        this._activeRequests = [];
        // Events
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.onBeforeRenderObservable.clear();
        this.onAfterRenderObservable.clear();
        this.onBeforeRenderTargetsRenderObservable.clear();
        this.onAfterRenderTargetsRenderObservable.clear();
        this.onAfterStepObservable.clear();
        this.onBeforeStepObservable.clear();
        this.onBeforeActiveMeshesEvaluationObservable.clear();
        this.onAfterActiveMeshesEvaluationObservable.clear();
        this.onBeforeParticlesRenderingObservable.clear();
        this.onAfterParticlesRenderingObservable.clear();
        this.onBeforeDrawPhaseObservable.clear();
        this.onAfterDrawPhaseObservable.clear();
        this.onBeforeAnimationsObservable.clear();
        this.onAfterAnimationsObservable.clear();
        this.onDataLoadedObservable.clear();
        this.onBeforeRenderingGroupObservable.clear();
        this.onAfterRenderingGroupObservable.clear();
        this.onMeshImportedObservable.clear();
        this.onBeforeCameraRenderObservable.clear();
        this.onAfterCameraRenderObservable.clear();
        this.onReadyObservable.clear();
        this.onNewCameraAddedObservable.clear();
        this.onCameraRemovedObservable.clear();
        this.onNewLightAddedObservable.clear();
        this.onLightRemovedObservable.clear();
        this.onNewGeometryAddedObservable.clear();
        this.onGeometryRemovedObservable.clear();
        this.onNewTransformNodeAddedObservable.clear();
        this.onTransformNodeRemovedObservable.clear();
        this.onNewMeshAddedObservable.clear();
        this.onMeshRemovedObservable.clear();
        this.onNewSkeletonAddedObservable.clear();
        this.onSkeletonRemovedObservable.clear();
        this.onNewMaterialAddedObservable.clear();
        this.onNewMultiMaterialAddedObservable.clear();
        this.onMaterialRemovedObservable.clear();
        this.onMultiMaterialRemovedObservable.clear();
        this.onNewTextureAddedObservable.clear();
        this.onTextureRemovedObservable.clear();
        this.onPrePointerObservable.clear();
        this.onPointerObservable.clear();
        this.onPreKeyboardObservable.clear();
        this.onKeyboardObservable.clear();
        this.onActiveCameraChanged.clear();
        this.onComputePressureChanged.clear();
        (_a = this._computePressureObserver) === null || _a === void 0 ? void 0 : _a.unobserve();
        this._computePressureObserver = undefined;
        this.detachControl();
        // Detach cameras
        var canvas = this._engine.getInputElement();
        if (canvas) {
            for (var index_1 = 0; index_1 < this.cameras.length; index_1++) {
                this.cameras[index_1].detachControl();
            }
        }
        // Release animation groups
        this._disposeList(this.animationGroups);
        // Release lights
        this._disposeList(this.lights);
        // Release meshes
        this._disposeList(this.meshes, function (item) { return item.dispose(true); });
        this._disposeList(this.transformNodes, function (item) { return item.dispose(true); });
        // Release cameras
        this._disposeList(this.cameras);
        // Release materials
        if (this._defaultMaterial) {
            this._defaultMaterial.dispose();
        }
        this._disposeList(this.multiMaterials);
        this._disposeList(this.materials);
        // Release particles
        this._disposeList(this.particleSystems);
        // Release postProcesses
        this._disposeList(this.postProcesses);
        // Release textures
        this._disposeList(this.textures);
        // Release morph targets
        this._disposeList(this.morphTargetManagers);
        // Release UBO
        this._sceneUbo.dispose();
        if (this._multiviewSceneUbo) {
            this._multiviewSceneUbo.dispose();
        }
        // Post-processes
        this.postProcessManager.dispose();
        // Components
        this._disposeList(this._components);
        // Remove from engine
        var index = this._engine.scenes.indexOf(this);
        if (index > -1) {
            this._engine.scenes.splice(index, 1);
        }
        if (EngineStore._LastCreatedScene === this) {
            if (this._engine.scenes.length > 0) {
                EngineStore._LastCreatedScene = this._engine.scenes[this._engine.scenes.length - 1];
            }
            else {
                EngineStore._LastCreatedScene = null;
            }
        }
        index = this._engine._virtualScenes.indexOf(this);
        if (index > -1) {
            this._engine._virtualScenes.splice(index, 1);
        }
        this._engine.wipeCaches(true);
        this._isDisposed = true;
    };
    Scene.prototype._disposeList = function (items, callback) {
        var itemsCopy = SliceTools.Slice(items, 0);
        callback = callback !== null && callback !== void 0 ? callback : (function (item) { return item.dispose(); });
        for (var _i = 0, itemsCopy_1 = itemsCopy; _i < itemsCopy_1.length; _i++) {
            var item = itemsCopy_1[_i];
            callback(item);
        }
        items.length = 0;
    };
    Object.defineProperty(Scene.prototype, "isDisposed", {
        /**
         * Gets if the scene is already disposed
         */
        get: function () {
            return this._isDisposed;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Call this function to reduce memory footprint of the scene.
     * Vertex buffers will not store CPU data anymore (this will prevent picking, collisions or physics to work correctly)
     */
    Scene.prototype.clearCachedVertexData = function () {
        for (var meshIndex = 0; meshIndex < this.meshes.length; meshIndex++) {
            var mesh = this.meshes[meshIndex];
            var geometry = mesh.geometry;
            if (geometry) {
                geometry.clearCachedData();
            }
        }
    };
    /**
     * This function will remove the local cached buffer data from texture.
     * It will save memory but will prevent the texture from being rebuilt
     */
    Scene.prototype.cleanCachedTextureBuffer = function () {
        for (var _i = 0, _a = this.textures; _i < _a.length; _i++) {
            var baseTexture = _a[_i];
            var buffer = baseTexture._buffer;
            if (buffer) {
                baseTexture._buffer = null;
            }
        }
    };
    /**
     * Get the world extend vectors with an optional filter
     *
     * @param filterPredicate the predicate - which meshes should be included when calculating the world size
     * @returns {{ min: Vector3; max: Vector3 }} min and max vectors
     */
    Scene.prototype.getWorldExtends = function (filterPredicate) {
        var min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        filterPredicate = filterPredicate || (function () { return true; });
        this.meshes.filter(filterPredicate).forEach(function (mesh) {
            mesh.computeWorldMatrix(true);
            if (!mesh.subMeshes || mesh.subMeshes.length === 0 || mesh.infiniteDistance) {
                return;
            }
            var boundingInfo = mesh.getBoundingInfo();
            var minBox = boundingInfo.boundingBox.minimumWorld;
            var maxBox = boundingInfo.boundingBox.maximumWorld;
            Vector3.CheckExtends(minBox, min, max);
            Vector3.CheckExtends(maxBox, min, max);
        });
        return {
            min: min,
            max: max
        };
    };
    // Picking
    /**
     * Creates a ray that can be used to pick in the scene
     * @param x defines the x coordinate of the origin (on-screen)
     * @param y defines the y coordinate of the origin (on-screen)
     * @param world defines the world matrix to use if you want to pick in object space (instead of world space)
     * @param camera defines the camera to use for the picking
     * @param cameraViewSpace defines if picking will be done in view space (false by default)
     * @returns a Ray
     */
    Scene.prototype.createPickingRay = function (x, y, world, camera, cameraViewSpace) {
        if (cameraViewSpace === void 0) { cameraViewSpace = false; }
        throw _WarnImport("Ray");
    };
    /**
     * Creates a ray that can be used to pick in the scene
     * @param x defines the x coordinate of the origin (on-screen)
     * @param y defines the y coordinate of the origin (on-screen)
     * @param world defines the world matrix to use if you want to pick in object space (instead of world space)
     * @param result defines the ray where to store the picking ray
     * @param camera defines the camera to use for the picking
     * @param cameraViewSpace defines if picking will be done in view space (false by default)
     * @param enableDistantPicking defines if picking should handle large values for mesh position/scaling (false by default)
     * @returns the current scene
     */
    Scene.prototype.createPickingRayToRef = function (x, y, world, result, camera, cameraViewSpace, enableDistantPicking) {
        if (cameraViewSpace === void 0) { cameraViewSpace = false; }
        if (enableDistantPicking === void 0) { enableDistantPicking = false; }
        throw _WarnImport("Ray");
    };
    /**
     * Creates a ray that can be used to pick in the scene
     * @param x defines the x coordinate of the origin (on-screen)
     * @param y defines the y coordinate of the origin (on-screen)
     * @param camera defines the camera to use for the picking
     * @returns a Ray
     */
    Scene.prototype.createPickingRayInCameraSpace = function (x, y, camera) {
        throw _WarnImport("Ray");
    };
    /**
     * Creates a ray that can be used to pick in the scene
     * @param x defines the x coordinate of the origin (on-screen)
     * @param y defines the y coordinate of the origin (on-screen)
     * @param result defines the ray where to store the picking ray
     * @param camera defines the camera to use for the picking
     * @returns the current scene
     */
    Scene.prototype.createPickingRayInCameraSpaceToRef = function (x, y, result, camera) {
        throw _WarnImport("Ray");
    };
    /** Launch a ray to try to pick a mesh in the scene
     * @param x position on screen
     * @param y position on screen
     * @param predicate Predicate function used to determine eligible meshes. Can be set to null. In this case, a mesh must be enabled, visible and with isPickable set to true
     * @param fastCheck defines if the first intersection will be used (and not the closest)
     * @param camera to use for computing the picking ray. Can be set to null. In this case, the scene.activeCamera will be used
     * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
     * @returns a PickingInfo
     */
    Scene.prototype.pick = function (x, y, predicate, fastCheck, camera, trianglePredicate) {
        // Dummy info if picking as not been imported
        var pi = new PickingInfo();
        pi._pickingUnavailable = true;
        return pi;
    };
    /** Launch a ray to try to pick a mesh in the scene using only bounding information of the main mesh (not using submeshes)
     * @param x position on screen
     * @param y position on screen
     * @param predicate Predicate function used to determine eligible meshes. Can be set to null. In this case, a mesh must be enabled, visible and with isPickable set to true
     * @param fastCheck defines if the first intersection will be used (and not the closest)
     * @param camera to use for computing the picking ray. Can be set to null. In this case, the scene.activeCamera will be used
     * @returns a PickingInfo (Please note that some info will not be set like distance, bv, bu and everything that cannot be capture by only using bounding infos)
     */
    Scene.prototype.pickWithBoundingInfo = function (x, y, predicate, fastCheck, camera) {
        // Dummy info if picking as not been imported
        var pi = new PickingInfo();
        pi._pickingUnavailable = true;
        return pi;
    };
    /** Use the given ray to pick a mesh in the scene
     * @param ray The ray to use to pick meshes
     * @param predicate Predicate function used to determine eligible meshes. Can be set to null. In this case, a mesh must have isPickable set to true
     * @param fastCheck defines if the first intersection will be used (and not the closest)
     * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
     * @returns a PickingInfo
     */
    Scene.prototype.pickWithRay = function (ray, predicate, fastCheck, trianglePredicate) {
        throw _WarnImport("Ray");
    };
    /**
     * Launch a ray to try to pick a mesh in the scene
     * @param x X position on screen
     * @param y Y position on screen
     * @param predicate Predicate function used to determine eligible meshes. Can be set to null. In this case, a mesh must be enabled, visible and with isPickable set to true
     * @param camera camera to use for computing the picking ray. Can be set to null. In this case, the scene.activeCamera will be used
     * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
     * @returns an array of PickingInfo
     */
    Scene.prototype.multiPick = function (x, y, predicate, camera, trianglePredicate) {
        throw _WarnImport("Ray");
    };
    /**
     * Launch a ray to try to pick a mesh in the scene
     * @param ray Ray to use
     * @param predicate Predicate function used to determine eligible meshes. Can be set to null. In this case, a mesh must be enabled, visible and with isPickable set to true
     * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
     * @returns an array of PickingInfo
     */
    Scene.prototype.multiPickWithRay = function (ray, predicate, trianglePredicate) {
        throw _WarnImport("Ray");
    };
    /**
     * Force the value of meshUnderPointer
     * @param mesh defines the mesh to use
     * @param pointerId optional pointer id when using more than one pointer
     * @param pickResult optional pickingInfo data used to find mesh
     */
    Scene.prototype.setPointerOverMesh = function (mesh, pointerId, pickResult) {
        this._inputManager.setPointerOverMesh(mesh, pointerId, pickResult);
    };
    /**
     * Gets the mesh under the pointer
     * @returns a Mesh or null if no mesh is under the pointer
     */
    Scene.prototype.getPointerOverMesh = function () {
        return this._inputManager.getPointerOverMesh();
    };
    // Misc.
    /** @hidden */
    Scene.prototype._rebuildGeometries = function () {
        for (var _i = 0, _a = this.geometries; _i < _a.length; _i++) {
            var geometry = _a[_i];
            geometry._rebuild();
        }
        for (var _b = 0, _c = this.meshes; _b < _c.length; _b++) {
            var mesh = _c[_b];
            mesh._rebuild();
        }
        if (this.postProcessManager) {
            this.postProcessManager._rebuild();
        }
        for (var _d = 0, _e = this._components; _d < _e.length; _d++) {
            var component = _e[_d];
            component.rebuild();
        }
        for (var _f = 0, _g = this.particleSystems; _f < _g.length; _f++) {
            var system = _g[_f];
            system.rebuild();
        }
        if (this.spriteManagers) {
            for (var _h = 0, _j = this.spriteManagers; _h < _j.length; _h++) {
                var spriteMgr = _j[_h];
                spriteMgr.rebuild();
            }
        }
    };
    /** @hidden */
    Scene.prototype._rebuildTextures = function () {
        for (var _i = 0, _a = this.textures; _i < _a.length; _i++) {
            var texture = _a[_i];
            texture._rebuild();
        }
        this.markAllMaterialsAsDirty(1);
    };
    // Tags
    Scene.prototype._getByTags = function (list, tagsQuery, forEach) {
        if (tagsQuery === undefined) {
            // returns the complete list (could be done with Tags.MatchesQuery but no need to have a for-loop here)
            return list;
        }
        var listByTags = [];
        forEach =
            forEach ||
                (function (item) {
                    return;
                });
        for (var i in list) {
            var item = list[i];
            if (Tags && Tags.MatchesQuery(item, tagsQuery)) {
                listByTags.push(item);
                forEach(item);
            }
        }
        return listByTags;
    };
    /**
     * Get a list of meshes by tags
     * @param tagsQuery defines the tags query to use
     * @param forEach defines a predicate used to filter results
     * @returns an array of Mesh
     */
    Scene.prototype.getMeshesByTags = function (tagsQuery, forEach) {
        return this._getByTags(this.meshes, tagsQuery, forEach);
    };
    /**
     * Get a list of cameras by tags
     * @param tagsQuery defines the tags query to use
     * @param forEach defines a predicate used to filter results
     * @returns an array of Camera
     */
    Scene.prototype.getCamerasByTags = function (tagsQuery, forEach) {
        return this._getByTags(this.cameras, tagsQuery, forEach);
    };
    /**
     * Get a list of lights by tags
     * @param tagsQuery defines the tags query to use
     * @param forEach defines a predicate used to filter results
     * @returns an array of Light
     */
    Scene.prototype.getLightsByTags = function (tagsQuery, forEach) {
        return this._getByTags(this.lights, tagsQuery, forEach);
    };
    /**
     * Get a list of materials by tags
     * @param tagsQuery defines the tags query to use
     * @param forEach defines a predicate used to filter results
     * @returns an array of Material
     */
    Scene.prototype.getMaterialByTags = function (tagsQuery, forEach) {
        return this._getByTags(this.materials, tagsQuery, forEach).concat(this._getByTags(this.multiMaterials, tagsQuery, forEach));
    };
    /**
     * Get a list of transform nodes by tags
     * @param tagsQuery defines the tags query to use
     * @param forEach defines a predicate used to filter results
     * @returns an array of TransformNode
     */
    Scene.prototype.getTransformNodesByTags = function (tagsQuery, forEach) {
        return this._getByTags(this.transformNodes, tagsQuery, forEach);
    };
    /**
     * Overrides the default sort function applied in the rendering group to prepare the meshes.
     * This allowed control for front to back rendering or reversly depending of the special needs.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param opaqueSortCompareFn The opaque queue comparison function use to sort.
     * @param alphaTestSortCompareFn The alpha test queue comparison function use to sort.
     * @param transparentSortCompareFn The transparent queue comparison function use to sort.
     */
    Scene.prototype.setRenderingOrder = function (renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn) {
        if (opaqueSortCompareFn === void 0) { opaqueSortCompareFn = null; }
        if (alphaTestSortCompareFn === void 0) { alphaTestSortCompareFn = null; }
        if (transparentSortCompareFn === void 0) { transparentSortCompareFn = null; }
        this._renderingManager.setRenderingOrder(renderingGroupId, opaqueSortCompareFn, alphaTestSortCompareFn, transparentSortCompareFn);
    };
    /**
     * Specifies whether or not the stencil and depth buffer are cleared between two rendering groups.
     *
     * @param renderingGroupId The rendering group id corresponding to its index
     * @param autoClearDepthStencil Automatically clears depth and stencil between groups if true.
     * @param depth Automatically clears depth between groups if true and autoClear is true.
     * @param stencil Automatically clears stencil between groups if true and autoClear is true.
     */
    Scene.prototype.setRenderingAutoClearDepthStencil = function (renderingGroupId, autoClearDepthStencil, depth, stencil) {
        if (depth === void 0) { depth = true; }
        if (stencil === void 0) { stencil = true; }
        this._renderingManager.setRenderingAutoClearDepthStencil(renderingGroupId, autoClearDepthStencil, depth, stencil);
    };
    /**
     * Gets the current auto clear configuration for one rendering group of the rendering
     * manager.
     * @param index the rendering group index to get the information for
     * @returns The auto clear setup for the requested rendering group
     */
    Scene.prototype.getAutoClearDepthStencilSetup = function (index) {
        return this._renderingManager.getAutoClearDepthStencilSetup(index);
    };
    Object.defineProperty(Scene.prototype, "blockMaterialDirtyMechanism", {
        /** Gets or sets a boolean blocking all the calls to markAllMaterialsAsDirty (ie. the materials won't be updated if they are out of sync) */
        get: function () {
            return this._blockMaterialDirtyMechanism;
        },
        set: function (value) {
            if (this._blockMaterialDirtyMechanism === value) {
                return;
            }
            this._blockMaterialDirtyMechanism = value;
            if (!value) {
                // Do a complete update
                this.markAllMaterialsAsDirty(63);
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Will flag all materials as dirty to trigger new shader compilation
     * @param flag defines the flag used to specify which material part must be marked as dirty
     * @param predicate If not null, it will be used to specify if a material has to be marked as dirty
     */
    Scene.prototype.markAllMaterialsAsDirty = function (flag, predicate) {
        if (this._blockMaterialDirtyMechanism) {
            return;
        }
        for (var _i = 0, _a = this.materials; _i < _a.length; _i++) {
            var material = _a[_i];
            if (predicate && !predicate(material)) {
                continue;
            }
            material.markAsDirty(flag);
        }
    };
    /**
     * @param fileOrUrl
     * @param onSuccess
     * @param onProgress
     * @param useOfflineSupport
     * @param useArrayBuffer
     * @param onError
     * @param onOpened
     * @hidden
     */
    Scene.prototype._loadFile = function (fileOrUrl, onSuccess, onProgress, useOfflineSupport, useArrayBuffer, onError, onOpened) {
        var _this = this;
        var request = LoadFile(fileOrUrl, onSuccess, onProgress, useOfflineSupport ? this.offlineProvider : undefined, useArrayBuffer, onError, onOpened);
        this._activeRequests.push(request);
        request.onCompleteObservable.add(function (request) {
            _this._activeRequests.splice(_this._activeRequests.indexOf(request), 1);
        });
        return request;
    };
    /**
     * @param fileOrUrl
     * @param onProgress
     * @param useOfflineSupport
     * @param useArrayBuffer
     * @param onOpened
     * @hidden
     */
    Scene.prototype._loadFileAsync = function (fileOrUrl, onProgress, useOfflineSupport, useArrayBuffer, onOpened) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._loadFile(fileOrUrl, function (data) {
                resolve(data);
            }, onProgress, useOfflineSupport, useArrayBuffer, function (request, exception) {
                reject(exception);
            }, onOpened);
        });
    };
    /**
     * @param url
     * @param onSuccess
     * @param onProgress
     * @param useOfflineSupport
     * @param useArrayBuffer
     * @param onError
     * @param onOpened
     * @hidden
     */
    Scene.prototype._requestFile = function (url, onSuccess, onProgress, useOfflineSupport, useArrayBuffer, onError, onOpened) {
        var _this = this;
        var request = RequestFile(url, onSuccess, onProgress, useOfflineSupport ? this.offlineProvider : undefined, useArrayBuffer, onError, onOpened);
        this._activeRequests.push(request);
        request.onCompleteObservable.add(function (request) {
            _this._activeRequests.splice(_this._activeRequests.indexOf(request), 1);
        });
        return request;
    };
    /**
     * @param url
     * @param onProgress
     * @param useOfflineSupport
     * @param useArrayBuffer
     * @param onOpened
     * @hidden
     */
    Scene.prototype._requestFileAsync = function (url, onProgress, useOfflineSupport, useArrayBuffer, onOpened) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._requestFile(url, function (data) {
                resolve(data);
            }, onProgress, useOfflineSupport, useArrayBuffer, function (error) {
                reject(error);
            }, onOpened);
        });
    };
    /**
     * @param file
     * @param onSuccess
     * @param onProgress
     * @param useArrayBuffer
     * @param onError
     * @hidden
     */
    Scene.prototype._readFile = function (file, onSuccess, onProgress, useArrayBuffer, onError) {
        var _this = this;
        var request = ReadFile(file, onSuccess, onProgress, useArrayBuffer, onError);
        this._activeRequests.push(request);
        request.onCompleteObservable.add(function (request) {
            _this._activeRequests.splice(_this._activeRequests.indexOf(request), 1);
        });
        return request;
    };
    /**
     * @param file
     * @param onProgress
     * @param useArrayBuffer
     * @hidden
     */
    Scene.prototype._readFileAsync = function (file, onProgress, useArrayBuffer) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._readFile(file, function (data) {
                resolve(data);
            }, onProgress, useArrayBuffer, function (error) {
                reject(error);
            });
        });
    };
    /**
     * This method gets the performance collector belonging to the scene, which is generally shared with the inspector.
     * @returns the perf collector belonging to the scene.
     */
    Scene.prototype.getPerfCollector = function () {
        throw _WarnImport("performanceViewerSceneExtension");
    };
    /** The fog is deactivated */
    Scene.FOGMODE_NONE = 0;
    /** The fog density is following an exponential function */
    Scene.FOGMODE_EXP = 1;
    /** The fog density is following an exponential function faster than FOGMODE_EXP */
    Scene.FOGMODE_EXP2 = 2;
    /** The fog density is following a linear function. */
    Scene.FOGMODE_LINEAR = 3;
    /**
     * Gets or sets the minimum deltatime when deterministic lock step is enabled
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     */
    Scene.MinDeltaTime = 1.0;
    /**
     * Gets or sets the maximum deltatime when deterministic lock step is enabled
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     */
    Scene.MaxDeltaTime = 1000.0;
    return Scene;
}(AbstractScene));
export { Scene };
/**
 * @param id
 * @hidden
 */
Scene.prototype.setActiveCameraByID = function (id) {
    return this.setActiveCameraById(id);
};
Scene.prototype.getLastMaterialByID = function (id) {
    return this.getLastMaterialById(id);
};
Scene.prototype.getMaterialByID = function (id) {
    return this.getMaterialById(id);
};
Scene.prototype.getTextureByUniqueID = function (uniqueId) {
    return this.getTextureByUniqueId(uniqueId);
};
Scene.prototype.getCameraByID = function (id) {
    return this.getCameraById(id);
};
Scene.prototype.getCameraByUniqueID = function (uniqueId) {
    return this.getCameraByUniqueId(uniqueId);
};
Scene.prototype.getBoneByID = function (id) {
    return this.getBoneById(id);
};
Scene.prototype.getLightByID = function (id) {
    return this.getLightById(id);
};
Scene.prototype.getLightByUniqueID = function (uniqueId) {
    return this.getLightByUniqueId(uniqueId);
};
Scene.prototype.getParticleSystemByID = function (id) {
    return this.getParticleSystemById(id);
};
Scene.prototype.getGeometryByID = function (id) {
    return this.getGeometryById(id);
};
Scene.prototype.getMeshByID = function (id) {
    return this.getMeshById(id);
};
Scene.prototype.getMeshesByID = function (id) {
    return this.getMeshesById(id);
};
Scene.prototype.getTransformNodeByID = function (id) {
    return this.getTransformNodeById(id);
};
Scene.prototype.getTransformNodeByUniqueID = function (uniqueId) {
    return this.getTransformNodeByUniqueId(uniqueId);
};
Scene.prototype.getTransformNodesByID = function (id) {
    return this.getTransformNodesById(id);
};
Scene.prototype.getMeshByUniqueID = function (uniqueId) {
    return this.getMeshByUniqueId(uniqueId);
};
Scene.prototype.getLastMeshByID = function (id) {
    return this.getLastMeshById(id);
};
Scene.prototype.getLastEntryByID = function (id) {
    return this.getLastEntryById(id);
};
Scene.prototype.getNodeByID = function (id) {
    return this.getNodeById(id);
};
Scene.prototype.getLastSkeletonByID = function (id) {
    return this.getLastSkeletonById(id);
};
//# sourceMappingURL=scene.js.map