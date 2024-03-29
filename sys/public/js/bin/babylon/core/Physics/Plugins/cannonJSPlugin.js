import { Logger } from "../../Misc/logger.js";
import { Vector3, Matrix, Quaternion } from "../../Maths/math.vector.js";
import { VertexBuffer } from "../../Buffers/buffer.js";
import { PhysicsImpostor } from "../../Physics/physicsImpostor.js";
import { PhysicsJoint } from "../../Physics/physicsJoint.js";
import { PhysicsEngine } from "../../Physics/physicsEngine.js";
import { PhysicsRaycastResult } from "../physicsRaycastResult.js";
/** @hidden */
var CannonJSPlugin = /** @class */ (function () {
    function CannonJSPlugin(_useDeltaForWorldStep, iterations, cannonInjection) {
        if (_useDeltaForWorldStep === void 0) { _useDeltaForWorldStep = true; }
        if (iterations === void 0) { iterations = 10; }
        if (cannonInjection === void 0) { cannonInjection = CANNON; }
        this._useDeltaForWorldStep = _useDeltaForWorldStep;
        this.name = "CannonJSPlugin";
        this._physicsMaterials = new Array();
        this._fixedTimeStep = 1 / 60;
        this._physicsBodysToRemoveAfterStep = new Array();
        this._firstFrame = true;
        this._tmpQuaternion = new Quaternion();
        this._minus90X = new Quaternion(-0.7071067811865475, 0, 0, 0.7071067811865475);
        this._plus90X = new Quaternion(0.7071067811865475, 0, 0, 0.7071067811865475);
        this._tmpPosition = Vector3.Zero();
        this._tmpDeltaPosition = Vector3.Zero();
        this._tmpUnityRotation = new Quaternion();
        this.BJSCANNON = cannonInjection;
        if (!this.isSupported()) {
            Logger.Error("CannonJS is not available. Please make sure you included the js file.");
            return;
        }
        this._extendNamespace();
        this.world = new this.BJSCANNON.World();
        this.world.broadphase = new this.BJSCANNON.NaiveBroadphase();
        this.world.solver.iterations = iterations;
        this._cannonRaycastResult = new this.BJSCANNON.RaycastResult();
        this._raycastResult = new PhysicsRaycastResult();
    }
    CannonJSPlugin.prototype.setGravity = function (gravity) {
        var vec = gravity;
        this.world.gravity.set(vec.x, vec.y, vec.z);
    };
    CannonJSPlugin.prototype.setTimeStep = function (timeStep) {
        this._fixedTimeStep = timeStep;
    };
    CannonJSPlugin.prototype.getTimeStep = function () {
        return this._fixedTimeStep;
    };
    CannonJSPlugin.prototype.executeStep = function (delta, impostors) {
        // due to cannon's architecture, the first frame's before-step is skipped.
        if (this._firstFrame) {
            this._firstFrame = false;
            for (var _i = 0, impostors_1 = impostors; _i < impostors_1.length; _i++) {
                var impostor = impostors_1[_i];
                if (!(impostor.type == PhysicsImpostor.HeightmapImpostor || impostor.type === PhysicsImpostor.PlaneImpostor)) {
                    impostor.beforeStep();
                }
            }
        }
        this.world.step(this._useDeltaForWorldStep ? delta : this._fixedTimeStep);
        this._removeMarkedPhysicsBodiesFromWorld();
    };
    CannonJSPlugin.prototype._removeMarkedPhysicsBodiesFromWorld = function () {
        var _this = this;
        if (this._physicsBodysToRemoveAfterStep.length > 0) {
            this._physicsBodysToRemoveAfterStep.forEach(function (physicsBody) {
                if (typeof _this.world.removeBody === "function") {
                    _this.world.removeBody(physicsBody);
                }
                else {
                    _this.world.remove(physicsBody);
                }
            });
            this._physicsBodysToRemoveAfterStep = [];
        }
    };
    CannonJSPlugin.prototype.applyImpulse = function (impostor, force, contactPoint) {
        var worldPoint = new this.BJSCANNON.Vec3(contactPoint.x, contactPoint.y, contactPoint.z);
        var impulse = new this.BJSCANNON.Vec3(force.x, force.y, force.z);
        impostor.physicsBody.applyImpulse(impulse, worldPoint);
    };
    CannonJSPlugin.prototype.applyForce = function (impostor, force, contactPoint) {
        var worldPoint = new this.BJSCANNON.Vec3(contactPoint.x, contactPoint.y, contactPoint.z);
        var impulse = new this.BJSCANNON.Vec3(force.x, force.y, force.z);
        impostor.physicsBody.applyForce(impulse, worldPoint);
    };
    CannonJSPlugin.prototype.generatePhysicsBody = function (impostor) {
        // When calling forceUpdate generatePhysicsBody is called again, ensure that the updated body does not instantly collide with removed body
        this._removeMarkedPhysicsBodiesFromWorld();
        //parent-child relationship. Does this impostor has a parent impostor?
        if (impostor.parent) {
            if (impostor.physicsBody) {
                this.removePhysicsBody(impostor);
                //TODO is that needed?
                impostor.forceUpdate();
            }
            return;
        }
        //should a new body be created for this impostor?
        if (impostor.isBodyInitRequired()) {
            var shape = this._createShape(impostor);
            if (!shape) {
                Logger.Warn("It was not possible to create a physics body for this object.");
                return;
            }
            //unregister events, if body is being changed
            var oldBody_1 = impostor.physicsBody;
            if (oldBody_1) {
                this.removePhysicsBody(impostor);
            }
            //create the body and material
            var material = this._addMaterial("mat-" + impostor.uniqueId, impostor.getParam("friction"), impostor.getParam("restitution"));
            var bodyCreationObject = {
                mass: impostor.getParam("mass"),
                material: material,
            };
            // A simple extend, in case native options were used.
            var nativeOptions = impostor.getParam("nativeOptions");
            for (var key in nativeOptions) {
                if (Object.prototype.hasOwnProperty.call(nativeOptions, key)) {
                    bodyCreationObject[key] = nativeOptions[key];
                }
            }
            impostor.physicsBody = new this.BJSCANNON.Body(bodyCreationObject);
            impostor.physicsBody.addEventListener("collide", impostor.onCollide);
            this.world.addEventListener("preStep", impostor.beforeStep);
            this.world.addEventListener("postStep", impostor.afterStep);
            impostor.physicsBody.addShape(shape);
            if (typeof this.world.addBody === "function") {
                this.world.addBody(impostor.physicsBody);
            }
            else {
                this.world.add(impostor.physicsBody);
            }
            //try to keep the body moving in the right direction by taking old properties.
            //Should be tested!
            if (oldBody_1) {
                ["force", "torque", "velocity", "angularVelocity"].forEach(function (param) {
                    var vec = oldBody_1[param];
                    impostor.physicsBody[param].set(vec.x, vec.y, vec.z);
                });
            }
            this._processChildMeshes(impostor);
        }
        //now update the body's transformation
        this._updatePhysicsBodyTransformation(impostor);
    };
    CannonJSPlugin.prototype._processChildMeshes = function (mainImpostor) {
        var _this = this;
        var meshChildren = mainImpostor.object.getChildMeshes ? mainImpostor.object.getChildMeshes(true) : [];
        var mainRotation = mainImpostor.object.rotationQuaternion;
        if (mainRotation) {
            mainRotation.conjugateToRef(this._tmpQuaternion);
        }
        else {
            this._tmpQuaternion.set(0, 0, 0, 1);
        }
        if (meshChildren.length) {
            var processMesh_1 = function (mesh) {
                if (!mesh.rotationQuaternion) {
                    return;
                }
                var childImpostor = mesh.getPhysicsImpostor();
                if (childImpostor) {
                    var parent_1 = childImpostor.parent;
                    if (parent_1 !== mainImpostor && mesh.parent) {
                        var pPosition = mesh.getAbsolutePosition().subtract(mesh.parent.getAbsolutePosition());
                        var q = mesh.rotationQuaternion.multiply(_this._tmpQuaternion);
                        if (childImpostor.physicsBody) {
                            _this.removePhysicsBody(childImpostor);
                            childImpostor.physicsBody = null;
                        }
                        childImpostor.parent = mainImpostor;
                        childImpostor.resetUpdateFlags();
                        mainImpostor.physicsBody.addShape(_this._createShape(childImpostor), new _this.BJSCANNON.Vec3(pPosition.x, pPosition.y, pPosition.z), new _this.BJSCANNON.Quaternion(q.x, q.y, q.z, q.w));
                        //Add the mass of the children.
                        mainImpostor.physicsBody.mass += childImpostor.getParam("mass");
                    }
                }
                mesh.getChildMeshes(true)
                    .filter(function (m) { return !!m.physicsImpostor; })
                    .forEach(processMesh_1);
            };
            meshChildren.filter(function (m) { return !!m.physicsImpostor; }).forEach(processMesh_1);
        }
    };
    CannonJSPlugin.prototype.removePhysicsBody = function (impostor) {
        impostor.physicsBody.removeEventListener("collide", impostor.onCollide);
        this.world.removeEventListener("preStep", impostor.beforeStep);
        this.world.removeEventListener("postStep", impostor.afterStep);
        // Only remove the physics body after the physics step to avoid disrupting cannon's internal state
        if (this._physicsBodysToRemoveAfterStep.indexOf(impostor.physicsBody) === -1) {
            this._physicsBodysToRemoveAfterStep.push(impostor.physicsBody);
        }
    };
    CannonJSPlugin.prototype.generateJoint = function (impostorJoint) {
        var mainBody = impostorJoint.mainImpostor.physicsBody;
        var connectedBody = impostorJoint.connectedImpostor.physicsBody;
        if (!mainBody || !connectedBody) {
            return;
        }
        var constraint;
        var jointData = impostorJoint.joint.jointData;
        //TODO - https://github.com/schteppe/this.BJSCANNON.js/blob/gh-pages/demos/collisionFilter.html
        var constraintData = {
            pivotA: jointData.mainPivot ? new this.BJSCANNON.Vec3().set(jointData.mainPivot.x, jointData.mainPivot.y, jointData.mainPivot.z) : null,
            pivotB: jointData.connectedPivot ? new this.BJSCANNON.Vec3().set(jointData.connectedPivot.x, jointData.connectedPivot.y, jointData.connectedPivot.z) : null,
            axisA: jointData.mainAxis ? new this.BJSCANNON.Vec3().set(jointData.mainAxis.x, jointData.mainAxis.y, jointData.mainAxis.z) : null,
            axisB: jointData.connectedAxis ? new this.BJSCANNON.Vec3().set(jointData.connectedAxis.x, jointData.connectedAxis.y, jointData.connectedAxis.z) : null,
            maxForce: jointData.nativeParams.maxForce,
            collideConnected: !!jointData.collision,
        };
        switch (impostorJoint.joint.type) {
            case PhysicsJoint.HingeJoint:
            case PhysicsJoint.Hinge2Joint:
                constraint = new this.BJSCANNON.HingeConstraint(mainBody, connectedBody, constraintData);
                break;
            case PhysicsJoint.DistanceJoint:
                constraint = new this.BJSCANNON.DistanceConstraint(mainBody, connectedBody, jointData.maxDistance || 2);
                break;
            case PhysicsJoint.SpringJoint: {
                var springData = jointData;
                constraint = new this.BJSCANNON.Spring(mainBody, connectedBody, {
                    restLength: springData.length,
                    stiffness: springData.stiffness,
                    damping: springData.damping,
                    localAnchorA: constraintData.pivotA,
                    localAnchorB: constraintData.pivotB,
                });
                break;
            }
            case PhysicsJoint.LockJoint:
                constraint = new this.BJSCANNON.LockConstraint(mainBody, connectedBody, constraintData);
                break;
            case PhysicsJoint.PointToPointJoint:
            case PhysicsJoint.BallAndSocketJoint:
            default:
                constraint = new this.BJSCANNON.PointToPointConstraint(mainBody, constraintData.pivotA, connectedBody, constraintData.pivotB, constraintData.maxForce);
                break;
        }
        //set the collideConnected flag after the creation, since DistanceJoint ignores it.
        constraint.collideConnected = !!jointData.collision;
        impostorJoint.joint.physicsJoint = constraint;
        //don't add spring as constraint, as it is not one.
        if (impostorJoint.joint.type !== PhysicsJoint.SpringJoint) {
            this.world.addConstraint(constraint);
        }
        else {
            impostorJoint.joint.jointData.forceApplicationCallback =
                impostorJoint.joint.jointData.forceApplicationCallback ||
                    function () {
                        constraint.applyForce();
                    };
            impostorJoint.mainImpostor.registerAfterPhysicsStep(impostorJoint.joint.jointData.forceApplicationCallback);
        }
    };
    CannonJSPlugin.prototype.removeJoint = function (impostorJoint) {
        if (impostorJoint.joint.type !== PhysicsJoint.SpringJoint) {
            this.world.removeConstraint(impostorJoint.joint.physicsJoint);
        }
        else {
            impostorJoint.mainImpostor.unregisterAfterPhysicsStep(impostorJoint.joint.jointData.forceApplicationCallback);
        }
    };
    CannonJSPlugin.prototype._addMaterial = function (name, friction, restitution) {
        var index;
        var mat;
        for (index = 0; index < this._physicsMaterials.length; index++) {
            mat = this._physicsMaterials[index];
            if (mat.friction === friction && mat.restitution === restitution) {
                return mat;
            }
        }
        var currentMat = new this.BJSCANNON.Material(name);
        currentMat.friction = friction;
        currentMat.restitution = restitution;
        this._physicsMaterials.push(currentMat);
        return currentMat;
    };
    CannonJSPlugin.prototype._checkWithEpsilon = function (value) {
        return value < PhysicsEngine.Epsilon ? PhysicsEngine.Epsilon : value;
    };
    CannonJSPlugin.prototype._createShape = function (impostor) {
        var object = impostor.object;
        var returnValue;
        var extendSize = impostor.getObjectExtendSize();
        switch (impostor.type) {
            case PhysicsImpostor.SphereImpostor: {
                var radiusX = extendSize.x;
                var radiusY = extendSize.y;
                var radiusZ = extendSize.z;
                returnValue = new this.BJSCANNON.Sphere(Math.max(this._checkWithEpsilon(radiusX), this._checkWithEpsilon(radiusY), this._checkWithEpsilon(radiusZ)) / 2);
                break;
            }
            //TMP also for cylinder - TODO Cannon supports cylinder natively.
            case PhysicsImpostor.CylinderImpostor: {
                var nativeParams = impostor.getParam("nativeOptions");
                if (!nativeParams) {
                    nativeParams = {};
                }
                var radiusTop = nativeParams.radiusTop !== undefined ? nativeParams.radiusTop : this._checkWithEpsilon(extendSize.x) / 2;
                var radiusBottom = nativeParams.radiusBottom !== undefined ? nativeParams.radiusBottom : this._checkWithEpsilon(extendSize.x) / 2;
                var height = nativeParams.height !== undefined ? nativeParams.height : this._checkWithEpsilon(extendSize.y);
                var numSegments = nativeParams.numSegments !== undefined ? nativeParams.numSegments : 16;
                returnValue = new this.BJSCANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
                // Rotate 90 degrees as this shape is horizontal in cannon
                var quat = new this.BJSCANNON.Quaternion();
                quat.setFromAxisAngle(new this.BJSCANNON.Vec3(1, 0, 0), -Math.PI / 2);
                var translation = new this.BJSCANNON.Vec3(0, 0, 0);
                returnValue.transformAllPoints(translation, quat);
                break;
            }
            case PhysicsImpostor.BoxImpostor: {
                var box = extendSize.scale(0.5);
                returnValue = new this.BJSCANNON.Box(new this.BJSCANNON.Vec3(this._checkWithEpsilon(box.x), this._checkWithEpsilon(box.y), this._checkWithEpsilon(box.z)));
                break;
            }
            case PhysicsImpostor.PlaneImpostor:
                Logger.Warn("Attention, PlaneImposter might not behave as you expect. Consider using BoxImposter instead");
                returnValue = new this.BJSCANNON.Plane();
                break;
            case PhysicsImpostor.MeshImpostor: {
                // should transform the vertex data to world coordinates!!
                var rawVerts = object.getVerticesData ? object.getVerticesData(VertexBuffer.PositionKind) : [];
                var rawFaces = object.getIndices ? object.getIndices() : [];
                if (!rawVerts) {
                    Logger.Warn("Tried to create a MeshImpostor for an object without vertices. This will fail.");
                    return;
                }
                // get only scale! so the object could transform correctly.
                var oldPosition = object.position.clone();
                var oldRotation = object.rotation && object.rotation.clone();
                var oldQuaternion = object.rotationQuaternion && object.rotationQuaternion.clone();
                object.position.copyFromFloats(0, 0, 0);
                object.rotation && object.rotation.copyFromFloats(0, 0, 0);
                object.rotationQuaternion && object.rotationQuaternion.copyFrom(impostor.getParentsRotation());
                object.rotationQuaternion && object.parent && object.rotationQuaternion.conjugateInPlace();
                var transform = object.computeWorldMatrix(true);
                // convert rawVerts to object space
                var temp = new Array();
                var index = void 0;
                for (index = 0; index < rawVerts.length; index += 3) {
                    Vector3.TransformCoordinates(Vector3.FromArray(rawVerts, index), transform).toArray(temp, index);
                }
                Logger.Warn("MeshImpostor only collides against spheres.");
                returnValue = new this.BJSCANNON.Trimesh(temp, rawFaces);
                //now set back the transformation!
                object.position.copyFrom(oldPosition);
                oldRotation && object.rotation && object.rotation.copyFrom(oldRotation);
                oldQuaternion && object.rotationQuaternion && object.rotationQuaternion.copyFrom(oldQuaternion);
                break;
            }
            case PhysicsImpostor.HeightmapImpostor: {
                var oldPosition2 = object.position.clone();
                var oldRotation2 = object.rotation && object.rotation.clone();
                var oldQuaternion2 = object.rotationQuaternion && object.rotationQuaternion.clone();
                object.position.copyFromFloats(0, 0, 0);
                object.rotation && object.rotation.copyFromFloats(0, 0, 0);
                object.rotationQuaternion && object.rotationQuaternion.copyFrom(impostor.getParentsRotation());
                object.rotationQuaternion && object.parent && object.rotationQuaternion.conjugateInPlace();
                object.rotationQuaternion && object.rotationQuaternion.multiplyInPlace(this._minus90X);
                returnValue = this._createHeightmap(object);
                object.position.copyFrom(oldPosition2);
                oldRotation2 && object.rotation && object.rotation.copyFrom(oldRotation2);
                oldQuaternion2 && object.rotationQuaternion && object.rotationQuaternion.copyFrom(oldQuaternion2);
                object.computeWorldMatrix(true);
                break;
            }
            case PhysicsImpostor.ParticleImpostor:
                returnValue = new this.BJSCANNON.Particle();
                break;
            case PhysicsImpostor.NoImpostor:
                returnValue = new this.BJSCANNON.Box(new this.BJSCANNON.Vec3(0, 0, 0));
                break;
        }
        return returnValue;
    };
    CannonJSPlugin.prototype._createHeightmap = function (object, pointDepth) {
        var pos = object.getVerticesData(VertexBuffer.PositionKind);
        var transform = object.computeWorldMatrix(true);
        // convert rawVerts to object space
        var temp = new Array();
        var index;
        for (index = 0; index < pos.length; index += 3) {
            Vector3.TransformCoordinates(Vector3.FromArray(pos, index), transform).toArray(temp, index);
        }
        pos = temp;
        var matrix = new Array();
        //For now pointDepth will not be used and will be automatically calculated.
        //Future reference - try and find the best place to add a reference to the pointDepth variable.
        var arraySize = pointDepth || ~~(Math.sqrt(pos.length / 3) - 1);
        var boundingInfo = object.getBoundingInfo();
        var dim = Math.min(boundingInfo.boundingBox.extendSizeWorld.x, boundingInfo.boundingBox.extendSizeWorld.y);
        var minY = boundingInfo.boundingBox.extendSizeWorld.z;
        var elementSize = (dim * 2) / arraySize;
        for (var i = 0; i < pos.length; i = i + 3) {
            var x = Math.round(pos[i + 0] / elementSize + arraySize / 2);
            var z = Math.round((pos[i + 1] / elementSize - arraySize / 2) * -1);
            var y = -pos[i + 2] + minY;
            if (!matrix[x]) {
                matrix[x] = [];
            }
            if (!matrix[x][z]) {
                matrix[x][z] = y;
            }
            matrix[x][z] = Math.max(y, matrix[x][z]);
        }
        for (var x = 0; x <= arraySize; ++x) {
            if (!matrix[x]) {
                var loc = 1;
                while (!matrix[(x + loc) % arraySize]) {
                    loc++;
                }
                matrix[x] = matrix[(x + loc) % arraySize].slice();
                //console.log("missing x", x);
            }
            for (var z = 0; z <= arraySize; ++z) {
                if (!matrix[x][z]) {
                    var loc = 1;
                    var newValue = void 0;
                    while (newValue === undefined) {
                        newValue = matrix[x][(z + loc++) % arraySize];
                    }
                    matrix[x][z] = newValue;
                }
            }
        }
        var shape = new this.BJSCANNON.Heightfield(matrix, {
            elementSize: elementSize,
        });
        //For future reference, needed for body transformation
        shape.minY = minY;
        return shape;
    };
    CannonJSPlugin.prototype._updatePhysicsBodyTransformation = function (impostor) {
        var object = impostor.object;
        //make sure it is updated...
        object.computeWorldMatrix && object.computeWorldMatrix(true);
        // The delta between the mesh position and the mesh bounding box center
        if (!object.getBoundingInfo()) {
            return;
        }
        var center = impostor.getObjectCenter();
        //m.getAbsolutePosition().subtract(m.getBoundingInfo().boundingBox.centerWorld)
        this._tmpDeltaPosition.copyFrom(object.getAbsolutePivotPoint().subtract(center));
        this._tmpDeltaPosition.divideInPlace(impostor.object.scaling);
        this._tmpPosition.copyFrom(center);
        var quaternion = object.rotationQuaternion;
        if (!quaternion) {
            return;
        }
        //is shape is a plane or a heightmap, it must be rotated 90 degs in the X axis.
        //ideally these would be rotated at time of creation like cylinder but they dont extend ConvexPolyhedron
        if (impostor.type === PhysicsImpostor.PlaneImpostor || impostor.type === PhysicsImpostor.HeightmapImpostor) {
            //-90 DEG in X, precalculated
            quaternion = quaternion.multiply(this._minus90X);
            //Invert! (Precalculated, 90 deg in X)
            //No need to clone. this will never change.
            impostor.setDeltaRotation(this._plus90X);
        }
        //If it is a heightfield, if should be centered.
        if (impostor.type === PhysicsImpostor.HeightmapImpostor) {
            var mesh = object;
            var boundingInfo = mesh.getBoundingInfo();
            //calculate the correct body position:
            var rotationQuaternion = mesh.rotationQuaternion;
            mesh.rotationQuaternion = this._tmpUnityRotation;
            mesh.computeWorldMatrix(true);
            //get original center with no rotation
            var c = center.clone();
            var oldPivot = mesh.getPivotMatrix();
            if (oldPivot) {
                // create a copy the pivot Matrix as it is modified in place
                oldPivot = oldPivot.clone();
            }
            else {
                oldPivot = Matrix.Identity();
            }
            //calculate the new center using a pivot (since this.BJSCANNON.js doesn't center height maps)
            var p = Matrix.Translation(boundingInfo.boundingBox.extendSizeWorld.x, 0, -boundingInfo.boundingBox.extendSizeWorld.z);
            mesh.setPreTransformMatrix(p);
            mesh.computeWorldMatrix(true);
            // force bounding box recomputation
            boundingInfo = mesh.getBoundingInfo();
            //calculate the translation
            var translation = boundingInfo.boundingBox.centerWorld.subtract(center).subtract(mesh.position).negate();
            this._tmpPosition.copyFromFloats(translation.x, translation.y - boundingInfo.boundingBox.extendSizeWorld.y, translation.z);
            //add it inverted to the delta
            this._tmpDeltaPosition.copyFrom(boundingInfo.boundingBox.centerWorld.subtract(c));
            this._tmpDeltaPosition.y += boundingInfo.boundingBox.extendSizeWorld.y;
            //rotation is back
            mesh.rotationQuaternion = rotationQuaternion;
            mesh.setPreTransformMatrix(oldPivot);
            mesh.computeWorldMatrix(true);
        }
        else if (impostor.type === PhysicsImpostor.MeshImpostor) {
            this._tmpDeltaPosition.copyFromFloats(0, 0, 0);
        }
        impostor.setDeltaPosition(this._tmpDeltaPosition);
        //Now update the impostor object
        impostor.physicsBody.position.set(this._tmpPosition.x, this._tmpPosition.y, this._tmpPosition.z);
        impostor.physicsBody.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    };
    CannonJSPlugin.prototype.setTransformationFromPhysicsBody = function (impostor) {
        impostor.object.position.set(impostor.physicsBody.position.x, impostor.physicsBody.position.y, impostor.physicsBody.position.z);
        if (impostor.object.rotationQuaternion) {
            var q = impostor.physicsBody.quaternion;
            impostor.object.rotationQuaternion.set(q.x, q.y, q.z, q.w);
        }
    };
    CannonJSPlugin.prototype.setPhysicsBodyTransformation = function (impostor, newPosition, newRotation) {
        impostor.physicsBody.position.set(newPosition.x, newPosition.y, newPosition.z);
        impostor.physicsBody.quaternion.set(newRotation.x, newRotation.y, newRotation.z, newRotation.w);
    };
    CannonJSPlugin.prototype.isSupported = function () {
        return this.BJSCANNON !== undefined;
    };
    CannonJSPlugin.prototype.setLinearVelocity = function (impostor, velocity) {
        impostor.physicsBody.velocity.set(velocity.x, velocity.y, velocity.z);
    };
    CannonJSPlugin.prototype.setAngularVelocity = function (impostor, velocity) {
        impostor.physicsBody.angularVelocity.set(velocity.x, velocity.y, velocity.z);
    };
    CannonJSPlugin.prototype.getLinearVelocity = function (impostor) {
        var v = impostor.physicsBody.velocity;
        if (!v) {
            return null;
        }
        return new Vector3(v.x, v.y, v.z);
    };
    CannonJSPlugin.prototype.getAngularVelocity = function (impostor) {
        var v = impostor.physicsBody.angularVelocity;
        if (!v) {
            return null;
        }
        return new Vector3(v.x, v.y, v.z);
    };
    CannonJSPlugin.prototype.setBodyMass = function (impostor, mass) {
        impostor.physicsBody.mass = mass;
        impostor.physicsBody.updateMassProperties();
    };
    CannonJSPlugin.prototype.getBodyMass = function (impostor) {
        return impostor.physicsBody.mass;
    };
    CannonJSPlugin.prototype.getBodyFriction = function (impostor) {
        return impostor.physicsBody.material.friction;
    };
    CannonJSPlugin.prototype.setBodyFriction = function (impostor, friction) {
        impostor.physicsBody.material.friction = friction;
    };
    CannonJSPlugin.prototype.getBodyRestitution = function (impostor) {
        return impostor.physicsBody.material.restitution;
    };
    CannonJSPlugin.prototype.setBodyRestitution = function (impostor, restitution) {
        impostor.physicsBody.material.restitution = restitution;
    };
    CannonJSPlugin.prototype.sleepBody = function (impostor) {
        impostor.physicsBody.sleep();
    };
    CannonJSPlugin.prototype.wakeUpBody = function (impostor) {
        impostor.physicsBody.wakeUp();
    };
    CannonJSPlugin.prototype.updateDistanceJoint = function (joint, maxDistance) {
        joint.physicsJoint.distance = maxDistance;
    };
    CannonJSPlugin.prototype.setMotor = function (joint, speed, maxForce, motorIndex) {
        if (!motorIndex) {
            joint.physicsJoint.enableMotor();
            joint.physicsJoint.setMotorSpeed(speed);
            if (maxForce) {
                this.setLimit(joint, maxForce);
            }
        }
    };
    CannonJSPlugin.prototype.setLimit = function (joint, upperLimit, lowerLimit) {
        joint.physicsJoint.motorEquation.maxForce = upperLimit;
        joint.physicsJoint.motorEquation.minForce = lowerLimit === void 0 ? -upperLimit : lowerLimit;
    };
    CannonJSPlugin.prototype.syncMeshWithImpostor = function (mesh, impostor) {
        var body = impostor.physicsBody;
        mesh.position.x = body.position.x;
        mesh.position.y = body.position.y;
        mesh.position.z = body.position.z;
        if (mesh.rotationQuaternion) {
            mesh.rotationQuaternion.x = body.quaternion.x;
            mesh.rotationQuaternion.y = body.quaternion.y;
            mesh.rotationQuaternion.z = body.quaternion.z;
            mesh.rotationQuaternion.w = body.quaternion.w;
        }
    };
    CannonJSPlugin.prototype.getRadius = function (impostor) {
        var shape = impostor.physicsBody.shapes[0];
        return shape.boundingSphereRadius;
    };
    CannonJSPlugin.prototype.getBoxSizeToRef = function (impostor, result) {
        var shape = impostor.physicsBody.shapes[0];
        result.x = shape.halfExtents.x * 2;
        result.y = shape.halfExtents.y * 2;
        result.z = shape.halfExtents.z * 2;
    };
    CannonJSPlugin.prototype.dispose = function () { };
    CannonJSPlugin.prototype._extendNamespace = function () {
        //this will force cannon to execute at least one step when using interpolation
        var step_tmp1 = new this.BJSCANNON.Vec3();
        var engine = this.BJSCANNON;
        this.BJSCANNON.World.prototype.step = function (dt, timeSinceLastCalled, maxSubSteps) {
            maxSubSteps = maxSubSteps || 10;
            timeSinceLastCalled = timeSinceLastCalled || 0;
            if (timeSinceLastCalled === 0) {
                this.internalStep(dt);
                this.time += dt;
            }
            else {
                var internalSteps = Math.floor((this.time + timeSinceLastCalled) / dt) - Math.floor(this.time / dt);
                internalSteps = Math.min(internalSteps, maxSubSteps) || 1;
                var t0 = performance.now();
                for (var i = 0; i !== internalSteps; i++) {
                    this.internalStep(dt);
                    if (performance.now() - t0 > dt * 1000) {
                        break;
                    }
                }
                this.time += timeSinceLastCalled;
                var h = this.time % dt;
                var h_div_dt = h / dt;
                var interpvelo = step_tmp1;
                var bodies = this.bodies;
                for (var j = 0; j !== bodies.length; j++) {
                    var b = bodies[j];
                    if (b.type !== engine.Body.STATIC && b.sleepState !== engine.Body.SLEEPING) {
                        b.position.vsub(b.previousPosition, interpvelo);
                        interpvelo.scale(h_div_dt, interpvelo);
                        b.position.vadd(interpvelo, b.interpolatedPosition);
                    }
                    else {
                        b.interpolatedPosition.set(b.position.x, b.position.y, b.position.z);
                        b.interpolatedQuaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
                    }
                }
            }
        };
    };
    /**
     * Does a raycast in the physics world
     * @param from when should the ray start?
     * @param to when should the ray end?
     * @returns PhysicsRaycastResult
     */
    CannonJSPlugin.prototype.raycast = function (from, to) {
        this._cannonRaycastResult.reset();
        this.world.raycastClosest(from, to, {}, this._cannonRaycastResult);
        this._raycastResult.reset(from, to);
        if (this._cannonRaycastResult.hasHit) {
            // TODO: do we also want to get the body it hit?
            this._raycastResult.setHitData({
                x: this._cannonRaycastResult.hitNormalWorld.x,
                y: this._cannonRaycastResult.hitNormalWorld.y,
                z: this._cannonRaycastResult.hitNormalWorld.z,
            }, {
                x: this._cannonRaycastResult.hitPointWorld.x,
                y: this._cannonRaycastResult.hitPointWorld.y,
                z: this._cannonRaycastResult.hitPointWorld.z,
            });
            this._raycastResult.setHitDistance(this._cannonRaycastResult.distance);
        }
        return this._raycastResult;
    };
    return CannonJSPlugin;
}());
export { CannonJSPlugin };
PhysicsEngine.DefaultPluginFactory = function () {
    return new CannonJSPlugin();
};
//# sourceMappingURL=cannonJSPlugin.js.map