const Epsilon = 1e-15;

/**
 * Why obsolete?
 * Coz, do for loop have to create 1 variable.
 * Override the functions for every inherits is not wise as well.
 * Tried to use static function have to use one temp as well.
 * Flexible < Performance
 * So, it is better to just hard code into function.
 */

export class Vector_obsolete extends Array {
    constructor(...data) {
        super(data.length);
        this.copy(data);
        return this;
    }

    /**
     * Copy the values from one vector to another.
     * @param {Vector_obsolete} vector target Unused_Vector.
     */
    copy(vector) {
        this.length = vector.length; // resize
        for (let i = 0; i < this.length; i++) {
            this[i] = vector[i];
        }
        return this;
    }

    /**
     * Set the Unused_Vector components.
     * @param {Array} data target data.
     */
    set(...data) {
        return this.copy(data);
    }

    /**
     * This vector adds vectors together.
     * @param {Array} vectors vectors for adding.
     */
    add(...vectors) {
        for (let i = 0; i < this.length; i++) {
            for (const vector of vectors) if (vector[i] !== undefined) {
                this[i] = this[i] + vector[i];
            }
        }
        return this;
    }

    /**
     * Add vectors together.
     * @param vectors vectors for adding.
     */
    static add(...vectors) {
        let tempVector = vectors.shift();
        for (const vector of vectors) {
            for (let i = 0, iMax = Math.max(tempVector.length, vector.length); i < iMax; i++) if (vector[i] !== undefined) {
                tempVector[i] = (tempVector[i] ? tempVector[i] : 0) + vector[i];
            }
        }
        return tempVector;
    }

    /**
     * This vector subtracts vectors.
     * @param {Array} vectors vectors for subtract.
     */
    subtract(...vectors) {
        for (let i = 0; i < this.length; i++) {
            for (const vector of vectors) if (vector[i] !== undefined) {
                this[i] = this[i] - vector[i];
            }
        }
        return this;
    }

    /**
     * Subtracts vectors.
     * @param {Array} vectors vectors for subtract.
     */
    static subtract(...vectors) {
        let tempVector = vectors.shift();
        for (const vector of vectors) {
            for (let i = 0, iMax = Math.max(tempVector.length, vector.length); i < iMax; i++) if (vector[i] !== undefined) {
                tempVector[i] = (tempVector[i] ? tempVector[i] : 0) - vector[i];
            }
        }
        return tempVector;
    }

    /**
     * This vector multiply vectors.
     * @param {Array} vectors vectors for multiply.
     */
    multiply(...vectors) {
        for (let i = 0; i < this.length; i++) {
            for (const vector of vectors) if (vector[i] !== undefined) {
                this[i] = this[i] * vector[i];
            }
        }
        return this;
    }

    /**
     * Multiply vectors.
     * @param {Array} vectors vectors for multiply.
     */
    static multiply(...vectors) {
        vectors = vectors.sort((a, b) => b.length - a.length);
        let tempVector = vectors.shift();
        for (const vector of vectors) {
            for (let i = 0, iMax = Math.max(tempVector.length, vector.length); i < iMax; i++) if(vector[i] !== undefined) {
                tempVector[i] = tempVector[i] * vector[i];
            }
        }
        return tempVector;
    }

    /**
     * This vector divide vectors.
     * @param {Array} vectors vectors for divide.
     */
    divide(...vectors) {
        for (let i = 0; i < this.length; i++) {
            for (const vector of vectors) if (vector[i] !== undefined) {
                this[i] = this[i] / vector[i];
            }
        }
        return this;
    }

    /**
     * Divide vectors.
     * @param {Array} vectors vectors for divide.
     */
    static divide(...vectors) {
        let tempVector = vectors.shift();
        for (let i = 0; i < tempVector.length; i++) { // limit the length
            for (const vector of vectors) if (vector[i] !== undefined) {
                tempVector[i] = tempVector[i] / vector[i];
            }
        }
        return tempVector;
    }

    /**
     * Scale a vector  by a scale number.
     * @param {number} value scale factor.
     */
    scale(value) {
		for	(let i = 0; i < this.length; i++) {
			this[i] *= value;
		}
        return this;
    }

    /**
     * Negates the components of a vector.
     */
    negate() {
        for (let i = 0; i < this.length; i++) {
            this[i] = -this[i];
        }
        return this;
    }

    /**
     * Inverse the components of a vector.
     */
    inverse() {
        for (let i = 0; i < this.length; i++) {
            this[i] = 1.0 / this[i];
        }
        return this;
    }

    /**
     * Calculates the length of this vector.
     */
    squaredMagnitude() {
        let sum = 0;
        for (let i = 0; i < this.length; i++) {
            sum += this[i] * this[i];
        }
        return sum;
    }

    /**
     * Calculates the length of this vector.
     */
    magnitude() {
        return Math.sqrt(this.squaredMagnitude());
    }

    /**
     * Calculates the squared euclidian distance between two vectors.
     * @param {Vector_obsolete} a the first operand.
     * @param {Vector_obsolete} b the second operand.
     * @return {number} squared distance between a and b.
     */
    static squaredDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < b.length; i++) {
            let sub = (b[i] - a[i]);
            sum += sub * sub;
        }
        return sum;
    }

    /**
     * Calculates the euclidian distance between two vectors.
     * @param {Vector_obsolete} a the first operand.
     * @param {Vector_obsolete} b the second operand.
     * @return {number} squared distance between a and b.
     */
    static distance(a, b) {
        return Math.sqrt(this.squaredDistance(a, b));
    }

    /**
     * Normalize this vector.
     */
    normalize() {
        let squaredLength = this.squaredMagnitude();
        if (squaredLength > 0)
            squaredLength = 1 / Math.sqrt(squaredLength);
        for (let i = 0; i < this.length; i++) {
            this[i] = this[i] * squaredLength;
        }
        return this;
    }

	/**
	 * Full compare two vectors.
	 * @param {Vector_obsolete} vector target vector.
	 */
	equals(vector) {
		for (let i = 0; i < this.length; i++) {
			if (vector[i] !== this[i])
				return false;
		}
		return true
	}

    /**
     * Compare two vectors.
     * @param {Vector_obsolete} vector target vector.
     */
    compare(vector) {
        return Vector_obsolete.squaredDistance(this, vector) < Epsilon;
    }

    /**
     * Clone this vector to new.
     * @return {Vector_obsolete} new vector.
     */
    clone() {
        let newVector = new Vector_obsolete(this.length);
        return newVector.copy(this);
    }
}

export class Obsolete_Vector2 extends Vector_obsolete {
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

    set x(value) {
        this[0] = value;
    }

    set y(value) {
        this[1] = value;
    }

    set(x, y = x) {
        if (x.length) {
            super.copy(x);
        } else {
            super.set(x, y);
        }
        return this;
    }

    add(vector) {
        return super.add(vector);
    }

    subtract(vector) {
        return super.subtract(vector);
    }

    multiply(value) {
        if (value.length) {
            super.multiply(value)
        } else {
            super.scale(value);
        }
        return this;
    }

    divide(value) {
        if (value.length) {
            super.divide(value)
        } else {
            super.scale(1 / value);
        }
        return this;
    }

    scale(value) {
        this[0] *= value;
        this[1] *= value;
        return this;
    }

    normalize() {
        let x = this[0], y = this[1];
        let length = x * x + y * y;
        if (length > 0) length = 1 / Math.sqrt(length);
        this[0] *= length;
        this[1] *= length;
        return this;
    }

    negate() {
        this[0] -= this[0];
        this[1] -= this[1];
        return this;
    }

    inverse() {
        this[0] = 1.0 / this[0];
        this[1] = 1.0 / this[1];
        return this;
    }

    dot(vector) {
        return this[0] * vector[0] + this[1] * vector[1];
    }

    cross(vector) {
        return this[0] * vector[1] - this[1] * vector[0];
    }

    lerp(vector, t) {
        let ax = this[0], ay = this[1];
        this[0] = ax + t * (vector[0] - ax);
        this[1] = ay + t * (vector[1] - ay);
        return this;
    }

    clone() {
        return new Obsolete_Vector2(this[0], this[1]);
    }
}

export class Obsolete_Vector3 extends Vector_obsolete {
    constructor(x = 0, y = x, z = x) {
        super(x, y ,z);
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

    set x(value) {
        this[0] = value;
    }

    set y(value) {
        this[1] = value;
    }

    set z(value) {
        this[2] = value;
    }

    set(x, y = x, z = x) {
        if (x.length) {
            super.copy(x);
        } else {
            super.set(x, y);
        }
        return this;
    }

    add(vector) {
        return super.add(vector);
    }

    subtract(vector) {
        return super.subtract(vector);
    }

    multiply(value) {
        if (value.length) {
            super.multiply(value)
        } else {
            super.scale(value);
        }
        return this;
    }

    divide(value) {
        if (value.length) {
            super.divide(value)
        } else {
            super.scale(1 / value);
        }
        return this;
    }

    scale(value) {
        this[0] *= value;
        this[1] *= value;
        this[2] *= value;
        return this;
    }

    normalize() {
        let x = this[0], y = this[1], z = this[2];
        let length = x * x + y * y + z * z;
        if (length > 0) length = 1 / Math.sqrt(length);
        this[0] *= length;
        this[1] *= length;
        this[2] *= length;
        return this;
    }

    negate() {
        this[0] -= this[0];
        this[1] -= this[1];
        this[2] -= this[2];
        return this;
    }

    inverse() {
        this[0] = 1.0 / this[0];
        this[1] = 1.0 / this[1];
        this[2] = 1.0 / this[2];
        return this;
    }

    dot(vector) {
        return this[0] * vector[0] + this[1] * vector[1] + this[2] * vector[2];
    }

    cross(vector) {
        let ax = this[0], ay = this[1], az = this[2];
        let bx = vector[0], by = vector[1], bz = vector[2];
        this[0] = ay * bz - az * by;
        this[1] = az * bx - ax * bz;
        this[2] = ax * by - ay * bx;
        return this;
    }

    lerp(vector, t) {
        let ax = this[0], ay = this[1], az = this[2];
        this[0] = ax + t * (vector[0] - ax);
        this[1] = ay + t * (vector[1] - ay);
        this[2] = az + t * (vector[2] - az);
        return this;
    }

    clone() {
        return new Obsolete_Vector3(this[0], this[1], this[2]);
    }
}

export class Obsolete_Vector4 extends Vector_obsolete {
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

    set x(value) {
        this[0] = value;
    }

    set y(value) {
        this[1] = value;
    }

    set z(value) {
        this[2] = value;
    }

    set w(value) {
        this[3] = value;
    }

    set(x = 0, y = x, z = x, w = x) {
        if (x.length) {
            super.copy(x);
        } else {
            super.set(x, y, z, w);
        }
        return this;
    }

    add(vector) {
        return super.add(vector);
    }

    subtract(vector) {
        return super.subtract(vector);
    }

    multiply(value) {
        if (value.length) {
            super.multiply(value)
        } else {
            super.scale(value);
        }
        return this;
    }

    divide(value) {
        if (value.length) {
            super.divide(value)
        } else {
            super.scale(1 / value);
        }
        return this;
    }

    scale(value) {
        this[0] *= value;
        this[1] *= value;
        this[2] *= value;
        this[3] *= value;
        return this;
    }

    normalize() {
        let x = a[0], y = a[1], z = a[2], w = a[3];
        let length = x * x + y * y + z * z + w * w;
        if (length > 0) length = 1 / Math.sqrt(length);
        this[0] *= length;
        this[1] *= length;
        this[2] *= length;
        this[3] *= length;
        return this;
    }

    dot(vector) {
        return this[0] * vector[0] + this[1] * vector[1] + this[2] * vector[2] + this[3] * vector[3];
    }

    lerp(vector, t) {
        let ax = this[0], ay = this[1], az = this[2], aw = this[3];
        this[0] = ax + t * (vector[0] - ax);
        this[1] = ay + t * (vector[1] - ay);
        this[2] = az + t * (vector[2] - az);
        this[3] = aw + t * (vector[3] - aw);
        return this;
    }

    clone() {
        return new Obsolete_Vector4(this[0], this[1], this[2], this[3]);
    }
}