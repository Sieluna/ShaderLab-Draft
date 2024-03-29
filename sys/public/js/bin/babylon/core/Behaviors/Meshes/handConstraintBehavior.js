import { WebXRFeatureName } from "../../XR/webXRFeaturesManager.js";
import { XRHandJoint } from "../../XR/features/WebXRHandTracking.js";
import { Quaternion, TmpVectors, Vector3 } from "../../Maths/math.vector.js";
/**
 * Zones around the hand
 */
export var HandConstraintZone;
(function (HandConstraintZone) {
    /**
     * Above finger tips
     */
    HandConstraintZone[HandConstraintZone["ABOVE_FINGER_TIPS"] = 0] = "ABOVE_FINGER_TIPS";
    /**
     * Next to the thumb
     */
    HandConstraintZone[HandConstraintZone["RADIAL_SIDE"] = 1] = "RADIAL_SIDE";
    /**
     * Next to the pinky finger
     */
    HandConstraintZone[HandConstraintZone["ULNAR_SIDE"] = 2] = "ULNAR_SIDE";
    /**
     * Below the wrist
     */
    HandConstraintZone[HandConstraintZone["BELOW_WRIST"] = 3] = "BELOW_WRIST";
})(HandConstraintZone || (HandConstraintZone = {}));
/**
 * Orientations for the hand zones and for the attached node
 */
export var HandConstraintOrientation;
(function (HandConstraintOrientation) {
    /**
     * Orientation is towards the camera
     */
    HandConstraintOrientation[HandConstraintOrientation["LOOK_AT_CAMERA"] = 0] = "LOOK_AT_CAMERA";
    /**
     * Orientation is determined by the rotation of the palm
     */
    HandConstraintOrientation[HandConstraintOrientation["HAND_ROTATION"] = 1] = "HAND_ROTATION";
})(HandConstraintOrientation || (HandConstraintOrientation = {}));
/**
 * Orientations for the hand zones and for the attached node
 */
export var HandConstraintVisibility;
(function (HandConstraintVisibility) {
    /**
     * Constraint is always visible
     */
    HandConstraintVisibility[HandConstraintVisibility["ALWAYS_VISIBLE"] = 0] = "ALWAYS_VISIBLE";
    /**
     * Constraint is only visible when the palm is up
     */
    HandConstraintVisibility[HandConstraintVisibility["PALM_UP"] = 1] = "PALM_UP";
    /**
     * Constraint is only visible when the user is looking at the constraint.
     * Uses XR Eye Tracking if enabled/available, otherwise uses camera direction
     */
    HandConstraintVisibility[HandConstraintVisibility["GAZE_FOCUS"] = 2] = "GAZE_FOCUS";
    /**
     * Constraint is only visible when the palm is up and the user is looking at it
     */
    HandConstraintVisibility[HandConstraintVisibility["PALM_AND_GAZE"] = 3] = "PALM_AND_GAZE";
})(HandConstraintVisibility || (HandConstraintVisibility = {}));
/**
 * Hand constraint behavior that makes the attached `TransformNode` follow hands in XR experiences.
 * @since 5.0.0
 */
var HandConstraintBehavior = /** @class */ (function () {
    /**
     * Builds a hand constraint behavior
     */
    function HandConstraintBehavior() {
        this._sceneRenderObserver = null;
        this._zoneAxis = {};
        /**
         * Sets the HandConstraintVisibility level for the hand constraint
         */
        this.handConstraintVisibility = HandConstraintVisibility.PALM_AND_GAZE;
        /**
         * A number from 0.0 to 1.0, marking how restricted the direction the palm faces is for the attached node to be enabled.
         * A 1 means the palm must be directly facing the user before the node is enabled, a 0 means it is always enabled.
         * Used with HandConstraintVisibility.PALM_UP
         */
        this.palmUpStrictness = 0.95;
        /**
         * The radius in meters around the center of the hand that the user must gaze inside for the attached node to be enabled and appear.
         * Used with HandConstraintVisibility.GAZE_FOCUS
         */
        this.gazeProximityRadius = 0.15;
        /**
         * Offset distance from the hand in meters
         */
        this.targetOffset = 0.1;
        /**
         * Where to place the node regarding the center of the hand.
         */
        this.targetZone = HandConstraintZone.ULNAR_SIDE;
        /**
         * Orientation mode of the 4 zones around the hand
         */
        this.zoneOrientationMode = HandConstraintOrientation.HAND_ROTATION;
        /**
         * Orientation mode of the node attached to this behavior
         */
        this.nodeOrientationMode = HandConstraintOrientation.HAND_ROTATION;
        /**
         * Set the hand this behavior should follow. If set to "none", it will follow any visible hand (prioritising the left one).
         */
        this.handedness = "none";
        /**
         * Rate of interpolation of position and rotation of the attached node.
         * Higher values will give a slower interpolation.
         */
        this.lerpTime = 100;
        // For a right hand
        this._zoneAxis[HandConstraintZone.ABOVE_FINGER_TIPS] = new Vector3(0, 1, 0);
        this._zoneAxis[HandConstraintZone.RADIAL_SIDE] = new Vector3(-1, 0, 0);
        this._zoneAxis[HandConstraintZone.ULNAR_SIDE] = new Vector3(1, 0, 0);
        this._zoneAxis[HandConstraintZone.BELOW_WRIST] = new Vector3(0, -1, 0);
    }
    Object.defineProperty(HandConstraintBehavior.prototype, "name", {
        /** gets or sets behavior's name */
        get: function () {
            return "HandConstraint";
        },
        enumerable: false,
        configurable: true
    });
    /** Enable the behavior */
    HandConstraintBehavior.prototype.enable = function () {
        this._node.setEnabled(true);
    };
    /** Disable the behavior */
    HandConstraintBehavior.prototype.disable = function () {
        this._node.setEnabled(false);
    };
    HandConstraintBehavior.prototype._getHandPose = function () {
        if (!this._handTracking) {
            return null;
        }
        // Retrieve any available hand, starting by the left
        var hand;
        if (this.handedness === "none") {
            hand = this._handTracking.getHandByHandedness("left") || this._handTracking.getHandByHandedness("right");
        }
        else {
            hand = this._handTracking.getHandByHandedness(this.handedness);
        }
        if (hand) {
            var pinkyMetacarpal = hand.getJointMesh(XRHandJoint.PINKY_FINGER_METACARPAL);
            var middleMetacarpal = hand.getJointMesh(XRHandJoint.MIDDLE_FINGER_METACARPAL);
            var wrist = hand.getJointMesh(XRHandJoint.WRIST);
            if (wrist && middleMetacarpal && pinkyMetacarpal) {
                var handPose = { position: middleMetacarpal.absolutePosition, quaternion: new Quaternion(), id: hand.xrController.uniqueId };
                // palm forward
                var up = TmpVectors.Vector3[0];
                var forward = TmpVectors.Vector3[1];
                var left = TmpVectors.Vector3[2];
                up.copyFrom(middleMetacarpal.absolutePosition).subtractInPlace(wrist.absolutePosition).normalize();
                forward.copyFrom(pinkyMetacarpal.absolutePosition).subtractInPlace(middleMetacarpal.absolutePosition).normalize();
                // Create vectors for a rotation quaternion, where forward points out from the palm
                Vector3.CrossToRef(up, forward, forward);
                Vector3.CrossToRef(forward, up, left);
                Quaternion.FromLookDirectionLHToRef(forward, up, handPose.quaternion);
                return handPose;
            }
        }
        return null;
    };
    /**
     * Initializes the hand constraint behavior
     */
    HandConstraintBehavior.prototype.init = function () { };
    /**
     * Attaches the hand constraint to a `TransformNode`
     * @param node defines the node to attach the behavior to
     */
    HandConstraintBehavior.prototype.attach = function (node) {
        var _this = this;
        this._node = node;
        this._scene = node.getScene();
        if (!this._node.rotationQuaternion) {
            this._node.rotationQuaternion = Quaternion.RotationYawPitchRoll(this._node.rotation.y, this._node.rotation.x, this._node.rotation.z);
        }
        var lastTick = Date.now();
        this._sceneRenderObserver = this._scene.onBeforeRenderObservable.add(function () {
            var pose = _this._getHandPose();
            _this._node.reservedDataStore = _this._node.reservedDataStore || {};
            _this._node.reservedDataStore.nearInteraction = _this._node.reservedDataStore.nearInteraction || {};
            _this._node.reservedDataStore.nearInteraction.excludedControllerId = null;
            if (pose) {
                var zoneOffset = TmpVectors.Vector3[0];
                var camera = _this._scene.activeCamera;
                zoneOffset.copyFrom(_this._zoneAxis[_this.targetZone]);
                var cameraLookAtQuaternion = TmpVectors.Quaternion[0];
                if (camera && (_this.zoneOrientationMode === HandConstraintOrientation.LOOK_AT_CAMERA || _this.nodeOrientationMode === HandConstraintOrientation.LOOK_AT_CAMERA)) {
                    var toCamera = TmpVectors.Vector3[1];
                    toCamera.copyFrom(camera.position).subtractInPlace(pose.position).normalize();
                    if (_this._scene.useRightHandedSystem) {
                        Quaternion.FromLookDirectionRHToRef(toCamera, Vector3.UpReadOnly, cameraLookAtQuaternion);
                    }
                    else {
                        Quaternion.FromLookDirectionLHToRef(toCamera, Vector3.UpReadOnly, cameraLookAtQuaternion);
                    }
                }
                if (_this.zoneOrientationMode === HandConstraintOrientation.HAND_ROTATION) {
                    pose.quaternion.toRotationMatrix(TmpVectors.Matrix[0]);
                }
                else {
                    cameraLookAtQuaternion.toRotationMatrix(TmpVectors.Matrix[0]);
                }
                Vector3.TransformNormalToRef(zoneOffset, TmpVectors.Matrix[0], zoneOffset);
                zoneOffset.scaleInPlace(_this.targetOffset);
                var targetPosition = TmpVectors.Vector3[2];
                var targetRotation = TmpVectors.Quaternion[1];
                targetPosition.copyFrom(pose.position).addInPlace(zoneOffset);
                if (_this.nodeOrientationMode === HandConstraintOrientation.HAND_ROTATION) {
                    targetRotation.copyFrom(pose.quaternion);
                }
                else {
                    targetRotation.copyFrom(cameraLookAtQuaternion);
                }
                var elapsed = Date.now() - lastTick;
                Vector3.SmoothToRef(_this._node.position, targetPosition, elapsed, _this.lerpTime, _this._node.position);
                Quaternion.SmoothToRef(_this._node.rotationQuaternion, targetRotation, elapsed, _this.lerpTime, _this._node.rotationQuaternion);
                _this._node.reservedDataStore.nearInteraction.excludedControllerId = pose.id;
            }
            _this._setVisibility(pose);
            lastTick = Date.now();
        });
    };
    HandConstraintBehavior.prototype._setVisibility = function (pose) {
        var palmVisible = true;
        var gazeVisible = true;
        var camera = this._scene.activeCamera;
        if (camera) {
            var cameraForward = camera.getForwardRay();
            if (this.handConstraintVisibility === HandConstraintVisibility.GAZE_FOCUS || this.handConstraintVisibility === HandConstraintVisibility.PALM_AND_GAZE) {
                gazeVisible = false;
                var gaze = void 0;
                if (this._eyeTracking) {
                    gaze = this._eyeTracking.getEyeGaze();
                }
                gaze = gaze || cameraForward;
                var gazeToBehavior = TmpVectors.Vector3[0];
                if (pose) {
                    pose.position.subtractToRef(gaze.origin, gazeToBehavior);
                }
                else {
                    this._node.getAbsolutePosition().subtractToRef(gaze.origin, gazeToBehavior);
                }
                var projectedDistance = Vector3.Dot(gazeToBehavior, gaze.direction);
                var projectedSquared = projectedDistance * projectedDistance;
                if (projectedDistance > 0) {
                    var radiusSquared = gazeToBehavior.lengthSquared() - projectedSquared;
                    if (radiusSquared < this.gazeProximityRadius * this.gazeProximityRadius) {
                        gazeVisible = true;
                    }
                }
            }
            if (this.handConstraintVisibility === HandConstraintVisibility.PALM_UP || this.handConstraintVisibility === HandConstraintVisibility.PALM_AND_GAZE) {
                palmVisible = false;
                if (pose) {
                    var palmDirection = TmpVectors.Vector3[0];
                    Vector3.LeftHandedForwardReadOnly.rotateByQuaternionToRef(pose.quaternion, palmDirection);
                    if (Vector3.Dot(palmDirection, cameraForward.direction) > this.palmUpStrictness * 2 - 1) {
                        palmVisible = true;
                    }
                }
            }
        }
        this._node.setEnabled(palmVisible && gazeVisible);
    };
    /**
     * Detaches the behavior from the `TransformNode`
     */
    HandConstraintBehavior.prototype.detach = function () {
        this._scene.onBeforeRenderObservable.remove(this._sceneRenderObserver);
    };
    /**
     * Links the behavior to the XR experience in which to retrieve hand transform information.
     * @param xr xr experience
     */
    HandConstraintBehavior.prototype.linkToXRExperience = function (xr) {
        try {
            this._eyeTracking = xr.featuresManager.getEnabledFeature(WebXRFeatureName.EYE_TRACKING);
        }
        catch (_a) { }
        try {
            this._handTracking = xr.featuresManager.getEnabledFeature(WebXRFeatureName.HAND_TRACKING);
        }
        catch (_b) {
            alert("Hand tracking must be enabled for the Hand Menu to work");
        }
    };
    return HandConstraintBehavior;
}());
export { HandConstraintBehavior };
//# sourceMappingURL=handConstraintBehavior.js.map