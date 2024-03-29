import { VertexBuffer } from "../Buffers/buffer.js";
import { IntersectionInfo } from "../Collisions/intersectionInfo.js";
import { BoundingInfo } from "../Culling/boundingInfo.js";

import { extractMinAndMaxIndexed } from "../Maths/math.functions.js";
import { DrawWrapper } from "../Materials/drawWrapper.js";
/**
 * Defines a subdivision inside a mesh
 */
var SubMesh = /** @class */ (function () {
    /**
     * Creates a new submesh
     * @param materialIndex defines the material index to use
     * @param verticesStart defines vertex index start
     * @param verticesCount defines vertices count
     * @param indexStart defines index start
     * @param indexCount defines indices count
     * @param mesh defines the parent mesh
     * @param renderingMesh defines an optional rendering mesh
     * @param createBoundingBox defines if bounding box should be created for this submesh
     * @param addToMesh defines a boolean indicating that the submesh must be added to the mesh.subMeshes array (true by default)
     */
    function SubMesh(
    /** the material index to use */
    materialIndex, 
    /** vertex index start */
    verticesStart, 
    /** vertices count */
    verticesCount, 
    /** index start */
    indexStart, 
    /** indices count */
    indexCount, mesh, renderingMesh, createBoundingBox, addToMesh) {
        if (createBoundingBox === void 0) { createBoundingBox = true; }
        if (addToMesh === void 0) { addToMesh = true; }
        this.materialIndex = materialIndex;
        this.verticesStart = verticesStart;
        this.verticesCount = verticesCount;
        this.indexStart = indexStart;
        this.indexCount = indexCount;
        this._mainDrawWrapperOverride = null;
        /** @hidden */
        this._linesIndexCount = 0;
        this._linesIndexBuffer = null;
        /** @hidden */
        this._lastColliderWorldVertices = null;
        /** @hidden */
        this._lastColliderTransformMatrix = null;
        /** @hidden */
        this._renderId = 0;
        /** @hidden */
        this._alphaIndex = 0;
        /** @hidden */
        this._distanceToCamera = 0;
        this._currentMaterial = null;
        this._mesh = mesh;
        this._renderingMesh = renderingMesh || mesh;
        if (addToMesh) {
            mesh.subMeshes.push(this);
        }
        this._engine = this._mesh.getScene().getEngine();
        this.resetDrawCache();
        this._trianglePlanes = [];
        this._id = mesh.subMeshes.length - 1;
        if (createBoundingBox) {
            this.refreshBoundingInfo();
            mesh.computeWorldMatrix(true);
        }
    }
    Object.defineProperty(SubMesh.prototype, "materialDefines", {
        /**
         * Gets material defines used by the effect associated to the sub mesh
         */
        get: function () {
            var _a;
            return this._mainDrawWrapperOverride ? this._mainDrawWrapperOverride.defines : (_a = this._getDrawWrapper()) === null || _a === void 0 ? void 0 : _a.defines;
        },
        /**
         * Sets material defines used by the effect associated to the sub mesh
         */
        set: function (defines) {
            var _a;
            var drawWrapper = (_a = this._mainDrawWrapperOverride) !== null && _a !== void 0 ? _a : this._getDrawWrapper(undefined, true);
            drawWrapper.defines = defines;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param passId
     * @param createIfNotExisting
     * @hidden
     */
    SubMesh.prototype._getDrawWrapper = function (passId, createIfNotExisting) {
        if (createIfNotExisting === void 0) { createIfNotExisting = false; }
        passId = passId !== null && passId !== void 0 ? passId : this._engine.currentRenderPassId;
        var drawWrapper = this._drawWrappers[passId];
        if (!drawWrapper && createIfNotExisting) {
            this._drawWrappers[passId] = drawWrapper = new DrawWrapper(this._mesh.getScene().getEngine());
        }
        return drawWrapper;
    };
    /**
     * @param passId
     * @param disposeWrapper
     * @hidden
     */
    SubMesh.prototype._removeDrawWrapper = function (passId, disposeWrapper) {
        var _a;
        if (disposeWrapper === void 0) { disposeWrapper = true; }
        if (disposeWrapper) {
            (_a = this._drawWrappers[passId]) === null || _a === void 0 ? void 0 : _a.dispose();
        }
        this._drawWrappers[passId] = undefined;
    };
    Object.defineProperty(SubMesh.prototype, "effect", {
        /**
         * Gets associated (main) effect (possibly the effect override if defined)
         */
        get: function () {
            var _a, _b;
            return this._mainDrawWrapperOverride ? this._mainDrawWrapperOverride.effect : (_b = (_a = this._getDrawWrapper()) === null || _a === void 0 ? void 0 : _a.effect) !== null && _b !== void 0 ? _b : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubMesh.prototype, "_drawWrapper", {
        /** @hidden */
        get: function () {
            var _a;
            return (_a = this._mainDrawWrapperOverride) !== null && _a !== void 0 ? _a : this._getDrawWrapper(undefined, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubMesh.prototype, "_drawWrapperOverride", {
        /** @hidden */
        get: function () {
            return this._mainDrawWrapperOverride;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param wrapper
     * @hidden
     */
    SubMesh.prototype._setMainDrawWrapperOverride = function (wrapper) {
        this._mainDrawWrapperOverride = wrapper;
    };
    /**
     * Sets associated effect (effect used to render this submesh)
     * @param effect defines the effect to associate with
     * @param defines defines the set of defines used to compile this effect
     * @param materialContext material context associated to the effect
     * @param resetContext true to reset the draw context
     */
    SubMesh.prototype.setEffect = function (effect, defines, materialContext, resetContext) {
        if (defines === void 0) { defines = null; }
        if (resetContext === void 0) { resetContext = true; }
        var drawWrapper = this._drawWrapper;
        drawWrapper.setEffect(effect, defines, resetContext);
        if (materialContext !== undefined) {
            drawWrapper.materialContext = materialContext;
        }
        if (!effect) {
            drawWrapper.defines = null;
            drawWrapper.materialContext = undefined;
        }
    };
    /**
     * Resets the draw wrappers cache
     * @param passId If provided, releases only the draw wrapper corresponding to this render pass id
     */
    SubMesh.prototype.resetDrawCache = function (passId) {
        if (this._drawWrappers) {
            if (passId !== undefined) {
                this._removeDrawWrapper(passId);
                return;
            }
            else {
                for (var _i = 0, _a = this._drawWrappers; _i < _a.length; _i++) {
                    var drawWrapper = _a[_i];
                    drawWrapper === null || drawWrapper === void 0 ? void 0 : drawWrapper.dispose();
                }
            }
        }
        this._drawWrappers = [];
    };
    /**
     * Add a new submesh to a mesh
     * @param materialIndex defines the material index to use
     * @param verticesStart defines vertex index start
     * @param verticesCount defines vertices count
     * @param indexStart defines index start
     * @param indexCount defines indices count
     * @param mesh defines the parent mesh
     * @param renderingMesh defines an optional rendering mesh
     * @param createBoundingBox defines if bounding box should be created for this submesh
     * @returns the new submesh
     */
    SubMesh.AddToMesh = function (materialIndex, verticesStart, verticesCount, indexStart, indexCount, mesh, renderingMesh, createBoundingBox) {
        if (createBoundingBox === void 0) { createBoundingBox = true; }
        return new SubMesh(materialIndex, verticesStart, verticesCount, indexStart, indexCount, mesh, renderingMesh, createBoundingBox);
    };
    Object.defineProperty(SubMesh.prototype, "IsGlobal", {
        /**
         * Returns true if this submesh covers the entire parent mesh
         * @ignorenaming
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return this.verticesStart === 0 && this.verticesCount === this._mesh.getTotalVertices() && this.indexStart === 0 && this.indexCount === this._mesh.getTotalIndices();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the submesh BoundingInfo object
     * @returns current bounding info (or mesh's one if the submesh is global)
     */
    SubMesh.prototype.getBoundingInfo = function () {
        if (this.IsGlobal) {
            return this._mesh.getBoundingInfo();
        }
        return this._boundingInfo;
    };
    /**
     * Sets the submesh BoundingInfo
     * @param boundingInfo defines the new bounding info to use
     * @returns the SubMesh
     */
    SubMesh.prototype.setBoundingInfo = function (boundingInfo) {
        this._boundingInfo = boundingInfo;
        return this;
    };
    /**
     * Returns the mesh of the current submesh
     * @return the parent mesh
     */
    SubMesh.prototype.getMesh = function () {
        return this._mesh;
    };
    /**
     * Returns the rendering mesh of the submesh
     * @returns the rendering mesh (could be different from parent mesh)
     */
    SubMesh.prototype.getRenderingMesh = function () {
        return this._renderingMesh;
    };
    /**
     * Returns the replacement mesh of the submesh
     * @returns the replacement mesh (could be different from parent mesh)
     */
    SubMesh.prototype.getReplacementMesh = function () {
        return this._mesh._internalAbstractMeshDataInfo._actAsRegularMesh ? this._mesh : null;
    };
    /**
     * Returns the effective mesh of the submesh
     * @returns the effective mesh (could be different from parent mesh)
     */
    SubMesh.prototype.getEffectiveMesh = function () {
        var replacementMesh = this._mesh._internalAbstractMeshDataInfo._actAsRegularMesh ? this._mesh : null;
        return replacementMesh ? replacementMesh : this._renderingMesh;
    };
    /**
     * Returns the submesh material
     * @returns null or the current material
     */
    SubMesh.prototype.getMaterial = function () {
        var _a;
        var rootMaterial = (_a = this._renderingMesh.getMaterialForRenderPass(this._engine.currentRenderPassId)) !== null && _a !== void 0 ? _a : this._renderingMesh.material;
        if (!rootMaterial) {
            return this._mesh.getScene().defaultMaterial;
        }
        else if (this._isMultiMaterial(rootMaterial)) {
            var effectiveMaterial = rootMaterial.getSubMaterial(this.materialIndex);
            if (this._currentMaterial !== effectiveMaterial) {
                this._currentMaterial = effectiveMaterial;
                this.resetDrawCache();
            }
            return effectiveMaterial;
        }
        return rootMaterial;
    };
    SubMesh.prototype._isMultiMaterial = function (material) {
        return material.getSubMaterial !== undefined;
    };
    // Methods
    /**
     * Sets a new updated BoundingInfo object to the submesh
     * @param data defines an optional position array to use to determine the bounding info
     * @returns the SubMesh
     */
    SubMesh.prototype.refreshBoundingInfo = function (data) {
        if (data === void 0) { data = null; }
        this._lastColliderWorldVertices = null;
        if (this.IsGlobal || !this._renderingMesh || !this._renderingMesh.geometry) {
            return this;
        }
        if (!data) {
            data = this._renderingMesh.getVerticesData(VertexBuffer.PositionKind);
        }
        if (!data) {
            this._boundingInfo = this._mesh.getBoundingInfo();
            return this;
        }
        var indices = this._renderingMesh.getIndices();
        var extend;
        //is this the only submesh?
        if (this.indexStart === 0 && this.indexCount === indices.length) {
            var boundingInfo = this._renderingMesh.getBoundingInfo();
            //the rendering mesh's bounding info can be used, it is the standard submesh for all indices.
            extend = { minimum: boundingInfo.minimum.clone(), maximum: boundingInfo.maximum.clone() };
        }
        else {
            extend = extractMinAndMaxIndexed(data, indices, this.indexStart, this.indexCount, this._renderingMesh.geometry.boundingBias);
        }
        if (this._boundingInfo) {
            this._boundingInfo.reConstruct(extend.minimum, extend.maximum);
        }
        else {
            this._boundingInfo = new BoundingInfo(extend.minimum, extend.maximum);
        }
        return this;
    };
    /**
     * @param collider
     * @hidden
     */
    SubMesh.prototype._checkCollision = function (collider) {
        var boundingInfo = this.getBoundingInfo();
        return boundingInfo._checkCollision(collider);
    };
    /**
     * Updates the submesh BoundingInfo
     * @param world defines the world matrix to use to update the bounding info
     * @returns the submesh
     */
    SubMesh.prototype.updateBoundingInfo = function (world) {
        var boundingInfo = this.getBoundingInfo();
        if (!boundingInfo) {
            this.refreshBoundingInfo();
            boundingInfo = this.getBoundingInfo();
        }
        if (boundingInfo) {
            boundingInfo.update(world);
        }
        return this;
    };
    /**
     * True is the submesh bounding box intersects the frustum defined by the passed array of planes.
     * @param frustumPlanes defines the frustum planes
     * @returns true if the submesh is intersecting with the frustum
     */
    SubMesh.prototype.isInFrustum = function (frustumPlanes) {
        var boundingInfo = this.getBoundingInfo();
        if (!boundingInfo) {
            return false;
        }
        return boundingInfo.isInFrustum(frustumPlanes, this._mesh.cullingStrategy);
    };
    /**
     * True is the submesh bounding box is completely inside the frustum defined by the passed array of planes
     * @param frustumPlanes defines the frustum planes
     * @returns true if the submesh is inside the frustum
     */
    SubMesh.prototype.isCompletelyInFrustum = function (frustumPlanes) {
        var boundingInfo = this.getBoundingInfo();
        if (!boundingInfo) {
            return false;
        }
        return boundingInfo.isCompletelyInFrustum(frustumPlanes);
    };
    /**
     * Renders the submesh
     * @param enableAlphaMode defines if alpha needs to be used
     * @returns the submesh
     */
    SubMesh.prototype.render = function (enableAlphaMode) {
        this._renderingMesh.render(this, enableAlphaMode, this._mesh._internalAbstractMeshDataInfo._actAsRegularMesh ? this._mesh : undefined);
        return this;
    };
    /**
     * @param indices
     * @param engine
     * @hidden
     */
    SubMesh.prototype._getLinesIndexBuffer = function (indices, engine) {
        if (!this._linesIndexBuffer) {
            var linesIndices = [];
            for (var index = this.indexStart; index < this.indexStart + this.indexCount; index += 3) {
                linesIndices.push(indices[index], indices[index + 1], indices[index + 1], indices[index + 2], indices[index + 2], indices[index]);
            }
            this._linesIndexBuffer = engine.createIndexBuffer(linesIndices);
            this._linesIndexCount = linesIndices.length;
        }
        return this._linesIndexBuffer;
    };
    /**
     * Checks if the submesh intersects with a ray
     * @param ray defines the ray to test
     * @returns true is the passed ray intersects the submesh bounding box
     */
    SubMesh.prototype.canIntersects = function (ray) {
        var boundingInfo = this.getBoundingInfo();
        if (!boundingInfo) {
            return false;
        }
        return ray.intersectsBox(boundingInfo.boundingBox);
    };
    /**
     * Intersects current submesh with a ray
     * @param ray defines the ray to test
     * @param positions defines mesh's positions array
     * @param indices defines mesh's indices array
     * @param fastCheck defines if the first intersection will be used (and not the closest)
     * @param trianglePredicate defines an optional predicate used to select faces when a mesh intersection is detected
     * @returns intersection info or null if no intersection
     */
    SubMesh.prototype.intersects = function (ray, positions, indices, fastCheck, trianglePredicate) {
        var material = this.getMaterial();
        if (!material) {
            return null;
        }
        var step = 3;
        var checkStopper = false;
        switch (material.fillMode) {
            case 3:
            case 5:
            case 6:
            case 8:
                return null;
            case 7:
                step = 1;
                checkStopper = true;
                break;
            default:
                break;
        }
        // LineMesh first as it's also a Mesh...
        if (material.fillMode === 4) {
            // Check if mesh is unindexed
            if (!indices.length) {
                return this._intersectUnIndexedLines(ray, positions, indices, this._mesh.intersectionThreshold, fastCheck);
            }
            return this._intersectLines(ray, positions, indices, this._mesh.intersectionThreshold, fastCheck);
        }
        else {
            // Check if mesh is unindexed
            if (!indices.length && this._mesh._unIndexed) {
                return this._intersectUnIndexedTriangles(ray, positions, indices, fastCheck, trianglePredicate);
            }
            return this._intersectTriangles(ray, positions, indices, step, checkStopper, fastCheck, trianglePredicate);
        }
    };
    /**
     * @param ray
     * @param positions
     * @param indices
     * @param intersectionThreshold
     * @param fastCheck
     * @hidden
     */
    SubMesh.prototype._intersectLines = function (ray, positions, indices, intersectionThreshold, fastCheck) {
        var intersectInfo = null;
        // Line test
        for (var index = this.indexStart; index < this.indexStart + this.indexCount; index += 2) {
            var p0 = positions[indices[index]];
            var p1 = positions[indices[index + 1]];
            var length_1 = ray.intersectionSegment(p0, p1, intersectionThreshold);
            if (length_1 < 0) {
                continue;
            }
            if (fastCheck || !intersectInfo || length_1 < intersectInfo.distance) {
                intersectInfo = new IntersectionInfo(null, null, length_1);
                intersectInfo.faceId = index / 2;
                if (fastCheck) {
                    break;
                }
            }
        }
        return intersectInfo;
    };
    /**
     * @param ray
     * @param positions
     * @param indices
     * @param intersectionThreshold
     * @param fastCheck
     * @hidden
     */
    SubMesh.prototype._intersectUnIndexedLines = function (ray, positions, indices, intersectionThreshold, fastCheck) {
        var intersectInfo = null;
        // Line test
        for (var index = this.verticesStart; index < this.verticesStart + this.verticesCount; index += 2) {
            var p0 = positions[index];
            var p1 = positions[index + 1];
            var length_2 = ray.intersectionSegment(p0, p1, intersectionThreshold);
            if (length_2 < 0) {
                continue;
            }
            if (fastCheck || !intersectInfo || length_2 < intersectInfo.distance) {
                intersectInfo = new IntersectionInfo(null, null, length_2);
                intersectInfo.faceId = index / 2;
                if (fastCheck) {
                    break;
                }
            }
        }
        return intersectInfo;
    };
    /**
     * @param ray
     * @param positions
     * @param indices
     * @param step
     * @param checkStopper
     * @param fastCheck
     * @param trianglePredicate
     * @hidden
     */
    SubMesh.prototype._intersectTriangles = function (ray, positions, indices, step, checkStopper, fastCheck, trianglePredicate) {
        var intersectInfo = null;
        // Triangles test
        var faceId = -1;
        for (var index = this.indexStart; index < this.indexStart + this.indexCount - (3 - step); index += step) {
            faceId++;
            var indexA = indices[index];
            var indexB = indices[index + 1];
            var indexC = indices[index + 2];
            if (checkStopper && indexC === 0xffffffff) {
                index += 2;
                continue;
            }
            var p0 = positions[indexA];
            var p1 = positions[indexB];
            var p2 = positions[indexC];
            // stay defensive and don't check against undefined positions.
            if (!p0 || !p1 || !p2) {
                continue;
            }
            if (trianglePredicate && !trianglePredicate(p0, p1, p2, ray)) {
                continue;
            }
            var currentIntersectInfo = ray.intersectsTriangle(p0, p1, p2);
            if (currentIntersectInfo) {
                if (currentIntersectInfo.distance < 0) {
                    continue;
                }
                if (fastCheck || !intersectInfo || currentIntersectInfo.distance < intersectInfo.distance) {
                    intersectInfo = currentIntersectInfo;
                    intersectInfo.faceId = faceId;
                    if (fastCheck) {
                        break;
                    }
                }
            }
        }
        return intersectInfo;
    };
    /**
     * @param ray
     * @param positions
     * @param indices
     * @param fastCheck
     * @param trianglePredicate
     * @hidden
     */
    SubMesh.prototype._intersectUnIndexedTriangles = function (ray, positions, indices, fastCheck, trianglePredicate) {
        var intersectInfo = null;
        // Triangles test
        for (var index = this.verticesStart; index < this.verticesStart + this.verticesCount; index += 3) {
            var p0 = positions[index];
            var p1 = positions[index + 1];
            var p2 = positions[index + 2];
            if (trianglePredicate && !trianglePredicate(p0, p1, p2, ray)) {
                continue;
            }
            var currentIntersectInfo = ray.intersectsTriangle(p0, p1, p2);
            if (currentIntersectInfo) {
                if (currentIntersectInfo.distance < 0) {
                    continue;
                }
                if (fastCheck || !intersectInfo || currentIntersectInfo.distance < intersectInfo.distance) {
                    intersectInfo = currentIntersectInfo;
                    intersectInfo.faceId = index / 3;
                    if (fastCheck) {
                        break;
                    }
                }
            }
        }
        return intersectInfo;
    };
    /** @hidden */
    SubMesh.prototype._rebuild = function () {
        if (this._linesIndexBuffer) {
            this._linesIndexBuffer = null;
        }
    };
    // Clone
    /**
     * Creates a new submesh from the passed mesh
     * @param newMesh defines the new hosting mesh
     * @param newRenderingMesh defines an optional rendering mesh
     * @returns the new submesh
     */
    SubMesh.prototype.clone = function (newMesh, newRenderingMesh) {
        var result = new SubMesh(this.materialIndex, this.verticesStart, this.verticesCount, this.indexStart, this.indexCount, newMesh, newRenderingMesh, false);
        if (!this.IsGlobal) {
            var boundingInfo = this.getBoundingInfo();
            if (!boundingInfo) {
                return result;
            }
            result._boundingInfo = new BoundingInfo(boundingInfo.minimum, boundingInfo.maximum);
        }
        return result;
    };
    // Dispose
    /**
     * Release associated resources
     */
    SubMesh.prototype.dispose = function () {
        if (this._linesIndexBuffer) {
            this._mesh.getScene().getEngine()._releaseBuffer(this._linesIndexBuffer);
            this._linesIndexBuffer = null;
        }
        // Remove from mesh
        var index = this._mesh.subMeshes.indexOf(this);
        this._mesh.subMeshes.splice(index, 1);
        this.resetDrawCache();
    };
    /**
     * Gets the class name
     * @returns the string "SubMesh".
     */
    SubMesh.prototype.getClassName = function () {
        return "SubMesh";
    };
    // Statics
    /**
     * Creates a new submesh from indices data
     * @param materialIndex the index of the main mesh material
     * @param startIndex the index where to start the copy in the mesh indices array
     * @param indexCount the number of indices to copy then from the startIndex
     * @param mesh the main mesh to create the submesh from
     * @param renderingMesh the optional rendering mesh
     * @param createBoundingBox defines if bounding box should be created for this submesh
     * @returns a new submesh
     */
    SubMesh.CreateFromIndices = function (materialIndex, startIndex, indexCount, mesh, renderingMesh, createBoundingBox) {
        if (createBoundingBox === void 0) { createBoundingBox = true; }
        var minVertexIndex = Number.MAX_VALUE;
        var maxVertexIndex = -Number.MAX_VALUE;
        var whatWillRender = renderingMesh || mesh;
        var indices = whatWillRender.getIndices();
        for (var index = startIndex; index < startIndex + indexCount; index++) {
            var vertexIndex = indices[index];
            if (vertexIndex < minVertexIndex) {
                minVertexIndex = vertexIndex;
            }
            if (vertexIndex > maxVertexIndex) {
                maxVertexIndex = vertexIndex;
            }
        }
        return new SubMesh(materialIndex, minVertexIndex, maxVertexIndex - minVertexIndex + 1, startIndex, indexCount, mesh, renderingMesh, createBoundingBox);
    };
    return SubMesh;
}());
export { SubMesh };
//# sourceMappingURL=subMesh.js.map