import { __decorate } from "tslib";
import { serialize } from "../../Misc/decorators.js";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager.js";
import { PointerEventTypes } from "../../Events/pointerEvents.js";
import { Matrix, Vector3 } from "../../Maths/math.vector.js";
import { Tools } from "../../Misc/tools.js";
/**
 * Manage the touch inputs to control the movement of a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
var FreeCameraTouchInput = /** @class */ (function () {
    /**
     * Manage the touch inputs to control the movement of a free camera.
     * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
     * @param allowMouse Defines if mouse events can be treated as touch events
     */
    function FreeCameraTouchInput(
    /**
     * Define if mouse events can be treated as touch events
     */
    allowMouse) {
        if (allowMouse === void 0) { allowMouse = false; }
        this.allowMouse = allowMouse;
        /**
         * Defines the touch sensibility for rotation.
         * The lower the faster.
         */
        this.touchAngularSensibility = 200000.0;
        /**
         * Defines the touch sensibility for move.
         * The lower the faster.
         */
        this.touchMoveSensibility = 250.0;
        /**
         * Swap touch actions so that one touch is used for rotation and multiple for movement
         */
        this.singleFingerRotate = false;
        this._offsetX = null;
        this._offsetY = null;
        this._pointerPressed = new Array();
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    FreeCameraTouchInput.prototype.attachControl = function (noPreventDefault) {
        var _this = this;
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        var previousPosition = null;
        if (this._pointerInput === undefined) {
            this._onLostFocus = function () {
                _this._offsetX = null;
                _this._offsetY = null;
            };
            this._pointerInput = function (p) {
                var evt = p.event;
                var isMouseEvent = evt.pointerType === "mouse";
                if (!_this.allowMouse && isMouseEvent) {
                    return;
                }
                if (p.type === PointerEventTypes.POINTERDOWN) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    _this._pointerPressed.push(evt.pointerId);
                    if (_this._pointerPressed.length !== 1) {
                        return;
                    }
                    previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY,
                    };
                }
                else if (p.type === PointerEventTypes.POINTERUP) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    var index = _this._pointerPressed.indexOf(evt.pointerId);
                    if (index === -1) {
                        return;
                    }
                    _this._pointerPressed.splice(index, 1);
                    if (index != 0) {
                        return;
                    }
                    previousPosition = null;
                    _this._offsetX = null;
                    _this._offsetY = null;
                }
                else if (p.type === PointerEventTypes.POINTERMOVE) {
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                    if (!previousPosition) {
                        return;
                    }
                    var index = _this._pointerPressed.indexOf(evt.pointerId);
                    if (index != 0) {
                        return;
                    }
                    _this._offsetX = evt.clientX - previousPosition.x;
                    _this._offsetY = -(evt.clientY - previousPosition.y);
                }
            };
        }
        this._observer = this.camera
            .getScene()
            .onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
        if (this._onLostFocus) {
            var engine = this.camera.getEngine();
            var element = engine.getInputElement();
            element && element.addEventListener("blur", this._onLostFocus);
        }
    };
    /**
     * Detach the current controls from the specified dom element.
     */
    FreeCameraTouchInput.prototype.detachControl = function () {
        if (this._pointerInput) {
            if (this._observer) {
                this.camera.getScene().onPointerObservable.remove(this._observer);
                this._observer = null;
            }
            if (this._onLostFocus) {
                var engine = this.camera.getEngine();
                var element = engine.getInputElement();
                element && element.removeEventListener("blur", this._onLostFocus);
                this._onLostFocus = null;
            }
            this._pointerPressed = [];
            this._offsetX = null;
            this._offsetY = null;
        }
    };
    /**
     * Update the current camera state depending on the inputs that have been used this frame.
     * This is a dynamically created lambda to avoid the performance penalty of looping for inputs in the render loop.
     */
    FreeCameraTouchInput.prototype.checkInputs = function () {
        if (this._offsetX === null || this._offsetY === null) {
            return;
        }
        if (this._offsetX === 0 && this._offsetY === 0) {
            return;
        }
        var camera = this.camera;
        camera.cameraRotation.y = this._offsetX / this.touchAngularSensibility;
        var rotateCamera = (this.singleFingerRotate && this._pointerPressed.length === 1) || (!this.singleFingerRotate && this._pointerPressed.length > 1);
        if (rotateCamera) {
            camera.cameraRotation.x = -this._offsetY / this.touchAngularSensibility;
        }
        else {
            var speed = camera._computeLocalCameraSpeed();
            var direction = new Vector3(0, 0, (speed * this._offsetY) / this.touchMoveSensibility);
            Matrix.RotationYawPitchRollToRef(camera.rotation.y, camera.rotation.x, 0, camera._cameraRotationMatrix);
            camera.cameraDirection.addInPlace(Vector3.TransformCoordinates(direction, camera._cameraRotationMatrix));
        }
    };
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    FreeCameraTouchInput.prototype.getClassName = function () {
        return "FreeCameraTouchInput";
    };
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    FreeCameraTouchInput.prototype.getSimpleName = function () {
        return "touch";
    };
    __decorate([
        serialize()
    ], FreeCameraTouchInput.prototype, "touchAngularSensibility", void 0);
    __decorate([
        serialize()
    ], FreeCameraTouchInput.prototype, "touchMoveSensibility", void 0);
    return FreeCameraTouchInput;
}());
export { FreeCameraTouchInput };
CameraInputTypes["FreeCameraTouchInput"] = FreeCameraTouchInput;
//# sourceMappingURL=freeCameraTouchInput.js.map