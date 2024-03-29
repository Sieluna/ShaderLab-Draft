import { SmartArray } from "../Misc/smartArray.js";
import { Logger } from "../Misc/logger.js";
import { EngineStore } from "../Engines/engineStore.js";
import { MorphTarget } from "./morphTarget.js";

import { RawTexture2DArray } from "../Materials/Textures/rawTexture2DArray.js";
/**
 * This class is used to deform meshes using morphing between different targets
 * @see https://doc.babylonjs.com/how_to/how_to_use_morphtargets
 */
var MorphTargetManager = /** @class */ (function () {
    /**
     * Creates a new MorphTargetManager
     * @param scene defines the current scene
     */
    function MorphTargetManager(scene) {
        if (scene === void 0) { scene = null; }
        this._targets = new Array();
        this._targetInfluenceChangedObservers = new Array();
        this._targetDataLayoutChangedObservers = new Array();
        this._activeTargets = new SmartArray(16);
        this._supportsNormals = false;
        this._supportsTangents = false;
        this._supportsUVs = false;
        this._vertexCount = 0;
        this._textureVertexStride = 0;
        this._textureWidth = 0;
        this._textureHeight = 1;
        this._uniqueId = 0;
        this._tempInfluences = new Array();
        this._canUseTextureForTargets = false;
        this._blockCounter = 0;
        /** @hidden */
        this._parentContainer = null;
        /**
         * Gets or sets a boolean indicating if influencers must be optimized (eg. recompiling the shader if less influencers are used)
         */
        this.optimizeInfluencers = true;
        /**
         * Gets or sets a boolean indicating if normals must be morphed
         */
        this.enableNormalMorphing = true;
        /**
         * Gets or sets a boolean indicating if tangents must be morphed
         */
        this.enableTangentMorphing = true;
        /**
         * Gets or sets a boolean indicating if UV must be morphed
         */
        this.enableUVMorphing = true;
        this._useTextureToStoreTargets = true;
        if (!scene) {
            scene = EngineStore.LastCreatedScene;
        }
        this._scene = scene;
        if (this._scene) {
            this._scene.morphTargetManagers.push(this);
            this._uniqueId = this._scene.getUniqueId();
            var engineCaps = this._scene.getEngine().getCaps();
            this._canUseTextureForTargets =
                engineCaps.canUseGLVertexID && engineCaps.textureFloat && engineCaps.maxVertexTextureImageUnits > 0 && engineCaps.texture2DArrayMaxLayerCount > 1;
        }
    }
    Object.defineProperty(MorphTargetManager.prototype, "areUpdatesFrozen", {
        get: function () {
            return this._blockCounter > 0;
        },
        /**
         * Sets a boolean indicating that adding new target or updating an existing target will not update the underlying data buffers
         */
        set: function (block) {
            if (block) {
                this._blockCounter++;
            }
            else {
                this._blockCounter--;
                if (this._blockCounter <= 0) {
                    this._blockCounter = 0;
                    this._syncActiveTargets(true);
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "uniqueId", {
        /**
         * Gets the unique ID of this manager
         */
        get: function () {
            return this._uniqueId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "vertexCount", {
        /**
         * Gets the number of vertices handled by this manager
         */
        get: function () {
            return this._vertexCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "supportsNormals", {
        /**
         * Gets a boolean indicating if this manager supports morphing of normals
         */
        get: function () {
            return this._supportsNormals && this.enableNormalMorphing;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "supportsTangents", {
        /**
         * Gets a boolean indicating if this manager supports morphing of tangents
         */
        get: function () {
            return this._supportsTangents && this.enableTangentMorphing;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "supportsUVs", {
        /**
         * Gets a boolean indicating if this manager supports morphing of texture coordinates
         */
        get: function () {
            return this._supportsUVs && this.enableUVMorphing;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "numTargets", {
        /**
         * Gets the number of targets stored in this manager
         */
        get: function () {
            return this._targets.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "numInfluencers", {
        /**
         * Gets the number of influencers (ie. the number of targets with influences > 0)
         */
        get: function () {
            return this._activeTargets.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "influences", {
        /**
         * Gets the list of influences (one per target)
         */
        get: function () {
            return this._influences;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "useTextureToStoreTargets", {
        /**
         * Gets or sets a boolean indicating that targets should be stored as a texture instead of using vertex attributes (default is true).
         * Please note that this option is not available if the hardware does not support it
         */
        get: function () {
            return this._useTextureToStoreTargets;
        },
        set: function (value) {
            this._useTextureToStoreTargets = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetManager.prototype, "isUsingTextureForTargets", {
        /**
         * Gets a boolean indicating that the targets are stored into a texture (instead of as attributes)
         */
        get: function () {
            return MorphTargetManager.EnableTextureStorage && this.useTextureToStoreTargets && this._canUseTextureForTargets;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the active target at specified index. An active target is a target with an influence > 0
     * @param index defines the index to check
     * @returns the requested target
     */
    MorphTargetManager.prototype.getActiveTarget = function (index) {
        return this._activeTargets.data[index];
    };
    /**
     * Gets the target at specified index
     * @param index defines the index to check
     * @returns the requested target
     */
    MorphTargetManager.prototype.getTarget = function (index) {
        return this._targets[index];
    };
    /**
     * Add a new target to this manager
     * @param target defines the target to add
     */
    MorphTargetManager.prototype.addTarget = function (target) {
        var _this = this;
        this._targets.push(target);
        this._targetInfluenceChangedObservers.push(target.onInfluenceChanged.add(function (needUpdate) {
            _this._syncActiveTargets(needUpdate);
        }));
        this._targetDataLayoutChangedObservers.push(target._onDataLayoutChanged.add(function () {
            _this._syncActiveTargets(true);
        }));
        this._syncActiveTargets(true);
    };
    /**
     * Removes a target from the manager
     * @param target defines the target to remove
     */
    MorphTargetManager.prototype.removeTarget = function (target) {
        var index = this._targets.indexOf(target);
        if (index >= 0) {
            this._targets.splice(index, 1);
            target.onInfluenceChanged.remove(this._targetInfluenceChangedObservers.splice(index, 1)[0]);
            target._onDataLayoutChanged.remove(this._targetDataLayoutChangedObservers.splice(index, 1)[0]);
            this._syncActiveTargets(true);
        }
    };
    /**
     * @param effect
     * @hidden
     */
    MorphTargetManager.prototype._bind = function (effect) {
        effect.setFloat3("morphTargetTextureInfo", this._textureVertexStride, this._textureWidth, this._textureHeight);
        effect.setFloatArray("morphTargetTextureIndices", this._morphTargetTextureIndices);
        effect.setTexture("morphTargets", this._targetStoreTexture);
    };
    /**
     * Clone the current manager
     * @returns a new MorphTargetManager
     */
    MorphTargetManager.prototype.clone = function () {
        var copy = new MorphTargetManager(this._scene);
        for (var _i = 0, _a = this._targets; _i < _a.length; _i++) {
            var target = _a[_i];
            copy.addTarget(target.clone());
        }
        copy.enableNormalMorphing = this.enableNormalMorphing;
        copy.enableTangentMorphing = this.enableTangentMorphing;
        copy.enableUVMorphing = this.enableUVMorphing;
        return copy;
    };
    /**
     * Serializes the current manager into a Serialization object
     * @returns the serialized object
     */
    MorphTargetManager.prototype.serialize = function () {
        var serializationObject = {};
        serializationObject.id = this.uniqueId;
        serializationObject.targets = [];
        for (var _i = 0, _a = this._targets; _i < _a.length; _i++) {
            var target = _a[_i];
            serializationObject.targets.push(target.serialize());
        }
        return serializationObject;
    };
    MorphTargetManager.prototype._syncActiveTargets = function (needUpdate) {
        if (this.areUpdatesFrozen) {
            return;
        }
        var influenceCount = 0;
        this._activeTargets.reset();
        this._supportsNormals = true;
        this._supportsTangents = true;
        this._supportsUVs = true;
        this._vertexCount = 0;
        if (!this._morphTargetTextureIndices || this._morphTargetTextureIndices.length !== this._targets.length) {
            this._morphTargetTextureIndices = new Float32Array(this._targets.length);
        }
        var targetIndex = -1;
        for (var _i = 0, _a = this._targets; _i < _a.length; _i++) {
            var target = _a[_i];
            targetIndex++;
            if (target.influence === 0 && this.optimizeInfluencers) {
                continue;
            }
            this._activeTargets.push(target);
            this._morphTargetTextureIndices[influenceCount] = targetIndex;
            this._tempInfluences[influenceCount++] = target.influence;
            this._supportsNormals = this._supportsNormals && target.hasNormals;
            this._supportsTangents = this._supportsTangents && target.hasTangents;
            this._supportsUVs = this._supportsUVs && target.hasUVs;
            var positions = target.getPositions();
            if (positions) {
                var vertexCount = positions.length / 3;
                if (this._vertexCount === 0) {
                    this._vertexCount = vertexCount;
                }
                else if (this._vertexCount !== vertexCount) {
                    Logger.Error("Incompatible target. Targets must all have the same vertices count.");
                    return;
                }
            }
        }
        if (!this._influences || this._influences.length !== influenceCount) {
            this._influences = new Float32Array(influenceCount);
        }
        for (var index = 0; index < influenceCount; index++) {
            this._influences[index] = this._tempInfluences[index];
        }
        if (needUpdate) {
            this.synchronize();
        }
    };
    /**
     * Synchronize the targets with all the meshes using this morph target manager
     */
    MorphTargetManager.prototype.synchronize = function () {
        if (!this._scene || this.areUpdatesFrozen) {
            return;
        }
        if (this.isUsingTextureForTargets && this._vertexCount) {
            this._textureVertexStride = 1;
            if (this._supportsNormals) {
                this._textureVertexStride++;
            }
            if (this._supportsTangents) {
                this._textureVertexStride++;
            }
            if (this._supportsUVs) {
                this._textureVertexStride++;
            }
            this._textureWidth = this._vertexCount * this._textureVertexStride;
            this._textureHeight = 1;
            var maxTextureSize = this._scene.getEngine().getCaps().maxTextureSize;
            if (this._textureWidth > maxTextureSize) {
                this._textureHeight = Math.ceil(this._textureWidth / maxTextureSize);
                this._textureWidth = maxTextureSize;
            }
            var mustUpdateTexture = true;
            if (this._targetStoreTexture) {
                var textureSize = this._targetStoreTexture.getSize();
                if (textureSize.width === this._textureWidth && textureSize.height === this._textureHeight && this._targetStoreTexture.depth === this._targets.length) {
                    mustUpdateTexture = false;
                }
            }
            if (mustUpdateTexture) {
                if (this._targetStoreTexture) {
                    this._targetStoreTexture.dispose();
                }
                var targetCount = this._targets.length;
                var data = new Float32Array(targetCount * this._textureWidth * this._textureHeight * 4);
                var offset = 0;
                for (var index = 0; index < targetCount; index++) {
                    var target = this._targets[index];
                    var positions = target.getPositions();
                    var normals = target.getNormals();
                    var uvs = target.getUVs();
                    var tangents = target.getTangents();
                    if (!positions) {
                        if (index === 0) {
                            Logger.Error("Invalid morph target. Target must have positions.");
                        }
                        return;
                    }
                    offset = index * this._textureWidth * this._textureHeight * 4;
                    for (var vertex = 0; vertex < this._vertexCount; vertex++) {
                        data[offset] = positions[vertex * 3];
                        data[offset + 1] = positions[vertex * 3 + 1];
                        data[offset + 2] = positions[vertex * 3 + 2];
                        offset += 4;
                        if (normals) {
                            data[offset] = normals[vertex * 3];
                            data[offset + 1] = normals[vertex * 3 + 1];
                            data[offset + 2] = normals[vertex * 3 + 2];
                            offset += 4;
                        }
                        if (uvs) {
                            data[offset] = uvs[vertex * 2];
                            data[offset + 1] = uvs[vertex * 2 + 1];
                            offset += 4;
                        }
                        if (tangents) {
                            data[offset] = tangents[vertex * 3];
                            data[offset + 1] = tangents[vertex * 3 + 1];
                            data[offset + 2] = tangents[vertex * 3 + 2];
                            offset += 4;
                        }
                    }
                }
                this._targetStoreTexture = RawTexture2DArray.CreateRGBATexture(data, this._textureWidth, this._textureHeight, targetCount, this._scene, false, false, 1, 1);
            }
        }
        // Flag meshes as dirty to resync with the active targets
        for (var _i = 0, _a = this._scene.meshes; _i < _a.length; _i++) {
            var mesh = _a[_i];
            if (mesh.morphTargetManager === this) {
                mesh._syncGeometryWithMorphTargetManager();
            }
        }
    };
    /**
     * Release all resources
     */
    MorphTargetManager.prototype.dispose = function () {
        if (this._targetStoreTexture) {
            this._targetStoreTexture.dispose();
        }
        this._targetStoreTexture = null;
        // Remove from scene
        if (this._scene) {
            this._scene.removeMorphTargetManager(this);
            if (this._parentContainer) {
                var index = this._parentContainer.morphTargetManagers.indexOf(this);
                if (index > -1) {
                    this._parentContainer.morphTargetManagers.splice(index, 1);
                }
                this._parentContainer = null;
            }
        }
    };
    // Statics
    /**
     * Creates a new MorphTargetManager from serialized data
     * @param serializationObject defines the serialized data
     * @param scene defines the hosting scene
     * @returns the new MorphTargetManager
     */
    MorphTargetManager.Parse = function (serializationObject, scene) {
        var result = new MorphTargetManager(scene);
        result._uniqueId = serializationObject.id;
        for (var _i = 0, _a = serializationObject.targets; _i < _a.length; _i++) {
            var targetData = _a[_i];
            result.addTarget(MorphTarget.Parse(targetData, scene));
        }
        return result;
    };
    /** Enable storing morph target data into textures when set to true (true by default) */
    MorphTargetManager.EnableTextureStorage = true;
    return MorphTargetManager;
}());
export { MorphTargetManager };
//# sourceMappingURL=morphTargetManager.js.map