import { __decorate, __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { InputBlock } from "../Input/inputBlock.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { PBRClearCoatConfiguration } from "../../../PBR/pbrClearCoatConfiguration.js";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator.js";
import { TBNBlock } from "../Fragment/TBNBlock.js";
/**
 * Block used to implement the clear coat module of the PBR material
 */
var ClearCoatBlock = /** @class */ (function (_super) {
    __extends(ClearCoatBlock, _super);
    /**
     * Create a new ClearCoatBlock
     * @param name defines the block name
     */
    function ClearCoatBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment) || this;
        /**
         * Defines if the F0 value should be remapped to account for the interface change in the material.
         */
        _this.remapF0OnInterfaceChange = true;
        _this._isUnique = true;
        _this.registerInput("intensity", NodeMaterialBlockConnectionPointTypes.Float, false, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("roughness", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("indexOfRefraction", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("normalMapColor", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("uv", NodeMaterialBlockConnectionPointTypes.Vector2, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("tintColor", NodeMaterialBlockConnectionPointTypes.Color3, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("tintAtDistance", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("tintThickness", NodeMaterialBlockConnectionPointTypes.Float, true, NodeMaterialBlockTargets.Fragment);
        _this.registerInput("worldTangent", NodeMaterialBlockConnectionPointTypes.Vector4, true);
        _this.registerInput("worldNormal", NodeMaterialBlockConnectionPointTypes.Vector4, true);
        _this.worldNormal.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("TBN", NodeMaterialBlockConnectionPointTypes.Object, true, NodeMaterialBlockTargets.VertexAndFragment, new NodeMaterialConnectionPointCustomObject("TBN", _this, NodeMaterialConnectionPointDirection.Input, TBNBlock, "TBNBlock"));
        _this.registerOutput("clearcoat", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("clearcoat", _this, NodeMaterialConnectionPointDirection.Output, ClearCoatBlock, "ClearCoatBlock"));
        return _this;
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    ClearCoatBlock.prototype.initialize = function (state) {
        state._excludeVariableName("clearcoatOut");
        state._excludeVariableName("vClearCoatParams");
        state._excludeVariableName("vClearCoatTintParams");
        state._excludeVariableName("vClearCoatRefractionParams");
        state._excludeVariableName("vClearCoatTangentSpaceParams");
        state._excludeVariableName("vGeometricNormaClearCoatW");
    };
    /**
     * Gets the current class name
     * @returns the class name
     */
    ClearCoatBlock.prototype.getClassName = function () {
        return "ClearCoatBlock";
    };
    Object.defineProperty(ClearCoatBlock.prototype, "intensity", {
        /**
         * Gets the intensity input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "roughness", {
        /**
         * Gets the roughness input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "indexOfRefraction", {
        /**
         * Gets the ior input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "normalMapColor", {
        /**
         * Gets the bump texture input component
         */
        get: function () {
            return this._inputs[3];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "uv", {
        /**
         * Gets the uv input component
         */
        get: function () {
            return this._inputs[4];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "tintColor", {
        /**
         * Gets the tint color input component
         */
        get: function () {
            return this._inputs[5];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "tintAtDistance", {
        /**
         * Gets the tint "at distance" input component
         */
        get: function () {
            return this._inputs[6];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "tintThickness", {
        /**
         * Gets the tint thickness input component
         */
        get: function () {
            return this._inputs[7];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "worldTangent", {
        /**
         * Gets the world tangent input component
         */
        get: function () {
            return this._inputs[8];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "worldNormal", {
        /**
         * Gets the world normal input component
         */
        get: function () {
            return this._inputs[9];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "TBN", {
        /**
         * Gets the TBN input component
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return this._inputs[10];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClearCoatBlock.prototype, "clearcoat", {
        /**
         * Gets the clear coat object output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    ClearCoatBlock.prototype.autoConfigure = function () {
        if (!this.intensity.isConnected) {
            var intensityInput = new InputBlock("ClearCoat intensity", NodeMaterialBlockTargets.Fragment, NodeMaterialBlockConnectionPointTypes.Float);
            intensityInput.value = 1;
            intensityInput.output.connectTo(this.intensity);
        }
    };
    ClearCoatBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        _super.prototype.prepareDefines.call(this, mesh, nodeMaterial, defines);
        defines.setValue("CLEARCOAT", true);
        defines.setValue("CLEARCOAT_TEXTURE", false, true);
        defines.setValue("CLEARCOAT_USE_ROUGHNESS_FROM_MAINTEXTURE", true, true);
        defines.setValue("CLEARCOAT_TINT", this.tintColor.isConnected || this.tintThickness.isConnected || this.tintAtDistance.isConnected, true);
        defines.setValue("CLEARCOAT_BUMP", this.normalMapColor.isConnected, true);
        defines.setValue("CLEARCOAT_DEFAULTIOR", this.indexOfRefraction.isConnected ? this.indexOfRefraction.connectInputBlock.value === PBRClearCoatConfiguration._DefaultIndexOfRefraction : true, true);
        defines.setValue("CLEARCOAT_REMAP_F0", this.remapF0OnInterfaceChange, true);
    };
    ClearCoatBlock.prototype.bind = function (effect, nodeMaterial, mesh) {
        var _a, _b;
        _super.prototype.bind.call(this, effect, nodeMaterial, mesh);
        // Clear Coat Refraction params
        var indexOfRefraction = (_b = (_a = this.indexOfRefraction.connectInputBlock) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : PBRClearCoatConfiguration._DefaultIndexOfRefraction;
        var a = 1 - indexOfRefraction;
        var b = 1 + indexOfRefraction;
        var f0 = Math.pow(-a / b, 2); // Schlicks approx: (ior1 - ior2) / (ior1 + ior2) where ior2 for air is close to vacuum = 1.
        var eta = 1 / indexOfRefraction;
        effect.setFloat4("vClearCoatRefractionParams", f0, eta, a, b);
        // Clear Coat tangent space params
        var mainPBRBlock = this.clearcoat.hasEndpoints ? this.clearcoat.endpoints[0].ownerBlock : null;
        var perturbedNormalBlock = (mainPBRBlock === null || mainPBRBlock === void 0 ? void 0 : mainPBRBlock.perturbedNormal.isConnected) ? mainPBRBlock.perturbedNormal.connectedPoint.ownerBlock : null;
        if (this._scene._mirroredCameraPosition) {
            effect.setFloat2("vClearCoatTangentSpaceParams", (perturbedNormalBlock === null || perturbedNormalBlock === void 0 ? void 0 : perturbedNormalBlock.invertX) ? 1.0 : -1.0, (perturbedNormalBlock === null || perturbedNormalBlock === void 0 ? void 0 : perturbedNormalBlock.invertY) ? 1.0 : -1.0);
        }
        else {
            effect.setFloat2("vClearCoatTangentSpaceParams", (perturbedNormalBlock === null || perturbedNormalBlock === void 0 ? void 0 : perturbedNormalBlock.invertX) ? -1.0 : 1.0, (perturbedNormalBlock === null || perturbedNormalBlock === void 0 ? void 0 : perturbedNormalBlock.invertY) ? -1.0 : 1.0);
        }
    };
    ClearCoatBlock.prototype._generateTBNSpace = function (state, worldPositionVarName, worldNormalVarName) {
        var code = "";
        var comments = "//".concat(this.name);
        var worldTangent = this.worldTangent;
        state._emitExtension("derivatives", "#extension GL_OES_standard_derivatives : enable");
        var tangentReplaceString = { search: /defined\(TANGENT\)/g, replace: worldTangent.isConnected ? "defined(TANGENT)" : "defined(IGNORE)" };
        var TBN = this.TBN;
        if (TBN.isConnected) {
            state.compilationString += "\n            #ifdef TBNBLOCK\n            mat3 vTBN = ".concat(TBN.associatedVariableName, ";\n            #endif\n            ");
        }
        else if (worldTangent.isConnected) {
            code += "vec3 tbnNormal = normalize(".concat(worldNormalVarName, ".xyz);\r\n");
            code += "vec3 tbnTangent = normalize(".concat(worldTangent.associatedVariableName, ".xyz);\r\n");
            code += "vec3 tbnBitangent = cross(tbnNormal, tbnTangent);\r\n";
            code += "mat3 vTBN = mat3(tbnTangent, tbnBitangent, tbnNormal);\r\n";
        }
        state._emitFunctionFromInclude("bumpFragmentMainFunctions", comments, {
            replaceStrings: [tangentReplaceString],
        });
        return code;
    };
    /**
     * Gets the main code of the block (fragment side)
     * @param state current state of the node material building
     * @param ccBlock instance of a ClearCoatBlock or null if the code must be generated without an active clear coat module
     * @param reflectionBlock instance of a ReflectionBlock null if the code must be generated without an active reflection module
     * @param worldPosVarName name of the variable holding the world position
     * @param generateTBNSpace if true, the code needed to create the TBN coordinate space is generated
     * @param vTBNAvailable indicate that the vTBN variable is already existing because it has already been generated by another block (PerturbNormal or Anisotropy)
     * @param worldNormalVarName name of the variable holding the world normal
     * @returns the shader code
     */
    ClearCoatBlock.GetCode = function (state, ccBlock, reflectionBlock, worldPosVarName, generateTBNSpace, vTBNAvailable, worldNormalVarName) {
        var code = "";
        var intensity = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.intensity.isConnected) ? ccBlock.intensity.associatedVariableName : "1.";
        var roughness = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.roughness.isConnected) ? ccBlock.roughness.associatedVariableName : "0.";
        var normalMapColor = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.normalMapColor.isConnected) ? ccBlock.normalMapColor.associatedVariableName : "vec3(0.)";
        var uv = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.uv.isConnected) ? ccBlock.uv.associatedVariableName : "vec2(0.)";
        var tintColor = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.tintColor.isConnected) ? ccBlock.tintColor.associatedVariableName : "vec3(1.)";
        var tintThickness = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.tintThickness.isConnected) ? ccBlock.tintThickness.associatedVariableName : "1.";
        var tintAtDistance = (ccBlock === null || ccBlock === void 0 ? void 0 : ccBlock.tintAtDistance.isConnected) ? ccBlock.tintAtDistance.associatedVariableName : "1.";
        var tintTexture = "vec4(0.)";
        if (ccBlock) {
            state._emitUniformFromString("vClearCoatRefractionParams", "vec4");
            state._emitUniformFromString("vClearCoatTangentSpaceParams", "vec2");
            var normalShading = ccBlock.worldNormal;
            code += "vec3 vGeometricNormaClearCoatW = ".concat(normalShading.isConnected ? "normalize(" + normalShading.associatedVariableName + ".xyz)" : "geometricNormalW", ";\r\n");
        }
        else {
            code += "vec3 vGeometricNormaClearCoatW = geometricNormalW;\r\n";
        }
        if (generateTBNSpace && ccBlock) {
            code += ccBlock._generateTBNSpace(state, worldPosVarName, worldNormalVarName);
            vTBNAvailable = ccBlock.worldTangent.isConnected;
        }
        code += "clearcoatOutParams clearcoatOut;\n\n        #ifdef CLEARCOAT\n            vec2 vClearCoatParams = vec2(".concat(intensity, ", ").concat(roughness, ");\n            vec4 vClearCoatTintParams = vec4(").concat(tintColor, ", ").concat(tintThickness, ");\n\n            clearcoatBlock(\n                ").concat(worldPosVarName, ".xyz,\n                vGeometricNormaClearCoatW,\n                viewDirectionW,\n                vClearCoatParams,\n                specularEnvironmentR0,\n            #ifdef CLEARCOAT_TEXTURE\n                vec2(0.),\n            #endif\n            #ifdef CLEARCOAT_TINT\n                vClearCoatTintParams,\n                ").concat(tintAtDistance, ",\n                vClearCoatRefractionParams,\n                #ifdef CLEARCOAT_TINT_TEXTURE\n                    ").concat(tintTexture, ",\n                #endif\n            #endif\n            #ifdef CLEARCOAT_BUMP\n                vec2(0., 1.),\n                vec4(").concat(normalMapColor, ", 0.),\n                ").concat(uv, ",\n                #if defined(").concat(vTBNAvailable ? "TANGENT" : "IGNORE", ") && defined(NORMAL)\n                    vTBN,\n                #else\n                    vClearCoatTangentSpaceParams,\n                #endif\n                #ifdef OBJECTSPACE_NORMALMAP\n                    normalMatrix,\n                #endif\n            #endif\n            #if defined(FORCENORMALFORWARD) && defined(NORMAL)\n                faceNormal,\n            #endif\n            #ifdef REFLECTION\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionMicrosurfaceInfosName, ",\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._vReflectionInfosName, ",\n                ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock.reflectionColor, ",\n                vLightingIntensity,\n                #ifdef ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName, "\n                    ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                #else\n                    ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                #endif\n                #ifndef LODBASEDMICROSFURACE\n                    #ifdef ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._define3DName, "\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._cubeSamplerName, ",\n                    #else\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                        ").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._2DSamplerName, ",\n                    #endif\n                #endif\n            #endif\n            #if defined(ENVIRONMENTBRDF) && !defined(").concat(reflectionBlock === null || reflectionBlock === void 0 ? void 0 : reflectionBlock._defineSkyboxName, ")\n                #ifdef RADIANCEOCCLUSION\n                    ambientMonochrome,\n                #endif\n            #endif\n            #if defined(CLEARCOAT_BUMP) || defined(TWOSIDEDLIGHTING)\n                (gl_FrontFacing ? 1. : -1.),\n            #endif\n                clearcoatOut\n            );\n        #else\n            clearcoatOut.specularEnvironmentR0 = specularEnvironmentR0;\n        #endif\r\n");
        return code;
    };
    ClearCoatBlock.prototype._buildBlock = function (state) {
        this._scene = state.sharedData.scene;
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.sharedData.bindableBlocks.push(this);
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    ClearCoatBlock.prototype._dumpPropertiesCode = function () {
        var codeString = _super.prototype._dumpPropertiesCode.call(this);
        codeString += "".concat(this._codeVariableName, ".remapF0OnInterfaceChange = ").concat(this.remapF0OnInterfaceChange, ";\r\n");
        return codeString;
    };
    ClearCoatBlock.prototype.serialize = function () {
        var serializationObject = _super.prototype.serialize.call(this);
        serializationObject.remapF0OnInterfaceChange = this.remapF0OnInterfaceChange;
        return serializationObject;
    };
    ClearCoatBlock.prototype._deserialize = function (serializationObject, scene, rootUrl) {
        var _a;
        _super.prototype._deserialize.call(this, serializationObject, scene, rootUrl);
        this.remapF0OnInterfaceChange = (_a = serializationObject.remapF0OnInterfaceChange) !== null && _a !== void 0 ? _a : true;
    };
    __decorate([
        editableInPropertyPage("Remap F0 on interface change", PropertyTypeForEdition.Boolean, "ADVANCED")
    ], ClearCoatBlock.prototype, "remapF0OnInterfaceChange", void 0);
    return ClearCoatBlock;
}(NodeMaterialBlock));
export { ClearCoatBlock };
RegisterClass("BABYLON.ClearCoatBlock", ClearCoatBlock);
//# sourceMappingURL=clearCoatBlock.js.map