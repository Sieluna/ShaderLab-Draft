export class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
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
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    static get up() {
        return new Vec3(0, 1, 0);
    }

    static get down() {
        return new Vec3(0, -1, 0);
    }

    static get left() {
        return new Vec3(-1, 0, 0);
    }

    static get right() {
        return new Vec3(1, 0, 0);
    }

    static get forward() {
        return new Vec3(0, 0, 1);
    }

    static get back() {
        return new Vec3(0, 0, -1);
    }

    set(x, y = x, z = x) { return x.length ? this.copy(x) : Vec3.set(this, x, y, z); }

    copy(v) { return Vec3.copy(this, v); }

    add(a, b) { return b ? Vec3.add(this, a, b) : Vec3.add(this, this, a); }

    sub(a, b) { return b ? Vec3.subtract(this, a, b) : Vec3.subtract(this, this, a); }

    multiply(v) { return v.length ? Vec3.multiply(this, this, v) : Vec3.scale(this, this, v); }

    divide(v) { return v.length ? Vec3.divide(this, this, v) : Vec3.scale(this, this, 1 / v); }

    scale(v) { return Vec3.scale(this, this, v); }

    distance(v) { return v ? Vec3.distance(this, v) : Vec3.magnitude(this); }

    squaredDistance(v) { return v ? Vec3.squaredDistance(this, v) : Vec3.squaredMagnitude(this); }

    magnitude() { return Vec3.magnitude(this); }

    squaredMagnitude() { return Vec3.squaredMagnitude(this); }

    negate(v = this) { return Vec3.negate(this, v); }

    inverse(v = this) { return Vec3.inverse(this, v); }

    normalize() { return Vec3.normalize(this, this); }

    dot(v) { return Vec3.dot(this, v); }

    cross(a, b) { return b ? Vec3.cross(this, a, b) : Vec3.cross(this, this, a); }

    lerp(v, t) { return Vec3.lerp(this, this, v, t); }

    applyMatrix3(mat3) { return Vec3.transformMat3(this, this, mat3); }

    applyMatrix4(mat4) { return Vec3.transformMat4(this, this, mat4); }

    scaleRotateMatrix4(mat4) { return Vec3.scaleRotateMat4(this, this, mat4); }

    applyQuaternion(q) { return Vec3.transformQuat(this, this, q); }

    angle(v) { return Vec3.angle(this, v); }

    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize();
    }

    compare(v) { return Vec3.compare(this, v); }

    equals(v) { return Vec3.equals(this, v); }

    clone() { return new Vec3(this[0], this[1], this[2]); }

    fromArray(arr, o = 0) {
        this[0] = arr[o];
        this[1] = arr[o + 1];
        this[2] = arr[o + 2];
        return this;
    }

    toArray(arr = [], o = 0) {
        arr[o] = this[0];
        arr[o + 1] = this[1];
        arr[o + 2] = this[2];
        return arr;
    }

    /**
     * Copy the values from one vec3 to another
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector the source vector
     * @returns {Vec3} ref
     */
    static copy(ref, vector) {
        ref[0] = vector[0];
        ref[1] = vector[1];
        ref[2] = vector[2];
        return ref;
    }

    /**
     * Set the components of a vec3 to the given values
     * @param {Vec3} ref the receiving vector
     * @param {number} x X component
     * @param {number} y Y component
     * @param {number} z Z component
     * @returns {Vec3} ref
     */
    static set(ref, x, y, z) {
        ref[0] = x;
        ref[1] = y;
        ref[2] = z;
        return ref;
    }

    /**
     * Adds two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Vec3} ref
     */
    static add(ref, a, b) {
        ref[0] = a[0] + b[0];
        ref[1] = a[1] + b[1];
        ref[2] = a[2] + b[2];
        return ref;
    }

    /**
     * Subtracts vector b from vector a
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Vec3} ref
     */
    static subtract(ref, a, b) {
        ref[0] = a[0] - b[0];
        ref[1] = a[1] - b[1];
        ref[2] = a[2] - b[2];
        return ref;
    }

    /**
     * Multiplies two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Vec3} ref
     */
    static multiply(ref, a, b) {
        ref[0] = a[0] * b[0];
        ref[1] = a[1] * b[1];
        ref[2] = a[2] * b[2];
        return ref;
    }

    /**
     * Divides two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Vec3} ref
     */
    static divide(ref, a, b) {
        ref[0] = a[0] / b[0];
        ref[1] = a[1] / b[1];
        ref[2] = a[2] / b[2];
        return ref;
    }

    /**
     * floor vec3
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector vector to floor
     * @return {Vec3} ref
     */
    static floor(ref, vector) {
        ref[0] = Math.floor(vector[0]);
        ref[1] = Math.floor(vector[1]);
        ref[2] = Math.floor(vector[2]);
        return ref;
    }

    /**
     * Minimum of two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @return {Vec3} ref
     */
    static min(ref, a, b) {
        ref[0] = Math.min(a[0], b[0]);
        ref[1] = Math.min(a[1], b[1]);
        ref[2] = Math.min(a[2], b[2]);
        return ref;
    }

    /**
     * Maximum of two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @return {Vec3} ref
     */
    static max(ref, a, b) {
        ref[0] = Math.max(a[0], b[0]);
        ref[1] = Math.max(a[1], b[1]);
        ref[2] = Math.max(a[2], b[2]);
        return ref;
    }

    /**
     * Scales a vec3 by a scalar number
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector the vector to scale
     * @param {number} scale amount to scale the vector by
     * @returns {Vec3} ref
     */
    static scale(ref, vector, scale) {
        ref[0] = vector[0] * scale;
        ref[1] = vector[1] * scale;
        ref[2] = vector[2] * scale;
        return ref;
    }

    /**
     * Calculates the euclidian distance between two vec3's
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Number} distance between a and b
     */
    static distance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2];
        return Math.hypot(x, y, z);
    }

    /**
     * Calculates the squared euclidian distance between two vec3's
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Number} squared distance between a and b
     */
    static squaredDistance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1],
            z = b[2] - a[2];
        return x * x + y * y + z * z;
    }

    /**
     * Calculates the length of a vec3
     * @param {Vec3} vector vector to calculate length of
     * @returns {number} length of vector
     */
    static magnitude(vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        return Math.hypot(x, y, z);
    }

    /**
     * Calculates the squared length of a vec3
     * @param {Vec3} vector vector to calculate squared length of
     * @returns {number} squared length of vector
     */
    static squaredMagnitude(vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        return x * x + y * y + z * z;
    }

    /**
     * Negates the components of a vec3
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector vector to negate
     * @returns {Vec3} ref
     */
    static negate(ref, vector) {
        ref[0] = -vector[0];
        ref[1] = -vector[1];
        ref[2] = -vector[2];
        return ref;
    }

    /**
     * Returns the inverse of the components of a vec3
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector vector to invert
     * @returns {Vec3} ref
     */
    static inverse(ref, vector) {
        ref[0] = 1.0 / vector[0];
        ref[1] = 1.0 / vector[1];
        ref[2] = 1.0 / vector[2];
        return ref;
    }

    /**
     * Normalize a vec3
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector vector to normalize
     * @returns {Vec3} ref
     */
    static normalize(ref, vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        let len = x * x + y * y + z * z;
        if (len > 0) len = 1 / Math.sqrt(len);
        ref[0] = vector[0] * len;
        ref[1] = vector[1] * len;
        ref[2] = vector[2] * len;
        return ref;
    }

    /**
     * Calculates the dot product of two vec3's
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {number} dot product of a and b
     */
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    /**
     * Computes the cross product of two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @returns {Vec3} ref
     */
    static cross(ref, a, b) {
        let ax = a[0], ay = a[1], az = a[2],
            bx = b[0], by = b[1], bz = b[2];
        ref[0] = ay * bz - az * by;
        ref[1] = az * bx - ax * bz;
        ref[2] = ax * by - ay * bx;
        return ref;
    }

    /**
     * Performs a linear interpolation between two vec3's
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @param {number} t interpolation amount between the two inputs
     * @returns {Vec3} ref
     */
    static lerp(ref, a, b, t) {
        let ax = a[0], ay = a[1], az = a[2];
        ref[0] = ax + t * (b[0] - ax);
        ref[1] = ay + t * (b[1] - ay);
        ref[2] = az + t * (b[2] - az);
        return ref;
    }

    /**
     * Transforms the vec3 with a mat4.
     * 4th vector component is implicitly '1'
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector the vector to transform
     * @param {Mat4} matrix matrix to transform with
     * @returns {Vec3} ref
     */
    static transformMat4(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        w = w || 1.0;
        ref[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w;
        ref[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w;
        ref[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w;
        return ref;
    }

    /**
     * Same as {@link transformMat4} but doesn't apply translation.
     * Useful for rays.
     */
    static scaleRotateMat4(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        w = w || 1.0;
        ref[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z) / w;
        ref[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z) / w;
        ref[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z) / w;
        return ref;
    }

    /**
     * Transforms the vec3 with a mat3.
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector the vector to transform
     * @param {Mat3} matrix the 3x3 matrix to transform with
     * @returns {Vec3} ref
     */
    static transformMat3(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        ref[0] = x * matrix[0] + y * matrix[3] + z * matrix[6];
        ref[1] = x * matrix[1] + y * matrix[4] + z * matrix[7];
        ref[2] = x * matrix[2] + y * matrix[5] + z * matrix[8];
        return ref;
    }

    /**
     * Transforms the vec3 with a quat
     * @param {Vec3} ref the receiving vector
     * @param {Vec3} vector the vector to transform
     * @param {Quat} quat quaternion to transform with
     * @returns {Vec3} ref
     */
    static transformQuat(ref, vector, quat) {
        let x = vector[0], y = vector[1], z = vector[2];
        let qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

        let uvx = qy * z - qz * y,
            uvy = qz * x - qx * z,
            uvz = qx * y - qy * x;

        let uuvx = qy * uvz - qz * uvy,
            uuvy = qz * uvx - qx * uvz,
            uuvz = qx * uvy - qy * uvx;

        let w2 = qw * 2;
        uvx *= w2;
        uvy *= w2;
        uvz *= w2;

        uuvx *= 2;
        uuvy *= 2;
        uuvz *= 2;

        ref[0] = x + uvx + uuvx;
        ref[1] = y + uvy + uuvy;
        ref[2] = z + uvz + uuvz;
        return ref;
    }

    /**
     * Rotate a vec3 around the x-axis
     * @param {Vec3} ref the receiving vec3
     * @param {Vec3} a the vec3 point to rotate
     * @param {Vec3} b the origin of the rotation
     * @param {number} rad the angle of rotation in radians
     * @return {Vec3} ref
     */
    static rotateX(ref, a, b, rad) {
        let p = [], r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0];
        r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
        r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);

        //translate to correct position
        ref[0] = r[0] + b[0];
        ref[1] = r[1] + b[1];
        ref[2] = r[2] + b[2];

        return ref;
    }

    /**
     * Rotate a vec3 around the y-axis
     * @param {Vec3} ref the receiving vec3
     * @param {Vec3} a the vec3 point to rotate
     * @param {Vec3} b the origin of the rotation
     * @param {number} rad the angle of rotation in radians
     * @returns {Vec3} ref
     */
    static rotateY(ref, a, b, rad) {
        let p = [], r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);

        //translate to correct position
        ref[0] = r[0] + b[0];
        ref[1] = r[1] + b[1];
        ref[2] = r[2] + b[2];

        return ref;
    }

    /**
     * Rotate a vec3 around the z-axis
     * @param {Vec3} ref the receiving vec3
     * @param {Vec3} a the vec3 point to rotate
     * @param {Vec3} b the origin of the rotation
     * @param {number} rad the angle of rotation in radians
     * @returns {Vec3} ref
     */
    static rotateZ(ref, a, b, rad) {
        let p = [], r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
        r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
        r[2] = p[2];

        //translate to correct position
        ref[0] = r[0] + b[0];
        ref[1] = r[1] + b[1];
        ref[2] = r[2] + b[2];

        return ref;
    }

    /**
     * Get the angle between two vec3s
     * @param {Vec3} a the first operand
     * @param {Vec3} b the second operand
     * @return {number} the angle in radians
     */
    static angle(a, b) {
        let ax = a[0], ay = a[1], az = a[2],
            bx = b[0], by = b[1], bz = b[2],
            mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz)),
            cosine = mag && Vec3.dot(a, b) / mag;
        return Math.acos(Math.min(Math.max(cosine, -1), 1));
    }

    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     * @param {Vec3} a the first vector.
     * @param {Vec3} b the second vector.
     * @return {boolean} true if the vectors are equal, false otherwise.
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
     * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
     * @param {Vec3} a The first vector.
     * @param {Vec3} b The second vector.
     * @returns {boolean} True if the vectors are equal, false otherwise.
     */
     static equals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }
}
