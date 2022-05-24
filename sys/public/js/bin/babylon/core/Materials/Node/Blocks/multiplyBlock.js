import { __extends } from "tslib";
import { NodeMaterialBlock } from "../nodeMaterialBlock.js";
import { NodeMaterialBlockConnectionPointTypes } from "../Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "../Enums/nodeMaterialBlockTargets.js";
import { RegisterClass } from "../../../Misc/typeStore.js";
/**
 * Block used to multiply 2 values
 */
var MultiplyBlock = /** @class */ (function (_super) {
    __extends(MultiplyBlock, _super);
    /**
     * Creates a new MultiplyBlock
     * @param name defines the block name
     */
    function MultiplyBlock(name) {
        var _this = _super.call(this, name, NodeMaterialBlockTargets.Neutral) || this;
        _this.registerInput("left", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerInput("right", NodeMaterialBlockConnectionPointTypes.AutoDetect);
        _this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.BasedOnInput);
        _this._outputs[0]._typeConnectionSource = _this._inputs[0];
        _this._linkConnectionTypes(0, 1);
        return _this;
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    MultiplyBlock.prototype.getClassName = function () {
        return "MultiplyBlock";
    };
    Object.defineProperty(MultiplyBlock.prototype, "left", {
        /**
         * Gets the left operand input component
         */
        get: function () {
            return this._inputs[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MultiplyBlock.prototype, "right", {
        /**
         * Gets the right operand input component
         */
        get: function () {
            return this._inputs[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MultiplyBlock.prototype, "output", {
        /**
         * Gets the output component
         */
        get: function () {
            return this._outputs[0];
        },
        enumerable: false,
        configurable: true
    });
    MultiplyBlock.prototype._buildBlock = function (state) {
        _super.prototype._buildBlock.call(this, state);
        var output = this._outputs[0];
        state.compilationString += this._declareOutput(output, state) + " = ".concat(this.left.associatedVariableName, " * ").concat(this.right.associatedVariableName, ";\r\n");
        return this;
    };
    return MultiplyBlock;
}(NodeMaterialBlock));
export { MultiplyBlock };
RegisterClass("BABYLON.MultiplyBlock", MultiplyBlock);
//# sourceMappingURL=multiplyBlock.js.map