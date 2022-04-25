import { Vec4 } from "./vec4.js";

export class Quat extends Array {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        this.onChange = () => {};
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
        this.onChange();
    }

    set y(v) {
        this[1] = v;
        this.onChange();
    }

    set z(v) {
        this[2] = v;
        this.onChange();
    }

    set w(v) {
        this[3] = v;
        this.onChange();
    }

    identity() { Quat.identity(this); this.onChange(); return this; }

    copy(q) { Quat.copy(this, q); this.onChange(); return this; }

    set(x, y, z, w) { if (x.length) return this.copy(x); Quat.set(this, x, y, z, w); this.onChange(); return this; }

    rotateX(a) { Quat.rotateX(this, this, a); this.onChange(); return this; }

    rotateY(a) { Quat.rotateY(this, this, a); this.onChange(); return this; }

    rotateZ(a) { Quat.rotateZ(this, this, a); this.onChange(); return this; }

    inverse(q = this) { Quat.invert(this, q); this.onChange(); return this; }

    conjugate(q = this) { Quat.conjugate(this, q); this.onChange(); return this; }

    normalize(q = this) { Quat.normalize(this, q); this.onChange(); return this; }

    multiply(qA, qB) { if (qB) Quat.multiply(this, qA, qB);  else Quat.multiply(this, this, qA); this.onChange(); return this; }

    dot(v) { return Quat.dot(this, v); }

    fromMat3(matrix) { Quat.fromMat3(this, matrix); this.onChange(); return this; }

    fromEuler(euler) { Quat.fromEuler(this, euler, euler.order); return this; }

    fromAxisAngle(axis, a) { Quat.setAxisAngle(this, axis, a); return this; }

    slerp(q, t) { Quat.slerp(this, this, q, t); return this; }

    compare(v) { return Quat.compare(this, v); }

    equals(v) { return Quat.equals(this, v); }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }

    /**
     * Copy the values from one quaternion to another
     * @param {Quat} ref the receiving vector
     * @param {Quat} a the source vector
     * @returns {Quat} ref
     */
    static copy(ref, a) {
        ref[0] = a[0];
        ref[1] = a[1];
        ref[2] = a[2];
        ref[3] = a[3];
        return ref;
    }

    /**
     * Set the components of a quaternion to the given values
     * @param {Quat} ref the receiving vector
     * @param {number} x X component
     * @param {number} y Y component
     * @param {number} z Z component
     * @param {number} w W component
     * @returns {Quat} ref
     */
    static set(ref, x, y, z, w) {
        ref[0] = x;
        ref[1] = y;
        ref[2] = z;
        ref[3] = w;
        return ref;
    }

    /**
     * Set a quaternion to the identity quaternion
     * @param {Quat} ref the receiving quaternion
     * @return {Quat} ref
     */
    static identity(ref) {
        ref[0] = 0;
        ref[1] = 0;
        ref[2] = 0;
        ref[3] = 1;
        return ref;
    }

    /**
     * Gets the rotation axis and angle for a given quaternion.
     * If a quaternion is created with setAxisAngle, this method will return the same values as providied in the original parameter list OR functionally equivalent values.
     * Example: The quaternion formed by axis [0, 0, 1] and angle -90 is the same as the quaternion formed by [0, 0, 1] and 270. This method favors the latter.
     * @param {Vec3} out_axis vector receiving the axis of rotation
     * @param {Quat} q quaternion to be decomposed
     * @return {number} angle, in radians, of the rotation
     */
    static getAxisAngle(out_axis, q) {
        let rad = Math.acos(q[3]) * 2.0;
        let s = Math.sin(rad / 2.0);
        if (s > 1e-5) {
            out_axis[0] = q[0] / s;
            out_axis[1] = q[1] / s;
            out_axis[2] = q[2] / s;
        } else {
            // If s is zero, return any axis (no rotation - axis does not matter)
            out_axis[0] = 1;
            out_axis[1] = 0;
            out_axis[2] = 0;
        }
        return rad;
    }

    /**
     * Sets a quat from the given angle and rotation axis
     * @param {Quat} ref the receiving quaternion
     * @param {Vec3} axis the axis around which to rotate
     * @param {number} rad the angle in radians
     * @returns {Quat} ref
     **/
    static setAxisAngle(ref, axis, rad) {
        rad = rad * 0.5;
        let s = Math.sin(rad);
        ref[0] = s * axis[0];
        ref[1] = s * axis[1];
        ref[2] = s * axis[2];
        ref[3] = Math.cos(rad);
        return ref;
    }

    /**
     * Adds two quaternions
     * @param {Quat} ref the receiving vector
     * @param {Quat} a the first operand
     * @param {Quat} b the second operand
     * @return {Quat} ref
     */
    static add(ref, a, b) {
        ref[0] = a[0] + b[0];
        ref[1] = a[1] + b[1];
        ref[2] = a[2] + b[2];
        ref[3] = a[3] + b[3];
        return ref;
    }

    /**
     * Multiplies two quaternions
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} a the first operand
     * @param {Quat} b the second operand
     * @returns {Quat} ref
     */
    static multiply(ref, a, b) {
        let ax = a[0], ay = a[1], az = a[2], aw = a[3],
            bx = b[0], by = b[1], bz = b[2], bw = b[3];
        ref[0] = ax * bw + aw * bx + ay * bz - az * by;
        ref[1] = ay * bw + aw * by + az * bx - ax * bz;
        ref[2] = az * bw + aw * bz + ax * by - ay * bx;
        ref[3] = aw * bw - ax * bx - ay * by - az * bz;
        return ref;
    }

    /**
     * Scales a quaternion by a scalar number
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} quat the quaternion to scale
     * @param {number} scale amount to scale the quaternion by
     * @returns {Quat} ref
     */
    static scale(ref, quat, scale) {
        ref[0] = quat[0] * scale;
        ref[1] = quat[1] * scale;
        ref[2] = quat[2] * scale;
        ref[3] = quat[3] * scale;
        return ref;
    }

    /**
     * Calculates the length of a quaternion
     * @param {Quat} quat quaternion to calculate length of
     * @returns {number} length of quaternion
     */
    static magnitude(quat) {
        let x = quat[0],
            y = quat[1],
            z = quat[2],
            w = quat[3];
        return Math.hypot(x, y, z, w);
    }

    /**
     * Calculates the squared length of a quaternion
     * @param {Vec4} quat quaternion to calculate squared length of
     * @returns {number} squared length of quaternion
     */
    static squaredMagnitude(quat) {
        let x = quat[0],
            y = quat[1],
            z = quat[2],
            w = quat[3];
        return x * x + y * y + z * z + w * w;
    }

    /**
     * Calculates the inverse of a quaternion
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} quat quaternion to calculate inverse of
     * @returns {Quat} ref
     */
    static invert(ref, quat) {
        let a0 = quat[0],
            a1 = quat[1],
            a2 = quat[2],
            a3 = quat[3];
        let dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        let invDot = dot ? 1.0 / dot : 0;
        ref[0] = -a0 * invDot;
        ref[1] = -a1 * invDot;
        ref[2] = -a2 * invDot;
        ref[3] = a3 * invDot;
        return ref;
    }

    /**
     * Calculates the conjugate of a quat
     * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} quat quat to calculate conjugate of
     * @returns {Quat} ref
     */
    static conjugate(ref, quat) {
        ref[0] = -quat[0];
        ref[1] = -quat[1];
        ref[2] = -quat[2];
        ref[3] = quat[3];
        return ref;
    }

    /**
     * Normalize a quaternion
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} quat quaternion to normalize
     * @returns {Quat} ref
     */
    static normalize(ref, quat) {
        let x = quat[0],
            y = quat[1],
            z = quat[2],
            w = quat[3];
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) len = 1 / Math.sqrt(len);
        ref[0] = quat[0] * len;
        ref[1] = quat[1] * len;
        ref[2] = quat[2] * len;
        ref[3] = quat[3] * len;
        return ref;
    }

    /**
     * Calculates the dot product of two quaternions
     * @param {Quat} a the first operand
     * @param {Quat} b the second operand
     * @returns {number} dot product of a and b
     */
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }

    /**
     * Rotates a quaternion by the given angle about the X axis
     * @param {Quat} ref quaternion receiving operation result
     * @param {Quat} quat quaternions to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {Quat} ref
     */
    static rotateX(ref, quat, rad) {
        rad *= 0.5;
        let ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
        let bx = Math.sin(rad), bw = Math.cos(rad);
        ref[0] = ax * bw + aw * bx;
        ref[1] = ay * bw + az * bx;
        ref[2] = az * bw - ay * bx;
        ref[3] = aw * bw - ax * bx;
        return ref;
    }

    /**
     * Rotates a quaternion by the given angle about the Y axis
     * @param {Quat} ref quaternion receiving operation result
     * @param {Quat} quat quaternion to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {Quat} ref
     */
    static rotateY(ref, quat, rad) {
        rad *= 0.5;
        let ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
        let by = Math.sin(rad), bw = Math.cos(rad);
        ref[0] = ax * bw - az * by;
        ref[1] = ay * bw + aw * by;
        ref[2] = az * bw + ax * by;
        ref[3] = aw * bw - ay * by;
        return ref;
    }

    /**
     * Rotates a quaternion by the given angle about the Z axis
     * @param {Quat} ref quaternion receiving operation result
     * @param {Quat} quat quaternion to rotate
     * @param {number} rad angle (in radians) to rotate
     * @returns {Quat} ref
     */
    static rotateZ(ref, quat, rad) {
        rad *= 0.5;
        let ax = quat[0], ay = quat[1], az = quat[2], aw = quat[3];
        let bz = Math.sin(rad), bw = Math.cos(rad);
        ref[0] = ax * bw + ay * bz;
        ref[1] = ay * bw - ax * bz;
        ref[2] = az * bw + aw * bz;
        ref[3] = aw * bw - az * bz;
        return ref;
    }

    /**
     * Performs a spherical linear interpolation between two quaternion
     * @param {Quat} ref the receiving quaternion
     * @param {Quat} a the first operand
     * @param {Quat} b the second operand
     * @param {number} t interpolation amount, in the range [0-1], between the two inputs
     * @returns {Quat} ref
     */
    static slerp(ref, a, b, t) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations
        let ax = a[0], ay = a[1], az = a[2], aw = a[3],
            bx = b[0], by = b[1], bz = b[2], bw = b[3];

        let omega, cosom, sinom, scale0, scale1;

        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if (1.0 - cosom > 1e-5) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        ref[0] = scale0 * ax + scale1 * bx;
        ref[1] = scale0 * ay + scale1 * by;
        ref[2] = scale0 * az + scale1 * bz;
        ref[3] = scale0 * aw + scale1 * bw;

        return ref;
    }

    /**
     * Creates a quaternion from the given 3x3 rotation matrix.
     * NOTE: The resultant quaternion is not normalized, so you should be sure to renormalize the quaternion yourself where necessary.
     * @param {Quat} ref the receiving quaternion
     * @param {Mat3} matrix rotation matrix
     * @returns {Quat} ref
     */
    static fromMat3(ref, matrix) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        let fTrace = matrix[0] + matrix[4] + matrix[8];
        let fRoot;

        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            ref[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            ref[0] = (matrix[5] - matrix[7]) * fRoot;
            ref[1] = (matrix[6] - matrix[2]) * fRoot;
            ref[2] = (matrix[1] - matrix[3]) * fRoot;
        } else {
            // |w| <= 1/2
            let i = 0;
            if (matrix[4] > matrix[0]) i = 1;
            if (matrix[8] > matrix[i * 3 + i]) i = 2;
            let j = (i + 1) % 3;
            let k = (i + 2) % 3;

            fRoot = Math.sqrt(matrix[i * 3 + i] - matrix[j * 3 + j] - matrix[k * 3 + k] + 1.0);
            ref[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            ref[3] = (matrix[j * 3 + k] - matrix[k * 3 + j]) * fRoot;
            ref[j] = (matrix[j * 3 + i] + matrix[i * 3 + j]) * fRoot;
            ref[k] = (matrix[k * 3 + i] + matrix[i * 3 + k]) * fRoot;
        }

        return ref;
    }

    /**
     * Creates a quaternion from the given euler angle x, y, z.
     * @param {Quat} ref the receiving quaternion
     * @param {Vec3} euler Angles to rotate around each axis in degrees.
     * @param {"XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"} order detailing order of operations. Default 'XYZ'.
     * @returns {Quat} ref
     */
    static fromEuler(ref, euler, order = "YXZ") {
        let sx = Math.sin(euler[0] * 0.5), sy = Math.sin(euler[1] * 0.5), sz = Math.sin(euler[2] * 0.5);
        let cx = Math.cos(euler[0] * 0.5), cy = Math.cos(euler[1] * 0.5), cz = Math.cos(euler[2] * 0.5);
        switch (order) {
            case "XYZ":
                ref[0] = sx * cy * cz + cx * sy * sz;
                ref[1] = cx * sy * cz - sx * cy * sz;
                ref[2] = cx * cy * sz + sx * sy * cz;
                ref[3] = cx * cy * cz - sx * sy * sz;
                break;
            case "XZY":
                ref[0] = sx * cy * cz - cx * sy * sz;
                ref[1] = cx * sy * cz - sx * cy * sz;
                ref[2] = cx * cy * sz + sx * sy * cz;
                ref[3] = cx * cy * cz + sx * sy * sz;
                break;
            case "YXZ":
                ref[0] = sx * cy * cz + cx * sy * sz;
                ref[1] = cx * sy * cz - sx * cy * sz;
                ref[2] = cx * cy * sz - sx * sy * cz;
                ref[3] = cx * cy * cz + sx * sy * sz;
                break;
            case "YZX":
                ref[0] = sx * cy * cz + cx * sy * sz;
                ref[1] = cx * sy * cz + sx * cy * sz;
                ref[2] = cx * cy * sz - sx * sy * cz;
                ref[3] = cx * cy * cz - sx * sy * sz;
                break;
            case "ZXY":
                ref[0] = sx * cy * cz - cx * sy * sz;
                ref[1] = cx * sy * cz + sx * cy * sz;
                ref[2] = cx * cy * sz + sx * sy * cz;
                ref[3] = cx * cy * cz - sx * sy * sz;
                break;
            case "ZYX":
                ref[0] = sx * cy * cz - cx * sy * sz;
                ref[1] = cx * sy * cz + sx * cy * sz;
                ref[2] = cx * cy * sz - sx * sy * cz;
                ref[3] = cx * cy * cz + sx * sy * sz;
                break;
            default:
                throw new Error('Unknown angle order ' + order);
        }

        return ref;
    }

    /**
     * Returns whether or not the quaternions have approximately the same elements in the same position.
     * @param {Quat} a The first quaternion.
     * @param {Quat} b The second quaternion.
     * @returns {boolean} True if the quaternions are equal, false otherwise.
     */
    static compare(a, b) {
        return Math.abs(Quat.dot(a, b)) >= 1 - 1e-5;
    }

    /**
     * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
     * @param {Quat} a The first quaternion.
     * @param {Quat} b The second quaternion.
     * @returns {boolean} True if the quaternions are equal, false otherwise.
     */
    static equals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
}
