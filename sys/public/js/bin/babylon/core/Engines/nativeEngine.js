import { __awaiter, __extends, __generator } from "tslib";
import { Engine } from "../Engines/engine.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { InternalTexture, InternalTextureSource } from "../Materials/Textures/internalTexture.js";
import { Texture } from "../Materials/Textures/texture.js";
import { DataBuffer } from "../Buffers/dataBuffer.js";
import { Tools } from "../Misc/tools.js";
import { Observable } from "../Misc/observable.js";
import { CreateImageDataArrayBufferViews, GetEnvInfo, UploadEnvSpherical } from "../Misc/environmentTextureTools.js";
import { Logger } from "../Misc/logger.js";

import { ThinEngine } from "./thinEngine.js";
import { EngineStore } from "./engineStore.js";
import { ShaderCodeInliner } from "./Processors/shaderCodeInliner.js";
import { WebGL2ShaderProcessor } from "../Engines/WebGL/webGL2ShaderProcessors.js";
import { RenderTargetWrapper } from "./renderTargetWrapper.js";
import { NativeDataStream } from "./Native/nativeDataStream.js";
import { RuntimeError, ErrorCodes } from "../Misc/error.js";
import { WebGLHardwareTexture } from "./WebGL/webGLHardwareTexture.js";
var onNativeObjectInitialized = new Observable();
if (typeof self !== "undefined" && !Object.prototype.hasOwnProperty.call(self, "_native")) {
    var __native_1;
    Object.defineProperty(self, "_native", {
        get: function () { return __native_1; },
        set: function (value) {
            __native_1 = value;
            if (__native_1) {
                onNativeObjectInitialized.notifyObservers(__native_1);
            }
        },
    });
}
/**
 * Returns _native only after it has been defined by BabylonNative.
 * @hidden
 */
export function AcquireNativeObjectAsync() {
    return new Promise(function (resolve) {
        if (typeof _native === "undefined") {
            onNativeObjectInitialized.addOnce(function (nativeObject) { return resolve(nativeObject); });
        }
        else {
            resolve(_native);
        }
    });
}
/**
 * Registers a constructor on the _native object. See NativeXRFrame for an example.
 * @param typeName
 * @param constructor
 * @hidden
 */
export function RegisterNativeTypeAsync(typeName, constructor) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AcquireNativeObjectAsync()];
                case 1:
                    (_a.sent())[typeName] = constructor;
                    return [2 /*return*/];
            }
        });
    });
}
var NativePipelineContext = /** @class */ (function () {
    function NativePipelineContext(engine) {
        // TODO: async should be true?
        this.isAsync = false;
        this.isReady = false;
        this._valueCache = {};
        this.engine = engine;
    }
    NativePipelineContext.prototype._getVertexShaderCode = function () {
        return null;
    };
    NativePipelineContext.prototype._getFragmentShaderCode = function () {
        return null;
    };
    // TODO: what should this do?
    NativePipelineContext.prototype._handlesSpectorRebuildCallback = function (onCompiled) {
        throw new Error("Not implemented");
    };
    NativePipelineContext.prototype._fillEffectInformation = function (effect, uniformBuffersNames, uniformsNames, uniforms, samplerList, samplers, attributesNames, attributes) {
        var engine = this.engine;
        if (engine.supportsUniformBuffers) {
            for (var name_1 in uniformBuffersNames) {
                effect.bindUniformBlock(name_1, uniformBuffersNames[name_1]);
            }
        }
        var effectAvailableUniforms = this.engine.getUniforms(this, uniformsNames);
        effectAvailableUniforms.forEach(function (uniform, index) {
            uniforms[uniformsNames[index]] = uniform;
        });
        this._uniforms = uniforms;
        var index;
        for (index = 0; index < samplerList.length; index++) {
            var sampler = effect.getUniform(samplerList[index]);
            if (sampler == null) {
                samplerList.splice(index, 1);
                index--;
            }
        }
        samplerList.forEach(function (name, index) {
            samplers[name] = index;
        });
        attributes.push.apply(attributes, engine.getAttributes(this, attributesNames));
    };
    /**
     * Release all associated resources.
     **/
    NativePipelineContext.prototype.dispose = function () {
        this._uniforms = {};
    };
    /**
     * @param uniformName
     * @param matrix
     * @hidden
     */
    NativePipelineContext.prototype._cacheMatrix = function (uniformName, matrix) {
        var cache = this._valueCache[uniformName];
        var flag = matrix.updateFlag;
        if (cache !== undefined && cache === flag) {
            return false;
        }
        this._valueCache[uniformName] = flag;
        return true;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @hidden
     */
    NativePipelineContext.prototype._cacheFloat2 = function (uniformName, x, y) {
        var cache = this._valueCache[uniformName];
        if (!cache) {
            cache = [x, y];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        return changed;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @param z
     * @hidden
     */
    NativePipelineContext.prototype._cacheFloat3 = function (uniformName, x, y, z) {
        var cache = this._valueCache[uniformName];
        if (!cache) {
            cache = [x, y, z];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        if (cache[2] !== z) {
            cache[2] = z;
            changed = true;
        }
        return changed;
    };
    /**
     * @param uniformName
     * @param x
     * @param y
     * @param z
     * @param w
     * @hidden
     */
    NativePipelineContext.prototype._cacheFloat4 = function (uniformName, x, y, z, w) {
        var cache = this._valueCache[uniformName];
        if (!cache) {
            cache = [x, y, z, w];
            this._valueCache[uniformName] = cache;
            return true;
        }
        var changed = false;
        if (cache[0] !== x) {
            cache[0] = x;
            changed = true;
        }
        if (cache[1] !== y) {
            cache[1] = y;
            changed = true;
        }
        if (cache[2] !== z) {
            cache[2] = z;
            changed = true;
        }
        if (cache[3] !== w) {
            cache[3] = w;
            changed = true;
        }
        return changed;
    };
    /**
     * Sets an integer value on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value Value to be set.
     */
    NativePipelineContext.prototype.setInt = function (uniformName, value) {
        var cache = this._valueCache[uniformName];
        if (cache !== undefined && cache === value) {
            return;
        }
        if (this.engine.setInt(this._uniforms[uniformName], value)) {
            this._valueCache[uniformName] = value;
        }
    };
    /**
     * Sets a int2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int2.
     * @param y Second int in int2.
     */
    NativePipelineContext.prototype.setInt2 = function (uniformName, x, y) {
        if (this._cacheFloat2(uniformName, x, y)) {
            if (!this.engine.setInt2(this._uniforms[uniformName], x, y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a int3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int3.
     * @param y Second int in int3.
     * @param z Third int in int3.
     */
    NativePipelineContext.prototype.setInt3 = function (uniformName, x, y, z) {
        if (this._cacheFloat3(uniformName, x, y, z)) {
            if (!this.engine.setInt3(this._uniforms[uniformName], x, y, z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a int4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First int in int4.
     * @param y Second int in int4.
     * @param z Third int in int4.
     * @param w Fourth int in int4.
     */
    NativePipelineContext.prototype.setInt4 = function (uniformName, x, y, z, w) {
        if (this._cacheFloat4(uniformName, x, y, z, w)) {
            if (!this.engine.setInt4(this._uniforms[uniformName], x, y, z, w)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets an int array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setIntArray = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setIntArray2 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray2(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setIntArray3 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray3(this._uniforms[uniformName], array);
    };
    /**
     * Sets an int array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setIntArray4 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setIntArray4(this._uniforms[uniformName], array);
    };
    /**
     * Sets an float array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setFloatArray = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setFloatArray(this._uniforms[uniformName], array);
    };
    /**
     * Sets an float array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setFloatArray2 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setFloatArray2(this._uniforms[uniformName], array);
    };
    /**
     * Sets an float array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setFloatArray3 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setFloatArray3(this._uniforms[uniformName], array);
    };
    /**
     * Sets an float array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setFloatArray4 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setFloatArray4(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array on a uniform variable.
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setArray = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 2 on a uniform variable. (Array is specified as single array eg. [1,2,3,4] will result in [[1,2],[3,4]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setArray2 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray2(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 3 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6] will result in [[1,2,3],[4,5,6]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     * @returns this effect.
     */
    NativePipelineContext.prototype.setArray3 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray3(this._uniforms[uniformName], array);
    };
    /**
     * Sets an array 4 on a uniform variable. (Array is specified as single array eg. [1,2,3,4,5,6,7,8] will result in [[1,2,3,4],[5,6,7,8]] in the shader)
     * @param uniformName Name of the variable.
     * @param array array to be set.
     */
    NativePipelineContext.prototype.setArray4 = function (uniformName, array) {
        this._valueCache[uniformName] = null;
        this.engine.setArray4(this._uniforms[uniformName], array);
    };
    /**
     * Sets matrices on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrices matrices to be set.
     */
    NativePipelineContext.prototype.setMatrices = function (uniformName, matrices) {
        if (!matrices) {
            return;
        }
        this._valueCache[uniformName] = null;
        this.engine.setMatrices(this._uniforms[uniformName], matrices);
    };
    /**
     * Sets matrix on a uniform variable.
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    NativePipelineContext.prototype.setMatrix = function (uniformName, matrix) {
        if (this._cacheMatrix(uniformName, matrix)) {
            if (!this.engine.setMatrices(this._uniforms[uniformName], matrix.toArray())) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a 3x3 matrix on a uniform variable. (Specified as [1,2,3,4,5,6,7,8,9] will result in [1,2,3][4,5,6][7,8,9] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    NativePipelineContext.prototype.setMatrix3x3 = function (uniformName, matrix) {
        this._valueCache[uniformName] = null;
        this.engine.setMatrix3x3(this._uniforms[uniformName], matrix);
    };
    /**
     * Sets a 2x2 matrix on a uniform variable. (Specified as [1,2,3,4] will result in [1,2][3,4] matrix)
     * @param uniformName Name of the variable.
     * @param matrix matrix to be set.
     */
    NativePipelineContext.prototype.setMatrix2x2 = function (uniformName, matrix) {
        this._valueCache[uniformName] = null;
        this.engine.setMatrix2x2(this._uniforms[uniformName], matrix);
    };
    /**
     * Sets a float on a uniform variable.
     * @param uniformName Name of the variable.
     * @param value value to be set.
     * @returns this effect.
     */
    NativePipelineContext.prototype.setFloat = function (uniformName, value) {
        var cache = this._valueCache[uniformName];
        if (cache !== undefined && cache === value) {
            return;
        }
        if (this.engine.setFloat(this._uniforms[uniformName], value)) {
            this._valueCache[uniformName] = value;
        }
    };
    /**
     * Sets a boolean on a uniform variable.
     * @param uniformName Name of the variable.
     * @param bool value to be set.
     */
    NativePipelineContext.prototype.setBool = function (uniformName, bool) {
        var cache = this._valueCache[uniformName];
        if (cache !== undefined && cache === bool) {
            return;
        }
        if (this.engine.setInt(this._uniforms[uniformName], bool ? 1 : 0)) {
            this._valueCache[uniformName] = bool ? 1 : 0;
        }
    };
    /**
     * Sets a Vector2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector2 vector2 to be set.
     */
    NativePipelineContext.prototype.setVector2 = function (uniformName, vector2) {
        if (this._cacheFloat2(uniformName, vector2.x, vector2.y)) {
            if (!this.engine.setFloat2(this._uniforms[uniformName], vector2.x, vector2.y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a float2 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float2.
     * @param y Second float in float2.
     */
    NativePipelineContext.prototype.setFloat2 = function (uniformName, x, y) {
        if (this._cacheFloat2(uniformName, x, y)) {
            if (!this.engine.setFloat2(this._uniforms[uniformName], x, y)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Vector3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector3 Value to be set.
     */
    NativePipelineContext.prototype.setVector3 = function (uniformName, vector3) {
        if (this._cacheFloat3(uniformName, vector3.x, vector3.y, vector3.z)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], vector3.x, vector3.y, vector3.z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a float3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float3.
     * @param y Second float in float3.
     * @param z Third float in float3.
     */
    NativePipelineContext.prototype.setFloat3 = function (uniformName, x, y, z) {
        if (this._cacheFloat3(uniformName, x, y, z)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], x, y, z)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Vector4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param vector4 Value to be set.
     */
    NativePipelineContext.prototype.setVector4 = function (uniformName, vector4) {
        if (this._cacheFloat4(uniformName, vector4.x, vector4.y, vector4.z, vector4.w)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], vector4.x, vector4.y, vector4.z, vector4.w)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a float4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param x First float in float4.
     * @param y Second float in float4.
     * @param z Third float in float4.
     * @param w Fourth float in float4.
     * @returns this effect.
     */
    NativePipelineContext.prototype.setFloat4 = function (uniformName, x, y, z, w) {
        if (this._cacheFloat4(uniformName, x, y, z, w)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], x, y, z, w)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color3 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     */
    NativePipelineContext.prototype.setColor3 = function (uniformName, color3) {
        if (this._cacheFloat3(uniformName, color3.r, color3.g, color3.b)) {
            if (!this.engine.setFloat3(this._uniforms[uniformName], color3.r, color3.g, color3.b)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color4 on a uniform variable.
     * @param uniformName Name of the variable.
     * @param color3 Value to be set.
     * @param alpha Alpha value to be set.
     */
    NativePipelineContext.prototype.setColor4 = function (uniformName, color3, alpha) {
        if (this._cacheFloat4(uniformName, color3.r, color3.g, color3.b, alpha)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], color3.r, color3.g, color3.b, alpha)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    /**
     * Sets a Color4 on a uniform variable
     * @param uniformName defines the name of the variable
     * @param color4 defines the value to be set
     */
    NativePipelineContext.prototype.setDirectColor4 = function (uniformName, color4) {
        if (this._cacheFloat4(uniformName, color4.r, color4.g, color4.b, color4.a)) {
            if (!this.engine.setFloat4(this._uniforms[uniformName], color4.r, color4.g, color4.b, color4.a)) {
                this._valueCache[uniformName] = null;
            }
        }
    };
    return NativePipelineContext;
}());
var NativeRenderTargetWrapper = /** @class */ (function (_super) {
    __extends(NativeRenderTargetWrapper, _super);
    function NativeRenderTargetWrapper(isMulti, isCube, size, engine) {
        var _this = _super.call(this, isMulti, isCube, size, engine) || this;
        _this.__framebuffer = null;
        _this.__framebufferDepthStencil = null;
        _this._engine = engine;
        return _this;
    }
    Object.defineProperty(NativeRenderTargetWrapper.prototype, "_framebuffer", {
        get: function () {
            return this.__framebuffer;
        },
        set: function (framebuffer) {
            if (this.__framebuffer) {
                this._engine._releaseFramebufferObjects(this.__framebuffer);
            }
            this.__framebuffer = framebuffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NativeRenderTargetWrapper.prototype, "_framebufferDepthStencil", {
        get: function () {
            return this.__framebufferDepthStencil;
        },
        set: function (framebufferDepthStencil) {
            if (this.__framebufferDepthStencil) {
                this._engine._releaseFramebufferObjects(this.__framebufferDepthStencil);
            }
            this.__framebufferDepthStencil = framebufferDepthStencil;
        },
        enumerable: false,
        configurable: true
    });
    NativeRenderTargetWrapper.prototype.dispose = function (disposeOnlyFramebuffers) {
        if (disposeOnlyFramebuffers === void 0) { disposeOnlyFramebuffers = false; }
        this._framebuffer = null;
        this._framebufferDepthStencil = null;
        _super.prototype.dispose.call(this, disposeOnlyFramebuffers);
    };
    return NativeRenderTargetWrapper;
}(RenderTargetWrapper));
/**
 * Container for accessors for natively-stored mesh data buffers.
 */
var NativeDataBuffer = /** @class */ (function (_super) {
    __extends(NativeDataBuffer, _super);
    function NativeDataBuffer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NativeDataBuffer;
}(DataBuffer));
/** @hidden */
var CommandBufferEncoder = /** @class */ (function () {
    function CommandBufferEncoder(_engine) {
        this._engine = _engine;
        this._pending = new Array();
        this._isCommandBufferScopeActive = false;
        this._commandStream = NativeEngine._createNativeDataStream();
        this._engine.setCommandDataStream(this._commandStream);
    }
    CommandBufferEncoder.prototype.beginCommandScope = function () {
        if (this._isCommandBufferScopeActive) {
            throw new Error("Command scope already active.");
        }
        this._isCommandBufferScopeActive = true;
    };
    CommandBufferEncoder.prototype.endCommandScope = function () {
        if (!this._isCommandBufferScopeActive) {
            throw new Error("Command scope is not active.");
        }
        this._isCommandBufferScopeActive = false;
        this._submit();
    };
    CommandBufferEncoder.prototype.startEncodingCommand = function (command) {
        this._commandStream.writeNativeData(command);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsUInt32 = function (commandArg) {
        this._commandStream.writeUint32(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsUInt32s = function (commandArg) {
        this._commandStream.writeUint32Array(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsInt32 = function (commandArg) {
        this._commandStream.writeInt32(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsInt32s = function (commandArg) {
        this._commandStream.writeInt32Array(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsFloat32 = function (commandArg) {
        this._commandStream.writeFloat32(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsFloat32s = function (commandArg) {
        this._commandStream.writeFloat32Array(commandArg);
    };
    CommandBufferEncoder.prototype.encodeCommandArgAsNativeData = function (commandArg) {
        this._commandStream.writeNativeData(commandArg);
        this._pending.push(commandArg);
    };
    CommandBufferEncoder.prototype.finishEncodingCommand = function () {
        if (!this._isCommandBufferScopeActive) {
            this._submit();
        }
    };
    CommandBufferEncoder.prototype._submit = function () {
        this._engine.submitCommands();
        this._pending.length = 0;
    };
    return CommandBufferEncoder;
}());
/** @hidden */
var NativeEngine = /** @class */ (function (_super) {
    __extends(NativeEngine, _super);
    function NativeEngine(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, null, false, undefined, options.adaptToDeviceRatio) || this;
        _this._engine = new _native.Engine();
        _this._camera = _native.Camera ? new _native.Camera() : null;
        _this._commandBufferEncoder = new CommandBufferEncoder(_this._engine);
        _this._boundBuffersVertexArray = null;
        _this._currentDepthTest = _native.Engine.DEPTH_TEST_LEQUAL;
        _this._stencilTest = false;
        _this._stencilMask = 255;
        _this._stencilFunc = 519;
        _this._stencilFuncRef = 0;
        _this._stencilFuncMask = 255;
        _this._stencilOpStencilFail = 7680;
        _this._stencilOpDepthFail = 7680;
        _this._stencilOpStencilDepthPass = 7681;
        _this._zOffset = 0;
        _this._zOffsetUnits = 0;
        _this._depthWrite = true;
        if (_native.Engine.PROTOCOL_VERSION !== NativeEngine.PROTOCOL_VERSION) {
            throw new Error("Protocol version mismatch: ".concat(_native.Engine.PROTOCOL_VERSION, " (Native) !== ").concat(NativeEngine.PROTOCOL_VERSION, " (JS)"));
        }
        _this._webGLVersion = 2;
        _this.disableUniformBuffers = true;
        // TODO: Initialize this more correctly based on the hardware capabilities.
        // Init caps
        _this._caps = {
            maxTexturesImageUnits: 16,
            maxVertexTextureImageUnits: 16,
            maxCombinedTexturesImageUnits: 32,
            maxTextureSize: _native.Engine.CAPS_LIMITS_MAX_TEXTURE_SIZE,
            maxCubemapTextureSize: 512,
            maxRenderTextureSize: 512,
            maxVertexAttribs: 16,
            maxVaryingVectors: 16,
            maxFragmentUniformVectors: 16,
            maxVertexUniformVectors: 16,
            standardDerivatives: true,
            astc: null,
            pvrtc: null,
            etc1: null,
            etc2: null,
            bptc: null,
            maxAnisotropy: 16,
            uintIndices: true,
            fragmentDepthSupported: false,
            highPrecisionShaderSupported: true,
            colorBufferFloat: false,
            textureFloat: true,
            textureFloatLinearFiltering: false,
            textureFloatRender: false,
            textureHalfFloat: false,
            textureHalfFloatLinearFiltering: false,
            textureHalfFloatRender: false,
            textureLOD: true,
            drawBuffersExtension: false,
            depthTextureExtension: false,
            vertexArrayObject: true,
            instancedArrays: false,
            supportOcclusionQuery: false,
            canUseTimestampForTimerQuery: false,
            blendMinMax: false,
            maxMSAASamples: 1,
            canUseGLInstanceID: true,
            canUseGLVertexID: true,
            supportComputeShaders: false,
            supportSRGBBuffers: true,
            supportTransformFeedbacks: false,
            textureMaxLevel: false,
            texture2DArrayMaxLayerCount: _native.Engine.CAPS_LIMITS_MAX_TEXTURE_LAYERS,
        };
        _this._features = {
            forceBitmapOverHTMLImageElement: false,
            supportRenderAndCopyToLodForFloatTextures: false,
            supportDepthStencilTexture: false,
            supportShadowSamplers: false,
            uniformBufferHardCheckMatrix: false,
            allowTexturePrefiltering: false,
            trackUbosInFrame: false,
            checkUbosContentBeforeUpload: false,
            supportCSM: false,
            basisNeedsPOT: false,
            support3DTextures: false,
            needTypeSuffixInShaderConstants: false,
            supportMSAA: false,
            supportSSAO2: false,
            supportExtendedTextureFormats: false,
            supportSwitchCaseInShader: false,
            supportSyncTextureRead: false,
            needsInvertingBitmap: true,
            useUBOBindingCache: true,
            needShaderCodeInlining: true,
            needToAlwaysBindUniformBuffers: false,
            supportRenderPasses: true,
            _collectUbosUpdatedInFrame: false,
        };
        Tools.Log("Babylon Native (v" + Engine.Version + ") launched");
        Tools.LoadScript = function (scriptUrl, onSuccess, onError, scriptId) {
            Tools.LoadFile(scriptUrl, function (data) {
                Function(data).apply(null);
                if (onSuccess) {
                    onSuccess();
                }
            }, undefined, undefined, false, function (request, exception) {
                if (onError) {
                    onError("LoadScript Error", exception);
                }
            });
        };
        // Wrappers
        if (typeof URL === "undefined") {
            window.URL = {
                createObjectURL: function () { },
                revokeObjectURL: function () { },
            };
        }
        if (typeof Blob === "undefined") {
            window.Blob = function (v) {
                return v;
            };
        }
        // Currently we do not fully configure the ThinEngine on construction of NativeEngine.
        // Setup resolution scaling based on display settings.
        var devicePixelRatio = window ? window.devicePixelRatio || 1.0 : 1.0;
        _this._hardwareScalingLevel = options.adaptToDeviceRatio ? devicePixelRatio : 1.0;
        _this.resize();
        var currentDepthFunction = _this.getDepthFunction();
        if (currentDepthFunction) {
            _this.setDepthFunction(currentDepthFunction);
        }
        // Shader processor
        _this._shaderProcessor = new WebGL2ShaderProcessor();
        _this.onNewSceneAddedObservable.add(function (scene) {
            var originalRender = scene.render;
            scene.render = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this._commandBufferEncoder.beginCommandScope();
                originalRender.apply(scene, args);
                _this._commandBufferEncoder.endCommandScope();
            };
        });
        return _this;
    }
    NativeEngine.prototype.getHardwareScalingLevel = function () {
        return this._engine.getHardwareScalingLevel();
    };
    NativeEngine.prototype.setHardwareScalingLevel = function (level) {
        this._engine.setHardwareScalingLevel(level);
    };
    NativeEngine.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._boundBuffersVertexArray) {
            this._deleteVertexArray(this._boundBuffersVertexArray);
        }
        this._engine.dispose();
    };
    /** @hidden */
    NativeEngine._createNativeDataStream = function () {
        return new NativeDataStream();
    };
    /**
     * Can be used to override the current requestAnimationFrame requester.
     * @param bindedRenderFunction
     * @param requester
     * @hidden
     */
    NativeEngine.prototype._queueNewFrame = function (bindedRenderFunction, requester) {
        // Use the provided requestAnimationFrame, unless the requester is the window. In that case, we will default to the Babylon Native version of requestAnimationFrame.
        if (requester.requestAnimationFrame && requester !== window) {
            requester.requestAnimationFrame(bindedRenderFunction);
        }
        else {
            this._engine.requestAnimationFrame(bindedRenderFunction);
        }
        return 0;
    };
    /**
     * Override default engine behavior.
     * @param framebuffer
     */
    NativeEngine.prototype._bindUnboundFramebuffer = function (framebuffer) {
        if (this._currentFramebuffer !== framebuffer) {
            if (this._currentFramebuffer) {
                this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_UNBINDFRAMEBUFFER);
                this._commandBufferEncoder.encodeCommandArgAsNativeData(this._currentFramebuffer);
                this._commandBufferEncoder.finishEncodingCommand();
            }
            if (framebuffer) {
                this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_BINDFRAMEBUFFER);
                this._commandBufferEncoder.encodeCommandArgAsNativeData(framebuffer);
                this._commandBufferEncoder.finishEncodingCommand();
            }
            this._currentFramebuffer = framebuffer;
        }
    };
    /**
     * Gets host document
     * @returns the host document object
     */
    NativeEngine.prototype.getHostDocument = function () {
        return null;
    };
    NativeEngine.prototype.clear = function (color, backBuffer, depth, stencil) {
        if (stencil === void 0) { stencil = false; }
        if (this.useReverseDepthBuffer) {
            throw new Error("reverse depth buffer is not currently implemented");
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_CLEAR);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(backBuffer && color ? 1 : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(color ? color.r : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(color ? color.g : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(color ? color.b : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(color ? color.a : 1);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(depth ? 1 : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(1);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(stencil ? 1 : 0);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(0);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    NativeEngine.prototype.createIndexBuffer = function (indices, updateable) {
        var data = this._normalizeIndexData(indices);
        var buffer = new NativeDataBuffer();
        buffer.references = 1;
        buffer.is32Bits = data.BYTES_PER_ELEMENT === 4;
        if (data.byteLength) {
            buffer.nativeIndexBuffer = this._engine.createIndexBuffer(data.buffer, data.byteOffset, data.byteLength, buffer.is32Bits, updateable !== null && updateable !== void 0 ? updateable : false);
        }
        return buffer;
    };
    NativeEngine.prototype.createVertexBuffer = function (vertices, updateable) {
        var data = ArrayBuffer.isView(vertices) ? vertices : new Float32Array(vertices);
        var buffer = new NativeDataBuffer();
        buffer.references = 1;
        if (data.byteLength) {
            buffer.nativeVertexBuffer = this._engine.createVertexBuffer(data.buffer, data.byteOffset, data.byteLength, updateable !== null && updateable !== void 0 ? updateable : false);
        }
        return buffer;
    };
    NativeEngine.prototype._recordVertexArrayObject = function (vertexArray, vertexBuffers, indexBuffer, effect) {
        if (indexBuffer) {
            this._engine.recordIndexBuffer(vertexArray, indexBuffer.nativeIndexBuffer);
        }
        var attributes = effect.getAttributesNames();
        for (var index = 0; index < attributes.length; index++) {
            var location_1 = effect.getAttributeLocation(index);
            if (location_1 >= 0) {
                var kind = attributes[index];
                var vertexBuffer = vertexBuffers[kind];
                if (vertexBuffer) {
                    var buffer = vertexBuffer.getBuffer();
                    if (buffer) {
                        this._engine.recordVertexBuffer(vertexArray, buffer.nativeVertexBuffer, location_1, vertexBuffer.byteOffset, vertexBuffer.byteStride, vertexBuffer.getSize(), this._getNativeAttribType(vertexBuffer.type), vertexBuffer.normalized, vertexBuffer.getInstanceDivisor());
                    }
                }
            }
        }
    };
    NativeEngine.prototype.bindBuffers = function (vertexBuffers, indexBuffer, effect) {
        if (this._boundBuffersVertexArray) {
            this._deleteVertexArray(this._boundBuffersVertexArray);
        }
        this._boundBuffersVertexArray = this._engine.createVertexArray();
        this._recordVertexArrayObject(this._boundBuffersVertexArray, vertexBuffers, indexBuffer, effect);
        this.bindVertexArrayObject(this._boundBuffersVertexArray);
    };
    NativeEngine.prototype.recordVertexArrayObject = function (vertexBuffers, indexBuffer, effect) {
        var vertexArray = this._engine.createVertexArray();
        this._recordVertexArrayObject(vertexArray, vertexBuffers, indexBuffer, effect);
        return vertexArray;
    };
    NativeEngine.prototype._deleteVertexArray = function (vertexArray) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DELETEVERTEXARRAY);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(vertexArray);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    NativeEngine.prototype.bindVertexArrayObject = function (vertexArray) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_BINDVERTEXARRAY);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(vertexArray);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    NativeEngine.prototype.releaseVertexArrayObject = function (vertexArray) {
        this._deleteVertexArray(vertexArray);
    };
    NativeEngine.prototype.getAttributes = function (pipelineContext, attributesNames) {
        var nativePipelineContext = pipelineContext;
        return this._engine.getAttributes(nativePipelineContext.nativeProgram, attributesNames);
    };
    /**
     * Draw a list of indexed primitives
     * @param fillMode defines the primitive to use
     * @param indexStart defines the starting index
     * @param indexCount defines the number of index to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    NativeEngine.prototype.drawElementsType = function (fillMode, indexStart, indexCount, instancesCount) {
        // Apply states
        this._drawCalls.addCount(1, false);
        // TODO: Make this implementation more robust like core Engine version.
        // Render
        //var indexFormat = this._uintIndicesCurrentlySet ? this._gl.UNSIGNED_INT : this._gl.UNSIGNED_SHORT;
        //var mult = this._uintIndicesCurrentlySet ? 4 : 2;
        // if (instancesCount) {
        //     this._gl.drawElementsInstanced(drawMode, indexCount, indexFormat, indexStart * mult, instancesCount);
        // } else {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DRAWINDEXED);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(fillMode);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(indexStart);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(indexCount);
        this._commandBufferEncoder.finishEncodingCommand();
        // }
    };
    /**
     * Draw a list of unindexed primitives
     * @param fillMode defines the primitive to use
     * @param verticesStart defines the index of first vertex to draw
     * @param verticesCount defines the count of vertices to draw
     * @param instancesCount defines the number of instances to draw (if instantiation is enabled)
     */
    NativeEngine.prototype.drawArraysType = function (fillMode, verticesStart, verticesCount, instancesCount) {
        // Apply states
        this._drawCalls.addCount(1, false);
        // TODO: Make this implementation more robust like core Engine version.
        // if (instancesCount) {
        //     this._gl.drawArraysInstanced(drawMode, verticesStart, verticesCount, instancesCount);
        // } else {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DRAW);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(fillMode);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(verticesStart);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(verticesCount);
        this._commandBufferEncoder.finishEncodingCommand();
        // }
    };
    NativeEngine.prototype.createPipelineContext = function () {
        return new NativePipelineContext(this);
    };
    NativeEngine.prototype.createMaterialContext = function () {
        return undefined;
    };
    NativeEngine.prototype.createDrawContext = function () {
        return undefined;
    };
    NativeEngine.prototype._preparePipelineContext = function (pipelineContext, vertexSourceCode, fragmentSourceCode, createAsRaw, rawVertexSourceCode, rawFragmentSourceCode, rebuildRebind, defines, transformFeedbackVaryings) {
        var nativePipelineContext = pipelineContext;
        if (createAsRaw) {
            nativePipelineContext.nativeProgram = this.createRawShaderProgram(pipelineContext, vertexSourceCode, fragmentSourceCode, undefined, transformFeedbackVaryings);
        }
        else {
            nativePipelineContext.nativeProgram = this.createShaderProgram(pipelineContext, vertexSourceCode, fragmentSourceCode, defines, undefined, transformFeedbackVaryings);
        }
    };
    /**
     * @param pipelineContext
     * @hidden
     */
    NativeEngine.prototype._isRenderingStateCompiled = function (pipelineContext) {
        // TODO: support async shader compilcation
        return true;
    };
    /**
     * @param pipelineContext
     * @param action
     * @hidden
     */
    NativeEngine.prototype._executeWhenRenderingStateIsCompiled = function (pipelineContext, action) {
        // TODO: support async shader compilcation
        action();
    };
    NativeEngine.prototype.createRawShaderProgram = function (pipelineContext, vertexCode, fragmentCode, context, transformFeedbackVaryings) {
        if (transformFeedbackVaryings === void 0) { transformFeedbackVaryings = null; }
        throw new Error("Not Supported");
    };
    NativeEngine.prototype.createShaderProgram = function (pipelineContext, vertexCode, fragmentCode, defines, context, transformFeedbackVaryings) {
        if (transformFeedbackVaryings === void 0) { transformFeedbackVaryings = null; }
        this.onBeforeShaderCompilationObservable.notifyObservers(this);
        var vertexInliner = new ShaderCodeInliner(vertexCode);
        vertexInliner.processCode();
        vertexCode = vertexInliner.code;
        var fragmentInliner = new ShaderCodeInliner(fragmentCode);
        fragmentInliner.processCode();
        fragmentCode = fragmentInliner.code;
        vertexCode = ThinEngine._ConcatenateShader(vertexCode, defines);
        fragmentCode = ThinEngine._ConcatenateShader(fragmentCode, defines);
        var program = this._engine.createProgram(vertexCode, fragmentCode);
        this.onAfterShaderCompilationObservable.notifyObservers(this);
        return program;
    };
    /**
     * Inline functions in shader code that are marked to be inlined
     * @param code code to inline
     * @returns inlined code
     */
    NativeEngine.prototype.inlineShaderCode = function (code) {
        var sci = new ShaderCodeInliner(code);
        sci.debug = false;
        sci.processCode();
        return sci.code;
    };
    NativeEngine.prototype._setProgram = function (program) {
        if (this._currentProgram !== program) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETPROGRAM);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(program);
            this._commandBufferEncoder.finishEncodingCommand();
            this._currentProgram = program;
        }
    };
    NativeEngine.prototype._deletePipelineContext = function (pipelineContext) {
        var nativePipelineContext = pipelineContext;
        if (nativePipelineContext && nativePipelineContext.nativeProgram) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DELETEPROGRAM);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(nativePipelineContext.nativeProgram);
            this._commandBufferEncoder.finishEncodingCommand();
        }
    };
    NativeEngine.prototype.getUniforms = function (pipelineContext, uniformsNames) {
        var nativePipelineContext = pipelineContext;
        return this._engine.getUniforms(nativePipelineContext.nativeProgram, uniformsNames);
    };
    NativeEngine.prototype.bindUniformBlock = function (pipelineContext, blockName, index) {
        // TODO
        throw new Error("Not Implemented");
    };
    NativeEngine.prototype.bindSamplers = function (effect) {
        var nativePipelineContext = effect.getPipelineContext();
        this._setProgram(nativePipelineContext.nativeProgram);
        // TODO: share this with engine?
        var samplers = effect.getSamplers();
        for (var index = 0; index < samplers.length; index++) {
            var uniform = effect.getUniform(samplers[index]);
            if (uniform) {
                this._boundUniforms[index] = uniform;
            }
        }
        this._currentEffect = null;
    };
    NativeEngine.prototype.setMatrix = function (uniform, matrix) {
        if (!uniform) {
            return;
        }
        var matrixArray = matrix.toArray();
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETMATRIX);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(matrixArray);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    NativeEngine.prototype.getRenderWidth = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.width;
        }
        return this._engine.getRenderWidth();
    };
    NativeEngine.prototype.getRenderHeight = function (useScreen) {
        if (useScreen === void 0) { useScreen = false; }
        if (!useScreen && this._currentRenderTarget) {
            return this._currentRenderTarget.height;
        }
        return this._engine.getRenderHeight();
    };
    NativeEngine.prototype.setViewport = function (viewport, requiredWidth, requiredHeight) {
        this._cachedViewport = viewport;
        this._engine.setViewPort(viewport.x, viewport.y, viewport.width, viewport.height);
    };
    NativeEngine.prototype.setState = function (culling, zOffset, force, reverseSide, cullBackFaces, stencil, zOffsetUnits) {
        var _a, _b;
        if (zOffset === void 0) { zOffset = 0; }
        if (reverseSide === void 0) { reverseSide = false; }
        if (zOffsetUnits === void 0) { zOffsetUnits = 0; }
        this._zOffset = zOffset;
        this._zOffsetUnits = zOffsetUnits;
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETSTATE);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(culling ? 1 : 0);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(zOffset);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(zOffsetUnits);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(((_b = (_a = this.cullBackFaces) !== null && _a !== void 0 ? _a : cullBackFaces) !== null && _b !== void 0 ? _b : true) ? 1 : 0);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(reverseSide ? 1 : 0);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Gets the client rect of native canvas.  Needed for InputManager.
     * @returns a client rectangle
     */
    NativeEngine.prototype.getInputElementClientRect = function () {
        var rect = {
            bottom: this.getRenderHeight(),
            height: this.getRenderHeight(),
            left: 0,
            right: this.getRenderWidth(),
            top: 0,
            width: this.getRenderWidth(),
            x: 0,
            y: 0,
            toJSON: function () { },
        };
        return rect;
    };
    /**
     * Set the z offset Factor to apply to current rendering
     * @param value defines the offset to apply
     */
    NativeEngine.prototype.setZOffset = function (value) {
        if (value !== this._zOffset) {
            this._zOffset = value;
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETZOFFSET);
            this._commandBufferEncoder.encodeCommandArgAsFloat32(this.useReverseDepthBuffer ? -value : value);
            this._commandBufferEncoder.finishEncodingCommand();
        }
    };
    /**
     * Gets the current value of the zOffset Factor
     * @returns the current zOffset Factor state
     */
    NativeEngine.prototype.getZOffset = function () {
        return this._zOffset;
    };
    /**
     * Set the z offset Units to apply to current rendering
     * @param value defines the offset to apply
     */
    NativeEngine.prototype.setZOffsetUnits = function (value) {
        if (value !== this._zOffsetUnits) {
            this._zOffsetUnits = value;
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETZOFFSETUNITS);
            this._commandBufferEncoder.encodeCommandArgAsFloat32(this.useReverseDepthBuffer ? -value : value);
            this._commandBufferEncoder.finishEncodingCommand();
        }
    };
    /**
     * Gets the current value of the zOffset Units
     * @returns the current zOffset Units state
     */
    NativeEngine.prototype.getZOffsetUnits = function () {
        return this._zOffsetUnits;
    };
    /**
     * Enable or disable depth buffering
     * @param enable defines the state to set
     */
    NativeEngine.prototype.setDepthBuffer = function (enable) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETDEPTHTEST);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(enable ? this._currentDepthTest : _native.Engine.DEPTH_TEST_ALWAYS);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Gets a boolean indicating if depth writing is enabled
     * @returns the current depth writing state
     */
    NativeEngine.prototype.getDepthWrite = function () {
        return this._depthWrite;
    };
    NativeEngine.prototype.getDepthFunction = function () {
        switch (this._currentDepthTest) {
            case _native.Engine.DEPTH_TEST_NEVER:
                return 512;
            case _native.Engine.DEPTH_TEST_ALWAYS:
                return 519;
            case _native.Engine.DEPTH_TEST_GREATER:
                return 516;
            case _native.Engine.DEPTH_TEST_GEQUAL:
                return 518;
            case _native.Engine.DEPTH_TEST_NOTEQUAL:
                return 517;
            case _native.Engine.DEPTH_TEST_EQUAL:
                return 514;
            case _native.Engine.DEPTH_TEST_LESS:
                return 513;
            case _native.Engine.DEPTH_TEST_LEQUAL:
                return 515;
        }
        return null;
    };
    NativeEngine.prototype.setDepthFunction = function (depthFunc) {
        var nativeDepthFunc = 0;
        switch (depthFunc) {
            case 512:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_NEVER;
                break;
            case 519:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_ALWAYS;
                break;
            case 516:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_GREATER;
                break;
            case 518:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_GEQUAL;
                break;
            case 517:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_NOTEQUAL;
                break;
            case 514:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_EQUAL;
                break;
            case 513:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_LESS;
                break;
            case 515:
                nativeDepthFunc = _native.Engine.DEPTH_TEST_LEQUAL;
                break;
        }
        this._currentDepthTest = nativeDepthFunc;
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETDEPTHTEST);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(this._currentDepthTest);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Enable or disable depth writing
     * @param enable defines the state to set
     */
    NativeEngine.prototype.setDepthWrite = function (enable) {
        this._depthWrite = enable;
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETDEPTHWRITE);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(Number(enable));
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Enable or disable color writing
     * @param enable defines the state to set
     */
    NativeEngine.prototype.setColorWrite = function (enable) {
        this._colorWrite = enable;
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETCOLORWRITE);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(Number(enable));
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Gets a boolean indicating if color writing is enabled
     * @returns the current color writing state
     */
    NativeEngine.prototype.getColorWrite = function () {
        return this._colorWrite;
    };
    NativeEngine.prototype.applyStencil = function () {
        this._setStencil(this._stencilMask, this._getStencilOpFail(this._stencilOpStencilFail), this._getStencilDepthFail(this._stencilOpDepthFail), this._getStencilDepthPass(this._stencilOpStencilDepthPass), this._getStencilFunc(this._stencilFunc), this._stencilFuncRef);
    };
    NativeEngine.prototype._setStencil = function (mask, stencilOpFail, depthOpFail, depthOpPass, func, ref) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETSTENCIL);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(mask);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(stencilOpFail);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(depthOpFail);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(depthOpPass);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(func);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(ref);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    /**
     * Enable or disable the stencil buffer
     * @param enable defines if the stencil buffer must be enabled or disabled
     */
    NativeEngine.prototype.setStencilBuffer = function (enable) {
        this._stencilTest = enable;
        if (enable) {
            this.applyStencil();
        }
        else {
            this._setStencil(255, _native.Engine.STENCIL_OP_FAIL_S_KEEP, _native.Engine.STENCIL_OP_FAIL_Z_KEEP, _native.Engine.STENCIL_OP_PASS_Z_KEEP, _native.Engine.STENCIL_TEST_ALWAYS, 0);
        }
    };
    /**
     * Gets a boolean indicating if stencil buffer is enabled
     * @returns the current stencil buffer state
     */
    NativeEngine.prototype.getStencilBuffer = function () {
        return this._stencilTest;
    };
    /**
     * Gets the current stencil operation when stencil passes
     * @returns a number defining stencil operation to use when stencil passes
     */
    NativeEngine.prototype.getStencilOperationPass = function () {
        return this._stencilOpStencilDepthPass;
    };
    /**
     * Sets the stencil operation to use when stencil passes
     * @param operation defines the stencil operation to use when stencil passes
     */
    NativeEngine.prototype.setStencilOperationPass = function (operation) {
        this._stencilOpStencilDepthPass = operation;
        this.applyStencil();
    };
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    NativeEngine.prototype.setStencilMask = function (mask) {
        this._stencilMask = mask;
        this.applyStencil();
    };
    /**
     * Sets the current stencil function
     * @param stencilFunc defines the new stencil function to use
     */
    NativeEngine.prototype.setStencilFunction = function (stencilFunc) {
        this._stencilFunc = stencilFunc;
        this.applyStencil();
    };
    /**
     * Sets the current stencil reference
     * @param reference defines the new stencil reference to use
     */
    NativeEngine.prototype.setStencilFunctionReference = function (reference) {
        this._stencilFuncRef = reference;
        this.applyStencil();
    };
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    NativeEngine.prototype.setStencilFunctionMask = function (mask) {
        this._stencilFuncMask = mask;
    };
    /**
     * Sets the stencil operation to use when stencil fails
     * @param operation defines the stencil operation to use when stencil fails
     */
    NativeEngine.prototype.setStencilOperationFail = function (operation) {
        this._stencilOpStencilFail = operation;
        this.applyStencil();
    };
    /**
     * Sets the stencil operation to use when depth fails
     * @param operation defines the stencil operation to use when depth fails
     */
    NativeEngine.prototype.setStencilOperationDepthFail = function (operation) {
        this._stencilOpDepthFail = operation;
        this.applyStencil();
    };
    /**
     * Gets the current stencil mask
     * @returns a number defining the new stencil mask to use
     */
    NativeEngine.prototype.getStencilMask = function () {
        return this._stencilMask;
    };
    /**
     * Gets the current stencil function
     * @returns a number defining the stencil function to use
     */
    NativeEngine.prototype.getStencilFunction = function () {
        return this._stencilFunc;
    };
    /**
     * Gets the current stencil reference value
     * @returns a number defining the stencil reference value to use
     */
    NativeEngine.prototype.getStencilFunctionReference = function () {
        return this._stencilFuncRef;
    };
    /**
     * Gets the current stencil mask
     * @returns a number defining the stencil mask to use
     */
    NativeEngine.prototype.getStencilFunctionMask = function () {
        return this._stencilFuncMask;
    };
    /**
     * Gets the current stencil operation when stencil fails
     * @returns a number defining stencil operation to use when stencil fails
     */
    NativeEngine.prototype.getStencilOperationFail = function () {
        return this._stencilOpStencilFail;
    };
    /**
     * Gets the current stencil operation when depth fails
     * @returns a number defining stencil operation to use when depth fails
     */
    NativeEngine.prototype.getStencilOperationDepthFail = function () {
        return this._stencilOpDepthFail;
    };
    /**
     * Sets alpha constants used by some alpha blending modes
     * @param r defines the red component
     * @param g defines the green component
     * @param b defines the blue component
     * @param a defines the alpha component
     */
    NativeEngine.prototype.setAlphaConstants = function (r, g, b, a) {
        throw new Error("Setting alpha blend constant color not yet implemented.");
    };
    /**
     * Sets the current alpha mode
     * @param mode defines the mode to use (one of the BABYLON.undefined)
     * @param noDepthWriteChange defines if depth writing state should remains unchanged (false by default)
     * @see https://doc.babylonjs.com/resources/transparency_and_how_meshes_are_rendered
     */
    NativeEngine.prototype.setAlphaMode = function (mode, noDepthWriteChange) {
        if (noDepthWriteChange === void 0) { noDepthWriteChange = false; }
        if (this._alphaMode === mode) {
            return;
        }
        var nativeMode = this._getNativeAlphaMode(mode);
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETBLENDMODE);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(nativeMode);
        this._commandBufferEncoder.finishEncodingCommand();
        if (!noDepthWriteChange) {
            this.setDepthWrite(mode === 0);
        }
        this._alphaMode = mode;
    };
    /**
     * Gets the current alpha mode
     * @see https://doc.babylonjs.com/resources/transparency_and_how_meshes_are_rendered
     * @returns the current alpha mode
     */
    NativeEngine.prototype.getAlphaMode = function () {
        return this._alphaMode;
    };
    NativeEngine.prototype.setInt = function (uniform, int) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETINT);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsInt32(int);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setIntArray = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETINTARRAY);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsInt32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setIntArray2 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETINTARRAY2);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsInt32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setIntArray3 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETINTARRAY3);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsInt32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setIntArray4 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETINTARRAY4);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsInt32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloatArray = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOATARRAY);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloatArray2 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOATARRAY2);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloatArray3 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOATARRAY3);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloatArray4 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOATARRAY4);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(array);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setArray = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        return this.setFloatArray(uniform, new Float32Array(array));
    };
    NativeEngine.prototype.setArray2 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        return this.setFloatArray2(uniform, new Float32Array(array));
    };
    NativeEngine.prototype.setArray3 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        return this.setFloatArray3(uniform, new Float32Array(array));
    };
    NativeEngine.prototype.setArray4 = function (uniform, array) {
        if (!uniform) {
            return false;
        }
        return this.setFloatArray4(uniform, new Float32Array(array));
    };
    NativeEngine.prototype.setMatrices = function (uniform, matrices) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETMATRICES);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(matrices);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setMatrix3x3 = function (uniform, matrix) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETMATRIX3X3);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(matrix);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setMatrix2x2 = function (uniform, matrix) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETMATRIX2X2);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32s(matrix);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloat = function (uniform, value) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOAT);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(value);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloat2 = function (uniform, x, y) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOAT2);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(x);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(y);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloat3 = function (uniform, x, y, z) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOAT3);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(x);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(y);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(z);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setFloat4 = function (uniform, x, y, z, w) {
        if (!uniform) {
            return false;
        }
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETFLOAT4);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(x);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(y);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(z);
        this._commandBufferEncoder.encodeCommandArgAsFloat32(w);
        this._commandBufferEncoder.finishEncodingCommand();
        return true;
    };
    NativeEngine.prototype.setColor3 = function (uniform, color3) {
        if (!uniform) {
            return false;
        }
        this.setFloat3(uniform, color3.r, color3.g, color3.b);
        return true;
    };
    NativeEngine.prototype.setColor4 = function (uniform, color3, alpha) {
        if (!uniform) {
            return false;
        }
        this.setFloat4(uniform, color3.r, color3.g, color3.b, alpha);
        return true;
    };
    NativeEngine.prototype.wipeCaches = function (bruteForce) {
        if (this.preventCacheWipeBetweenFrames) {
            return;
        }
        this.resetTextureCache();
        this._currentEffect = null;
        if (bruteForce) {
            this._currentProgram = null;
            this._stencilStateComposer.reset();
            this._depthCullingState.reset();
            this._alphaState.reset();
        }
        this._cachedVertexBuffers = null;
        this._cachedIndexBuffer = null;
        this._cachedEffectForVertexBuffers = null;
    };
    NativeEngine.prototype._createTexture = function () {
        return this._engine.createTexture();
    };
    NativeEngine.prototype._deleteTexture = function (texture) {
        if (texture) {
            this._engine.deleteTexture(texture);
        }
    };
    /**
     * Update the content of a dynamic texture
     * @param texture defines the texture to update
     * @param canvas defines the canvas containing the source
     * @param invertY defines if data must be stored with Y axis inverted
     * @param premulAlpha defines if alpha is stored as premultiplied
     * @param format defines the format of the data
     */
    NativeEngine.prototype.updateDynamicTexture = function (texture, canvas, invertY, premulAlpha, format) {
        if (premulAlpha === void 0) { premulAlpha = false; }
        if (premulAlpha === void 0) {
            premulAlpha = false;
        }
        if (!!texture && !!texture._hardwareTexture) {
            var source = canvas.getCanvasTexture();
            var destination = texture._hardwareTexture.underlyingResource;
            this._engine.copyTexture(destination, source);
            texture.isReady = true;
        }
    };
    NativeEngine.prototype.createDynamicTexture = function (width, height, generateMipMaps, samplingMode) {
        // it's not possible to create 0x0 texture sized. Many bgfx methods assume texture size is at least 1x1(best case).
        // Worst case is getting a crash/assert.
        width = Math.max(width, 1);
        height = Math.max(height, 1);
        return this.createRawTexture(new Uint8Array(width * height * 4), width, height, 5, false, false, samplingMode);
    };
    NativeEngine.prototype.createVideoElement = function (constraints) {
        // create native object depending on stream. Only NativeCamera is supported for now.
        if (this._camera) {
            return this._camera.createVideo(constraints);
        }
        return null;
    };
    NativeEngine.prototype.updateVideoTexture = function (texture, video, invertY) {
        if (texture && texture._hardwareTexture && this._camera) {
            var webGLTexture = texture._hardwareTexture.underlyingResource;
            this._camera.updateVideoTexture(webGLTexture, video, invertY);
        }
    };
    NativeEngine.prototype.createRawTexture = function (data, width, height, format, generateMipMaps, invertY, samplingMode, compression, type) {
        if (compression === void 0) { compression = null; }
        if (type === void 0) { type = 0; }
        var texture = new InternalTexture(this, InternalTextureSource.Raw);
        texture.format = format;
        texture.generateMipMaps = generateMipMaps;
        texture.samplingMode = samplingMode;
        texture.invertY = invertY;
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = texture.baseWidth;
        texture.height = texture.baseHeight;
        texture._compression = compression;
        texture.type = type;
        this.updateRawTexture(texture, data, format, invertY, compression, type);
        if (texture._hardwareTexture) {
            var webGLTexture = texture._hardwareTexture.underlyingResource;
            var filter = this._getNativeSamplingMode(samplingMode);
            this._setTextureSampling(webGLTexture, filter);
        }
        this._internalTexturesCache.push(texture);
        return texture;
    };
    NativeEngine.prototype.createRawTexture2DArray = function (data, width, height, depth, format, generateMipMaps, invertY, samplingMode, compression, textureType) {
        if (compression === void 0) { compression = null; }
        if (textureType === void 0) { textureType = 0; }
        var texture = new InternalTexture(this, InternalTextureSource.Raw2DArray);
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.baseDepth = depth;
        texture.width = width;
        texture.height = height;
        texture.depth = depth;
        texture.format = format;
        texture.type = textureType;
        texture.generateMipMaps = generateMipMaps;
        texture.samplingMode = samplingMode;
        texture.is2DArray = true;
        if (texture._hardwareTexture) {
            var webGLTexture = texture._hardwareTexture.underlyingResource;
            this._engine.loadRawTexture2DArray(webGLTexture, data, width, height, depth, this._getNativeTextureFormat(format, textureType), generateMipMaps, invertY);
            var filter = this._getNativeSamplingMode(samplingMode);
            this._setTextureSampling(webGLTexture, filter);
        }
        texture.isReady = true;
        this._internalTexturesCache.push(texture);
        return texture;
    };
    NativeEngine.prototype.updateRawTexture = function (texture, bufferView, format, invertY, compression, type) {
        if (compression === void 0) { compression = null; }
        if (type === void 0) { type = 0; }
        if (!texture) {
            return;
        }
        if (bufferView && texture._hardwareTexture) {
            var underlyingResource = texture._hardwareTexture.underlyingResource;
            this._engine.loadRawTexture(underlyingResource, bufferView, texture.width, texture.height, this._getNativeTextureFormat(format, type), texture.generateMipMaps, texture.invertY);
        }
        texture.isReady = true;
    };
    // TODO: Refactor to share more logic with babylon.engine.ts version.
    /**
     * Usually called from Texture.ts.
     * Passed information to create a WebGLTexture
     * @param url defines a value which contains one of the following:
     * * A conventional http URL, e.g. 'http://...' or 'file://...'
     * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
     * * An indicator that data being passed using the buffer parameter, e.g. 'data:mytexture.jpg'
     * @param noMipmap defines a boolean indicating that no mipmaps shall be generated.  Ignored for compressed textures.  They must be in the file
     * @param invertY when true, image is flipped when loaded.  You probably want true. Certain compressed textures may invert this if their default is inverted (eg. ktx)
     * @param scene needed for loading to the correct scene
     * @param samplingMode mode with should be used sample / access the texture (Default: Texture.TRILINEAR_SAMPLINGMODE)
     * @param onLoad optional callback to be called upon successful completion
     * @param onError optional callback to be called upon failure
     * @param buffer a source of a file previously fetched as either a base64 string, an ArrayBuffer (compressed or image format), HTMLImageElement (image format), or a Blob
     * @param fallback an internal argument in case the function must be called again, due to etc1 not having alpha capabilities
     * @param format internal format.  Default: RGB when extension is '.jpg' else RGBA.  Ignored for compressed textures
     * @param forcedExtension defines the extension to use to pick the right loader
     * @param mimeType defines an optional mime type
     * @param loaderOptions options to be passed to the loader
     * @param creationFlags
     * @param useSRGBBuffer
     * @returns a InternalTexture for assignment back into BABYLON.Texture
     */
    NativeEngine.prototype.createTexture = function (url, noMipmap, invertY, scene, samplingMode, onLoad, onError, buffer, fallback, format, forcedExtension, mimeType, loaderOptions, creationFlags, useSRGBBuffer) {
        var _this = this;
        if (samplingMode === void 0) { samplingMode = 3; }
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (buffer === void 0) { buffer = null; }
        if (fallback === void 0) { fallback = null; }
        if (format === void 0) { format = null; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        url = url || "";
        var fromData = url.substr(0, 5) === "data:";
        //const fromBlob = url.substr(0, 5) === "blob:";
        var isBase64 = fromData && url.indexOf(";base64,") !== -1;
        var texture = fallback ? fallback : new InternalTexture(this, InternalTextureSource.Url);
        var originalUrl = url;
        if (this._transformTextureUrl && !isBase64 && !fallback && !buffer) {
            url = this._transformTextureUrl(url);
        }
        // establish the file extension, if possible
        var lastDot = url.lastIndexOf(".");
        var extension = forcedExtension ? forcedExtension : lastDot > -1 ? url.substring(lastDot).toLowerCase() : "";
        var loader = null;
        for (var _i = 0, _a = Engine._TextureLoaders; _i < _a.length; _i++) {
            var availableLoader = _a[_i];
            if (availableLoader.canLoad(extension)) {
                loader = availableLoader;
                break;
            }
        }
        if (scene) {
            scene._addPendingData(texture);
        }
        texture.url = url;
        texture.generateMipMaps = !noMipmap;
        texture.samplingMode = samplingMode;
        texture.invertY = invertY;
        texture._useSRGBBuffer = this._getUseSRGBBuffer(useSRGBBuffer, noMipmap);
        if (!this.doNotHandleContextLost) {
            // Keep a link to the buffer only if we plan to handle context lost
            texture._buffer = buffer;
        }
        var onLoadObserver = null;
        if (onLoad && !fallback) {
            onLoadObserver = texture.onLoadedObservable.add(onLoad);
        }
        if (!fallback) {
            this._internalTexturesCache.push(texture);
        }
        var onInternalError = function (message, exception) {
            if (scene) {
                scene._removePendingData(texture);
            }
            if (url === originalUrl) {
                if (onLoadObserver) {
                    texture.onLoadedObservable.remove(onLoadObserver);
                }
                if (EngineStore.UseFallbackTexture) {
                    _this.createTexture(EngineStore.FallbackTexture, noMipmap, texture.invertY, scene, samplingMode, null, onError, buffer, texture);
                }
                if (onError) {
                    onError((message || "Unknown error") + (EngineStore.UseFallbackTexture ? " - Fallback texture was used" : ""), exception);
                }
            }
            else {
                // fall back to the original url if the transformed url fails to load
                Logger.Warn("Failed to load ".concat(url, ", falling back to ").concat(originalUrl));
                _this.createTexture(originalUrl, noMipmap, texture.invertY, scene, samplingMode, onLoad, onError, buffer, texture, format, forcedExtension, mimeType, loaderOptions);
            }
        };
        // processing for non-image formats
        if (loader) {
            throw new Error("Loading textures from IInternalTextureLoader not yet implemented.");
        }
        else {
            var onload_1 = function (data) {
                if (!texture._hardwareTexture) {
                    if (scene) {
                        scene._removePendingData(texture);
                    }
                    return;
                }
                var underlyingResource = texture._hardwareTexture.underlyingResource;
                _this._engine.loadTexture(underlyingResource, data, !noMipmap, invertY, useSRGBBuffer, function () {
                    texture.baseWidth = _this._engine.getTextureWidth(underlyingResource);
                    texture.baseHeight = _this._engine.getTextureHeight(underlyingResource);
                    texture.width = texture.baseWidth;
                    texture.height = texture.baseHeight;
                    texture.isReady = true;
                    var filter = _this._getNativeSamplingMode(samplingMode);
                    _this._setTextureSampling(underlyingResource, filter);
                    if (scene) {
                        scene._removePendingData(texture);
                    }
                    texture.onLoadedObservable.notifyObservers(texture);
                    texture.onLoadedObservable.clear();
                }, function () {
                    throw new Error("Could not load a native texture.");
                });
            };
            if (fromData && buffer) {
                if (buffer instanceof ArrayBuffer) {
                    onload_1(new Uint8Array(buffer));
                }
                else if (ArrayBuffer.isView(buffer)) {
                    onload_1(buffer);
                }
                else if (typeof buffer === "string") {
                    onload_1(new Uint8Array(Tools.DecodeBase64(buffer)));
                }
                else {
                    throw new Error("Unsupported buffer type");
                }
            }
            else {
                if (isBase64) {
                    onload_1(new Uint8Array(Tools.DecodeBase64(url)));
                }
                else {
                    this._loadFile(url, function (data) { return onload_1(new Uint8Array(data)); }, undefined, undefined, true, function (request, exception) {
                        onInternalError("Unable to load " + (request ? request.responseURL : url, exception));
                    });
                }
            }
        }
        return texture;
    };
    /**
     * Wraps an external native texture in a Babylon texture.
     * @param texture defines the external texture
     * @returns the babylon internal texture
     */
    NativeEngine.prototype.wrapNativeTexture = function (texture) {
        // Currently native is using the WebGL wrapper
        var hardwareTexture = new WebGLHardwareTexture(texture, this._gl);
        var internalTexture = new InternalTexture(this, InternalTextureSource.Unknown, true);
        internalTexture._hardwareTexture = hardwareTexture;
        internalTexture.isReady = true;
        return internalTexture;
    };
    /**
     * Wraps an external web gl texture in a Babylon texture.
     * @returns the babylon internal texture
     */
    NativeEngine.prototype.wrapWebGLTexture = function () {
        throw new Error("wrapWebGLTexture is not supported, use wrapNativeTexture instead.");
    };
    NativeEngine.prototype._createDepthStencilTexture = function (size, options, rtWrapper) {
        var nativeRTWrapper = rtWrapper;
        var texture = new InternalTexture(this, InternalTextureSource.DepthStencil);
        var width = size.width || size;
        var height = size.height || size;
        var framebuffer = this._engine.createFrameBuffer(texture._hardwareTexture.underlyingResource, width, height, _native.Engine.TEXTURE_FORMAT_RGBA8, false, true, false);
        nativeRTWrapper._framebufferDepthStencil = framebuffer;
        return texture;
    };
    /**
     * @param framebuffer
     * @hidden
     */
    NativeEngine.prototype._releaseFramebufferObjects = function (framebuffer) {
        if (framebuffer) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DELETEFRAMEBUFFER);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(framebuffer);
            this._commandBufferEncoder.finishEncodingCommand();
        }
    };
    /** @hidden */
    /**
     * Engine abstraction for loading and creating an image bitmap from a given source string.
     * @param imageSource source to load the image from.
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap
     */
    NativeEngine.prototype._createImageBitmapFromSource = function (imageSource, options) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var image = _this.createCanvasImage();
            image.onload = function () {
                try {
                    var imageBitmap = _this._engine.createImageBitmap(image);
                    resolve(imageBitmap);
                }
                catch (error) {
                    reject("Error loading image ".concat(image.src, " with exception: ").concat(error));
                }
            };
            image.onerror = function (error) {
                reject("Error loading image ".concat(image.src, " with exception: ").concat(error));
            };
            image.src = imageSource;
        });
        return promise;
    };
    /**
     * Engine abstraction for createImageBitmap
     * @param image source for image
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap
     */
    NativeEngine.prototype.createImageBitmap = function (image, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (Array.isArray(image)) {
                var arr = image;
                if (arr.length) {
                    var image_1 = _this._engine.createImageBitmap(arr[0]);
                    if (image_1) {
                        resolve(image_1);
                        return;
                    }
                }
            }
            reject("Unsupported data for createImageBitmap.");
        });
    };
    /**
     * Resize an image and returns the image data as an uint8array
     * @param image image to resize
     * @param bufferWidth destination buffer width
     * @param bufferHeight destination buffer height
     * @returns an uint8array containing RGBA values of bufferWidth * bufferHeight size
     */
    NativeEngine.prototype.resizeImageBitmap = function (image, bufferWidth, bufferHeight) {
        return this._engine.resizeImageBitmap(image, bufferWidth, bufferHeight);
    };
    /**
     * Creates a cube texture
     * @param rootUrl defines the url where the files to load is located
     * @param scene defines the current scene
     * @param files defines the list of files to load (1 per face)
     * @param noMipmap defines a boolean indicating that no mipmaps shall be generated (false by default)
     * @param onLoad defines an optional callback raised when the texture is loaded
     * @param onError defines an optional callback raised if there is an issue to load the texture
     * @param format defines the format of the data
     * @param forcedExtension defines the extension to use to pick the right loader
     * @param createPolynomials if a polynomial sphere should be created for the cube texture
     * @param lodScale defines the scale applied to environment texture. This manages the range of LOD level used for IBL according to the roughness
     * @param lodOffset defines the offset applied to environment texture. This manages first LOD level used for IBL according to the roughness
     * @param fallback defines texture to use while falling back when (compressed) texture file not found.
     * @param loaderOptions options to be passed to the loader
     * @param useSRGBBuffer defines if the texture must be loaded in a sRGB GPU buffer (if supported by the GPU).
     * @returns the cube texture as an InternalTexture
     */
    NativeEngine.prototype.createCubeTexture = function (rootUrl, scene, files, noMipmap, onLoad, onError, format, forcedExtension, createPolynomials, lodScale, lodOffset, fallback, loaderOptions, useSRGBBuffer) {
        var _this = this;
        if (onLoad === void 0) { onLoad = null; }
        if (onError === void 0) { onError = null; }
        if (forcedExtension === void 0) { forcedExtension = null; }
        if (createPolynomials === void 0) { createPolynomials = false; }
        if (lodScale === void 0) { lodScale = 0; }
        if (lodOffset === void 0) { lodOffset = 0; }
        if (fallback === void 0) { fallback = null; }
        if (useSRGBBuffer === void 0) { useSRGBBuffer = false; }
        var texture = fallback ? fallback : new InternalTexture(this, InternalTextureSource.Cube);
        texture.isCube = true;
        texture.url = rootUrl;
        texture.generateMipMaps = !noMipmap;
        texture._lodGenerationScale = lodScale;
        texture._lodGenerationOffset = lodOffset;
        if (!this._doNotHandleContextLost) {
            texture._extension = forcedExtension;
            texture._files = files;
        }
        var lastDot = rootUrl.lastIndexOf(".");
        var extension = forcedExtension ? forcedExtension : lastDot > -1 ? rootUrl.substring(lastDot).toLowerCase() : "";
        // TODO: use texture loader to load env files?
        if (extension === ".env") {
            var onloaddata_1 = function (data) {
                var info = GetEnvInfo(data);
                texture.width = info.width;
                texture.height = info.width;
                UploadEnvSpherical(texture, info);
                var specularInfo = info.specular;
                if (!specularInfo) {
                    throw new Error("Nothing else parsed so far");
                }
                texture._lodGenerationScale = specularInfo.lodGenerationScale;
                var imageData = CreateImageDataArrayBufferViews(data, info);
                texture.format = 5;
                texture.type = 0;
                texture.generateMipMaps = true;
                texture.getEngine().updateTextureSamplingMode(Texture.TRILINEAR_SAMPLINGMODE, texture);
                texture._isRGBD = true;
                texture.invertY = true;
                _this._engine.loadCubeTextureWithMips(texture._hardwareTexture.underlyingResource, imageData, false, useSRGBBuffer, function () {
                    texture.isReady = true;
                    if (onLoad) {
                        onLoad();
                    }
                }, function () {
                    throw new Error("Could not load a native cube texture.");
                });
            };
            if (files && files.length === 6) {
                throw new Error("Multi-file loading not allowed on env files.");
            }
            else {
                var onInternalError = function (request, exception) {
                    if (onError && request) {
                        onError(request.status + " " + request.statusText, exception);
                    }
                };
                this._loadFile(rootUrl, function (data) { return onloaddata_1(new Uint8Array(data)); }, undefined, undefined, true, onInternalError);
            }
        }
        else {
            if (!files || files.length !== 6) {
                throw new Error("Cannot load cubemap because 6 files were not defined");
            }
            // Reorder from [+X, +Y, +Z, -X, -Y, -Z] to [+X, -X, +Y, -Y, +Z, -Z].
            var reorderedFiles = [files[0], files[3], files[1], files[4], files[2], files[5]];
            Promise.all(reorderedFiles.map(function (file) { return Tools.LoadFileAsync(file).then(function (data) { return new Uint8Array(data); }); }))
                .then(function (data) {
                return new Promise(function (resolve, reject) {
                    _this._engine.loadCubeTexture(texture._hardwareTexture.underlyingResource, data, !noMipmap, true, useSRGBBuffer, resolve, reject);
                });
            })
                .then(function () {
                texture.isReady = true;
                if (onLoad) {
                    onLoad();
                }
            }, function (error) {
                if (onError) {
                    onError("Failed to load cubemap: ".concat(error.message), error);
                }
            });
        }
        this._internalTexturesCache.push(texture);
        return texture;
    };
    /**
     * @param isMulti
     * @param isCube
     * @param size
     * @hidden
     */
    NativeEngine.prototype._createHardwareRenderTargetWrapper = function (isMulti, isCube, size) {
        var rtWrapper = new NativeRenderTargetWrapper(isMulti, isCube, size, this);
        this._renderTargetWrapperCache.push(rtWrapper);
        return rtWrapper;
    };
    NativeEngine.prototype.createRenderTargetTexture = function (size, options) {
        var rtWrapper = this._createHardwareRenderTargetWrapper(false, false, size);
        var fullOptions = {};
        if (options !== undefined && typeof options === "object") {
            fullOptions.generateMipMaps = options.generateMipMaps;
            fullOptions.generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
            fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && options.generateStencilBuffer;
            fullOptions.type = options.type === undefined ? 0 : options.type;
            fullOptions.samplingMode = options.samplingMode === undefined ? 3 : options.samplingMode;
            fullOptions.format = options.format === undefined ? 5 : options.format;
        }
        else {
            fullOptions.generateMipMaps = options;
            fullOptions.generateDepthBuffer = true;
            fullOptions.generateStencilBuffer = false;
            fullOptions.type = 0;
            fullOptions.samplingMode = 3;
            fullOptions.format = 5;
        }
        if (fullOptions.type === 1 && !this._caps.textureFloatLinearFiltering) {
            // if floating point linear (gl.FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = 1;
        }
        else if (fullOptions.type === 2 && !this._caps.textureHalfFloatLinearFiltering) {
            // if floating point linear (HALF_FLOAT) then force to NEAREST_SAMPLINGMODE
            fullOptions.samplingMode = 1;
        }
        var texture = new InternalTexture(this, InternalTextureSource.RenderTarget);
        var width = size.width || size;
        var height = size.height || size;
        if (fullOptions.type === 1 && !this._caps.textureFloat) {
            fullOptions.type = 0;
            Logger.Warn("Float textures are not supported. Render target forced to TEXTURETYPE_UNSIGNED_BYTE type");
        }
        var framebuffer = this._engine.createFrameBuffer(texture._hardwareTexture.underlyingResource, width, height, this._getNativeTextureFormat(fullOptions.format, fullOptions.type), fullOptions.generateStencilBuffer ? true : false, fullOptions.generateDepthBuffer, fullOptions.generateMipMaps ? true : false);
        rtWrapper._framebuffer = framebuffer;
        rtWrapper._generateDepthBuffer = fullOptions.generateDepthBuffer;
        rtWrapper._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.isReady = true;
        texture.samples = 1;
        texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
        texture.samplingMode = fullOptions.samplingMode;
        texture.type = fullOptions.type;
        texture.format = fullOptions.format;
        this._internalTexturesCache.push(texture);
        rtWrapper.setTextures(texture);
        return rtWrapper;
    };
    NativeEngine.prototype.updateTextureSamplingMode = function (samplingMode, texture) {
        if (texture._hardwareTexture) {
            var filter = this._getNativeSamplingMode(samplingMode);
            this._setTextureSampling(texture._hardwareTexture.underlyingResource, filter);
        }
        texture.samplingMode = samplingMode;
    };
    NativeEngine.prototype.bindFramebuffer = function (texture, faceIndex, requiredWidth, requiredHeight, forceFullscreenViewport) {
        var nativeRTWrapper = texture;
        if (faceIndex) {
            throw new Error("Cuboid frame buffers are not yet supported in NativeEngine.");
        }
        if (requiredWidth || requiredHeight) {
            throw new Error("Required width/height for frame buffers not yet supported in NativeEngine.");
        }
        if (forceFullscreenViewport) {
            //Not supported yet but don't stop rendering
        }
        if (nativeRTWrapper._framebufferDepthStencil) {
            this._bindUnboundFramebuffer(nativeRTWrapper._framebufferDepthStencil);
        }
        else {
            this._bindUnboundFramebuffer(nativeRTWrapper._framebuffer);
        }
    };
    NativeEngine.prototype.unBindFramebuffer = function (texture, disableGenerateMipMaps, onBeforeUnbind) {
        // NOTE: Disabling mipmap generation is not yet supported in NativeEngine.
        if (disableGenerateMipMaps === void 0) { disableGenerateMipMaps = false; }
        if (onBeforeUnbind) {
            onBeforeUnbind();
        }
        this._bindUnboundFramebuffer(null);
    };
    NativeEngine.prototype.createDynamicVertexBuffer = function (data) {
        return this.createVertexBuffer(data, true);
    };
    NativeEngine.prototype.updateDynamicIndexBuffer = function (indexBuffer, indices, offset) {
        if (offset === void 0) { offset = 0; }
        var buffer = indexBuffer;
        var data = this._normalizeIndexData(indices);
        buffer.is32Bits = data.BYTES_PER_ELEMENT === 4;
        this._engine.updateDynamicIndexBuffer(buffer.nativeIndexBuffer, data.buffer, data.byteOffset, data.byteLength, offset);
    };
    NativeEngine.prototype.updateDynamicVertexBuffer = function (vertexBuffer, verticies, byteOffset, byteLength) {
        var buffer = vertexBuffer;
        var data = ArrayBuffer.isView(verticies) ? verticies : new Float32Array(verticies);
        this._engine.updateDynamicVertexBuffer(buffer.nativeVertexBuffer, data.buffer, data.byteOffset + (byteOffset !== null && byteOffset !== void 0 ? byteOffset : 0), byteLength !== null && byteLength !== void 0 ? byteLength : data.byteLength);
    };
    // TODO: Refactor to share more logic with base Engine implementation.
    NativeEngine.prototype._setTexture = function (channel, texture, isPartOfTextureArray, depthStencilTexture) {
        if (isPartOfTextureArray === void 0) { isPartOfTextureArray = false; }
        if (depthStencilTexture === void 0) { depthStencilTexture = false; }
        var uniform = this._boundUniforms[channel];
        if (!uniform) {
            return false;
        }
        // Not ready?
        if (!texture) {
            if (this._boundTexturesCache[channel] != null) {
                this._activeChannel = channel;
                this._setTextureCore(uniform, null);
            }
            return false;
        }
        // Video
        if (texture.video) {
            this._activeChannel = channel;
            texture.update();
        }
        else if (texture.delayLoadState === 4) {
            // Delay loading
            texture.delayLoad();
            return false;
        }
        var internalTexture;
        if (depthStencilTexture) {
            internalTexture = texture.depthStencilTexture;
        }
        else if (texture.isReady()) {
            internalTexture = texture.getInternalTexture();
        }
        else if (texture.isCube) {
            internalTexture = this.emptyCubeTexture;
        }
        else if (texture.is3D) {
            internalTexture = this.emptyTexture3D;
        }
        else if (texture.is2DArray) {
            internalTexture = this.emptyTexture2DArray;
        }
        else {
            internalTexture = this.emptyTexture;
        }
        this._activeChannel = channel;
        if (!internalTexture || !internalTexture._hardwareTexture) {
            return false;
        }
        this._setTextureWrapMode(internalTexture._hardwareTexture.underlyingResource, this._getAddressMode(texture.wrapU), this._getAddressMode(texture.wrapV), this._getAddressMode(texture.wrapR));
        this._updateAnisotropicLevel(texture);
        this._setTextureCore(uniform, internalTexture._hardwareTexture.underlyingResource);
        return true;
    };
    // filter is a NativeFilter.XXXX value.
    NativeEngine.prototype._setTextureSampling = function (texture, filter) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETTEXTURESAMPLING);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(texture);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(filter);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    // addressModes are NativeAddressMode.XXXX values.
    NativeEngine.prototype._setTextureWrapMode = function (texture, addressModeU, addressModeV, addressModeW) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETTEXTUREWRAPMODE);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(texture);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(addressModeU);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(addressModeV);
        this._commandBufferEncoder.encodeCommandArgAsUInt32(addressModeW);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    NativeEngine.prototype._setTextureCore = function (uniform, texture) {
        this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETTEXTURE);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(uniform);
        this._commandBufferEncoder.encodeCommandArgAsNativeData(texture);
        this._commandBufferEncoder.finishEncodingCommand();
    };
    // TODO: Share more of this logic with the base implementation.
    // TODO: Rename to match naming in base implementation once refactoring allows different parameters.
    NativeEngine.prototype._updateAnisotropicLevel = function (texture) {
        var internalTexture = texture.getInternalTexture();
        var value = texture.anisotropicFilteringLevel;
        if (!internalTexture || !internalTexture._hardwareTexture) {
            return;
        }
        if (internalTexture._cachedAnisotropicFilteringLevel !== value) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_SETTEXTUREANISOTROPICLEVEL);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(internalTexture._hardwareTexture.underlyingResource);
            this._commandBufferEncoder.encodeCommandArgAsUInt32(value);
            this._commandBufferEncoder.finishEncodingCommand();
            internalTexture._cachedAnisotropicFilteringLevel = value;
        }
    };
    // Returns a NativeAddressMode.XXX value.
    NativeEngine.prototype._getAddressMode = function (wrapMode) {
        switch (wrapMode) {
            case 1:
                return _native.Engine.ADDRESS_MODE_WRAP;
            case 0:
                return _native.Engine.ADDRESS_MODE_CLAMP;
            case 2:
                return _native.Engine.ADDRESS_MODE_MIRROR;
            default:
                throw new Error("Unexpected wrap mode: " + wrapMode + ".");
        }
    };
    /**
     * @param channel
     * @param texture
     * @hidden
     */
    NativeEngine.prototype._bindTexture = function (channel, texture) {
        var uniform = this._boundUniforms[channel];
        if (!uniform) {
            return;
        }
        if (texture && texture._hardwareTexture) {
            var underlyingResource = texture._hardwareTexture.underlyingResource;
            this._setTextureCore(uniform, underlyingResource);
        }
    };
    NativeEngine.prototype._deleteBuffer = function (buffer) {
        if (buffer.nativeIndexBuffer) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DELETEINDEXBUFFER);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(buffer.nativeIndexBuffer);
            this._commandBufferEncoder.finishEncodingCommand();
            delete buffer.nativeIndexBuffer;
        }
        if (buffer.nativeVertexBuffer) {
            this._commandBufferEncoder.startEncodingCommand(_native.Engine.COMMAND_DELETEVERTEXBUFFER);
            this._commandBufferEncoder.encodeCommandArgAsNativeData(buffer.nativeVertexBuffer);
            this._commandBufferEncoder.finishEncodingCommand();
            delete buffer.nativeVertexBuffer;
        }
    };
    /**
     * Create a canvas
     * @param width width
     * @param height height
     * @return ICanvas interface
     */
    NativeEngine.prototype.createCanvas = function (width, height) {
        if (!_native.Canvas) {
            throw new Error("Native Canvas plugin not available.");
        }
        var canvas = new _native.Canvas();
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };
    /**
     * Create an image to use with canvas
     * @return IImage interface
     */
    NativeEngine.prototype.createCanvasImage = function () {
        if (!_native.Canvas) {
            throw new Error("Native Canvas plugin not available.");
        }
        var image = new _native.Image();
        return image;
    };
    /**
     * Update a portion of an internal texture
     * @param texture defines the texture to update
     * @param imageData defines the data to store into the texture
     * @param xOffset defines the x coordinates of the update rectangle
     * @param yOffset defines the y coordinates of the update rectangle
     * @param width defines the width of the update rectangle
     * @param height defines the height of the update rectangle
     * @param faceIndex defines the face index if texture is a cube (0 by default)
     * @param lod defines the lod level to update (0 by default)
     * @param generateMipMaps defines whether to generate mipmaps or not
     */
    NativeEngine.prototype.updateTextureData = function (texture, imageData, xOffset, yOffset, width, height, faceIndex, lod, generateMipMaps) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        if (generateMipMaps === void 0) { generateMipMaps = false; }
        throw new Error("updateTextureData not implemented.");
    };
    /**
     * @param texture
     * @param internalFormat
     * @param width
     * @param height
     * @param data
     * @param faceIndex
     * @param lod
     * @hidden
     */
    NativeEngine.prototype._uploadCompressedDataToTextureDirectly = function (texture, internalFormat, width, height, data, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        throw new Error("_uploadCompressedDataToTextureDirectly not implemented.");
    };
    /**
     * @param texture
     * @param imageData
     * @param faceIndex
     * @param lod
     * @hidden
     */
    NativeEngine.prototype._uploadDataToTextureDirectly = function (texture, imageData, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        throw new Error("_uploadDataToTextureDirectly not implemented.");
    };
    /**
     * @param texture
     * @param imageData
     * @param faceIndex
     * @param lod
     * @hidden
     */
    NativeEngine.prototype._uploadArrayBufferViewToTexture = function (texture, imageData, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        throw new Error("_uploadArrayBufferViewToTexture not implemented.");
    };
    /**
     * @param texture
     * @param image
     * @param faceIndex
     * @param lod
     * @hidden
     */
    NativeEngine.prototype._uploadImageToTexture = function (texture, image, faceIndex, lod) {
        if (faceIndex === void 0) { faceIndex = 0; }
        if (lod === void 0) { lod = 0; }
        throw new Error("_uploadArrayBufferViewToTexture not implemented.");
    };
    // JavaScript-to-Native conversion helper functions.
    NativeEngine.prototype._getNativeSamplingMode = function (samplingMode) {
        switch (samplingMode) {
            case 1:
                return _native.Engine.TEXTURE_NEAREST_NEAREST;
            case 2:
                return _native.Engine.TEXTURE_LINEAR_LINEAR;
            case 3:
                return _native.Engine.TEXTURE_LINEAR_LINEAR_MIPLINEAR;
            case 4:
                return _native.Engine.TEXTURE_NEAREST_NEAREST_MIPNEAREST;
            case 5:
                return _native.Engine.TEXTURE_NEAREST_LINEAR_MIPNEAREST;
            case 6:
                return _native.Engine.TEXTURE_NEAREST_LINEAR_MIPLINEAR;
            case 7:
                return _native.Engine.TEXTURE_NEAREST_LINEAR;
            case 8:
                return _native.Engine.TEXTURE_NEAREST_NEAREST_MIPLINEAR;
            case 9:
                return _native.Engine.TEXTURE_LINEAR_NEAREST_MIPNEAREST;
            case 10:
                return _native.Engine.TEXTURE_LINEAR_NEAREST_MIPLINEAR;
            case 11:
                return _native.Engine.TEXTURE_LINEAR_LINEAR_MIPNEAREST;
            case 12:
                return _native.Engine.TEXTURE_LINEAR_NEAREST;
            default:
                throw new Error("Unsupported sampling mode: ".concat(samplingMode, "."));
        }
    };
    NativeEngine.prototype._getStencilFunc = function (func) {
        switch (func) {
            case 513:
                return _native.Engine.STENCIL_TEST_LESS;
            case 515:
                return _native.Engine.STENCIL_TEST_LEQUAL;
            case 514:
                return _native.Engine.STENCIL_TEST_EQUAL;
            case 518:
                return _native.Engine.STENCIL_TEST_GEQUAL;
            case 516:
                return _native.Engine.STENCIL_TEST_GREATER;
            case 517:
                return _native.Engine.STENCIL_TEST_NOTEQUAL;
            case 512:
                return _native.Engine.STENCIL_TEST_NEVER;
            case 519:
                return _native.Engine.STENCIL_TEST_ALWAYS;
            default:
                throw new Error("Unsupported stencil func mode: ".concat(func, "."));
        }
    };
    NativeEngine.prototype._getStencilOpFail = function (opFail) {
        switch (opFail) {
            case 7680:
                return _native.Engine.STENCIL_OP_FAIL_S_KEEP;
            case 0:
                return _native.Engine.STENCIL_OP_FAIL_S_ZERO;
            case 7681:
                return _native.Engine.STENCIL_OP_FAIL_S_REPLACE;
            case 7682:
                return _native.Engine.STENCIL_OP_FAIL_S_INCR;
            case 7683:
                return _native.Engine.STENCIL_OP_FAIL_S_DECR;
            case 5386:
                return _native.Engine.STENCIL_OP_FAIL_S_INVERT;
            case 34055:
                return _native.Engine.STENCIL_OP_FAIL_S_INCRSAT;
            case 34056:
                return _native.Engine.STENCIL_OP_FAIL_S_DECRSAT;
            default:
                throw new Error("Unsupported stencil OpFail mode: ".concat(opFail, "."));
        }
    };
    NativeEngine.prototype._getStencilDepthFail = function (depthFail) {
        switch (depthFail) {
            case 7680:
                return _native.Engine.STENCIL_OP_FAIL_Z_KEEP;
            case 0:
                return _native.Engine.STENCIL_OP_FAIL_Z_ZERO;
            case 7681:
                return _native.Engine.STENCIL_OP_FAIL_Z_REPLACE;
            case 7682:
                return _native.Engine.STENCIL_OP_FAIL_Z_INCR;
            case 7683:
                return _native.Engine.STENCIL_OP_FAIL_Z_DECR;
            case 5386:
                return _native.Engine.STENCIL_OP_FAIL_Z_INVERT;
            case 34055:
                return _native.Engine.STENCIL_OP_FAIL_Z_INCRSAT;
            case 34056:
                return _native.Engine.STENCIL_OP_FAIL_Z_DECRSAT;
            default:
                throw new Error("Unsupported stencil depthFail mode: ".concat(depthFail, "."));
        }
    };
    NativeEngine.prototype._getStencilDepthPass = function (opPass) {
        switch (opPass) {
            case 7680:
                return _native.Engine.STENCIL_OP_PASS_Z_KEEP;
            case 0:
                return _native.Engine.STENCIL_OP_PASS_Z_ZERO;
            case 7681:
                return _native.Engine.STENCIL_OP_PASS_Z_REPLACE;
            case 7682:
                return _native.Engine.STENCIL_OP_PASS_Z_INCR;
            case 7683:
                return _native.Engine.STENCIL_OP_PASS_Z_DECR;
            case 5386:
                return _native.Engine.STENCIL_OP_PASS_Z_INVERT;
            case 34055:
                return _native.Engine.STENCIL_OP_PASS_Z_INCRSAT;
            case 34056:
                return _native.Engine.STENCIL_OP_PASS_Z_DECRSAT;
            default:
                throw new Error("Unsupported stencil opPass mode: ".concat(opPass, "."));
        }
    };
    NativeEngine.prototype._getNativeTextureFormat = function (format, type) {
        if (format == 4 && type == 0) {
            return _native.Engine.TEXTURE_FORMAT_RGB8;
        }
        else if (format == 5 && type == 0) {
            return _native.Engine.TEXTURE_FORMAT_RGBA8;
        }
        else if (format == 5 && type == 1) {
            return _native.Engine.TEXTURE_FORMAT_RGBA32F;
        }
        else {
            throw new RuntimeError("Unsupported texture format or type: format ".concat(format, ", type ").concat(type, "."), ErrorCodes.UnsupportedTextureError);
        }
    };
    NativeEngine.prototype._getNativeAlphaMode = function (mode) {
        switch (mode) {
            case 0:
                return _native.Engine.ALPHA_DISABLE;
            case 1:
                return _native.Engine.ALPHA_ADD;
            case 2:
                return _native.Engine.ALPHA_COMBINE;
            case 3:
                return _native.Engine.ALPHA_SUBTRACT;
            case 4:
                return _native.Engine.ALPHA_MULTIPLY;
            case 5:
                return _native.Engine.ALPHA_MAXIMIZED;
            case 6:
                return _native.Engine.ALPHA_ONEONE;
            case 7:
                return _native.Engine.ALPHA_PREMULTIPLIED;
            case 8:
                return _native.Engine.ALPHA_PREMULTIPLIED_PORTERDUFF;
            case 9:
                return _native.Engine.ALPHA_INTERPOLATE;
            case 10:
                return _native.Engine.ALPHA_SCREENMODE;
            default:
                throw new Error("Unsupported alpha mode: ".concat(mode, "."));
        }
    };
    NativeEngine.prototype._getNativeAttribType = function (type) {
        switch (type) {
            case VertexBuffer.BYTE:
                return _native.Engine.ATTRIB_TYPE_INT8;
            case VertexBuffer.UNSIGNED_BYTE:
                return _native.Engine.ATTRIB_TYPE_UINT8;
            case VertexBuffer.SHORT:
                return _native.Engine.ATTRIB_TYPE_INT16;
            case VertexBuffer.UNSIGNED_SHORT:
                return _native.Engine.ATTRIB_TYPE_UINT16;
            case VertexBuffer.FLOAT:
                return _native.Engine.ATTRIB_TYPE_FLOAT;
            default:
                throw new Error("Unsupported attribute type: ".concat(type, "."));
        }
    };
    NativeEngine.prototype.getFontOffset = function (font) {
        // TODO
        var result = { ascent: 0, height: 0, descent: 0 };
        return result;
    };
    // This must match the protocol version in NativeEngine.cpp
    NativeEngine.PROTOCOL_VERSION = 6;
    return NativeEngine;
}(Engine));
export { NativeEngine };
//# sourceMappingURL=nativeEngine.js.map