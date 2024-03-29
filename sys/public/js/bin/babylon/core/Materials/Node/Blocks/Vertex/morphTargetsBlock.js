import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { MaterialHelper } from "../../../materialHelper.js";
import { VertexBuffer } from "../../../../Buffers/buffer.js";
import { InputBlock } from "../Input/inputBlock.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import "../../../../Shaders/ShadersInclude/morphTargetsVertexDeclaration.js";
import "../../../../Shaders/ShadersInclude/morphTargetsVertexGlobalDeclaration.js";
/**
 * Block used to add morph targets support to vertex shader
 */
var MorphTargetsBlock = /** @class */ (function (_super) {
    __extends(MorphTargetsBlock, _super);
    /**
     * Create a new MorphTargetsBlock
     * @param name defines the block name
     */
    function MorphTargetsBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Vertex) || this;
        _this.registerInput("position", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("normal", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("tangent", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.tangent.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2);
        _this.registerOutput("positionOutput", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("normalOutput", NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerOutput("tangentOutput", NodeMaterialBlockConnectionPointTypes.Vector4);
        _this.registerOutput("uvOutput", NodeMaterialBlockConnectionPointTypes.Vector2);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    MorphTargetsBlock.prototype.getClassName = function () {
        return "MorphTargetsBlock";
    };
    Object.defineProperty(MorphTargetsBlock.prototype, "position", {
        /**
         * Gets the position input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "normal", {
        /**
         * Gets the normal input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "tangent", {
        /**
         * Gets the tangent input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "uv", {
        /**
         * Gets the tangent input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "positionOutput", {
        /**
         * Gets the position output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "normalOutput", {
        /**
         * Gets the normal output component
         */
        get: function () {
            return this._outputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "tangentOutput", {
        /**
         * Gets the tangent output component
         */
        get: function () {
            return this._outputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MorphTargetsBlock.prototype, "uvOutput", {
        /**
         * Gets the tangent output component
         */
        get: function () {
            return this._outputs[3];
        },
        enumerable: false,
        configurable: true
    });
    MorphTargetsBlock.prototype.initialize = function (state) {
        state._excludeVariableName("morphTargetInfluences");
    };
    MorphTargetsBlock.prototype.autoConfigure = function (material) {
        if (!this.position.isConnected) {
            var positionInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "position"; });
            if (!positionInput) {
                positionInput = new InputBlock("position");
                positionInput.setAsAttribute();
            }
            positionInput.output.connectTo(this.position);
        }
        if (!this.normal.isConnected) {
            var normalInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "normal"; });
            if (!normalInput) {
                normalInput = new InputBlock("normal");
                normalInput.setAsAttribute("normal");
            }
            normalInput.output.connectTo(this.normal);
        }
        if (!this.tangent.isConnected) {
            var tangentInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "tangent"; });
            if (!tangentInput) {
                tangentInput = new InputBlock("tangent");
                tangentInput.setAsAttribute("tangent");
            }
            tangentInput.output.connectTo(this.tangent);
        }
        if (!this.uv.isConnected) {
            var uvInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "uv"; });
            if (!uvInput) {
                uvInput = new InputBlock("uv");
                uvInput.setAsAttribute("uv");
            }
            uvInput.output.connectTo(this.uv);
        }
    };
    MorphTargetsBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        if (mesh.morphTargetManager) {
            var morphTargetManager = mesh.morphTargetManager;
            if ((morphTargetManager === null || morphTargetManager === void 0 ? void 0 : morphTargetManager.isUsingTextureForTargets) && morphTargetManager.numInfluencers !== defines["NUM_MORPH_INFLUENCERS"]) {
                defines.markAsAttributesDirty();
            }
        }
        if (!defines._areAttributesDirty) {
            return;
        }
        MaterialHelper.PrepareDefinesForMorphTargets(mesh, defines);
    };
    MorphTargetsBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        if (mesh && mesh.morphTargetManager && mesh.morphTargetManager.numInfluencers > 0) {
            MaterialHelper.BindMorphTargetParameters(mesh, effect);
            if (mesh.morphTargetManager.isUsingTextureForTargets) {
                mesh.morphTargetManager._bind(effect);
            }
        }
    };
    MorphTargetsBlock.prototype.replaceRepeatableContent = function (vertexShaderState, fragmentShaderState, mesh, defines) {
        var position = this.position;
        var normal = this.normal;
        var tangent = this.tangent;
        var uv = this.uv;
        var positionOutput = this.positionOutput;
        var normalOutput = this.normalOutput;
        var tangentOutput = this.tangentOutput;
        var uvOutput = this.uvOutput;
        var state = vertexShaderState;
        var repeatCount = defines.NUM_MORPH_INFLUENCERS;
        var manager = mesh.morphTargetManager;
        var hasNormals = manager && manager.supportsNormals && defines["NORMAL"];
        var hasTangents = manager && manager.supportsTangents && defines["TANGENT"];
        var hasUVs = manager && manager.supportsUVs && defines["UV1"];
        var injectionCode = "";
        if ((manager === null || manager === void 0 ? void 0 : manager.isUsingTextureForTargets) && repeatCount > 0) {
            injectionCode += "float vertexID;\r\n";
        }
        for (var index = 0; index < repeatCount; index++) {
            injectionCode += "#ifdef MORPHTARGETS\r\n";
            if (manager === null || manager === void 0 ? void 0 : manager.isUsingTextureForTargets) {
                injectionCode += "vertexID = float(gl_VertexID) * morphTargetTextureInfo.x;\r\n";
                injectionCode += "".concat(positionOutput.associatedVariableName, " += (readVector3FromRawSampler(").concat(index, ", vertexID) - ").concat(position.associatedVariableName, ") * morphTargetInfluences[").concat(index, "];\r\n");
                injectionCode += "vertexID += 1.0;\r\n";
            }
            else {
                injectionCode += "".concat(positionOutput.associatedVariableName, " += (position").concat(index, " - ").concat(position.associatedVariableName, ") * morphTargetInfluences[").concat(index, "];\r\n");
            }
            if (hasNormals) {
                injectionCode += "#ifdef MORPHTARGETS_NORMAL\r\n";
                if (manager === null || manager === void 0 ? void 0 : manager.isUsingTextureForTargets) {
                    injectionCode += "".concat(normalOutput.associatedVariableName, " += (readVector3FromRawSampler(").concat(index, ", vertexID) - ").concat(normal.associatedVariableName, ") * morphTargetInfluences[").concat(index, "];\r\n");
                    injectionCode += "vertexID += 1.0;\r\n";
                }
                else {
                    injectionCode += "".concat(normalOutput.associatedVariableName, " += (normal").concat(index, " - ").concat(normal.associatedVariableName, ") * morphTargetInfluences[").concat(index, "];\r\n");
                }
                injectionCode += "#endif\r\n";
            }
            if (hasUVs) {
                injectionCode += "#ifdef MORPHTARGETS_UV\r\n";
                if (manager === null || manager === void 0 ? void 0 : manager.isUsingTextureForTargets) {
                    injectionCode += "".concat(uvOutput.associatedVariableName, " += (readVector3FromRawSampler(").concat(index, ", vertexID).xy - ").concat(uv.associatedVariableName, ") * morphTargetInfluences[").concat(index, "];\r\n");
                    injectionCode += "vertexID += 1.0;\r\n";
                }
                else {
                    injectionCode += "".concat(uvOutput.associatedVariableName, ".xy += (uv_").concat(index, " - ").concat(uv.associatedVariableName, ".xy) * morphTargetInfluences[").concat(index, "];\r\n");
                }
                injectionCode += "#endif\r\n";
            }
            if (hasTangents) {
                injectionCode += "#ifdef MORPHTARGETS_TANGENT\r\n";
                if (manager === null || manager === void 0 ? void 0 : manager.isUsingTextureForTargets) {
                    injectionCode += "".concat(tangentOutput.associatedVariableName, ".xyz += (readVector3FromRawSampler(").concat(index, ", vertexID) - ").concat(tangent.associatedVariableName, ".xyz) * morphTargetInfluences[").concat(index, "];\r\n");
                }
                else {
                    injectionCode += "".concat(tangentOutput.associatedVariableName, ".xyz += (tangent").concat(index, " - ").concat(tangent.associatedVariableName, ".xyz) * morphTargetInfluences[").concat(index, "];\r\n");
                }
                if (tangent.type === NodeMaterialBlockConnectionPointTypes.Vector4) {
                    injectionCode += "".concat(tangentOutput.associatedVariableName, ".w = ").concat(tangent.associatedVariableName, ".w;\r\n");
                }
                else {
                    injectionCode += "".concat(tangentOutput.associatedVariableName, ".w = 1.;\r\n");
                }
                injectionCode += "#endif\r\n";
            }
            injectionCode += "#endif\r\n";
        }
        state.compilationString = state.compilationString.replace(this._repeatableContentAnchor, injectionCode);
        if (repeatCount > 0) {
            for (var index = 0; index < repeatCount; index++) {
                state.attributes.push(VertexBuffer.PositionKind + index);
                if (hasNormals) {
                    state.attributes.push(VertexBuffer.NormalKind + index);
                }
                if (hasTangents) {
                    state.attributes.push(VertexBuffer.TangentKind + index);
                }
                if (hasUVs) {
                    state.attributes.push(VertexBuffer.UVKind + "_" + index);
                }
            }
        }
    };
    MorphTargetsBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        // Register for defines
        state.sharedData.blocksWithDefines.push(this);
        // Register for binding
        state.sharedData.bindableBlocks.push(this);
        // Register for repeatable content generation
        state.sharedData.repeatableContentBlocks.push(this);
        // Emit code
        var position = this.position;
        var normal = this.normal;
        var tangent = this.tangent;
        var uv = this.uv;
        var positionOutput = this.positionOutput;
        var normalOutput = this.normalOutput;
        var tangentOutput = this.tangentOutput;
        var uvOutput = this.uvOutput;
        var comments = "//".concat(this.name);
        state.uniforms.push("morphTargetInfluences");
        state.uniforms.push("morphTargetTextureInfo");
        state.uniforms.push("morphTargetTextureIndices");
        state.samplers.push("morphTargets");
        state._emitFunctionFromInclude("morphTargetsVertexGlobalDeclaration", comments);
        state._emitFunctionFromInclude("morphTargetsVertexDeclaration", comments, {
            repeatKey: "maxSimultaneousMorphTargets",
        });
        state.compilationString += "".concat(this._declareOutput(positionOutput, state), " = ").concat(position.associatedVariableName, ";\r\n");
        state.compilationString += "#ifdef NORMAL\r\n";
        state.compilationString += "".concat(this._declareOutput(normalOutput, state), " = ").concat(normal.associatedVariableName, ";\r\n");
        state.compilationString += "#else\r\n";
        state.compilationString += "".concat(this._declareOutput(normalOutput, state), " = vec3(0., 0., 0.);\r\n");
        state.compilationString += "#endif\r\n";
        state.compilationString += "#ifdef TANGENT\r\n";
        state.compilationString += "".concat(this._declareOutput(tangentOutput, state), " = ").concat(tangent.associatedVariableName, ";\r\n");
        state.compilationString += "#else\r\n";
        state.compilationString += "".concat(this._declareOutput(tangentOutput, state), " = vec4(0., 0., 0., 0.);\r\n");
        state.compilationString += "#endif\r\n";
        state.compilationString += "#ifdef UV1\r\n";
        state.compilationString += "".concat(this._declareOutput(uvOutput, state), " = ").concat(uv.associatedVariableName, ";\r\n");
        state.compilationString += "#else\r\n";
        state.compilationString += "".concat(this._declareOutput(uvOutput, state), " = vec2(0., 0.);\r\n");
        state.compilationString += "#endif\r\n";
        // Repeatable content
        this._repeatableContentAnchor = state._repeatableContentAnchor;
        state.compilationString += this._repeatableContentAnchor;
        return this;
    };
    return MorphTargetsBlock;
}(NodeMaterialBlock));
export { MorphTargetsBlock };
RegisterClass("BABYLON.MorphTargetsBlock", MorphTargetsBlock);
//# sourceMappingURL=morphTargetsBlock.js.map