export class Mat3 extends Array {
    constructor(m00 = 1, m01 = 0, m02 = 0,
                m10 = 0, m11 = 1, m12 = 0,
                m20 = 0, m21 = 0, m22 = 1) {
        super(m00, m01, m02, m10, m11, m12, m20, m21, m22);
        return this;
    }

    identity() { return Mat3.identity(this); }

    copy(m) { return Mat3.copy(this, m); }

    set(m00, m01, m02, m10, m11, m12, m20, m21, m22) { return m00.length ? this.copy(m00) : Mat3.set(this, m00, m01, m02, m10, m11, m12, m20, m21, m22); }

    multiply(ma, mb) { return mb ? Mat3.multiply(this, ma, mb) : Mat3.multiply(this, this, ma); }

    scale(v, m = this) { return Mat3.scale(this, m, v); }

    translate(v, m = this) { return Mat3.translate(this, m, v); }

    rotate(v, m = this) { return Mat3.rotate(this, m, v); }

    inverse(m = this) { return Mat3.invert(this, m); }

    fromMatrix4(m) { return Mat3.fromMat4(this, m); }

    fromQuaternion(q) { return Mat3.fromQuat(this, q); }

    fromBasis(vec3a, vec3b, vec3c) { return this.set(vec3a[0], vec3a[1], vec3a[2], vec3b[0], vec3b[1], vec3b[2], vec3c[0], vec3c[1], vec3c[2]); }

    getNormalMatrix(m) { return Mat3.normalFromMat4(this, m); }

    compare(m) { return Mat3.compare(this, m); }

    equals(m) { return Mat3.equals(this, m); }

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
        return arr;
    }

    /**
     * Copy the values from one mat3 to another
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the source matrix
     * @returns {Mat3} ref
     */
     static copy(ref, matrix) {
        ref[0] = matrix[0]; ref[1] = matrix[1]; ref[2] = matrix[2];
        ref[3] = matrix[3]; ref[4] = matrix[4]; ref[5] = matrix[5];
        ref[6] = matrix[6]; ref[7] = matrix[7]; ref[8] = matrix[8];
        return ref;
     }

    /**
     * Set the components of a mat3 to the given values
     * @param {Mat3} ref the receiving matrix
     * @param {number} m00 Component in column 0, row 0 position (index 0)
     * @param {number} m01 Component in column 0, row 1 position (index 1)
     * @param {number} m02 Component in column 0, row 2 position (index 2)
     * @param {number} m10 Component in column 1, row 0 position (index 3)
     * @param {number} m11 Component in column 1, row 1 position (index 4)
     * @param {number} m12 Component in column 1, row 2 position (index 5)
     * @param {number} m20 Component in column 2, row 0 position (index 6)
     * @param {number} m21 Component in column 2, row 1 position (index 7)
     * @param {number} m22 Component in column 2, row 2 position (index 8)
     * @returns {Mat3} ref
     */
    static set(ref, m00, m01, m02,
                    m10, m11, m12,
                    m20, m21, m22) {
        ref[0] = m00; ref[1] = m01; ref[2] = m02;
        ref[3] = m10; ref[4] = m11; ref[5] = m12;
        ref[6] = m20; ref[7] = m21; ref[8] = m22;
        return ref;
    }

    /**
     * Set a mat3 to the identity matrix
     * @param {Mat3} ref the receiving matrix
     * @returns {Mat3} ref
     */
    static identity(ref) {
        ref[0] = 1; ref[1] = 0; ref[2] = 0;
        ref[3] = 0; ref[4] = 1; ref[5] = 0;
        ref[6] = 0; ref[7] = 0; ref[8] = 1;
        return ref;
    }

    /**
     * Transpose the values of a mat3
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the source matrix
     * @returns {Mat3} ref
     */
    static transpose(ref, matrix) {
        // If we are transposing ourselves we can skip a few steps but have to cache some values
        if (ref === matrix) {
            let a01 = matrix[1], a02 = matrix[2], a12 = matrix[5];
                           ref[1] = matrix[3]; ref[2] = matrix[6];
            ref[3] = a01;                      ref[5] = matrix[7];
                           ref[6] = a02;       ref[7] = a12;
        } else {
            ref[0] = matrix[0]; ref[1] = matrix[3]; ref[2] = matrix[6];
            ref[3] = matrix[1]; ref[4] = matrix[4]; ref[5] = matrix[7];
            ref[6] = matrix[2]; ref[7] = matrix[5]; ref[8] = matrix[8];
        }

        return ref;
    }

    /**
     * Inverts a mat3
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the source matrix
     * @returns {Mat3} ref
     */
    static invert(ref, matrix) {
        let m00 = matrix[0], m01 = matrix[1], m02 = matrix[2],
            m10 = matrix[3], m11 = matrix[4], m12 = matrix[5],
            m20 = matrix[6], m21 = matrix[7], m22 = matrix[8];

        let b01 = m22 * m11 - m12 * m21;
        let b11 = -m22 * m10 + m12 * m20;
        let b21 = m21 * m10 - m11 * m20;

        // Calculate the determinant
        let det = m00 * b01 + m01 * b11 + m02 * b21;

        if (!det) return null;
        det = 1.0 / det;

        ref[0] = b01 * det;
        ref[1] = (-m22 * m01 + m02 * m21) * det;
        ref[2] = (m12 * m01 - m02 * m11) * det;
        ref[3] = b11 * det;
        ref[4] = (m22 * m00 - m02 * m20) * det;
        ref[5] = (-m12 * m00 + m02 * m10) * det;
        ref[6] = b21 * det;
        ref[7] = (-m21 * m00 + m01 * m20) * det;
        ref[8] = (m11 * m00 - m01 * m10) * det;
        return ref;
    }

    /**
     * Calculates the determinant of a mat3
     * @param {Mat3} matrix the source matrix
     * @returns {number} determinant of matrix
     */
    static determinant(matrix) {
        let m00 = matrix[0], m01 = matrix[1], m02 = matrix[2],
            m10 = matrix[3], m11 = matrix[4], m12 = matrix[5],
            m20 = matrix[6], m21 = matrix[7], m22 = matrix[8];

        return (m00 * (m22 * m11 - m12 * m21) + m01 * (-m22 * m10 + m12 * m20) + m02 * (m21 * m10 - m11 * m20));
    }

    /**
     * Adds two mat3's
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} a the first operand
     * @param {Mat3} b the second operand
     * @returns {Mat3} ref
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
        return ref;
    }

    /**
     * Subtracts matrix b from matrix a
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} a the first operand
     * @param {Mat3} b the second operand
     * @returns {Mat3} ref
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
        return ref;
    }

    /**
     * Multiplies two mat3's
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} a the first operand
     * @param {Mat3} b the second operand
     * @returns {Mat3} ref
     */
    static multiply(ref, a, b) {
        let a00 = a[0], a01 = a[1], a02 = a[2],
            a10 = a[3], a11 = a[4], a12 = a[5],
            a20 = a[6], a21 = a[7], a22 = a[8];

        let b00 = b[0], b01 = b[1], b02 = b[2],
            b10 = b[3], b11 = b[4], b12 = b[5],
            b20 = b[6], b21 = b[7], b22 = b[8];

        ref[0] = b00 * a00 + b01 * a10 + b02 * a20;
        ref[1] = b00 * a01 + b01 * a11 + b02 * a21;
        ref[2] = b00 * a02 + b01 * a12 + b02 * a22;

        ref[3] = b10 * a00 + b11 * a10 + b12 * a20;
        ref[4] = b10 * a01 + b11 * a11 + b12 * a21;
        ref[5] = b10 * a02 + b11 * a12 + b12 * a22;

        ref[6] = b20 * a00 + b21 * a10 + b22 * a20;
        ref[7] = b20 * a01 + b21 * a11 + b22 * a21;
        ref[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return ref;
    }

    /**
     * Scales the mat3 by the dimensions in the given vector2
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the matrix to scale
     * @param {Vec2} vector the vector2 to scale the matrix by
     * @returns {Mat3} ref
     **/
    static scale(ref, matrix, vector) {
        let x = vector[0],
            y = vector[1];
        ref[0] = x * matrix[0]; ref[1] = x * matrix[1]; ref[2] = x * matrix[2];
        ref[3] = y * matrix[3]; ref[4] = y * matrix[4]; ref[5] = y * matrix[5];
        ref[6] = matrix[6];     ref[7] = matrix[7];     ref[8] = matrix[8];
        return ref;
    }

    /**
     * Translate a mat3 by the given vector
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the matrix to translate
     * @param {Vec2} vector vector to translate by
     * @returns {Mat3} ref
     */
    static translate(ref, matrix, vector) {
        let m00 = matrix[0], m01 = matrix[1], m02 = matrix[2],
            m10 = matrix[3], m11 = matrix[4], m12 = matrix[5],
            m20 = matrix[6], m21 = matrix[7], m22 = matrix[8],
            x = vector[0], y = vector[1];

        ref[0] = m00; ref[1] = m01; ref[2] = m02;
        ref[3] = m10; ref[4] = m11; ref[5] = m12;
        ref[6] = x * m00 + y * m10 + m20;
        ref[7] = x * m01 + y * m11 + m21;
        ref[8] = x * m02 + y * m12 + m22;
        return ref;
    }

    /**
     * Rotates a mat3 by the given angle
     * @param {Mat3} ref the receiving matrix
     * @param {Mat3} matrix the matrix to rotate
     * @param {number} rad the angle to rotate the matrix by
     * @returns {Mat3} ref
     */
    static rotate(ref, matrix, rad) {
        let m00 = matrix[0], m01 = matrix[1], m02 = matrix[2],
            m10 = matrix[3], m11 = matrix[4], m12 = matrix[5],
            m20 = matrix[6], m21 = matrix[7], m22 = matrix[8],
            s = Math.sin(rad),
            c = Math.cos(rad);

        ref[0] = c * m00 + s * m10;
        ref[1] = c * m01 + s * m11;
        ref[2] = c * m02 + s * m12;

        ref[3] = c * m10 - s * m00;
        ref[4] = c * m11 - s * m01;
        ref[5] = c * m12 - s * m02;

        ref[6] = m20; ref[7] = m21; ref[8] = m22;
        return ref;
    }

    /**
     * Copies the upper-left 3x3 values into the given mat3.
     * @param {Mat3} ref the receiving 3x3 matrix
     * @param {Mat4} matrix the source 4x4 matrix
     * @returns {Mat3} ref
     */
    static fromMat4(ref, matrix) {
        ref[0] = matrix[0]; ref[1] = matrix[1]; ref[2] = matrix[2];
        ref[3] = matrix[4]; ref[4] = matrix[5]; ref[5] = matrix[6];
        ref[6] = matrix[8]; ref[7] = matrix[9]; ref[8] = matrix[10];
        return ref;
    }

    /**
     * Calculates a 3x3 matrix from the given quaternion
     * @param {Mat3} ref mat3 receiving operation result
     * @param {Quat} quat Quaternion to create matrix from
     * @returns {Mat3} ref
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
        ref[3] = yx - wz;
        ref[6] = zx + wy;

        ref[1] = yx + wz;
        ref[4] = 1 - xx - zz;
        ref[7] = zy - wx;

        ref[2] = zx - wy;
        ref[5] = zy + wx;
        ref[8] = 1 - xx - yy;

        return ref;
    }

    /**
     * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
     * @param {Mat3} ref mat3 receiving operation result
     * @param {Mat4} matrix Mat4 to derive the normal matrix from
     * @returns {Mat3} ref
     */
    static normalFromMat4(ref, matrix) {
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

        ref[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
        ref[1] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
        ref[2] = (m10 * b10 - m11 * b08 + m13 * b06) * det;

        ref[3] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
        ref[4] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
        ref[5] = (m01 * b08 - m00 * b10 - m03 * b06) * det;

        ref[6] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
        ref[7] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
        ref[8] = (m30 * b04 - m31 * b02 + m33 * b00) * det;

        return ref;
    }

    /**
     * Returns whether or not the matrices have approximately the same elements in the same position.
     * @param {Mat3} a The first matrix.
     * @param {Mat3} b The second matrix.
     * @returns {boolean} True if the matrices are equal, false otherwise.
     */
    static compare(a, b) {
        let a0 = a[0], a1 = a[1], a2 = a[2],
            a3 = a[3], a4 = a[4], a5 = a[5],
            a6 = a[6], a7 = a[7], a8 = a[8];
        let b0 = b[0], b1 = b[1], b2 = b[2],
            b3 = b[3], b4 = b[4], b5 = b[5],
            b6 = b[6], b7 = b[7], b8 = b[8];
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
            1e-5 * Math.max(1.0, Math.abs(a8), Math.abs(b8))
        );
    }

    /**
     * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
     * @param {Mat3} a The first matrix.
     * @param {Mat3} b The second matrix.
     * @returns {boolean} True if the matrices are equal, false otherwise.
     */
    static equals(a, b) {
        return (
            a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
            a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
            a[6] === b[6] && a[7] === b[7] && a[8] === b[8]
        );
    }
}
