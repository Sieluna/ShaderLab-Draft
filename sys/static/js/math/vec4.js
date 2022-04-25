export class Vec4 extends Array {
    constructor(x = 0, y = x, z = x, w = x) {
        super(x, y, z, w);
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
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set w(v) {
        this[3] = v;
    }

    set(x, y, z, w) { return x.length ? this.copy(x) : Vec4.set(this, x, y, z, w); }

    copy(v) { return Vec4.copy(this, v); }

    add(a, b) { return b ? Vec4.add(this, a, b) : Vec4.add(this, this, a); }

    sub(a, b) { return b ? Vec4.subtract(this, a, b) : Vec4.subtract(this, this, a); }

    multiply(v) { return v.length ? Vec4.multiply(this, this, v) : Vec4.scale(this, this, v); }

    divide(v) { return v.length ? Vec4.divide(this, this, v) : Vec4.scale(this, this, 1 / v); }

    scale(v) { return Vec4.scale(this, this, v); }

    normalize() { return Vec4.normalize(this, this); }

    dot(v) { return Vec4.dot(this, v); }

    compare(v) { return Vec4.compare(this, v); }

    equals(v) { return Vec4.equals(this, v); }

    fromArray(arr, o = 0) {
        this[0] = arr[o];
        this[1] = arr[o + 1];
        this[2] = arr[o + 2];
        this[3] = arr[o + 3];
        return this;
    }

    toArray(arr = [], o = 0) {
        arr[o] = this[0];
        arr[o + 1] = this[1];
        arr[o + 2] = this[2];
        arr[o + 3] = this[3];
        return arr;
    }

    /**
     * Copy the values from one vec4 to another
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector the source vector
     * @returns {Vec4} ref
     */
    static copy(ref, vector) {
        ref[0] = vector[0];
        ref[1] = vector[1];
        ref[2] = vector[2];
        ref[3] = vector[3];
        return ref;
    }

    /**
     * Set the components of a vec4 to the given values
     * @param {Vec4} ref the receiving vector
     * @param {number} x X component
     * @param {number} y Y component
     * @param {number} z Z component
     * @param {number} w W component
     * @returns {Vec4} ref
     */
    static set(ref, x, y, z, w) {
        ref[0] = x;
        ref[1] = y;
        ref[2] = z;
        ref[3] = w;
        return ref;
    }

    /**
     * Adds two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @return {Vec4} ref
     */
    static add(ref, a, b) {
        ref[0] = a[0] + b[0];
        ref[1] = a[1] + b[1];
        ref[2] = a[2] + b[2];
        ref[3] = a[3] + b[3];
        return ref;
    }

    /**
     * Subtracts vector b from vector a
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @return {Vec4} ref
     */
    static subtract(ref, a, b) {
        ref[0] = a[0] - b[0];
        ref[1] = a[1] - b[1];
        ref[2] = a[2] - b[2];
        ref[3] = a[3] - b[3];
        return ref;
    }

    /**
     * Multiplies two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {Vec4} ref
     */
    static multiply(ref, a, b) {
        ref[0] = a[0] * b[0];
        ref[1] = a[1] * b[1];
        ref[2] = a[2] * b[2];
        ref[3] = a[3] * b[3];
        return ref;
    }

    /**
     * Divides two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @return {Vec4} ref
     */
    static divide(ref, a, b) {
        ref[0] = a[0] / b[0];
        ref[1] = a[1] / b[1];
        ref[2] = a[2] / b[2];
        ref[3] = a[3] / b[3];
        return ref;
    }

    /**
     * floor vec4
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector vector to floor
     * @returns {Vec4} ref
     */
    static floor(ref, vector) {
        ref[0] = Math.floor(vector[0]);
        ref[1] = Math.floor(vector[1]);
        ref[2] = Math.floor(vector[2]);
        ref[3] = Math.floor(vector[3]);
        return ref;
    }

    /**
     * Minimum of two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {Vec4} ref
     */
    static min(ref, a, b) {
        ref[0] = Math.min(a[0], b[0]);
        ref[1] = Math.min(a[1], b[1]);
        ref[2] = Math.min(a[2], b[2]);
        ref[3] = Math.min(a[3], b[3]);
        return ref;
    }

    /**
     * Maximum of two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {Vec4} ref
     */
    static max(ref, a, b) {
        ref[0] = Math.max(a[0], b[0]);
        ref[1] = Math.max(a[1], b[1]);
        ref[2] = Math.max(a[2], b[2]);
        ref[3] = Math.max(a[3], b[3]);
        return ref;
    }

    /**
     * Scales a vec4 by a scalar number
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector the vector to scale
     * @param {number} scale amount to scale the vector by
     * @returns {Vec4} ref
     */
    static scale(ref, vector, scale) {
        ref[0] = vector[0] * scale;
        ref[1] = vector[1] * scale;
        ref[2] = vector[2] * scale;
        ref[3] = vector[3] * scale;
        return ref;
    }

    /**
     * Calculates the euclidian distance between two vec4's
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {number} distance between a and b
     */
    static distance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2],
            w = b[3] - a[3];
        return Math.hypot(x, y, z, w);
    }

    /**
     * Calculates the squared euclidian distance between two vec4's
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {number} squared distance between a and b
     */
    static squaredDistance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2],
            w = b[3] - a[3];
        return x * x + y * y + z * z + w * w;
    }

    /**
     * Calculates the length of a vec4
     * @param {Vec4} vector vector to calculate length of
     * @returns {number} length of vector
     */
    static magnitude(vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2],
            w = vector[3];
        return Math.hypot(x, y, z, w);
    }

    /**
     * Calculates the squared length of a vec4
     * @param {Vec4} vector vector to calculate squared length of
     * @returns {number} squared length of vector
     */
    static squaredMagnitude(vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2],
            w = vector[3];
        return x * x + y * y + z * z + w * w;
    }

    /**
     * Negates the components of a vec4
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector vector to negate
     * @returns {Vec4} ref
     */
    static negate(ref, vector) {
        ref[0] = -vector[0];
        ref[1] = -vector[1];
        ref[2] = -vector[2];
        ref[3] = -vector[3];
        return ref;
    }

    /**
     * Returns the inverse of the components of a vec4
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector vector to invert
     * @returns {Vec4} ref
     */
    static inverse(ref, vector) {
        ref[0] = 1.0 / vector[0];
        ref[1] = 1.0 / vector[1];
        ref[2] = 1.0 / vector[2];
        ref[3] = 1.0 / vector[3];
        return ref;
    }

    /**
     * Normalize a vec4
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector vector to normalize
     * @returns {Vec4} ref
     */
    static normalize(ref, vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2],
            w = vector[3];
        let len = x * x + y * y + z * z + w * w;
        if (len > 0) len = 1 / Math.sqrt(len);
        ref[0] = vector[0] * len;
        ref[1] = vector[1] * len;
        ref[2] = vector[2] * len;
        ref[3] = vector[3] * len;
        return ref;
    }

    /**
     * Calculates the dot product of two vec4's
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @returns {number} dot product of a and b
     */
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }

    /**
     * Computes the cross product of two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} u the first operand
     * @param {Vec4} v the second operand
     * @param {Vec4} w the third vector
     * @returns {Vec4} ref
     */
    static cross(ref, u, v, w) {
        let A = v[0] * w[1] - v[1] * w[0],
            B = v[0] * w[2] - v[2] * w[0],
            C = v[0] * w[3] - v[3] * w[0],
            D = v[1] * w[2] - v[2] * w[1],
            E = v[1] * w[3] - v[3] * w[1],
            F = v[2] * w[3] - v[3] * w[2];
        let G = u[0];
        let H = u[1];
        let I = u[2];
        let J = u[3];

        ref[0] = H * F - I * E + J * D;
        ref[1] = -(G * F) + I * C - J * B;
        ref[2] = G * E - H * C + J * A;
        ref[3] = -(G * D) + H * B - I * A;

        return ref;
    }

    /**
     * Performs a linear interpolation between two vec4's
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} a the first operand
     * @param {Vec4} b the second operand
     * @param {number} t interpolation amount between the two inputs
     * @returns {Vec4} ref
     */
    static lerp(ref, a, b, t) {
        let ax = a[0],
            ay = a[1],
            az = a[2],
            aw = a[3];
        ref[0] = ax + t * (b[0] - ax);
        ref[1] = ay + t * (b[1] - ay);
        ref[2] = az + t * (b[2] - az);
        ref[3] = aw + t * (b[3] - aw);
        return ref;
    }

    /**
     * Transforms the vec4 with a mat4.
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector the vector to transform
     * @param {Mat4} matrix matrix to transform with
     * @returns {Vec4} ref
     */
    static transformMat4(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1],
            z = vector[2],
            w = vector[3];
        ref[0] = matrix[0] * x + matrix[4] * y + matrix[8]  * z + matrix[12] * w;
        ref[1] = matrix[1] * x + matrix[5] * y + matrix[9]  * z + matrix[13] * w;
        ref[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
        ref[3] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w;
        return ref;
    }

    /**
     * Transforms the vec4 with a quaternion
     * @param {Vec4} ref the receiving vector
     * @param {Vec4} vector the vector to transform
     * @param {Quat} quat quaternion to transform with
     * @returns {Vec4} ref
     */
    static transformQuat(ref, vector, quat) {
        let x = vector[0], y = vector[1], z = vector[2];
        let qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

        // calculate quat * vec
        let ix =  qw * x + qy * z - qz * y;
        let iy =  qw * y + qz * x - qx * z;
        let iz =  qw * z + qx * y - qy * x;
        let iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        ref[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        ref[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        ref[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        ref[3] = vector[3];
        return ref;
    }

    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     * @param {Vec4} a The first vector.
     * @param {Vec4} b The second vector.
     * @returns {boolean} True if the vectors are equal, false otherwise.
     */
    static compare(a, b) {
        let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
            b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        return (
            Math.abs(a0 - b0) <=
            1e-5 * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <=
            1e-5 * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <=
            1e-5 * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <=
            1e-5 * Math.max(1.0, Math.abs(a3), Math.abs(b3))
        );
    }

    /**
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     * @param {Vec4} a The first vector.
     * @param {Vec4} b The second vector.
     * @returns {boolean} True if the vectors are equal, false otherwise.
     */
    static equals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }
}
