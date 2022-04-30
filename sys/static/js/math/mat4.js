import { Vec3 } from "./vec3.js";

export class Mat4 extends Array {
    constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0,
                m10 = 0, m11 = 1, m12 = 0, m13 = 0,
                m20 = 0, m21 = 0, m22 = 1, m23 = 0,
                m30 = 0, m31 = 0, m32 = 0, m33 = 1) {
        super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    get x() {
        return this[12];
    }

    get y() {
        return this[13];
    }

    get z() {
        return this[14];
    }

    get w() {
        return this[15];
    }

    set x(v) {
        this[12] = v;
    }

    set y(v) {
        this[13] = v;
    }

    set z(v) {
        this[14] = v;
    }

    set w(v) {
        this[15] = v;
    }

    identity() { return Mat4.identity(this); }

    copy(m) { return Mat4.copy(this, m); }

    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) { return m00.length ? this.copy(m00) : Mat4.set(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33); }

    setPosition(v) { this.x = v[0]; this.y = v[1]; this.z = v[2]; return this; }

    multiply(ma, mb) { return mb ? Mat4.multiply(this, ma, mb) : Mat4.multiply(this, this, ma); }

    translate(v, m = this) { return Mat4.translate(this, m, v); }

    rotate(v, axis, m = this) { return Mat4.rotate(this, m, v, axis); }

    scale(v, m = this) { return Mat4.scale(this, m, typeof v === 'number' ? [v, v, v] : v); }

    fromPerspective({fov, aspect, near, far} = {}) { return Mat4.perspective(this, fov, aspect, near, far); }

    fromOrthogonal({left, right, bottom, top, near, far}) { return Mat4.orthogonal(this, left, right, bottom, top, near, far); }

    fromQuaternion(q) { return Mat4.fromQuat(this, q); }

    inverse(m = this) { return Mat4.invert(this, m); }

    determinant() { return Mat4.determinant(this); }

    compose(q, pos, scale) { return Mat4.fromRotationTranslationScale(this, q, pos, scale); }

    getRotation(q) { return Mat4.getRotation(q, this); }

    getTranslation(pos) { return Mat4.getTranslation(pos, this); }

    getScaling(scale) { return Mat4.getScaling(scale, this); }

    getMaxScaleOnAxis() { return Mat4.getMaxScaleOnAxis(this); }

    lookAt(eye, target, up) { return Mat4.targetTo(this, eye, target, up); }

    compare(m) { return Mat4.compare(this, m); }

    equals(m) { return Mat4.equals(this, m); }

    fromArray(arr, o = 0) {
        this[0] = arr[o];
        this[1] = arr[o + 1];
        this[2] = arr[o + 2];
        this[3] = arr[o + 3];
        this[4] = arr[o + 4];
        this[5] = arr[o + 5];
        this[6] = arr[o + 6];
        this[7] = arr[o + 7];
        this[8] = arr[o + 8];
        this[9] = arr[o + 9];
        this[10] = arr[o + 10];
        this[11] = arr[o + 11];
        this[12] = arr[o + 12];
        this[13] = arr[o + 13];
        this[14] = arr[o + 14];
        this[15] = arr[o + 15];
        return this;
    }

    toArray(arr = [], o = 0) {
        arr[o] = this[0];
        arr[o + 1] = this[1];
        arr[o + 2] = this[2];
        arr[o + 3] = this[3];
        arr[o + 4] = this[4];
        arr[o + 5] = this[5];
        arr[o + 6] = this[6];
        arr[o + 7] = this[7];
        arr[o + 8] = this[8];
        arr[o + 9] = this[9];
        arr[o + 10] = this[10];
        arr[o + 11] = this[11];
        arr[o + 12] = this[12];
        arr[o + 13] = this[13];
        arr[o + 14] = this[14];
        arr[o + 15] = this[15];
        return arr;
    }

    /**
     * Copy the values from one mat4 to another
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the source matrix
     * @returns {Mat4} ref
     */
    static copy(ref, matrix) {
        ref[0]  = matrix[0];  ref[1]  = matrix[1];  ref[2]  = matrix[2];  ref[3]  = matrix[3];
        ref[4]  = matrix[4];  ref[5]  = matrix[5];  ref[6]  = matrix[6];  ref[7]  = matrix[7];
        ref[8]  = matrix[8];  ref[9]  = matrix[9];  ref[10] = matrix[10]; ref[11] = matrix[11];
        ref[12] = matrix[12]; ref[13] = matrix[13]; ref[14] = matrix[14]; ref[15] = matrix[15];
        return ref;
    }

    /**
     * Set the components of a mat4 to the given values
     * @param {Mat4} ref the receiving matrix
     * @param {number} m00 Component in column 0, row 0 position (index 0)
     * @param {number} m01 Component in column 0, row 1 position (index 1)
     * @param {number} m02 Component in column 0, row 2 position (index 2)
     * @param {number} m03 Component in column 0, row 3 position (index 3)
     * @param {number} m10 Component in column 1, row 0 position (index 4)
     * @param {number} m11 Component in column 1, row 1 position (index 5)
     * @param {number} m12 Component in column 1, row 2 position (index 6)
     * @param {number} m13 Component in column 1, row 3 position (index 7)
     * @param {number} m20 Component in column 2, row 0 position (index 8)
     * @param {number} m21 Component in column 2, row 1 position (index 9)
     * @param {number} m22 Component in column 2, row 2 position (index 10)
     * @param {number} m23 Component in column 2, row 3 position (index 11)
     * @param {number} m30 Component in column 3, row 0 position (index 12)
     * @param {number} m31 Component in column 3, row 1 position (index 13)
     * @param {number} m32 Component in column 3, row 2 position (index 14)
     * @param {number} m33 Component in column 3, row 3 position (index 15)
     * @returns {Mat4} ref
     */
    static set(ref, m00, m01, m02, m03,
                    m10, m11, m12, m13,
                    m20, m21, m22, m23,
                    m30, m31, m32, m33) {
        ref[0]  = m00; ref[1]  = m01; ref[2]  = m02; ref[3]  = m03;
        ref[4]  = m10; ref[5]  = m11; ref[6]  = m12; ref[7]  = m13;
        ref[8]  = m20; ref[9]  = m21; ref[10] = m22; ref[11] = m23;
        ref[12] = m30; ref[13] = m31; ref[14] = m32; ref[15] = m33;
        return ref;
    }


    /**
     * Set a mat4 to the identity matrix
     * @param {Mat4} ref the receiving matrix
     * @returns {Mat4} ref
     */
    static identity(ref) {
        ref[0]  = 1; ref[1]  = 0; ref[2]  = 0; ref[3]  = 0;
        ref[4]  = 0; ref[5]  = 1; ref[6]  = 0; ref[7]  = 0;
        ref[8]  = 0; ref[9]  = 0; ref[10] = 1; ref[11] = 0;
        ref[12] = 0; ref[13] = 0; ref[14] = 0; ref[15] = 1;
        return ref;
    }

    /**
     * Transpose the values of a mat4
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the source matrix
     * @returns {Mat4} ref
     */
    static transpose(ref, matrix) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (ref === matrix) {
            let a01 = matrix[1],  a02 = matrix[2],  a03 = matrix[3],
                a12 = matrix[6],  a13 = matrix[7],
                a23 = matrix[11];
                             ref[1]  = matrix[4]; ref[2]  = matrix[8]; ref[3]  = matrix[12];
            ref[4]  = a01;                        ref[6]  = matrix[9]; ref[7]  = matrix[13];
            ref[8]  = a02;   ref[9]  = a12;                            ref[11] = matrix[14];
            ref[12] = a03;   ref[13] = a13;       ref[14] = a23;
        } else {
            ref[0] = matrix[0];  ref[1]  = matrix[4]; ref[2]  = matrix[8];  ref[3]  = matrix[12];
            ref[4] = matrix[1];  ref[5]  = matrix[5]; ref[6]  = matrix[9];  ref[7]  = matrix[13];
            ref[8] = matrix[2];  ref[9]  = matrix[6]; ref[10] = matrix[10]; ref[11] = matrix[14];
            ref[12] = matrix[3]; ref[13] = matrix[7]; ref[14] = matrix[11]; ref[15] = matrix[15];
        }
        return ref;
    }

    /**
     * Inverts a mat4
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the source matrix
     * @returns {Mat4} ref
     */
    static invert(ref, matrix) {
        let m00 = matrix[0],  m01 = matrix[1],  m02 = matrix[2],  m03 = matrix[3],
            m10 = matrix[4],  m11 = matrix[5],  m12 = matrix[6],  m13 = matrix[7],
            m20 = matrix[8],  m21 = matrix[9],  m22 = matrix[10], m23 = matrix[11],
            m30 = matrix[12], m31 = matrix[13], m32 = matrix[14], m33 = matrix[15];

        let b00 = m00 * m11 - m01 * m10;
        let b01 = m00 * m12 - m02 * m10;
        let b02 = m00 * m13 - m03 * m10;
        let b03 = m01 * m12 - m02 * m11;
        let b04 = m01 * m13 - m03 * m11;
        let b05 = m02 * m13 - m03 * m12;
        let b06 = m20 * m31 - m21 * m30;
        let b07 = m20 * m32 - m22 * m30;
        let b08 = m20 * m33 - m23 * m30;
        let b09 = m21 * m32 - m22 * m31;
        let b10 = m21 * m33 - m23 * m31;
        let b11 = m22 * m33 - m23 * m32;

        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) return null;
        det = 1.0 / det;

        ref[0]  = (m11 * b11 - m12 * b10 + m13 * b09) * det;
        ref[1]  = (m02 * b10 - m01 * b11 - m03 * b09) * det;
        ref[2]  = (m31 * b05 - m32 * b04 + m33 * b03) * det;
        ref[3]  = (m22 * b04 - m21 * b05 - m23 * b03) * det;
        ref[4]  = (m12 * b08 - m10 * b11 - m13 * b07) * det;
        ref[5]  = (m00 * b11 - m02 * b08 + m03 * b07) * det;
        ref[6]  = (m32 * b02 - m30 * b05 - m33 * b01) * det;
        ref[7]  = (m20 * b05 - m22 * b02 + m23 * b01) * det;
        ref[8]  = (m10 * b10 - m11 * b08 + m13 * b06) * det;
        ref[9]  = (m01 * b08 - m00 * b10 - m03 * b06) * det;
        ref[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
        ref[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
        ref[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
        ref[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
        ref[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
        ref[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

        return ref;
    }

    /**
     * Calculates the determinant of a mat4
     * @param {Mat4} matrix the source matrix
     * @returns {number} determinant of matrix
     */
    static determinant(matrix) {
        let m00 = matrix[0],  m01 = matrix[1],  m02 = matrix[2],  m03 = matrix[3],
            m10 = matrix[4],  m11 = matrix[5],  m12 = matrix[6],  m13 = matrix[7],
            m20 = matrix[8],  m21 = matrix[9],  m22 = matrix[10], m23 = matrix[11],
            m30 = matrix[12], m31 = matrix[13], m32 = matrix[14], m33 = matrix[15];

        let b0 = m00 * m11 - m01 * m10;
        let b1 = m00 * m12 - m02 * m10;
        let b2 = m01 * m12 - m02 * m11;
        let b3 = m20 * m31 - m21 * m30;
        let b4 = m20 * m32 - m22 * m30;
        let b5 = m21 * m32 - m22 * m31;
        let b6 = m00 * b5 - m01 * b4 + m02 * b3;
        let b7 = m10 * b5 - m11 * b4 + m12 * b3;
        let b8 = m20 * b2 - m21 * b1 + m22 * b0;
        let b9 = m30 * b2 - m31 * b1 + m32 * b0;

        // Calculate the determinant
        return m13 * b6 - m03 * b7 + m33 * b8 - m23 * b9;
    }

    /**
     * Adds two mat4's
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} a the first operand
     * @param {Mat4} b the second operand
     * @return {Mat4} ref
     */
    static add(ref, a, b) {
        ref[0] = a[0] + b[0];
        ref[1] = a[1] + b[1];
        ref[2] = a[2] + b[2];
        ref[3] = a[3] + b[3];
        ref[4] = a[4] + b[4];
        ref[5] = a[5] + b[5];
        ref[6] = a[6] + b[6];
        ref[7] = a[7] + b[7];
        ref[8] = a[8] + b[8];
        ref[9] = a[9] + b[9];
        ref[10] = a[10] + b[10];
        ref[11] = a[11] + b[11];
        ref[12] = a[12] + b[12];
        ref[13] = a[13] + b[13];
        ref[14] = a[14] + b[14];
        ref[15] = a[15] + b[15];
        return ref;
    }

    /**
     * Subtracts matrix b from matrix a
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} a the first operand
     * @param {Mat4} b the second operand
     * @returns {Mat4} ref
     */
    static subtract(ref, a, b) {
        ref[0] = a[0] - b[0];
        ref[1] = a[1] - b[1];
        ref[2] = a[2] - b[2];
        ref[3] = a[3] - b[3];
        ref[4] = a[4] - b[4];
        ref[5] = a[5] - b[5];
        ref[6] = a[6] - b[6];
        ref[7] = a[7] - b[7];
        ref[8] = a[8] - b[8];
        ref[9] = a[9] - b[9];
        ref[10] = a[10] - b[10];
        ref[11] = a[11] - b[11];
        ref[12] = a[12] - b[12];
        ref[13] = a[13] - b[13];
        ref[14] = a[14] - b[14];
        ref[15] = a[15] - b[15];
        return ref;
    }

    /**
     * Multiplies two mat4's
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} a the first operand
     * @param {Mat4} b the second operand
     * @returns {Mat4} out
     */
    static multiply(ref, a, b) {
        let a00 = a[0],  a01 = a[1],  a02 = a[2],  a03 = a[3],
            a10 = a[4],  a11 = a[5],  a12 = a[6],  a13 = a[7],
            a20 = a[8],  a21 = a[9],  a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        // Cache only the current line of the second matrix
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        ref[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        ref[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        ref[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        ref[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        ref[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        ref[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        ref[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        ref[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        ref[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        ref[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        ref[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        ref[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        ref[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        ref[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        ref[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        ref[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return ref;
    }

    /**
     * Scales the mat4 by the dimensions in the given vector3 not using vectorization
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the matrix to scale
     * @param {Vec3} vector the vector3 to scale the matrix by
     * @returns {Mat4} out
     **/
    static scale(ref, matrix, vector) {
        let x = vector[0],
            y = vector[1],
            z = vector[2];
        ref[0]  = matrix[0] * x; ref[1]  = matrix[1] * x; ref[2]  = matrix[2]  * x; ref[3]  = matrix[3]  * x;
        ref[4]  = matrix[4] * y; ref[5]  = matrix[5] * y; ref[6]  = matrix[6]  * y; ref[7]  = matrix[7]  * y;
        ref[8]  = matrix[8] * z; ref[9]  = matrix[9] * z; ref[10] = matrix[10] * z; ref[11] = matrix[11] * z;
        ref[12] = matrix[12];    ref[13] = matrix[13];    ref[14] = matrix[14];     ref[15] = matrix[15];
        return ref;
    }

    /**
     * Translate a mat4 by the given vector
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the matrix to translate
     * @param {Vec3} vector vector3 to translate by
     * @returns {Mat4} ref
     */
    static translate(ref, matrix, vector) {
        let m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            x = vector[0], y = vector[1], z = vector[2];

        if (matrix === ref) {
            ref[12] = matrix[0] * x + matrix[4] * y + matrix[8]  * z + matrix[12];
            ref[13] = matrix[1] * x + matrix[5] * y + matrix[9]  * z + matrix[13];
            ref[14] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
            ref[15] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        } else {
            m00 = matrix[0]; m01 = matrix[1]; m02 = matrix[2];  m03 = matrix[3];
            m10 = matrix[4]; m11 = matrix[5]; m12 = matrix[6];  m13 = matrix[7];
            m20 = matrix[8]; m21 = matrix[9]; m22 = matrix[10]; m23 = matrix[11];

            ref[0] = m00; ref[1] = m01; ref[2] = m02;  ref[3] = m03;
            ref[4] = m10; ref[5] = m11; ref[6] = m12;  ref[7] = m13;
            ref[8] = m20; ref[9] = m21; ref[10] = m22; ref[11] = m23;

            ref[12] = m00 * x + m10 * y + m20 * z + matrix[12];
            ref[13] = m01 * x + m11 * y + m21 * z + matrix[13];
            ref[14] = m02 * x + m12 * y + m22 * z + matrix[14];
            ref[15] = m03 * x + m13 * y + m23 * z + matrix[15];
        }

        return ref;
    }

    /**
     * Rotates a mat4 by the given angle around the given axis
     * @param {Mat4} ref the receiving matrix
     * @param {Mat4} matrix the matrix to rotate
     * @param {number} rad the angle to rotate the matrix by
     * @param {Vec3} axis the axis to rotate around
     * @returns {Mat4} out
     */
    static rotate(ref, matrix, rad, axis) {
        let x = axis[0],
            y = axis[1],
            z = axis[2];
        let len = Math.hypot(x, y, z);
        let s, c, t;
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        let b00, b01, b02;
        let b10, b11, b12;
        let b20, b21, b22;

        if (len < 1e-5) return null;

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        s = Math.sin(rad);
        c = Math.cos(rad);
        t = 1 - c;

        a00 = matrix[0]; a01 = matrix[1]; a02 = matrix[2];  a03 = matrix[3];
        a10 = matrix[4]; a11 = matrix[5]; a12 = matrix[6];  a13 = matrix[7];
        a20 = matrix[8]; a21 = matrix[9]; a22 = matrix[10]; a23 = matrix[11];

        // Construct the elements of the rotation matrix
        b00 = x * x * t + c;
        b01 = y * x * t + z * s;
        b02 = z * x * t - y * s;
        b10 = x * y * t - z * s;
        b11 = y * y * t + c;
        b12 = z * y * t + x * s;
        b20 = x * z * t + y * s;
        b21 = y * z * t - x * s;
        b22 = z * z * t + c;

        // Perform rotation-specific matrix multiplication
        ref[0] = a00 * b00 + a10 * b01 + a20 * b02;
        ref[1] = a01 * b00 + a11 * b01 + a21 * b02;
        ref[2] = a02 * b00 + a12 * b01 + a22 * b02;
        ref[3] = a03 * b00 + a13 * b01 + a23 * b02;
        ref[4] = a00 * b10 + a10 * b11 + a20 * b12;
        ref[5] = a01 * b10 + a11 * b11 + a21 * b12;
        ref[6] = a02 * b10 + a12 * b11 + a22 * b12;
        ref[7] = a03 * b10 + a13 * b11 + a23 * b12;
        ref[8] = a00 * b20 + a10 * b21 + a20 * b22;
        ref[9] = a01 * b20 + a11 * b21 + a21 * b22;
        ref[10] = a02 * b20 + a12 * b21 + a22 * b22;
        ref[11] = a03 * b20 + a13 * b21 + a23 * b22;

        if (matrix !== ref) {
            // If the source and destination differ, copy the unchanged last row
            ref[12] = matrix[12];
            ref[13] = matrix[13];
            ref[14] = matrix[14];
            ref[15] = matrix[15];
        }
        return ref;
    }

    /**
     * Returns the translation vector component of a transformation matrix. If a matrix is built with fromRotationTranslation, the returned vector will be the same as the translation vector originally supplied.
     * @param  {Vec3} ref Vector to receive translation component
     * @param  {Mat4} matrix Matrix to be decomposed (input)
     * @return {Vec3} ref
     */
    static getTranslation(ref, matrix) {
        ref[0] = matrix[12];
        ref[1] = matrix[13];
        ref[2] = matrix[14];
        return ref;
    }

    /**
     * Returns the scaling factor component of a transformation matrix. If a matrix is built with fromRotationTranslationScale with a normalized Quaternion paramter, the returned vector will be the same as the scaling vector originally supplied.
     * @param  {Vec3} ref Vector to receive scaling factor component
     * @param  {Mat4} matrix Matrix to be decomposed (input)
     * @return {Vec3} ref
     */
    static getScaling(ref, matrix) {
        let m11 = matrix[0], m12 = matrix[1], m13 = matrix[2],
            m21 = matrix[4], m22 = matrix[5], m23 = matrix[6],
            m31 = matrix[8], m32 = matrix[9], m33 = matrix[10];

        ref[0] = Math.hypot(m11, m12, m13);
        ref[1] = Math.hypot(m21, m22, m23);
        ref[2] = Math.hypot(m31, m32, m33);

        return ref;
    }

    /**
     * Returns the scaling factor component of a transformation matrix
     * @param {Mat4} matrix Matrix to be decomposed (input)
     * @return {number}
     */
    static getMaxScaleOnAxis(matrix) {
        let m11 = matrix[0], m12 = matrix[1], m13 = matrix[2],
            m21 = matrix[4], m22 = matrix[5], m23 = matrix[6],
            m31 = matrix[8], m32 = matrix[9], m33 = matrix[10];

        const x = m11 * m11 + m12 * m12 + m13 * m13;
        const y = m21 * m21 + m22 * m22 + m23 * m23;
        const z = m31 * m31 + m32 * m32 + m33 * m33;

        return Math.sqrt(Math.max(x, y, z));
    }

    /**
     * Returns a quaternion representing the rotational component of a transformation matrix. If a matrix is built with fromRotationTranslation, the returned quaternion will be the same as the quaternion originally supplied.
     * @param {Quat} ref Quaternion to receive the rotation component
     * @param {Mat4} matrix Matrix to be decomposed (input)
     * @return {Quat} ref
     */
    static getRotation(ref, matrix) {
        let scaling = new Vec3();
        Mat4.getScaling(scaling, matrix);

        let is1 = 1 / scaling[0];
        let is2 = 1 / scaling[1];
        let is3 = 1 / scaling[2];

        let sm11 = matrix[0] * is1;
        let sm12 = matrix[1] * is2;
        let sm13 = matrix[2] * is3;
        let sm21 = matrix[4] * is1;
        let sm22 = matrix[5] * is2;
        let sm23 = matrix[6] * is3;
        let sm31 = matrix[8] * is1;
        let sm32 = matrix[9] * is2;
        let sm33 = matrix[10] * is3;

        let trace = sm11 + sm22 + sm33;
        let S = 0;

        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            ref[3] = 0.25 * S;
            ref[0] = (sm23 - sm32) / S;
            ref[1] = (sm31 - sm13) / S;
            ref[2] = (sm12 - sm21) / S;
        } else if (sm11 > sm22 && sm11 > sm33) {
            S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
            ref[3] = (sm23 - sm32) / S;
            ref[0] = 0.25 * S;
            ref[1] = (sm12 + sm21) / S;
            ref[2] = (sm31 + sm13) / S;
        } else if (sm22 > sm33) {
            S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
            ref[3] = (sm31 - sm13) / S;
            ref[0] = (sm12 + sm21) / S;
            ref[1] = 0.25 * S;
            ref[2] = (sm23 + sm32) / S;
        } else {
            S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
            ref[3] = (sm12 - sm21) / S;
            ref[0] = (sm31 + sm13) / S;
            ref[1] = (sm23 + sm32) / S;
            ref[2] = 0.25 * S;
        }

        return ref;
    }

    /**
     * Creates a matrix from a quaternion rotation, vector translation and vector scale
     * This is equivalent to (but much faster than):
     *
     *     Mat4.identity(dest);
     *     Mat4.translate(dest, vec);
     *     let quatMat = new Mat4();
     *     Quat.toMat4(quat, quatMat);
     *     Mat4.multiply(dest, quatMat);
     *     Mat4.scale(dest, scale)
     *
     * @param {Mat4} ref mat4 receiving operation result
     * @param {Quat} quat Rotation quaternion
     * @param {Vec3} vector Translation vector
     * @param {Vec3} scale Scaling vector
     * @returns {Mat4} out
     */
    static fromRotationTranslationScale(ref, quat, vector, scale) {
        // Quaternion math
        let x = quat[0], y = quat[1], z = quat[2], w = quat[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let xy = x * y2;
        let xz = x * z2;
        let yy = y * y2;
        let yz = y * z2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;
        let sx = scale[0];
        let sy = scale[1];
        let sz = scale[2];

        ref[0] = (1 - (yy + zz)) * sx;
        ref[1] = (xy + wz) * sx;
        ref[2] = (xz - wy) * sx;
        ref[3] = 0;
        ref[4] = (xy - wz) * sy;
        ref[5] = (1 - (xx + zz)) * sy;
        ref[6] = (yz + wx) * sy;
        ref[7] = 0;
        ref[8] = (xz + wy) * sz;
        ref[9] = (yz - wx) * sz;
        ref[10] = (1 - (xx + yy)) * sz;
        ref[11] = 0;
        ref[12] = vector[0];
        ref[13] = vector[1];
        ref[14] = vector[2];
        ref[15] = 1;

        return ref;
    }

    /**
     * Calculates a 4x4 matrix from the given quaternion
     * @param {Mat4} ref mat4 receiving operation result
     * @param {Quat} quat Quaternion to create matrix from
     * @returns {Mat4} ref
     */
    static fromQuat(ref, quat) {
        let x = quat[0],
            y = quat[1],
            z = quat[2],
            w = quat[3];
        let x2 = x + x;
        let y2 = y + y;
        let z2 = z + z;

        let xx = x * x2;
        let yx = y * x2;
        let yy = y * y2;
        let zx = z * x2;
        let zy = z * y2;
        let zz = z * z2;
        let wx = w * x2;
        let wy = w * y2;
        let wz = w * z2;

        ref[0] = 1 - yy - zz;
        ref[1] = yx + wz;
        ref[2] = zx - wy;
        ref[3] = 0;

        ref[4] = yx - wz;
        ref[5] = 1 - xx - zz;
        ref[6] = zy + wx;
        ref[7] = 0;

        ref[8] = zx + wy;
        ref[9] = zy - wx;
        ref[10] = 1 - xx - yy;
        ref[11] = 0;

        ref[12] = 0;
        ref[13] = 0;
        ref[14] = 0;
        ref[15] = 1;

        return ref;
    }

    /**
     * Generates a perspective projection matrix with the given bounds.
     * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
     * which matches WebGL/OpenGL's clip volume.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     * @param {Mat4} ref mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {Mat4} out
     */
    static perspective(ref, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        ref[0]  = f / aspect; ref[1]  = 0;    ref[2] = 0;   ref[3]  = 0;
        ref[4]  = 0;          ref[5]  = f;    ref[6] = 0;   ref[7]  = 0;
        ref[8]  = 0;          ref[9]  = 0;                  ref[11] = -1;
        ref[12] = 0;          ref[13] = 0;                  ref[15] = 0;
        if (far != null && far !== Infinity) {
            const nf = 1 / (near - far);
            ref[10] = (far + near) * nf;
            ref[14] = 2 * far * near * nf;
        } else {
            ref[10] = -1;
            ref[14] = -2 * near;
        }
        return ref;
    }

    /**
     * Generates a orthogonal projection matrix with the given bounds.
     * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
     * which matches WebGL/OpenGL's clip volume.
     * @param {Mat4} ref mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {Mat4} ref
     */
     static orthogonal(ref, left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        ref[0] = -2 * lr;   ref[1] = 0;         ref[2] = 0;         ref[3] = 0;
        ref[4] = 0;         ref[5] = -2 * bt;   ref[6] = 0;         ref[7] = 0;
        ref[8] = 0;         ref[9] = 0;         ref[10] = 2 * nf;   ref[11] = 0;
        ref[12] = (left + right) * lr;
        ref[13] = (top + bottom) * bt;
        ref[14] = (far + near) * nf;
        ref[15] = 1;
        return ref;
    }

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     * @param {Mat4} ref mat4 frustum matrix will be written into
     * @param {Vec3} eye Position of the viewer
     * @param {Vec3} center Point the viewer is looking at
     * @param {Vec3} up vec3 pointing up
     * @returns {Mat4} ref
     */
    static lookAt(ref, eye, center, up) {
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        let eyex = eye[0],       eyey = eye[1],       eyez = eye[2],
            upx = up[0],         upy = up[1],         upz = up[2],
            centerx = center[0], centery = center[1], centerz = center[2];

        if (Math.abs(eyex - centerx) < 1e-5 &&
            Math.abs(eyey - centery) < 1e-5 &&
            Math.abs(eyez - centerz) < 1e-5) {
            return identity(ref);
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len; z1 *= len; z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
            x0 = 0;    x1 = 0;    x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len; x1 *= len; x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);
        if (!len) {
            y0 = 0;    y1 = 0;    y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len; y1 *= len; y2 *= len;
        }

        ref[0] = x0; ref[1] = y0; ref[2]  = z0; ref[3]  = 0;
        ref[4] = x1; ref[5] = y1; ref[6]  = z1; ref[7]  = 0;
        ref[8] = x2; ref[9] = y2; ref[10] = z2; ref[11] = 0;
        ref[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        ref[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        ref[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        ref[15] = 1;

        return ref;
    }

    /**
     * Generates a matrix that makes something look at something else.
     * @param {Mat4} ref mat4 frustum matrix will be written into
     * @param {Vec3} eye Position of the viewer
     * @param {Vec3} target Point the viewer is looking at
     * @param {Vec3} up vec3 pointing up
     * @returns {Mat4} out
     */
    static targetTo(ref, eye, target, up) {
        let eyex = eye[0],  eyey = eye[1],  eyez = eye[2],
            upx = up[0],    upy = up[1],    upz = up[2];

        let z0 = eyex - target[0],
            z1 = eyey - target[1],
            z2 = eyez - target[2];

        let len = z0 * z0 + z1 * z1 + z2 * z2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            z0 *= len;
            z1 *= len;
            z2 *= len;
        }

        let x0 = upy * z2 - upz * z1,
            x1 = upz * z0 - upx * z2,
            x2 = upx * z1 - upy * z0;

        len = x0 * x0 + x1 * x1 + x2 * x2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        ref[0] = x0;    ref[1] = x1;    ref[2] = x2;    ref[3] = 0;
        ref[4] = z1 * x2 - z2 * x1;
        ref[5] = z2 * x0 - z0 * x2;
        ref[6] = z0 * x1 - z1 * x0;
        ref[7] = 0;
        ref[8] = z0;    ref[9] = z1;    ref[10] = z2;   ref[11] = 0;
        ref[12] = eyex; ref[13] = eyey; ref[14] = eyez; ref[15] = 1;

        return ref;
    }

    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     * @param {Mat4} a The first matrix.
     * @param {Mat4} b The second matrix.
     * @returns {boolean} True if the matrices are equal, false otherwise.
     */
    static compare(a, b) {
        let a0  = a[0],  a1 =  a[1],  a2  = a[2],  a3  = a[3],
            a4  = a[4],  a5 =  a[5],  a6  = a[6],  a7  = a[7],
            a8  = a[8],  a9 =  a[9],  a10 = a[10], a11 = a[11],
            a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

        let b0  = b[0],  b1 =  b[1],  b2 =  b[2],  b3  = b[3],
            b4  = b[4],  b5 =  b[5],  b6 =  b[6],  b7  = b[7],
            b8  = b[8],  b9 =  b[9],  b10 = b[10], b11 = b[11],
            b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

        return (
            Math.abs(a0 - b0) <=
            1e-5 * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <=
            1e-5 * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <=
            1e-5 * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <=
            1e-5 * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <=
            1e-5 * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <=
            1e-5 * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <=
            1e-5 * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <=
            1e-5 * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <=
            1e-5 * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
            Math.abs(a9 - b9) <=
            1e-5 * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
            Math.abs(a10 - b10) <=
            1e-5 * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
            Math.abs(a11 - b11) <=
            1e-5 * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
            Math.abs(a12 - b12) <=
            1e-5 * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
            Math.abs(a13 - b13) <=
            1e-5 * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
            Math.abs(a14 - b14) <=
            1e-5 * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
            Math.abs(a15 - b15) <=
            1e-5 * Math.max(1.0, Math.abs(a15), Math.abs(b15))
        );
    }

    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     * @param {Mat4} a The first matrix.
     * @param {Mat4} b The second matrix.
     * @returns {boolean} True if the matrices are equal, false otherwise.
     */
    static equals(a, b) {
        return (
            a[0] === b[0]   && a[1] === b[1]   && a[2] === b[2]   && a[3] === b[3]   &&
            a[4] === b[4]   && a[5] === b[5]   && a[6] === b[6]   && a[7] === b[7]   &&
            a[8] === b[8]   && a[9] === b[9]   && a[10] === b[10] && a[11] === b[11] &&
            a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15]
        );
    }
}

