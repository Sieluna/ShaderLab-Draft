var _a;
import { __assign, __awaiter, __extends, __generator } from "tslib";
import { WebXRAbstractFeature } from "./WebXRAbstractFeature.js";
import { WebXRFeatureName, WebXRFeaturesManager } from "../webXRFeaturesManager.js";
import { Matrix, Quaternion } from "../../Maths/math.vector.js";
import { PhysicsImpostor } from "../../Physics/physicsImpostor.js";
import { Observable } from "../../Misc/observable.js";
import { SceneLoader } from "../../Loading/sceneLoader.js";
import { Color3 } from "../../Maths/math.color.js";
import { NodeMaterial } from "../../Materials/Node/nodeMaterial.js";
import { Material } from "../../Materials/material.js";
import { CreateIcoSphere } from "../../Meshes/Builders/icoSphereBuilder.js";
import { TransformNode } from "../../Meshes/transformNode.js";
import { Axis } from "../../Maths/math.axis.js";
import { EngineStore } from "../../Engines/engineStore.js";

/**
 * Parts of the hands divided to writs and finger names
 */
export var HandPart;
(function (HandPart) {
    /**
     * HandPart - Wrist
     */
    HandPart["WRIST"] = "wrist";
    /**
     * HandPart - The thumb
     */
    HandPart["THUMB"] = "thumb";
    /**
     * HandPart - Index finger
     */
    HandPart["INDEX"] = "index";
    /**
     * HandPart - Middle finger
     */
    HandPart["MIDDLE"] = "middle";
    /**
     * HandPart - Ring finger
     */
    HandPart["RING"] = "ring";
    /**
     * HandPart - Little finger
     */
    HandPart["LITTLE"] = "little";
})(HandPart || (HandPart = {}));
/**
 * Joints of the hand as defined by the WebXR specification.
 * https://immersive-web.github.io/webxr-hand-input/#skeleton-joints-section
 */
export var XRHandJoint;
(function (XRHandJoint) {
    /** Wrist */
    XRHandJoint["WRIST"] = "wrist";
    /** Thumb near wrist */
    XRHandJoint["THUMB_METACARPAL"] = "thumb-metacarpal";
    /** Thumb first knuckle */
    XRHandJoint["THUMB_PHALANX_PROXIMAL"] = "thumb-phalanx-proximal";
    /** Thumb second knuckle */
    XRHandJoint["THUMB_PHALANX_DISTAL"] = "thumb-phalanx-distal";
    /** Thumb tip */
    XRHandJoint["THUMB_TIP"] = "thumb-tip";
    /** Index finger near wrist */
    XRHandJoint["INDEX_FINGER_METACARPAL"] = "index-finger-metacarpal";
    /** Index finger first knuckle */
    XRHandJoint["INDEX_FINGER_PHALANX_PROXIMAL"] = "index-finger-phalanx-proximal";
    /** Index finger second knuckle */
    XRHandJoint["INDEX_FINGER_PHALANX_INTERMEDIATE"] = "index-finger-phalanx-intermediate";
    /** Index finger third knuckle */
    XRHandJoint["INDEX_FINGER_PHALANX_DISTAL"] = "index-finger-phalanx-distal";
    /** Index finger tip */
    XRHandJoint["INDEX_FINGER_TIP"] = "index-finger-tip";
    /** Middle finger near wrist */
    XRHandJoint["MIDDLE_FINGER_METACARPAL"] = "middle-finger-metacarpal";
    /** Middle finger first knuckle */
    XRHandJoint["MIDDLE_FINGER_PHALANX_PROXIMAL"] = "middle-finger-phalanx-proximal";
    /** Middle finger second knuckle */
    XRHandJoint["MIDDLE_FINGER_PHALANX_INTERMEDIATE"] = "middle-finger-phalanx-intermediate";
    /** Middle finger third knuckle */
    XRHandJoint["MIDDLE_FINGER_PHALANX_DISTAL"] = "middle-finger-phalanx-distal";
    /** Middle finger tip */
    XRHandJoint["MIDDLE_FINGER_TIP"] = "middle-finger-tip";
    /** Ring finger near wrist */
    XRHandJoint["RING_FINGER_METACARPAL"] = "ring-finger-metacarpal";
    /** Ring finger first knuckle */
    XRHandJoint["RING_FINGER_PHALANX_PROXIMAL"] = "ring-finger-phalanx-proximal";
    /** Ring finger second knuckle */
    XRHandJoint["RING_FINGER_PHALANX_INTERMEDIATE"] = "ring-finger-phalanx-intermediate";
    /** Ring finger third knuckle */
    XRHandJoint["RING_FINGER_PHALANX_DISTAL"] = "ring-finger-phalanx-distal";
    /** Ring finger tip */
    XRHandJoint["RING_FINGER_TIP"] = "ring-finger-tip";
    /** Pinky finger near wrist */
    XRHandJoint["PINKY_FINGER_METACARPAL"] = "pinky-finger-metacarpal";
    /** Pinky finger first knuckle */
    XRHandJoint["PINKY_FINGER_PHALANX_PROXIMAL"] = "pinky-finger-phalanx-proximal";
    /** Pinky finger second knuckle */
    XRHandJoint["PINKY_FINGER_PHALANX_INTERMEDIATE"] = "pinky-finger-phalanx-intermediate";
    /** Pinky finger third knuckle */
    XRHandJoint["PINKY_FINGER_PHALANX_DISTAL"] = "pinky-finger-phalanx-distal";
    /** Pinky finger tip */
    XRHandJoint["PINKY_FINGER_TIP"] = "pinky-finger-tip";
})(XRHandJoint || (XRHandJoint = {}));
var handJointReferenceArray = [
    XRHandJoint.WRIST,
    XRHandJoint.THUMB_METACARPAL,
    XRHandJoint.THUMB_PHALANX_PROXIMAL,
    XRHandJoint.THUMB_PHALANX_DISTAL,
    XRHandJoint.THUMB_TIP,
    XRHandJoint.INDEX_FINGER_METACARPAL,
    XRHandJoint.INDEX_FINGER_PHALANX_PROXIMAL,
    XRHandJoint.INDEX_FINGER_PHALANX_INTERMEDIATE,
    XRHandJoint.INDEX_FINGER_PHALANX_DISTAL,
    XRHandJoint.INDEX_FINGER_TIP,
    XRHandJoint.MIDDLE_FINGER_METACARPAL,
    XRHandJoint.MIDDLE_FINGER_PHALANX_PROXIMAL,
    XRHandJoint.MIDDLE_FINGER_PHALANX_INTERMEDIATE,
    XRHandJoint.MIDDLE_FINGER_PHALANX_DISTAL,
    XRHandJoint.MIDDLE_FINGER_TIP,
    XRHandJoint.RING_FINGER_METACARPAL,
    XRHandJoint.RING_FINGER_PHALANX_PROXIMAL,
    XRHandJoint.RING_FINGER_PHALANX_INTERMEDIATE,
    XRHandJoint.RING_FINGER_PHALANX_DISTAL,
    XRHandJoint.RING_FINGER_TIP,
    XRHandJoint.PINKY_FINGER_METACARPAL,
    XRHandJoint.PINKY_FINGER_PHALANX_PROXIMAL,
    XRHandJoint.PINKY_FINGER_PHALANX_INTERMEDIATE,
    XRHandJoint.PINKY_FINGER_PHALANX_DISTAL,
    XRHandJoint.PINKY_FINGER_TIP,
];
var handPartsDefinition = (_a = {},
    _a[HandPart.WRIST] = [XRHandJoint.WRIST],
    _a[HandPart.THUMB] = [XRHandJoint.THUMB_METACARPAL, XRHandJoint.THUMB_PHALANX_PROXIMAL, XRHandJoint.THUMB_PHALANX_DISTAL, XRHandJoint.THUMB_TIP],
    _a[HandPart.INDEX] = [
        XRHandJoint.INDEX_FINGER_METACARPAL,
        XRHandJoint.INDEX_FINGER_PHALANX_PROXIMAL,
        XRHandJoint.INDEX_FINGER_PHALANX_INTERMEDIATE,
        XRHandJoint.INDEX_FINGER_PHALANX_DISTAL,
        XRHandJoint.INDEX_FINGER_TIP,
    ],
    _a[HandPart.MIDDLE] = [
        XRHandJoint.MIDDLE_FINGER_METACARPAL,
        XRHandJoint.MIDDLE_FINGER_PHALANX_PROXIMAL,
        XRHandJoint.MIDDLE_FINGER_PHALANX_INTERMEDIATE,
        XRHandJoint.MIDDLE_FINGER_PHALANX_DISTAL,
        XRHandJoint.MIDDLE_FINGER_TIP,
    ],
    _a[HandPart.RING] = [
        XRHandJoint.RING_FINGER_METACARPAL,
        XRHandJoint.RING_FINGER_PHALANX_PROXIMAL,
        XRHandJoint.RING_FINGER_PHALANX_INTERMEDIATE,
        XRHandJoint.RING_FINGER_PHALANX_DISTAL,
        XRHandJoint.RING_FINGER_TIP,
    ],
    _a[HandPart.LITTLE] = [
        XRHandJoint.PINKY_FINGER_METACARPAL,
        XRHandJoint.PINKY_FINGER_PHALANX_PROXIMAL,
        XRHandJoint.PINKY_FINGER_PHALANX_INTERMEDIATE,
        XRHandJoint.PINKY_FINGER_PHALANX_DISTAL,
        XRHandJoint.PINKY_FINGER_TIP,
    ],
    _a);
/**
 * Representing a single hand (with its corresponding native XRHand object)
 */
var WebXRHand = /** @class */ (function () {
    /**
     * Construct a new hand object
     * @param xrController The controller to which the hand correlates.
     * @param _jointMeshes The meshes to be used to track the hand joints.
     * @param _handMesh An optional hand mesh.
     * @param rigMapping An optional rig mapping for the hand mesh.
     *                   If not provided (but a hand mesh is provided),
     *                   it will be assumed that the hand mesh's bones are named
     *                   directly after the WebXR bone names.
     * @param _leftHandedMeshes Are the hand meshes left-handed-system meshes
     * @param _jointsInvisible Are the tracked joint meshes visible
     * @param _jointScaleFactor Scale factor for all joint meshes
     */
    function WebXRHand(
    /** The controller to which the hand correlates. */
    xrController, _jointMeshes, _handMesh, 
    /** An optional rig mapping for the hand mesh. If not provided (but a hand mesh is provided),
     * it will be assumed that the hand mesh's bones are named directly after the WebXR bone names. */
    rigMapping, _leftHandedMeshes, _jointsInvisible, _jointScaleFactor) {
        if (_leftHandedMeshes === void 0) { _leftHandedMeshes = false; }
        if (_jointsInvisible === void 0) { _jointsInvisible = false; }
        if (_jointScaleFactor === void 0) { _jointScaleFactor = 1; }
        this.xrController = xrController;
        this._jointMeshes = _jointMeshes;
        this._handMesh = _handMesh;
        this.rigMapping = rigMapping;
        this._leftHandedMeshes = _leftHandedMeshes;
        this._jointsInvisible = _jointsInvisible;
        this._jointScaleFactor = _jointScaleFactor;
        /**
         * Transform nodes that will directly receive the transforms from the WebXR matrix data.
         */
        this._jointTransforms = new Array(handJointReferenceArray.length);
        /**
         * The float array that will directly receive the transform matrix data from WebXR.
         */
        this._jointTransformMatrices = new Float32Array(handJointReferenceArray.length * 16);
        this._tempJointMatrix = new Matrix();
        /**
         * The float array that will directly receive the joint radii from WebXR.
         */
        this._jointRadii = new Float32Array(handJointReferenceArray.length);
        this._scene = _jointMeshes[0].getScene();
        // Initialize the joint transform quaternions and link the transforms to the bones.
        for (var jointIdx = 0; jointIdx < this._jointTransforms.length; jointIdx++) {
            var jointTransform = (this._jointTransforms[jointIdx] = new TransformNode(handJointReferenceArray[jointIdx], this._scene));
            jointTransform.rotationQuaternion = new Quaternion();
            // Set the rotation quaternion so we can use it later for tracking.
            _jointMeshes[jointIdx].rotationQuaternion = new Quaternion();
        }
        if (_handMesh) {
            // Note that this logic needs to happen after we initialize the joint tracking transform nodes.
            this.setHandMesh(_handMesh, rigMapping);
        }
        // hide the motion controller, if available/loaded
        if (this.xrController.motionController) {
            if (this.xrController.motionController.rootMesh) {
                this.xrController.motionController.rootMesh.setEnabled(false);
            }
            else {
                this.xrController.motionController.onModelLoadedObservable.add(function (controller) {
                    if (controller.rootMesh) {
                        controller.rootMesh.setEnabled(false);
                    }
                });
            }
        }
        this.xrController.onMotionControllerInitObservable.add(function (motionController) {
            motionController.onModelLoadedObservable.add(function (controller) {
                if (controller.rootMesh) {
                    controller.rootMesh.setEnabled(false);
                }
            });
            if (motionController.rootMesh) {
                motionController.rootMesh.setEnabled(false);
            }
        });
    }
    Object.defineProperty(WebXRHand.prototype, "handMesh", {
        /**
         * Get the hand mesh.
         */
        get: function () {
            return this._handMesh;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get meshes of part of the hand.
     * @param part The part of hand to get.
     * @returns An array of meshes that correlate to the hand part requested.
     */
    WebXRHand.prototype.getHandPartMeshes = function (part) {
        var _this = this;
        return handPartsDefinition[part].map(function (name) { return _this._jointMeshes[handJointReferenceArray.indexOf(name)]; });
    };
    /**
     * Retrieves a mesh linked to a named joint in the hand.
     * @param jointName The name of the joint.
     * @returns An AbstractMesh whose position corresponds with the joint position.
     */
    WebXRHand.prototype.getJointMesh = function (jointName) {
        return this._jointMeshes[handJointReferenceArray.indexOf(jointName)];
    };
    /**
     * Sets the current hand mesh to render for the WebXRHand.
     * @param handMesh The rigged hand mesh that will be tracked to the user's hand.
     * @param rigMapping The mapping from XRHandJoint to bone names to use with the mesh.
     */
    WebXRHand.prototype.setHandMesh = function (handMesh, rigMapping) {
        var _this = this;
        this._handMesh = handMesh;
        // Avoid any strange frustum culling. We will manually control visibility via attach and detach.
        handMesh.alwaysSelectAsActiveMesh = true;
        handMesh.getChildMeshes().forEach(function (mesh) { return (mesh.alwaysSelectAsActiveMesh = true); });
        // Link the bones in the hand mesh to the transform nodes that will be bound to the WebXR tracked joints.
        if (this._handMesh.skeleton) {
            var handMeshSkeleton_1 = this._handMesh.skeleton;
            handJointReferenceArray.forEach(function (jointName, jointIdx) {
                var jointBoneIdx = handMeshSkeleton_1.getBoneIndexByName(rigMapping ? rigMapping[jointName] : jointName);
                if (jointBoneIdx !== -1) {
                    handMeshSkeleton_1.bones[jointBoneIdx].linkTransformNode(_this._jointTransforms[jointIdx]);
                }
            });
        }
    };
    /**
     * Update this hand from the latest xr frame.
     * @param xrFrame The latest frame received from WebXR.
     * @param referenceSpace The current viewer reference space.
     */
    WebXRHand.prototype.updateFromXRFrame = function (xrFrame, referenceSpace) {
        var _this = this;
        var hand = this.xrController.inputSource.hand;
        if (!hand) {
            return;
        }
        // TODO: Modify webxr.d.ts to better match WebXR IDL so we don't need this any cast.
        var anyHand = hand;
        var jointSpaces = handJointReferenceArray.map(function (jointName) { return anyHand[jointName] || hand.get(jointName); });
        var trackingSuccessful = false;
        if (xrFrame.fillPoses && xrFrame.fillJointRadii) {
            trackingSuccessful = xrFrame.fillPoses(jointSpaces, referenceSpace, this._jointTransformMatrices) && xrFrame.fillJointRadii(jointSpaces, this._jointRadii);
        }
        else if (xrFrame.getJointPose) {
            trackingSuccessful = true;
            // Warning: This codepath is slow by comparison, only here for compat.
            for (var jointIdx = 0; jointIdx < jointSpaces.length; jointIdx++) {
                var jointPose = xrFrame.getJointPose(jointSpaces[jointIdx], referenceSpace);
                if (jointPose) {
                    this._jointTransformMatrices.set(jointPose.transform.matrix, jointIdx * 16);
                    this._jointRadii[jointIdx] = jointPose.radius || 0.008;
                }
                else {
                    trackingSuccessful = false;
                    break;
                }
            }
        }
        if (!trackingSuccessful) {
            return;
        }
        handJointReferenceArray.forEach(function (_jointName, jointIdx) {
            var jointTransform = _this._jointTransforms[jointIdx];
            Matrix.FromArrayToRef(_this._jointTransformMatrices, jointIdx * 16, _this._tempJointMatrix);
            _this._tempJointMatrix.decompose(undefined, jointTransform.rotationQuaternion, jointTransform.position);
            // The radius we need to make the joint in order for it to roughly cover the joints of the user's real hand.
            var scaledJointRadius = _this._jointRadii[jointIdx] * _this._jointScaleFactor;
            var jointMesh = _this._jointMeshes[jointIdx];
            jointMesh.isVisible = !_this._handMesh && !_this._jointsInvisible;
            jointMesh.position.copyFrom(jointTransform.position);
            jointMesh.rotationQuaternion.copyFrom(jointTransform.rotationQuaternion);
            jointMesh.scaling.setAll(scaledJointRadius);
            // The WebXR data comes as right-handed, so we might need to do some conversions.
            if (!_this._scene.useRightHandedSystem) {
                jointMesh.position.z *= -1;
                jointMesh.rotationQuaternion.z *= -1;
                jointMesh.rotationQuaternion.w *= -1;
                if (_this._leftHandedMeshes && _this._handMesh) {
                    jointTransform.position.z *= -1;
                    jointTransform.rotationQuaternion.z *= -1;
                    jointTransform.rotationQuaternion.w *= -1;
                }
            }
        });
        if (this._handMesh) {
            this._handMesh.isVisible = true;
        }
    };
    /**
     * Dispose this Hand object
     */
    WebXRHand.prototype.dispose = function () {
        if (this._handMesh) {
            this._handMesh.isVisible = false;
        }
    };
    return WebXRHand;
}());
export { WebXRHand };
/**
 * WebXR Hand Joint tracking feature, available for selected browsers and devices
 */
var WebXRHandTracking = /** @class */ (function (_super) {
    __extends(WebXRHandTracking, _super);
    /**
     * Creates a new instance of the XR hand tracking feature.
     * @param _xrSessionManager An instance of WebXRSessionManager.
     * @param options Options to use when constructing this feature.
     */
    function WebXRHandTracking(_xrSessionManager, 
    /** Options to use when constructing this feature. */
    options) {
        var _this = _super.call(this, _xrSessionManager) || this;
        _this.options = options;
        _this._attachedHands = {};
        _this._trackingHands = { left: null, right: null };
        _this._handResources = { jointMeshes: null, handMeshes: null, rigMappings: null };
        /**
         * This observable will notify registered observers when a new hand object was added and initialized
         */
        _this.onHandAddedObservable = new Observable();
        /**
         * This observable will notify its observers right before the hand object is disposed
         */
        _this.onHandRemovedObservable = new Observable();
        _this._attachHand = function (xrController) {
            var _a, _b, _c;
            if (!xrController.inputSource.hand || xrController.inputSource.handedness == "none" || !_this._handResources.jointMeshes) {
                return;
            }
            var handedness = xrController.inputSource.handedness;
            var webxrHand = new WebXRHand(xrController, _this._handResources.jointMeshes[handedness], _this._handResources.handMeshes && _this._handResources.handMeshes[handedness], _this._handResources.rigMappings && _this._handResources.rigMappings[handedness], (_a = _this.options.handMeshes) === null || _a === void 0 ? void 0 : _a.meshesUseLeftHandedCoordinates, (_b = _this.options.jointMeshes) === null || _b === void 0 ? void 0 : _b.invisible, (_c = _this.options.jointMeshes) === null || _c === void 0 ? void 0 : _c.scaleFactor);
            _this._attachedHands[xrController.uniqueId] = webxrHand;
            _this._trackingHands[handedness] = webxrHand;
            _this.onHandAddedObservable.notifyObservers(webxrHand);
        };
        _this._detachHand = function (xrController) {
            _this._detachHandById(xrController.uniqueId);
        };
        _this.xrNativeFeatureName = "hand-tracking";
        // Support legacy versions of the options object by copying over joint mesh properties
        var anyOptions = options;
        var anyJointMeshOptions = anyOptions.jointMeshes;
        if (anyJointMeshOptions) {
            if (typeof anyJointMeshOptions.disableDefaultHandMesh !== "undefined") {
                options.handMeshes = options.handMeshes || {};
                options.handMeshes.disableDefaultMeshes = anyJointMeshOptions.disableDefaultHandMesh;
            }
            if (typeof anyJointMeshOptions.handMeshes !== "undefined") {
                options.handMeshes = options.handMeshes || {};
                options.handMeshes.customMeshes = anyJointMeshOptions.handMeshes;
            }
            if (typeof anyJointMeshOptions.leftHandedSystemMeshes !== "undefined") {
                options.handMeshes = options.handMeshes || {};
                options.handMeshes.meshesUseLeftHandedCoordinates = anyJointMeshOptions.leftHandedSystemMeshes;
            }
            if (typeof anyJointMeshOptions.rigMapping !== "undefined") {
                options.handMeshes = options.handMeshes || {};
                var leftRigMapping = {};
                var rightRigMapping = {};
                [
                    [anyJointMeshOptions.rigMapping.left, leftRigMapping],
                    [anyJointMeshOptions.rigMapping.right, rightRigMapping],
                ].forEach(function (rigMappingTuple) {
                    var legacyRigMapping = rigMappingTuple[0];
                    var rigMapping = rigMappingTuple[1];
                    legacyRigMapping.forEach(function (modelJointName, index) {
                        rigMapping[handJointReferenceArray[index]] = modelJointName;
                    });
                });
                options.handMeshes.customRigMappings = {
                    left: leftRigMapping,
                    right: rightRigMapping,
                };
            }
        }
        return _this;
    }
    WebXRHandTracking._GenerateTrackedJointMeshes = function (featureOptions) {
        var meshes = {};
        ["left", "right"].map(function (handedness) {
            var _a, _b, _c, _d, _e;
            var trackedMeshes = [];
            var originalMesh = ((_a = featureOptions.jointMeshes) === null || _a === void 0 ? void 0 : _a.sourceMesh) || CreateIcoSphere("jointParent", WebXRHandTracking._ICOSPHERE_PARAMS);
            originalMesh.isVisible = !!((_b = featureOptions.jointMeshes) === null || _b === void 0 ? void 0 : _b.keepOriginalVisible);
            for (var i = 0; i < handJointReferenceArray.length; ++i) {
                var newInstance = originalMesh.createInstance("".concat(handedness, "-handJoint-").concat(i));
                if ((_c = featureOptions.jointMeshes) === null || _c === void 0 ? void 0 : _c.onHandJointMeshGenerated) {
                    var returnedMesh = featureOptions.jointMeshes.onHandJointMeshGenerated(newInstance, i, handedness);
                    if (returnedMesh) {
                        if (returnedMesh !== newInstance) {
                            newInstance.dispose();
                            newInstance = returnedMesh;
                        }
                    }
                }
                newInstance.isPickable = false;
                if ((_d = featureOptions.jointMeshes) === null || _d === void 0 ? void 0 : _d.enablePhysics) {
                    var props = ((_e = featureOptions.jointMeshes) === null || _e === void 0 ? void 0 : _e.physicsProps) || {};
                    // downscale the instances so that physics will be initialized correctly
                    newInstance.scaling.setAll(0.02);
                    var type = props.impostorType !== undefined ? props.impostorType : PhysicsImpostor.SphereImpostor;
                    newInstance.physicsImpostor = new PhysicsImpostor(newInstance, type, __assign({ mass: 0 }, props));
                }
                newInstance.rotationQuaternion = new Quaternion();
                newInstance.isVisible = false;
                trackedMeshes.push(newInstance);
            }
            meshes[handedness] = trackedMeshes;
        });
        return { left: meshes.left, right: meshes.right };
    };
    WebXRHandTracking._GenerateDefaultHandMeshesAsync = function (scene, options) {
        var _this = this;
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var riggedMeshes, handsDefined, handGLBs, handShader, handColors, handNodes;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        riggedMeshes = {};
                        // check the cache, defensive
                        if ((_b = (_a = WebXRHandTracking._RightHandGLB) === null || _a === void 0 ? void 0 : _a.meshes[1]) === null || _b === void 0 ? void 0 : _b.isDisposed()) {
                            WebXRHandTracking._RightHandGLB = null;
                        }
                        if ((_d = (_c = WebXRHandTracking._LeftHandGLB) === null || _c === void 0 ? void 0 : _c.meshes[1]) === null || _d === void 0 ? void 0 : _d.isDisposed()) {
                            WebXRHandTracking._LeftHandGLB = null;
                        }
                        handsDefined = !!(WebXRHandTracking._RightHandGLB && WebXRHandTracking._LeftHandGLB);
                        return [4 /*yield*/, Promise.all([
                                WebXRHandTracking._RightHandGLB ||
                                    SceneLoader.ImportMeshAsync("", WebXRHandTracking.DEFAULT_HAND_MODEL_BASE_URL, WebXRHandTracking.DEFAULT_HAND_MODEL_RIGHT_FILENAME, scene),
                                WebXRHandTracking._LeftHandGLB ||
                                    SceneLoader.ImportMeshAsync("", WebXRHandTracking.DEFAULT_HAND_MODEL_BASE_URL, WebXRHandTracking.DEFAULT_HAND_MODEL_LEFT_FILENAME, scene),
                            ])];
                    case 1:
                        handGLBs = _f.sent();
                        WebXRHandTracking._RightHandGLB = handGLBs[0];
                        WebXRHandTracking._LeftHandGLB = handGLBs[1];
                        handShader = new NodeMaterial("handShader", scene, { emitComments: false });
                        return [4 /*yield*/, handShader.loadAsync(WebXRHandTracking.DEFAULT_HAND_MODEL_SHADER_URL)];
                    case 2:
                        _f.sent();
                        // depth prepass and alpha mode
                        handShader.needDepthPrePass = true;
                        handShader.transparencyMode = Material.MATERIAL_ALPHABLEND;
                        handShader.alphaMode = 2;
                        // build node materials
                        handShader.build(false);
                        handColors = __assign({ base: Color3.FromInts(116, 63, 203), fresnel: Color3.FromInts(149, 102, 229), fingerColor: Color3.FromInts(177, 130, 255), tipFresnel: Color3.FromInts(220, 200, 255) }, (_e = options === null || options === void 0 ? void 0 : options.handMeshes) === null || _e === void 0 ? void 0 : _e.customColors);
                        handNodes = {
                            base: handShader.getBlockByName("baseColor"),
                            fresnel: handShader.getBlockByName("fresnelColor"),
                            fingerColor: handShader.getBlockByName("fingerColor"),
                            tipFresnel: handShader.getBlockByName("tipFresnelColor"),
                        };
                        handNodes.base.value = handColors.base;
                        handNodes.fresnel.value = handColors.fresnel;
                        handNodes.fingerColor.value = handColors.fingerColor;
                        handNodes.tipFresnel.value = handColors.tipFresnel;
                        ["left", "right"].forEach(function (handedness) {
                            var handGLB = handedness == "left" ? WebXRHandTracking._LeftHandGLB : WebXRHandTracking._RightHandGLB;
                            if (!handGLB) {
                                // this should never happen!
                                throw new Error("Could not load hand model");
                            }
                            var handMesh = handGLB.meshes[1];
                            handMesh._internalAbstractMeshDataInfo._computeBonesUsingShaders = true;
                            handMesh.material = handShader.clone("".concat(handedness, "HandShaderClone"), true);
                            handMesh.isVisible = false;
                            riggedMeshes[handedness] = handMesh;
                            // single change for left handed systems
                            if (!handsDefined && !scene.useRightHandedSystem) {
                                handGLB.meshes[1].rotate(Axis.Y, Math.PI);
                            }
                        });
                        handShader.dispose();
                        resolve({ left: riggedMeshes.left, right: riggedMeshes.right });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Generates a mapping from XRHandJoint to bone name for the default hand mesh.
     * @param handedness The handedness being mapped for.
     */
    WebXRHandTracking._GenerateDefaultHandMeshRigMapping = function (handedness) {
        var _a;
        var H = handedness == "right" ? "R" : "L";
        return _a = {},
            _a[XRHandJoint.WRIST] = "wrist_".concat(H),
            _a[XRHandJoint.THUMB_METACARPAL] = "thumb_metacarpal_".concat(H),
            _a[XRHandJoint.THUMB_PHALANX_PROXIMAL] = "thumb_proxPhalanx_".concat(H),
            _a[XRHandJoint.THUMB_PHALANX_DISTAL] = "thumb_distPhalanx_".concat(H),
            _a[XRHandJoint.THUMB_TIP] = "thumb_tip_".concat(H),
            _a[XRHandJoint.INDEX_FINGER_METACARPAL] = "index_metacarpal_".concat(H),
            _a[XRHandJoint.INDEX_FINGER_PHALANX_PROXIMAL] = "index_proxPhalanx_".concat(H),
            _a[XRHandJoint.INDEX_FINGER_PHALANX_INTERMEDIATE] = "index_intPhalanx_".concat(H),
            _a[XRHandJoint.INDEX_FINGER_PHALANX_DISTAL] = "index_distPhalanx_".concat(H),
            _a[XRHandJoint.INDEX_FINGER_TIP] = "index_tip_".concat(H),
            _a[XRHandJoint.MIDDLE_FINGER_METACARPAL] = "middle_metacarpal_".concat(H),
            _a[XRHandJoint.MIDDLE_FINGER_PHALANX_PROXIMAL] = "middle_proxPhalanx_".concat(H),
            _a[XRHandJoint.MIDDLE_FINGER_PHALANX_INTERMEDIATE] = "middle_intPhalanx_".concat(H),
            _a[XRHandJoint.MIDDLE_FINGER_PHALANX_DISTAL] = "middle_distPhalanx_".concat(H),
            _a[XRHandJoint.MIDDLE_FINGER_TIP] = "middle_tip_".concat(H),
            _a[XRHandJoint.RING_FINGER_METACARPAL] = "ring_metacarpal_".concat(H),
            _a[XRHandJoint.RING_FINGER_PHALANX_PROXIMAL] = "ring_proxPhalanx_".concat(H),
            _a[XRHandJoint.RING_FINGER_PHALANX_INTERMEDIATE] = "ring_intPhalanx_".concat(H),
            _a[XRHandJoint.RING_FINGER_PHALANX_DISTAL] = "ring_distPhalanx_".concat(H),
            _a[XRHandJoint.RING_FINGER_TIP] = "ring_tip_".concat(H),
            _a[XRHandJoint.PINKY_FINGER_METACARPAL] = "little_metacarpal_".concat(H),
            _a[XRHandJoint.PINKY_FINGER_PHALANX_PROXIMAL] = "little_proxPhalanx_".concat(H),
            _a[XRHandJoint.PINKY_FINGER_PHALANX_INTERMEDIATE] = "little_intPhalanx_".concat(H),
            _a[XRHandJoint.PINKY_FINGER_PHALANX_DISTAL] = "little_distPhalanx_".concat(H),
            _a[XRHandJoint.PINKY_FINGER_TIP] = "little_tip_".concat(H),
            _a;
    };
    /**
     * Check if the needed objects are defined.
     * This does not mean that the feature is enabled, but that the objects needed are well defined.
     */
    WebXRHandTracking.prototype.isCompatible = function () {
        return typeof XRHand !== "undefined";
    };
    /**
     * Get the hand object according to the controller id
     * @param controllerId the controller id to which we want to get the hand
     * @returns null if not found or the WebXRHand object if found
     */
    WebXRHandTracking.prototype.getHandByControllerId = function (controllerId) {
        return this._attachedHands[controllerId];
    };
    /**
     * Get a hand object according to the requested handedness
     * @param handedness the handedness to request
     * @returns null if not found or the WebXRHand object if found
     */
    WebXRHandTracking.prototype.getHandByHandedness = function (handedness) {
        if (handedness == "none") {
            return null;
        }
        return this._trackingHands[handedness];
    };
    /**
     * Attach this feature.
     * Will usually be called by the features manager.
     *
     * @returns true if successful.
     */
    WebXRHandTracking.prototype.attach = function () {
        var _this = this;
        var _a, _b, _c, _d;
        if (!_super.prototype.attach.call(this)) {
            return false;
        }
        this._handResources = {
            jointMeshes: WebXRHandTracking._GenerateTrackedJointMeshes(this.options),
            handMeshes: ((_a = this.options.handMeshes) === null || _a === void 0 ? void 0 : _a.customMeshes) || null,
            rigMappings: ((_b = this.options.handMeshes) === null || _b === void 0 ? void 0 : _b.customRigMappings) || null,
        };
        // If they didn't supply custom meshes and are not disabling the default meshes...
        if (!((_c = this.options.handMeshes) === null || _c === void 0 ? void 0 : _c.customMeshes) && !((_d = this.options.handMeshes) === null || _d === void 0 ? void 0 : _d.disableDefaultMeshes)) {
            WebXRHandTracking._GenerateDefaultHandMeshesAsync(EngineStore.LastCreatedScene, this.options).then(function (defaultHandMeshes) {
                var _a, _b;
                _this._handResources.handMeshes = defaultHandMeshes;
                _this._handResources.rigMappings = {
                    left: WebXRHandTracking._GenerateDefaultHandMeshRigMapping("left"),
                    right: WebXRHandTracking._GenerateDefaultHandMeshRigMapping("right"),
                };
                // Apply meshes to existing hands if already tracking.
                (_a = _this._trackingHands.left) === null || _a === void 0 ? void 0 : _a.setHandMesh(_this._handResources.handMeshes.left, _this._handResources.rigMappings.left);
                (_b = _this._trackingHands.right) === null || _b === void 0 ? void 0 : _b.setHandMesh(_this._handResources.handMeshes.right, _this._handResources.rigMappings.right);
            });
        }
        this.options.xrInput.controllers.forEach(this._attachHand);
        this._addNewAttachObserver(this.options.xrInput.onControllerAddedObservable, this._attachHand);
        this._addNewAttachObserver(this.options.xrInput.onControllerRemovedObservable, this._detachHand);
        return true;
    };
    WebXRHandTracking.prototype._onXRFrame = function (_xrFrame) {
        var _a, _b;
        (_a = this._trackingHands.left) === null || _a === void 0 ? void 0 : _a.updateFromXRFrame(_xrFrame, this._xrSessionManager.referenceSpace);
        (_b = this._trackingHands.right) === null || _b === void 0 ? void 0 : _b.updateFromXRFrame(_xrFrame, this._xrSessionManager.referenceSpace);
    };
    WebXRHandTracking.prototype._detachHandById = function (controllerId) {
        var _a;
        var hand = this.getHandByControllerId(controllerId);
        if (hand) {
            var handedness = hand.xrController.inputSource.handedness == "left" ? "left" : "right";
            if (((_a = this._trackingHands[handedness]) === null || _a === void 0 ? void 0 : _a.xrController.uniqueId) === controllerId) {
                this._trackingHands[handedness] = null;
            }
            this.onHandRemovedObservable.notifyObservers(hand);
            hand.dispose();
            delete this._attachedHands[controllerId];
        }
    };
    /**
     * Detach this feature.
     * Will usually be called by the features manager.
     *
     * @returns true if successful.
     */
    WebXRHandTracking.prototype.detach = function () {
        var _this = this;
        if (!_super.prototype.detach.call(this)) {
            return false;
        }
        Object.keys(this._attachedHands).forEach(function (uniqueId) { return _this._detachHandById(uniqueId); });
        return true;
    };
    /**
     * Dispose this feature and all of the resources attached.
     */
    WebXRHandTracking.prototype.dispose = function () {
        var _a;
        _super.prototype.dispose.call(this);
        this.onHandAddedObservable.clear();
        this.onHandRemovedObservable.clear();
        if (this._handResources.handMeshes && !((_a = this.options.handMeshes) === null || _a === void 0 ? void 0 : _a.customMeshes)) {
            // this will dispose the cached meshes
            this._handResources.handMeshes.left.dispose();
            this._handResources.handMeshes.right.dispose();
            // remove the cached meshes
            WebXRHandTracking._RightHandGLB = null;
            WebXRHandTracking._LeftHandGLB = null;
        }
        if (this._handResources.jointMeshes) {
            this._handResources.jointMeshes.left.forEach(function (trackedMesh) { return trackedMesh.dispose(); });
            this._handResources.jointMeshes.right.forEach(function (trackedMesh) { return trackedMesh.dispose(); });
        }
    };
    /**
     * The module's name
     */
    WebXRHandTracking.Name = WebXRFeatureName.HAND_TRACKING;
    /**
     * The (Babylon) version of this module.
     * This is an integer representing the implementation version.
     * This number does not correspond to the WebXR specs version
     */
    WebXRHandTracking.Version = 1;
    /** The base URL for the default hand model. */
    WebXRHandTracking.DEFAULT_HAND_MODEL_BASE_URL = "https://assets.babylonjs.com/meshes/HandMeshes/";
    /** The filename to use for the default right hand model. */
    WebXRHandTracking.DEFAULT_HAND_MODEL_RIGHT_FILENAME = "r_hand_rhs.glb";
    /** The filename to use for the default left hand model. */
    WebXRHandTracking.DEFAULT_HAND_MODEL_LEFT_FILENAME = "l_hand_rhs.glb";
    /** The URL pointing to the default hand model NodeMaterial shader. */
    WebXRHandTracking.DEFAULT_HAND_MODEL_SHADER_URL = "https://assets.babylonjs.com/meshes/HandMeshes/handsShader.json";
    // We want to use lightweight models, diameter will initially be 1 but scaled to the values returned from WebXR.
    WebXRHandTracking._ICOSPHERE_PARAMS = { radius: 0.5, flat: false, subdivisions: 2 };
    WebXRHandTracking._RightHandGLB = null;
    WebXRHandTracking._LeftHandGLB = null;
    return WebXRHandTracking;
}(WebXRAbstractFeature));
export { WebXRHandTracking };
//register the plugin
WebXRFeaturesManager.AddWebXRFeature(WebXRHandTracking.Name, function (xrSessionManager, options) {
    return function () { return new WebXRHandTracking(xrSessionManager, options); };
}, WebXRHandTracking.Version, false);
//# sourceMappingURL=WebXRHandTracking.js.map