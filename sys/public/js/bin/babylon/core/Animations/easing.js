import { __extends } from "tslib";
import { BezierCurve } from "../Maths/math.path.js";
/**
 * Base class used for every default easing function.
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var EasingFunction = /** @class */ (function () {
    function EasingFunction() {
        this._easingMode = EasingFunction.EASINGMODE_EASEIN;
    }
    /**
     * Sets the easing mode of the current function.
     * @param easingMode Defines the willing mode (EASINGMODE_EASEIN, EASINGMODE_EASEOUT or EASINGMODE_EASEINOUT)
     */
    EasingFunction.prototype.setEasingMode = function (easingMode) {
        var n = Math.min(Math.max(easingMode, 0), 2);
        this._easingMode = n;
    };
    /**
     * Gets the current easing mode.
     * @returns the easing mode
     */
    EasingFunction.prototype.getEasingMode = function () {
        return this._easingMode;
    };
    /**
     * @param gradient
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EasingFunction.prototype.easeInCore = function (gradient) {
        throw new Error("You must implement this method");
    };
    /**
     * Given an input gradient between 0 and 1, this returns the corresponding value
     * of the easing function.
     * @param gradient Defines the value between 0 and 1 we want the easing value for
     * @returns the corresponding value on the curve defined by the easing function
     */
    EasingFunction.prototype.ease = function (gradient) {
        switch (this._easingMode) {
            case EasingFunction.EASINGMODE_EASEIN:
                return this.easeInCore(gradient);
            case EasingFunction.EASINGMODE_EASEOUT:
                return 1 - this.easeInCore(1 - gradient);
        }
        if (gradient >= 0.5) {
            return (1 - this.easeInCore((1 - gradient) * 2)) * 0.5 + 0.5;
        }
        return this.easeInCore(gradient * 2) * 0.5;
    };
    /**
     * Interpolation follows the mathematical formula associated with the easing function.
     */
    EasingFunction.EASINGMODE_EASEIN = 0;
    /**
     * Interpolation follows 100% interpolation minus the output of the formula associated with the easing function.
     */
    EasingFunction.EASINGMODE_EASEOUT = 1;
    /**
     * Interpolation uses EaseIn for the first half of the animation and EaseOut for the second half.
     */
    EasingFunction.EASINGMODE_EASEINOUT = 2;
    return EasingFunction;
}());
export { EasingFunction };
/**
 * Easing function with a circle shape (see link below).
 * @see https://easings.net/#easeInCirc
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var CircleEase = /** @class */ (function (_super) {
    __extends(CircleEase, _super);
    function CircleEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    CircleEase.prototype.easeInCore = function (gradient) {
        gradient = Math.max(0, Math.min(1, gradient));
        return 1.0 - Math.sqrt(1.0 - gradient * gradient);
    };
    return CircleEase;
}(EasingFunction));
export { CircleEase };
/**
 * Easing function with a ease back shape (see link below).
 * @see https://easings.net/#easeInBack
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var BackEase = /** @class */ (function (_super) {
    __extends(BackEase, _super);
    /**
     * Instantiates a back ease easing
     * @see https://easings.net/#easeInBack
     * @param amplitude Defines the amplitude of the function
     */
    function BackEase(
    /** Defines the amplitude of the function */
    amplitude) {
        if (amplitude === void 0) { amplitude = 1; }
        var _this = _super.call(this) || this;
        _this.amplitude = amplitude;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    BackEase.prototype.easeInCore = function (gradient) {
        var num = Math.max(0, this.amplitude);
        return Math.pow(gradient, 3.0) - gradient * num * Math.sin(3.1415926535897931 * gradient);
    };
    return BackEase;
}(EasingFunction));
export { BackEase };
/**
 * Easing function with a bouncing shape (see link below).
 * @see https://easings.net/#easeInBounce
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var BounceEase = /** @class */ (function (_super) {
    __extends(BounceEase, _super);
    /**
     * Instantiates a bounce easing
     * @see https://easings.net/#easeInBounce
     * @param bounces Defines the number of bounces
     * @param bounciness Defines the amplitude of the bounce
     */
    function BounceEase(
    /** Defines the number of bounces */
    bounces, 
    /** Defines the amplitude of the bounce */
    bounciness) {
        if (bounces === void 0) { bounces = 3; }
        if (bounciness === void 0) { bounciness = 2; }
        var _this = _super.call(this) || this;
        _this.bounces = bounces;
        _this.bounciness = bounciness;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    BounceEase.prototype.easeInCore = function (gradient) {
        var y = Math.max(0.0, this.bounces);
        var bounciness = this.bounciness;
        if (bounciness <= 1.0) {
            bounciness = 1.001;
        }
        var num9 = Math.pow(bounciness, y);
        var num5 = 1.0 - bounciness;
        var num4 = (1.0 - num9) / num5 + num9 * 0.5;
        var num15 = gradient * num4;
        var num65 = Math.log(-num15 * (1.0 - bounciness) + 1.0) / Math.log(bounciness);
        var num3 = Math.floor(num65);
        var num13 = num3 + 1.0;
        var num8 = (1.0 - Math.pow(bounciness, num3)) / (num5 * num4);
        var num12 = (1.0 - Math.pow(bounciness, num13)) / (num5 * num4);
        var num7 = (num8 + num12) * 0.5;
        var num6 = gradient - num7;
        var num2 = num7 - num8;
        return (-Math.pow(1.0 / bounciness, y - num3) / (num2 * num2)) * (num6 - num2) * (num6 + num2);
    };
    return BounceEase;
}(EasingFunction));
export { BounceEase };
/**
 * Easing function with a power of 3 shape (see link below).
 * @see https://easings.net/#easeInCubic
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var CubicEase = /** @class */ (function (_super) {
    __extends(CubicEase, _super);
    function CubicEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    CubicEase.prototype.easeInCore = function (gradient) {
        return gradient * gradient * gradient;
    };
    return CubicEase;
}(EasingFunction));
export { CubicEase };
/**
 * Easing function with an elastic shape (see link below).
 * @see https://easings.net/#easeInElastic
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var ElasticEase = /** @class */ (function (_super) {
    __extends(ElasticEase, _super);
    /**
     * Instantiates an elastic easing function
     * @see https://easings.net/#easeInElastic
     * @param oscillations Defines the number of oscillations
     * @param springiness Defines the amplitude of the oscillations
     */
    function ElasticEase(
    /** Defines the number of oscillations*/
    oscillations, 
    /** Defines the amplitude of the oscillations*/
    springiness) {
        if (oscillations === void 0) { oscillations = 3; }
        if (springiness === void 0) { springiness = 3; }
        var _this = _super.call(this) || this;
        _this.oscillations = oscillations;
        _this.springiness = springiness;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    ElasticEase.prototype.easeInCore = function (gradient) {
        var num2;
        var num3 = Math.max(0.0, this.oscillations);
        var num = Math.max(0.0, this.springiness);
        if (num == 0) {
            num2 = gradient;
        }
        else {
            num2 = (Math.exp(num * gradient) - 1.0) / (Math.exp(num) - 1.0);
        }
        return num2 * Math.sin((6.2831853071795862 * num3 + 1.5707963267948966) * gradient);
    };
    return ElasticEase;
}(EasingFunction));
export { ElasticEase };
/**
 * Easing function with an exponential shape (see link below).
 * @see https://easings.net/#easeInExpo
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var ExponentialEase = /** @class */ (function (_super) {
    __extends(ExponentialEase, _super);
    /**
     * Instantiates an exponential easing function
     * @see https://easings.net/#easeInExpo
     * @param exponent Defines the exponent of the function
     */
    function ExponentialEase(
    /** Defines the exponent of the function */
    exponent) {
        if (exponent === void 0) { exponent = 2; }
        var _this = _super.call(this) || this;
        _this.exponent = exponent;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    ExponentialEase.prototype.easeInCore = function (gradient) {
        if (this.exponent <= 0) {
            return gradient;
        }
        return (Math.exp(this.exponent * gradient) - 1.0) / (Math.exp(this.exponent) - 1.0);
    };
    return ExponentialEase;
}(EasingFunction));
export { ExponentialEase };
/**
 * Easing function with a power shape (see link below).
 * @see https://easings.net/#easeInQuad
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var PowerEase = /** @class */ (function (_super) {
    __extends(PowerEase, _super);
    /**
     * Instantiates an power base easing function
     * @see https://easings.net/#easeInQuad
     * @param power Defines the power of the function
     */
    function PowerEase(
    /** Defines the power of the function */
    power) {
        if (power === void 0) { power = 2; }
        var _this = _super.call(this) || this;
        _this.power = power;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    PowerEase.prototype.easeInCore = function (gradient) {
        var y = Math.max(0.0, this.power);
        return Math.pow(gradient, y);
    };
    return PowerEase;
}(EasingFunction));
export { PowerEase };
/**
 * Easing function with a power of 2 shape (see link below).
 * @see https://easings.net/#easeInQuad
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var QuadraticEase = /** @class */ (function (_super) {
    __extends(QuadraticEase, _super);
    function QuadraticEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    QuadraticEase.prototype.easeInCore = function (gradient) {
        return gradient * gradient;
    };
    return QuadraticEase;
}(EasingFunction));
export { QuadraticEase };
/**
 * Easing function with a power of 4 shape (see link below).
 * @see https://easings.net/#easeInQuart
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var QuarticEase = /** @class */ (function (_super) {
    __extends(QuarticEase, _super);
    function QuarticEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    QuarticEase.prototype.easeInCore = function (gradient) {
        return gradient * gradient * gradient * gradient;
    };
    return QuarticEase;
}(EasingFunction));
export { QuarticEase };
/**
 * Easing function with a power of 5 shape (see link below).
 * @see https://easings.net/#easeInQuint
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var QuinticEase = /** @class */ (function (_super) {
    __extends(QuinticEase, _super);
    function QuinticEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    QuinticEase.prototype.easeInCore = function (gradient) {
        return gradient * gradient * gradient * gradient * gradient;
    };
    return QuinticEase;
}(EasingFunction));
export { QuinticEase };
/**
 * Easing function with a sin shape (see link below).
 * @see https://easings.net/#easeInSine
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var SineEase = /** @class */ (function (_super) {
    __extends(SineEase, _super);
    function SineEase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @param gradient
     * @hidden
     */
    SineEase.prototype.easeInCore = function (gradient) {
        return 1.0 - Math.sin(1.5707963267948966 * (1.0 - gradient));
    };
    return SineEase;
}(EasingFunction));
export { SineEase };
/**
 * Easing function with a bezier shape (see link below).
 * @see http://cubic-bezier.com/#.17,.67,.83,.67
 * @see https://doc.babylonjs.com/divingDeeper/animation/advanced_animations#easing-functions
 */
var BezierCurveEase = /** @class */ (function (_super) {
    __extends(BezierCurveEase, _super);
    /**
     * Instantiates a bezier function
     * @see http://cubic-bezier.com/#.17,.67,.83,.67
     * @param x1 Defines the x component of the start tangent in the bezier curve
     * @param y1 Defines the y component of the start tangent in the bezier curve
     * @param x2 Defines the x component of the end tangent in the bezier curve
     * @param y2 Defines the y component of the end tangent in the bezier curve
     */
    function BezierCurveEase(
    /** Defines the x component of the start tangent in the bezier curve */
    x1, 
    /** Defines the y component of the start tangent in the bezier curve */
    y1, 
    /** Defines the x component of the end tangent in the bezier curve */
    x2, 
    /** Defines the y component of the end tangent in the bezier curve */
    y2) {
        if (x1 === void 0) { x1 = 0; }
        if (y1 === void 0) { y1 = 0; }
        if (x2 === void 0) { x2 = 1; }
        if (y2 === void 0) { y2 = 1; }
        var _this = _super.call(this) || this;
        _this.x1 = x1;
        _this.y1 = y1;
        _this.x2 = x2;
        _this.y2 = y2;
        return _this;
    }
    /**
     * @param gradient
     * @hidden
     */
    BezierCurveEase.prototype.easeInCore = function (gradient) {
        return BezierCurve.Interpolate(gradient, this.x1, this.y1, this.x2, this.y2);
    };
    return BezierCurveEase;
}(EasingFunction));
export { BezierCurveEase };
//# sourceMappingURL=easing.js.map