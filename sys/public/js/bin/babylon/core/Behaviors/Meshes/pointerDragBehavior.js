import { Mesh } from "../../Meshes/mesh.js";
import { Scene } from "../../scene.js";
import { Observable } from "../../Misc/observable.js";
import { Vector3 } from "../../Maths/math.vector.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Ray } from "../../Culling/ray.js";
import { PivotTools } from "../../Misc/pivotTools.js";
import { CreatePlane } from "../../Meshes/Builders/planeBuilder.js";
/**
 * A behavior that when attached to a mesh will allow the mesh to be dragged around the screen based on pointer events
 */
var PointerDragBehavior = /** @class */ (function () {
    /**
     * Creates a pointer drag behavior that can be attached to a mesh
     * @param options The drag axis or normal of the plane that will be dragged across. If no options are specified the drag plane will always face the ray's origin (eg. camera)
     * @param options.dragAxis
     * @param options.dragPlaneNormal
     */
    function PointerDragBehavior(options) {
        this._useAlternatePickedPointAboveMaxDragAngleDragSpeed = -1.1;
        this._activeDragButton = -1;
        /**
         * The maximum tolerated angle between the drag plane and dragging pointer rays to trigger pointer events. Set to 0 to allow any angle (default: 0)
         */
        this.maxDragAngle = 0;
        /**
         * Butttons that can be used to initiate a drag
         */
        this.dragButtons = [0, 1, 2];
        /**
         * @hidden
         */
        this._useAlternatePickedPointAboveMaxDragAngle = false;
        /**
         * The id of the pointer that is currently interacting with the behavior (-1 when no pointer is active)
         */
        this.currentDraggingPointerId = -1;
        /**
         * If the behavior is currently in a dragging state
         */
        this.dragging = false;
        /**
         * The distance towards the target drag position to move each frame. This can be useful to avoid jitter. Set this to 1 for no delay. (Default: 0.2)
         */
        this.dragDeltaRatio = 0.2;
        /**
         * If the drag plane orientation should be updated during the dragging (Default: true)
         */
        this.updateDragPlane = true;
        // Debug mode will display drag planes to help visualize behavior
        this._debugMode = false;
        this._moving = false;
        /**
         *  Fires each time the attached mesh is dragged with the pointer
         *  * delta between last drag position and current drag position in world space
         *  * dragDistance along the drag axis
         *  * dragPlaneNormal normal of the current drag plane used during the drag
         *  * dragPlanePoint in world space where the drag intersects the drag plane
         */
        this.onDragObservable = new Observable();
        /**
         *  Fires each time a drag begins (eg. mouse down on mesh)
         */
        this.onDragStartObservable = new Observable();
        /**
         *  Fires each time a drag ends (eg. mouse release after drag)
         */
        this.onDragEndObservable = new Observable();
        /**
         *  Fires each time behavior enabled state changes
         */
        this.onEnabledObservable = new Observable();
        /**
         *  If the attached mesh should be moved when dragged
         */
        this.moveAttached = true;
        this._enabled = true;
        /**
         * If pointer events should start and release the drag (Default: true)
         */
        this.startAndReleaseDragOnPointerEvents = true;
        /**
         * If camera controls should be detached during the drag
         */
        this.detachCameraControls = true;
        /**
         * If set, the drag plane/axis will be rotated based on the attached mesh's world rotation (Default: true)
         */
        this.useObjectOrientationForDragging = true;
        /**
         * Predicate to determine if it is valid to move the object to a new position when it is moved
         * @param targetPosition
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.validateDrag = function (targetPosition) {
            return true;
        };
        this._tmpVector = new Vector3(0, 0, 0);
        this._alternatePickedPoint = new Vector3(0, 0, 0);
        this._worldDragAxis = new Vector3(0, 0, 0);
        this._targetPosition = new Vector3(0, 0, 0);
        this._attachedToElement = false;
        this._startDragRay = new Ray(new Vector3(), new Vector3());
        this._lastPointerRay = {};
        this._dragDelta = new Vector3();
        // Variables to avoid instantiation in the below method
        this._pointA = new Vector3(0, 0, 0);
        this._pointC = new Vector3(0, 0, 0);
        this._localAxis = new Vector3(0, 0, 0);
        this._lookAt = new Vector3(0, 0, 0);
        this._options = options ? options : {};
        var optionCount = 0;
        if (this._options.dragAxis) {
            optionCount++;
        }
        if (this._options.dragPlaneNormal) {
            optionCount++;
        }
        if (optionCount > 1) {
            throw "Multiple drag modes specified in dragBehavior options. Only one expected";
        }
    }
    Object.defineProperty(PointerDragBehavior.prototype, "currentDraggingPointerID", {
        /**
         * Get or set the currentDraggingPointerId
         * @deprecated Please use currentDraggingPointerId instead
         */
        get: function () {
            return this.currentDraggingPointerId;
        },
        set: function (currentDraggingPointerID) {
            this.currentDraggingPointerId = currentDraggingPointerID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerDragBehavior.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        /**
         *  If the drag behavior will react to drag events (Default: true)
         */
        set: function (value) {
            if (value != this._enabled) {
                this.onEnabledObservable.notifyObservers(value);
            }
            this._enabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerDragBehavior.prototype, "options", {
        /**
         * Gets the options used by the behavior
         */
        get: function () {
            return this._options;
        },
        /**
         * Sets the options used by the behavior
         */
        set: function (options) {
            this._options = options;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PointerDragBehavior.prototype, "name", {
        /**
         *  The name of the behavior
         */
        get: function () {
            return "PointerDrag";
        },
        enumerable: false,
        configurable: true
    });
    /**
     *  Initializes the behavior
     */
    PointerDragBehavior.prototype.init = function () { };
    /**
     * Attaches the drag behavior the passed in mesh
     * @param ownerNode The mesh that will be dragged around once attached
     * @param predicate Predicate to use for pick filtering
     */
    PointerDragBehavior.prototype.attach = function (ownerNode, predicate) {
        var _this = this;
        this._scene = ownerNode.getScene();
        ownerNode.isNearGrabbable = true;
        this.attachedNode = ownerNode;
        // Initialize drag plane to not interfere with existing scene
        if (!PointerDragBehavior._PlaneScene) {
            if (this._debugMode) {
                PointerDragBehavior._PlaneScene = this._scene;
            }
            else {
                PointerDragBehavior._PlaneScene = new Scene(this._scene.getEngine(), { virtual: true });
                PointerDragBehavior._PlaneScene.detachControl();
                this._scene.onDisposeObservable.addOnce(function () {
                    PointerDragBehavior._PlaneScene.dispose();
                    PointerDragBehavior._PlaneScene = null;
                });
            }
        }
        this._dragPlane = CreatePlane("pointerDragPlane", { size: this._debugMode ? 1 : 10000, updatable: false, sideOrientation: Mesh.DOUBLESIDE }, PointerDragBehavior._PlaneScene);
        // State of the drag
        this.lastDragPosition = new Vector3(0, 0, 0);
        var pickPredicate = predicate
            ? predicate
            : function (m) {
                return _this.attachedNode == m || m.isDescendantOf(_this.attachedNode);
            };
        this._pointerObserver = this._scene.onPointerObservable.add(function (pointerInfo) {
            if (!_this.enabled) {
                // If behavior is disabled before releaseDrag is ever called, call it now.
                if (_this._attachedToElement) {
                    _this.releaseDrag();
                    _this._activeDragButton = -1;
                }
                return;
            }
            if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
                if (_this.startAndReleaseDragOnPointerEvents &&
                    !_this.dragging &&
                    pointerInfo.pickInfo &&
                    pointerInfo.pickInfo.hit &&
                    pointerInfo.pickInfo.pickedMesh &&
                    pointerInfo.pickInfo.pickedPoint &&
                    pointerInfo.pickInfo.ray &&
                    pickPredicate(pointerInfo.pickInfo.pickedMesh)) {
                    if (_this._activeDragButton === -1 && _this.dragButtons.indexOf(pointerInfo.event.button) !== -1) {
                        _this._activeDragButton = pointerInfo.event.button;
                        _this._startDrag(pointerInfo.event.pointerId, pointerInfo.pickInfo.ray, pointerInfo.pickInfo.pickedPoint);
                    }
                }
            }
            else if (pointerInfo.type == PointerEventTypes.POINTERUP) {
                if (_this.startAndReleaseDragOnPointerEvents &&
                    _this.currentDraggingPointerId == pointerInfo.event.pointerId &&
                    _this._activeDragButton === pointerInfo.event.button) {
                    _this.releaseDrag();
                    _this._activeDragButton = -1;
                }
            }
            else if (pointerInfo.type == PointerEventTypes.POINTERMOVE) {
                var pointerId = pointerInfo.event.pointerId;
                // If drag was started with anyMouseID specified, set pointerID to the next mouse that moved
                if (_this.currentDraggingPointerId === PointerDragBehavior._AnyMouseId && pointerId !== PointerDragBehavior._AnyMouseId) {
                    var evt = pointerInfo.event;
                    var isMouseEvent = evt.pointerType === "mouse" || (!_this._scene.getEngine().hostInformation.isMobile && evt instanceof MouseEvent);
                    if (isMouseEvent) {
                        if (_this._lastPointerRay[_this.currentDraggingPointerId]) {
                            _this._lastPointerRay[pointerId] = _this._lastPointerRay[_this.currentDraggingPointerId];
                            delete _this._lastPointerRay[_this.currentDraggingPointerId];
                        }
                        _this.currentDraggingPointerId = pointerId;
                    }
                }
                // Keep track of last pointer ray, this is used simulating the start of a drag in startDrag()
                if (!_this._lastPointerRay[pointerId]) {
                    _this._lastPointerRay[pointerId] = new Ray(new Vector3(), new Vector3());
                }
                if (pointerInfo.pickInfo && pointerInfo.pickInfo.ray) {
                    _this._lastPointerRay[pointerId].origin.copyFrom(pointerInfo.pickInfo.ray.origin);
                    _this._lastPointerRay[pointerId].direction.copyFrom(pointerInfo.pickInfo.ray.direction);
                    if (_this.currentDraggingPointerId == pointerId && _this.dragging) {
                        _this._moveDrag(pointerInfo.pickInfo.ray);
                    }
                }
            }
        });
        this._beforeRenderObserver = this._scene.onBeforeRenderObservable.add(function () {
            if (_this._moving && _this.moveAttached) {
                var needMatrixUpdate = false;
                PivotTools._RemoveAndStorePivotPoint(_this.attachedNode);
                // Slowly move mesh to avoid jitter
                _this._targetPosition.subtractToRef(_this.attachedNode.absolutePosition, _this._tmpVector);
                _this._tmpVector.scaleInPlace(_this.dragDeltaRatio);
                _this.attachedNode.getAbsolutePosition().addToRef(_this._tmpVector, _this._tmpVector);
                if (_this.validateDrag(_this._tmpVector)) {
                    _this.attachedNode.setAbsolutePosition(_this._tmpVector);
                    needMatrixUpdate = true;
                }
                PivotTools._RestorePivotPoint(_this.attachedNode);
                if (needMatrixUpdate) {
                    _this.attachedNode.computeWorldMatrix();
                }
            }
        });
    };
    /**
     * Force release the drag action by code.
     */
    PointerDragBehavior.prototype.releaseDrag = function () {
        if (this.dragging) {
            this.dragging = false;
            this.onDragEndObservable.notifyObservers({ dragPlanePoint: this.lastDragPosition, pointerId: this.currentDraggingPointerId });
        }
        this.currentDraggingPointerId = -1;
        this._moving = false;
        // Reattach camera controls
        if (this.detachCameraControls && this._attachedToElement && this._scene.activeCamera && !this._scene.activeCamera.leftCamera) {
            if (this._scene.activeCamera.getClassName() === "ArcRotateCamera") {
                var arcRotateCamera = this._scene.activeCamera;
                arcRotateCamera.attachControl(arcRotateCamera.inputs ? arcRotateCamera.inputs.noPreventDefault : true, arcRotateCamera._useCtrlForPanning, arcRotateCamera._panningMouseButton);
            }
            else {
                this._scene.activeCamera.attachControl(this._scene.activeCamera.inputs ? this._scene.activeCamera.inputs.noPreventDefault : true);
            }
            this._attachedToElement = false;
        }
    };
    /**
     * Simulates the start of a pointer drag event on the behavior
     * @param pointerId pointerID of the pointer that should be simulated (Default: Any mouse pointer ID)
     * @param fromRay initial ray of the pointer to be simulated (Default: Ray from camera to attached mesh)
     * @param startPickedPoint picked point of the pointer to be simulated (Default: attached mesh position)
     */
    PointerDragBehavior.prototype.startDrag = function (pointerId, fromRay, startPickedPoint) {
        if (pointerId === void 0) { pointerId = PointerDragBehavior._AnyMouseId; }
        this._startDrag(pointerId, fromRay, startPickedPoint);
        var lastRay = this._lastPointerRay[pointerId];
        if (pointerId === PointerDragBehavior._AnyMouseId) {
            lastRay = this._lastPointerRay[Object.keys(this._lastPointerRay)[0]];
        }
        if (lastRay) {
            // if there was a last pointer ray drag the object there
            this._moveDrag(lastRay);
        }
    };
    PointerDragBehavior.prototype._startDrag = function (pointerId, fromRay, startPickedPoint) {
        if (!this._scene.activeCamera || this.dragging || !this.attachedNode) {
            return;
        }
        PivotTools._RemoveAndStorePivotPoint(this.attachedNode);
        // Create start ray from the camera to the object
        if (fromRay) {
            this._startDragRay.direction.copyFrom(fromRay.direction);
            this._startDragRay.origin.copyFrom(fromRay.origin);
        }
        else {
            this._startDragRay.origin.copyFrom(this._scene.activeCamera.position);
            this.attachedNode.getWorldMatrix().getTranslationToRef(this._tmpVector);
            this._tmpVector.subtractToRef(this._scene.activeCamera.position, this._startDragRay.direction);
        }
        this._updateDragPlanePosition(this._startDragRay, startPickedPoint ? startPickedPoint : this._tmpVector);
        var pickedPoint = this._pickWithRayOnDragPlane(this._startDragRay);
        if (pickedPoint) {
            this.dragging = true;
            this.currentDraggingPointerId = pointerId;
            this.lastDragPosition.copyFrom(pickedPoint);
            this.onDragStartObservable.notifyObservers({ dragPlanePoint: pickedPoint, pointerId: this.currentDraggingPointerId });
            this._targetPosition.copyFrom(this.attachedNode.getAbsolutePosition());
            // Detatch camera controls
            if (this.detachCameraControls && this._scene.activeCamera && this._scene.activeCamera.inputs && !this._scene.activeCamera.leftCamera) {
                if (this._scene.activeCamera.inputs.attachedToElement) {
                    this._scene.activeCamera.detachControl();
                    this._attachedToElement = true;
                }
                else {
                    this._attachedToElement = false;
                }
            }
        }
        PivotTools._RestorePivotPoint(this.attachedNode);
    };
    PointerDragBehavior.prototype._moveDrag = function (ray) {
        this._moving = true;
        var pickedPoint = this._pickWithRayOnDragPlane(ray);
        if (pickedPoint) {
            PivotTools._RemoveAndStorePivotPoint(this.attachedNode);
            if (this.updateDragPlane) {
                this._updateDragPlanePosition(ray, pickedPoint);
            }
            var dragLength = 0;
            // depending on the drag mode option drag accordingly
            if (this._options.dragAxis) {
                // Convert local drag axis to world if useObjectOrientationForDragging
                this.useObjectOrientationForDragging
                    ? Vector3.TransformCoordinatesToRef(this._options.dragAxis, this.attachedNode.getWorldMatrix().getRotationMatrix(), this._worldDragAxis)
                    : this._worldDragAxis.copyFrom(this._options.dragAxis);
                // Project delta drag from the drag plane onto the drag axis
                pickedPoint.subtractToRef(this.lastDragPosition, this._tmpVector);
                dragLength = Vector3.Dot(this._tmpVector, this._worldDragAxis);
                this._worldDragAxis.scaleToRef(dragLength, this._dragDelta);
            }
            else {
                dragLength = this._dragDelta.length();
                pickedPoint.subtractToRef(this.lastDragPosition, this._dragDelta);
            }
            this._targetPosition.addInPlace(this._dragDelta);
            this.onDragObservable.notifyObservers({
                dragDistance: dragLength,
                delta: this._dragDelta,
                dragPlanePoint: pickedPoint,
                dragPlaneNormal: this._dragPlane.forward,
                pointerId: this.currentDraggingPointerId,
            });
            this.lastDragPosition.copyFrom(pickedPoint);
            PivotTools._RestorePivotPoint(this.attachedNode);
        }
    };
    PointerDragBehavior.prototype._pickWithRayOnDragPlane = function (ray) {
        var _this = this;
        if (!ray) {
            return null;
        }
        // Calculate angle between plane normal and ray
        var angle = Math.acos(Vector3.Dot(this._dragPlane.forward, ray.direction));
        // Correct if ray is casted from oposite side
        if (angle > Math.PI / 2) {
            angle = Math.PI - angle;
        }
        // If the angle is too perpendicular to the plane pick another point on the plane where it is looking
        if (this.maxDragAngle > 0 && angle > this.maxDragAngle) {
            if (this._useAlternatePickedPointAboveMaxDragAngle) {
                // Invert ray direction along the towards object axis
                this._tmpVector.copyFrom(ray.direction);
                this.attachedNode.absolutePosition.subtractToRef(ray.origin, this._alternatePickedPoint);
                this._alternatePickedPoint.normalize();
                this._alternatePickedPoint.scaleInPlace(this._useAlternatePickedPointAboveMaxDragAngleDragSpeed * Vector3.Dot(this._alternatePickedPoint, this._tmpVector));
                this._tmpVector.addInPlace(this._alternatePickedPoint);
                // Project resulting vector onto the drag plane and add it to the attached nodes absolute position to get a picked point
                var dot = Vector3.Dot(this._dragPlane.forward, this._tmpVector);
                this._dragPlane.forward.scaleToRef(-dot, this._alternatePickedPoint);
                this._alternatePickedPoint.addInPlace(this._tmpVector);
                this._alternatePickedPoint.addInPlace(this.attachedNode.absolutePosition);
                return this._alternatePickedPoint;
            }
            else {
                return null;
            }
        }
        var pickResult = PointerDragBehavior._PlaneScene.pickWithRay(ray, function (m) {
            return m == _this._dragPlane;
        });
        if (pickResult && pickResult.hit && pickResult.pickedMesh && pickResult.pickedPoint) {
            return pickResult.pickedPoint;
        }
        else {
            return null;
        }
    };
    // Position the drag plane based on the attached mesh position, for single axis rotate the plane along the axis to face the camera
    PointerDragBehavior.prototype._updateDragPlanePosition = function (ray, dragPlanePosition) {
        this._pointA.copyFrom(dragPlanePosition);
        if (this._options.dragAxis) {
            this.useObjectOrientationForDragging
                ? Vector3.TransformCoordinatesToRef(this._options.dragAxis, this.attachedNode.getWorldMatrix().getRotationMatrix(), this._localAxis)
                : this._localAxis.copyFrom(this._options.dragAxis);
            // Calculate plane normal that is the cross product of local axis and (eye-dragPlanePosition)
            ray.origin.subtractToRef(this._pointA, this._pointC);
            this._pointC.normalize();
            if (Math.abs(Vector3.Dot(this._localAxis, this._pointC)) > 0.999) {
                // the drag axis is colinear with the (eye to position) ray. The cross product will give jittered values.
                // A new axis vector need to be computed
                if (Math.abs(Vector3.Dot(Vector3.UpReadOnly, this._pointC)) > 0.999) {
                    this._lookAt.copyFrom(Vector3.Right());
                }
                else {
                    this._lookAt.copyFrom(Vector3.UpReadOnly);
                }
            }
            else {
                Vector3.CrossToRef(this._localAxis, this._pointC, this._lookAt);
                // Get perpendicular line from previous result and drag axis to adjust lineB to be perpendicular to camera
                Vector3.CrossToRef(this._localAxis, this._lookAt, this._lookAt);
                this._lookAt.normalize();
            }
            this._dragPlane.position.copyFrom(this._pointA);
            this._pointA.addToRef(this._lookAt, this._lookAt);
            this._dragPlane.lookAt(this._lookAt);
        }
        else if (this._options.dragPlaneNormal) {
            this.useObjectOrientationForDragging
                ? Vector3.TransformCoordinatesToRef(this._options.dragPlaneNormal, this.attachedNode.getWorldMatrix().getRotationMatrix(), this._localAxis)
                : this._localAxis.copyFrom(this._options.dragPlaneNormal);
            this._dragPlane.position.copyFrom(this._pointA);
            this._pointA.addToRef(this._localAxis, this._lookAt);
            this._dragPlane.lookAt(this._lookAt);
        }
        else {
            this._dragPlane.position.copyFrom(this._pointA);
            this._dragPlane.lookAt(ray.origin);
        }
        // Update the position of the drag plane so it doesn't get out of sync with the node (eg. when moving back and forth quickly)
        this._dragPlane.position.copyFrom(this.attachedNode.getAbsolutePosition());
        this._dragPlane.computeWorldMatrix(true);
    };
    /**
     *  Detaches the behavior from the mesh
     */
    PointerDragBehavior.prototype.detach = function () {
        this._lastPointerRay = {};
        if (this.attachedNode) {
            this.attachedNode.isNearGrabbable = false;
        }
        if (this._pointerObserver) {
            this._scene.onPointerObservable.remove(this._pointerObserver);
        }
        if (this._beforeRenderObserver) {
            this._scene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
        if (this._dragPlane) {
            this._dragPlane.dispose();
        }
        this.releaseDrag();
        this._activeDragButton = -1;
    };
    PointerDragBehavior._AnyMouseId = -2;
    return PointerDragBehavior;
}());
export { PointerDragBehavior };
//# sourceMappingURL=pointerDragBehavior.js.map