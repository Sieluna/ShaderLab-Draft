import { __extends, __generator } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Tools, AsyncLoop } from "../Misc/tools.js";
import { DeepCopier } from "../Misc/deepCopier.js";
import { Tags } from "../Misc/tags.js";
import { runCoroutineSync, runCoroutineAsync, createYieldingScheduler } from "../Misc/coroutine.js";
import { Quaternion, Matrix, Vector3, Vector2 } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { Node } from "../node.js";
import { VertexBuffer, Buffer } from "../Buffers/buffer.js";
import { VertexData } from "./mesh.vertexData.js";
import { Geometry } from "./geometry.js";
import { AbstractMesh } from "./abstractMesh.js";
import { SubMesh } from "./subMesh.js";
import { Material } from "../Materials/material.js";
import { MultiMaterial } from "../Materials/multiMaterial.js";
import { SceneLoaderFlags } from "../Loading/sceneLoaderFlags.js";

import { SerializationHelper } from "../Misc/decorators.js";
import { Logger } from "../Misc/logger.js";
import { GetClass, RegisterClass } from "../Misc/typeStore.js";
import { _WarnImport } from "../Misc/devTools.js";
import { SceneComponentConstants } from "../sceneComponent.js";
import { MeshLODLevel } from "./meshLODLevel.js";
/**
 * @hidden
 **/
var _CreationDataStorage = /** @class */ (function () {
    function _CreationDataStorage() {
    }
    return _CreationDataStorage;
}());
export { _CreationDataStorage };
/**
 * @hidden
 **/
var _InstanceDataStorage = /** @class */ (function () {
    function _InstanceDataStorage() {
        this.visibleInstances = {};
        this.batchCache = new _InstancesBatch();
        this.batchCacheReplacementModeInFrozenMode = new _InstancesBatch();
        this.instancesBufferSize = 32 * 16 * 4; // let's start with a maximum of 32 instances
    }
    return _InstanceDataStorage;
}());
/**
 * @hidden
 **/
var _InstancesBatch = /** @class */ (function () {
    function _InstancesBatch() {
        this.mustReturn = false;
        this.visibleInstances = new Array();
        this.renderSelf = new Array();
        this.hardwareInstancedRendering = new Array();
    }
    return _InstancesBatch;
}());
export { _InstancesBatch };
/**
 * @hidden
 **/
var _ThinInstanceDataStorage = /** @class */ (function () {
    function _ThinInstanceDataStorage() {
        this.instancesCount = 0;
        this.matrixBuffer = null;
        this.previousMatrixBuffer = null;
        this.matrixBufferSize = 32 * 16; // let's start with a maximum of 32 thin instances
        this.matrixData = null;
        this.boundingVectors = [];
        this.worldMatrices = null;
    }
    return _ThinInstanceDataStorage;
}());
/**
 * @hidden
 **/
var _InternalMeshDataInfo = /** @class */ (function () {
    function _InternalMeshDataInfo() {
        this._areNormalsFrozen = false; // Will be used by ribbons mainly
        // Will be used to save a source mesh reference, If any
        this._source = null;
        // Will be used to for fast cloned mesh lookup
        this.meshMap = null;
        this._preActivateId = -1;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this._LODLevels = new Array();
        /** Alternative definition of LOD level, using screen coverage instead of distance */
        this._useLODScreenCoverage = false;
        this._effectiveMaterial = null;
        this._forcedInstanceCount = 0;
    }
    return _InternalMeshDataInfo;
}());
/**
 * Class used to represent renderable models
 */
var Mesh = /** @class */ (function (_super) {
    __extends(Mesh, _super);
    /**
     * @constructor
     * @param name The value used by scene.getMeshByName() to do a lookup.
     * @param scene The scene to add this mesh to.
     * @param parent The parent of this mesh, if it has one
     * @param source An optional Mesh from which geometry is shared, cloned.
     * @param doNotCloneChildren When cloning, skip cloning child meshes of source, default False.
     *                  When false, achieved by calling a clone(), also passing False.
     *                  This will make creation of children, recursive.
     * @param clonePhysicsImpostor When cloning, include cloning mesh physics impostor, default True.
     */
    function Mesh(name, scene, parent, source, doNotCloneChildren, clonePhysicsImpostor) {
        if (scene === void 0) { scene = null; }
        if (parent === void 0) { parent = null; }
        if (source === void 0) { source = null; }
        if (clonePhysicsImpostor === void 0) { clonePhysicsImpostor = true; }
        var _this = _super.call(this, name, scene) || this;
        // Internal data
        _this._internalMeshDataInfo = new _InternalMeshDataInfo();
        // Members
        /**
         * Gets the delay loading state of the mesh (when delay loading is turned on)
         * @see https://doc.babylonjs.com/how_to/using_the_incremental_loading_system
         */
        _this.delayLoadState = 0;
        /**
         * Gets the list of instances created from this mesh
         * it is not supposed to be modified manually.
         * Note also that the order of the InstancedMesh wihin the array is not significant and might change.
         * @see https://doc.babylonjs.com/how_to/how_to_use_instances
         */
        _this.instances = new Array();
        // Private
        /** @hidden */
        _this._creationDataStorage = null;
        /** @hidden */
        _this._geometry = null;
        /** @hidden */
        _this._instanceDataStorage = new _InstanceDataStorage();
        /** @hidden */
        _this._thinInstanceDataStorage = new _ThinInstanceDataStorage();
        /** @hidden */
        _this._shouldGenerateFlatShading = false;
        // Use by builder only to know what orientation were the mesh build in.
        /** @hidden */
        _this._originalBuilderSideOrientation = Mesh.DEFAULTSIDE;
        /**
         * Use this property to change the original side orientation defined at construction time
         */
        _this.overrideMaterialSideOrientation = null;
        /**
         * Gets or sets a boolean indicating whether to render ignoring the active camera's max z setting. (false by default)
         * Note this will reduce performance when set to true.
         */
        _this.ignoreCameraMaxZ = false;
        scene = _this.getScene();
        _this._onBeforeDraw = function (isInstance, world, effectiveMaterial) {
            if (isInstance && effectiveMaterial) {
                if (_this._uniformBuffer) {
                    _this.transferToEffect(world);
                }
                else {
                    effectiveMaterial.bindOnlyWorldMatrix(world);
                }
            }
        };
        if (source) {
            // Geometry
            if (source._geometry) {
                source._geometry.applyToMesh(_this);
            }
            // Deep copy
            DeepCopier.DeepCopy(source, _this, [
                "name",
                "material",
                "skeleton",
                "instances",
                "parent",
                "uniqueId",
                "source",
                "metadata",
                "morphTargetManager",
                "hasInstances",
                "worldMatrixInstancedBuffer",
                "previousWorldMatrixInstancedBuffer",
                "hasLODLevels",
                "geometry",
                "isBlocked",
                "areNormalsFrozen",
                "facetNb",
                "isFacetDataEnabled",
                "lightSources",
                "useBones",
                "isAnInstance",
                "collider",
                "edgesRenderer",
                "forward",
                "up",
                "right",
                "absolutePosition",
                "absoluteScaling",
                "absoluteRotationQuaternion",
                "isWorldMatrixFrozen",
                "nonUniformScaling",
                "behaviors",
                "worldMatrixFromCache",
                "hasThinInstances",
                "cloneMeshMap",
                "hasBoundingInfo",
            ], ["_poseMatrix"]);
            // Source mesh
            _this._internalMeshDataInfo._source = source;
            if (scene.useClonedMeshMap) {
                if (!source._internalMeshDataInfo.meshMap) {
                    source._internalMeshDataInfo.meshMap = {};
                }
                source._internalMeshDataInfo.meshMap[_this.uniqueId] = _this;
            }
            // Construction Params
            // Clone parameters allowing mesh to be updated in case of parametric shapes.
            _this._originalBuilderSideOrientation = source._originalBuilderSideOrientation;
            _this._creationDataStorage = source._creationDataStorage;
            // Animation ranges
            if (source._ranges) {
                var ranges = source._ranges;
                for (var name_1 in ranges) {
                    if (!Object.prototype.hasOwnProperty.call(ranges, name_1)) {
                        continue;
                    }
                    if (!ranges[name_1]) {
                        continue;
                    }
                    _this.createAnimationRange(name_1, ranges[name_1].from, ranges[name_1].to);
                }
            }
            // Metadata
            if (source.metadata && source.metadata.clone) {
                _this.metadata = source.metadata.clone();
            }
            else {
                _this.metadata = source.metadata;
            }
            // Tags
            if (Tags && Tags.HasTags(source)) {
                Tags.AddTagsTo(_this, Tags.GetTags(source, true));
            }
            // Enabled
            _this.setEnabled(source.isEnabled());
            // Parent
            _this.parent = source.parent;
            // Pivot
            _this.setPivotMatrix(source.getPivotMatrix());
            _this.id = name + "." + source.id;
            // Material
            _this.material = source.material;
            if (!doNotCloneChildren) {
                // Children
                var directDescendants = source.getDescendants(true);
                for (var index = 0; index < directDescendants.length; index++) {
                    var child = directDescendants[index];
                    if (child.clone) {
                        child.clone(name + "." + child.name, _this);
                    }
                }
            }
            // Morphs
            if (source.morphTargetManager) {
                _this.morphTargetManager = source.morphTargetManager;
            }
            // Physics clone
            if (scene.getPhysicsEngine) {
                var physicsEngine = scene.getPhysicsEngine();
                if (clonePhysicsImpostor && physicsEngine) {
                    var impostor = physicsEngine.getImpostorForPhysicsObject(source);
                    if (impostor) {
                        _this.physicsImpostor = impostor.clone(_this);
                    }
                }
            }
            // Particles
            for (var index = 0; index < scene.particleSystems.length; index++) {
                var system = scene.particleSystems[index];
                if (system.emitter === source) {
                    system.clone(system.name, _this);
                }
            }
            // Skeleton
            _this.skeleton = source.skeleton;
            _this.refreshBoundingInfo(true, true);
            _this.computeWorldMatrix(true);
        }
        // Parent
        if (parent !== null) {
            _this.parent = parent;
        }
        _this._instanceDataStorage.hardwareInstancedRendering = _this.getEngine().getCaps().instancedArrays;
        _this._internalMeshDataInfo._onMeshReadyObserverAdded = function (observer) {
            // only notify once! then unregister the observer
            observer.unregisterOnNextCall = true;
            if (_this.isReady(true)) {
                _this.onMeshReadyObservable.notifyObservers(_this);
            }
            else {
                if (!_this._internalMeshDataInfo._checkReadinessObserver) {
                    _this._internalMeshDataInfo._checkReadinessObserver = _this._scene.onBeforeRenderObservable.add(function () {
                        // check for complete readiness
                        if (_this.isReady(true)) {
                            _this._scene.onBeforeRenderObservable.remove(_this._internalMeshDataInfo._checkReadinessObserver);
                            _this._internalMeshDataInfo._checkReadinessObserver = null;
                            _this.onMeshReadyObservable.notifyObservers(_this);
                        }
                    });
                }
            }
        };
        _this.onMeshReadyObservable = new Observable(_this._internalMeshDataInfo._onMeshReadyObserverAdded);
        if (source) {
            source.onClonedObservable.notifyObservers(_this);
        }
        return _this;
    }
    /**
     * Gets the default side orientation.
     * @param orientation the orientation to value to attempt to get
     * @returns the default orientation
     * @hidden
     */
    Mesh._GetDefaultSideOrientation = function (orientation) {
        return orientation || Mesh.FRONTSIDE; // works as Mesh.FRONTSIDE is 0
    };
    Object.defineProperty(Mesh.prototype, "useLODScreenCoverage", {
        /**
         * Determines if the LOD levels are intended to be calculated using screen coverage (surface area ratio) instead of distance
         */
        get: function () {
            return this._internalMeshDataInfo._useLODScreenCoverage;
        },
        set: function (value) {
            this._internalMeshDataInfo._useLODScreenCoverage = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "computeBonesUsingShaders", {
        get: function () {
            return this._internalAbstractMeshDataInfo._computeBonesUsingShaders;
        },
        set: function (value) {
            if (this._internalAbstractMeshDataInfo._computeBonesUsingShaders === value) {
                return;
            }
            if (value && this._internalMeshDataInfo._sourcePositions) {
                // switch from software to GPU computation: we need to reset the vertex and normal buffers that have been updated by the software process
                this.setVerticesData(VertexBuffer.PositionKind, this._internalMeshDataInfo._sourcePositions, true);
                if (this._internalMeshDataInfo._sourceNormals) {
                    this.setVerticesData(VertexBuffer.NormalKind, this._internalMeshDataInfo._sourceNormals, true);
                }
                this._internalMeshDataInfo._sourcePositions = null;
                this._internalMeshDataInfo._sourceNormals = null;
            }
            this._internalAbstractMeshDataInfo._computeBonesUsingShaders = value;
            this._markSubMeshesAsAttributesDirty();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onBeforeRenderObservable", {
        /**
         * An event triggered before rendering the mesh
         */
        get: function () {
            if (!this._internalMeshDataInfo._onBeforeRenderObservable) {
                this._internalMeshDataInfo._onBeforeRenderObservable = new Observable();
            }
            return this._internalMeshDataInfo._onBeforeRenderObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onBeforeBindObservable", {
        /**
         * An event triggered before binding the mesh
         */
        get: function () {
            if (!this._internalMeshDataInfo._onBeforeBindObservable) {
                this._internalMeshDataInfo._onBeforeBindObservable = new Observable();
            }
            return this._internalMeshDataInfo._onBeforeBindObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onAfterRenderObservable", {
        /**
         * An event triggered after rendering the mesh
         */
        get: function () {
            if (!this._internalMeshDataInfo._onAfterRenderObservable) {
                this._internalMeshDataInfo._onAfterRenderObservable = new Observable();
            }
            return this._internalMeshDataInfo._onAfterRenderObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onBetweenPassObservable", {
        /**
         * An event triggeredbetween rendering pass when using separateCullingPass = true
         */
        get: function () {
            if (!this._internalMeshDataInfo._onBetweenPassObservable) {
                this._internalMeshDataInfo._onBetweenPassObservable = new Observable();
            }
            return this._internalMeshDataInfo._onBetweenPassObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onBeforeDrawObservable", {
        /**
         * An event triggered before drawing the mesh
         */
        get: function () {
            if (!this._internalMeshDataInfo._onBeforeDrawObservable) {
                this._internalMeshDataInfo._onBeforeDrawObservable = new Observable();
            }
            return this._internalMeshDataInfo._onBeforeDrawObservable;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "onBeforeDraw", {
        /**
         * Sets a callback to call before drawing the mesh. It is recommended to use onBeforeDrawObservable instead
         */
        set: function (callback) {
            if (this._onBeforeDrawObserver) {
                this.onBeforeDrawObservable.remove(this._onBeforeDrawObserver);
            }
            this._onBeforeDrawObserver = this.onBeforeDrawObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "hasInstances", {
        get: function () {
            return this.instances.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "hasThinInstances", {
        get: function () {
            var _a;
            return ((_a = this._thinInstanceDataStorage.instancesCount) !== null && _a !== void 0 ? _a : 0) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "forcedInstanceCount", {
        /**
         * Gets or sets the forced number of instances to display.
         * If 0 (default value), the number of instances is not forced and depends on the draw type
         * (regular / instance / thin instances mesh)
         */
        get: function () {
            return this._internalMeshDataInfo._forcedInstanceCount;
        },
        set: function (count) {
            this._internalMeshDataInfo._forcedInstanceCount = count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "source", {
        /**
         * Gets the source mesh (the one used to clone this one from)
         */
        get: function () {
            return this._internalMeshDataInfo._source;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "cloneMeshMap", {
        /**
         * Gets the list of clones of this mesh
         * The scene must have been constructed with useClonedMeshMap=true for this to work!
         * Note that useClonedMeshMap=true is the default setting
         */
        get: function () {
            return this._internalMeshDataInfo.meshMap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "isUnIndexed", {
        /**
         * Gets or sets a boolean indicating that this mesh does not use index buffer
         */
        get: function () {
            return this._unIndexed;
        },
        set: function (value) {
            if (this._unIndexed !== value) {
                this._unIndexed = value;
                this._markSubMeshesAsAttributesDirty();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "worldMatrixInstancedBuffer", {
        /** Gets the array buffer used to store the instanced buffer used for instances' world matrices */
        get: function () {
            return this._instanceDataStorage.instancesData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "previousWorldMatrixInstancedBuffer", {
        /** Gets the array buffer used to store the instanced buffer used for instances' previous world matrices */
        get: function () {
            return this._instanceDataStorage.instancesPreviousData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "manualUpdateOfWorldMatrixInstancedBuffer", {
        /** Gets or sets a boolean indicating that the update of the instance buffer of the world matrices is manual */
        get: function () {
            return this._instanceDataStorage.manualUpdate;
        },
        set: function (value) {
            this._instanceDataStorage.manualUpdate = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Mesh.prototype, "manualUpdateOfPreviousWorldMatrixInstancedBuffer", {
        /** Gets or sets a boolean indicating that the update of the instance buffer of the world matrices is manual */
        get: function () {
            return this._instanceDataStorage.previousManualUpdate;
        },
        set: function (value) {
            this._instanceDataStorage.previousManualUpdate = value;
        },
        enumerable: false,
        configurable: true
    });
    Mesh.prototype.instantiateHierarchy = function (newParent, options, onNewNodeCreated) {
        if (newParent === void 0) { newParent = null; }
        var instance = this.getTotalVertices() > 0 && (!options || !options.doNotInstantiate)
            ? this.createInstance("instance of " + (this.name || this.id))
            : this.clone("Clone of " + (this.name || this.id), newParent || this.parent, true);
        instance.parent = newParent || this.parent;
        instance.position = this.position.clone();
        instance.scaling = this.scaling.clone();
        if (this.rotationQuaternion) {
            instance.rotationQuaternion = this.rotationQuaternion.clone();
        }
        else {
            instance.rotation = this.rotation.clone();
        }
        if (onNewNodeCreated) {
            onNewNodeCreated(this, instance);
        }
        for (var _i = 0, _a = this.getChildTransformNodes(true); _i < _a.length; _i++) {
            var child = _a[_i];
            child.instantiateHierarchy(instance, options, onNewNodeCreated);
        }
        return instance;
    };
    /**
     * Gets the class name
     * @returns the string "Mesh".
     */
    Mesh.prototype.getClassName = function () {
        return "Mesh";
    };
    Object.defineProperty(Mesh.prototype, "_isMesh", {
        /** @hidden */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a description of this mesh
     * @param fullDetails define if full details about this mesh must be used
     * @returns a descriptive string representing this mesh
     */
    Mesh.prototype.toString = function (fullDetails) {
        var ret = _super.prototype.toString.call(this, fullDetails);
        ret += ", n vertices: " + this.getTotalVertices();
        ret += ", parent: " + (this._waitingParentId ? this._waitingParentId : this.parent ? this.parent.name : "NONE");
        if (this.animations) {
            for (var i = 0; i < this.animations.length; i++) {
                ret += ", animation[0]: " + this.animations[i].toString(fullDetails);
            }
        }
        if (fullDetails) {
            if (this._geometry) {
                var ib = this.getIndices();
                var vb = this.getVerticesData(VertexBuffer.PositionKind);
                if (vb && ib) {
                    ret += ", flat shading: " + (vb.length / 3 === ib.length ? "YES" : "NO");
                }
            }
            else {
                ret += ", flat shading: UNKNOWN";
            }
        }
        return ret;
    };
    /** @hidden */
    Mesh.prototype._unBindEffect = function () {
        _super.prototype._unBindEffect.call(this);
        for (var _i = 0, _a = this.instances; _i < _a.length; _i++) {
            var instance = _a[_i];
            instance._unBindEffect();
        }
    };
    Object.defineProperty(Mesh.prototype, "hasLODLevels", {
        /**
         * Gets a boolean indicating if this mesh has LOD
         */
        get: function () {
            return this._internalMeshDataInfo._LODLevels.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the list of MeshLODLevel associated with the current mesh
     * @returns an array of MeshLODLevel
     */
    Mesh.prototype.getLODLevels = function () {
        return this._internalMeshDataInfo._LODLevels;
    };
    Mesh.prototype._sortLODLevels = function () {
        var sortingOrderFactor = this._internalMeshDataInfo._useLODScreenCoverage ? -1 : 1;
        this._internalMeshDataInfo._LODLevels.sort(function (a, b) {
            if (a.distanceOrScreenCoverage < b.distanceOrScreenCoverage) {
                return sortingOrderFactor;
            }
            if (a.distanceOrScreenCoverage > b.distanceOrScreenCoverage) {
                return -sortingOrderFactor;
            }
            return 0;
        });
    };
    /**
     * Add a mesh as LOD level triggered at the given distance.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param distanceOrScreenCoverage Either distance from the center of the object to show this level or the screen coverage if `useScreenCoverage` is set to `true`.
     * If screen coverage, value is a fraction of the screen's total surface, between 0 and 1.
     * @param mesh The mesh to be added as LOD level (can be null)
     * @return This mesh (for chaining)
     */
    Mesh.prototype.addLODLevel = function (distanceOrScreenCoverage, mesh) {
        if (mesh && mesh._masterMesh) {
            Logger.Warn("You cannot use a mesh as LOD level twice");
            return this;
        }
        var level = new MeshLODLevel(distanceOrScreenCoverage, mesh);
        this._internalMeshDataInfo._LODLevels.push(level);
        if (mesh) {
            mesh._masterMesh = this;
        }
        this._sortLODLevels();
        return this;
    };
    /**
     * Returns the LOD level mesh at the passed distance or null if not found.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param distance The distance from the center of the object to show this level
     * @returns a Mesh or `null`
     */
    Mesh.prototype.getLODLevelAtDistance = function (distance) {
        var internalDataInfo = this._internalMeshDataInfo;
        for (var index = 0; index < internalDataInfo._LODLevels.length; index++) {
            var level = internalDataInfo._LODLevels[index];
            if (level.distanceOrScreenCoverage === distance) {
                return level.mesh;
            }
        }
        return null;
    };
    /**
     * Remove a mesh from the LOD array
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param mesh defines the mesh to be removed
     * @return This mesh (for chaining)
     */
    Mesh.prototype.removeLODLevel = function (mesh) {
        var internalDataInfo = this._internalMeshDataInfo;
        for (var index = 0; index < internalDataInfo._LODLevels.length; index++) {
            if (internalDataInfo._LODLevels[index].mesh === mesh) {
                internalDataInfo._LODLevels.splice(index, 1);
                if (mesh) {
                    mesh._masterMesh = null;
                }
            }
        }
        this._sortLODLevels();
        return this;
    };
    /**
     * Returns the registered LOD mesh distant from the parameter `camera` position if any, else returns the current mesh.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param camera defines the camera to use to compute distance
     * @param boundingSphere defines a custom bounding sphere to use instead of the one from this mesh
     * @return This mesh (for chaining)
     */
    Mesh.prototype.getLOD = function (camera, boundingSphere) {
        var internalDataInfo = this._internalMeshDataInfo;
        if (!internalDataInfo._LODLevels || internalDataInfo._LODLevels.length === 0) {
            return this;
        }
        var bSphere;
        if (boundingSphere) {
            bSphere = boundingSphere;
        }
        else {
            var boundingInfo = this.getBoundingInfo();
            bSphere = boundingInfo.boundingSphere;
        }
        var distanceToCamera = bSphere.centerWorld.subtract(camera.globalPosition).length();
        var useScreenCoverage = internalDataInfo._useLODScreenCoverage;
        var compareValue = distanceToCamera;
        var compareSign = 1;
        if (useScreenCoverage) {
            var screenArea = camera.screenArea;
            var meshArea = (bSphere.radiusWorld * camera.minZ) / distanceToCamera;
            meshArea = meshArea * meshArea * Math.PI;
            compareValue = meshArea / screenArea;
            compareSign = -1;
        }
        if (compareSign * internalDataInfo._LODLevels[internalDataInfo._LODLevels.length - 1].distanceOrScreenCoverage > compareSign * compareValue) {
            if (this.onLODLevelSelection) {
                this.onLODLevelSelection(compareValue, this, this);
            }
            return this;
        }
        for (var index = 0; index < internalDataInfo._LODLevels.length; index++) {
            var level = internalDataInfo._LODLevels[index];
            if (compareSign * level.distanceOrScreenCoverage < compareSign * compareValue) {
                if (level.mesh) {
                    if (level.mesh.delayLoadState === 4) {
                        level.mesh._checkDelayState();
                        return this;
                    }
                    if (level.mesh.delayLoadState === 2) {
                        return this;
                    }
                    level.mesh._preActivate();
                    level.mesh._updateSubMeshesBoundingInfo(this.worldMatrixFromCache);
                }
                if (this.onLODLevelSelection) {
                    this.onLODLevelSelection(compareValue, this, level.mesh);
                }
                return level.mesh;
            }
        }
        if (this.onLODLevelSelection) {
            this.onLODLevelSelection(compareValue, this, this);
        }
        return this;
    };
    Object.defineProperty(Mesh.prototype, "geometry", {
        /**
         * Gets the mesh internal Geometry object
         */
        get: function () {
            return this._geometry;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the total number of vertices within the mesh geometry or zero if the mesh has no geometry.
     * @returns the total number of vertices
     */
    Mesh.prototype.getTotalVertices = function () {
        if (this._geometry === null || this._geometry === undefined) {
            return 0;
        }
        return this._geometry.getTotalVertices();
    };
    /**
     * Returns the content of an associated vertex buffer
     * @param kind defines which buffer to read from (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param copyWhenShared defines a boolean indicating that if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one
     * @param forceCopy defines a boolean forcing the copy of the buffer no matter what the value of copyWhenShared is
     * @returns a FloatArray or null if the mesh has no geometry or no vertex buffer for this kind.
     */
    Mesh.prototype.getVerticesData = function (kind, copyWhenShared, forceCopy) {
        var _a, _b;
        if (!this._geometry) {
            return null;
        }
        var data = (_b = (_a = this._userInstancedBuffersStorage) === null || _a === void 0 ? void 0 : _a.vertexBuffers[kind]) === null || _b === void 0 ? void 0 : _b.getFloatData(this._geometry.getTotalVertices(), forceCopy || (copyWhenShared && this._geometry.meshes.length !== 1));
        if (!data) {
            data = this._geometry.getVerticesData(kind, copyWhenShared, forceCopy);
        }
        return data;
    };
    /**
     * Returns the mesh VertexBuffer object from the requested `kind`
     * @param kind defines which buffer to read from (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.NormalKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a FloatArray or null if the mesh has no vertex buffer for this kind.
     */
    Mesh.prototype.getVertexBuffer = function (kind) {
        var _a, _b;
        if (!this._geometry) {
            return null;
        }
        return (_b = (_a = this._userInstancedBuffersStorage) === null || _a === void 0 ? void 0 : _a.vertexBuffers[kind]) !== null && _b !== void 0 ? _b : this._geometry.getVertexBuffer(kind);
    };
    /**
     * Tests if a specific vertex buffer is associated with this mesh
     * @param kind defines which buffer to check (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.NormalKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a boolean
     */
    Mesh.prototype.isVerticesDataPresent = function (kind) {
        var _a;
        if (!this._geometry) {
            if (this._delayInfo) {
                return this._delayInfo.indexOf(kind) !== -1;
            }
            return false;
        }
        return ((_a = this._userInstancedBuffersStorage) === null || _a === void 0 ? void 0 : _a.vertexBuffers[kind]) !== undefined || this._geometry.isVerticesDataPresent(kind);
    };
    /**
     * Returns a boolean defining if the vertex data for the requested `kind` is updatable.
     * @param kind defines which buffer to check (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a boolean
     */
    Mesh.prototype.isVertexBufferUpdatable = function (kind) {
        var _a, _b;
        if (!this._geometry) {
            if (this._delayInfo) {
                return this._delayInfo.indexOf(kind) !== -1;
            }
            return false;
        }
        return ((_b = (_a = this._userInstancedBuffersStorage) === null || _a === void 0 ? void 0 : _a.vertexBuffers[kind]) === null || _b === void 0 ? void 0 : _b.isUpdatable()) || this._geometry.isVertexBufferUpdatable(kind);
    };
    /**
     * Returns a string which contains the list of existing `kinds` of Vertex Data associated with this mesh.
     * @returns an array of strings
     */
    Mesh.prototype.getVerticesDataKinds = function () {
        if (!this._geometry) {
            var result_1 = new Array();
            if (this._delayInfo) {
                this._delayInfo.forEach(function (kind) {
                    result_1.push(kind);
                });
            }
            return result_1;
        }
        var kinds = this._geometry.getVerticesDataKinds();
        if (this._userInstancedBuffersStorage) {
            for (var kind in this._userInstancedBuffersStorage.vertexBuffers) {
                kinds.push(kind);
            }
        }
        return kinds;
    };
    /**
     * Returns a positive integer : the total number of indices in this mesh geometry.
     * @returns the numner of indices or zero if the mesh has no geometry.
     */
    Mesh.prototype.getTotalIndices = function () {
        if (!this._geometry) {
            return 0;
        }
        return this._geometry.getTotalIndices();
    };
    /**
     * Returns an array of integers or a typed array (Int32Array, Uint32Array, Uint16Array) populated with the mesh indices.
     * @param copyWhenShared If true (default false) and and if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one.
     * @param forceCopy defines a boolean indicating that the returned array must be cloned upon returning it
     * @returns the indices array or an empty array if the mesh has no geometry
     */
    Mesh.prototype.getIndices = function (copyWhenShared, forceCopy) {
        if (!this._geometry) {
            return [];
        }
        return this._geometry.getIndices(copyWhenShared, forceCopy);
    };
    Object.defineProperty(Mesh.prototype, "isBlocked", {
        get: function () {
            return this._masterMesh !== null && this._masterMesh !== undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Determine if the current mesh is ready to be rendered
     * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
     * @param forceInstanceSupport will check if the mesh will be ready when used with instances (false by default)
     * @returns true if all associated assets are ready (material, textures, shaders)
     */
    Mesh.prototype.isReady = function (completeCheck, forceInstanceSupport) {
        var _a, _b, _c, _d, _e, _f;
        if (completeCheck === void 0) { completeCheck = false; }
        if (forceInstanceSupport === void 0) { forceInstanceSupport = false; }
        if (this.delayLoadState === 2) {
            return false;
        }
        if (!_super.prototype.isReady.call(this, completeCheck)) {
            return false;
        }
        if (!this.subMeshes || this.subMeshes.length === 0) {
            return true;
        }
        if (!completeCheck) {
            return true;
        }
        var engine = this.getEngine();
        var scene = this.getScene();
        var hardwareInstancedRendering = forceInstanceSupport || (engine.getCaps().instancedArrays && (this.instances.length > 0 || this.hasThinInstances));
        this.computeWorldMatrix();
        var mat = this.material || scene.defaultMaterial;
        if (mat) {
            if (mat._storeEffectOnSubMeshes) {
                for (var _i = 0, _g = this.subMeshes; _i < _g.length; _i++) {
                    var subMesh = _g[_i];
                    var effectiveMaterial = subMesh.getMaterial();
                    if (effectiveMaterial) {
                        if (effectiveMaterial._storeEffectOnSubMeshes) {
                            if (!effectiveMaterial.isReadyForSubMesh(this, subMesh, hardwareInstancedRendering)) {
                                return false;
                            }
                        }
                        else {
                            if (!effectiveMaterial.isReady(this, hardwareInstancedRendering)) {
                                return false;
                            }
                        }
                    }
                }
            }
            else {
                if (!mat.isReady(this, hardwareInstancedRendering)) {
                    return false;
                }
            }
        }
        // Shadows
        var currentRenderPassId = engine.currentRenderPassId;
        for (var _h = 0, _j = this.lightSources; _h < _j.length; _h++) {
            var light = _j[_h];
            var generator = light.getShadowGenerator();
            if (generator && (!((_a = generator.getShadowMap()) === null || _a === void 0 ? void 0 : _a.renderList) || (((_b = generator.getShadowMap()) === null || _b === void 0 ? void 0 : _b.renderList) && ((_d = (_c = generator.getShadowMap()) === null || _c === void 0 ? void 0 : _c.renderList) === null || _d === void 0 ? void 0 : _d.indexOf(this)) !== -1))) {
                if (generator.getShadowMap()) {
                    engine.currentRenderPassId = generator.getShadowMap().renderPassId;
                }
                for (var _k = 0, _l = this.subMeshes; _k < _l.length; _k++) {
                    var subMesh = _l[_k];
                    if (!generator.isReady(subMesh, hardwareInstancedRendering, (_f = (_e = subMesh.getMaterial()) === null || _e === void 0 ? void 0 : _e.needAlphaBlendingForMesh(this)) !== null && _f !== void 0 ? _f : false)) {
                        engine.currentRenderPassId = currentRenderPassId;
                        return false;
                    }
                }
                engine.currentRenderPassId = currentRenderPassId;
            }
        }
        // LOD
        for (var _m = 0, _o = this._internalMeshDataInfo._LODLevels; _m < _o.length; _m++) {
            var lod = _o[_m];
            if (lod.mesh && !lod.mesh.isReady(hardwareInstancedRendering)) {
                return false;
            }
        }
        return true;
    };
    Object.defineProperty(Mesh.prototype, "areNormalsFrozen", {
        /**
         * Gets a boolean indicating if the normals aren't to be recomputed on next mesh `positions` array update. This property is pertinent only for updatable parametric shapes.
         */
        get: function () {
            return this._internalMeshDataInfo._areNormalsFrozen;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This function affects parametric shapes on vertex position update only : ribbons, tubes, etc. It has no effect at all on other shapes. It prevents the mesh normals from being recomputed on next `positions` array update.
     * @returns the current mesh
     */
    Mesh.prototype.freezeNormals = function () {
        this._internalMeshDataInfo._areNormalsFrozen = true;
        return this;
    };
    /**
     * This function affects parametric shapes on vertex position update only : ribbons, tubes, etc. It has no effect at all on other shapes. It reactivates the mesh normals computation if it was previously frozen
     * @returns the current mesh
     */
    Mesh.prototype.unfreezeNormals = function () {
        this._internalMeshDataInfo._areNormalsFrozen = false;
        return this;
    };
    Object.defineProperty(Mesh.prototype, "overridenInstanceCount", {
        /**
         * Sets a value overriding the instance count. Only applicable when custom instanced InterleavedVertexBuffer are used rather than InstancedMeshs
         */
        set: function (count) {
            this._instanceDataStorage.overridenInstanceCount = count;
        },
        enumerable: false,
        configurable: true
    });
    // Methods
    /** @hidden */
    Mesh.prototype._preActivate = function () {
        var internalDataInfo = this._internalMeshDataInfo;
        var sceneRenderId = this.getScene().getRenderId();
        if (internalDataInfo._preActivateId === sceneRenderId) {
            return this;
        }
        internalDataInfo._preActivateId = sceneRenderId;
        this._instanceDataStorage.visibleInstances = null;
        return this;
    };
    /**
     * @param renderId
     * @hidden
     */
    Mesh.prototype._preActivateForIntermediateRendering = function (renderId) {
        if (this._instanceDataStorage.visibleInstances) {
            this._instanceDataStorage.visibleInstances.intermediateDefaultRenderId = renderId;
        }
        return this;
    };
    /**
     * @param instance
     * @param renderId
     * @hidden
     */
    Mesh.prototype._registerInstanceForRenderId = function (instance, renderId) {
        if (!this._instanceDataStorage.visibleInstances) {
            this._instanceDataStorage.visibleInstances = {
                defaultRenderId: renderId,
                selfDefaultRenderId: this._renderId
            };
        }
        if (!this._instanceDataStorage.visibleInstances[renderId]) {
            if (this._instanceDataStorage.previousRenderId !== undefined && this._instanceDataStorage.isFrozen) {
                this._instanceDataStorage.visibleInstances[this._instanceDataStorage.previousRenderId] = null;
            }
            this._instanceDataStorage.previousRenderId = renderId;
            this._instanceDataStorage.visibleInstances[renderId] = new Array();
        }
        this._instanceDataStorage.visibleInstances[renderId].push(instance);
        return this;
    };
    Mesh.prototype._afterComputeWorldMatrix = function () {
        _super.prototype._afterComputeWorldMatrix.call(this);
        if (!this.hasThinInstances) {
            return;
        }
        if (!this.doNotSyncBoundingInfo) {
            this.thinInstanceRefreshBoundingInfo(false);
        }
    };
    /** @hidden */
    Mesh.prototype._postActivate = function () {
        if (this.edgesShareWithInstances && this.edgesRenderer && this.edgesRenderer.isEnabled && this._renderingGroup) {
            this._renderingGroup._edgesRenderers.pushNoDuplicate(this.edgesRenderer);
            this.edgesRenderer.customInstances.push(this.getWorldMatrix());
        }
    };
    /**
     * This method recomputes and sets a new BoundingInfo to the mesh unless it is locked.
     * This means the mesh underlying bounding box and sphere are recomputed.
     * @param applySkeleton defines whether to apply the skeleton before computing the bounding info
     * @param applyMorph  defines whether to apply the morph target before computing the bounding info
     * @returns the current mesh
     */
    Mesh.prototype.refreshBoundingInfo = function (applySkeleton, applyMorph) {
        if (applySkeleton === void 0) { applySkeleton = false; }
        if (applyMorph === void 0) { applyMorph = false; }
        if (this.hasBoundingInfo && this.getBoundingInfo().isLocked) {
            return this;
        }
        var bias = this.geometry ? this.geometry.boundingBias : null;
        this._refreshBoundingInfo(this._getPositionData(applySkeleton, applyMorph), bias);
        return this;
    };
    /**
     * @param force
     * @hidden
     */
    Mesh.prototype._createGlobalSubMesh = function (force) {
        var totalVertices = this.getTotalVertices();
        if (!totalVertices || !this.getIndices()) {
            return null;
        }
        // Check if we need to recreate the submeshes
        if (this.subMeshes && this.subMeshes.length > 0) {
            var ib = this.getIndices();
            if (!ib) {
                return null;
            }
            var totalIndices = ib.length;
            var needToRecreate = false;
            if (force) {
                needToRecreate = true;
            }
            else {
                for (var _i = 0, _a = this.subMeshes; _i < _a.length; _i++) {
                    var submesh = _a[_i];
                    if (submesh.indexStart + submesh.indexCount > totalIndices) {
                        needToRecreate = true;
                        break;
                    }
                    if (submesh.verticesStart + submesh.verticesCount > totalVertices) {
                        needToRecreate = true;
                        break;
                    }
                }
            }
            if (!needToRecreate) {
                return this.subMeshes[0];
            }
        }
        this.releaseSubMeshes();
        return new SubMesh(0, 0, totalVertices, 0, this.getTotalIndices(), this);
    };
    /**
     * This function will subdivide the mesh into multiple submeshes
     * @param count defines the expected number of submeshes
     */
    Mesh.prototype.subdivide = function (count) {
        if (count < 1) {
            return;
        }
        var totalIndices = this.getTotalIndices();
        var subdivisionSize = (totalIndices / count) | 0;
        var offset = 0;
        // Ensure that subdivisionSize is a multiple of 3
        while (subdivisionSize % 3 !== 0) {
            subdivisionSize++;
        }
        this.releaseSubMeshes();
        for (var index = 0; index < count; index++) {
            if (offset >= totalIndices) {
                break;
            }
            SubMesh.CreateFromIndices(0, offset, index === count - 1 ? totalIndices - offset : subdivisionSize, this);
            offset += subdivisionSize;
        }
        this.synchronizeInstances();
    };
    /**
     * Copy a FloatArray into a specific associated vertex buffer
     * @param kind defines which buffer to write to (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param data defines the data source
     * @param updatable defines if the updated vertex buffer must be flagged as updatable
     * @param stride defines the data stride size (can be null)
     * @returns the current mesh
     */
    Mesh.prototype.setVerticesData = function (kind, data, updatable, stride) {
        if (updatable === void 0) { updatable = false; }
        if (!this._geometry) {
            var vertexData = new VertexData();
            vertexData.set(data, kind);
            var scene = this.getScene();
            new Geometry(Geometry.RandomId(), scene, vertexData, updatable, this);
        }
        else {
            this._geometry.setVerticesData(kind, data, updatable, stride);
        }
        return this;
    };
    /**
     * Delete a vertex buffer associated with this mesh
     * @param kind defines which buffer to delete (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     */
    Mesh.prototype.removeVerticesData = function (kind) {
        if (!this._geometry) {
            return;
        }
        this._geometry.removeVerticesData(kind);
    };
    /**
     * Flags an associated vertex buffer as updatable
     * @param kind defines which buffer to use (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param updatable defines if the updated vertex buffer must be flagged as updatable
     */
    Mesh.prototype.markVerticesDataAsUpdatable = function (kind, updatable) {
        if (updatable === void 0) { updatable = true; }
        var vb = this.getVertexBuffer(kind);
        if (!vb || vb.isUpdatable() === updatable) {
            return;
        }
        this.setVerticesData(kind, this.getVerticesData(kind), updatable);
    };
    /**
     * Sets the mesh global Vertex Buffer
     * @param buffer defines the buffer to use
     * @param disposeExistingBuffer disposes the existing buffer, if any (default: true)
     * @returns the current mesh
     */
    Mesh.prototype.setVerticesBuffer = function (buffer, disposeExistingBuffer) {
        if (disposeExistingBuffer === void 0) { disposeExistingBuffer = true; }
        if (!this._geometry) {
            this._geometry = Geometry.CreateGeometryForMesh(this);
        }
        this._geometry.setVerticesBuffer(buffer, null, disposeExistingBuffer);
        return this;
    };
    /**
     * Update a specific associated vertex buffer
     * @param kind defines which buffer to write to (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param data defines the data source
     * @param updateExtends defines if extends info of the mesh must be updated (can be null). This is mostly useful for "position" kind
     * @param makeItUnique defines if the geometry associated with the mesh must be cloned to make the change only for this mesh (and not all meshes associated with the same geometry)
     * @returns the current mesh
     */
    Mesh.prototype.updateVerticesData = function (kind, data, updateExtends, makeItUnique) {
        if (!this._geometry) {
            return this;
        }
        if (!makeItUnique) {
            this._geometry.updateVerticesData(kind, data, updateExtends);
        }
        else {
            this.makeGeometryUnique();
            this.updateVerticesData(kind, data, updateExtends, false);
        }
        return this;
    };
    /**
     * This method updates the vertex positions of an updatable mesh according to the `positionFunction` returned values.
     * @see https://doc.babylonjs.com/how_to/how_to_dynamically_morph_a_mesh#other-shapes-updatemeshpositions
     * @param positionFunction is a simple JS function what is passed the mesh `positions` array. It doesn't need to return anything
     * @param computeNormals is a boolean (default true) to enable/disable the mesh normal recomputation after the vertex position update
     * @returns the current mesh
     */
    Mesh.prototype.updateMeshPositions = function (positionFunction, computeNormals) {
        if (computeNormals === void 0) { computeNormals = true; }
        var positions = this.getVerticesData(VertexBuffer.PositionKind);
        if (!positions) {
            return this;
        }
        positionFunction(positions);
        this.updateVerticesData(VertexBuffer.PositionKind, positions, false, false);
        if (computeNormals) {
            var indices = this.getIndices();
            var normals = this.getVerticesData(VertexBuffer.NormalKind);
            if (!normals) {
                return this;
            }
            VertexData.ComputeNormals(positions, indices, normals);
            this.updateVerticesData(VertexBuffer.NormalKind, normals, false, false);
        }
        return this;
    };
    /**
     * Creates a un-shared specific occurence of the geometry for the mesh.
     * @returns the current mesh
     */
    Mesh.prototype.makeGeometryUnique = function () {
        if (!this._geometry) {
            return this;
        }
        if (this._geometry.meshes.length === 1) {
            return this;
        }
        var oldGeometry = this._geometry;
        var geometry = this._geometry.copy(Geometry.RandomId());
        oldGeometry.releaseForMesh(this, true);
        geometry.applyToMesh(this);
        return this;
    };
    /**
     * Set the index buffer of this mesh
     * @param indices defines the source data
     * @param totalVertices defines the total number of vertices referenced by this index data (can be null)
     * @param updatable defines if the updated index buffer must be flagged as updatable (default is false)
     * @returns the current mesh
     */
    Mesh.prototype.setIndices = function (indices, totalVertices, updatable) {
        if (totalVertices === void 0) { totalVertices = null; }
        if (updatable === void 0) { updatable = false; }
        if (!this._geometry) {
            var vertexData = new VertexData();
            vertexData.indices = indices;
            var scene = this.getScene();
            new Geometry(Geometry.RandomId(), scene, vertexData, updatable, this);
        }
        else {
            this._geometry.setIndices(indices, totalVertices, updatable);
        }
        return this;
    };
    /**
     * Update the current index buffer
     * @param indices defines the source data
     * @param offset defines the offset in the index buffer where to store the new data (can be null)
     * @param gpuMemoryOnly defines a boolean indicating that only the GPU memory must be updated leaving the CPU version of the indices unchanged (false by default)
     * @returns the current mesh
     */
    Mesh.prototype.updateIndices = function (indices, offset, gpuMemoryOnly) {
        if (gpuMemoryOnly === void 0) { gpuMemoryOnly = false; }
        if (!this._geometry) {
            return this;
        }
        this._geometry.updateIndices(indices, offset, gpuMemoryOnly);
        return this;
    };
    /**
     * Invert the geometry to move from a right handed system to a left handed one.
     * @returns the current mesh
     */
    Mesh.prototype.toLeftHanded = function () {
        if (!this._geometry) {
            return this;
        }
        this._geometry.toLeftHanded();
        return this;
    };
    /**
     * @param subMesh
     * @param effect
     * @param fillMode
     * @hidden
     */
    Mesh.prototype._bind = function (subMesh, effect, fillMode) {
        if (!this._geometry) {
            return this;
        }
        var engine = this.getScene().getEngine();
        // Morph targets
        if (this.morphTargetManager && this.morphTargetManager.isUsingTextureForTargets) {
            this.morphTargetManager._bind(effect);
        }
        // Wireframe
        var indexToBind;
        if (this._unIndexed) {
            indexToBind = null;
        }
        else {
            switch (fillMode) {
                case Material.PointFillMode:
                    indexToBind = null;
                    break;
                case Material.WireFrameFillMode:
                    indexToBind = subMesh._getLinesIndexBuffer(this.getIndices(), engine);
                    break;
                default:
                case Material.TriangleFillMode:
                    indexToBind = this._geometry.getIndexBuffer();
                    break;
            }
        }
        // VBOs
        if (!this._userInstancedBuffersStorage || this.hasThinInstances) {
            this._geometry._bind(effect, indexToBind);
        }
        else {
            this._geometry._bind(effect, indexToBind, this._userInstancedBuffersStorage.vertexBuffers, this._userInstancedBuffersStorage.vertexArrayObjects);
        }
        return this;
    };
    /**
     * @param subMesh
     * @param fillMode
     * @param instancesCount
     * @hidden
     */
    Mesh.prototype._draw = function (subMesh, fillMode, instancesCount) {
        if (!this._geometry || !this._geometry.getVertexBuffers() || (!this._unIndexed && !this._geometry.getIndexBuffer())) {
            return this;
        }
        if (this._internalMeshDataInfo._onBeforeDrawObservable) {
            this._internalMeshDataInfo._onBeforeDrawObservable.notifyObservers(this);
        }
        var scene = this.getScene();
        var engine = scene.getEngine();
        if (this._unIndexed || fillMode == Material.PointFillMode) {
            // or triangles as points
            engine.drawArraysType(fillMode, subMesh.verticesStart, subMesh.verticesCount, this.forcedInstanceCount || instancesCount);
        }
        else if (fillMode == Material.WireFrameFillMode) {
            // Triangles as wireframe
            engine.drawElementsType(fillMode, 0, subMesh._linesIndexCount, this.forcedInstanceCount || instancesCount);
        }
        else {
            engine.drawElementsType(fillMode, subMesh.indexStart, subMesh.indexCount, this.forcedInstanceCount || instancesCount);
        }
        return this;
    };
    /**
     * Registers for this mesh a javascript function called just before the rendering process
     * @param func defines the function to call before rendering this mesh
     * @returns the current mesh
     */
    Mesh.prototype.registerBeforeRender = function (func) {
        this.onBeforeRenderObservable.add(func);
        return this;
    };
    /**
     * Disposes a previously registered javascript function called before the rendering
     * @param func defines the function to remove
     * @returns the current mesh
     */
    Mesh.prototype.unregisterBeforeRender = function (func) {
        this.onBeforeRenderObservable.removeCallback(func);
        return this;
    };
    /**
     * Registers for this mesh a javascript function called just after the rendering is complete
     * @param func defines the function to call after rendering this mesh
     * @returns the current mesh
     */
    Mesh.prototype.registerAfterRender = function (func) {
        this.onAfterRenderObservable.add(func);
        return this;
    };
    /**
     * Disposes a previously registered javascript function called after the rendering.
     * @param func defines the function to remove
     * @returns the current mesh
     */
    Mesh.prototype.unregisterAfterRender = function (func) {
        this.onAfterRenderObservable.removeCallback(func);
        return this;
    };
    /**
     * @param subMeshId
     * @param isReplacementMode
     * @hidden
     */
    Mesh.prototype._getInstancesRenderList = function (subMeshId, isReplacementMode) {
        if (isReplacementMode === void 0) { isReplacementMode = false; }
        if (this._instanceDataStorage.isFrozen) {
            if (isReplacementMode) {
                this._instanceDataStorage.batchCacheReplacementModeInFrozenMode.hardwareInstancedRendering[subMeshId] = false;
                this._instanceDataStorage.batchCacheReplacementModeInFrozenMode.renderSelf[subMeshId] = true;
                return this._instanceDataStorage.batchCacheReplacementModeInFrozenMode;
            }
            if (this._instanceDataStorage.previousBatch) {
                return this._instanceDataStorage.previousBatch;
            }
        }
        var scene = this.getScene();
        var isInIntermediateRendering = scene._isInIntermediateRendering();
        var onlyForInstances = isInIntermediateRendering
            ? this._internalAbstractMeshDataInfo._onlyForInstancesIntermediate
            : this._internalAbstractMeshDataInfo._onlyForInstances;
        var batchCache = this._instanceDataStorage.batchCache;
        batchCache.mustReturn = false;
        batchCache.renderSelf[subMeshId] = isReplacementMode || (!onlyForInstances && this.isEnabled() && this.isVisible);
        batchCache.visibleInstances[subMeshId] = null;
        if (this._instanceDataStorage.visibleInstances && !isReplacementMode) {
            var visibleInstances = this._instanceDataStorage.visibleInstances;
            var currentRenderId = scene.getRenderId();
            var defaultRenderId = isInIntermediateRendering ? visibleInstances.intermediateDefaultRenderId : visibleInstances.defaultRenderId;
            batchCache.visibleInstances[subMeshId] = visibleInstances[currentRenderId];
            if (!batchCache.visibleInstances[subMeshId] && defaultRenderId) {
                batchCache.visibleInstances[subMeshId] = visibleInstances[defaultRenderId];
            }
        }
        batchCache.hardwareInstancedRendering[subMeshId] =
            !isReplacementMode &&
                this._instanceDataStorage.hardwareInstancedRendering &&
                batchCache.visibleInstances[subMeshId] !== null &&
                batchCache.visibleInstances[subMeshId] !== undefined;
        this._instanceDataStorage.previousBatch = batchCache;
        return batchCache;
    };
    /**
     * @param subMesh
     * @param fillMode
     * @param batch
     * @param effect
     * @param engine
     * @hidden
     */
    Mesh.prototype._renderWithInstances = function (subMesh, fillMode, batch, effect, engine) {
        var _a;
        var visibleInstances = batch.visibleInstances[subMesh._id];
        if (!visibleInstances) {
            return this;
        }
        var instanceStorage = this._instanceDataStorage;
        var currentInstancesBufferSize = instanceStorage.instancesBufferSize;
        var instancesBuffer = instanceStorage.instancesBuffer;
        var instancesPreviousBuffer = instanceStorage.instancesPreviousBuffer;
        var matricesCount = visibleInstances.length + 1;
        var bufferSize = matricesCount * 16 * 4;
        while (instanceStorage.instancesBufferSize < bufferSize) {
            instanceStorage.instancesBufferSize *= 2;
        }
        if (!instanceStorage.instancesData || currentInstancesBufferSize != instanceStorage.instancesBufferSize) {
            instanceStorage.instancesData = new Float32Array(instanceStorage.instancesBufferSize / 4);
        }
        if ((this._scene.needsPreviousWorldMatrices && !instanceStorage.instancesPreviousData) || currentInstancesBufferSize != instanceStorage.instancesBufferSize) {
            instanceStorage.instancesPreviousData = new Float32Array(instanceStorage.instancesBufferSize / 4);
        }
        var offset = 0;
        var instancesCount = 0;
        var renderSelf = batch.renderSelf[subMesh._id];
        var needUpdateBuffer = !instancesBuffer ||
            currentInstancesBufferSize !== instanceStorage.instancesBufferSize ||
            (this._scene.needsPreviousWorldMatrices && !instanceStorage.instancesPreviousBuffer);
        if (!this._instanceDataStorage.manualUpdate && (!instanceStorage.isFrozen || needUpdateBuffer)) {
            var world = this.getWorldMatrix();
            if (renderSelf) {
                if (this._scene.needsPreviousWorldMatrices) {
                    if (!instanceStorage.masterMeshPreviousWorldMatrix) {
                        instanceStorage.masterMeshPreviousWorldMatrix = world.clone();
                        instanceStorage.masterMeshPreviousWorldMatrix.copyToArray(instanceStorage.instancesPreviousData, offset);
                    }
                    else {
                        instanceStorage.masterMeshPreviousWorldMatrix.copyToArray(instanceStorage.instancesPreviousData, offset);
                        instanceStorage.masterMeshPreviousWorldMatrix.copyFrom(world);
                    }
                }
                world.copyToArray(instanceStorage.instancesData, offset);
                offset += 16;
                instancesCount++;
            }
            if (visibleInstances) {
                if (Mesh.INSTANCEDMESH_SORT_TRANSPARENT && this._scene.activeCamera && ((_a = subMesh.getMaterial()) === null || _a === void 0 ? void 0 : _a.needAlphaBlendingForMesh(subMesh.getRenderingMesh()))) {
                    var cameraPosition = this._scene.activeCamera.globalPosition;
                    for (var instanceIndex = 0; instanceIndex < visibleInstances.length; instanceIndex++) {
                        var instanceMesh = visibleInstances[instanceIndex];
                        instanceMesh._distanceToCamera = Vector3.Distance(instanceMesh.getBoundingInfo().boundingSphere.centerWorld, cameraPosition);
                    }
                    visibleInstances.sort(function (m1, m2) {
                        return m1._distanceToCamera > m2._distanceToCamera ? -1 : m1._distanceToCamera < m2._distanceToCamera ? 1 : 0;
                    });
                }
                for (var instanceIndex = 0; instanceIndex < visibleInstances.length; instanceIndex++) {
                    var instance = visibleInstances[instanceIndex];
                    var matrix = instance.getWorldMatrix();
                    matrix.copyToArray(instanceStorage.instancesData, offset);
                    if (this._scene.needsPreviousWorldMatrices) {
                        if (!instance._previousWorldMatrix) {
                            instance._previousWorldMatrix = matrix.clone();
                            instance._previousWorldMatrix.copyToArray(instanceStorage.instancesPreviousData, offset);
                        }
                        else {
                            instance._previousWorldMatrix.copyToArray(instanceStorage.instancesPreviousData, offset);
                            instance._previousWorldMatrix.copyFrom(matrix);
                        }
                    }
                    offset += 16;
                    instancesCount++;
                }
            }
        }
        else {
            instancesCount = (renderSelf ? 1 : 0) + visibleInstances.length;
        }
        if (needUpdateBuffer) {
            if (instancesBuffer) {
                instancesBuffer.dispose();
            }
            if (instancesPreviousBuffer) {
                instancesPreviousBuffer.dispose();
            }
            instancesBuffer = new Buffer(engine, instanceStorage.instancesData, true, 16, false, true);
            instanceStorage.instancesBuffer = instancesBuffer;
            if (!this._userInstancedBuffersStorage) {
                this._userInstancedBuffersStorage = {
                    data: {},
                    vertexBuffers: {},
                    strides: {},
                    sizes: {},
                    vertexArrayObjects: this.getEngine().getCaps().vertexArrayObject ? {} : undefined
                };
            }
            this._userInstancedBuffersStorage.vertexBuffers["world0"] = instancesBuffer.createVertexBuffer("world0", 0, 4);
            this._userInstancedBuffersStorage.vertexBuffers["world1"] = instancesBuffer.createVertexBuffer("world1", 4, 4);
            this._userInstancedBuffersStorage.vertexBuffers["world2"] = instancesBuffer.createVertexBuffer("world2", 8, 4);
            this._userInstancedBuffersStorage.vertexBuffers["world3"] = instancesBuffer.createVertexBuffer("world3", 12, 4);
            if (this._scene.needsPreviousWorldMatrices) {
                instancesPreviousBuffer = new Buffer(engine, instanceStorage.instancesPreviousData, true, 16, false, true);
                instanceStorage.instancesPreviousBuffer = instancesPreviousBuffer;
                this._userInstancedBuffersStorage.vertexBuffers["previousWorld0"] = instancesPreviousBuffer.createVertexBuffer("previousWorld0", 0, 4);
                this._userInstancedBuffersStorage.vertexBuffers["previousWorld1"] = instancesPreviousBuffer.createVertexBuffer("previousWorld1", 4, 4);
                this._userInstancedBuffersStorage.vertexBuffers["previousWorld2"] = instancesPreviousBuffer.createVertexBuffer("previousWorld2", 8, 4);
                this._userInstancedBuffersStorage.vertexBuffers["previousWorld3"] = instancesPreviousBuffer.createVertexBuffer("previousWorld3", 12, 4);
            }
            this._invalidateInstanceVertexArrayObject();
        }
        else {
            if (!this._instanceDataStorage.isFrozen) {
                instancesBuffer.updateDirectly(instanceStorage.instancesData, 0, instancesCount);
                if (this._scene.needsPreviousWorldMatrices && (!this._instanceDataStorage.manualUpdate || this._instanceDataStorage.previousManualUpdate)) {
                    instancesPreviousBuffer.updateDirectly(instanceStorage.instancesPreviousData, 0, instancesCount);
                }
            }
        }
        this._processInstancedBuffers(visibleInstances, renderSelf);
        // Stats
        this.getScene()._activeIndices.addCount(subMesh.indexCount * instancesCount, false);
        // Draw
        if (engine._currentDrawContext) {
            engine._currentDrawContext.useInstancing = true;
        }
        this._bind(subMesh, effect, fillMode);
        this._draw(subMesh, fillMode, instancesCount);
        // Write current matrices as previous matrices in case of manual update
        // Default behaviour when previous matrices are not specified explicitly
        // Will break if instances number/order changes
        if (this._scene.needsPreviousWorldMatrices &&
            !needUpdateBuffer &&
            this._instanceDataStorage.manualUpdate &&
            !this._instanceDataStorage.isFrozen &&
            !this._instanceDataStorage.previousManualUpdate) {
            instancesPreviousBuffer.updateDirectly(instanceStorage.instancesData, 0, instancesCount);
        }
        engine.unbindInstanceAttributes();
        return this;
    };
    /**
     * @param subMesh
     * @param fillMode
     * @param effect
     * @param engine
     * @hidden
     */
    Mesh.prototype._renderWithThinInstances = function (subMesh, fillMode, effect, engine) {
        var _a, _b;
        // Stats
        var instancesCount = (_b = (_a = this._thinInstanceDataStorage) === null || _a === void 0 ? void 0 : _a.instancesCount) !== null && _b !== void 0 ? _b : 0;
        this.getScene()._activeIndices.addCount(subMesh.indexCount * instancesCount, false);
        // Draw
        if (engine._currentDrawContext) {
            engine._currentDrawContext.useInstancing = true;
        }
        this._bind(subMesh, effect, fillMode);
        this._draw(subMesh, fillMode, instancesCount);
        // Write current matrices as previous matrices
        // Default behaviour when previous matrices are not specified explicitly
        // Will break if instances number/order changes
        if (this._scene.needsPreviousWorldMatrices && !this._thinInstanceDataStorage.previousMatrixData && this._thinInstanceDataStorage.matrixData) {
            if (!this._thinInstanceDataStorage.previousMatrixBuffer) {
                this._thinInstanceDataStorage.previousMatrixBuffer = this._thinInstanceCreateMatrixBuffer("previousWorld", this._thinInstanceDataStorage.matrixData, false);
            }
            else {
                this._thinInstanceDataStorage.previousMatrixBuffer.updateDirectly(this._thinInstanceDataStorage.matrixData, 0, instancesCount);
            }
        }
        engine.unbindInstanceAttributes();
    };
    /**
     * @param visibleInstances
     * @param renderSelf
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mesh.prototype._processInstancedBuffers = function (visibleInstances, renderSelf) {
        // Do nothing
    };
    /**
     * @param renderingMesh
     * @param subMesh
     * @param effect
     * @param fillMode
     * @param batch
     * @param hardwareInstancedRendering
     * @param onBeforeDraw
     * @param effectiveMaterial
     * @hidden
     */
    Mesh.prototype._processRendering = function (renderingMesh, subMesh, effect, fillMode, batch, hardwareInstancedRendering, onBeforeDraw, effectiveMaterial) {
        var scene = this.getScene();
        var engine = scene.getEngine();
        if (hardwareInstancedRendering && subMesh.getRenderingMesh().hasThinInstances) {
            this._renderWithThinInstances(subMesh, fillMode, effect, engine);
            return this;
        }
        if (hardwareInstancedRendering) {
            this._renderWithInstances(subMesh, fillMode, batch, effect, engine);
        }
        else {
            if (engine._currentDrawContext) {
                engine._currentDrawContext.useInstancing = false;
            }
            var instanceCount = 0;
            if (batch.renderSelf[subMesh._id]) {
                // Draw
                if (onBeforeDraw) {
                    onBeforeDraw(false, renderingMesh.getWorldMatrix(), effectiveMaterial);
                }
                instanceCount++;
                this._draw(subMesh, fillMode, this._instanceDataStorage.overridenInstanceCount);
            }
            var visibleInstancesForSubMesh = batch.visibleInstances[subMesh._id];
            if (visibleInstancesForSubMesh) {
                var visibleInstanceCount = visibleInstancesForSubMesh.length;
                instanceCount += visibleInstanceCount;
                // Stats
                for (var instanceIndex = 0; instanceIndex < visibleInstanceCount; instanceIndex++) {
                    var instance = visibleInstancesForSubMesh[instanceIndex];
                    // World
                    var world = instance.getWorldMatrix();
                    if (onBeforeDraw) {
                        onBeforeDraw(true, world, effectiveMaterial);
                    }
                    // Draw
                    this._draw(subMesh, fillMode);
                }
            }
            // Stats
            scene._activeIndices.addCount(subMesh.indexCount * instanceCount, false);
        }
        return this;
    };
    /**
     * @param dispose
     * @hidden
     */
    Mesh.prototype._rebuild = function (dispose) {
        if (dispose === void 0) { dispose = false; }
        if (this._instanceDataStorage.instancesBuffer) {
            // Dispose instance buffer to be recreated in _renderWithInstances when rendered
            if (dispose) {
                this._instanceDataStorage.instancesBuffer.dispose();
            }
            this._instanceDataStorage.instancesBuffer = null;
        }
        if (this._userInstancedBuffersStorage) {
            for (var kind in this._userInstancedBuffersStorage.vertexBuffers) {
                var buffer = this._userInstancedBuffersStorage.vertexBuffers[kind];
                if (buffer) {
                    // Dispose instance buffer to be recreated in _renderWithInstances when rendered
                    if (dispose) {
                        buffer.dispose();
                    }
                    this._userInstancedBuffersStorage.vertexBuffers[kind] = null;
                }
            }
            if (this._userInstancedBuffersStorage.vertexArrayObjects) {
                this._userInstancedBuffersStorage.vertexArrayObjects = {};
            }
        }
        this._internalMeshDataInfo._effectiveMaterial = null;
        _super.prototype._rebuild.call(this, dispose);
    };
    /** @hidden */
    Mesh.prototype._freeze = function () {
        if (!this.subMeshes) {
            return;
        }
        // Prepare batches
        for (var index = 0; index < this.subMeshes.length; index++) {
            this._getInstancesRenderList(index);
        }
        this._internalMeshDataInfo._effectiveMaterial = null;
        this._instanceDataStorage.isFrozen = true;
    };
    /** @hidden */
    Mesh.prototype._unFreeze = function () {
        this._instanceDataStorage.isFrozen = false;
        this._instanceDataStorage.previousBatch = null;
    };
    /**
     * Triggers the draw call for the mesh. Usually, you don't need to call this method by your own because the mesh rendering is handled by the scene rendering manager
     * @param subMesh defines the subMesh to render
     * @param enableAlphaMode defines if alpha mode can be changed
     * @param effectiveMeshReplacement defines an optional mesh used to provide info for the rendering
     * @returns the current mesh
     */
    Mesh.prototype.render = function (subMesh, enableAlphaMode, effectiveMeshReplacement) {
        var _a, _b, _c;
        var scene = this.getScene();
        if (this._internalAbstractMeshDataInfo._isActiveIntermediate) {
            this._internalAbstractMeshDataInfo._isActiveIntermediate = false;
        }
        else {
            this._internalAbstractMeshDataInfo._isActive = false;
        }
        if (this._checkOcclusionQuery() && !this._occlusionDataStorage.forceRenderingWhenOccluded) {
            return this;
        }
        // Managing instances
        var batch = this._getInstancesRenderList(subMesh._id, !!effectiveMeshReplacement);
        if (batch.mustReturn) {
            return this;
        }
        // Checking geometry state
        if (!this._geometry || !this._geometry.getVertexBuffers() || (!this._unIndexed && !this._geometry.getIndexBuffer())) {
            return this;
        }
        var engine = scene.getEngine();
        var oldCameraMaxZ = 0;
        var oldCamera = null;
        if (this.ignoreCameraMaxZ && scene.activeCamera && !scene._isInIntermediateRendering()) {
            oldCameraMaxZ = scene.activeCamera.maxZ;
            oldCamera = scene.activeCamera;
            scene.activeCamera.maxZ = 0;
            scene.updateTransformMatrix(true);
        }
        if (this._internalMeshDataInfo._onBeforeRenderObservable) {
            this._internalMeshDataInfo._onBeforeRenderObservable.notifyObservers(this);
        }
        var hardwareInstancedRendering = batch.hardwareInstancedRendering[subMesh._id] || subMesh.getRenderingMesh().hasThinInstances;
        var instanceDataStorage = this._instanceDataStorage;
        var material = subMesh.getMaterial();
        if (!material) {
            if (oldCamera) {
                oldCamera.maxZ = oldCameraMaxZ;
                scene.updateTransformMatrix(true);
            }
            return this;
        }
        // Material
        if (!instanceDataStorage.isFrozen || !this._internalMeshDataInfo._effectiveMaterial || this._internalMeshDataInfo._effectiveMaterial !== material) {
            if (material._storeEffectOnSubMeshes) {
                if (!material.isReadyForSubMesh(this, subMesh, hardwareInstancedRendering)) {
                    if (oldCamera) {
                        oldCamera.maxZ = oldCameraMaxZ;
                        scene.updateTransformMatrix(true);
                    }
                    return this;
                }
            }
            else if (!material.isReady(this, hardwareInstancedRendering)) {
                if (oldCamera) {
                    oldCamera.maxZ = oldCameraMaxZ;
                    scene.updateTransformMatrix(true);
                }
                return this;
            }
            this._internalMeshDataInfo._effectiveMaterial = material;
        }
        else if ((material._storeEffectOnSubMeshes && !((_a = subMesh.effect) === null || _a === void 0 ? void 0 : _a._wasPreviouslyReady)) ||
            (!material._storeEffectOnSubMeshes && !((_b = material.getEffect()) === null || _b === void 0 ? void 0 : _b._wasPreviouslyReady))) {
            if (oldCamera) {
                oldCamera.maxZ = oldCameraMaxZ;
                scene.updateTransformMatrix(true);
            }
            return this;
        }
        // Alpha mode
        if (enableAlphaMode) {
            engine.setAlphaMode(this._internalMeshDataInfo._effectiveMaterial.alphaMode);
        }
        var drawWrapper;
        if (this._internalMeshDataInfo._effectiveMaterial._storeEffectOnSubMeshes) {
            drawWrapper = subMesh._drawWrapper;
        }
        else {
            drawWrapper = this._internalMeshDataInfo._effectiveMaterial._getDrawWrapper();
        }
        var effect = (_c = drawWrapper === null || drawWrapper === void 0 ? void 0 : drawWrapper.effect) !== null && _c !== void 0 ? _c : null;
        for (var _i = 0, _d = scene._beforeRenderingMeshStage; _i < _d.length; _i++) {
            var step = _d[_i];
            step.action(this, subMesh, batch, effect);
        }
        if (!drawWrapper || !effect) {
            if (oldCamera) {
                oldCamera.maxZ = oldCameraMaxZ;
                scene.updateTransformMatrix(true);
            }
            return this;
        }
        var effectiveMesh = effectiveMeshReplacement || this;
        var sideOrientation;
        if (!instanceDataStorage.isFrozen && (this._internalMeshDataInfo._effectiveMaterial.backFaceCulling || this.overrideMaterialSideOrientation !== null)) {
            var mainDeterminant = effectiveMesh._getWorldMatrixDeterminant();
            sideOrientation = this.overrideMaterialSideOrientation;
            if (sideOrientation == null) {
                sideOrientation = this._internalMeshDataInfo._effectiveMaterial.sideOrientation;
            }
            if (mainDeterminant < 0) {
                sideOrientation = sideOrientation === Material.ClockWiseSideOrientation ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
            }
            instanceDataStorage.sideOrientation = sideOrientation;
        }
        else {
            sideOrientation = instanceDataStorage.sideOrientation;
        }
        var reverse = this._internalMeshDataInfo._effectiveMaterial._preBind(drawWrapper, sideOrientation);
        if (this._internalMeshDataInfo._effectiveMaterial.forceDepthWrite) {
            engine.setDepthWrite(true);
        }
        // Bind
        var fillMode = scene.forcePointsCloud
            ? Material.PointFillMode
            : scene.forceWireframe
                ? Material.WireFrameFillMode
                : this._internalMeshDataInfo._effectiveMaterial.fillMode;
        if (this._internalMeshDataInfo._onBeforeBindObservable) {
            this._internalMeshDataInfo._onBeforeBindObservable.notifyObservers(this);
        }
        if (!hardwareInstancedRendering) {
            // Binding will be done later because we need to add more info to the VB
            this._bind(subMesh, effect, fillMode);
        }
        var effectiveMaterial = this._internalMeshDataInfo._effectiveMaterial;
        var world = effectiveMesh.getWorldMatrix();
        if (effectiveMaterial._storeEffectOnSubMeshes) {
            effectiveMaterial.bindForSubMesh(world, this, subMesh);
        }
        else {
            effectiveMaterial.bind(world, this);
        }
        if (!effectiveMaterial.backFaceCulling && effectiveMaterial.separateCullingPass) {
            engine.setState(true, effectiveMaterial.zOffset, false, !reverse, effectiveMaterial.cullBackFaces, effectiveMaterial.stencil, effectiveMaterial.zOffsetUnits);
            this._processRendering(this, subMesh, effect, fillMode, batch, hardwareInstancedRendering, this._onBeforeDraw, this._internalMeshDataInfo._effectiveMaterial);
            engine.setState(true, effectiveMaterial.zOffset, false, reverse, effectiveMaterial.cullBackFaces, effectiveMaterial.stencil, effectiveMaterial.zOffsetUnits);
            if (this._internalMeshDataInfo._onBetweenPassObservable) {
                this._internalMeshDataInfo._onBetweenPassObservable.notifyObservers(subMesh);
            }
        }
        // Draw
        this._processRendering(this, subMesh, effect, fillMode, batch, hardwareInstancedRendering, this._onBeforeDraw, this._internalMeshDataInfo._effectiveMaterial);
        // Unbind
        this._internalMeshDataInfo._effectiveMaterial.unbind();
        for (var _e = 0, _f = scene._afterRenderingMeshStage; _e < _f.length; _e++) {
            var step = _f[_e];
            step.action(this, subMesh, batch, effect);
        }
        if (this._internalMeshDataInfo._onAfterRenderObservable) {
            this._internalMeshDataInfo._onAfterRenderObservable.notifyObservers(this);
        }
        if (oldCamera) {
            oldCamera.maxZ = oldCameraMaxZ;
            scene.updateTransformMatrix(true);
        }
        return this;
    };
    /**
     *   Renormalize the mesh and patch it up if there are no weights
     *   Similar to normalization by adding the weights compute the reciprocal and multiply all elements, this wil ensure that everything adds to 1.
     *   However in the case of zero weights then we set just a single influence to 1.
     *   We check in the function for extra's present and if so we use the normalizeSkinWeightsWithExtras rather than the FourWeights version.
     */
    Mesh.prototype.cleanMatrixWeights = function () {
        if (this.isVerticesDataPresent(VertexBuffer.MatricesWeightsKind)) {
            if (this.isVerticesDataPresent(VertexBuffer.MatricesWeightsExtraKind)) {
                this._normalizeSkinWeightsAndExtra();
            }
            else {
                this._normalizeSkinFourWeights();
            }
        }
    };
    // faster 4 weight version.
    Mesh.prototype._normalizeSkinFourWeights = function () {
        var matricesWeights = this.getVerticesData(VertexBuffer.MatricesWeightsKind);
        var numWeights = matricesWeights.length;
        for (var a = 0; a < numWeights; a += 4) {
            // accumulate weights
            var t = matricesWeights[a] + matricesWeights[a + 1] + matricesWeights[a + 2] + matricesWeights[a + 3];
            // check for invalid weight and just set it to 1.
            if (t === 0) {
                matricesWeights[a] = 1;
            }
            else {
                // renormalize so everything adds to 1 use reciprocal
                var recip = 1 / t;
                matricesWeights[a] *= recip;
                matricesWeights[a + 1] *= recip;
                matricesWeights[a + 2] *= recip;
                matricesWeights[a + 3] *= recip;
            }
        }
        this.setVerticesData(VertexBuffer.MatricesWeightsKind, matricesWeights);
    };
    // handle special case of extra verts.  (in theory gltf can handle 12 influences)
    Mesh.prototype._normalizeSkinWeightsAndExtra = function () {
        var matricesWeightsExtra = this.getVerticesData(VertexBuffer.MatricesWeightsExtraKind);
        var matricesWeights = this.getVerticesData(VertexBuffer.MatricesWeightsKind);
        var numWeights = matricesWeights.length;
        for (var a = 0; a < numWeights; a += 4) {
            // accumulate weights
            var t = matricesWeights[a] + matricesWeights[a + 1] + matricesWeights[a + 2] + matricesWeights[a + 3];
            t += matricesWeightsExtra[a] + matricesWeightsExtra[a + 1] + matricesWeightsExtra[a + 2] + matricesWeightsExtra[a + 3];
            // check for invalid weight and just set it to 1.
            if (t === 0) {
                matricesWeights[a] = 1;
            }
            else {
                // renormalize so everything adds to 1 use reciprocal
                var recip = 1 / t;
                matricesWeights[a] *= recip;
                matricesWeights[a + 1] *= recip;
                matricesWeights[a + 2] *= recip;
                matricesWeights[a + 3] *= recip;
                // same goes for extras
                matricesWeightsExtra[a] *= recip;
                matricesWeightsExtra[a + 1] *= recip;
                matricesWeightsExtra[a + 2] *= recip;
                matricesWeightsExtra[a + 3] *= recip;
            }
        }
        this.setVerticesData(VertexBuffer.MatricesWeightsKind, matricesWeights);
        this.setVerticesData(VertexBuffer.MatricesWeightsKind, matricesWeightsExtra);
    };
    /**
     * ValidateSkinning is used to determine that a mesh has valid skinning data along with skin metrics, if missing weights,
     * or not normalized it is returned as invalid mesh the string can be used for console logs, or on screen messages to let
     * the user know there was an issue with importing the mesh
     * @returns a validation object with skinned, valid and report string
     */
    Mesh.prototype.validateSkinning = function () {
        var matricesWeightsExtra = this.getVerticesData(VertexBuffer.MatricesWeightsExtraKind);
        var matricesWeights = this.getVerticesData(VertexBuffer.MatricesWeightsKind);
        if (matricesWeights === null || this.skeleton == null) {
            return { skinned: false, valid: true, report: "not skinned" };
        }
        var numWeights = matricesWeights.length;
        var numberNotSorted = 0;
        var missingWeights = 0;
        var maxUsedWeights = 0;
        var numberNotNormalized = 0;
        var numInfluences = matricesWeightsExtra === null ? 4 : 8;
        var usedWeightCounts = new Array();
        for (var a = 0; a <= numInfluences; a++) {
            usedWeightCounts[a] = 0;
        }
        var toleranceEpsilon = 0.001;
        for (var a = 0; a < numWeights; a += 4) {
            var lastWeight = matricesWeights[a];
            var t = lastWeight;
            var usedWeights = t === 0 ? 0 : 1;
            for (var b = 1; b < numInfluences; b++) {
                var d = b < 4 ? matricesWeights[a + b] : matricesWeightsExtra[a + b - 4];
                if (d > lastWeight) {
                    numberNotSorted++;
                }
                if (d !== 0) {
                    usedWeights++;
                }
                t += d;
                lastWeight = d;
            }
            // count the buffer weights usage
            usedWeightCounts[usedWeights]++;
            // max influences
            if (usedWeights > maxUsedWeights) {
                maxUsedWeights = usedWeights;
            }
            // check for invalid weight and just set it to 1.
            if (t === 0) {
                missingWeights++;
            }
            else {
                // renormalize so everything adds to 1 use reciprocal
                var recip = 1 / t;
                var tolerance = 0;
                for (var b = 0; b < numInfluences; b++) {
                    if (b < 4) {
                        tolerance += Math.abs(matricesWeights[a + b] - matricesWeights[a + b] * recip);
                    }
                    else {
                        tolerance += Math.abs(matricesWeightsExtra[a + b - 4] - matricesWeightsExtra[a + b - 4] * recip);
                    }
                }
                // arbitrary epsilon value for dictating not normalized
                if (tolerance > toleranceEpsilon) {
                    numberNotNormalized++;
                }
            }
        }
        // validate bone indices are in range of the skeleton
        var numBones = this.skeleton.bones.length;
        var matricesIndices = this.getVerticesData(VertexBuffer.MatricesIndicesKind);
        var matricesIndicesExtra = this.getVerticesData(VertexBuffer.MatricesIndicesExtraKind);
        var numBadBoneIndices = 0;
        for (var a = 0; a < numWeights; a += 4) {
            for (var b = 0; b < numInfluences; b++) {
                var index = b < 4 ? matricesIndices[a + b] : matricesIndicesExtra[a + b - 4];
                if (index >= numBones || index < 0) {
                    numBadBoneIndices++;
                }
            }
        }
        // log mesh stats
        var output = "Number of Weights = " +
            numWeights / 4 +
            "\nMaximum influences = " +
            maxUsedWeights +
            "\nMissing Weights = " +
            missingWeights +
            "\nNot Sorted = " +
            numberNotSorted +
            "\nNot Normalized = " +
            numberNotNormalized +
            "\nWeightCounts = [" +
            usedWeightCounts +
            "]" +
            "\nNumber of bones = " +
            numBones +
            "\nBad Bone Indices = " +
            numBadBoneIndices;
        return { skinned: true, valid: missingWeights === 0 && numberNotNormalized === 0 && numBadBoneIndices === 0, report: output };
    };
    /** @hidden */
    Mesh.prototype._checkDelayState = function () {
        var scene = this.getScene();
        if (this._geometry) {
            this._geometry.load(scene);
        }
        else if (this.delayLoadState === 4) {
            this.delayLoadState = 2;
            this._queueLoad(scene);
        }
        return this;
    };
    Mesh.prototype._queueLoad = function (scene) {
        var _this = this;
        scene._addPendingData(this);
        var getBinaryData = this.delayLoadingFile.indexOf(".babylonbinarymeshdata") !== -1;
        Tools.LoadFile(this.delayLoadingFile, function (data) {
            if (data instanceof ArrayBuffer) {
                _this._delayLoadingFunction(data, _this);
            }
            else {
                _this._delayLoadingFunction(JSON.parse(data), _this);
            }
            _this.instances.forEach(function (instance) {
                instance.refreshBoundingInfo();
                instance._syncSubMeshes();
            });
            _this.delayLoadState = 1;
            scene._removePendingData(_this);
        }, function () { }, scene.offlineProvider, getBinaryData);
        return this;
    };
    /**
     * Returns `true` if the mesh is within the frustum defined by the passed array of planes.
     * A mesh is in the frustum if its bounding box intersects the frustum
     * @param frustumPlanes defines the frustum to test
     * @returns true if the mesh is in the frustum planes
     */
    Mesh.prototype.isInFrustum = function (frustumPlanes) {
        if (this.delayLoadState === 2) {
            return false;
        }
        if (!_super.prototype.isInFrustum.call(this, frustumPlanes)) {
            return false;
        }
        this._checkDelayState();
        return true;
    };
    /**
     * Sets the mesh material by the material or multiMaterial `id` property
     * @param id is a string identifying the material or the multiMaterial
     * @returns the current mesh
     */
    Mesh.prototype.setMaterialById = function (id) {
        var materials = this.getScene().materials;
        var index;
        for (index = materials.length - 1; index > -1; index--) {
            if (materials[index].id === id) {
                this.material = materials[index];
                return this;
            }
        }
        // Multi
        var multiMaterials = this.getScene().multiMaterials;
        for (index = multiMaterials.length - 1; index > -1; index--) {
            if (multiMaterials[index].id === id) {
                this.material = multiMaterials[index];
                return this;
            }
        }
        return this;
    };
    /**
     * Returns as a new array populated with the mesh material and/or skeleton, if any.
     * @returns an array of IAnimatable
     */
    Mesh.prototype.getAnimatables = function () {
        var results = new Array();
        if (this.material) {
            results.push(this.material);
        }
        if (this.skeleton) {
            results.push(this.skeleton);
        }
        return results;
    };
    /**
     * Modifies the mesh geometry according to the passed transformation matrix.
     * This method returns nothing but it really modifies the mesh even if it's originally not set as updatable.
     * The mesh normals are modified using the same transformation.
     * Note that, under the hood, this method sets a new VertexBuffer each call.
     * @param transform defines the transform matrix to use
     * @see https://doc.babylonjs.com/resources/baking_transformations
     * @returns the current mesh
     */
    Mesh.prototype.bakeTransformIntoVertices = function (transform) {
        // Position
        if (!this.isVerticesDataPresent(VertexBuffer.PositionKind)) {
            return this;
        }
        var submeshes = this.subMeshes.splice(0);
        this._resetPointsArrayCache();
        var data = this.getVerticesData(VertexBuffer.PositionKind);
        var temp = new Array();
        var index;
        for (index = 0; index < data.length; index += 3) {
            Vector3.TransformCoordinates(Vector3.FromArray(data, index), transform).toArray(temp, index);
        }
        this.setVerticesData(VertexBuffer.PositionKind, temp, this.getVertexBuffer(VertexBuffer.PositionKind).isUpdatable());
        // Normals
        if (this.isVerticesDataPresent(VertexBuffer.NormalKind)) {
            data = this.getVerticesData(VertexBuffer.NormalKind);
            temp = [];
            for (index = 0; index < data.length; index += 3) {
                Vector3.TransformNormal(Vector3.FromArray(data, index), transform).normalize().toArray(temp, index);
            }
            this.setVerticesData(VertexBuffer.NormalKind, temp, this.getVertexBuffer(VertexBuffer.NormalKind).isUpdatable());
        }
        // flip faces?
        if (transform.determinant() < 0) {
            this.flipFaces();
        }
        // Restore submeshes
        this.releaseSubMeshes();
        this.subMeshes = submeshes;
        return this;
    };
    /**
     * Modifies the mesh geometry according to its own current World Matrix.
     * The mesh World Matrix is then reset.
     * This method returns nothing but really modifies the mesh even if it's originally not set as updatable.
     * Note that, under the hood, this method sets a new VertexBuffer each call.
     * @see https://doc.babylonjs.com/resources/baking_transformations
     * @param bakeIndependenlyOfChildren indicates whether to preserve all child nodes' World Matrix during baking
     * @returns the current mesh
     */
    Mesh.prototype.bakeCurrentTransformIntoVertices = function (bakeIndependenlyOfChildren) {
        if (bakeIndependenlyOfChildren === void 0) { bakeIndependenlyOfChildren = true; }
        this.bakeTransformIntoVertices(this.computeWorldMatrix(true));
        this.resetLocalMatrix(bakeIndependenlyOfChildren);
        return this;
    };
    Object.defineProperty(Mesh.prototype, "_positions", {
        // Cache
        /** @hidden */
        get: function () {
            if (this._internalAbstractMeshDataInfo._positions) {
                return this._internalAbstractMeshDataInfo._positions;
            }
            if (this._geometry) {
                return this._geometry._positions;
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    /** @hidden */
    Mesh.prototype._resetPointsArrayCache = function () {
        if (this._geometry) {
            this._geometry._resetPointsArrayCache();
        }
        return this;
    };
    /** @hidden */
    Mesh.prototype._generatePointsArray = function () {
        if (this._geometry) {
            return this._geometry._generatePointsArray();
        }
        return false;
    };
    /**
     * Returns a new Mesh object generated from the current mesh properties.
     * This method must not get confused with createInstance()
     * @param name is a string, the name given to the new mesh
     * @param newParent can be any Node object (default `null`)
     * @param doNotCloneChildren allows/denies the recursive cloning of the original mesh children if any (default `false`)
     * @param clonePhysicsImpostor allows/denies the cloning in the same time of the original mesh `body` used by the physics engine, if any (default `true`)
     * @returns a new mesh
     */
    Mesh.prototype.clone = function (name, newParent, doNotCloneChildren, clonePhysicsImpostor) {
        if (name === void 0) { name = ""; }
        if (newParent === void 0) { newParent = null; }
        if (clonePhysicsImpostor === void 0) { clonePhysicsImpostor = true; }
        return new Mesh(name, this.getScene(), newParent, this, doNotCloneChildren, clonePhysicsImpostor);
    };
    /**
     * Releases resources associated with this mesh.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    Mesh.prototype.dispose = function (doNotRecurse, disposeMaterialAndTextures) {
        if (disposeMaterialAndTextures === void 0) { disposeMaterialAndTextures = false; }
        this.morphTargetManager = null;
        if (this._geometry) {
            this._geometry.releaseForMesh(this, true);
        }
        var internalDataInfo = this._internalMeshDataInfo;
        if (internalDataInfo._onBeforeDrawObservable) {
            internalDataInfo._onBeforeDrawObservable.clear();
        }
        if (internalDataInfo._onBeforeBindObservable) {
            internalDataInfo._onBeforeBindObservable.clear();
        }
        if (internalDataInfo._onBeforeRenderObservable) {
            internalDataInfo._onBeforeRenderObservable.clear();
        }
        if (internalDataInfo._onAfterRenderObservable) {
            internalDataInfo._onAfterRenderObservable.clear();
        }
        if (internalDataInfo._onBetweenPassObservable) {
            internalDataInfo._onBetweenPassObservable.clear();
        }
        // Sources
        if (this._scene.useClonedMeshMap) {
            if (internalDataInfo.meshMap) {
                for (var uniqueId in internalDataInfo.meshMap) {
                    var mesh = internalDataInfo.meshMap[uniqueId];
                    if (mesh) {
                        mesh._internalMeshDataInfo._source = null;
                        internalDataInfo.meshMap[uniqueId] = undefined;
                    }
                }
            }
            if (internalDataInfo._source && internalDataInfo._source._internalMeshDataInfo.meshMap) {
                internalDataInfo._source._internalMeshDataInfo.meshMap[this.uniqueId] = undefined;
            }
        }
        else {
            var meshes = this.getScene().meshes;
            for (var _i = 0, meshes_1 = meshes; _i < meshes_1.length; _i++) {
                var abstractMesh = meshes_1[_i];
                var mesh = abstractMesh;
                if (mesh._internalMeshDataInfo && mesh._internalMeshDataInfo._source && mesh._internalMeshDataInfo._source === this) {
                    mesh._internalMeshDataInfo._source = null;
                }
            }
        }
        internalDataInfo._source = null;
        // Instances
        this._disposeInstanceSpecificData();
        // Thin instances
        this._disposeThinInstanceSpecificData();
        if (this._internalMeshDataInfo._checkReadinessObserver) {
            this._scene.onBeforeRenderObservable.remove(this._internalMeshDataInfo._checkReadinessObserver);
        }
        _super.prototype.dispose.call(this, doNotRecurse, disposeMaterialAndTextures);
    };
    /** @hidden */
    Mesh.prototype._disposeInstanceSpecificData = function () {
        // Do nothing
    };
    /** @hidden */
    Mesh.prototype._disposeThinInstanceSpecificData = function () {
        // Do nothing
    };
    /** @hidden */
    Mesh.prototype._invalidateInstanceVertexArrayObject = function () {
        // Do nothing
    };
    /**
     * Modifies the mesh geometry according to a displacement map.
     * A displacement map is a colored image. Each pixel color value (actually a gradient computed from red, green, blue values) will give the displacement to apply to each mesh vertex.
     * The mesh must be set as updatable. Its internal geometry is directly modified, no new buffer are allocated.
     * @param url is a string, the URL from the image file is to be downloaded.
     * @param minHeight is the lower limit of the displacement.
     * @param maxHeight is the upper limit of the displacement.
     * @param onSuccess is an optional Javascript function to be called just after the mesh is modified. It is passed the modified mesh and must return nothing.
     * @param uvOffset is an optional vector2 used to offset UV.
     * @param uvScale is an optional vector2 used to scale UV.
     * @param forceUpdate defines whether or not to force an update of the generated buffers. This is useful to apply on a deserialized model for instance.
     * @returns the Mesh.
     */
    Mesh.prototype.applyDisplacementMap = function (url, minHeight, maxHeight, onSuccess, uvOffset, uvScale, forceUpdate) {
        var _this = this;
        if (forceUpdate === void 0) { forceUpdate = false; }
        var scene = this.getScene();
        var onload = function (img) {
            // Getting height map data
            var heightMapWidth = img.width;
            var heightMapHeight = img.height;
            var canvas = _this.getEngine().createCanvas(heightMapWidth, heightMapHeight);
            var context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);
            // Create VertexData from map data
            //Cast is due to wrong definition in lib.d.ts from ts 1.3 - https://github.com/Microsoft/TypeScript/issues/949
            var buffer = context.getImageData(0, 0, heightMapWidth, heightMapHeight).data;
            _this.applyDisplacementMapFromBuffer(buffer, heightMapWidth, heightMapHeight, minHeight, maxHeight, uvOffset, uvScale, forceUpdate);
            //execute success callback, if set
            if (onSuccess) {
                onSuccess(_this);
            }
        };
        Tools.LoadImage(url, onload, function () { }, scene.offlineProvider);
        return this;
    };
    /**
     * Modifies the mesh geometry according to a displacementMap buffer.
     * A displacement map is a colored image. Each pixel color value (actually a gradient computed from red, green, blue values) will give the displacement to apply to each mesh vertex.
     * The mesh must be set as updatable. Its internal geometry is directly modified, no new buffer are allocated.
     * @param buffer is a `Uint8Array` buffer containing series of `Uint8` lower than 255, the red, green, blue and alpha values of each successive pixel.
     * @param heightMapWidth is the width of the buffer image.
     * @param heightMapHeight is the height of the buffer image.
     * @param minHeight is the lower limit of the displacement.
     * @param maxHeight is the upper limit of the displacement.
     * @param uvOffset is an optional vector2 used to offset UV.
     * @param uvScale is an optional vector2 used to scale UV.
     * @param forceUpdate defines whether or not to force an update of the generated buffers. This is useful to apply on a deserialized model for instance.
     * @returns the Mesh.
     */
    Mesh.prototype.applyDisplacementMapFromBuffer = function (buffer, heightMapWidth, heightMapHeight, minHeight, maxHeight, uvOffset, uvScale, forceUpdate) {
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (!this.isVerticesDataPresent(VertexBuffer.PositionKind) || !this.isVerticesDataPresent(VertexBuffer.NormalKind) || !this.isVerticesDataPresent(VertexBuffer.UVKind)) {
            Logger.Warn("Cannot call applyDisplacementMap: Given mesh is not complete. Position, Normal or UV are missing");
            return this;
        }
        var positions = this.getVerticesData(VertexBuffer.PositionKind, true, true);
        var normals = this.getVerticesData(VertexBuffer.NormalKind);
        var uvs = this.getVerticesData(VertexBuffer.UVKind);
        var position = Vector3.Zero();
        var normal = Vector3.Zero();
        var uv = Vector2.Zero();
        uvOffset = uvOffset || Vector2.Zero();
        uvScale = uvScale || new Vector2(1, 1);
        for (var index = 0; index < positions.length; index += 3) {
            Vector3.FromArrayToRef(positions, index, position);
            Vector3.FromArrayToRef(normals, index, normal);
            Vector2.FromArrayToRef(uvs, (index / 3) * 2, uv);
            // Compute height
            var u = (Math.abs(uv.x * uvScale.x + (uvOffset.x % 1)) * (heightMapWidth - 1)) % heightMapWidth | 0;
            var v = (Math.abs(uv.y * uvScale.y + (uvOffset.y % 1)) * (heightMapHeight - 1)) % heightMapHeight | 0;
            var pos = (u + v * heightMapWidth) * 4;
            var r = buffer[pos] / 255.0;
            var g = buffer[pos + 1] / 255.0;
            var b = buffer[pos + 2] / 255.0;
            var gradient = r * 0.3 + g * 0.59 + b * 0.11;
            normal.normalize();
            normal.scaleInPlace(minHeight + (maxHeight - minHeight) * gradient);
            position = position.add(normal);
            position.toArray(positions, index);
        }
        VertexData.ComputeNormals(positions, this.getIndices(), normals);
        if (forceUpdate) {
            this.setVerticesData(VertexBuffer.PositionKind, positions);
            this.setVerticesData(VertexBuffer.NormalKind, normals);
            this.setVerticesData(VertexBuffer.UVKind, uvs);
        }
        else {
            this.updateVerticesData(VertexBuffer.PositionKind, positions);
            this.updateVerticesData(VertexBuffer.NormalKind, normals);
        }
        return this;
    };
    /**
     * Modify the mesh to get a flat shading rendering.
     * This means each mesh facet will then have its own normals. Usually new vertices are added in the mesh geometry to get this result.
     * Warning : the mesh is really modified even if not set originally as updatable and, under the hood, a new VertexBuffer is allocated.
     * @returns current mesh
     */
    Mesh.prototype.convertToFlatShadedMesh = function () {
        var kinds = this.getVerticesDataKinds();
        var vbs = {};
        var data = {};
        var newdata = {};
        var updatableNormals = false;
        var kindIndex;
        var kind;
        for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
            kind = kinds[kindIndex];
            var vertexBuffer = this.getVertexBuffer(kind);
            // Check data consistency
            var vertexData = vertexBuffer.getData();
            if (vertexData instanceof Array || vertexData instanceof Float32Array) {
                if (vertexData.length === 0) {
                    continue;
                }
            }
            if (kind === VertexBuffer.NormalKind) {
                updatableNormals = vertexBuffer.isUpdatable();
                kinds.splice(kindIndex, 1);
                kindIndex--;
                continue;
            }
            vbs[kind] = vertexBuffer;
            data[kind] = this.getVerticesData(kind);
            newdata[kind] = [];
        }
        // Save previous submeshes
        var previousSubmeshes = this.subMeshes.slice(0);
        var indices = this.getIndices();
        var totalIndices = this.getTotalIndices();
        // Generating unique vertices per face
        var index;
        for (index = 0; index < totalIndices; index++) {
            var vertexIndex = indices[index];
            for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
                kind = kinds[kindIndex];
                if (!vbs[kind]) {
                    continue;
                }
                var stride = vbs[kind].getStrideSize();
                for (var offset = 0; offset < stride; offset++) {
                    newdata[kind].push(data[kind][vertexIndex * stride + offset]);
                }
            }
        }
        // Updating faces & normal
        var normals = [];
        var positions = newdata[VertexBuffer.PositionKind];
        var useRightHandedSystem = this.getScene().useRightHandedSystem;
        var flipNormalGeneration;
        if (useRightHandedSystem) {
            flipNormalGeneration = this.overrideMaterialSideOrientation === 1;
        }
        else {
            flipNormalGeneration = this.overrideMaterialSideOrientation === 0;
        }
        for (index = 0; index < totalIndices; index += 3) {
            indices[index] = index;
            indices[index + 1] = index + 1;
            indices[index + 2] = index + 2;
            var p1 = Vector3.FromArray(positions, index * 3);
            var p2 = Vector3.FromArray(positions, (index + 1) * 3);
            var p3 = Vector3.FromArray(positions, (index + 2) * 3);
            var p1p2 = p1.subtract(p2);
            var p3p2 = p3.subtract(p2);
            var normal = Vector3.Normalize(Vector3.Cross(p1p2, p3p2));
            if (flipNormalGeneration) {
                normal.scaleInPlace(-1);
            }
            // Store same normals for every vertex
            for (var localIndex = 0; localIndex < 3; localIndex++) {
                normals.push(normal.x);
                normals.push(normal.y);
                normals.push(normal.z);
            }
        }
        this.setIndices(indices);
        this.setVerticesData(VertexBuffer.NormalKind, normals, updatableNormals);
        // Updating vertex buffers
        for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
            kind = kinds[kindIndex];
            if (!newdata[kind]) {
                continue;
            }
            this.setVerticesData(kind, newdata[kind], vbs[kind].isUpdatable());
        }
        // Updating submeshes
        this.releaseSubMeshes();
        for (var submeshIndex = 0; submeshIndex < previousSubmeshes.length; submeshIndex++) {
            var previousOne = previousSubmeshes[submeshIndex];
            SubMesh.AddToMesh(previousOne.materialIndex, previousOne.indexStart, previousOne.indexCount, previousOne.indexStart, previousOne.indexCount, this);
        }
        this.synchronizeInstances();
        return this;
    };
    /**
     * This method removes all the mesh indices and add new vertices (duplication) in order to unfold facets into buffers.
     * In other words, more vertices, no more indices and a single bigger VBO.
     * The mesh is really modified even if not set originally as updatable. Under the hood, a new VertexBuffer is allocated.
     * @returns current mesh
     */
    Mesh.prototype.convertToUnIndexedMesh = function () {
        var kinds = this.getVerticesDataKinds();
        var vbs = {};
        var data = {};
        var newdata = {};
        var kindIndex;
        var kind;
        for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
            kind = kinds[kindIndex];
            var vertexBuffer = this.getVertexBuffer(kind);
            vbs[kind] = vertexBuffer;
            data[kind] = vbs[kind].getData();
            newdata[kind] = [];
        }
        // Save previous submeshes
        var previousSubmeshes = this.subMeshes.slice(0);
        var indices = this.getIndices();
        var totalIndices = this.getTotalIndices();
        // Generating unique vertices per face
        var index;
        for (index = 0; index < totalIndices; index++) {
            var vertexIndex = indices[index];
            for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
                kind = kinds[kindIndex];
                var stride = vbs[kind].getStrideSize();
                for (var offset = 0; offset < stride; offset++) {
                    newdata[kind].push(data[kind][vertexIndex * stride + offset]);
                }
            }
        }
        // Updating indices
        for (index = 0; index < totalIndices; index += 3) {
            indices[index] = index;
            indices[index + 1] = index + 1;
            indices[index + 2] = index + 2;
        }
        this.setIndices(indices);
        // Updating vertex buffers
        for (kindIndex = 0; kindIndex < kinds.length; kindIndex++) {
            kind = kinds[kindIndex];
            this.setVerticesData(kind, newdata[kind], vbs[kind].isUpdatable());
        }
        // Updating submeshes
        this.releaseSubMeshes();
        for (var submeshIndex = 0; submeshIndex < previousSubmeshes.length; submeshIndex++) {
            var previousOne = previousSubmeshes[submeshIndex];
            SubMesh.AddToMesh(previousOne.materialIndex, previousOne.indexStart, previousOne.indexCount, previousOne.indexStart, previousOne.indexCount, this);
        }
        this._unIndexed = true;
        this.synchronizeInstances();
        return this;
    };
    /**
     * Inverses facet orientations.
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     * @param flipNormals will also inverts the normals
     * @returns current mesh
     */
    Mesh.prototype.flipFaces = function (flipNormals) {
        if (flipNormals === void 0) { flipNormals = false; }
        var vertex_data = VertexData.ExtractFromMesh(this);
        var i;
        if (flipNormals && this.isVerticesDataPresent(VertexBuffer.NormalKind) && vertex_data.normals) {
            for (i = 0; i < vertex_data.normals.length; i++) {
                vertex_data.normals[i] *= -1;
            }
        }
        if (vertex_data.indices) {
            var temp = void 0;
            for (i = 0; i < vertex_data.indices.length; i += 3) {
                // reassign indices
                temp = vertex_data.indices[i + 1];
                vertex_data.indices[i + 1] = vertex_data.indices[i + 2];
                vertex_data.indices[i + 2] = temp;
            }
        }
        vertex_data.applyToMesh(this, this.isVertexBufferUpdatable(VertexBuffer.PositionKind));
        return this;
    };
    /**
     * Increase the number of facets and hence vertices in a mesh
     * Vertex normals are interpolated from existing vertex normals
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     * @param numberPerEdge the number of new vertices to add to each edge of a facet, optional default 1
     */
    Mesh.prototype.increaseVertices = function (numberPerEdge) {
        var vertex_data = VertexData.ExtractFromMesh(this);
        var uvs = vertex_data.uvs && !Array.isArray(vertex_data.uvs) && Array.from ? Array.from(vertex_data.uvs) : vertex_data.uvs;
        var currentIndices = vertex_data.indices && !Array.isArray(vertex_data.indices) && Array.from ? Array.from(vertex_data.indices) : vertex_data.indices;
        var positions = vertex_data.positions && !Array.isArray(vertex_data.positions) && Array.from ? Array.from(vertex_data.positions) : vertex_data.positions;
        var normals = vertex_data.normals && !Array.isArray(vertex_data.normals) && Array.from ? Array.from(vertex_data.normals) : vertex_data.normals;
        if (!currentIndices || !positions || !normals || !uvs) {
            Logger.Warn("VertexData contains null entries");
        }
        else {
            vertex_data.indices = currentIndices;
            vertex_data.positions = positions;
            vertex_data.normals = normals;
            vertex_data.uvs = uvs;
            var segments = numberPerEdge + 1; //segments per current facet edge, become sides of new facets
            var tempIndices = new Array();
            for (var i = 0; i < segments + 1; i++) {
                tempIndices[i] = new Array();
            }
            var a = void 0; //vertex index of one end of a side
            var b = void 0; //vertex index of other end of the side
            var deltaPosition = new Vector3(0, 0, 0);
            var deltaNormal = new Vector3(0, 0, 0);
            var deltaUV = new Vector2(0, 0);
            var indices = new Array();
            var vertexIndex = new Array();
            var side = new Array();
            var len = void 0;
            var positionPtr = positions.length;
            var uvPtr = uvs.length;
            for (var i = 0; i < currentIndices.length; i += 3) {
                vertexIndex[0] = currentIndices[i];
                vertexIndex[1] = currentIndices[i + 1];
                vertexIndex[2] = currentIndices[i + 2];
                for (var j = 0; j < 3; j++) {
                    a = vertexIndex[j];
                    b = vertexIndex[(j + 1) % 3];
                    if (side[a] === undefined && side[b] === undefined) {
                        side[a] = new Array();
                        side[b] = new Array();
                    }
                    else {
                        if (side[a] === undefined) {
                            side[a] = new Array();
                        }
                        if (side[b] === undefined) {
                            side[b] = new Array();
                        }
                    }
                    if (side[a][b] === undefined && side[b][a] === undefined) {
                        side[a][b] = [];
                        deltaPosition.x = (positions[3 * b] - positions[3 * a]) / segments;
                        deltaPosition.y = (positions[3 * b + 1] - positions[3 * a + 1]) / segments;
                        deltaPosition.z = (positions[3 * b + 2] - positions[3 * a + 2]) / segments;
                        deltaNormal.x = (normals[3 * b] - normals[3 * a]) / segments;
                        deltaNormal.y = (normals[3 * b + 1] - normals[3 * a + 1]) / segments;
                        deltaNormal.z = (normals[3 * b + 2] - normals[3 * a + 2]) / segments;
                        deltaUV.x = (uvs[2 * b] - uvs[2 * a]) / segments;
                        deltaUV.y = (uvs[2 * b + 1] - uvs[2 * a + 1]) / segments;
                        side[a][b].push(a);
                        for (var k = 1; k < segments; k++) {
                            side[a][b].push(positions.length / 3);
                            positions[positionPtr] = positions[3 * a] + k * deltaPosition.x;
                            normals[positionPtr++] = normals[3 * a] + k * deltaNormal.x;
                            positions[positionPtr] = positions[3 * a + 1] + k * deltaPosition.y;
                            normals[positionPtr++] = normals[3 * a + 1] + k * deltaNormal.y;
                            positions[positionPtr] = positions[3 * a + 2] + k * deltaPosition.z;
                            normals[positionPtr++] = normals[3 * a + 2] + k * deltaNormal.z;
                            uvs[uvPtr++] = uvs[2 * a] + k * deltaUV.x;
                            uvs[uvPtr++] = uvs[2 * a + 1] + k * deltaUV.y;
                        }
                        side[a][b].push(b);
                        side[b][a] = new Array();
                        len = side[a][b].length;
                        for (var idx = 0; idx < len; idx++) {
                            side[b][a][idx] = side[a][b][len - 1 - idx];
                        }
                    }
                }
                //Calculate positions, normals and uvs of new internal vertices
                tempIndices[0][0] = currentIndices[i];
                tempIndices[1][0] = side[currentIndices[i]][currentIndices[i + 1]][1];
                tempIndices[1][1] = side[currentIndices[i]][currentIndices[i + 2]][1];
                for (var k = 2; k < segments; k++) {
                    tempIndices[k][0] = side[currentIndices[i]][currentIndices[i + 1]][k];
                    tempIndices[k][k] = side[currentIndices[i]][currentIndices[i + 2]][k];
                    deltaPosition.x = (positions[3 * tempIndices[k][k]] - positions[3 * tempIndices[k][0]]) / k;
                    deltaPosition.y = (positions[3 * tempIndices[k][k] + 1] - positions[3 * tempIndices[k][0] + 1]) / k;
                    deltaPosition.z = (positions[3 * tempIndices[k][k] + 2] - positions[3 * tempIndices[k][0] + 2]) / k;
                    deltaNormal.x = (normals[3 * tempIndices[k][k]] - normals[3 * tempIndices[k][0]]) / k;
                    deltaNormal.y = (normals[3 * tempIndices[k][k] + 1] - normals[3 * tempIndices[k][0] + 1]) / k;
                    deltaNormal.z = (normals[3 * tempIndices[k][k] + 2] - normals[3 * tempIndices[k][0] + 2]) / k;
                    deltaUV.x = (uvs[2 * tempIndices[k][k]] - uvs[2 * tempIndices[k][0]]) / k;
                    deltaUV.y = (uvs[2 * tempIndices[k][k] + 1] - uvs[2 * tempIndices[k][0] + 1]) / k;
                    for (var j = 1; j < k; j++) {
                        tempIndices[k][j] = positions.length / 3;
                        positions[positionPtr] = positions[3 * tempIndices[k][0]] + j * deltaPosition.x;
                        normals[positionPtr++] = normals[3 * tempIndices[k][0]] + j * deltaNormal.x;
                        positions[positionPtr] = positions[3 * tempIndices[k][0] + 1] + j * deltaPosition.y;
                        normals[positionPtr++] = normals[3 * tempIndices[k][0] + 1] + j * deltaNormal.y;
                        positions[positionPtr] = positions[3 * tempIndices[k][0] + 2] + j * deltaPosition.z;
                        normals[positionPtr++] = normals[3 * tempIndices[k][0] + 2] + j * deltaNormal.z;
                        uvs[uvPtr++] = uvs[2 * tempIndices[k][0]] + j * deltaUV.x;
                        uvs[uvPtr++] = uvs[2 * tempIndices[k][0] + 1] + j * deltaUV.y;
                    }
                }
                tempIndices[segments] = side[currentIndices[i + 1]][currentIndices[i + 2]];
                // reform indices
                indices.push(tempIndices[0][0], tempIndices[1][0], tempIndices[1][1]);
                for (var k = 1; k < segments; k++) {
                    var j = void 0;
                    for (j = 0; j < k; j++) {
                        indices.push(tempIndices[k][j], tempIndices[k + 1][j], tempIndices[k + 1][j + 1]);
                        indices.push(tempIndices[k][j], tempIndices[k + 1][j + 1], tempIndices[k][j + 1]);
                    }
                    indices.push(tempIndices[k][j], tempIndices[k + 1][j], tempIndices[k + 1][j + 1]);
                }
            }
            vertex_data.indices = indices;
            vertex_data.applyToMesh(this, this.isVertexBufferUpdatable(VertexBuffer.PositionKind));
        }
    };
    /**
     * Force adjacent facets to share vertices and remove any facets that have all vertices in a line
     * This will undo any application of covertToFlatShadedMesh
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     */
    Mesh.prototype.forceSharedVertices = function () {
        var vertex_data = VertexData.ExtractFromMesh(this);
        var currentUVs = vertex_data.uvs;
        var currentIndices = vertex_data.indices;
        var currentPositions = vertex_data.positions;
        var currentColors = vertex_data.colors;
        if (currentIndices === void 0 || currentPositions === void 0 || currentIndices === null || currentPositions === null) {
            Logger.Warn("VertexData contains empty entries");
        }
        else {
            var positions = new Array();
            var indices = new Array();
            var uvs = new Array();
            var colors = new Array();
            var pstring = new Array(); //lists facet vertex positions (a,b,c) as string "a|b|c"
            var indexPtr = 0; // pointer to next available index value
            var uniquePositions = {}; // unique vertex positions
            var ptr = void 0; // pointer to element in uniquePositions
            var facet = void 0;
            for (var i = 0; i < currentIndices.length; i += 3) {
                facet = [currentIndices[i], currentIndices[i + 1], currentIndices[i + 2]]; //facet vertex indices
                pstring = new Array();
                for (var j = 0; j < 3; j++) {
                    pstring[j] = "";
                    for (var k = 0; k < 3; k++) {
                        //small values make 0
                        if (Math.abs(currentPositions[3 * facet[j] + k]) < 0.00000001) {
                            currentPositions[3 * facet[j] + k] = 0;
                        }
                        pstring[j] += currentPositions[3 * facet[j] + k] + "|";
                    }
                }
                //check facet vertices to see that none are repeated
                // do not process any facet that has a repeated vertex, ie is a line
                if (!(pstring[0] == pstring[1] || pstring[0] == pstring[2] || pstring[1] == pstring[2])) {
                    //for each facet position check if already listed in uniquePositions
                    // if not listed add to uniquePositions and set index pointer
                    // if listed use its index in uniquePositions and new index pointer
                    for (var j = 0; j < 3; j++) {
                        ptr = uniquePositions[pstring[j]];
                        if (ptr === undefined) {
                            uniquePositions[pstring[j]] = indexPtr;
                            ptr = indexPtr++;
                            //not listed so add individual x, y, z coordinates to positions
                            for (var k = 0; k < 3; k++) {
                                positions.push(currentPositions[3 * facet[j] + k]);
                            }
                            if (currentColors !== null && currentColors !== void 0) {
                                for (var k = 0; k < 4; k++) {
                                    colors.push(currentColors[4 * facet[j] + k]);
                                }
                            }
                            if (currentUVs !== null && currentUVs !== void 0) {
                                for (var k = 0; k < 2; k++) {
                                    uvs.push(currentUVs[2 * facet[j] + k]);
                                }
                            }
                        }
                        // add new index pointer to indices array
                        indices.push(ptr);
                    }
                }
            }
            var normals = new Array();
            VertexData.ComputeNormals(positions, indices, normals);
            //create new vertex data object and update
            vertex_data.positions = positions;
            vertex_data.indices = indices;
            vertex_data.normals = normals;
            if (currentUVs !== null && currentUVs !== void 0) {
                vertex_data.uvs = uvs;
            }
            if (currentColors !== null && currentColors !== void 0) {
                vertex_data.colors = colors;
            }
            vertex_data.applyToMesh(this, this.isVertexBufferUpdatable(VertexBuffer.PositionKind));
        }
    };
    // Instances
    /**
     * @param name
     * @param mesh
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
    Mesh._instancedMeshFactory = function (name, mesh) {
        throw _WarnImport("InstancedMesh");
    };
    /**
     * @param scene
     * @param physicObject
     * @param jsonObject
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mesh._PhysicsImpostorParser = function (scene, physicObject, jsonObject) {
        throw _WarnImport("PhysicsImpostor");
    };
    /**
     * Creates a new InstancedMesh object from the mesh model.
     * @see https://doc.babylonjs.com/how_to/how_to_use_instances
     * @param name defines the name of the new instance
     * @returns a new InstancedMesh
     */
    Mesh.prototype.createInstance = function (name) {
        return Mesh._instancedMeshFactory(name, this);
    };
    /**
     * Synchronises all the mesh instance submeshes to the current mesh submeshes, if any.
     * After this call, all the mesh instances have the same submeshes than the current mesh.
     * @returns the current mesh
     */
    Mesh.prototype.synchronizeInstances = function () {
        for (var instanceIndex = 0; instanceIndex < this.instances.length; instanceIndex++) {
            var instance = this.instances[instanceIndex];
            instance._syncSubMeshes();
        }
        return this;
    };
    /**
     * Optimization of the mesh's indices, in case a mesh has duplicated vertices.
     * The function will only reorder the indices and will not remove unused vertices to avoid problems with submeshes.
     * This should be used together with the simplification to avoid disappearing triangles.
     * @param successCallback an optional success callback to be called after the optimization finished.
     * @returns the current mesh
     */
    Mesh.prototype.optimizeIndices = function (successCallback) {
        var _this = this;
        var indices = this.getIndices();
        var positions = this.getVerticesData(VertexBuffer.PositionKind);
        if (!positions || !indices) {
            return this;
        }
        var vectorPositions = new Array();
        for (var pos = 0; pos < positions.length; pos = pos + 3) {
            vectorPositions.push(Vector3.FromArray(positions, pos));
        }
        var dupes = new Array();
        AsyncLoop.SyncAsyncForLoop(vectorPositions.length, 40, function (iteration) {
            var realPos = vectorPositions.length - 1 - iteration;
            var testedPosition = vectorPositions[realPos];
            for (var j = 0; j < realPos; ++j) {
                var againstPosition = vectorPositions[j];
                if (testedPosition.equals(againstPosition)) {
                    dupes[realPos] = j;
                    break;
                }
            }
        }, function () {
            for (var i = 0; i < indices.length; ++i) {
                indices[i] = dupes[indices[i]] || indices[i];
            }
            //indices are now reordered
            var originalSubMeshes = _this.subMeshes.slice(0);
            _this.setIndices(indices);
            _this.subMeshes = originalSubMeshes;
            if (successCallback) {
                successCallback(_this);
            }
        });
        return this;
    };
    /**
     * Serialize current mesh
     * @param serializationObject defines the object which will receive the serialization data
     */
    Mesh.prototype.serialize = function (serializationObject) {
        serializationObject.name = this.name;
        serializationObject.id = this.id;
        serializationObject.uniqueId = this.uniqueId;
        serializationObject.type = this.getClassName();
        if (Tags && Tags.HasTags(this)) {
            serializationObject.tags = Tags.GetTags(this);
        }
        serializationObject.position = this.position.asArray();
        if (this.rotationQuaternion) {
            serializationObject.rotationQuaternion = this.rotationQuaternion.asArray();
        }
        else if (this.rotation) {
            serializationObject.rotation = this.rotation.asArray();
        }
        serializationObject.scaling = this.scaling.asArray();
        if (this._postMultiplyPivotMatrix) {
            serializationObject.pivotMatrix = this.getPivotMatrix().asArray();
        }
        else {
            serializationObject.localMatrix = this.getPivotMatrix().asArray();
        }
        serializationObject.isEnabled = this.isEnabled(false);
        serializationObject.isVisible = this.isVisible;
        serializationObject.infiniteDistance = this.infiniteDistance;
        serializationObject.pickable = this.isPickable;
        serializationObject.receiveShadows = this.receiveShadows;
        serializationObject.billboardMode = this.billboardMode;
        serializationObject.visibility = this.visibility;
        serializationObject.checkCollisions = this.checkCollisions;
        serializationObject.isBlocker = this.isBlocker;
        serializationObject.overrideMaterialSideOrientation = this.overrideMaterialSideOrientation;
        // Parent
        if (this.parent) {
            serializationObject.parentId = this.parent.uniqueId;
        }
        // Geometry
        serializationObject.isUnIndexed = this.isUnIndexed;
        var geometry = this._geometry;
        if (geometry && this.subMeshes) {
            serializationObject.geometryUniqueId = geometry.uniqueId;
            serializationObject.geometryId = geometry.id;
            // SubMeshes
            serializationObject.subMeshes = [];
            for (var subIndex = 0; subIndex < this.subMeshes.length; subIndex++) {
                var subMesh = this.subMeshes[subIndex];
                serializationObject.subMeshes.push({
                    materialIndex: subMesh.materialIndex,
                    verticesStart: subMesh.verticesStart,
                    verticesCount: subMesh.verticesCount,
                    indexStart: subMesh.indexStart,
                    indexCount: subMesh.indexCount
                });
            }
        }
        // Material
        if (this.material) {
            if (!this.material.doNotSerialize) {
                serializationObject.materialUniqueId = this.material.uniqueId;
                serializationObject.materialId = this.material.id; // back compat
            }
        }
        else {
            this.material = null;
            serializationObject.materialUniqueId = this._scene.defaultMaterial.uniqueId;
            serializationObject.materialId = this._scene.defaultMaterial.id; // back compat
        }
        // Morph targets
        if (this.morphTargetManager) {
            serializationObject.morphTargetManagerId = this.morphTargetManager.uniqueId;
        }
        // Skeleton
        if (this.skeleton) {
            serializationObject.skeletonId = this.skeleton.id;
            serializationObject.numBoneInfluencers = this.numBoneInfluencers;
        }
        // Physics
        //TODO implement correct serialization for physics impostors.
        if (this.getScene()._getComponent(SceneComponentConstants.NAME_PHYSICSENGINE)) {
            var impostor = this.getPhysicsImpostor();
            if (impostor) {
                serializationObject.physicsMass = impostor.getParam("mass");
                serializationObject.physicsFriction = impostor.getParam("friction");
                serializationObject.physicsRestitution = impostor.getParam("mass");
                serializationObject.physicsImpostor = impostor.type;
            }
        }
        // Metadata
        if (this.metadata) {
            serializationObject.metadata = this.metadata;
        }
        // Instances
        serializationObject.instances = [];
        for (var index = 0; index < this.instances.length; index++) {
            var instance = this.instances[index];
            if (instance.doNotSerialize) {
                continue;
            }
            var serializationInstance = {
                name: instance.name,
                id: instance.id,
                isEnabled: instance.isEnabled(false),
                isVisible: instance.isVisible,
                isPickable: instance.isPickable,
                checkCollisions: instance.checkCollisions,
                position: instance.position.asArray(),
                scaling: instance.scaling.asArray()
            };
            if (instance.parent) {
                serializationInstance.parentId = instance.parent.uniqueId;
            }
            if (instance.rotationQuaternion) {
                serializationInstance.rotationQuaternion = instance.rotationQuaternion.asArray();
            }
            else if (instance.rotation) {
                serializationInstance.rotation = instance.rotation.asArray();
            }
            // Physics
            //TODO implement correct serialization for physics impostors.
            if (this.getScene()._getComponent(SceneComponentConstants.NAME_PHYSICSENGINE)) {
                var impostor = instance.getPhysicsImpostor();
                if (impostor) {
                    serializationInstance.physicsMass = impostor.getParam("mass");
                    serializationInstance.physicsFriction = impostor.getParam("friction");
                    serializationInstance.physicsRestitution = impostor.getParam("mass");
                    serializationInstance.physicsImpostor = impostor.type;
                }
            }
            // Metadata
            if (instance.metadata) {
                serializationInstance.metadata = instance.metadata;
            }
            serializationObject.instances.push(serializationInstance);
            // Animations
            SerializationHelper.AppendSerializedAnimations(instance, serializationInstance);
            serializationInstance.ranges = instance.serializeAnimationRanges();
        }
        // Thin instances
        if (this._thinInstanceDataStorage.instancesCount && this._thinInstanceDataStorage.matrixData) {
            serializationObject.thinInstances = {
                instancesCount: this._thinInstanceDataStorage.instancesCount,
                matrixData: Tools.SliceToArray(this._thinInstanceDataStorage.matrixData),
                matrixBufferSize: this._thinInstanceDataStorage.matrixBufferSize,
                enablePicking: this.thinInstanceEnablePicking
            };
            if (this._userThinInstanceBuffersStorage) {
                var userThinInstance = {
                    data: {},
                    sizes: {},
                    strides: {}
                };
                for (var kind in this._userThinInstanceBuffersStorage.data) {
                    userThinInstance.data[kind] = Tools.SliceToArray(this._userThinInstanceBuffersStorage.data[kind]);
                    userThinInstance.sizes[kind] = this._userThinInstanceBuffersStorage.sizes[kind];
                    userThinInstance.strides[kind] = this._userThinInstanceBuffersStorage.strides[kind];
                }
                serializationObject.thinInstances.userThinInstance = userThinInstance;
            }
        }
        // Animations
        SerializationHelper.AppendSerializedAnimations(this, serializationObject);
        serializationObject.ranges = this.serializeAnimationRanges();
        // Layer mask
        serializationObject.layerMask = this.layerMask;
        // Alpha
        serializationObject.alphaIndex = this.alphaIndex;
        serializationObject.hasVertexAlpha = this.hasVertexAlpha;
        // Overlay
        serializationObject.overlayAlpha = this.overlayAlpha;
        serializationObject.overlayColor = this.overlayColor.asArray();
        serializationObject.renderOverlay = this.renderOverlay;
        // Fog
        serializationObject.applyFog = this.applyFog;
        // Action Manager
        if (this.actionManager) {
            serializationObject.actions = this.actionManager.serialize(this.name);
        }
    };
    /** @hidden */
    Mesh.prototype._syncGeometryWithMorphTargetManager = function () {
        if (!this.geometry) {
            return;
        }
        this._markSubMeshesAsAttributesDirty();
        var morphTargetManager = this._internalAbstractMeshDataInfo._morphTargetManager;
        if (morphTargetManager && morphTargetManager.vertexCount) {
            if (morphTargetManager.vertexCount !== this.getTotalVertices()) {
                Logger.Error("Mesh is incompatible with morph targets. Targets and mesh must all have the same vertices count.");
                this.morphTargetManager = null;
                return;
            }
            if (morphTargetManager.isUsingTextureForTargets) {
                return;
            }
            for (var index = 0; index < morphTargetManager.numInfluencers; index++) {
                var morphTarget = morphTargetManager.getActiveTarget(index);
                var positions = morphTarget.getPositions();
                if (!positions) {
                    Logger.Error("Invalid morph target. Target must have positions.");
                    return;
                }
                this.geometry.setVerticesData(VertexBuffer.PositionKind + index, positions, false, 3);
                var normals = morphTarget.getNormals();
                if (normals) {
                    this.geometry.setVerticesData(VertexBuffer.NormalKind + index, normals, false, 3);
                }
                var tangents = morphTarget.getTangents();
                if (tangents) {
                    this.geometry.setVerticesData(VertexBuffer.TangentKind + index, tangents, false, 3);
                }
                var uvs = morphTarget.getUVs();
                if (uvs) {
                    this.geometry.setVerticesData(VertexBuffer.UVKind + "_" + index, uvs, false, 2);
                }
            }
        }
        else {
            var index = 0;
            // Positions
            while (this.geometry.isVerticesDataPresent(VertexBuffer.PositionKind + index)) {
                this.geometry.removeVerticesData(VertexBuffer.PositionKind + index);
                if (this.geometry.isVerticesDataPresent(VertexBuffer.NormalKind + index)) {
                    this.geometry.removeVerticesData(VertexBuffer.NormalKind + index);
                }
                if (this.geometry.isVerticesDataPresent(VertexBuffer.TangentKind + index)) {
                    this.geometry.removeVerticesData(VertexBuffer.TangentKind + index);
                }
                if (this.geometry.isVerticesDataPresent(VertexBuffer.UVKind + index)) {
                    this.geometry.removeVerticesData(VertexBuffer.UVKind + "_" + index);
                }
                index++;
            }
        }
    };
    /**
     * Returns a new Mesh object parsed from the source provided.
     * @param parsedMesh is the source
     * @param scene defines the hosting scene
     * @param rootUrl is the root URL to prefix the `delayLoadingFile` property with
     * @returns a new Mesh
     */
    Mesh.Parse = function (parsedMesh, scene, rootUrl) {
        var mesh;
        if (parsedMesh.type && parsedMesh.type === "LinesMesh") {
            mesh = Mesh._LinesMeshParser(parsedMesh, scene);
        }
        else if (parsedMesh.type && parsedMesh.type === "GroundMesh") {
            mesh = Mesh._GroundMeshParser(parsedMesh, scene);
        }
        else if (parsedMesh.type && parsedMesh.type === "GoldbergMesh") {
            mesh = Mesh._GoldbergMeshParser(parsedMesh, scene);
        }
        else {
            mesh = new Mesh(parsedMesh.name, scene);
        }
        mesh.id = parsedMesh.id;
        if (Tags) {
            Tags.AddTagsTo(mesh, parsedMesh.tags);
        }
        mesh.position = Vector3.FromArray(parsedMesh.position);
        if (parsedMesh.metadata !== undefined) {
            mesh.metadata = parsedMesh.metadata;
        }
        if (parsedMesh.rotationQuaternion) {
            mesh.rotationQuaternion = Quaternion.FromArray(parsedMesh.rotationQuaternion);
        }
        else if (parsedMesh.rotation) {
            mesh.rotation = Vector3.FromArray(parsedMesh.rotation);
        }
        mesh.scaling = Vector3.FromArray(parsedMesh.scaling);
        if (parsedMesh.localMatrix) {
            mesh.setPreTransformMatrix(Matrix.FromArray(parsedMesh.localMatrix));
        }
        else if (parsedMesh.pivotMatrix) {
            mesh.setPivotMatrix(Matrix.FromArray(parsedMesh.pivotMatrix));
        }
        mesh.setEnabled(parsedMesh.isEnabled);
        mesh.isVisible = parsedMesh.isVisible;
        mesh.infiniteDistance = parsedMesh.infiniteDistance;
        mesh.showBoundingBox = parsedMesh.showBoundingBox;
        mesh.showSubMeshesBoundingBox = parsedMesh.showSubMeshesBoundingBox;
        if (parsedMesh.applyFog !== undefined) {
            mesh.applyFog = parsedMesh.applyFog;
        }
        if (parsedMesh.pickable !== undefined) {
            mesh.isPickable = parsedMesh.pickable;
        }
        if (parsedMesh.alphaIndex !== undefined) {
            mesh.alphaIndex = parsedMesh.alphaIndex;
        }
        mesh.receiveShadows = parsedMesh.receiveShadows;
        mesh.billboardMode = parsedMesh.billboardMode;
        if (parsedMesh.visibility !== undefined) {
            mesh.visibility = parsedMesh.visibility;
        }
        mesh.checkCollisions = parsedMesh.checkCollisions;
        mesh.overrideMaterialSideOrientation = parsedMesh.overrideMaterialSideOrientation;
        if (parsedMesh.isBlocker !== undefined) {
            mesh.isBlocker = parsedMesh.isBlocker;
        }
        mesh._shouldGenerateFlatShading = parsedMesh.useFlatShading;
        // freezeWorldMatrix
        if (parsedMesh.freezeWorldMatrix) {
            mesh._waitingData.freezeWorldMatrix = parsedMesh.freezeWorldMatrix;
        }
        // Parent
        if (parsedMesh.parentId !== undefined) {
            mesh._waitingParentId = parsedMesh.parentId;
        }
        // Actions
        if (parsedMesh.actions !== undefined) {
            mesh._waitingData.actions = parsedMesh.actions;
        }
        // Overlay
        if (parsedMesh.overlayAlpha !== undefined) {
            mesh.overlayAlpha = parsedMesh.overlayAlpha;
        }
        if (parsedMesh.overlayColor !== undefined) {
            mesh.overlayColor = Color3.FromArray(parsedMesh.overlayColor);
        }
        if (parsedMesh.renderOverlay !== undefined) {
            mesh.renderOverlay = parsedMesh.renderOverlay;
        }
        // Geometry
        mesh.isUnIndexed = !!parsedMesh.isUnIndexed;
        mesh.hasVertexAlpha = parsedMesh.hasVertexAlpha;
        if (parsedMesh.delayLoadingFile) {
            mesh.delayLoadState = 4;
            mesh.delayLoadingFile = rootUrl + parsedMesh.delayLoadingFile;
            mesh.buildBoundingInfo(Vector3.FromArray(parsedMesh.boundingBoxMinimum), Vector3.FromArray(parsedMesh.boundingBoxMaximum));
            if (parsedMesh._binaryInfo) {
                mesh._binaryInfo = parsedMesh._binaryInfo;
            }
            mesh._delayInfo = [];
            if (parsedMesh.hasUVs) {
                mesh._delayInfo.push(VertexBuffer.UVKind);
            }
            if (parsedMesh.hasUVs2) {
                mesh._delayInfo.push(VertexBuffer.UV2Kind);
            }
            if (parsedMesh.hasUVs3) {
                mesh._delayInfo.push(VertexBuffer.UV3Kind);
            }
            if (parsedMesh.hasUVs4) {
                mesh._delayInfo.push(VertexBuffer.UV4Kind);
            }
            if (parsedMesh.hasUVs5) {
                mesh._delayInfo.push(VertexBuffer.UV5Kind);
            }
            if (parsedMesh.hasUVs6) {
                mesh._delayInfo.push(VertexBuffer.UV6Kind);
            }
            if (parsedMesh.hasColors) {
                mesh._delayInfo.push(VertexBuffer.ColorKind);
            }
            if (parsedMesh.hasMatricesIndices) {
                mesh._delayInfo.push(VertexBuffer.MatricesIndicesKind);
            }
            if (parsedMesh.hasMatricesWeights) {
                mesh._delayInfo.push(VertexBuffer.MatricesWeightsKind);
            }
            mesh._delayLoadingFunction = Geometry._ImportGeometry;
            if (SceneLoaderFlags.ForceFullSceneLoadingForIncremental) {
                mesh._checkDelayState();
            }
        }
        else {
            Geometry._ImportGeometry(parsedMesh, mesh);
        }
        // Material
        if (parsedMesh.materialUniqueId) {
            mesh._waitingMaterialId = parsedMesh.materialUniqueId;
        }
        else if (parsedMesh.materialId) {
            mesh._waitingMaterialId = parsedMesh.materialId;
        }
        // Morph targets
        if (parsedMesh.morphTargetManagerId > -1) {
            mesh.morphTargetManager = scene.getMorphTargetManagerById(parsedMesh.morphTargetManagerId);
        }
        // Skeleton
        if (parsedMesh.skeletonId !== undefined && parsedMesh.skeletonId !== null) {
            mesh.skeleton = scene.getLastSkeletonById(parsedMesh.skeletonId);
            if (parsedMesh.numBoneInfluencers) {
                mesh.numBoneInfluencers = parsedMesh.numBoneInfluencers;
            }
        }
        // Animations
        if (parsedMesh.animations) {
            for (var animationIndex = 0; animationIndex < parsedMesh.animations.length; animationIndex++) {
                var parsedAnimation = parsedMesh.animations[animationIndex];
                var internalClass = GetClass("BABYLON.Animation");
                if (internalClass) {
                    mesh.animations.push(internalClass.Parse(parsedAnimation));
                }
            }
            Node.ParseAnimationRanges(mesh, parsedMesh, scene);
        }
        if (parsedMesh.autoAnimate) {
            scene.beginAnimation(mesh, parsedMesh.autoAnimateFrom, parsedMesh.autoAnimateTo, parsedMesh.autoAnimateLoop, parsedMesh.autoAnimateSpeed || 1.0);
        }
        // Layer Mask
        if (parsedMesh.layerMask && !isNaN(parsedMesh.layerMask)) {
            mesh.layerMask = Math.abs(parseInt(parsedMesh.layerMask));
        }
        else {
            mesh.layerMask = 0x0fffffff;
        }
        // Physics
        if (parsedMesh.physicsImpostor) {
            Mesh._PhysicsImpostorParser(scene, mesh, parsedMesh);
        }
        // Levels
        if (parsedMesh.lodMeshIds) {
            mesh._waitingData.lods = {
                ids: parsedMesh.lodMeshIds,
                distances: parsedMesh.lodDistances ? parsedMesh.lodDistances : null,
                coverages: parsedMesh.lodCoverages ? parsedMesh.lodCoverages : null
            };
        }
        // Instances
        if (parsedMesh.instances) {
            for (var index = 0; index < parsedMesh.instances.length; index++) {
                var parsedInstance = parsedMesh.instances[index];
                var instance = mesh.createInstance(parsedInstance.name);
                if (parsedInstance.id) {
                    instance.id = parsedInstance.id;
                }
                if (Tags) {
                    if (parsedInstance.tags) {
                        Tags.AddTagsTo(instance, parsedInstance.tags);
                    }
                    else {
                        Tags.AddTagsTo(instance, parsedMesh.tags);
                    }
                }
                instance.position = Vector3.FromArray(parsedInstance.position);
                if (parsedInstance.metadata !== undefined) {
                    instance.metadata = parsedInstance.metadata;
                }
                if (parsedInstance.parentId !== undefined) {
                    instance._waitingParentId = parsedInstance.parentId;
                }
                if (parsedInstance.isEnabled !== undefined && parsedInstance.isEnabled !== null) {
                    instance.setEnabled(parsedInstance.isEnabled);
                }
                if (parsedInstance.isVisible !== undefined && parsedInstance.isVisible !== null) {
                    instance.isVisible = parsedInstance.isVisible;
                }
                if (parsedInstance.isPickable !== undefined && parsedInstance.isPickable !== null) {
                    instance.isPickable = parsedInstance.isPickable;
                }
                if (parsedInstance.rotationQuaternion) {
                    instance.rotationQuaternion = Quaternion.FromArray(parsedInstance.rotationQuaternion);
                }
                else if (parsedInstance.rotation) {
                    instance.rotation = Vector3.FromArray(parsedInstance.rotation);
                }
                instance.scaling = Vector3.FromArray(parsedInstance.scaling);
                if (parsedInstance.checkCollisions != undefined && parsedInstance.checkCollisions != null) {
                    instance.checkCollisions = parsedInstance.checkCollisions;
                }
                if (parsedInstance.pickable != undefined && parsedInstance.pickable != null) {
                    instance.isPickable = parsedInstance.pickable;
                }
                if (parsedInstance.showBoundingBox != undefined && parsedInstance.showBoundingBox != null) {
                    instance.showBoundingBox = parsedInstance.showBoundingBox;
                }
                if (parsedInstance.showSubMeshesBoundingBox != undefined && parsedInstance.showSubMeshesBoundingBox != null) {
                    instance.showSubMeshesBoundingBox = parsedInstance.showSubMeshesBoundingBox;
                }
                if (parsedInstance.alphaIndex != undefined && parsedInstance.showSubMeshesBoundingBox != null) {
                    instance.alphaIndex = parsedInstance.alphaIndex;
                }
                // Physics
                if (parsedInstance.physicsImpostor) {
                    Mesh._PhysicsImpostorParser(scene, instance, parsedInstance);
                }
                // Animation
                if (parsedInstance.animations) {
                    for (var animationIndex = 0; animationIndex < parsedInstance.animations.length; animationIndex++) {
                        var parsedAnimation = parsedInstance.animations[animationIndex];
                        var internalClass = GetClass("BABYLON.Animation");
                        if (internalClass) {
                            instance.animations.push(internalClass.Parse(parsedAnimation));
                        }
                    }
                    Node.ParseAnimationRanges(instance, parsedInstance, scene);
                    if (parsedInstance.autoAnimate) {
                        scene.beginAnimation(instance, parsedInstance.autoAnimateFrom, parsedInstance.autoAnimateTo, parsedInstance.autoAnimateLoop, parsedInstance.autoAnimateSpeed || 1.0);
                    }
                }
            }
        }
        // Thin instances
        if (parsedMesh.thinInstances) {
            var thinInstances = parsedMesh.thinInstances;
            mesh.thinInstanceEnablePicking = !!thinInstances.enablePicking;
            if (thinInstances.matrixData) {
                mesh.thinInstanceSetBuffer("matrix", new Float32Array(thinInstances.matrixData), 16, false);
                mesh._thinInstanceDataStorage.matrixBufferSize = thinInstances.matrixBufferSize;
                mesh._thinInstanceDataStorage.instancesCount = thinInstances.instancesCount;
            }
            else {
                mesh._thinInstanceDataStorage.matrixBufferSize = thinInstances.matrixBufferSize;
            }
            if (parsedMesh.thinInstances.userThinInstance) {
                var userThinInstance = parsedMesh.thinInstances.userThinInstance;
                for (var kind in userThinInstance.data) {
                    mesh.thinInstanceSetBuffer(kind, new Float32Array(userThinInstance.data[kind]), userThinInstance.strides[kind], false);
                    mesh._userThinInstanceBuffersStorage.sizes[kind] = userThinInstance.sizes[kind];
                }
            }
        }
        return mesh;
    };
    // Skeletons
    /**
     * Prepare internal position array for software CPU skinning
     * @returns original positions used for CPU skinning. Useful for integrating Morphing with skeletons in same mesh
     */
    Mesh.prototype.setPositionsForCPUSkinning = function () {
        var internalDataInfo = this._internalMeshDataInfo;
        if (!internalDataInfo._sourcePositions) {
            var source = this.getVerticesData(VertexBuffer.PositionKind);
            if (!source) {
                return internalDataInfo._sourcePositions;
            }
            internalDataInfo._sourcePositions = new Float32Array(source);
            if (!this.isVertexBufferUpdatable(VertexBuffer.PositionKind)) {
                this.setVerticesData(VertexBuffer.PositionKind, source, true);
            }
        }
        return internalDataInfo._sourcePositions;
    };
    /**
     * Prepare internal normal array for software CPU skinning
     * @returns original normals used for CPU skinning. Useful for integrating Morphing with skeletons in same mesh.
     */
    Mesh.prototype.setNormalsForCPUSkinning = function () {
        var internalDataInfo = this._internalMeshDataInfo;
        if (!internalDataInfo._sourceNormals) {
            var source = this.getVerticesData(VertexBuffer.NormalKind);
            if (!source) {
                return internalDataInfo._sourceNormals;
            }
            internalDataInfo._sourceNormals = new Float32Array(source);
            if (!this.isVertexBufferUpdatable(VertexBuffer.NormalKind)) {
                this.setVerticesData(VertexBuffer.NormalKind, source, true);
            }
        }
        return internalDataInfo._sourceNormals;
    };
    /**
     * Updates the vertex buffer by applying transformation from the bones
     * @param skeleton defines the skeleton to apply to current mesh
     * @returns the current mesh
     */
    Mesh.prototype.applySkeleton = function (skeleton) {
        if (!this.geometry) {
            return this;
        }
        if (this.geometry._softwareSkinningFrameId == this.getScene().getFrameId()) {
            return this;
        }
        this.geometry._softwareSkinningFrameId = this.getScene().getFrameId();
        if (!this.isVerticesDataPresent(VertexBuffer.PositionKind)) {
            return this;
        }
        if (!this.isVerticesDataPresent(VertexBuffer.MatricesIndicesKind)) {
            return this;
        }
        if (!this.isVerticesDataPresent(VertexBuffer.MatricesWeightsKind)) {
            return this;
        }
        var hasNormals = this.isVerticesDataPresent(VertexBuffer.NormalKind);
        var internalDataInfo = this._internalMeshDataInfo;
        if (!internalDataInfo._sourcePositions) {
            var submeshes = this.subMeshes.slice();
            this.setPositionsForCPUSkinning();
            this.subMeshes = submeshes;
        }
        if (hasNormals && !internalDataInfo._sourceNormals) {
            this.setNormalsForCPUSkinning();
        }
        // positionsData checks for not being Float32Array will only pass at most once
        var positionsData = this.getVerticesData(VertexBuffer.PositionKind);
        if (!positionsData) {
            return this;
        }
        if (!(positionsData instanceof Float32Array)) {
            positionsData = new Float32Array(positionsData);
        }
        // normalsData checks for not being Float32Array will only pass at most once
        var normalsData = this.getVerticesData(VertexBuffer.NormalKind);
        if (hasNormals) {
            if (!normalsData) {
                return this;
            }
            if (!(normalsData instanceof Float32Array)) {
                normalsData = new Float32Array(normalsData);
            }
        }
        var matricesIndicesData = this.getVerticesData(VertexBuffer.MatricesIndicesKind);
        var matricesWeightsData = this.getVerticesData(VertexBuffer.MatricesWeightsKind);
        if (!matricesWeightsData || !matricesIndicesData) {
            return this;
        }
        var needExtras = this.numBoneInfluencers > 4;
        var matricesIndicesExtraData = needExtras ? this.getVerticesData(VertexBuffer.MatricesIndicesExtraKind) : null;
        var matricesWeightsExtraData = needExtras ? this.getVerticesData(VertexBuffer.MatricesWeightsExtraKind) : null;
        var skeletonMatrices = skeleton.getTransformMatrices(this);
        var tempVector3 = Vector3.Zero();
        var finalMatrix = new Matrix();
        var tempMatrix = new Matrix();
        var matWeightIdx = 0;
        var inf;
        for (var index = 0; index < positionsData.length; index += 3, matWeightIdx += 4) {
            var weight = void 0;
            for (inf = 0; inf < 4; inf++) {
                weight = matricesWeightsData[matWeightIdx + inf];
                if (weight > 0) {
                    Matrix.FromFloat32ArrayToRefScaled(skeletonMatrices, Math.floor(matricesIndicesData[matWeightIdx + inf] * 16), weight, tempMatrix);
                    finalMatrix.addToSelf(tempMatrix);
                }
            }
            if (needExtras) {
                for (inf = 0; inf < 4; inf++) {
                    weight = matricesWeightsExtraData[matWeightIdx + inf];
                    if (weight > 0) {
                        Matrix.FromFloat32ArrayToRefScaled(skeletonMatrices, Math.floor(matricesIndicesExtraData[matWeightIdx + inf] * 16), weight, tempMatrix);
                        finalMatrix.addToSelf(tempMatrix);
                    }
                }
            }
            Vector3.TransformCoordinatesFromFloatsToRef(internalDataInfo._sourcePositions[index], internalDataInfo._sourcePositions[index + 1], internalDataInfo._sourcePositions[index + 2], finalMatrix, tempVector3);
            tempVector3.toArray(positionsData, index);
            if (hasNormals) {
                Vector3.TransformNormalFromFloatsToRef(internalDataInfo._sourceNormals[index], internalDataInfo._sourceNormals[index + 1], internalDataInfo._sourceNormals[index + 2], finalMatrix, tempVector3);
                tempVector3.toArray(normalsData, index);
            }
            finalMatrix.reset();
        }
        this.updateVerticesData(VertexBuffer.PositionKind, positionsData);
        if (hasNormals) {
            this.updateVerticesData(VertexBuffer.NormalKind, normalsData);
        }
        return this;
    };
    // Tools
    /**
     * Returns an object containing a min and max Vector3 which are the minimum and maximum vectors of each mesh bounding box from the passed array, in the world coordinates
     * @param meshes defines the list of meshes to scan
     * @returns an object `{min:` Vector3`, max:` Vector3`}`
     */
    Mesh.MinMax = function (meshes) {
        var minVector = null;
        var maxVector = null;
        meshes.forEach(function (mesh) {
            var boundingInfo = mesh.getBoundingInfo();
            var boundingBox = boundingInfo.boundingBox;
            if (!minVector || !maxVector) {
                minVector = boundingBox.minimumWorld;
                maxVector = boundingBox.maximumWorld;
            }
            else {
                minVector.minimizeInPlace(boundingBox.minimumWorld);
                maxVector.maximizeInPlace(boundingBox.maximumWorld);
            }
        });
        if (!minVector || !maxVector) {
            return {
                min: Vector3.Zero(),
                max: Vector3.Zero()
            };
        }
        return {
            min: minVector,
            max: maxVector
        };
    };
    /**
     * Returns the center of the `{min:` Vector3`, max:` Vector3`}` or the center of MinMax vector3 computed from a mesh array
     * @param meshesOrMinMaxVector could be an array of meshes or a `{min:` Vector3`, max:` Vector3`}` object
     * @returns a vector3
     */
    Mesh.Center = function (meshesOrMinMaxVector) {
        var minMaxVector = meshesOrMinMaxVector instanceof Array ? Mesh.MinMax(meshesOrMinMaxVector) : meshesOrMinMaxVector;
        return Vector3.Center(minMaxVector.min, minMaxVector.max);
    };
    /**
     * Merge the array of meshes into a single mesh for performance reasons.
     * @param meshes defines he vertices source.  They should all be of the same material.  Entries can empty
     * @param disposeSource when true (default), dispose of the vertices from the source meshes
     * @param allow32BitsIndices when the sum of the vertices > 64k, this must be set to true
     * @param meshSubclass when set, vertices inserted into this Mesh.  Meshes can then be merged into a Mesh sub-class.
     * @param subdivideWithSubMeshes when true (false default), subdivide mesh to his subMesh array with meshes source.
     * @param multiMultiMaterials when true (false default), subdivide mesh and accept multiple multi materials, ignores subdivideWithSubMeshes.
     * @returns a new mesh
     */
    Mesh.MergeMeshes = function (meshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials) {
        if (disposeSource === void 0) { disposeSource = true; }
        return runCoroutineSync(Mesh._MergeMeshesCoroutine(meshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials, false));
    };
    /**
     * Merge the array of meshes into a single mesh for performance reasons.
     * @param meshes defines he vertices source.  They should all be of the same material.  Entries can empty
     * @param disposeSource when true (default), dispose of the vertices from the source meshes
     * @param allow32BitsIndices when the sum of the vertices > 64k, this must be set to true
     * @param meshSubclass when set, vertices inserted into this Mesh.  Meshes can then be merged into a Mesh sub-class.
     * @param subdivideWithSubMeshes when true (false default), subdivide mesh to his subMesh array with meshes source.
     * @param multiMultiMaterials when true (false default), subdivide mesh and accept multiple multi materials, ignores subdivideWithSubMeshes.
     * @returns a new mesh
     */
    Mesh.MergeMeshesAsync = function (meshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials) {
        if (disposeSource === void 0) { disposeSource = true; }
        return runCoroutineAsync(Mesh._MergeMeshesCoroutine(meshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials, true), createYieldingScheduler());
    };
    Mesh._MergeMeshesCoroutine = function (meshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials, isAsync) {
        var index, totalVertices, materialArray, materialIndexArray, indiceArray, currentOverrideMaterialSideOrientation, mesh, material, matIndex, subIndex, subIndex, subIndex, source, getVertexDataFromMesh, _a, sourceVertexData, sourceTransform, meshVertexDatas, i, mergeCoroutine, mergeCoroutineStep, vertexData, applyToCoroutine, applyToCoroutineStep, offset, _i, _b, subMesh, newMultiMaterial, subIndex;
        if (disposeSource === void 0) { disposeSource = true; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Remove any null/undefined entries from the mesh array
                    meshes = meshes.filter(Boolean);
                    if (meshes.length === 0) {
                        return [2 /*return*/, null];
                    }
                    if (!allow32BitsIndices) {
                        totalVertices = 0;
                        // Counting vertices
                        for (index = 0; index < meshes.length; index++) {
                            totalVertices += meshes[index].getTotalVertices();
                            if (totalVertices >= 65536) {
                                Logger.Warn("Cannot merge meshes because resulting mesh will have more than 65536 vertices. Please use allow32BitsIndices = true to use 32 bits indices");
                                return [2 /*return*/, null];
                            }
                        }
                    }
                    if (multiMultiMaterials) {
                        subdivideWithSubMeshes = false;
                    }
                    materialArray = new Array();
                    materialIndexArray = new Array();
                    indiceArray = new Array();
                    currentOverrideMaterialSideOrientation = meshes[0].overrideMaterialSideOrientation;
                    for (index = 0; index < meshes.length; index++) {
                        mesh = meshes[index];
                        if (mesh.isAnInstance) {
                            Logger.Warn("Cannot merge instance meshes.");
                            return [2 /*return*/, null];
                        }
                        if (currentOverrideMaterialSideOrientation !== mesh.overrideMaterialSideOrientation) {
                            Logger.Warn("Cannot merge meshes with different overrideMaterialSideOrientation values.");
                            return [2 /*return*/, null];
                        }
                        if (subdivideWithSubMeshes) {
                            indiceArray.push(mesh.getTotalIndices());
                        }
                        if (multiMultiMaterials) {
                            if (mesh.material) {
                                material = mesh.material;
                                if (material instanceof MultiMaterial) {
                                    for (matIndex = 0; matIndex < material.subMaterials.length; matIndex++) {
                                        if (materialArray.indexOf(material.subMaterials[matIndex]) < 0) {
                                            materialArray.push(material.subMaterials[matIndex]);
                                        }
                                    }
                                    for (subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                                        materialIndexArray.push(materialArray.indexOf(material.subMaterials[mesh.subMeshes[subIndex].materialIndex]));
                                        indiceArray.push(mesh.subMeshes[subIndex].indexCount);
                                    }
                                }
                                else {
                                    if (materialArray.indexOf(material) < 0) {
                                        materialArray.push(material);
                                    }
                                    for (subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                                        materialIndexArray.push(materialArray.indexOf(material));
                                        indiceArray.push(mesh.subMeshes[subIndex].indexCount);
                                    }
                                }
                            }
                            else {
                                for (subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                                    materialIndexArray.push(0);
                                    indiceArray.push(mesh.subMeshes[subIndex].indexCount);
                                }
                            }
                        }
                    }
                    source = meshes[0];
                    getVertexDataFromMesh = function (mesh) {
                        var wm = mesh.computeWorldMatrix(true);
                        var vertexData = VertexData.ExtractFromMesh(mesh, false, false);
                        return [vertexData, wm];
                    };
                    _a = getVertexDataFromMesh(source), sourceVertexData = _a[0], sourceTransform = _a[1];
                    if (!isAsync) return [3 /*break*/, 2];
                    return [4 /*yield*/];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    meshVertexDatas = new Array(meshes.length - 1);
                    i = 1;
                    _c.label = 3;
                case 3:
                    if (!(i < meshes.length)) return [3 /*break*/, 6];
                    meshVertexDatas[i - 1] = getVertexDataFromMesh(meshes[i]);
                    if (!isAsync) return [3 /*break*/, 5];
                    return [4 /*yield*/];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    mergeCoroutine = sourceVertexData._mergeCoroutine(sourceTransform, meshVertexDatas, allow32BitsIndices, isAsync, !disposeSource);
                    mergeCoroutineStep = mergeCoroutine.next();
                    _c.label = 7;
                case 7:
                    if (!!mergeCoroutineStep.done) return [3 /*break*/, 10];
                    if (!isAsync) return [3 /*break*/, 9];
                    return [4 /*yield*/];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    mergeCoroutineStep = mergeCoroutine.next();
                    return [3 /*break*/, 7];
                case 10:
                    vertexData = mergeCoroutineStep.value;
                    if (!meshSubclass) {
                        meshSubclass = new Mesh(source.name + "_merged", source.getScene());
                    }
                    applyToCoroutine = vertexData._applyToCoroutine(meshSubclass, undefined, isAsync);
                    applyToCoroutineStep = applyToCoroutine.next();
                    _c.label = 11;
                case 11:
                    if (!!applyToCoroutineStep.done) return [3 /*break*/, 14];
                    if (!isAsync) return [3 /*break*/, 13];
                    return [4 /*yield*/];
                case 12:
                    _c.sent();
                    _c.label = 13;
                case 13:
                    applyToCoroutineStep = applyToCoroutine.next();
                    return [3 /*break*/, 11];
                case 14:
                    // Setting properties
                    meshSubclass.checkCollisions = source.checkCollisions;
                    meshSubclass.overrideMaterialSideOrientation = source.overrideMaterialSideOrientation;
                    // Cleaning
                    if (disposeSource) {
                        for (index = 0; index < meshes.length; index++) {
                            meshes[index].dispose();
                        }
                    }
                    // Subdivide
                    if (subdivideWithSubMeshes || multiMultiMaterials) {
                        //-- removal of global submesh
                        meshSubclass.releaseSubMeshes();
                        index = 0;
                        offset = 0;
                        //-- apply subdivision according to index table
                        while (index < indiceArray.length) {
                            SubMesh.CreateFromIndices(0, offset, indiceArray[index], meshSubclass, undefined, false);
                            offset += indiceArray[index];
                            index++;
                        }
                        for (_i = 0, _b = meshSubclass.subMeshes; _i < _b.length; _i++) {
                            subMesh = _b[_i];
                            subMesh.refreshBoundingInfo();
                        }
                        meshSubclass.computeWorldMatrix(true);
                    }
                    if (multiMultiMaterials) {
                        newMultiMaterial = new MultiMaterial(source.name + "_merged", source.getScene());
                        newMultiMaterial.subMaterials = materialArray;
                        for (subIndex = 0; subIndex < meshSubclass.subMeshes.length; subIndex++) {
                            meshSubclass.subMeshes[subIndex].materialIndex = materialIndexArray[subIndex];
                        }
                        meshSubclass.material = newMultiMaterial;
                    }
                    else {
                        meshSubclass.material = source.material;
                    }
                    return [2 /*return*/, meshSubclass];
            }
        });
    };
    /**
     * @param instance
     * @hidden
     */
    Mesh.prototype.addInstance = function (instance) {
        instance._indexInSourceMeshInstanceArray = this.instances.length;
        this.instances.push(instance);
    };
    /**
     * @param instance
     * @hidden
     */
    Mesh.prototype.removeInstance = function (instance) {
        // Remove from mesh
        var index = instance._indexInSourceMeshInstanceArray;
        if (index != -1) {
            if (index !== this.instances.length - 1) {
                var last = this.instances[this.instances.length - 1];
                this.instances[index] = last;
                last._indexInSourceMeshInstanceArray = index;
            }
            instance._indexInSourceMeshInstanceArray = -1;
            this.instances.pop();
        }
    };
    /** @hidden */
    Mesh.prototype._shouldConvertRHS = function () {
        return this.overrideMaterialSideOrientation === Material.CounterClockWiseSideOrientation;
    };
    // Consts
    /**
     * Mesh side orientation : usually the external or front surface
     */
    Mesh.FRONTSIDE = VertexData.FRONTSIDE;
    /**
     * Mesh side orientation : usually the internal or back surface
     */
    Mesh.BACKSIDE = VertexData.BACKSIDE;
    /**
     * Mesh side orientation : both internal and external or front and back surfaces
     */
    Mesh.DOUBLESIDE = VertexData.DOUBLESIDE;
    /**
     * Mesh side orientation : by default, `FRONTSIDE`
     */
    Mesh.DEFAULTSIDE = VertexData.DEFAULTSIDE;
    /**
     * Mesh cap setting : no cap
     */
    Mesh.NO_CAP = 0;
    /**
     * Mesh cap setting : one cap at the beginning of the mesh
     */
    Mesh.CAP_START = 1;
    /**
     * Mesh cap setting : one cap at the end of the mesh
     */
    Mesh.CAP_END = 2;
    /**
     * Mesh cap setting : two caps, one at the beginning  and one at the end of the mesh
     */
    Mesh.CAP_ALL = 3;
    /**
     * Mesh pattern setting : no flip or rotate
     */
    Mesh.NO_FLIP = 0;
    /**
     * Mesh pattern setting : flip (reflect in y axis) alternate tiles on each row or column
     */
    Mesh.FLIP_TILE = 1;
    /**
     * Mesh pattern setting : rotate (180degs) alternate tiles on each row or column
     */
    Mesh.ROTATE_TILE = 2;
    /**
     * Mesh pattern setting : flip (reflect in y axis) all tiles on alternate rows
     */
    Mesh.FLIP_ROW = 3;
    /**
     * Mesh pattern setting : rotate (180degs) all tiles on alternate rows
     */
    Mesh.ROTATE_ROW = 4;
    /**
     * Mesh pattern setting : flip and rotate alternate tiles on each row or column
     */
    Mesh.FLIP_N_ROTATE_TILE = 5;
    /**
     * Mesh pattern setting : rotate pattern and rotate
     */
    Mesh.FLIP_N_ROTATE_ROW = 6;
    /**
     * Mesh tile positioning : part tiles same on left/right or top/bottom
     */
    Mesh.CENTER = 0;
    /**
     * Mesh tile positioning : part tiles on left
     */
    Mesh.LEFT = 1;
    /**
     * Mesh tile positioning : part tiles on right
     */
    Mesh.RIGHT = 2;
    /**
     * Mesh tile positioning : part tiles on top
     */
    Mesh.TOP = 3;
    /**
     * Mesh tile positioning : part tiles on bottom
     */
    Mesh.BOTTOM = 4;
    /**
     * Indicates that the instanced meshes should be sorted from back to front before rendering if their material is transparent
     */
    Mesh.INSTANCEDMESH_SORT_TRANSPARENT = false;
    // Statics
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mesh._GroundMeshParser = function (parsedMesh, scene) {
        throw _WarnImport("GroundMesh");
    };
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mesh._GoldbergMeshParser = function (parsedMesh, scene) {
        throw _WarnImport("GoldbergMesh");
    };
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Mesh._LinesMeshParser = function (parsedMesh, scene) {
        throw _WarnImport("LinesMesh");
    };
    return Mesh;
}(AbstractMesh));
export { Mesh };
RegisterClass("BABYLON.Mesh", Mesh);
/**
 * @param id
 * @hidden
 */
Mesh.prototype.setMaterialByID = function (id) {
    return this.setMaterialById(id);
};
Mesh.CreateDisc =
    Mesh.CreateDisc ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateBox =
    Mesh.CreateBox ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateSphere =
    Mesh.CreateSphere ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateCylinder =
    Mesh.CreateCylinder ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateTorusKnot =
    Mesh.CreateTorusKnot ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateTorus =
    Mesh.CreateTorus ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreatePlane =
    Mesh.CreatePlane ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateGround =
    Mesh.CreateGround ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateTiledGround =
    Mesh.CreateTiledGround ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateGroundFromHeightMap =
    Mesh.CreateGroundFromHeightMap ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateTube =
    Mesh.CreateTube ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreatePolyhedron =
    Mesh.CreatePolyhedron ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateIcoSphere =
    Mesh.CreateIcoSphere ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateDecal =
    Mesh.CreateDecal ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.CreateCapsule =
    Mesh.CreateCapsule ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
Mesh.ExtendToGoldberg =
    Mesh.ExtendToGoldberg ||
        (function () {
            throw new Error("Import MeshBuilder to populate this function");
        });
//# sourceMappingURL=mesh.js.map