import { __extends } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialConnectionPointDirection } from "../../nodeMaterialBlockConnectionPoint.js";
import { RegisterClass } from "../../../../Misc/typeStore.js";
import { NodeMaterialConnectionPointCustomObject } from "../../nodeMaterialConnectionPointCustomObject.js";
import { NodeMaterialSystemValues } from "../../Enums/nodeMaterialSystemValues.js";
import { InputBlock } from "../Input/inputBlock.js";
/**
 * Block used to implement TBN matrix
 */
var TBNBlock = /** @class */ (function (_super) {
    __extends(TBNBlock, _super);
    /**
     * Create a new TBNBlock
     * @param name defines the block name
     */
    function TBNBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Fragment, true) || this;
        _this.registerInput("normal", NodeMaterialBlockConnectionPointTypes.Vector4, false);
        _this.normal.acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Vector3);
        _this.registerInput("tangent", NodeMaterialBlockConnectionPointTypes.Vector4, false);
        _this.registerInput("world", NodeMaterialBlockConnectionPointTypes.Matrix, false);
        _this.registerOutput("TBN", NodeMaterialBlockConnectionPointTypes.Object, NodeMaterialBlockTargets.Fragment, new NodeMaterialConnectionPointCustomObject("TBN", _this, NodeMaterialConnectionPointDirection.Output, TBNBlock, "TBNBlock"));
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    TBNBlock.prototype.getClassName = function () {
        return "TBNBlock";
    };
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    TBNBlock.prototype.initialize = function (state) {
        state._excludeVariableName("tbnNormal");
        state._excludeVariableName("tbnTangent");
        state._excludeVariableName("tbnBitangent");
        state._excludeVariableName("TBN");
    };
    Object.defineProperty(TBNBlock.prototype, "normal", {
        /**
         * Gets the normal input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TBNBlock.prototype, "tangent", {
        /**
         * Gets the tangent input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TBNBlock.prototype, "world", {
        /**
         * Gets the world matrix input component
         */
        get: function () {
            return this._inputs[2];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TBNBlock.prototype, "TBN", {
        /**
         * Gets the TBN output component
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TBNBlock.prototype, "target", {
        get: function () {
            return NodeMaterialBlockTargets.Fragment;
        },
        set: function (value) { },
        enumerable: false,
        configurable: true
    });
    TBNBlock.prototype.autoConfigure = function (material) {
        if (!this.world.isConnected) {
            var worldInput = material.getInputBlockByPredicate(function (b) { return b.isSystemValue && b.systemValue === NodeMaterialSystemValues.World; });
            if (!worldInput) {
                worldInput = new InputBlock("world");
                worldInput.setAsSystemValue(NodeMaterialSystemValues.World);
            }
            worldInput.output.connectTo(this.world);
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
            var tangentInput = material.getInputBlockByPredicate(function (b) { return b.isAttribute && b.name === "tangent" && b.type === NodeMaterialBlockConnectionPointTypes.Vector4; });
            if (!tangentInput) {
                tangentInput = new InputBlock("tangent");
                tangentInput.setAsAttribute("tangent");
            }
            tangentInput.output.connectTo(this.tangent);
        }
    };
    TBNBlock.prototype.prepareDefines = function (mesh, nodeMaterial, defines) {
        var _a, _b, _c, _d;
        var normal = this.normal;
        var tangent = this.tangent;
        var normalAvailable = normal.isConnected;
        if (((_a = normal.connectInputBlock) === null || _a === void 0 ? void 0 : _a.isAttribute) && !mesh.isVerticesDataPresent((_b = normal.connectInputBlock) === null || _b === void 0 ? void 0 : _b.name)) {
            normalAvailable = false;
        }
        var tangentAvailable = tangent.isConnected;
        if (((_c = tangent.connectInputBlock) === null || _c === void 0 ? void 0 : _c.isAttribute) && !mesh.isVerticesDataPresent((_d = tangent.connectInputBlock) === null || _d === void 0 ? void 0 : _d.name)) {
            tangentAvailable = false;
        }
        var useTBNBlock = normalAvailable && tangentAvailable;
        defines.setValue("TBNBLOCK", useTBNBlock, true);
    };
    TBNBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var normal = this.normal;
        var tangent = this.tangent;
        var world = this.world;
        var TBN = this.TBN;
        // Fragment
        if (state.target === NodeMaterialBlockTargets.Fragment) {
            state.compilationString += "\n                // ".concat(this.name, "\n                vec3 tbnNormal = normalize(").concat(normal.associatedVariableName, ").xyz;\n                vec3 tbnTangent = normalize(").concat(tangent.associatedVariableName, ".xyz);\n                vec3 tbnBitangent = cross(tbnNormal, tbnTangent) * ").concat(tangent.associatedVariableName, ".w;\n                mat3 ").concat(TBN.associatedVariableName, " = mat3(").concat(world.associatedVariableName, ") * mat3(tbnTangent, tbnBitangent, tbnNormal);\n            ");
            state.sharedData.blocksWithDefines.push(this);
        }
        return this;
    };
    return TBNBlock;
}(NodeMaterialBlock));
export { TBNBlock };
RegisterClass("BABYLON.TBNBlock", TBNBlock);
//# sourceMappingURL=TBNBlock.js.map