import { __assign, __extends } from "tslib";
import { SerializationHelper } from "../Misc/decorators.js";
import { Matrix, Vector3, Vector2, Vector4 } from "../Maths/math.vector.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { Texture } from "../Materials/Textures/texture.js";
import { MaterialHelper } from "./materialHelper.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { Color3, Color4 } from "../Maths/math.color.js";
import { EffectFallbacks } from "./effectFallbacks.js";
import { WebRequest } from "../Misc/webRequest.js";
import { PushMaterial } from "./pushMaterial.js";
import { EngineStore } from "../Engines/engineStore.js";

var onCreatedEffectParameters = { effect: null, subMesh: null };
/**
 * The ShaderMaterial object has the necessary methods to pass data from your scene to the Vertex and Fragment Shaders and returns a material that can be applied to any mesh.
 *
 * This returned material effects how the mesh will look based on the code in the shaders.
 *
 * @see https://doc.babylonjs.com/advanced_topics/shaders/shaderMaterial
 */
var ShaderMaterial = /** @class */ (function (_super) {
    __extends(ShaderMaterial, _super);
    /**
     * Instantiate a new shader material.
     * The ShaderMaterial object has the necessary methods to pass data from your scene to the Vertex and Fragment Shaders and returns a material that can be applied to any mesh.
     * This returned material effects how the mesh will look based on the code in the shaders.
     * @see https://doc.babylonjs.com/how_to/shader_material
     * @param name Define the name of the material in the scene
     * @param scene Define the scene the material belongs to
     * @param shaderPath Defines  the route to the shader code in one of three ways:
     *  * object: { vertex: "custom", fragment: "custom" }, used with Effect.ShadersStore["customVertexShader"] and Effect.ShadersStore["customFragmentShader"]
     *  * object: { vertexElement: "vertexShaderCode", fragmentElement: "fragmentShaderCode" }, used with shader code in script tags
     *  * object: { vertexSource: "vertex shader code string", fragmentSource: "fragment shader code string" } using with strings containing the shaders code
     *  * string: "./COMMON_NAME", used with external files COMMON_NAME.vertex.fx and COMMON_NAME.fragment.fx in index.html folder.
     * @param options Define the options used to create the shader
     * @param storeEffectOnSubMeshes true to store effect on submeshes, false to store the effect directly in the material class.
     */
    function ShaderMaterial(name, scene, shaderPath, options, storeEffectOnSubMeshes) {
        if (options === void 0) { options = {}; }
        if (storeEffectOnSubMeshes === void 0) { storeEffectOnSubMeshes = true; }
        var _this = _super.call(this, name, scene, storeEffectOnSubMeshes) || this;
        _this._textures = {};
        _this._textureArrays = {};
        _this._externalTextures = {};
        _this._floats = {};
        _this._ints = {};
        _this._floatsArrays = {};
        _this._colors3 = {};
        _this._colors3Arrays = {};
        _this._colors4 = {};
        _this._colors4Arrays = {};
        _this._vectors2 = {};
        _this._vectors3 = {};
        _this._vectors4 = {};
        _this._matrices = {};
        _this._matrixArrays = {};
        _this._matrices3x3 = {};
        _this._matrices2x2 = {};
        _this._vectors2Arrays = {};
        _this._vectors3Arrays = {};
        _this._vectors4Arrays = {};
        _this._uniformBuffers = {};
        _this._textureSamplers = {};
        _this._storageBuffers = {};
        _this._cachedWorldViewMatrix = new Matrix();
        _this._cachedWorldViewProjectionMatrix = new Matrix();
        _this._multiview = false;
        _this._shaderPath = shaderPath;
        _this._options = __assign({ needAlphaBlending: false, needAlphaTesting: false, attributes: ["position", "normal", "uv"], uniforms: ["worldViewProjection"], uniformBuffers: [], samplers: [], externalTextures: [], samplerObjects: [], storageBuffers: [], defines: [], useClipPlane: false }, options);
        return _this;
    }
    Object.defineProperty(ShaderMaterial.prototype, "shaderPath", {
        /**
         * Gets the shader path used to define the shader code
         * It can be modified to trigger a new compilation
         */
        get: function () {
            return this._shaderPath;
        },
        /**
         * Sets the shader path used to define the shader code
         * It can be modified to trigger a new compilation
         */
        set: function (shaderPath) {
            this._shaderPath = shaderPath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderMaterial.prototype, "options", {
        /**
         * Gets the options used to compile the shader.
         * They can be modified to trigger a new compilation
         */
        get: function () {
            return this._options;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name of the material e.g. "ShaderMaterial"
     * Mainly use in serialization.
     * @returns the class name
     */
    ShaderMaterial.prototype.getClassName = function () {
        return "ShaderMaterial";
    };
    /**
     * Specifies if the material will require alpha blending
     * @returns a boolean specifying if alpha blending is needed
     */
    ShaderMaterial.prototype.needAlphaBlending = function () {
        return this.alpha < 1.0 || this._options.needAlphaBlending;
    };
    /**
     * Specifies if this material should be rendered in alpha test mode
     * @returns a boolean specifying if an alpha test is needed.
     */
    ShaderMaterial.prototype.needAlphaTesting = function () {
        return this._options.needAlphaTesting;
    };
    ShaderMaterial.prototype._checkUniform = function (uniformName) {
        if (this._options.uniforms.indexOf(uniformName) === -1) {
            this._options.uniforms.push(uniformName);
        }
    };
    /**
     * Set a texture in the shader.
     * @param name Define the name of the uniform samplers as defined in the shader
     * @param texture Define the texture to bind to this sampler
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setTexture = function (name, texture) {
        if (this._options.samplers.indexOf(name) === -1) {
            this._options.samplers.push(name);
        }
        this._textures[name] = texture;
        return this;
    };
    /**
     * Set a texture array in the shader.
     * @param name Define the name of the uniform sampler array as defined in the shader
     * @param textures Define the list of textures to bind to this sampler
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setTextureArray = function (name, textures) {
        if (this._options.samplers.indexOf(name) === -1) {
            this._options.samplers.push(name);
        }
        this._checkUniform(name);
        this._textureArrays[name] = textures;
        return this;
    };
    /**
     * Set an internal texture in the shader.
     * @param name Define the name of the uniform samplers as defined in the shader
     * @param texture Define the texture to bind to this sampler
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setExternalTexture = function (name, texture) {
        if (this._options.externalTextures.indexOf(name) === -1) {
            this._options.externalTextures.push(name);
        }
        this._externalTextures[name] = texture;
        return this;
    };
    /**
     * Set a float in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setFloat = function (name, value) {
        this._checkUniform(name);
        this._floats[name] = value;
        return this;
    };
    /**
     * Set a int in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setInt = function (name, value) {
        this._checkUniform(name);
        this._ints[name] = value;
        return this;
    };
    /**
     * Set an array of floats in the shader.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setFloats = function (name, value) {
        this._checkUniform(name);
        this._floatsArrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Color3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor3 = function (name, value) {
        this._checkUniform(name);
        this._colors3[name] = value;
        return this;
    };
    /**
     * Set a vec3 array in the shader from a Color3 array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor3Array = function (name, value) {
        this._checkUniform(name);
        this._colors3Arrays[name] = value.reduce(function (arr, color) {
            color.toArray(arr, arr.length);
            return arr;
        }, []);
        return this;
    };
    /**
     * Set a vec4 in the shader from a Color4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor4 = function (name, value) {
        this._checkUniform(name);
        this._colors4[name] = value;
        return this;
    };
    /**
     * Set a vec4 array in the shader from a Color4 array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setColor4Array = function (name, value) {
        this._checkUniform(name);
        this._colors4Arrays[name] = value.reduce(function (arr, color) {
            color.toArray(arr, arr.length);
            return arr;
        }, []);
        return this;
    };
    /**
     * Set a vec2 in the shader from a Vector2.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2[name] = value;
        return this;
    };
    /**
     * Set a vec3 in the shader from a Vector3.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3[name] = value;
        return this;
    };
    /**
     * Set a vec4 in the shader from a Vector4.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setVector4 = function (name, value) {
        this._checkUniform(name);
        this._vectors4[name] = value;
        return this;
    };
    /**
     * Set a mat4 in the shader from a Matrix.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix = function (name, value) {
        this._checkUniform(name);
        this._matrices[name] = value;
        return this;
    };
    /**
     * Set a float32Array in the shader from a matrix array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrices = function (name, value) {
        this._checkUniform(name);
        var float32Array = new Float32Array(value.length * 16);
        for (var index = 0; index < value.length; index++) {
            var matrix = value[index];
            matrix.copyToArray(float32Array, index * 16);
        }
        this._matrixArrays[name] = float32Array;
        return this;
    };
    /**
     * Set a mat3 in the shader from a Float32Array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix3x3 = function (name, value) {
        this._checkUniform(name);
        this._matrices3x3[name] = value;
        return this;
    };
    /**
     * Set a mat2 in the shader from a Float32Array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setMatrix2x2 = function (name, value) {
        this._checkUniform(name);
        this._matrices2x2[name] = value;
        return this;
    };
    /**
     * Set a vec2 array in the shader from a number array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setArray2 = function (name, value) {
        this._checkUniform(name);
        this._vectors2Arrays[name] = value;
        return this;
    };
    /**
     * Set a vec3 array in the shader from a number array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setArray3 = function (name, value) {
        this._checkUniform(name);
        this._vectors3Arrays[name] = value;
        return this;
    };
    /**
     * Set a vec4 array in the shader from a number array.
     * @param name Define the name of the uniform as defined in the shader
     * @param value Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setArray4 = function (name, value) {
        this._checkUniform(name);
        this._vectors4Arrays[name] = value;
        return this;
    };
    /**
     * Set a uniform buffer in the shader
     * @param name Define the name of the uniform as defined in the shader
     * @param buffer Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setUniformBuffer = function (name, buffer) {
        if (this._options.uniformBuffers.indexOf(name) === -1) {
            this._options.uniformBuffers.push(name);
        }
        this._uniformBuffers[name] = buffer;
        return this;
    };
    /**
     * Set a texture sampler in the shader
     * @param name Define the name of the uniform as defined in the shader
     * @param sampler Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setTextureSampler = function (name, sampler) {
        if (this._options.samplerObjects.indexOf(name) === -1) {
            this._options.samplerObjects.push(name);
        }
        this._textureSamplers[name] = sampler;
        return this;
    };
    /**
     * Set a storage buffer in the shader
     * @param name Define the name of the storage buffer as defined in the shader
     * @param buffer Define the value to give to the uniform
     * @return the material itself allowing "fluent" like uniform updates
     */
    ShaderMaterial.prototype.setStorageBuffer = function (name, buffer) {
        if (this._options.storageBuffers.indexOf(name) === -1) {
            this._options.storageBuffers.push(name);
        }
        this._storageBuffers[name] = buffer;
        return this;
    };
    /**
     * Specifies that the submesh is ready to be used
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    ShaderMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        return this.isReady(mesh, useInstances, subMesh);
    };
    /**
     * Checks if the material is ready to render the requested mesh
     * @param mesh Define the mesh to render
     * @param useInstances Define whether or not the material is used with instances
     * @param subMesh defines which submesh to render
     * @returns true if ready, otherwise false
     */
    ShaderMaterial.prototype.isReady = function (mesh, useInstances, subMesh) {
        var _a, _b, _c, _d;
        var storeEffectOnSubMeshes = subMesh && this._storeEffectOnSubMeshes;
        if (this.isFrozen) {
            if (storeEffectOnSubMeshes) {
                if (subMesh.effect && subMesh.effect._wasPreviouslyReady) {
                    return true;
                }
            }
            else {
                var effect_1 = this._drawWrapper.effect;
                if (effect_1 && effect_1._wasPreviouslyReady && this._effectUsesInstances === useInstances) {
                    return true;
                }
            }
        }
        var scene = this.getScene();
        var engine = scene.getEngine();
        // Instances
        var defines = [];
        var attribs = [];
        var fallbacks = new EffectFallbacks();
        var shaderName = this._shaderPath, uniforms = this._options.uniforms, uniformBuffers = this._options.uniformBuffers, samplers = this._options.samplers;
        // global multiview
        if (engine.getCaps().multiview && scene.activeCamera && scene.activeCamera.outputRenderTarget && scene.activeCamera.outputRenderTarget.getViewCount() > 1) {
            this._multiview = true;
            defines.push("#define MULTIVIEW");
            if (this._options.uniforms.indexOf("viewProjection") !== -1 && this._options.uniforms.indexOf("viewProjectionR") === -1) {
                this._options.uniforms.push("viewProjectionR");
            }
        }
        for (var index = 0; index < this._options.defines.length; index++) {
            var defineToAdd = this._options.defines[index].indexOf("#define") === 0 ? this._options.defines[index] : "#define ".concat(this._options.defines[index]);
            defines.push(defineToAdd);
        }
        for (var index = 0; index < this._options.attributes.length; index++) {
            attribs.push(this._options.attributes[index]);
        }
        if (mesh && mesh.isVerticesDataPresent(VertexBuffer.ColorKind)) {
            attribs.push(VertexBuffer.ColorKind);
            defines.push("#define VERTEXCOLOR");
        }
        if (useInstances) {
            defines.push("#define INSTANCES");
            MaterialHelper.PushAttributesForInstances(attribs);
            if (mesh === null || mesh === void 0 ? void 0 : mesh.hasThinInstances) {
                defines.push("#define THIN_INSTANCES");
                if (mesh && mesh.isVerticesDataPresent(VertexBuffer.ColorInstanceKind)) {
                    attribs.push(VertexBuffer.ColorInstanceKind);
                    defines.push("#define INSTANCESCOLOR");
                }
            }
        }
        // Bones
        if (mesh && mesh.useBones && mesh.computeBonesUsingShaders && mesh.skeleton) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            var skeleton = mesh.skeleton;
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            fallbacks.addCPUSkinningFallback(0, mesh);
            if (skeleton.isUsingTextureForMatrices) {
                defines.push("#define BONETEXTURE");
                if (this._options.uniforms.indexOf("boneTextureWidth") === -1) {
                    this._options.uniforms.push("boneTextureWidth");
                }
                if (this._options.samplers.indexOf("boneSampler") === -1) {
                    this._options.samplers.push("boneSampler");
                }
            }
            else {
                defines.push("#define BonesPerMesh " + (skeleton.bones.length + 1));
                if (this._options.uniforms.indexOf("mBones") === -1) {
                    this._options.uniforms.push("mBones");
                }
            }
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Morph
        var numInfluencers = 0;
        var manager = mesh ? mesh.morphTargetManager : null;
        if (manager) {
            var uv = manager.supportsUVs && defines.indexOf("#define UV1") !== -1;
            var tangent = manager.supportsTangents && defines.indexOf("#define TANGENT") !== -1;
            var normal = manager.supportsNormals && defines.indexOf("#define NORMAL") !== -1;
            numInfluencers = manager.numInfluencers;
            if (uv) {
                defines.push("#define MORPHTARGETS_UV");
            }
            if (tangent) {
                defines.push("#define MORPHTARGETS_TANGENT");
            }
            if (normal) {
                defines.push("#define MORPHTARGETS_NORMAL");
            }
            if (numInfluencers > 0) {
                defines.push("#define MORPHTARGETS");
            }
            if (manager.isUsingTextureForTargets) {
                defines.push("#define MORPHTARGETS_TEXTURE");
                if (this._options.uniforms.indexOf("morphTargetTextureIndices") === -1) {
                    this._options.uniforms.push("morphTargetTextureIndices");
                }
                if (this._options.samplers.indexOf("morphTargets") === -1) {
                    this._options.samplers.push("morphTargets");
                }
            }
            defines.push("#define NUM_MORPH_INFLUENCERS " + numInfluencers);
            for (var index = 0; index < numInfluencers; index++) {
                attribs.push(VertexBuffer.PositionKind + index);
                if (normal) {
                    attribs.push(VertexBuffer.NormalKind + index);
                }
                if (tangent) {
                    attribs.push(VertexBuffer.TangentKind + index);
                }
                if (uv) {
                    attribs.push(VertexBuffer.UVKind + "_" + index);
                }
            }
            if (numInfluencers > 0) {
                uniforms = uniforms.slice();
                uniforms.push("morphTargetInfluences");
                uniforms.push("morphTargetTextureInfo");
                uniforms.push("morphTargetTextureIndices");
            }
        }
        else {
            defines.push("#define NUM_MORPH_INFLUENCERS 0");
        }
        // Baked Vertex Animation
        if (mesh) {
            var bvaManager = mesh.bakedVertexAnimationManager;
            if (bvaManager && bvaManager.isEnabled) {
                defines.push("#define BAKED_VERTEX_ANIMATION_TEXTURE");
                if (this._options.uniforms.indexOf("bakedVertexAnimationSettings") === -1) {
                    this._options.uniforms.push("bakedVertexAnimationSettings");
                }
                if (this._options.uniforms.indexOf("bakedVertexAnimationTextureSizeInverted") === -1) {
                    this._options.uniforms.push("bakedVertexAnimationTextureSizeInverted");
                }
                if (this._options.uniforms.indexOf("bakedVertexAnimationTime") === -1) {
                    this._options.uniforms.push("bakedVertexAnimationTime");
                }
                if (this._options.samplers.indexOf("bakedVertexAnimationTexture") === -1) {
                    this._options.samplers.push("bakedVertexAnimationTexture");
                }
            }
            MaterialHelper.PrepareAttributesForBakedVertexAnimation(attribs, mesh, defines);
        }
        // Textures
        for (var name_1 in this._textures) {
            if (!this._textures[name_1].isReady()) {
                return false;
            }
        }
        // Alpha test
        if (mesh && this._shouldTurnAlphaTestOn(mesh)) {
            defines.push("#define ALPHATEST");
        }
        // Clip planes
        if ((this._options.useClipPlane === null && !!scene.clipPlane) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE");
            if (uniforms.indexOf("vClipPlane") === -1) {
                uniforms.push("vClipPlane");
            }
        }
        if ((this._options.useClipPlane === null && !!scene.clipPlane2) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE2");
            if (uniforms.indexOf("vClipPlane2") === -1) {
                uniforms.push("vClipPlane2");
            }
        }
        if ((this._options.useClipPlane === null && !!scene.clipPlane3) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE3");
            if (uniforms.indexOf("vClipPlane3") === -1) {
                uniforms.push("vClipPlane3");
            }
        }
        if ((this._options.useClipPlane === null && !!scene.clipPlane4) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE4");
            if (uniforms.indexOf("vClipPlane4") === -1) {
                uniforms.push("vClipPlane4");
            }
        }
        if ((this._options.useClipPlane === null && !!scene.clipPlane5) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE5");
            if (uniforms.indexOf("vClipPlane5") === -1) {
                uniforms.push("vClipPlane5");
            }
        }
        if ((this._options.useClipPlane === null && !!scene.clipPlane6) || this._options.useClipPlane) {
            defines.push("#define CLIPPLANE6");
            if (uniforms.indexOf("vClipPlane6") === -1) {
                uniforms.push("vClipPlane6");
            }
        }
        if (this.customShaderNameResolve) {
            uniforms = uniforms.slice();
            uniformBuffers = uniformBuffers.slice();
            samplers = samplers.slice();
            shaderName = this.customShaderNameResolve(shaderName, uniforms, uniformBuffers, samplers, defines, attribs);
        }
        var drawWrapper = storeEffectOnSubMeshes ? subMesh._getDrawWrapper() : this._drawWrapper;
        var previousEffect = (_a = drawWrapper === null || drawWrapper === void 0 ? void 0 : drawWrapper.effect) !== null && _a !== void 0 ? _a : null;
        var previousDefines = (_b = drawWrapper === null || drawWrapper === void 0 ? void 0 : drawWrapper.defines) !== null && _b !== void 0 ? _b : null;
        var join = defines.join("\n");
        var effect = previousEffect;
        if (previousDefines !== join) {
            effect = engine.createEffect(shaderName, {
                attributes: attribs,
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: join,
                fallbacks: fallbacks,
                onCompiled: this.onCompiled,
                onError: this.onError,
                indexParameters: { maxSimultaneousMorphTargets: numInfluencers },
                shaderLanguage: this._options.shaderLanguage,
            }, engine);
            if (storeEffectOnSubMeshes) {
                subMesh.setEffect(effect, join, this._materialContext);
            }
            else if (drawWrapper) {
                drawWrapper.setEffect(effect, join);
            }
            if (this._onEffectCreatedObservable) {
                onCreatedEffectParameters.effect = effect;
                onCreatedEffectParameters.subMesh = (_c = subMesh !== null && subMesh !== void 0 ? subMesh : mesh === null || mesh === void 0 ? void 0 : mesh.subMeshes[0]) !== null && _c !== void 0 ? _c : null;
                this._onEffectCreatedObservable.notifyObservers(onCreatedEffectParameters);
            }
        }
        this._effectUsesInstances = !!useInstances;
        if ((_d = !(effect === null || effect === void 0 ? void 0 : effect.isReady())) !== null && _d !== void 0 ? _d : true) {
            return false;
        }
        if (previousEffect !== effect) {
            scene.resetCachedMaterial();
        }
        effect._wasPreviouslyReady = true;
        return true;
    };
    /**
     * Binds the world matrix to the material
     * @param world defines the world transformation matrix
     * @param effectOverride - If provided, use this effect instead of internal effect
     */
    ShaderMaterial.prototype.bindOnlyWorldMatrix = function (world, effectOverride) {
        var scene = this.getScene();
        var effect = effectOverride !== null && effectOverride !== void 0 ? effectOverride : this.getEffect();
        if (!effect) {
            return;
        }
        if (this._options.uniforms.indexOf("world") !== -1) {
            effect.setMatrix("world", world);
        }
        if (this._options.uniforms.indexOf("worldView") !== -1) {
            world.multiplyToRef(scene.getViewMatrix(), this._cachedWorldViewMatrix);
            effect.setMatrix("worldView", this._cachedWorldViewMatrix);
        }
        if (this._options.uniforms.indexOf("worldViewProjection") !== -1) {
            world.multiplyToRef(scene.getTransformMatrix(), this._cachedWorldViewProjectionMatrix);
            effect.setMatrix("worldViewProjection", this._cachedWorldViewProjectionMatrix);
        }
    };
    /**
     * Binds the submesh to this material by preparing the effect and shader to draw
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh containing the submesh
     * @param subMesh defines the submesh to bind the material to
     */
    ShaderMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var _a;
        this.bind(world, mesh, (_a = subMesh._drawWrapperOverride) === null || _a === void 0 ? void 0 : _a.effect, subMesh);
    };
    /**
     * Binds the material to the mesh
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh to bind the material to
     * @param effectOverride - If provided, use this effect instead of internal effect
     * @param subMesh defines the submesh to bind the material to
     */
    ShaderMaterial.prototype.bind = function (world, mesh, effectOverride, subMesh) {
        var _a;
        // Std values
        var storeEffectOnSubMeshes = subMesh && this._storeEffectOnSubMeshes;
        var effect = effectOverride !== null && effectOverride !== void 0 ? effectOverride : (storeEffectOnSubMeshes ? subMesh.effect : this.getEffect());
        if (!effect) {
            return;
        }
        this._activeEffect = effect;
        this.bindOnlyWorldMatrix(world, effectOverride);
        var uniformBuffers = this._options.uniformBuffers;
        var useSceneUBO = false;
        if (effect && uniformBuffers && uniformBuffers.length > 0 && this.getScene().getEngine().supportsUniformBuffers) {
            for (var i = 0; i < uniformBuffers.length; ++i) {
                var bufferName = uniformBuffers[i];
                switch (bufferName) {
                    case "Mesh":
                        if (mesh) {
                            mesh.getMeshUniformBuffer().bindToEffect(effect, "Mesh");
                            mesh.transferToEffect(world);
                        }
                        break;
                    case "Scene":
                        MaterialHelper.BindSceneUniformBuffer(effect, this.getScene().getSceneUniformBuffer());
                        this.getScene().finalizeSceneUbo();
                        useSceneUBO = true;
                        break;
                }
            }
        }
        var mustRebind = mesh && storeEffectOnSubMeshes ? this._mustRebind(this.getScene(), effect, mesh.visibility) : this.getScene().getCachedMaterial() !== this;
        if (effect && mustRebind) {
            if (!useSceneUBO && this._options.uniforms.indexOf("view") !== -1) {
                effect.setMatrix("view", this.getScene().getViewMatrix());
            }
            if (!useSceneUBO && this._options.uniforms.indexOf("projection") !== -1) {
                effect.setMatrix("projection", this.getScene().getProjectionMatrix());
            }
            if (!useSceneUBO && this._options.uniforms.indexOf("viewProjection") !== -1) {
                effect.setMatrix("viewProjection", this.getScene().getTransformMatrix());
                if (this._multiview) {
                    effect.setMatrix("viewProjectionR", this.getScene()._transformMatrixR);
                }
            }
            if (this.getScene().activeCamera && this._options.uniforms.indexOf("cameraPosition") !== -1) {
                effect.setVector3("cameraPosition", this.getScene().activeCamera.globalPosition);
            }
            // Bones
            MaterialHelper.BindBonesParameters(mesh, effect);
            // Clip plane
            MaterialHelper.BindClipPlane(effect, this.getScene());
            var name_2;
            // Texture
            for (name_2 in this._textures) {
                effect.setTexture(name_2, this._textures[name_2]);
            }
            // Texture arrays
            for (name_2 in this._textureArrays) {
                effect.setTextureArray(name_2, this._textureArrays[name_2]);
            }
            // External texture
            for (name_2 in this._externalTextures) {
                effect.setExternalTexture(name_2, this._externalTextures[name_2]);
            }
            // Int
            for (name_2 in this._ints) {
                effect.setInt(name_2, this._ints[name_2]);
            }
            // Float
            for (name_2 in this._floats) {
                effect.setFloat(name_2, this._floats[name_2]);
            }
            // Floats
            for (name_2 in this._floatsArrays) {
                effect.setArray(name_2, this._floatsArrays[name_2]);
            }
            // Color3
            for (name_2 in this._colors3) {
                effect.setColor3(name_2, this._colors3[name_2]);
            }
            // Color3Array
            for (name_2 in this._colors3Arrays) {
                effect.setArray3(name_2, this._colors3Arrays[name_2]);
            }
            // Color4
            for (name_2 in this._colors4) {
                var color = this._colors4[name_2];
                effect.setFloat4(name_2, color.r, color.g, color.b, color.a);
            }
            // Color4Array
            for (name_2 in this._colors4Arrays) {
                effect.setArray4(name_2, this._colors4Arrays[name_2]);
            }
            // Vector2
            for (name_2 in this._vectors2) {
                effect.setVector2(name_2, this._vectors2[name_2]);
            }
            // Vector3
            for (name_2 in this._vectors3) {
                effect.setVector3(name_2, this._vectors3[name_2]);
            }
            // Vector4
            for (name_2 in this._vectors4) {
                effect.setVector4(name_2, this._vectors4[name_2]);
            }
            // Matrix
            for (name_2 in this._matrices) {
                effect.setMatrix(name_2, this._matrices[name_2]);
            }
            // MatrixArray
            for (name_2 in this._matrixArrays) {
                effect.setMatrices(name_2, this._matrixArrays[name_2]);
            }
            // Matrix 3x3
            for (name_2 in this._matrices3x3) {
                effect.setMatrix3x3(name_2, this._matrices3x3[name_2]);
            }
            // Matrix 2x2
            for (name_2 in this._matrices2x2) {
                effect.setMatrix2x2(name_2, this._matrices2x2[name_2]);
            }
            // Vector2Array
            for (name_2 in this._vectors2Arrays) {
                effect.setArray2(name_2, this._vectors2Arrays[name_2]);
            }
            // Vector3Array
            for (name_2 in this._vectors3Arrays) {
                effect.setArray3(name_2, this._vectors3Arrays[name_2]);
            }
            // Vector4Array
            for (name_2 in this._vectors4Arrays) {
                effect.setArray4(name_2, this._vectors4Arrays[name_2]);
            }
            // Uniform buffers
            for (name_2 in this._uniformBuffers) {
                var buffer = this._uniformBuffers[name_2].getBuffer();
                if (buffer) {
                    effect.bindUniformBuffer(buffer, name_2);
                }
            }
            // Samplers
            for (name_2 in this._textureSamplers) {
                effect.setTextureSampler(name_2, this._textureSamplers[name_2]);
            }
            // Storage buffers
            for (name_2 in this._storageBuffers) {
                effect.setStorageBuffer(name_2, this._storageBuffers[name_2]);
            }
        }
        if (effect && mesh && (mustRebind || !this.isFrozen)) {
            // Morph targets
            var manager = mesh.morphTargetManager;
            if (manager && manager.numInfluencers > 0) {
                MaterialHelper.BindMorphTargetParameters(mesh, effect);
            }
            var bvaManager = mesh.bakedVertexAnimationManager;
            if (bvaManager && bvaManager.isEnabled) {
                (_a = mesh.bakedVertexAnimationManager) === null || _a === void 0 ? void 0 : _a.bind(effect, this._effectUsesInstances);
            }
        }
        this._afterBind(mesh, effect);
    };
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    ShaderMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        for (var name_3 in this._textures) {
            activeTextures.push(this._textures[name_3]);
        }
        for (var name_4 in this._textureArrays) {
            var array = this._textureArrays[name_4];
            for (var index = 0; index < array.length; index++) {
                activeTextures.push(array[index]);
            }
        }
        return activeTextures;
    };
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    ShaderMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        for (var name_5 in this._textures) {
            if (this._textures[name_5] === texture) {
                return true;
            }
        }
        for (var name_6 in this._textureArrays) {
            var array = this._textureArrays[name_6];
            for (var index = 0; index < array.length; index++) {
                if (array[index] === texture) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Makes a duplicate of the material, and gives it a new name
     * @param name defines the new name for the duplicated material
     * @returns the cloned material
     */
    ShaderMaterial.prototype.clone = function (name) {
        var _this = this;
        var result = SerializationHelper.Clone(function () { return new ShaderMaterial(name, _this.getScene(), _this._shaderPath, _this._options, _this._storeEffectOnSubMeshes); }, this);
        result.name = name;
        result.id = name;
        // Shader code path
        if (typeof result._shaderPath === "object") {
            result._shaderPath = __assign({}, result._shaderPath);
        }
        // Options
        this._options = __assign({}, this._options);
        Object.keys(this._options).forEach(function (propName) {
            var propValue = _this._options[propName];
            if (Array.isArray(propValue)) {
                _this._options[propName] = propValue.slice(0);
            }
        });
        // Stencil
        this.stencil.copyTo(result.stencil);
        // Texture
        for (var key in this._textures) {
            result.setTexture(key, this._textures[key]);
        }
        // TextureArray
        for (var key in this._textureArrays) {
            result.setTextureArray(key, this._textureArrays[key]);
        }
        // External texture
        for (var key in this._externalTextures) {
            result.setExternalTexture(key, this._externalTextures[key]);
        }
        // Int
        for (var key in this._ints) {
            result.setInt(key, this._ints[key]);
        }
        // Float
        for (var key in this._floats) {
            result.setFloat(key, this._floats[key]);
        }
        // Floats
        for (var key in this._floatsArrays) {
            result.setFloats(key, this._floatsArrays[key]);
        }
        // Color3
        for (var key in this._colors3) {
            result.setColor3(key, this._colors3[key]);
        }
        // Color3Array
        for (var key in this._colors3Arrays) {
            result._colors3Arrays[key] = this._colors3Arrays[key];
        }
        // Color4
        for (var key in this._colors4) {
            result.setColor4(key, this._colors4[key]);
        }
        // Color4Array
        for (var key in this._colors4Arrays) {
            result._colors4Arrays[key] = this._colors4Arrays[key];
        }
        // Vector2
        for (var key in this._vectors2) {
            result.setVector2(key, this._vectors2[key]);
        }
        // Vector3
        for (var key in this._vectors3) {
            result.setVector3(key, this._vectors3[key]);
        }
        // Vector4
        for (var key in this._vectors4) {
            result.setVector4(key, this._vectors4[key]);
        }
        // Matrix
        for (var key in this._matrices) {
            result.setMatrix(key, this._matrices[key]);
        }
        // MatrixArray
        for (var key in this._matrixArrays) {
            result._matrixArrays[key] = this._matrixArrays[key].slice();
        }
        // Matrix 3x3
        for (var key in this._matrices3x3) {
            result.setMatrix3x3(key, this._matrices3x3[key]);
        }
        // Matrix 2x2
        for (var key in this._matrices2x2) {
            result.setMatrix2x2(key, this._matrices2x2[key]);
        }
        // Vector2Array
        for (var key in this._vectors2Arrays) {
            result.setArray2(key, this._vectors2Arrays[key]);
        }
        // Vector3Array
        for (var key in this._vectors3Arrays) {
            result.setArray3(key, this._vectors3Arrays[key]);
        }
        // Vector4Array
        for (var key in this._vectors4Arrays) {
            result.setArray4(key, this._vectors4Arrays[key]);
        }
        // Uniform buffers
        for (var key in this._uniformBuffers) {
            result.setUniformBuffer(key, this._uniformBuffers[key]);
        }
        // Samplers
        for (var key in this._textureSamplers) {
            result.setTextureSampler(key, this._textureSamplers[key]);
        }
        // Storag buffers
        for (var key in this._storageBuffers) {
            result.setStorageBuffer(key, this._storageBuffers[key]);
        }
        return result;
    };
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     * @param notBoundToMesh specifies if the material that is being disposed is known to be not bound to any mesh
     */
    ShaderMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        if (forceDisposeTextures) {
            var name_7;
            for (name_7 in this._textures) {
                this._textures[name_7].dispose();
            }
            for (name_7 in this._textureArrays) {
                var array = this._textureArrays[name_7];
                for (var index = 0; index < array.length; index++) {
                    array[index].dispose();
                }
            }
        }
        this._textures = {};
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
    };
    /**
     * Serializes this material in a JSON representation
     * @returns the serialized material object
     */
    ShaderMaterial.prototype.serialize = function () {
        var serializationObject = SerializationHelper.Serialize(this);
        serializationObject.customType = "BABYLON.ShaderMaterial";
        serializationObject.uniqueId = this.uniqueId;
        serializationObject.options = this._options;
        serializationObject.shaderPath = this._shaderPath;
        serializationObject.storeEffectOnSubMeshes = this._storeEffectOnSubMeshes;
        var name;
        // Stencil
        serializationObject.stencil = this.stencil.serialize();
        // Texture
        serializationObject.textures = {};
        for (name in this._textures) {
            serializationObject.textures[name] = this._textures[name].serialize();
        }
        // Texture arrays
        serializationObject.textureArrays = {};
        for (name in this._textureArrays) {
            serializationObject.textureArrays[name] = [];
            var array = this._textureArrays[name];
            for (var index = 0; index < array.length; index++) {
                serializationObject.textureArrays[name].push(array[index].serialize());
            }
        }
        // Int
        serializationObject.ints = {};
        for (name in this._ints) {
            serializationObject.ints[name] = this._ints[name];
        }
        // Float
        serializationObject.floats = {};
        for (name in this._floats) {
            serializationObject.floats[name] = this._floats[name];
        }
        // Floats
        serializationObject.FloatArrays = {};
        for (name in this._floatsArrays) {
            serializationObject.FloatArrays[name] = this._floatsArrays[name];
        }
        // Color3
        serializationObject.colors3 = {};
        for (name in this._colors3) {
            serializationObject.colors3[name] = this._colors3[name].asArray();
        }
        // Color3 array
        serializationObject.colors3Arrays = {};
        for (name in this._colors3Arrays) {
            serializationObject.colors3Arrays[name] = this._colors3Arrays[name];
        }
        // Color4
        serializationObject.colors4 = {};
        for (name in this._colors4) {
            serializationObject.colors4[name] = this._colors4[name].asArray();
        }
        // Color4 array
        serializationObject.colors4Arrays = {};
        for (name in this._colors4Arrays) {
            serializationObject.colors4Arrays[name] = this._colors4Arrays[name];
        }
        // Vector2
        serializationObject.vectors2 = {};
        for (name in this._vectors2) {
            serializationObject.vectors2[name] = this._vectors2[name].asArray();
        }
        // Vector3
        serializationObject.vectors3 = {};
        for (name in this._vectors3) {
            serializationObject.vectors3[name] = this._vectors3[name].asArray();
        }
        // Vector4
        serializationObject.vectors4 = {};
        for (name in this._vectors4) {
            serializationObject.vectors4[name] = this._vectors4[name].asArray();
        }
        // Matrix
        serializationObject.matrices = {};
        for (name in this._matrices) {
            serializationObject.matrices[name] = this._matrices[name].asArray();
        }
        // MatrixArray
        serializationObject.matrixArray = {};
        for (name in this._matrixArrays) {
            serializationObject.matrixArray[name] = this._matrixArrays[name];
        }
        // Matrix 3x3
        serializationObject.matrices3x3 = {};
        for (name in this._matrices3x3) {
            serializationObject.matrices3x3[name] = this._matrices3x3[name];
        }
        // Matrix 2x2
        serializationObject.matrices2x2 = {};
        for (name in this._matrices2x2) {
            serializationObject.matrices2x2[name] = this._matrices2x2[name];
        }
        // Vector2Array
        serializationObject.vectors2Arrays = {};
        for (name in this._vectors2Arrays) {
            serializationObject.vectors2Arrays[name] = this._vectors2Arrays[name];
        }
        // Vector3Array
        serializationObject.vectors3Arrays = {};
        for (name in this._vectors3Arrays) {
            serializationObject.vectors3Arrays[name] = this._vectors3Arrays[name];
        }
        // Vector4Array
        serializationObject.vectors4Arrays = {};
        for (name in this._vectors4Arrays) {
            serializationObject.vectors4Arrays[name] = this._vectors4Arrays[name];
        }
        return serializationObject;
    };
    /**
     * Creates a shader material from parsed shader material data
     * @param source defines the JSON representation of the material
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new material
     */
    ShaderMaterial.Parse = function (source, scene, rootUrl) {
        var material = SerializationHelper.Parse(function () { return new ShaderMaterial(source.name, scene, source.shaderPath, source.options, source.storeEffectOnSubMeshes); }, source, scene, rootUrl);
        var name;
        // Stencil
        if (source.stencil) {
            material.stencil.parse(source.stencil, scene, rootUrl);
        }
        // Texture
        for (name in source.textures) {
            material.setTexture(name, Texture.Parse(source.textures[name], scene, rootUrl));
        }
        // Texture arrays
        for (name in source.textureArrays) {
            var array = source.textureArrays[name];
            var textureArray = new Array();
            for (var index = 0; index < array.length; index++) {
                textureArray.push(Texture.Parse(array[index], scene, rootUrl));
            }
            material.setTextureArray(name, textureArray);
        }
        // Int
        for (name in source.ints) {
            material.setInt(name, source.ints[name]);
        }
        // Float
        for (name in source.floats) {
            material.setFloat(name, source.floats[name]);
        }
        // Floats
        for (name in source.floatsArrays) {
            material.setFloats(name, source.floatsArrays[name]);
        }
        // Color3
        for (name in source.colors3) {
            material.setColor3(name, Color3.FromArray(source.colors3[name]));
        }
        // Color3 arrays
        for (name in source.colors3Arrays) {
            var colors = source.colors3Arrays[name]
                .reduce(function (arr, num, i) {
                if (i % 3 === 0) {
                    arr.push([num]);
                }
                else {
                    arr[arr.length - 1].push(num);
                }
                return arr;
            }, [])
                .map(function (color) { return Color3.FromArray(color); });
            material.setColor3Array(name, colors);
        }
        // Color4
        for (name in source.colors4) {
            material.setColor4(name, Color4.FromArray(source.colors4[name]));
        }
        // Color4 arrays
        for (name in source.colors4Arrays) {
            var colors = source.colors4Arrays[name]
                .reduce(function (arr, num, i) {
                if (i % 4 === 0) {
                    arr.push([num]);
                }
                else {
                    arr[arr.length - 1].push(num);
                }
                return arr;
            }, [])
                .map(function (color) { return Color4.FromArray(color); });
            material.setColor4Array(name, colors);
        }
        // Vector2
        for (name in source.vectors2) {
            material.setVector2(name, Vector2.FromArray(source.vectors2[name]));
        }
        // Vector3
        for (name in source.vectors3) {
            material.setVector3(name, Vector3.FromArray(source.vectors3[name]));
        }
        // Vector4
        for (name in source.vectors4) {
            material.setVector4(name, Vector4.FromArray(source.vectors4[name]));
        }
        // Matrix
        for (name in source.matrices) {
            material.setMatrix(name, Matrix.FromArray(source.matrices[name]));
        }
        // MatrixArray
        for (name in source.matrixArray) {
            material._matrixArrays[name] = new Float32Array(source.matrixArray[name]);
        }
        // Matrix 3x3
        for (name in source.matrices3x3) {
            material.setMatrix3x3(name, source.matrices3x3[name]);
        }
        // Matrix 2x2
        for (name in source.matrices2x2) {
            material.setMatrix2x2(name, source.matrices2x2[name]);
        }
        // Vector2Array
        for (name in source.vectors2Arrays) {
            material.setArray2(name, source.vectors2Arrays[name]);
        }
        // Vector3Array
        for (name in source.vectors3Arrays) {
            material.setArray3(name, source.vectors3Arrays[name]);
        }
        // Vector4Array
        for (name in source.vectors4Arrays) {
            material.setArray4(name, source.vectors4Arrays[name]);
        }
        return material;
    };
    /**
     * Creates a new ShaderMaterial from a snippet saved in a remote file
     * @param name defines the name of the ShaderMaterial to create (can be null or empty to use the one from the json data)
     * @param url defines the url to load from
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a promise that will resolve to the new ShaderMaterial
     */
    ShaderMaterial.ParseFromFileAsync = function (name, url, scene, rootUrl) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var serializationObject = JSON.parse(request.responseText);
                        var output = _this.Parse(serializationObject, scene || EngineStore.LastCreatedScene, rootUrl);
                        if (name) {
                            output.name = name;
                        }
                        resolve(output);
                    }
                    else {
                        reject("Unable to load the ShaderMaterial");
                    }
                }
            });
            request.open("GET", url);
            request.send();
        });
    };
    /**
     * Creates a ShaderMaterial from a snippet saved by the Inspector
     * @param snippetId defines the snippet to load
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a promise that will resolve to the new ShaderMaterial
     */
    ShaderMaterial.CreateFromSnippetAsync = function (snippetId, scene, rootUrl) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var snippet = JSON.parse(JSON.parse(request.responseText).jsonPayload);
                        var serializationObject = JSON.parse(snippet.shaderMaterial);
                        var output = _this.Parse(serializationObject, scene || EngineStore.LastCreatedScene, rootUrl);
                        output.snippetId = snippetId;
                        resolve(output);
                    }
                    else {
                        reject("Unable to load the snippet " + snippetId);
                    }
                }
            });
            request.open("GET", _this.SnippetUrl + "/" + snippetId.replace(/#/g, "/"));
            request.send();
        });
    };
    /** Define the Url to load snippets */
    ShaderMaterial.SnippetUrl = `https://snippet.babylonjs.com`;
    return ShaderMaterial;
}(PushMaterial));
export { ShaderMaterial };
RegisterClass("BABYLON.ShaderMaterial", ShaderMaterial);
//# sourceMappingURL=shaderMaterial.js.map