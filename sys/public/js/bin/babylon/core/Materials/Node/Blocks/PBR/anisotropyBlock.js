import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { TBNBlock } from "../Fragment/TBNBlock.js";
/**
 * Block used to implement the anisotropy module of the PBR material
 */
var AnisotropyBlock = /** @class */ (function (_super) {
    __extends(AnisotropyBlock, _super);
    /**
     * Create a new AnisotropyBlock
     * @param name defines the block name
     */
    function AnisotropyBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        _this._isUnique = true;
        _this.registerInput("intensity", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("direction", NodeMaterialBlockConnectionPointTypes.Vector2, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2, true); // need this property and the next one in case there's no PerturbNormal block connected to the main PBR block
        _this.registerInput("worldTangent", NodeMaterialBlockConnectionPointTypes.Vector4, true);
        _this.registerInput("TBN", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.VertexAndFragment, new NodeMaterialConnectionPointCustomObject("TBN", _this, NodeMaterialConnectionPointDirection.Input, TBNBlock, "TBNBlock"));
        _this.registerOutput("anisotropy", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("anisotropy", _this, NodeMaterialConnectionPointDirection.Output, AnisotropyBlock, "AnisotropyBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    AnisotropyBlock.prototype.initialize = function (state) {
        state._excludeVariableName("anisotropicOut");
        state._excludeVariableName("TBN");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    AnisotropyBlock.prototype.getClassName = function () {
        return "AnisotropyBlock";
    };
    Object.defineProperty(AnisotropyBlock.prototype, "intensity", {
        /**
         * Gets the intensity input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnisotropyBlock.prototype, "direction", {
        /**
         * Gets the direction input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnisotropyBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnisotropyBlock.prototype, "worldTangent", {
        /**
         * Gets the worldTangent input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnisotropyBlock.prototype, "TBN", {
        /**
         * Gets the TBN input component
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AnisotropyBlock.prototype, "anisotropy", {
        /**
         * Gets the anisotropy object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    AnisotropyBlock.prototype._generateTBNSpace = function (state) {
        var code = "";
        var comments = "//".concat(this.name);
        var uv = this.uv;
        var worldPosition = this.worldPositionConnectionPoint;
        var worldNormal = this.worldNormalConnectionPoint;
        var worldTangent = this.worldTangent;
        if (!uv.isConnected) {
            // we must set the uv input as optional because we may not end up in this method (in case a PerturbNormal block is linked to the PBR material)
            // in which case uv is not required. But if we do come here, we do need the uv, so we have to raise an error but not with throw, else
            // it will stop the building of the node material and will lead to errors in the editor!
            console.error("You must connect the 'uv' input of the Anisotropy block!");
        }
        state._emitExtension("derivatives", "#extension GL_OES_standard_derivatives : enable");
        var tangentReplaceString = { search: /defined\(TANGENT\)/g, replace: worldTangent.isConnected ? "defined(TANGENT)" : "defined(IGNORE)" };
        var TBN = this.TBN;
        if (TBN.isConnected) {
            state.compilationString += "\n            #ifdef TBNBLOCK\n            mat3 vTBN = ".concat(TBN.associatedVariableName, ";\n            #endif\n            ");
        }
        else if (worldTangent.isConnected) {
            code += "vec3 tbnNormal = normalize(".concat(worldNormal.associatedVariableName, ".xyz);\r\n");
            code += "vec3 tbnTangent = normalize(".concat(worldTangent.associatedVariableName, ".xyz);\r\n");
            code += "vec3 tbnBitangent = cross(tbnNormal, tbnTangent);\r\n";
            code += "mat3 vTBN = mat3(tbnTangent, tbnBitangent, tbnNormal);\r\n";
        }
        code += "\n            #if defined(".concat(worldTangent.isConnected ? "TANGENT" : "IGNORE", ") && defined(NORMAL)\n                mat3 TBN = vTBN;\n            #else\n                mat3 TBN = cotangent_frame(").concat(worldNormal.associatedVariableName + ".xyz", ", ").concat("v_" + worldPosition.associatedVariableName + ".xyz", ", ").concat(uv.isConnected ? uv.associatedVariableName : "vec2(0.)", ", vec2(1., 1.));\n            #endif\r\n");
        state._emitFunctionFromInclude("bumpFragmentMainFunctions", comments, {
            replaceStrings: [tangentReplaceString],
        });
        return code;
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param state current state of the node material building
     * @param generateTBNSpace if true, the code needed to create the TBN coordinate space is generated
     * @returns the shader code
     */
    AnisotropyBlock.prototype.getCode = function (state, generateTBNSpace) {
        if (generateTBNSpace === void 0) { generateTBNSpace = false; }
        var code = "";
        if (generateTBNSpace) {
            code += this._generateTBNSpace(state);
        }
        var intensity = this.intensity.isConnected ? this.intensity.associatedVariableName : "1.0";
        var direction = this.direction.isConnected ? this.direction.associatedVariableName : "vec2(1., 0.)";
        code += "anisotropicOutParams anisotropicOut;\n            anisotropicBlock(\n                vec3(".concat(direction, ", ").concat(intensity, "),\n            #ifdef ANISOTROPIC_TEXTURE\n                vec3(0.),\n            #endif\n                TBN,\n                normalW,\n                viewDirectionW,\n                anisotropicOut\n            );\r\n");
        return code;
    };
    AnisotropyBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        defines.setValue("ANISOTROPIC", true);
        defines.setValue("ANISOTROPIC_TEXTURE", false, true);
    };
    AnisotropyBlock.prototype._buildBlock = function (state) {
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    return AnisotropyBlock;
}(NodeMaterialBlock));
export { AnisotropyBlock };
RegisterClass("BABYLON.AnisotropyBlock", AnisotropyBlock);
//# sourceMappingURL=anisotropyBlock.js.map