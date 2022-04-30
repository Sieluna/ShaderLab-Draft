import { Mat4 } from './mat4.js';

const tmpMat4 = new Mat4();

export class Euler extends Array {
    constructor(x = 0, y = x, z = x, order = "YXZ") {
        super(x, y, z);
        this.order = order;
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

    set(x, y = x, z = x) { return x.length ? this.copy(x) : Euler.set(this, x, y, z); }

    copy(v) { return Euler.copy(this, v); }

    reorder(order) { this.order = order; this.onChange(); return this; }

    fromRotationMatrix(matrix, order = this.order) { return Euler.fromRotationMatrix(this, matrix, order); }

    fromQuaternion(quat, order = this.order) { tmpMat4.fromQuaternion(quat); return this.fromRotationMatrix(tmpMat4, order); }

    compare(v) { return Euler.compare(this, v); }

    equals(v) { return Euler.equals(this, v); }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    /**
     * Copy the values from one euler to another
     * @param {Euler} ref the receiving euler
     * @param {Euler} euler the source euler
     * @returns {Euler} ref
     */
    static copy(ref, euler) {
        ref[0] = euler[0];
        ref[1] = euler[1];
        ref[2] = euler[2];
        ref.onChange();
        return ref;
    }

    /**
     * Set the components of a euler to the given values
     * @param {Euler} ref the receiving euler
     * @param {number} x X component
     * @param {number} y Y component
     * @param {number} z Z component
     * @returns {Euler} ref
     */
    static set(ref, x, y, z) {
        ref[0] = x;
        ref[1] = y;
        ref[2] = z;
        ref.onChange();
        return ref;
    }

    /**
     * Create a quaternion from a rotation matrix
     * @param {Euler} ref the receiving euler
     * @param {Mat4} matrix rotation matrix
     * @param {string} order detailing order of operations
     * @return {Euler} ref
     */
    static fromRotationMatrix(ref, matrix, order = "YXZ") {
        switch (order) {
            case "XYZ" :
                ref[1] = Math.asin(Math.min(Math.max(matrix[8], -1), 1));
                if (Math.abs(matrix[8]) < 0.99999) {
                    ref[0] = Math.atan2(-matrix[9], matrix[10]);
                    ref[2] = Math.atan2(-matrix[4], matrix[0]);
                } else {
                    ref[0] = Math.atan2(matrix[6], matrix[5]);
                    ref[2] = 0;
                }
                break;
            case "YXZ" :
                ref[0] = Math.asin(-Math.min(Math.max(matrix[9], -1), 1));
                if (Math.abs(matrix[9]) < 0.99999) {
                    ref[1] = Math.atan2(matrix[8], matrix[10]);
                    ref[2] = Math.atan2(matrix[1], matrix[5]);
                } else {
                    ref[1] = Math.atan2(-matrix[2], matrix[0]);
                    ref[2] = 0;
                }
                break;
            case "ZXY" :
                ref[0] = Math.asin(Math.min(Math.max(matrix[6], -1), 1));
                if (Math.abs(matrix[6]) < 0.99999) {
                    ref[1] = Math.atan2(-matrix[2], matrix[10]);
                    ref[2] = Math.atan2(-matrix[4], matrix[5]);
                } else {
                    ref[1] = 0;
                    ref[2] = Math.atan2(matrix[1], matrix[0]);
                }
                break;
            case "ZYX":
                ref[1] = Math.asin(-Math.min(Math.max(matrix[2], -1), 1));
                if (Math.abs(matrix[2]) < 0.99999) {
                    ref[0] = Math.atan2(matrix[6], matrix[10]);
                    ref[2] = Math.atan2(matrix[1], matrix[0]);
                } else {
                    ref[0] = 0;
                    ref[2] = Math.atan2(-matrix[4], matrix[5]);
                }
                break;
            case "YZX":
                ref[1] = Math.asin(-Math.min(Math.max(matrix[2], -1), 1));
                if (Math.abs(matrix[2]) < 0.99999) {
                    ref[0] = Math.atan2(matrix[6], matrix[10]);
                    ref[2] = Math.atan2(matrix[1], matrix[0]);
                } else {
                    ref[0] = 0;
                    ref[2] = Math.atan2(-matrix[4], matrix[5]);
                }
                break;
            case "XZY":
                ref[2] = Math.asin(-Math.min(Math.max(matrix[4], -1), 1));
                if (Math.abs(matrix[4]) < 0.99999) {
                    ref[0] = Math.atan2(matrix[6], matrix[5]);
                    ref[1] = Math.atan2(matrix[8], matrix[0]);
                } else {
                    ref[0] = Math.atan2(-matrix[9], matrix[10]);
                    ref[1] = 0;
                }
                break;
        }
        return ref;
    }

    /**
     * Returns whether or not the eulers have approximately the same elements in the same position.
     * @param {Euler} a the first vector.
     * @param {Euler} b the second vector.
     * @return {boolean} true if the eulers are equal, false otherwise.
     */
    static compare(a, b) {
        let a0 = a[0], a1 = a[1], a2 = a[2],
            b0 = b[0], b1 = b[1], b2 = b[2];
        return (
            Math.abs(a0 - b0) <=
            1e-5 * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <=
            1e-5 * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <=
            1e-5 * Math.max(1.0, Math.abs(a2), Math.abs(b2))
        );
    }

    /**
     * Returns whether or not the eulers have exactly the same elements in the same position (when compared with ===)
     * @param {Euler} a The first euler.
     * @param {Euler} b The second euler.
     * @returns {boolean} True if the eulers are equal, false otherwise.
     */
    static equals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
}
