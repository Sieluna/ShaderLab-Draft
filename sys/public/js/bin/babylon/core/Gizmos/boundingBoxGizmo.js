import { __extends } from "tslib";
import { Observable } from "../Misc/observable.js";
import { Logger } from "../Misc/logger.js";
import { Quaternion, Matrix, Vector3 } from "../Maths/math.vector.js";
import { AbstractMesh } from "../Meshes/abstractMesh.js";
import { CreateSphere } from "../Meshes/Builders/sphereBuilder.js";
import { CreateBox } from "../Meshes/Builders/boxBuilder.js";
import { CreateLines } from "../Meshes/Builders/linesBuilder.js";
import { PointerDragBehavior } from "../Behaviors/Meshes/pointerDragBehavior.js";
import { Gizmo } from "./gizmo.js";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer.js";
import { StandardMaterial } from "../Materials/standardMaterial.js";
import { PivotTools } from "../Misc/pivotTools.js";
import { Color3 } from "../Maths/math.color.js";
import { Epsilon } from "../Maths/math.constants.js";
/**
 * Bounding box gizmo
 */
var BoundingBoxGizmo = /** @class */ (function (_super) {
    __extends(BoundingBoxGizmo, _super);
    /**
     * Creates an BoundingBoxGizmo
     * @param color The color of the gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    function BoundingBoxGizmo(color, gizmoLayer) {
        if (color === void 0) { color = Color3.Gray(); }
        if (gizmoLayer === void 0) { gizmoLayer = UtilityLayerRenderer.DefaultKeepDepthUtilityLayer; }
        var _this = _super.call(this, gizmoLayer) || this;
        _this._boundingDimensions = new Vector3(1, 1, 1);
        _this._renderObserver = null;
        _this._pointerObserver = null;
        _this._scaleDragSpeed = 0.2;
        _this._tmpQuaternion = new Quaternion();
        _this._tmpVector = new Vector3(0, 0, 0);
        _this._tmpRotationMatrix = new Matrix();
        /**
         * If child meshes should be ignored when calculating the bounding box. This should be set to true to avoid perf hits with heavily nested meshes (Default: false)
         */
        _this.ignoreChildren = false;
        /**
         * Returns true if a descendant should be included when computing the bounding box. When null, all descendants are included. If ignoreChildren is set this will be ignored. (Default: null)
         */
        _this.includeChildPredicate = null;
        /**
         * The size of the rotation spheres attached to the bounding box (Default: 0.1)
         */
        _this.rotationSphereSize = 0.1;
        /**
         * The size of the scale boxes attached to the bounding box (Default: 0.1)
         */
        _this.scaleBoxSize = 0.1;
        /**
         * If set, the rotation spheres and scale boxes will increase in size based on the distance away from the camera to have a consistent screen size (Default: false)
         * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
         */
        _this.fixedDragMeshScreenSize = false;
        /**
         * If set, the rotation spheres and scale boxes will increase in size based on the size of the bounding box
         * Note : fixedDragMeshScreenSize takes precedence over fixedDragMeshBoundsSize if both are true
         */
        _this.fixedDragMeshBoundsSize = false;
        /**
         * The distance away from the object which the draggable meshes should appear world sized when fixedDragMeshScreenSize is set to true (default: 10)
         */
        _this.fixedDragMeshScreenSizeDistanceFactor = 10;
        /**
         * Fired when a rotation sphere or scale box is dragged
         */
        _this.onDragStartObservable = new Observable();
        /**
         * Fired when a scale box is dragged
         */
        _this.onScaleBoxDragObservable = new Observable();
        /**
         * Fired when a scale box drag is ended
         */
        _this.onScaleBoxDragEndObservable = new Observable();
        /**
         * Fired when a rotation sphere is dragged
         */
        _this.onRotationSphereDragObservable = new Observable();
        /**
         * Fired when a rotation sphere drag is ended
         */
        _this.onRotationSphereDragEndObservable = new Observable();
        /**
         * Relative bounding box pivot used when scaling the attached node. When null object with scale from the opposite corner. 0.5,0.5,0.5 for center and 0.5,0,0.5 for bottom (Default: null)
         */
        _this.scalePivot = null;
        /**
         * Scale factor used for masking some axis
         */
        _this._axisFactor = new Vector3(1, 1, 1);
        _this._existingMeshScale = new Vector3();
        // Dragging
        _this._dragMesh = null;
        _this._pointerDragBehavior = new PointerDragBehavior();
        // Do not update the gizmo's scale so it has a fixed size to the object its attached to
        _this.updateScale = false;
        _this._anchorMesh = new AbstractMesh("anchor", gizmoLayer.utilityLayerScene);
        // Create Materials
        _this._coloredMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        _this._coloredMaterial.disableLighting = true;
        _this._hoverColoredMaterial = new StandardMaterial("", gizmoLayer.utilityLayerScene);
        _this._hoverColoredMaterial.disableLighting = true;
        // Build bounding box out of lines
        _this._lineBoundingBox = new AbstractMesh("", gizmoLayer.utilityLayerScene);
        _this._lineBoundingBox.rotationQuaternion = new Quaternion();
        var lines = [];
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(_this._boundingDimensions.x, 0, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(0, _this._boundingDimensions.y, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, 0), new Vector3(0, 0, _this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(_this._boundingDimensions.x, 0, 0), new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(_this._boundingDimensions.x, 0, 0), new Vector3(_this._boundingDimensions.x, 0, _this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, _this._boundingDimensions.y, 0), new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, 0)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, _this._boundingDimensions.y, 0), new Vector3(0, _this._boundingDimensions.y, _this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, _this._boundingDimensions.z), new Vector3(_this._boundingDimensions.x, 0, _this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", { points: [new Vector3(0, 0, _this._boundingDimensions.z), new Vector3(0, _this._boundingDimensions.y, _this._boundingDimensions.z)] }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", {
            points: [
                new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, _this._boundingDimensions.z),
                new Vector3(0, _this._boundingDimensions.y, _this._boundingDimensions.z),
            ],
        }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", {
            points: [
                new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, _this._boundingDimensions.z),
                new Vector3(_this._boundingDimensions.x, 0, _this._boundingDimensions.z),
            ],
        }, gizmoLayer.utilityLayerScene));
        lines.push(CreateLines("lines", {
            points: [
                new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, _this._boundingDimensions.z),
                new Vector3(_this._boundingDimensions.x, _this._boundingDimensions.y, 0),
            ],
        }, gizmoLayer.utilityLayerScene));
        lines.forEach(function (l) {
            l.color = color;
            l.position.addInPlace(new Vector3(-_this._boundingDimensions.x / 2, -_this._boundingDimensions.y / 2, -_this._boundingDimensions.z / 2));
            l.isPickable = false;
            _this._lineBoundingBox.addChild(l);
        });
        _this._rootMesh.addChild(_this._lineBoundingBox);
        _this.setColor(color);
        // Create rotation spheres
        _this._rotateSpheresParent = new AbstractMesh("", gizmoLayer.utilityLayerScene);
        _this._rotateSpheresParent.rotationQuaternion = new Quaternion();
        var _loop_1 = function (i) {
            var sphere = CreateSphere("", { diameter: 1 }, gizmoLayer.utilityLayerScene);
            sphere.rotationQuaternion = new Quaternion();
            sphere.material = this_1._coloredMaterial;
            sphere.isNearGrabbable = true;
            // Drag behavior
            var _dragBehavior = new PointerDragBehavior({});
            _dragBehavior.moveAttached = false;
            _dragBehavior.updateDragPlane = false;
            sphere.addBehavior(_dragBehavior);
            var startingTurnDirection = new Vector3(1, 0, 0);
            var totalTurnAmountOfDrag = 0;
            _dragBehavior.onDragStartObservable.add(function () {
                startingTurnDirection.copyFrom(sphere.forward);
                totalTurnAmountOfDrag = 0;
            });
            _dragBehavior.onDragObservable.add(function (event) {
                _this.onRotationSphereDragObservable.notifyObservers({});
                if (_this.attachedMesh) {
                    var originalParent = _this.attachedMesh.parent;
                    if (originalParent && originalParent.scaling && originalParent.scaling.isNonUniformWithinEpsilon(0.001)) {
                        Logger.Warn("BoundingBoxGizmo controls are not supported on child meshes with non-uniform parent scaling");
                        return;
                    }
                    PivotTools._RemoveAndStorePivotPoint(_this.attachedMesh);
                    var worldDragDirection = startingTurnDirection;
                    // Project the world right on to the drag plane
                    var toSub = event.dragPlaneNormal.scale(Vector3.Dot(event.dragPlaneNormal, worldDragDirection));
                    var dragAxis = worldDragDirection.subtract(toSub).normalizeToNew();
                    // project drag delta on to the resulting drag axis and rotate based on that
                    var projectDist = Vector3.Dot(dragAxis, event.delta) < 0 ? Math.abs(event.delta.length()) : -Math.abs(event.delta.length());
                    // Make rotation relative to size of mesh.
                    projectDist = (projectDist / _this._boundingDimensions.length()) * _this._anchorMesh.scaling.length();
                    // Rotate based on axis
                    if (!_this.attachedMesh.rotationQuaternion) {
                        _this.attachedMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(_this.attachedMesh.rotation.y, _this.attachedMesh.rotation.x, _this.attachedMesh.rotation.z);
                    }
                    if (!_this._anchorMesh.rotationQuaternion) {
                        _this._anchorMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(_this._anchorMesh.rotation.y, _this._anchorMesh.rotation.x, _this._anchorMesh.rotation.z);
                    }
                    // Do not allow the object to turn more than a full circle
                    totalTurnAmountOfDrag += projectDist;
                    if (Math.abs(totalTurnAmountOfDrag) <= 2 * Math.PI) {
                        if (i >= 8) {
                            Quaternion.RotationYawPitchRollToRef(0, 0, projectDist, _this._tmpQuaternion);
                        }
                        else if (i >= 4) {
                            Quaternion.RotationYawPitchRollToRef(projectDist, 0, 0, _this._tmpQuaternion);
                        }
                        else {
                            Quaternion.RotationYawPitchRollToRef(0, projectDist, 0, _this._tmpQuaternion);
                        }
                        // Rotate around center of bounding box
                        _this._anchorMesh.addChild(_this.attachedMesh, Gizmo.PreserveScaling);
                        if (_this._anchorMesh.getScene().useRightHandedSystem) {
                            _this._tmpQuaternion.conjugateInPlace();
                        }
                        _this._anchorMesh.rotationQuaternion.multiplyToRef(_this._tmpQuaternion, _this._anchorMesh.rotationQuaternion);
                        _this._anchorMesh.removeChild(_this.attachedMesh, Gizmo.PreserveScaling);
                        _this.attachedMesh.setParent(originalParent, Gizmo.PreserveScaling);
                    }
                    _this.updateBoundingBox();
                    PivotTools._RestorePivotPoint(_this.attachedMesh);
                }
                _this._updateDummy();
            });
            // Selection/deselection
            _dragBehavior.onDragStartObservable.add(function () {
                _this.onDragStartObservable.notifyObservers({});
                _this._selectNode(sphere);
            });
            _dragBehavior.onDragEndObservable.add(function () {
                _this.onRotationSphereDragEndObservable.notifyObservers({});
                _this._selectNode(null);
                _this._updateDummy();
            });
            this_1._rotateSpheresParent.addChild(sphere);
        };
        var this_1 = this;
        for (var i = 0; i < 12; i++) {
            _loop_1(i);
        }
        _this._rootMesh.addChild(_this._rotateSpheresParent);
        // Create scale cubes
        _this._scaleBoxesParent = new AbstractMesh("", gizmoLayer.utilityLayerScene);
        _this._scaleBoxesParent.rotationQuaternion = new Quaternion();
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var _loop_2 = function (k) {
                    // create box for relevant axis
                    var zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                    if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                        return "continue";
                    }
                    var box = CreateBox("", { size: 1 }, gizmoLayer.utilityLayerScene);
                    box.material = this_2._coloredMaterial;
                    box.metadata = zeroAxisCount === 2; // None homogenous scale handle
                    box.isNearGrabbable = true;
                    // Dragging logic
                    var dragAxis = new Vector3(i - 1, j - 1, k - 1).normalize();
                    var _dragBehavior = new PointerDragBehavior({ dragAxis: dragAxis });
                    _dragBehavior.updateDragPlane = false;
                    _dragBehavior.moveAttached = false;
                    box.addBehavior(_dragBehavior);
                    _dragBehavior.onDragObservable.add(function (event) {
                        _this.onScaleBoxDragObservable.notifyObservers({});
                        if (_this.attachedMesh) {
                            var originalParent = _this.attachedMesh.parent;
                            if (originalParent && originalParent.scaling && originalParent.scaling.isNonUniformWithinEpsilon(0.001)) {
                                Logger.Warn("BoundingBoxGizmo controls are not supported on child meshes with non-uniform parent scaling");
                                return;
                            }
                            PivotTools._RemoveAndStorePivotPoint(_this.attachedMesh);
                            var relativeDragDistance = (event.dragDistance / _this._boundingDimensions.length()) * _this._anchorMesh.scaling.length();
                            var deltaScale = new Vector3(relativeDragDistance, relativeDragDistance, relativeDragDistance);
                            if (zeroAxisCount === 2) {
                                // scale on 1 axis when using the anchor box in the face middle
                                deltaScale.x *= Math.abs(dragAxis.x);
                                deltaScale.y *= Math.abs(dragAxis.y);
                                deltaScale.z *= Math.abs(dragAxis.z);
                            }
                            deltaScale.scaleInPlace(_this._scaleDragSpeed);
                            deltaScale.multiplyInPlace(_this._axisFactor);
                            _this.updateBoundingBox();
                            if (_this.scalePivot) {
                                _this.attachedMesh.getWorldMatrix().getRotationMatrixToRef(_this._tmpRotationMatrix);
                                // Move anchor to desired pivot point (Bottom left corner + dimension/2)
                                _this._boundingDimensions.scaleToRef(0.5, _this._tmpVector);
                                Vector3.TransformCoordinatesToRef(_this._tmpVector, _this._tmpRotationMatrix, _this._tmpVector);
                                _this._anchorMesh.position.subtractInPlace(_this._tmpVector);
                                _this._boundingDimensions.multiplyToRef(_this.scalePivot, _this._tmpVector);
                                Vector3.TransformCoordinatesToRef(_this._tmpVector, _this._tmpRotationMatrix, _this._tmpVector);
                                _this._anchorMesh.position.addInPlace(_this._tmpVector);
                            }
                            else {
                                // Scale from the position of the opposite corner
                                box.absolutePosition.subtractToRef(_this._anchorMesh.position, _this._tmpVector);
                                _this._anchorMesh.position.subtractInPlace(_this._tmpVector);
                            }
                            _this._anchorMesh.addChild(_this.attachedMesh, Gizmo.PreserveScaling);
                            _this._anchorMesh.scaling.addInPlace(deltaScale);
                            if (_this._anchorMesh.scaling.x < 0 || _this._anchorMesh.scaling.y < 0 || _this._anchorMesh.scaling.z < 0) {
                                _this._anchorMesh.scaling.subtractInPlace(deltaScale);
                            }
                            _this._anchorMesh.removeChild(_this.attachedMesh, Gizmo.PreserveScaling);
                            _this.attachedMesh.setParent(originalParent, Gizmo.PreserveScaling);
                            PivotTools._RestorePivotPoint(_this.attachedMesh);
                        }
                        _this._updateDummy();
                    });
                    // Selection/deselection
                    _dragBehavior.onDragStartObservable.add(function () {
                        _this.onDragStartObservable.notifyObservers({});
                        _this._selectNode(box);
                    });
                    _dragBehavior.onDragEndObservable.add(function () {
                        _this.onScaleBoxDragEndObservable.notifyObservers({});
                        _this._selectNode(null);
                        _this._updateDummy();
                    });
                    this_2._scaleBoxesParent.addChild(box);
                };
                var this_2 = this;
                for (var k = 0; k < 3; k++) {
                    _loop_2(k);
                }
            }
        }
        _this._rootMesh.addChild(_this._scaleBoxesParent);
        // Hover color change
        var pointerIds = new Array();
        _this._pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add(function (pointerInfo) {
            if (!pointerIds[pointerInfo.event.pointerId]) {
                _this._rotateSpheresParent
                    .getChildMeshes()
                    .concat(_this._scaleBoxesParent.getChildMeshes())
                    .forEach(function (mesh) {
                    if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh == mesh) {
                        pointerIds[pointerInfo.event.pointerId] = mesh;
                        mesh.material = _this._hoverColoredMaterial;
                    }
                });
            }
            else {
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh != pointerIds[pointerInfo.event.pointerId]) {
                    pointerIds[pointerInfo.event.pointerId].material = _this._coloredMaterial;
                    delete pointerIds[pointerInfo.event.pointerId];
                }
            }
        });
        // Update bounding box positions
        _this._renderObserver = _this.gizmoLayer.originalScene.onBeforeRenderObservable.add(function () {
            // Only update the bounding box if scaling has changed
            if (_this.attachedMesh && !_this._existingMeshScale.equals(_this.attachedMesh.scaling)) {
                _this.updateBoundingBox();
            }
            else if (_this.fixedDragMeshScreenSize || _this.fixedDragMeshBoundsSize) {
                _this._updateRotationSpheres();
                _this._updateScaleBoxes();
            }
            // If drag mesh is enabled and dragging, update the attached mesh pose to match the drag mesh
            if (_this._dragMesh && _this.attachedMesh && _this._pointerDragBehavior.dragging) {
                _this._lineBoundingBox.position.rotateByQuaternionToRef(_this._rootMesh.rotationQuaternion, _this._tmpVector);
                _this.attachedMesh.setAbsolutePosition(_this._dragMesh.position.add(_this._tmpVector.scale(-1)));
            }
        });
        _this.updateBoundingBox();
        return _this;
    }
    Object.defineProperty(BoundingBoxGizmo.prototype, "axisFactor", {
        /**
         * Gets the axis factor
         * @returns the Vector3 factor value
         */
        get: function () {
            return this._axisFactor;
        },
        /**
         * Sets the axis factor
         * @param factor the Vector3 value
         */
        set: function (factor) {
            this._axisFactor = factor;
            // update scale cube visibility
            var scaleBoxes = this._scaleBoxesParent.getChildMeshes();
            var index = 0;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    for (var k = 0; k < 3; k++) {
                        var zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                        if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                            continue;
                        }
                        if (scaleBoxes[index]) {
                            var dragAxis = new Vector3(i - 1, j - 1, k - 1);
                            dragAxis.multiplyInPlace(this._axisFactor);
                            scaleBoxes[index].setEnabled(dragAxis.lengthSquared() > Epsilon);
                        }
                        index++;
                    }
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoundingBoxGizmo.prototype, "scaleDragSpeed", {
        /**
         * Gets scale drag speed
         * @returns the scale speed number
         */
        get: function () {
            return this._scaleDragSpeed;
        },
        /**
         * Sets scale drag speed value
         * @param value the new speed value
         */
        set: function (value) {
            this._scaleDragSpeed = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the color of the bounding box gizmo
     * @param color the color to set
     */
    BoundingBoxGizmo.prototype.setColor = function (color) {
        this._coloredMaterial.emissiveColor = color;
        this._hoverColoredMaterial.emissiveColor = color.clone().add(new Color3(0.3, 0.3, 0.3));
        this._lineBoundingBox.getChildren().forEach(function (l) {
            if (l.color) {
                l.color = color;
            }
        });
    };
    BoundingBoxGizmo.prototype._attachedNodeChanged = function (value) {
        var _this = this;
        if (value) {
            // Reset anchor mesh to match attached mesh's scale
            // This is needed to avoid invalid box/sphere position on first drag
            this._anchorMesh.scaling.setAll(1);
            PivotTools._RemoveAndStorePivotPoint(value);
            var originalParent = value.parent;
            this._anchorMesh.addChild(value, Gizmo.PreserveScaling);
            this._anchorMesh.removeChild(value, Gizmo.PreserveScaling);
            value.setParent(originalParent, Gizmo.PreserveScaling);
            PivotTools._RestorePivotPoint(value);
            this.updateBoundingBox();
            value.getChildMeshes(false).forEach(function (m) {
                m.markAsDirty("scaling");
            });
            this.gizmoLayer.utilityLayerScene.onAfterRenderObservable.addOnce(function () {
                _this._updateDummy();
            });
        }
    };
    BoundingBoxGizmo.prototype._selectNode = function (selectedMesh) {
        this._rotateSpheresParent
            .getChildMeshes()
            .concat(this._scaleBoxesParent.getChildMeshes())
            .forEach(function (m) {
            m.isVisible = !selectedMesh || m == selectedMesh;
        });
    };
    /**
     * Updates the bounding box information for the Gizmo
     */
    BoundingBoxGizmo.prototype.updateBoundingBox = function () {
        if (this.attachedMesh) {
            PivotTools._RemoveAndStorePivotPoint(this.attachedMesh);
            // Store original parent
            var originalParent = this.attachedMesh.parent;
            this.attachedMesh.setParent(null, Gizmo.PreserveScaling);
            this._update();
            // Rotate based on axis
            if (!this.attachedMesh.rotationQuaternion) {
                this.attachedMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(this.attachedMesh.rotation.y, this.attachedMesh.rotation.x, this.attachedMesh.rotation.z);
            }
            if (!this._anchorMesh.rotationQuaternion) {
                this._anchorMesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(this._anchorMesh.rotation.y, this._anchorMesh.rotation.x, this._anchorMesh.rotation.z);
            }
            this._anchorMesh.rotationQuaternion.copyFrom(this.attachedMesh.rotationQuaternion);
            // Store original position and reset mesh to origin before computing the bounding box
            this._tmpQuaternion.copyFrom(this.attachedMesh.rotationQuaternion);
            this._tmpVector.copyFrom(this.attachedMesh.position);
            this.attachedMesh.rotationQuaternion.set(0, 0, 0, 1);
            this.attachedMesh.position.set(0, 0, 0);
            // Update bounding dimensions/positions
            var boundingMinMax = this.attachedMesh.getHierarchyBoundingVectors(!this.ignoreChildren, this.includeChildPredicate);
            boundingMinMax.max.subtractToRef(boundingMinMax.min, this._boundingDimensions);
            // Update gizmo to match bounding box scaling and rotation
            // The position set here is the offset from the origin for the boundingbox when the attached mesh is at the origin
            // The position of the gizmo is then set to the attachedMesh in gizmo._update
            this._lineBoundingBox.scaling.copyFrom(this._boundingDimensions);
            this._lineBoundingBox.position.set((boundingMinMax.max.x + boundingMinMax.min.x) / 2, (boundingMinMax.max.y + boundingMinMax.min.y) / 2, (boundingMinMax.max.z + boundingMinMax.min.z) / 2);
            this._rotateSpheresParent.position.copyFrom(this._lineBoundingBox.position);
            this._scaleBoxesParent.position.copyFrom(this._lineBoundingBox.position);
            this._lineBoundingBox.computeWorldMatrix();
            this._anchorMesh.position.copyFrom(this._lineBoundingBox.absolutePosition);
            // Restore position/rotation values
            this.attachedMesh.rotationQuaternion.copyFrom(this._tmpQuaternion);
            this.attachedMesh.position.copyFrom(this._tmpVector);
            // Restore original parent
            this.attachedMesh.setParent(originalParent, Gizmo.PreserveScaling);
        }
        this._updateRotationSpheres();
        this._updateScaleBoxes();
        if (this.attachedMesh) {
            this._existingMeshScale.copyFrom(this.attachedMesh.scaling);
            PivotTools._RestorePivotPoint(this.attachedMesh);
        }
    };
    BoundingBoxGizmo.prototype._updateRotationSpheres = function () {
        var rotateSpheres = this._rotateSpheresParent.getChildMeshes();
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 2; j++) {
                for (var k = 0; k < 2; k++) {
                    var index = i * 4 + j * 2 + k;
                    if (i == 0) {
                        rotateSpheres[index].position.set(this._boundingDimensions.x / 2, this._boundingDimensions.y * j, this._boundingDimensions.z * k);
                        rotateSpheres[index].position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
                        rotateSpheres[index].lookAt(Vector3.Cross(rotateSpheres[index].position.normalizeToNew(), Vector3.Right()).normalizeToNew().add(rotateSpheres[index].position));
                    }
                    if (i == 1) {
                        rotateSpheres[index].position.set(this._boundingDimensions.x * j, this._boundingDimensions.y / 2, this._boundingDimensions.z * k);
                        rotateSpheres[index].position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
                        rotateSpheres[index].lookAt(Vector3.Cross(rotateSpheres[index].position.normalizeToNew(), Vector3.Up()).normalizeToNew().add(rotateSpheres[index].position));
                    }
                    if (i == 2) {
                        rotateSpheres[index].position.set(this._boundingDimensions.x * j, this._boundingDimensions.y * k, this._boundingDimensions.z / 2);
                        rotateSpheres[index].position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
                        rotateSpheres[index].lookAt(Vector3.Cross(rotateSpheres[index].position.normalizeToNew(), Vector3.Forward()).normalizeToNew().add(rotateSpheres[index].position));
                    }
                    if (this.fixedDragMeshScreenSize && this.gizmoLayer.utilityLayerScene.activeCamera) {
                        rotateSpheres[index].absolutePosition.subtractToRef(this.gizmoLayer.utilityLayerScene.activeCamera.position, this._tmpVector);
                        var distanceFromCamera = (this.rotationSphereSize * this._tmpVector.length()) / this.fixedDragMeshScreenSizeDistanceFactor;
                        rotateSpheres[index].scaling.set(distanceFromCamera, distanceFromCamera, distanceFromCamera);
                    }
                    else if (this.fixedDragMeshBoundsSize) {
                        rotateSpheres[index].scaling.set(this.rotationSphereSize * this._boundingDimensions.x, this.rotationSphereSize * this._boundingDimensions.y, this.rotationSphereSize * this._boundingDimensions.z);
                    }
                    else {
                        rotateSpheres[index].scaling.set(this.rotationSphereSize, this.rotationSphereSize, this.rotationSphereSize);
                    }
                }
            }
        }
    };
    BoundingBoxGizmo.prototype._updateScaleBoxes = function () {
        var scaleBoxes = this._scaleBoxesParent.getChildMeshes();
        var index = 0;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    var zeroAxisCount = (i === 1 ? 1 : 0) + (j === 1 ? 1 : 0) + (k === 1 ? 1 : 0);
                    if (zeroAxisCount === 1 || zeroAxisCount === 3) {
                        continue;
                    }
                    if (scaleBoxes[index]) {
                        scaleBoxes[index].position.set(this._boundingDimensions.x * (i / 2), this._boundingDimensions.y * (j / 2), this._boundingDimensions.z * (k / 2));
                        scaleBoxes[index].position.addInPlace(new Vector3(-this._boundingDimensions.x / 2, -this._boundingDimensions.y / 2, -this._boundingDimensions.z / 2));
                        if (this.fixedDragMeshScreenSize && this.gizmoLayer.utilityLayerScene.activeCamera) {
                            scaleBoxes[index].absolutePosition.subtractToRef(this.gizmoLayer.utilityLayerScene.activeCamera.position, this._tmpVector);
                            var distanceFromCamera = (this.scaleBoxSize * this._tmpVector.length()) / this.fixedDragMeshScreenSizeDistanceFactor;
                            scaleBoxes[index].scaling.set(distanceFromCamera, distanceFromCamera, distanceFromCamera);
                        }
                        else if (this.fixedDragMeshBoundsSize) {
                            scaleBoxes[index].scaling.set(this.scaleBoxSize * this._boundingDimensions.x, this.scaleBoxSize * this._boundingDimensions.y, this.scaleBoxSize * this._boundingDimensions.z);
                        }
                        else {
                            scaleBoxes[index].scaling.set(this.scaleBoxSize, this.scaleBoxSize, this.scaleBoxSize);
                        }
                    }
                    index++;
                }
            }
        }
    };
    /**
     * Enables rotation on the specified axis and disables rotation on the others
     * @param axis The list of axis that should be enabled (eg. "xy" or "xyz")
     */
    BoundingBoxGizmo.prototype.setEnabledRotationAxis = function (axis) {
        this._rotateSpheresParent.getChildMeshes().forEach(function (m, i) {
            if (i < 4) {
                m.setEnabled(axis.indexOf("x") != -1);
            }
            else if (i < 8) {
                m.setEnabled(axis.indexOf("y") != -1);
            }
            else {
                m.setEnabled(axis.indexOf("z") != -1);
            }
        });
    };
    /**
     * Enables/disables scaling
     * @param enable if scaling should be enabled
     * @param homogeneousScaling defines if scaling should only be homogeneous
     */
    BoundingBoxGizmo.prototype.setEnabledScaling = function (enable, homogeneousScaling) {
        if (homogeneousScaling === void 0) { homogeneousScaling = false; }
        this._scaleBoxesParent.getChildMeshes().forEach(function (m) {
            var enableMesh = enable;
            // Disable heterogeneous scale handles if requested.
            if (homogeneousScaling && m.metadata === true) {
                enableMesh = false;
            }
            m.setEnabled(enableMesh);
        });
    };
    BoundingBoxGizmo.prototype._updateDummy = function () {
        if (this._dragMesh) {
            this._dragMesh.position.copyFrom(this._lineBoundingBox.getAbsolutePosition());
            this._dragMesh.scaling.copyFrom(this._lineBoundingBox.scaling);
            this._dragMesh.rotationQuaternion.copyFrom(this._rootMesh.rotationQuaternion);
        }
    };
    /**
     * Enables a pointer drag behavior on the bounding box of the gizmo
     */
    BoundingBoxGizmo.prototype.enableDragBehavior = function () {
        this._dragMesh = CreateBox("dummy", { size: 1 }, this.gizmoLayer.utilityLayerScene);
        this._dragMesh.visibility = 0;
        this._dragMesh.rotationQuaternion = new Quaternion();
        this._pointerDragBehavior.useObjectOrientationForDragging = false;
        this._dragMesh.addBehavior(this._pointerDragBehavior);
    };
    /**
     * Disposes of the gizmo
     */
    BoundingBoxGizmo.prototype.dispose = function () {
        this.gizmoLayer.utilityLayerScene.onPointerObservable.remove(this._pointerObserver);
        this.gizmoLayer.originalScene.onBeforeRenderObservable.remove(this._renderObserver);
        this._lineBoundingBox.dispose();
        this._rotateSpheresParent.dispose();
        this._scaleBoxesParent.dispose();
        if (this._dragMesh) {
            this._dragMesh.dispose();
        }
        _super.prototype.dispose.call(this);
    };
    /**
     * Makes a mesh not pickable and wraps the mesh inside of a bounding box mesh that is pickable. (This is useful to avoid picking within complex geometry)
     * @param mesh the mesh to wrap in the bounding box mesh and make not pickable
     * @returns the bounding box mesh with the passed in mesh as a child
     */
    BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox = function (mesh) {
        var makeNotPickable = function (root) {
            root.isPickable = false;
            root.getChildMeshes().forEach(function (c) {
                makeNotPickable(c);
            });
        };
        makeNotPickable(mesh);
        // Reset position to get bounding box from origin with no rotation
        if (!mesh.rotationQuaternion) {
            mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z);
        }
        var oldPos = mesh.position.clone();
        var oldRot = mesh.rotationQuaternion.clone();
        mesh.rotationQuaternion.set(0, 0, 0, 1);
        mesh.position.set(0, 0, 0);
        // Update bounding dimensions/positions
        var box = CreateBox("box", { size: 1 }, mesh.getScene());
        var boundingMinMax = mesh.getHierarchyBoundingVectors();
        boundingMinMax.max.subtractToRef(boundingMinMax.min, box.scaling);
        // Adjust scale to avoid undefined behavior when adding child
        if (box.scaling.y === 0) {
            box.scaling.y = Epsilon;
        }
        if (box.scaling.x === 0) {
            box.scaling.x = Epsilon;
        }
        if (box.scaling.z === 0) {
            box.scaling.z = Epsilon;
        }
        box.position.set((boundingMinMax.max.x + boundingMinMax.min.x) / 2, (boundingMinMax.max.y + boundingMinMax.min.y) / 2, (boundingMinMax.max.z + boundingMinMax.min.z) / 2);
        // Restore original positions
        mesh.addChild(box);
        mesh.rotationQuaternion.copyFrom(oldRot);
        mesh.position.copyFrom(oldPos);
        // Reverse parenting
        mesh.removeChild(box);
        box.addChild(mesh);
        box.visibility = 0;
        return box;
    };
    /**
     * CustomMeshes are not supported by this gizmo
     */
    BoundingBoxGizmo.prototype.setCustomMesh = function () {
        Logger.Error("Custom meshes are not supported on this gizmo");
    };
    return BoundingBoxGizmo;
}(Gizmo));
export { BoundingBoxGizmo };
//# sourceMappingURL=boundingBoxGizmo.js.map