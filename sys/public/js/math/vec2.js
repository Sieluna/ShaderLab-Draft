export class Vec2 extends Array {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    static get zero() {
        return new Vec2();
    }

    static get up() {
        return new Vec2(0, 1);
    }

    static get down() {
        return new Vec2(0, -1);
    }

    static get left() {
        return new Vec2(-1, 0);
    }

    static get right() {
        return new Vec2(1, 0);
    }

    set(x, y = x) { return x.length ? this.copy(x) : Vec2.set(this, x, y); }

    copy(v) { return Vec2.copy(this, v); }

    add(a, b) { return b ? Vec2.add(this, a, b) : Vec2.add(this, this, a); }

    sub(a, b) { return b ? Vec2.subtract(this, a, b) : Vec2.subtract(this, this, a); }

    multiply(v) { return v.length ? Vec2.multiply(this, this, v) : Vec2.scale(this, this, v); }

    divide(v) { return v.length ? Vec2.divide(this, this, v) : Vec2.scale(this, this, 1 / v); }

    scale(v) { return Vec2.scale(this, this, v); }

    distance(v) { return v ? Vec2.distance(this, v) : Vec2.magnitude(this); }

    squaredDistance(v) { return v ? Vec2.squaredDistance(this, v) : Vec2.squaredMagnitude(this); }

    magnitude() { return Vec2.magnitude(this); }

    squaredMagnitude() { return Vec2.squaredMagnitude(this); }

    negate(v = this) { return Vec2.negate(this, v); }

    inverse(v = this) { return Vec2.inverse(this, v); }

    normalize() { return Vec2.normalize(this, this); }

    dot(v) { return Vec2.dot(this, v); }

    cross(a, b) { return b ? Vec2.cross(a, b) : Vec2.cross(this, a); }

    lerp(v, t) { return Vec2.lerp(this, this, v, t); }

    applyMatrix3(mat3) {return Vec2.transformMat3(this, this, mat3);}

    applyMatrix4(mat4) { return Vec2.transformMat4(this, this, mat4); }

    compare(v) { return Vec2.compare(this, v); }

    equals(v) { return Vec2.equals(this, v); }

    clone() { return new Vec2(this[0], this[1]); }

    fromArray(arr, o = 0) {
        this[0] = arr[o];
        this[1] = arr[o + 1];
        return this;
    }

    toArray(arr = [], o = 0) {
        arr[o] = this[0];
        arr[o + 1] = this[1];
        return arr;
    }

    /**
     * Copy the values from one vec2 to another
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector the source vector
     * @returns {Vec2} ref
     */
    static copy(ref, vector) {
        ref[0] = vector[0];
        ref[1] = vector[1];
        return ref;
    }

    /**
     * Set the components of a vec2 to the given values
     * @param {Vec2} ref the receiving vector
     * @param {number} x X component
     * @param {number} y Y component
     * @returns {Vec2} ref
     */
    static set(ref, x, y) {
        ref[0] = x;
        ref[1] = y;
        return ref;
    }

    /**
     * Adds two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {Vec2} ref
     */
    static add(ref, a, b) {
        ref[0] = a[0] + b[0];
        ref[1] = a[1] + b[1];
        return ref;
    }

    /**
     * Subtracts vector b from vector a
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {Vec2} ref
     */
    static subtract(ref, a, b) {
        ref[0] = a[0] - b[0];
        ref[1] = a[1] - b[1];
        return ref;
    }

    /**
     * Multiplies two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {Vec2} ref
     */
    static multiply(ref, a, b) {
        ref[0] = a[0] * b[0];
        ref[1] = a[1] * b[1];
        return ref;
    }

    /**
     * Divides two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {Vec2} ref
     */
    static divide(ref, a, b) {
        ref[0] = a[0] / b[0];
        ref[1] = a[1] / b[1];
        return ref;
    }

    /**
     * floor vec2
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector vector to floor
     * @return {Vec2} ref
     */
    static floor(ref, vector) {
        ref[0] = Math.floor(vector[0]);
        ref[1] = Math.floor(vector[1]);
        return ref;
    }

    /**
     * Minimum of two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @return {Vec2} ref
     */
    static min(ref, a, b) {
        ref[0] = Math.min(a[0], b[0]);
        ref[1] = Math.min(a[1], b[1]);
        return ref;
    }

    /**
     * Maximum of two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @return {Vec2} ref
     */
    static max(ref, a, b) {
        ref[0] = Math.max(a[0], b[0]);
        ref[1] = Math.max(a[1], b[1]);
        return ref;
    }

    /**
     * Scales a vec2 by a scalar number
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector the vector to scale
     * @param {number} scale amount to scale the vector by
     * @returns {Vec2} ref
     */
    static scale(ref, vector, scale) {
        ref[0] = vector[0] * scale;
        ref[1] = vector[1] * scale;
        return ref;
    }

    /**
     * Calculates the euclidian distance between two vec2's
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {number} distance between a and b
     */
    static distance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1];
        return Math.hypot(x, y);
    }

    /**
     * Calculates the squared euclidian distance between two vec2's
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {number} squared distance between a and b
     */
    static squaredDistance(a, b) {
        let x = b[0] - a[0],
            y = b[1] - a[1];
        return x * x + y * y;
    }

    /**
     * Calculates the length of a vec2
     * @param {Vec2} vector vector to calculate length of
     * @returns {number} length of vector
     */
    static magnitude(vector) {
        let x = vector[0],
            y = vector[1];
        return Math.hypot(x, y);
    }

    /**
     * Calculates the squared length of a vec2
     * @param {Vec2} vector vector to calculate squared length of
     * @returns {number} squared length of vector
     */
    static squaredMagnitude(vector) {
        let x = vector[0],
            y = vector[1];
        return x * x + y * y;
    }

    /**
     * Negates the components of a vec2
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector vector to negate
     * @returns {Vec2} ref
     */
    static negate(ref, vector) {
        ref[0] = -vector[0];
        ref[1] = -vector[1];
        return ref;
    }

    /**
     * Returns the inverse of the components of a vec2
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector vector to invert
     * @returns {Vec2} ref
     */
    static inverse(ref, vector) {
        ref[0] = 1.0 / vector[0];
        ref[1] = 1.0 / vector[1];
        return ref;
    }

    /**
     * Normalize a vec2
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector vector to normalize
     * @returns {Vec2} ref
     */
    static normalize(ref, vector) {
        let x = vector[0],
            y = vector[1];
        let len = x * x + y * y;
        if (len > 0) len = 1 / Math.sqrt(len);
        ref[0] = vector[0] * len;
        ref[1] = vector[1] * len;
        return ref;
    }

    /**
     * Calculates the dot product of two vec2's
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {number} dot product of a and b
     */
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }

    /**
     * Computes the cross product of two vec2's
     * Note that the cross product returns a scalar
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {number} cross product of a and b
     */
    static cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    }

    /**
     * Performs a linear interpolation between two vec2's
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @param {number} t interpolation amount between the two inputs
     * @returns {Vec2} ref
     */
    static lerp(ref, a, b, t) {
        let ax = a[0],
            ay = a[1];
        ref[0] = ax + t * (b[0] - ax);
        ref[1] = ay + t * (b[1] - ay);
        return ref;
    }

    /**
     * Transforms the vec2 with a mat3
     * 3rd vector component is implicitly '1'
     *
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector the vector to transform
     * @param {Mat3} matrix matrix to transform with
     * @returns {Vec2} ref
     */
    static transformMat3(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1];
        ref[0] = matrix[0] * x + matrix[3] * y + matrix[6];
        ref[1] = matrix[1] * x + matrix[4] * y + matrix[7];
        return ref;
    }

    /**
     * Transforms the vec2 with a mat4
     * 3rd vector component is implicitly '0'
     * 4th vector component is implicitly '1'
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} vector the vector to transform
     * @param {Mat4} matrix matrix to transform with
     * @returns {Vec2} ref
     */
    static transformMat4(ref, vector, matrix) {
        let x = vector[0],
            y = vector[1];
        ref[0] = matrix[0] * x + matrix[4] * y + matrix[12];
        ref[1] = matrix[1] * x + matrix[5] * y + matrix[13];
        return ref;
    }

    /**
     * Rotate a vec2
     * @param {Vec2} ref the receiving vector
     * @param {Vec2} a the vector2 point to rotate
     * @param {Vec2} b the origin of the rotation
     * @param {number} rad the angle of rotation in radians
     */
    static rotate(ref, a, b, rad) {
        //Translate point to the origin
        let p0 = a[0] - b[0],
            p1 = a[1] - b[1],
            sinC = Math.sin(rad),
            cosC = Math.cos(rad);

        //perform rotation and translate to correct position
        ref[0] = p0 * cosC - p1 * sinC + b[0];
        ref[1] = p0 * sinC + p1 * cosC + b[1];

        return ref;
    }

    /**
     * Get the angle between two vec2
     * @param {Vec2} a the first operand
     * @param {Vec2} b the second operand
     * @returns {number} the angle in radians
     */
    static angle(a, b) {
        let x1 = a[0], y1 = a[1],
            x2 = b[0], y2 = b[1],
            // mag is the product of the magnitudes of a and b
            mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)),
            // mag &&.. short circuits if mag == 0
            cosine = mag && (x1 * x2 + y1 * y2) / mag;
        // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
        return Math.acos(Math.min(Math.max(cosine, -1), 1));
    }

    /**
     * Returns whether or not the vectors have approximately the same elements in the same position.
     * @param {Vec2} a the first vector.
     * @param {Vec2} b the second vector.
     * @return {boolean} true if the vectors are equal, false otherwise
     */
    static compare(a, b) {
        let a0 = a[0], a1 = a[1],
            b0 = b[0], b1 = b[1];
        return (
            Math.abs(a0 - b0) <=
            1e-5 * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <=
            1e-5 * Math.max(1.0, Math.abs(a1), Math.abs(b1))
        );
    }

    /**
     * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
     * @param {Vec2} a the first vector.
     * @param {Vec2} b the second vector.
     * @returns {boolean} True if the vectors are equal, false otherwise.
     */
    static equals(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }

}
