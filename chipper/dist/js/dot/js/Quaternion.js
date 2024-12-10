// Copyright 2013-2023, University of Colorado Boulder
/**
 * Quaternion, see http://en.wikipedia.org/wiki/Quaternion
 *
 * TODO #96 convert from JME-style parametrization into classical mathematical description?
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../phet-core/js/Poolable.js';
import dot from './dot.js';
import Matrix3 from './Matrix3.js';
import './Utils.js';
import Vector3 from './Vector3.js';
let Quaternion = class Quaternion {
    /**
   * Sets the x,y,z,w values of the quaternion
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} w
   */ setXYZW(x, y, z, w) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
        this.z = z !== undefined ? z : 0;
        this.w = w !== undefined ? w : 1;
    }
    /*---------------------------------------------------------------------------*
   * Immutables
   *----------------------------------------------------------------------------*/ /**
   * Addition of this quaternion and another quaternion, returning a copy.
   * @public
   *
   * @param {Quaternion} quat
   * @returns {Quaternion}
   */ plus(quat) {
        return new Quaternion(this.x + quat.x, this.y + quat.y, this.z + quat.z, this.w + quat.w);
    }
    /**
   * Multiplication of this quaternion by a scalar, returning a copy.
   * @public
   *
   * @param {number} s
   * @returns {Quaternion}
   */ timesScalar(s) {
        return new Quaternion(this.x * s, this.y * s, this.z * s, this.w * s);
    }
    /**
   * Multiplication of this quaternion by another quaternion, returning a copy.
   * Multiplication is also known at the Hamilton Product (an extension of the cross product for vectors)
   * The product of two rotation quaternions will be equivalent to a rotation by the first quaternion followed by the second quaternion rotation,
   * @public
   *
   * @param {Quaternion} quat
   * @returns {Quaternion}
   */ timesQuaternion(quat) {
        // TODO: note why this is the case? product noted everywhere is the other one mentioned! https://github.com/phetsims/dot/issues/96
        // mathematica-style
        //        return new Quaternion(
        //                this.x * quat.x - this.y * quat.y - this.z * quat.z - this.w * quat.w,
        //                this.x * quat.y + this.y * quat.x + this.z * quat.w - this.w * quat.z,
        //                this.x * quat.z - this.y * quat.w + this.z * quat.x + this.w * quat.y,
        //                this.x * quat.w + this.y * quat.z - this.z * quat.y + this.w * quat.x
        //        );
        // JME-style
        return new Quaternion(this.x * quat.w - this.z * quat.y + this.y * quat.z + this.w * quat.x, -this.x * quat.z + this.y * quat.w + this.z * quat.x + this.w * quat.y, this.x * quat.y - this.y * quat.x + this.z * quat.w + this.w * quat.z, -this.x * quat.x - this.y * quat.y - this.z * quat.z + this.w * quat.w);
    /*
     Mathematica!
     In[13]:= Quaternion[-0.0, -0.0024999974, 0.0, 0.9999969] ** Quaternion[-0.9864071, 0.0016701065, -0.0050373166, 0.16423558]
     Out[13]= Quaternion[-0.164231, 0.00750332, 0.00208069, -0.986391]

     In[17]:= Quaternion[-0.0024999974, 0.0, 0.9999969, 0] ** Quaternion[0.0016701065, -0.0050373166, 0.16423558, -0.9864071]
     Out[17]= Quaternion[-0.164239, -0.986391, 0.00125951, 0.00750332]

     JME contains the rearrangement of what is typically called {w,x,y,z}
     */ }
    /**
   * Multiply this quaternion by a vector v, returning a new vector3
   * When a versor, a rotation quaternion, and a vector which lies in the plane of the versor are multiplied, the result is a new vector of the same length but turned by the angle of the versor.
   * @public
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ timesVector3(v) {
        if (v.magnitude === 0) {
            return new Vector3(0, 0, 0);
        }
        // TODO: optimization? https://github.com/phetsims/dot/issues/96
        return new Vector3(this.w * this.w * v.x + 2 * this.y * this.w * v.z - 2 * this.z * this.w * v.y + this.x * this.x * v.x + 2 * this.y * this.x * v.y + 2 * this.z * this.x * v.z - this.z * this.z * v.x - this.y * this.y * v.x, 2 * this.x * this.y * v.x + this.y * this.y * v.y + 2 * this.z * this.y * v.z + 2 * this.w * this.z * v.x - this.z * this.z * v.y + this.w * this.w * v.y - 2 * this.x * this.w * v.z - this.x * this.x * v.y, 2 * this.x * this.z * v.x + 2 * this.y * this.z * v.y + this.z * this.z * v.z - 2 * this.w * this.y * v.x - this.y * this.y * v.z + 2 * this.w * this.x * v.y - this.x * this.x * v.z + this.w * this.w * v.z);
    }
    /**
   * The magnitude of this quaternion, i.e. $\sqrt{x^2+y^2+v^2+w^2}$,  returns a non negative number
   * @public
   *
   * @returns {number}
   */ getMagnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    get magnitude() {
        return this.getMagnitude();
    }
    /**
   * The square of the magnitude of this quaternion, returns a non negative number
   * @public
   *
   * @returns {number}
   */ getMagnitudeSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    get magnitudeSquared() {
        return this.getMagnitudeSquared();
    }
    /**
   * Normalizes this quaternion (rescales to where the magnitude is 1), returning a new quaternion
   * @public
   *
   * @returns {Quaternion}
   */ normalized() {
        const magnitude = this.magnitude;
        assert && assert(magnitude !== 0, 'Cannot normalize a zero-magnitude quaternion');
        return this.timesScalar(1 / magnitude);
    }
    /**
   * Returns a new quaternion pointing in the opposite direction of this quaternion
   * @public
   *
   * @returns {Quaternion}
   */ negated() {
        return new Quaternion(-this.x, -this.y, -this.z, -this.w);
    }
    /**
   * Convert a quaternion to a rotation matrix
   * This quaternion does not need to be of magnitude 1
   * @public
   *
   * @returns {Matrix3}
   */ toRotationMatrix() {
        // see http://en.wikipedia.org/wiki/Rotation_matrix#Quaternion
        const norm = this.magnitudeSquared;
        const flip = norm === 1 ? 2 : norm > 0 ? 2 / norm : 0;
        const xx = this.x * this.x * flip;
        const xy = this.x * this.y * flip;
        const xz = this.x * this.z * flip;
        const xw = this.w * this.x * flip;
        const yy = this.y * this.y * flip;
        const yz = this.y * this.z * flip;
        const yw = this.w * this.y * flip;
        const zz = this.z * this.z * flip;
        const zw = this.w * this.z * flip;
        return Matrix3.pool.fetch().columnMajor(1 - (yy + zz), xy + zw, xz - yw, xy - zw, 1 - (xx + zz), yz + xw, xz + yw, yz - xw, 1 - (xx + yy));
    }
    /**
   * Function returns a quaternion given euler angles
   * @public
   *
   * @param {number} yaw - rotation about the z-axis
   * @param {number} roll - rotation about the  x-axis
   * @param {number} pitch - rotation about the y-axis
   * @returns {Quaternion}
   */ static fromEulerAngles(yaw, roll, pitch) {
        const sinPitch = Math.sin(pitch * 0.5);
        const cosPitch = Math.cos(pitch * 0.5);
        const sinRoll = Math.sin(roll * 0.5);
        const cosRoll = Math.cos(roll * 0.5);
        const sinYaw = Math.sin(yaw * 0.5);
        const cosYaw = Math.cos(yaw * 0.5);
        const a = cosRoll * cosPitch;
        const b = sinRoll * sinPitch;
        const c = cosRoll * sinPitch;
        const d = sinRoll * cosPitch;
        return new Quaternion(a * sinYaw + b * cosYaw, d * cosYaw + c * sinYaw, c * cosYaw - d * sinYaw, a * cosYaw - b * sinYaw);
    }
    /**
   * Convert a rotation matrix to a quaternion,
   * returning a new Quaternion (of magnitude one)
   * @public
   *
   * @param {Matrix3} matrix
   * @returns {Quaternion}
   */ static fromRotationMatrix(matrix) {
        const v00 = matrix.m00();
        const v01 = matrix.m01();
        const v02 = matrix.m02();
        const v10 = matrix.m10();
        const v11 = matrix.m11();
        const v12 = matrix.m12();
        const v20 = matrix.m20();
        const v21 = matrix.m21();
        const v22 = matrix.m22();
        // from graphics gems code
        const trace = v00 + v11 + v22;
        let sqt;
        // we protect the division by s by ensuring that s>=1
        if (trace >= 0) {
            sqt = Math.sqrt(trace + 1);
            return new Quaternion((v21 - v12) * 0.5 / sqt, (v02 - v20) * 0.5 / sqt, (v10 - v01) * 0.5 / sqt, 0.5 * sqt);
        } else if (v00 > v11 && v00 > v22) {
            sqt = Math.sqrt(1 + v00 - v11 - v22);
            return new Quaternion(sqt * 0.5, (v10 + v01) * 0.5 / sqt, (v02 + v20) * 0.5 / sqt, (v21 - v12) * 0.5 / sqt);
        } else if (v11 > v22) {
            sqt = Math.sqrt(1 + v11 - v00 - v22);
            return new Quaternion((v10 + v01) * 0.5 / sqt, sqt * 0.5, (v21 + v12) * 0.5 / sqt, (v02 - v20) * 0.5 / sqt);
        } else {
            sqt = Math.sqrt(1 + v22 - v00 - v11);
            return new Quaternion((v02 + v20) * 0.5 / sqt, (v21 + v12) * 0.5 / sqt, sqt * 0.5, (v10 - v01) * 0.5 / sqt);
        }
    }
    /**
   * Find a quaternion that transforms a unit vector A into a unit vector B. There
   * are technically multiple solutions, so this only picks one.
   * @public
   *
   * @param {Vector3} a - Unit vector A
   * @param {Vector3} b - Unit vector B
   * @returns {Quaternion} A quaternion s.t. Q * A = B
   */ static getRotationQuaternion(a, b) {
        return Quaternion.fromRotationMatrix(Matrix3.rotateAToB(a, b));
    }
    /**
   * spherical linear interpolation - blending two quaternions with a scalar parameter (ranging from 0 to 1).
   * @public
   * @param {Quaternion} a
   * @param {Quaternion} b
   * @param {number} t - amount of change , between 0 and 1 - 0 is at a, 1 is at b
   * @returns {Quaternion}
   */ static slerp(a, b, t) {
        // if they are identical, just return one of them
        if (a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w) {
            return a;
        }
        let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        if (dot < 0) {
            b = b.negated();
            dot = -dot;
        }
        // how much of each quaternion should be contributed
        let ratioA = 1 - t;
        let ratioB = t;
        // tweak them if necessary
        if (1 - dot > 0.1) {
            const theta = Math.acos(dot);
            const invSinTheta = 1 / Math.sin(theta);
            ratioA = Math.sin((1 - t) * theta) * invSinTheta;
            ratioB = Math.sin(t * theta) * invSinTheta;
        }
        return new Quaternion(ratioA * a.x + ratioB * b.x, ratioA * a.y + ratioB * b.y, ratioA * a.z + ratioB * b.z, ratioA * a.w + ratioB * b.w);
    }
    /**
   * Quaternion defines hypercomplex numbers of the form {x, y, z, w}
   * Quaternion are useful to represent rotation, the xyzw values of a Quaternion can be thought as rotation axis vector described by xyz and a rotation angle described by w.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} w
   */ constructor(x, y, z, w){
        this.setXYZW(x, y, z, w);
    }
};
// @public {boolean}
Quaternion.prototype.isQuaternion = true;
dot.register('Quaternion', Quaternion);
Poolable.mixInto(Quaternion, {
    initialize: Quaternion.prototype.setXYZW
});
export default Quaternion;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9RdWF0ZXJuaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFF1YXRlcm5pb24sIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1F1YXRlcm5pb25cbiAqXG4gKiBUT0RPICM5NiBjb252ZXJ0IGZyb20gSk1FLXN0eWxlIHBhcmFtZXRyaXphdGlvbiBpbnRvIGNsYXNzaWNhbCBtYXRoZW1hdGljYWwgZGVzY3JpcHRpb24/XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuL01hdHJpeDMuanMnO1xuaW1wb3J0ICcuL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmNsYXNzIFF1YXRlcm5pb24ge1xuICAvKipcbiAgICogUXVhdGVybmlvbiBkZWZpbmVzIGh5cGVyY29tcGxleCBudW1iZXJzIG9mIHRoZSBmb3JtIHt4LCB5LCB6LCB3fVxuICAgKiBRdWF0ZXJuaW9uIGFyZSB1c2VmdWwgdG8gcmVwcmVzZW50IHJvdGF0aW9uLCB0aGUgeHl6dyB2YWx1ZXMgb2YgYSBRdWF0ZXJuaW9uIGNhbiBiZSB0aG91Z2h0IGFzIHJvdGF0aW9uIGF4aXMgdmVjdG9yIGRlc2NyaWJlZCBieSB4eXogYW5kIGEgcm90YXRpb24gYW5nbGUgZGVzY3JpYmVkIGJ5IHcuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdcbiAgICovXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCB6LCB3ICkge1xuICAgIHRoaXMuc2V0WFlaVyggeCwgeSwgeiwgdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHgseSx6LHcgdmFsdWVzIG9mIHRoZSBxdWF0ZXJuaW9uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdcbiAgICovXG4gIHNldFhZWlcoIHgsIHksIHosIHcgKSB7XG4gICAgdGhpcy54ID0geCAhPT0gdW5kZWZpbmVkID8geCA6IDA7XG4gICAgdGhpcy55ID0geSAhPT0gdW5kZWZpbmVkID8geSA6IDA7XG4gICAgdGhpcy56ID0geiAhPT0gdW5kZWZpbmVkID8geiA6IDA7XG4gICAgdGhpcy53ID0gdyAhPT0gdW5kZWZpbmVkID8gdyA6IDE7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogSW1tdXRhYmxlc1xuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHF1YXRlcm5pb24gYW5kIGFub3RoZXIgcXVhdGVybmlvbiwgcmV0dXJuaW5nIGEgY29weS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1F1YXRlcm5pb259IHF1YXRcbiAgICogQHJldHVybnMge1F1YXRlcm5pb259XG4gICAqL1xuICBwbHVzKCBxdWF0ICkge1xuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbiggdGhpcy54ICsgcXVhdC54LCB0aGlzLnkgKyBxdWF0LnksIHRoaXMueiArIHF1YXQueiwgdGhpcy53ICsgcXVhdC53ICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGljYXRpb24gb2YgdGhpcyBxdWF0ZXJuaW9uIGJ5IGEgc2NhbGFyLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzXG4gICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufVxuICAgKi9cbiAgdGltZXNTY2FsYXIoIHMgKSB7XG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKCB0aGlzLnggKiBzLCB0aGlzLnkgKiBzLCB0aGlzLnogKiBzLCB0aGlzLncgKiBzICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGljYXRpb24gb2YgdGhpcyBxdWF0ZXJuaW9uIGJ5IGFub3RoZXIgcXVhdGVybmlvbiwgcmV0dXJuaW5nIGEgY29weS5cbiAgICogTXVsdGlwbGljYXRpb24gaXMgYWxzbyBrbm93biBhdCB0aGUgSGFtaWx0b24gUHJvZHVjdCAoYW4gZXh0ZW5zaW9uIG9mIHRoZSBjcm9zcyBwcm9kdWN0IGZvciB2ZWN0b3JzKVxuICAgKiBUaGUgcHJvZHVjdCBvZiB0d28gcm90YXRpb24gcXVhdGVybmlvbnMgd2lsbCBiZSBlcXVpdmFsZW50IHRvIGEgcm90YXRpb24gYnkgdGhlIGZpcnN0IHF1YXRlcm5pb24gZm9sbG93ZWQgYnkgdGhlIHNlY29uZCBxdWF0ZXJuaW9uIHJvdGF0aW9uLFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7UXVhdGVybmlvbn0gcXVhdFxuICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn1cbiAgICovXG4gIHRpbWVzUXVhdGVybmlvbiggcXVhdCApIHtcbiAgICAvLyBUT0RPOiBub3RlIHdoeSB0aGlzIGlzIHRoZSBjYXNlPyBwcm9kdWN0IG5vdGVkIGV2ZXJ5d2hlcmUgaXMgdGhlIG90aGVyIG9uZSBtZW50aW9uZWQhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgLy8gbWF0aGVtYXRpY2Etc3R5bGVcbiAgICAvLyAgICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxuICAgIC8vICAgICAgICAgICAgICAgIHRoaXMueCAqIHF1YXQueCAtIHRoaXMueSAqIHF1YXQueSAtIHRoaXMueiAqIHF1YXQueiAtIHRoaXMudyAqIHF1YXQudyxcbiAgICAvLyAgICAgICAgICAgICAgICB0aGlzLnggKiBxdWF0LnkgKyB0aGlzLnkgKiBxdWF0LnggKyB0aGlzLnogKiBxdWF0LncgLSB0aGlzLncgKiBxdWF0LnosXG4gICAgLy8gICAgICAgICAgICAgICAgdGhpcy54ICogcXVhdC56IC0gdGhpcy55ICogcXVhdC53ICsgdGhpcy56ICogcXVhdC54ICsgdGhpcy53ICogcXVhdC55LFxuICAgIC8vICAgICAgICAgICAgICAgIHRoaXMueCAqIHF1YXQudyArIHRoaXMueSAqIHF1YXQueiAtIHRoaXMueiAqIHF1YXQueSArIHRoaXMudyAqIHF1YXQueFxuICAgIC8vICAgICAgICApO1xuXG4gICAgLy8gSk1FLXN0eWxlXG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxuICAgICAgdGhpcy54ICogcXVhdC53IC0gdGhpcy56ICogcXVhdC55ICsgdGhpcy55ICogcXVhdC56ICsgdGhpcy53ICogcXVhdC54LFxuICAgICAgLXRoaXMueCAqIHF1YXQueiArIHRoaXMueSAqIHF1YXQudyArIHRoaXMueiAqIHF1YXQueCArIHRoaXMudyAqIHF1YXQueSxcbiAgICAgIHRoaXMueCAqIHF1YXQueSAtIHRoaXMueSAqIHF1YXQueCArIHRoaXMueiAqIHF1YXQudyArIHRoaXMudyAqIHF1YXQueixcbiAgICAgIC10aGlzLnggKiBxdWF0LnggLSB0aGlzLnkgKiBxdWF0LnkgLSB0aGlzLnogKiBxdWF0LnogKyB0aGlzLncgKiBxdWF0LndcbiAgICApO1xuXG4gICAgLypcbiAgICAgTWF0aGVtYXRpY2EhXG4gICAgIEluWzEzXTo9IFF1YXRlcm5pb25bLTAuMCwgLTAuMDAyNDk5OTk3NCwgMC4wLCAwLjk5OTk5NjldICoqIFF1YXRlcm5pb25bLTAuOTg2NDA3MSwgMC4wMDE2NzAxMDY1LCAtMC4wMDUwMzczMTY2LCAwLjE2NDIzNTU4XVxuICAgICBPdXRbMTNdPSBRdWF0ZXJuaW9uWy0wLjE2NDIzMSwgMC4wMDc1MDMzMiwgMC4wMDIwODA2OSwgLTAuOTg2MzkxXVxuXG4gICAgIEluWzE3XTo9IFF1YXRlcm5pb25bLTAuMDAyNDk5OTk3NCwgMC4wLCAwLjk5OTk5NjksIDBdICoqIFF1YXRlcm5pb25bMC4wMDE2NzAxMDY1LCAtMC4wMDUwMzczMTY2LCAwLjE2NDIzNTU4LCAtMC45ODY0MDcxXVxuICAgICBPdXRbMTddPSBRdWF0ZXJuaW9uWy0wLjE2NDIzOSwgLTAuOTg2MzkxLCAwLjAwMTI1OTUxLCAwLjAwNzUwMzMyXVxuXG4gICAgIEpNRSBjb250YWlucyB0aGUgcmVhcnJhbmdlbWVudCBvZiB3aGF0IGlzIHR5cGljYWxseSBjYWxsZWQge3cseCx5LHp9XG4gICAgICovXG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbHkgdGhpcyBxdWF0ZXJuaW9uIGJ5IGEgdmVjdG9yIHYsIHJldHVybmluZyBhIG5ldyB2ZWN0b3IzXG4gICAqIFdoZW4gYSB2ZXJzb3IsIGEgcm90YXRpb24gcXVhdGVybmlvbiwgYW5kIGEgdmVjdG9yIHdoaWNoIGxpZXMgaW4gdGhlIHBsYW5lIG9mIHRoZSB2ZXJzb3IgYXJlIG11bHRpcGxpZWQsIHRoZSByZXN1bHQgaXMgYSBuZXcgdmVjdG9yIG9mIHRoZSBzYW1lIGxlbmd0aCBidXQgdHVybmVkIGJ5IHRoZSBhbmdsZSBvZiB0aGUgdmVyc29yLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gdlxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cbiAgICovXG4gIHRpbWVzVmVjdG9yMyggdiApIHtcbiAgICBpZiAoIHYubWFnbml0dWRlID09PSAwICkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKCAwLCAwLCAwICk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogb3B0aW1pemF0aW9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHJldHVybiBuZXcgVmVjdG9yMyhcbiAgICAgIHRoaXMudyAqIHRoaXMudyAqIHYueCArIDIgKiB0aGlzLnkgKiB0aGlzLncgKiB2LnogLSAyICogdGhpcy56ICogdGhpcy53ICogdi55ICsgdGhpcy54ICogdGhpcy54ICogdi54ICsgMiAqIHRoaXMueSAqIHRoaXMueCAqIHYueSArIDIgKiB0aGlzLnogKiB0aGlzLnggKiB2LnogLSB0aGlzLnogKiB0aGlzLnogKiB2LnggLSB0aGlzLnkgKiB0aGlzLnkgKiB2LngsXG4gICAgICAyICogdGhpcy54ICogdGhpcy55ICogdi54ICsgdGhpcy55ICogdGhpcy55ICogdi55ICsgMiAqIHRoaXMueiAqIHRoaXMueSAqIHYueiArIDIgKiB0aGlzLncgKiB0aGlzLnogKiB2LnggLSB0aGlzLnogKiB0aGlzLnogKiB2LnkgKyB0aGlzLncgKiB0aGlzLncgKiB2LnkgLSAyICogdGhpcy54ICogdGhpcy53ICogdi56IC0gdGhpcy54ICogdGhpcy54ICogdi55LFxuICAgICAgMiAqIHRoaXMueCAqIHRoaXMueiAqIHYueCArIDIgKiB0aGlzLnkgKiB0aGlzLnogKiB2LnkgKyB0aGlzLnogKiB0aGlzLnogKiB2LnogLSAyICogdGhpcy53ICogdGhpcy55ICogdi54IC0gdGhpcy55ICogdGhpcy55ICogdi56ICsgMiAqIHRoaXMudyAqIHRoaXMueCAqIHYueSAtIHRoaXMueCAqIHRoaXMueCAqIHYueiArIHRoaXMudyAqIHRoaXMudyAqIHYuelxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1hZ25pdHVkZSBvZiB0aGlzIHF1YXRlcm5pb24sIGkuZS4gJFxcc3FydHt4XjIreV4yK3ZeMit3XjJ9JCwgIHJldHVybnMgYSBub24gbmVnYXRpdmUgbnVtYmVyXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldE1hZ25pdHVkZSgpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLm1hZ25pdHVkZVNxdWFyZWQgKTtcbiAgfVxuXG4gIGdldCBtYWduaXR1ZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFnbml0dWRlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNxdWFyZSBvZiB0aGUgbWFnbml0dWRlIG9mIHRoaXMgcXVhdGVybmlvbiwgcmV0dXJucyBhIG5vbiBuZWdhdGl2ZSBudW1iZXJcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0TWFnbml0dWRlU3F1YXJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55ICsgdGhpcy56ICogdGhpcy56ICsgdGhpcy53ICogdGhpcy53O1xuICB9XG5cbiAgZ2V0IG1hZ25pdHVkZVNxdWFyZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFnbml0dWRlU3F1YXJlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhpcyBxdWF0ZXJuaW9uIChyZXNjYWxlcyB0byB3aGVyZSB0aGUgbWFnbml0dWRlIGlzIDEpLCByZXR1cm5pbmcgYSBuZXcgcXVhdGVybmlvblxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufVxuICAgKi9cbiAgbm9ybWFsaXplZCgpIHtcbiAgICBjb25zdCBtYWduaXR1ZGUgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYWduaXR1ZGUgIT09IDAsICdDYW5ub3Qgbm9ybWFsaXplIGEgemVyby1tYWduaXR1ZGUgcXVhdGVybmlvbicgKTtcbiAgICByZXR1cm4gdGhpcy50aW1lc1NjYWxhciggMSAvIG1hZ25pdHVkZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgcXVhdGVybmlvbiBwb2ludGluZyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uIG9mIHRoaXMgcXVhdGVybmlvblxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufVxuICAgKi9cbiAgbmVnYXRlZCgpIHtcbiAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oIC10aGlzLngsIC10aGlzLnksIC10aGlzLnosIC10aGlzLncgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgcXVhdGVybmlvbiB0byBhIHJvdGF0aW9uIG1hdHJpeFxuICAgKiBUaGlzIHF1YXRlcm5pb24gZG9lcyBub3QgbmVlZCB0byBiZSBvZiBtYWduaXR1ZGUgMVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxuICAgKi9cbiAgdG9Sb3RhdGlvbk1hdHJpeCgpIHtcbiAgICAvLyBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Sb3RhdGlvbl9tYXRyaXgjUXVhdGVybmlvblxuXG4gICAgY29uc3Qgbm9ybSA9IHRoaXMubWFnbml0dWRlU3F1YXJlZDtcbiAgICBjb25zdCBmbGlwID0gKCBub3JtID09PSAxICkgPyAyIDogKCBub3JtID4gMCApID8gMiAvIG5vcm0gOiAwO1xuXG4gICAgY29uc3QgeHggPSB0aGlzLnggKiB0aGlzLnggKiBmbGlwO1xuICAgIGNvbnN0IHh5ID0gdGhpcy54ICogdGhpcy55ICogZmxpcDtcbiAgICBjb25zdCB4eiA9IHRoaXMueCAqIHRoaXMueiAqIGZsaXA7XG4gICAgY29uc3QgeHcgPSB0aGlzLncgKiB0aGlzLnggKiBmbGlwO1xuICAgIGNvbnN0IHl5ID0gdGhpcy55ICogdGhpcy55ICogZmxpcDtcbiAgICBjb25zdCB5eiA9IHRoaXMueSAqIHRoaXMueiAqIGZsaXA7XG4gICAgY29uc3QgeXcgPSB0aGlzLncgKiB0aGlzLnkgKiBmbGlwO1xuICAgIGNvbnN0IHp6ID0gdGhpcy56ICogdGhpcy56ICogZmxpcDtcbiAgICBjb25zdCB6dyA9IHRoaXMudyAqIHRoaXMueiAqIGZsaXA7XG5cbiAgICByZXR1cm4gTWF0cml4My5wb29sLmZldGNoKCkuY29sdW1uTWFqb3IoXG4gICAgICAxIC0gKCB5eSArIHp6ICksXG4gICAgICAoIHh5ICsgencgKSxcbiAgICAgICggeHogLSB5dyApLFxuICAgICAgKCB4eSAtIHp3ICksXG4gICAgICAxIC0gKCB4eCArIHp6ICksXG4gICAgICAoIHl6ICsgeHcgKSxcbiAgICAgICggeHogKyB5dyApLFxuICAgICAgKCB5eiAtIHh3ICksXG4gICAgICAxIC0gKCB4eCArIHl5IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHJldHVybnMgYSBxdWF0ZXJuaW9uIGdpdmVuIGV1bGVyIGFuZ2xlc1xuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5YXcgLSByb3RhdGlvbiBhYm91dCB0aGUgei1heGlzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByb2xsIC0gcm90YXRpb24gYWJvdXQgdGhlICB4LWF4aXNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBpdGNoIC0gcm90YXRpb24gYWJvdXQgdGhlIHktYXhpc1xuICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn1cbiAgICovXG4gIHN0YXRpYyBmcm9tRXVsZXJBbmdsZXMoIHlhdywgcm9sbCwgcGl0Y2ggKSB7XG4gICAgY29uc3Qgc2luUGl0Y2ggPSBNYXRoLnNpbiggcGl0Y2ggKiAwLjUgKTtcbiAgICBjb25zdCBjb3NQaXRjaCA9IE1hdGguY29zKCBwaXRjaCAqIDAuNSApO1xuICAgIGNvbnN0IHNpblJvbGwgPSBNYXRoLnNpbiggcm9sbCAqIDAuNSApO1xuICAgIGNvbnN0IGNvc1JvbGwgPSBNYXRoLmNvcyggcm9sbCAqIDAuNSApO1xuICAgIGNvbnN0IHNpbllhdyA9IE1hdGguc2luKCB5YXcgKiAwLjUgKTtcbiAgICBjb25zdCBjb3NZYXcgPSBNYXRoLmNvcyggeWF3ICogMC41ICk7XG5cbiAgICBjb25zdCBhID0gY29zUm9sbCAqIGNvc1BpdGNoO1xuICAgIGNvbnN0IGIgPSBzaW5Sb2xsICogc2luUGl0Y2g7XG4gICAgY29uc3QgYyA9IGNvc1JvbGwgKiBzaW5QaXRjaDtcbiAgICBjb25zdCBkID0gc2luUm9sbCAqIGNvc1BpdGNoO1xuXG4gICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxuICAgICAgYSAqIHNpbllhdyArIGIgKiBjb3NZYXcsXG4gICAgICBkICogY29zWWF3ICsgYyAqIHNpbllhdyxcbiAgICAgIGMgKiBjb3NZYXcgLSBkICogc2luWWF3LFxuICAgICAgYSAqIGNvc1lhdyAtIGIgKiBzaW5ZYXdcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSByb3RhdGlvbiBtYXRyaXggdG8gYSBxdWF0ZXJuaW9uLFxuICAgKiByZXR1cm5pbmcgYSBuZXcgUXVhdGVybmlvbiAob2YgbWFnbml0dWRlIG9uZSlcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7UXVhdGVybmlvbn1cbiAgICovXG4gIHN0YXRpYyBmcm9tUm90YXRpb25NYXRyaXgoIG1hdHJpeCApIHtcbiAgICBjb25zdCB2MDAgPSBtYXRyaXgubTAwKCk7XG4gICAgY29uc3QgdjAxID0gbWF0cml4Lm0wMSgpO1xuICAgIGNvbnN0IHYwMiA9IG1hdHJpeC5tMDIoKTtcbiAgICBjb25zdCB2MTAgPSBtYXRyaXgubTEwKCk7XG4gICAgY29uc3QgdjExID0gbWF0cml4Lm0xMSgpO1xuICAgIGNvbnN0IHYxMiA9IG1hdHJpeC5tMTIoKTtcbiAgICBjb25zdCB2MjAgPSBtYXRyaXgubTIwKCk7XG4gICAgY29uc3QgdjIxID0gbWF0cml4Lm0yMSgpO1xuICAgIGNvbnN0IHYyMiA9IG1hdHJpeC5tMjIoKTtcblxuICAgIC8vIGZyb20gZ3JhcGhpY3MgZ2VtcyBjb2RlXG4gICAgY29uc3QgdHJhY2UgPSB2MDAgKyB2MTEgKyB2MjI7XG4gICAgbGV0IHNxdDtcblxuICAgIC8vIHdlIHByb3RlY3QgdGhlIGRpdmlzaW9uIGJ5IHMgYnkgZW5zdXJpbmcgdGhhdCBzPj0xXG4gICAgaWYgKCB0cmFjZSA+PSAwICkge1xuICAgICAgc3F0ID0gTWF0aC5zcXJ0KCB0cmFjZSArIDEgKTtcbiAgICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcbiAgICAgICAgKCB2MjEgLSB2MTIgKSAqIDAuNSAvIHNxdCxcbiAgICAgICAgKCB2MDIgLSB2MjAgKSAqIDAuNSAvIHNxdCxcbiAgICAgICAgKCB2MTAgLSB2MDEgKSAqIDAuNSAvIHNxdCxcbiAgICAgICAgMC41ICogc3F0XG4gICAgICApO1xuICAgIH1cbiAgICBlbHNlIGlmICggKCB2MDAgPiB2MTEgKSAmJiAoIHYwMCA+IHYyMiApICkge1xuICAgICAgc3F0ID0gTWF0aC5zcXJ0KCAxICsgdjAwIC0gdjExIC0gdjIyICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oXG4gICAgICAgIHNxdCAqIDAuNSxcbiAgICAgICAgKCB2MTAgKyB2MDEgKSAqIDAuNSAvIHNxdCxcbiAgICAgICAgKCB2MDIgKyB2MjAgKSAqIDAuNSAvIHNxdCxcbiAgICAgICAgKCB2MjEgLSB2MTIgKSAqIDAuNSAvIHNxdFxuICAgICAgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHYxMSA+IHYyMiApIHtcbiAgICAgIHNxdCA9IE1hdGguc3FydCggMSArIHYxMSAtIHYwMCAtIHYyMiApO1xuICAgICAgcmV0dXJuIG5ldyBRdWF0ZXJuaW9uKFxuICAgICAgICAoIHYxMCArIHYwMSApICogMC41IC8gc3F0LFxuICAgICAgICBzcXQgKiAwLjUsXG4gICAgICAgICggdjIxICsgdjEyICkgKiAwLjUgLyBzcXQsXG4gICAgICAgICggdjAyIC0gdjIwICkgKiAwLjUgLyBzcXRcbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc3F0ID0gTWF0aC5zcXJ0KCAxICsgdjIyIC0gdjAwIC0gdjExICk7XG4gICAgICByZXR1cm4gbmV3IFF1YXRlcm5pb24oXG4gICAgICAgICggdjAyICsgdjIwICkgKiAwLjUgLyBzcXQsXG4gICAgICAgICggdjIxICsgdjEyICkgKiAwLjUgLyBzcXQsXG4gICAgICAgIHNxdCAqIDAuNSxcbiAgICAgICAgKCB2MTAgLSB2MDEgKSAqIDAuNSAvIHNxdFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhIHF1YXRlcm5pb24gdGhhdCB0cmFuc2Zvcm1zIGEgdW5pdCB2ZWN0b3IgQSBpbnRvIGEgdW5pdCB2ZWN0b3IgQi4gVGhlcmVcbiAgICogYXJlIHRlY2huaWNhbGx5IG11bHRpcGxlIHNvbHV0aW9ucywgc28gdGhpcyBvbmx5IHBpY2tzIG9uZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IGEgLSBVbml0IHZlY3RvciBBXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gYiAtIFVuaXQgdmVjdG9yIEJcbiAgICogQHJldHVybnMge1F1YXRlcm5pb259IEEgcXVhdGVybmlvbiBzLnQuIFEgKiBBID0gQlxuICAgKi9cbiAgc3RhdGljIGdldFJvdGF0aW9uUXVhdGVybmlvbiggYSwgYiApIHtcbiAgICByZXR1cm4gUXVhdGVybmlvbi5mcm9tUm90YXRpb25NYXRyaXgoIE1hdHJpeDMucm90YXRlQVRvQiggYSwgYiApICk7XG4gIH1cblxuICAvKipcbiAgICogc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIC0gYmxlbmRpbmcgdHdvIHF1YXRlcm5pb25zIHdpdGggYSBzY2FsYXIgcGFyYW1ldGVyIChyYW5naW5nIGZyb20gMCB0byAxKS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge1F1YXRlcm5pb259IGFcbiAgICogQHBhcmFtIHtRdWF0ZXJuaW9ufSBiXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0IC0gYW1vdW50IG9mIGNoYW5nZSAsIGJldHdlZW4gMCBhbmQgMSAtIDAgaXMgYXQgYSwgMSBpcyBhdCBiXG4gICAqIEByZXR1cm5zIHtRdWF0ZXJuaW9ufVxuICAgKi9cbiAgc3RhdGljIHNsZXJwKCBhLCBiLCB0ICkge1xuICAgIC8vIGlmIHRoZXkgYXJlIGlkZW50aWNhbCwganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBpZiAoIGEueCA9PT0gYi54ICYmIGEueSA9PT0gYi55ICYmIGEueiA9PT0gYi56ICYmIGEudyA9PT0gYi53ICkge1xuICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgbGV0IGRvdCA9IGEueCAqIGIueCArIGEueSAqIGIueSArIGEueiAqIGIueiArIGEudyAqIGIudztcblxuICAgIGlmICggZG90IDwgMCApIHtcbiAgICAgIGIgPSBiLm5lZ2F0ZWQoKTtcbiAgICAgIGRvdCA9IC1kb3Q7XG4gICAgfVxuXG4gICAgLy8gaG93IG11Y2ggb2YgZWFjaCBxdWF0ZXJuaW9uIHNob3VsZCBiZSBjb250cmlidXRlZFxuICAgIGxldCByYXRpb0EgPSAxIC0gdDtcbiAgICBsZXQgcmF0aW9CID0gdDtcblxuICAgIC8vIHR3ZWFrIHRoZW0gaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCAoIDEgLSBkb3QgKSA+IDAuMSApIHtcbiAgICAgIGNvbnN0IHRoZXRhID0gTWF0aC5hY29zKCBkb3QgKTtcbiAgICAgIGNvbnN0IGludlNpblRoZXRhID0gKCAxIC8gTWF0aC5zaW4oIHRoZXRhICkgKTtcblxuICAgICAgcmF0aW9BID0gKCBNYXRoLnNpbiggKCAxIC0gdCApICogdGhldGEgKSAqIGludlNpblRoZXRhICk7XG4gICAgICByYXRpb0IgPSAoIE1hdGguc2luKCAoIHQgKiB0aGV0YSApICkgKiBpbnZTaW5UaGV0YSApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUXVhdGVybmlvbihcbiAgICAgIHJhdGlvQSAqIGEueCArIHJhdGlvQiAqIGIueCxcbiAgICAgIHJhdGlvQSAqIGEueSArIHJhdGlvQiAqIGIueSxcbiAgICAgIHJhdGlvQSAqIGEueiArIHJhdGlvQiAqIGIueixcbiAgICAgIHJhdGlvQSAqIGEudyArIHJhdGlvQiAqIGIud1xuICAgICk7XG4gIH1cbn1cblxuLy8gQHB1YmxpYyB7Ym9vbGVhbn1cblF1YXRlcm5pb24ucHJvdG90eXBlLmlzUXVhdGVybmlvbiA9IHRydWU7XG5cbmRvdC5yZWdpc3RlciggJ1F1YXRlcm5pb24nLCBRdWF0ZXJuaW9uICk7XG5cblBvb2xhYmxlLm1peEludG8oIFF1YXRlcm5pb24sIHtcbiAgaW5pdGlhbGl6ZTogUXVhdGVybmlvbi5wcm90b3R5cGUuc2V0WFlaV1xufSApO1xuXG5leHBvcnQgZGVmYXVsdCBRdWF0ZXJuaW9uOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsImRvdCIsIk1hdHJpeDMiLCJWZWN0b3IzIiwiUXVhdGVybmlvbiIsInNldFhZWlciLCJ4IiwieSIsInoiLCJ3IiwidW5kZWZpbmVkIiwicGx1cyIsInF1YXQiLCJ0aW1lc1NjYWxhciIsInMiLCJ0aW1lc1F1YXRlcm5pb24iLCJ0aW1lc1ZlY3RvcjMiLCJ2IiwibWFnbml0dWRlIiwiZ2V0TWFnbml0dWRlIiwiTWF0aCIsInNxcnQiLCJtYWduaXR1ZGVTcXVhcmVkIiwiZ2V0TWFnbml0dWRlU3F1YXJlZCIsIm5vcm1hbGl6ZWQiLCJhc3NlcnQiLCJuZWdhdGVkIiwidG9Sb3RhdGlvbk1hdHJpeCIsIm5vcm0iLCJmbGlwIiwieHgiLCJ4eSIsInh6IiwieHciLCJ5eSIsInl6IiwieXciLCJ6eiIsInp3IiwicG9vbCIsImZldGNoIiwiY29sdW1uTWFqb3IiLCJmcm9tRXVsZXJBbmdsZXMiLCJ5YXciLCJyb2xsIiwicGl0Y2giLCJzaW5QaXRjaCIsInNpbiIsImNvc1BpdGNoIiwiY29zIiwic2luUm9sbCIsImNvc1JvbGwiLCJzaW5ZYXciLCJjb3NZYXciLCJhIiwiYiIsImMiLCJkIiwiZnJvbVJvdGF0aW9uTWF0cml4IiwibWF0cml4IiwidjAwIiwibTAwIiwidjAxIiwibTAxIiwidjAyIiwibTAyIiwidjEwIiwibTEwIiwidjExIiwibTExIiwidjEyIiwibTEyIiwidjIwIiwibTIwIiwidjIxIiwibTIxIiwidjIyIiwibTIyIiwidHJhY2UiLCJzcXQiLCJnZXRSb3RhdGlvblF1YXRlcm5pb24iLCJyb3RhdGVBVG9CIiwic2xlcnAiLCJ0IiwicmF0aW9BIiwicmF0aW9CIiwidGhldGEiLCJhY29zIiwiaW52U2luVGhldGEiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsImlzUXVhdGVybmlvbiIsInJlZ2lzdGVyIiwibWl4SW50byIsImluaXRpYWxpemUiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxjQUFjLGlDQUFpQztBQUN0RCxPQUFPQyxTQUFTLFdBQVc7QUFDM0IsT0FBT0MsYUFBYSxlQUFlO0FBQ25DLE9BQU8sYUFBYTtBQUNwQixPQUFPQyxhQUFhLGVBQWU7QUFFbkMsSUFBQSxBQUFNQyxhQUFOLE1BQU1BO0lBZUo7Ozs7Ozs7O0dBUUMsR0FDREMsUUFBU0MsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFHO1FBQ3BCLElBQUksQ0FBQ0gsQ0FBQyxHQUFHQSxNQUFNSSxZQUFZSixJQUFJO1FBQy9CLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxNQUFNRyxZQUFZSCxJQUFJO1FBQy9CLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxNQUFNRSxZQUFZRixJQUFJO1FBQy9CLElBQUksQ0FBQ0MsQ0FBQyxHQUFHQSxNQUFNQyxZQUFZRCxJQUFJO0lBQ2pDO0lBRUE7O2dGQUU4RSxHQUU5RTs7Ozs7O0dBTUMsR0FDREUsS0FBTUMsSUFBSSxFQUFHO1FBQ1gsT0FBTyxJQUFJUixXQUFZLElBQUksQ0FBQ0UsQ0FBQyxHQUFHTSxLQUFLTixDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDLEdBQUdLLEtBQUtMLENBQUMsRUFBRSxJQUFJLENBQUNDLENBQUMsR0FBR0ksS0FBS0osQ0FBQyxFQUFFLElBQUksQ0FBQ0MsQ0FBQyxHQUFHRyxLQUFLSCxDQUFDO0lBQzNGO0lBRUE7Ozs7OztHQU1DLEdBQ0RJLFlBQWFDLENBQUMsRUFBRztRQUNmLE9BQU8sSUFBSVYsV0FBWSxJQUFJ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