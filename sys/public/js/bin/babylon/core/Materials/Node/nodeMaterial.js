import { __assign, __decorate, __extends } from "tslib";
import { PushMaterial } from "../pushMaterial.js";
import { AbstractMesh } from "../../Meshes/abstractMesh.js";
import { Matrix, Vector2 } from "../../Maths/math.vector.js";
import { Color3, Color4 } from "../../Maths/math.color.js";
import { Engine } from "../../Engines/engine.js";
import { NodeMaterialBuildState } from "./nodeMaterialBuildState.js";
import { Effect } from "../effect.js";
import { Observable } from "../../Misc/observable.js";
import { NodeMaterialBlockTargets } from "./Enums/nodeMaterialBlockTargets.js";
import { NodeMaterialBuildStateSharedData } from "./nodeMaterialBuildStateSharedData.js";
import { MaterialDefines } from "../../Materials/materialDefines.js";
import { VertexBuffer } from "../../Buffers/buffer.js";
import { Tools } from "../../Misc/tools.js";
import { TransformBlock } from "./Blocks/transformBlock.js";
import { VertexOutputBlock } from "./Blocks/Vertex/vertexOutputBlock.js";
import { FragmentOutputBlock } from "./Blocks/Fragment/fragmentOutputBlock.js";
import { InputBlock } from "./Blocks/Input/inputBlock.js";
import { GetClass, RegisterClass } from "../../Misc/typeStore.js";
import { serialize, SerializationHelper } from "../../Misc/decorators.js";
import { CurrentScreenBlock } from "./Blocks/Dual/currentScreenBlock.js";
import { ParticleTextureBlock } from "./Blocks/Particle/particleTextureBlock.js";
import { ParticleRampGradientBlock } from "./Blocks/Particle/particleRampGradientBlock.js";
import { ParticleBlendMultiplyBlock } from "./Blocks/Particle/particleBlendMultiplyBlock.js";
import { EffectFallbacks } from "../effectFallbacks.js";
import { WebRequest } from "../../Misc/webRequest.js";
import { PostProcess } from "../../PostProcesses/postProcess.js";

import { VectorMergerBlock } from "./Blocks/vectorMergerBlock.js";
import { RemapBlock } from "./Blocks/remapBlock.js";
import { MultiplyBlock } from "./Blocks/multiplyBlock.js";
import { NodeMaterialModes } from "./Enums/nodeMaterialModes.js";
import { Texture } from "../Textures/texture.js";
import { BaseParticleSystem } from "../../Particles/baseParticleSystem.js";
import { ColorSplitterBlock } from "./Blocks/colorSplitterBlock.js";
import { TimingTools } from "../../Misc/timingTools.js";
import { ProceduralTexture } from "../Textures/Procedurals/proceduralTexture.js";
import { AnimatedInputBlockTypes } from "./Blocks/Input/animatedInputBlockTypes.js";
import { TrigonometryBlock, TrigonometryBlockOperations } from "./Blocks/trigonometryBlock.js";
import { NodeMaterialSystemValues } from "./Enums/nodeMaterialSystemValues.js";
import { EngineStore } from "../../Engines/engineStore.js";
var onCreatedEffectParameters = { effect: null, subMesh: null };
/** @hidden */
var NodeMaterialDefines = /** @class */ (function (_super) {
    __extends(NodeMaterialDefines, _super);
    function NodeMaterialDefines() {
        var _this = _super.call(this) || this;
        _this.NORMAL = false;
        _this.TANGENT = false;
        _this.UV1 = false;
        _this.UV2 = false;
        _this.UV3 = false;
        _this.UV4 = false;
        _this.UV5 = false;
        _this.UV6 = false;
        /** BONES */
        _this.NUM_BONE_INFLUENCERS = 0;
        _this.BonesPerMesh = 0;
        _this.BONETEXTURE = false;
        /** MORPH TARGETS */
        _this.MORPHTARGETS = false;
        _this.MORPHTARGETS_NORMAL = false;
        _this.MORPHTARGETS_TANGENT = false;
        _this.MORPHTARGETS_UV = false;
        _this.NUM_MORPH_INFLUENCERS = 0;
        _this.MORPHTARGETS_TEXTURE = false;
        /** IMAGE PROCESSING */
        _this.IMAGEPROCESSING = false;
        _this.VIGNETTE = false;
        _this.VIGNETTEBLENDMODEMULTIPLY = false;
        _this.VIGNETTEBLENDMODEOPAQUE = false;
        _this.TONEMAPPING = false;
        _this.TONEMAPPING_ACES = false;
        _this.CONTRAST = false;
        _this.EXPOSURE = false;
        _this.COLORCURVES = false;
        _this.COLORGRADING = false;
        _this.COLORGRADING3D = false;
        _this.SAMPLER3DGREENDEPTH = false;
        _this.SAMPLER3DBGRMAP = false;
        _this.IMAGEPROCESSINGPOSTPROCESS = false;
        _this.SKIPFINALCOLORCLAMP = false;
        /** MISC. */
        _this.BUMPDIRECTUV = 0;
        _this.rebuild();
        return _this;
    }
    NodeMaterialDefines.prototype.setValue = function (name, value, markAsUnprocessedIfDirty) {
        if (markAsUnprocessedIfDirty === void 0) { markAsUnprocessedIfDirty = false; }
        if (this[name] === undefined) {
            this._keys.push(name);
        }
        if (markAsUnprocessedIfDirty && this[name] !== value) {
            this.markAsUnprocessed();
        }
        this[name] = value;
    };
    return NodeMaterialDefines;
}(MaterialDefines));
export { NodeMaterialDefines };
/**
 * Class used to create a node based material built by assembling shader blocks
 */
var NodeMaterial = /** @class */ (function (_super) {
    __extends(NodeMaterial, _super);
    /**
     * Create a new node based material
     * @param name defines the material name
     * @param scene defines the hosting scene
     * @param options defines creation option
     */
    function NodeMaterial(name, scene, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, name, scene || EngineStore.LastCreatedScene) || this;
        _this._buildId = NodeMaterial._BuildIdGenerator++;
        _this._buildWasSuccessful = false;
        _this._cachedWorldViewMatrix = new Matrix();
        _this._cachedWorldViewProjectionMatrix = new Matrix();
        _this._optimizers = new Array();
        _this._animationFrame = -1;
        _this.BJSNODEMATERIALEDITOR = _this._getGlobalNodeMaterialEditor();
        /**
         * Gets or sets data used by visual editor
         * @see https://nme.babylonjs.com
         */
        _this.editorData = null;
        /**
         * Gets or sets a boolean indicating that alpha value must be ignored (This will turn alpha blending off even if an alpha value is produced by the material)
         */
        _this.ignoreAlpha = false;
        /**
         * Defines the maximum number of lights that can be used in the material
         */
        _this.maxSimultaneousLights = 4;
        /**
         * Observable raised when the material is built
         */
        _this.onBuildObservable = new Observable();
        /**
         * Gets or sets the root nodes of the material vertex shader
         */
        _this._vertexOutputNodes = new Array();
        /**
         * Gets or sets the root nodes of the material fragment (pixel) shader
         */
        _this._fragmentOutputNodes = new Array();
        /**
         * Gets an array of blocks that needs to be serialized even if they are not yet connected
         */
        _this.attachedBlocks = new Array();
        /**
         * Specifies the mode of the node material
         * @hidden
         */
        _this._mode = NodeMaterialModes.Material;
        /**
         * Gets or sets a boolean indicating that alpha blending must be enabled no matter what alpha value or alpha channel of the FragmentBlock are
         */
        _this.forceAlphaBlending = false;
        _this._options = __assign({ emitComments: false }, options);
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        return _this;
    }
    /** Get the inspector from bundle or global */
    NodeMaterial.prototype._getGlobalNodeMaterialEditor = function () {
        // UMD Global name detection from Webpack Bundle UMD Name.
        if (typeof NODEEDITOR !== "undefined") {
            return NODEEDITOR;
        }
        // In case of module let's check the global emitted from the editor entry point.
        if (typeof BABYLON !== "undefined" && typeof BABYLON.NodeEditor !== "undefined") {
            return BABYLON;
        }
        return undefined;
    };
    Object.defineProperty(NodeMaterial.prototype, "options", {
        /** Gets or sets options to control the node material overall behavior */
        get: function () {
            return this._options;
        },
        set: function (options) {
            this._options = options;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterial.prototype, "imageProcessingConfiguration", {
        /**
         * Gets the image processing configuration used either in this material.
         */
        get: function () {
            return this._imageProcessingConfiguration;
        },
        /**
         * Sets the Default image processing configuration used either in the this material.
         *
         * If sets to null, the scene one is in use.
         */
        set: function (value) {
            this._attachImageProcessingConfiguration(value);
            // Ensure the effect will be rebuilt.
            this._markAllSubMeshesAsTexturesDirty();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterial.prototype, "mode", {
        /**
         * Gets or sets the mode property
         */
        get: function () {
            return this._mode;
        },
        set: function (value) {
            this._mode = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterial.prototype, "buildId", {
        /** Gets or sets the unique identifier used to identified the effect associated with the material */
        get: function () {
            return this._buildId;
        },
        set: function (value) {
            this._buildId = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name of the material e.g. "NodeMaterial"
     * @returns the class name
     */
    NodeMaterial.prototype.getClassName = function () {
        return "NodeMaterial";
    };
    /**
     * Attaches a new image processing configuration to the Standard Material.
     * @param configuration
     */
    NodeMaterial.prototype._attachImageProcessingConfiguration = function (configuration) {
        var _this = this;
        if (configuration === this._imageProcessingConfiguration) {
            return;
        }
        // Detaches observer.
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        // Pick the scene configuration if needed.
        if (!configuration) {
            this._imageProcessingConfiguration = this.getScene().imageProcessingConfiguration;
        }
        else {
            this._imageProcessingConfiguration = configuration;
        }
        // Attaches observer.
        if (this._imageProcessingConfiguration) {
            this._imageProcessingObserver = this._imageProcessingConfiguration.onUpdateParameters.add(function () {
                _this._markAllSubMeshesAsImageProcessingDirty();
            });
        }
    };
    /**
     * Get a block by its name
     * @param name defines the name of the block to retrieve
     * @returns the required block or null if not found
     */
    NodeMaterial.prototype.getBlockByName = function (name) {
        var result = null;
        for (var _i = 0, _a = this.attachedBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.name === name) {
                if (!result) {
                    result = block;
                }
                else {
                    Tools.Warn("More than one block was found with the name `" + name + "`");
                    return result;
                }
            }
        }
        return result;
    };
    /**
     * Get a block by its name
     * @param predicate defines the predicate used to find the good candidate
     * @returns the required block or null if not found
     */
    NodeMaterial.prototype.getBlockByPredicate = function (predicate) {
        for (var _i = 0, _a = this.attachedBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (predicate(block)) {
                return block;
            }
        }
        return null;
    };
    /**
     * Get an input block by its name
     * @param predicate defines the predicate used to find the good candidate
     * @returns the required input block or null if not found
     */
    NodeMaterial.prototype.getInputBlockByPredicate = function (predicate) {
        for (var _i = 0, _a = this.attachedBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.isInput && predicate(block)) {
                return block;
            }
        }
        return null;
    };
    /**
     * Gets the list of input blocks attached to this material
     * @returns an array of InputBlocks
     */
    NodeMaterial.prototype.getInputBlocks = function () {
        var blocks = [];
        for (var _i = 0, _a = this.attachedBlocks; _i < _a.length; _i++) {
            var block = _a[_i];
            if (block.isInput) {
                blocks.push(block);
            }
        }
        return blocks;
    };
    /**
     * Adds a new optimizer to the list of optimizers
     * @param optimizer defines the optimizers to add
     * @returns the current material
     */
    NodeMaterial.prototype.registerOptimizer = function (optimizer) {
        var index = this._optimizers.indexOf(optimizer);
        if (index > -1) {
            return;
        }
        this._optimizers.push(optimizer);
        return this;
    };
    /**
     * Remove an optimizer from the list of optimizers
     * @param optimizer defines the optimizers to remove
     * @returns the current material
     */
    NodeMaterial.prototype.unregisterOptimizer = function (optimizer) {
        var index = this._optimizers.indexOf(optimizer);
        if (index === -1) {
            return;
        }
        this._optimizers.splice(index, 1);
        return this;
    };
    /**
     * Add a new block to the list of output nodes
     * @param node defines the node to add
     * @returns the current material
     */
    NodeMaterial.prototype.addOutputNode = function (node) {
        if (node.target === null) {
            throw "This node is not meant to be an output node. You may want to explicitly set its target value.";
        }
        if ((node.target & NodeMaterialBlockTargets.Vertex) !== 0) {
            this._addVertexOutputNode(node);
        }
        if ((node.target & NodeMaterialBlockTargets.Fragment) !== 0) {
            this._addFragmentOutputNode(node);
        }
        return this;
    };
    /**
     * Remove a block from the list of root nodes
     * @param node defines the node to remove
     * @returns the current material
     */
    NodeMaterial.prototype.removeOutputNode = function (node) {
        if (node.target === null) {
            return this;
        }
        if ((node.target & NodeMaterialBlockTargets.Vertex) !== 0) {
            this._removeVertexOutputNode(node);
        }
        if ((node.target & NodeMaterialBlockTargets.Fragment) !== 0) {
            this._removeFragmentOutputNode(node);
        }
        return this;
    };
    NodeMaterial.prototype._addVertexOutputNode = function (node) {
        if (this._vertexOutputNodes.indexOf(node) !== -1) {
            return;
        }
        node.target = NodeMaterialBlockTargets.Vertex;
        this._vertexOutputNodes.push(node);
        return this;
    };
    NodeMaterial.prototype._removeVertexOutputNode = function (node) {
        var index = this._vertexOutputNodes.indexOf(node);
        if (index === -1) {
            return;
        }
        this._vertexOutputNodes.splice(index, 1);
        return this;
    };
    NodeMaterial.prototype._addFragmentOutputNode = function (node) {
        if (this._fragmentOutputNodes.indexOf(node) !== -1) {
            return;
        }
        node.target = NodeMaterialBlockTargets.Fragment;
        this._fragmentOutputNodes.push(node);
        return this;
    };
    NodeMaterial.prototype._removeFragmentOutputNode = function (node) {
        var index = this._fragmentOutputNodes.indexOf(node);
        if (index === -1) {
            return;
        }
        this._fragmentOutputNodes.splice(index, 1);
        return this;
    };
    /**
     * Specifies if the material will require alpha blending
     * @returns a boolean specifying if alpha blending is needed
     */
    NodeMaterial.prototype.needAlphaBlending = function () {
        if (this.ignoreAlpha) {
            return false;
        }
        return this.forceAlphaBlending || this.alpha < 1.0 || (this._sharedData && this._sharedData.hints.needAlphaBlending);
    };
    /**
     * Specifies if this material should be rendered in alpha test mode
     * @returns a boolean specifying if an alpha test is needed.
     */
    NodeMaterial.prototype.needAlphaTesting = function () {
        return this._sharedData && this._sharedData.hints.needAlphaTesting;
    };
    NodeMaterial.prototype._initializeBlock = function (node, state, nodesToProcessForOtherBuildState, autoConfigure) {
        if (autoConfigure === void 0) { autoConfigure = true; }
        node.initialize(state);
        if (autoConfigure) {
            node.autoConfigure(this);
        }
        node._preparationId = this._buildId;
        if (this.attachedBlocks.indexOf(node) === -1) {
            if (node.isUnique) {
                var className = node.getClassName();
                for (var _i = 0, _a = this.attachedBlocks; _i < _a.length; _i++) {
                    var other = _a[_i];
                    if (other.getClassName() === className) {
                        throw "Cannot have multiple blocks of type ".concat(className, " in the same NodeMaterial");
                    }
                }
            }
            this.attachedBlocks.push(node);
        }
        for (var _b = 0, _c = node.inputs; _b < _c.length; _b++) {
            var input = _c[_b];
            input.associatedVariableName = "";
            var connectedPoint = input.connectedPoint;
            if (connectedPoint) {
                var block = connectedPoint.ownerBlock;
                if (block !== node) {
                    if (block.target === NodeMaterialBlockTargets.VertexAndFragment) {
                        nodesToProcessForOtherBuildState.push(block);
                    }
                    else if (state.target === NodeMaterialBlockTargets.Fragment && block.target === NodeMaterialBlockTargets.Vertex && block._preparationId !== this._buildId) {
                        nodesToProcessForOtherBuildState.push(block);
                    }
                    this._initializeBlock(block, state, nodesToProcessForOtherBuildState, autoConfigure);
                }
            }
        }
        for (var _d = 0, _e = node.outputs; _d < _e.length; _d++) {
            var output = _e[_d];
            output.associatedVariableName = "";
        }
    };
    NodeMaterial.prototype._resetDualBlocks = function (node, id) {
        if (node.target === NodeMaterialBlockTargets.VertexAndFragment) {
            node.buildId = id;
        }
        for (var _i = 0, _a = node.inputs; _i < _a.length; _i++) {
            var inputs = _a[_i];
            var connectedPoint = inputs.connectedPoint;
            if (connectedPoint) {
                var block = connectedPoint.ownerBlock;
                if (block !== node) {
                    this._resetDualBlocks(block, id);
                }
            }
        }
    };
    /**
     * Remove a block from the current node material
     * @param block defines the block to remove
     */
    NodeMaterial.prototype.removeBlock = function (block) {
        var attachedBlockIndex = this.attachedBlocks.indexOf(block);
        if (attachedBlockIndex > -1) {
            this.attachedBlocks.splice(attachedBlockIndex, 1);
        }
        if (block.isFinalMerger) {
            this.removeOutputNode(block);
        }
    };
    /**
     * Build the material and generates the inner effect
     * @param verbose defines if the build should log activity
     * @param updateBuildId defines if the internal build Id should be updated (default is true)
     * @param autoConfigure defines if the autoConfigure method should be called when initializing blocks (default is true)
     */
    NodeMaterial.prototype.build = function (verbose, updateBuildId, autoConfigure) {
        if (verbose === void 0) { verbose = false; }
        if (updateBuildId === void 0) { updateBuildId = true; }
        if (autoConfigure === void 0) { autoConfigure = true; }
        this._buildWasSuccessful = false;
        var engine = this.getScene().getEngine();
        var allowEmptyVertexProgram = this._mode === NodeMaterialModes.Particle;
        if (this._vertexOutputNodes.length === 0 && !allowEmptyVertexProgram) {
            throw "You must define at least one vertexOutputNode";
        }
        if (this._fragmentOutputNodes.length === 0) {
            throw "You must define at least one fragmentOutputNode";
        }
        // Compilation state
        this._vertexCompilationState = new NodeMaterialBuildState();
        this._vertexCompilationState.supportUniformBuffers = engine.supportsUniformBuffers;
        this._vertexCompilationState.target = NodeMaterialBlockTargets.Vertex;
        this._fragmentCompilationState = new NodeMaterialBuildState();
        this._fragmentCompilationState.supportUniformBuffers = engine.supportsUniformBuffers;
        this._fragmentCompilationState.target = NodeMaterialBlockTargets.Fragment;
        // Shared data
        this._sharedData = new NodeMaterialBuildStateSharedData();
        this._sharedData.fragmentOutputNodes = this._fragmentOutputNodes;
        this._vertexCompilationState.sharedData = this._sharedData;
        this._fragmentCompilationState.sharedData = this._sharedData;
        this._sharedData.buildId = this._buildId;
        this._sharedData.emitComments = this._options.emitComments;
        this._sharedData.verbose = verbose;
        this._sharedData.scene = this.getScene();
        this._sharedData.allowEmptyVertexProgram = allowEmptyVertexProgram;
        // Initialize blocks
        var vertexNodes = [];
        var fragmentNodes = [];
        for (var _i = 0, _a = this._vertexOutputNodes; _i < _a.length; _i++) {
            var vertexOutputNode = _a[_i];
            vertexNodes.push(vertexOutputNode);
            this._initializeBlock(vertexOutputNode, this._vertexCompilationState, fragmentNodes, autoConfigure);
        }
        for (var _b = 0, _c = this._fragmentOutputNodes; _b < _c.length; _b++) {
            var fragmentOutputNode = _c[_b];
            fragmentNodes.push(fragmentOutputNode);
            this._initializeBlock(fragmentOutputNode, this._fragmentCompilationState, vertexNodes, autoConfigure);
        }
        // Optimize
        this.optimize();
        // Vertex
        for (var _d = 0, vertexNodes_1 = vertexNodes; _d < vertexNodes_1.length; _d++) {
            var vertexOutputNode = vertexNodes_1[_d];
            vertexOutputNode.build(this._vertexCompilationState, vertexNodes);
        }
        // Fragment
        this._fragmentCompilationState.uniforms = this._vertexCompilationState.uniforms.slice(0);
        this._fragmentCompilationState._uniformDeclaration = this._vertexCompilationState._uniformDeclaration;
        this._fragmentCompilationState._constantDeclaration = this._vertexCompilationState._constantDeclaration;
        this._fragmentCompilationState._vertexState = this._vertexCompilationState;
        for (var _e = 0, fragmentNodes_1 = fragmentNodes; _e < fragmentNodes_1.length; _e++) {
            var fragmentOutputNode = fragmentNodes_1[_e];
            this._resetDualBlocks(fragmentOutputNode, this._buildId - 1);
        }
        for (var _f = 0, fragmentNodes_2 = fragmentNodes; _f < fragmentNodes_2.length; _f++) {
            var fragmentOutputNode = fragmentNodes_2[_f];
            fragmentOutputNode.build(this._fragmentCompilationState, fragmentNodes);
        }
        // Finalize
        this._vertexCompilationState.finalize(this._vertexCompilationState);
        this._fragmentCompilationState.finalize(this._fragmentCompilationState);
        if (updateBuildId) {
            this._buildId = NodeMaterial._BuildIdGenerator++;
        }
        // Errors
        this._sharedData.emitErrors();
        if (verbose) {
            console.log("Vertex shader:");
            console.log(this._vertexCompilationState.compilationString);
            console.log("Fragment shader:");
            console.log(this._fragmentCompilationState.compilationString);
        }
        this._buildWasSuccessful = true;
        this.onBuildObservable.notifyObservers(this);
        // Wipe defines
        var meshes = this.getScene().meshes;
        for (var _g = 0, meshes_1 = meshes; _g < meshes_1.length; _g++) {
            var mesh = meshes_1[_g];
            if (!mesh.subMeshes) {
                continue;
            }
            for (var _h = 0, _j = mesh.subMeshes; _h < _j.length; _h++) {
                var subMesh = _j[_h];
                if (subMesh.getMaterial() !== this) {
                    continue;
                }
                if (!subMesh.materialDefines) {
                    continue;
                }
                var defines = subMesh.materialDefines;
                defines.markAllAsDirty();
                defines.reset();
            }
        }
    };
    /**
     * Runs an otpimization phase to try to improve the shader code
     */
    NodeMaterial.prototype.optimize = function () {
        for (var _i = 0, _a = this._optimizers; _i < _a.length; _i++) {
            var optimizer = _a[_i];
            optimizer.optimize(this._vertexOutputNodes, this._fragmentOutputNodes);
        }
    };
    NodeMaterial.prototype._prepareDefinesForAttributes = function (mesh, defines) {
        var oldNormal = defines["NORMAL"];
        var oldTangent = defines["TANGENT"];
        defines["NORMAL"] = mesh.isVerticesDataPresent(VertexBuffer.NormalKind);
        defines["TANGENT"] = mesh.isVerticesDataPresent(VertexBuffer.TangentKind);
        var uvChanged = false;
        for (var i = 1; i <= 6; ++i) {
            var oldUV = defines["UV" + i];
            defines["UV" + i] = mesh.isVerticesDataPresent("uv".concat(i === 1 ? "" : i));
            uvChanged = uvChanged || defines["UV" + i] !== oldUV;
        }
        if (oldNormal !== defines["NORMAL"] || oldTangent !== defines["TANGENT"] || uvChanged) {
            defines.markAsAttributesDirty();
        }
    };
    /**
     * Create a post process from the material
     * @param camera The camera to apply the render pass to.
     * @param options The required width/height ratio to downsize to before computing the render pass. (Use 1.0 for full size)
     * @param samplingMode The sampling mode to be used when computing the pass. (default: 0)
     * @param engine The engine which the post process will be applied. (default: current engine)
     * @param reusable If the post process can be reused on the same frame. (default: false)
     * @param textureType Type of textures used when performing the post process. (default: 0)
     * @param textureFormat Format of textures used when performing the post process. (default: TEXTUREFORMAT_RGBA)
     * @returns the post process created
     */
    NodeMaterial.prototype.createPostProcess = function (camera, options, samplingMode, engine, reusable, textureType, textureFormat) {
        if (options === void 0) { options = 1; }
        if (samplingMode === void 0) { samplingMode = 1; }
        if (textureType === void 0) { textureType = 0; }
        if (textureFormat === void 0) { textureFormat = 5; }
        if (this.mode !== NodeMaterialModes.PostProcess) {
            console.log("Incompatible material mode");
            return null;
        }
        return this._createEffectForPostProcess(null, camera, options, samplingMode, engine, reusable, textureType, textureFormat);
    };
    /**
     * Create the post process effect from the material
     * @param postProcess The post process to create the effect for
     */
    NodeMaterial.prototype.createEffectForPostProcess = function (postProcess) {
        this._createEffectForPostProcess(postProcess);
    };
    NodeMaterial.prototype._createEffectForPostProcess = function (postProcess, camera, options, samplingMode, engine, reusable, textureType, textureFormat) {
        var _this = this;
        if (options === void 0) { options = 1; }
        if (samplingMode === void 0) { samplingMode = 1; }
        if (textureType === void 0) { textureType = 0; }
        if (textureFormat === void 0) { textureFormat = 5; }
        var tempName = this.name + this._buildId;
        var defines = new NodeMaterialDefines();
        var dummyMesh = new AbstractMesh(tempName + "PostProcess", this.getScene());
        var buildId = this._buildId;
        this._processDefines(dummyMesh, defines);
        Effect.RegisterShader(tempName, this._fragmentCompilationState._builtCompilationString, this._vertexCompilationState._builtCompilationString);
        if (!postProcess) {
            postProcess = new PostProcess(this.name + "PostProcess", tempName, this._fragmentCompilationState.uniforms, this._fragmentCompilationState.samplers, options, camera, samplingMode, engine, reusable, defines.toString(), textureType, tempName, { maxSimultaneousLights: this.maxSimultaneousLights }, false, textureFormat);
        }
        else {
            postProcess.updateEffect(defines.toString(), this._fragmentCompilationState.uniforms, this._fragmentCompilationState.samplers, { maxSimultaneousLights: this.maxSimultaneousLights }, undefined, undefined, tempName, tempName);
        }
        postProcess.nodeMaterialSource = this;
        postProcess.onApplyObservable.add(function (effect) {
            if (buildId !== _this._buildId) {
                delete Effect.ShadersStore[tempName + "VertexShader"];
                delete Effect.ShadersStore[tempName + "PixelShader"];
                tempName = _this.name + _this._buildId;
                defines.markAllAsDirty();
                buildId = _this._buildId;
            }
            var result = _this._processDefines(dummyMesh, defines);
            if (result) {
                Effect.RegisterShader(tempName, _this._fragmentCompilationState._builtCompilationString, _this._vertexCompilationState._builtCompilationString);
                TimingTools.SetImmediate(function () {
                    return postProcess.updateEffect(defines.toString(), _this._fragmentCompilationState.uniforms, _this._fragmentCompilationState.samplers, { maxSimultaneousLights: _this.maxSimultaneousLights }, undefined, undefined, tempName, tempName);
                });
            }
            _this._checkInternals(effect);
        });
        return postProcess;
    };
    /**
     * Create a new procedural texture based on this node material
     * @param size defines the size of the texture
     * @param scene defines the hosting scene
     * @returns the new procedural texture attached to this node material
     */
    NodeMaterial.prototype.createProceduralTexture = function (size, scene) {
        var _this = this;
        if (this.mode !== NodeMaterialModes.ProceduralTexture) {
            console.log("Incompatible material mode");
            return null;
        }
        var tempName = this.name + this._buildId;
        var proceduralTexture = new ProceduralTexture(tempName, size, null, scene);
        var dummyMesh = new AbstractMesh(tempName + "Procedural", this.getScene());
        dummyMesh.reservedDataStore = {
            hidden: true,
        };
        var defines = new NodeMaterialDefines();
        var result = this._processDefines(dummyMesh, defines);
        Effect.RegisterShader(tempName, this._fragmentCompilationState._builtCompilationString, this._vertexCompilationState._builtCompilationString);
        var effect = this.getScene().getEngine().createEffect({
            vertexElement: tempName,
            fragmentElement: tempName,
        }, [VertexBuffer.PositionKind], this._fragmentCompilationState.uniforms, this._fragmentCompilationState.samplers, defines.toString(), result === null || result === void 0 ? void 0 : result.fallbacks, undefined);
        proceduralTexture.nodeMaterialSource = this;
        proceduralTexture._setEffect(effect);
        var buildId = this._buildId;
        proceduralTexture.onBeforeGenerationObservable.add(function () {
            if (buildId !== _this._buildId) {
                delete Effect.ShadersStore[tempName + "VertexShader"];
                delete Effect.ShadersStore[tempName + "PixelShader"];
                tempName = _this.name + _this._buildId;
                defines.markAllAsDirty();
                buildId = _this._buildId;
            }
            var result = _this._processDefines(dummyMesh, defines);
            if (result) {
                Effect.RegisterShader(tempName, _this._fragmentCompilationState._builtCompilationString, _this._vertexCompilationState._builtCompilationString);
                TimingTools.SetImmediate(function () {
                    effect = _this.getScene().getEngine().createEffect({
                        vertexElement: tempName,
                        fragmentElement: tempName,
                    }, [VertexBuffer.PositionKind], _this._fragmentCompilationState.uniforms, _this._fragmentCompilationState.samplers, defines.toString(), result === null || result === void 0 ? void 0 : result.fallbacks, undefined);
                    proceduralTexture._setEffect(effect);
                });
            }
            _this._checkInternals(effect);
        });
        return proceduralTexture;
    };
    NodeMaterial.prototype._createEffectForParticles = function (particleSystem, blendMode, onCompiled, onError, effect, defines, dummyMesh, particleSystemDefinesJoined) {
        var _this = this;
        if (particleSystemDefinesJoined === void 0) { particleSystemDefinesJoined = ""; }
        var tempName = this.name + this._buildId + "_" + blendMode;
        if (!defines) {
            defines = new NodeMaterialDefines();
        }
        if (!dummyMesh) {
            dummyMesh = this.getScene().getMeshByName(this.name + "Particle");
            if (!dummyMesh) {
                dummyMesh = new AbstractMesh(this.name + "Particle", this.getScene());
                dummyMesh.reservedDataStore = {
                    hidden: true,
                };
            }
        }
        var buildId = this._buildId;
        var particleSystemDefines = [];
        var join = particleSystemDefinesJoined;
        if (!effect) {
            var result = this._processDefines(dummyMesh, defines);
            Effect.RegisterShader(tempName, this._fragmentCompilationState._builtCompilationString);
            particleSystem.fillDefines(particleSystemDefines, blendMode);
            join = particleSystemDefines.join("\n");
            effect = this.getScene()
                .getEngine()
                .createEffectForParticles(tempName, this._fragmentCompilationState.uniforms, this._fragmentCompilationState.samplers, defines.toString() + "\n" + join, result === null || result === void 0 ? void 0 : result.fallbacks, onCompiled, onError, particleSystem);
            particleSystem.setCustomEffect(effect, blendMode);
        }
        effect.onBindObservable.add(function (effect) {
            if (buildId !== _this._buildId) {
                delete Effect.ShadersStore[tempName + "PixelShader"];
                tempName = _this.name + _this._buildId + "_" + blendMode;
                defines.markAllAsDirty();
                buildId = _this._buildId;
            }
            particleSystemDefines.length = 0;
            particleSystem.fillDefines(particleSystemDefines, blendMode);
            var particleSystemDefinesJoinedCurrent = particleSystemDefines.join("\n");
            if (particleSystemDefinesJoinedCurrent !== join) {
                defines.markAllAsDirty();
                join = particleSystemDefinesJoinedCurrent;
            }
            var result = _this._processDefines(dummyMesh, defines);
            if (result) {
                Effect.RegisterShader(tempName, _this._fragmentCompilationState._builtCompilationString);
                effect = _this.getScene()
                    .getEngine()
                    .createEffectForParticles(tempName, _this._fragmentCompilationState.uniforms, _this._fragmentCompilationState.samplers, defines.toString() + "\n" + join, result === null || result === void 0 ? void 0 : result.fallbacks, onCompiled, onError, particleSystem);
                particleSystem.setCustomEffect(effect, blendMode);
                _this._createEffectForParticles(particleSystem, blendMode, onCompiled, onError, effect, defines, dummyMesh, particleSystemDefinesJoined); // add the effect.onBindObservable observer
                return;
            }
            _this._checkInternals(effect);
        });
    };
    NodeMaterial.prototype._checkInternals = function (effect) {
        // Animated blocks
        if (this._sharedData.animatedInputs) {
            var scene = this.getScene();
            var frameId = scene.getFrameId();
            if (this._animationFrame !== frameId) {
                for (var _i = 0, _a = this._sharedData.animatedInputs; _i < _a.length; _i++) {
                    var input = _a[_i];
                    input.animate(scene);
                }
                this._animationFrame = frameId;
            }
        }
        // Bindable blocks
        for (var _b = 0, _c = this._sharedData.bindableBlocks; _b < _c.length; _b++) {
            var block = _c[_b];
            block.bind(effect, this);
        }
        // Connection points
        for (var _d = 0, _e = this._sharedData.inputBlocks; _d < _e.length; _d++) {
            var inputBlock = _e[_d];
            inputBlock._transmit(effect, this.getScene(), this);
        }
    };
    /**
     * Create the effect to be used as the custom effect for a particle system
     * @param particleSystem Particle system to create the effect for
     * @param onCompiled defines a function to call when the effect creation is successful
     * @param onError defines a function to call when the effect creation has failed
     */
    NodeMaterial.prototype.createEffectForParticles = function (particleSystem, onCompiled, onError) {
        if (this.mode !== NodeMaterialModes.Particle) {
            console.log("Incompatible material mode");
            return;
        }
        this._createEffectForParticles(particleSystem, BaseParticleSystem.BLENDMODE_ONEONE, onCompiled, onError);
        this._createEffectForParticles(particleSystem, BaseParticleSystem.BLENDMODE_MULTIPLY, onCompiled, onError);
    };
    NodeMaterial.prototype._processDefines = function (mesh, defines, useInstances, subMesh) {
        var _this = this;
        if (useInstances === void 0) { useInstances = false; }
        var result = null;
        // Shared defines
        this._sharedData.blocksWithDefines.forEach(function (b) {
            b.initializeDefines(mesh, _this, defines, useInstances);
        });
        this._sharedData.blocksWithDefines.forEach(function (b) {
            b.prepareDefines(mesh, _this, defines, useInstances, subMesh);
        });
        // Need to recompile?
        if (defines.isDirty) {
            var lightDisposed = defines._areLightsDisposed;
            defines.markAsProcessed();
            // Repeatable content generators
            this._vertexCompilationState.compilationString = this._vertexCompilationState._builtCompilationString;
            this._fragmentCompilationState.compilationString = this._fragmentCompilationState._builtCompilationString;
            this._sharedData.repeatableContentBlocks.forEach(function (b) {
                b.replaceRepeatableContent(_this._vertexCompilationState, _this._fragmentCompilationState, mesh, defines);
            });
            // Uniforms
            var uniformBuffers_1 = [];
            this._sharedData.dynamicUniformBlocks.forEach(function (b) {
                b.updateUniformsAndSamples(_this._vertexCompilationState, _this, defines, uniformBuffers_1);
            });
            var mergedUniforms_1 = this._vertexCompilationState.uniforms;
            this._fragmentCompilationState.uniforms.forEach(function (u) {
                var index = mergedUniforms_1.indexOf(u);
                if (index === -1) {
                    mergedUniforms_1.push(u);
                }
            });
            // Samplers
            var mergedSamplers_1 = this._vertexCompilationState.samplers;
            this._fragmentCompilationState.samplers.forEach(function (s) {
                var index = mergedSamplers_1.indexOf(s);
                if (index === -1) {
                    mergedSamplers_1.push(s);
                }
            });
            var fallbacks_1 = new EffectFallbacks();
            this._sharedData.blocksWithFallbacks.forEach(function (b) {
                b.provideFallbacks(mesh, fallbacks_1);
            });
            result = {
                lightDisposed: lightDisposed,
                uniformBuffers: uniformBuffers_1,
                mergedUniforms: mergedUniforms_1,
                mergedSamplers: mergedSamplers_1,
                fallbacks: fallbacks_1,
            };
        }
        return result;
    };
    /**
     * Get if the submesh is ready to be used and all its information available.
     * Child classes can use it to update shaders
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    NodeMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        var _this = this;
        if (useInstances === void 0) { useInstances = false; }
        if (!this._buildWasSuccessful) {
            return false;
        }
        var scene = this.getScene();
        if (this._sharedData.animatedInputs) {
            var frameId = scene.getFrameId();
            if (this._animationFrame !== frameId) {
                for (var _i = 0, _a = this._sharedData.animatedInputs; _i < _a.length; _i++) {
                    var input = _a[_i];
                    input.animate(scene);
                }
                this._animationFrame = frameId;
            }
        }
        if (subMesh.effect && this.isFrozen) {
            if (subMesh.effect._wasPreviouslyReady) {
                return true;
            }
        }
        if (!subMesh.materialDefines) {
            subMesh.materialDefines = new NodeMaterialDefines();
        }
        var defines = subMesh.materialDefines;
        if (this._isReadyForSubMesh(subMesh)) {
            return true;
        }
        var engine = scene.getEngine();
        this._prepareDefinesForAttributes(mesh, defines);
        // Check if blocks are ready
        if (this._sharedData.blockingBlocks.some(function (b) { return !b.isReady(mesh, _this, defines, useInstances); })) {
            return false;
        }
        var result = this._processDefines(mesh, defines, useInstances, subMesh);
        if (result) {
            var previousEffect = subMesh.effect;
            // Compilation
            var join = defines.toString();
            var effect = engine.createEffect({
                vertex: "nodeMaterial" + this._buildId,
                fragment: "nodeMaterial" + this._buildId,
                vertexSource: this._vertexCompilationState.compilationString,
                fragmentSource: this._fragmentCompilationState.compilationString,
            }, {
                attributes: this._vertexCompilationState.attributes,
                uniformsNames: result.mergedUniforms,
                uniformBuffersNames: result.uniformBuffers,
                samplers: result.mergedSamplers,
                defines: join,
                fallbacks: result.fallbacks,
                onCompiled: this.onCompiled,
                onError: this.onError,
                indexParameters: { maxSimultaneousLights: this.maxSimultaneousLights, maxSimultaneousMorphTargets: defines.NUM_MORPH_INFLUENCERS },
            }, engine);
            if (effect) {
                if (this._onEffectCreatedObservable) {
                    onCreatedEffectParameters.effect = effect;
                    onCreatedEffectParameters.subMesh = subMesh;
                    this._onEffectCreatedObservable.notifyObservers(onCreatedEffectParameters);
                }
                // Use previous effect while new one is compiling
                if (this.allowShaderHotSwapping && previousEffect && !effect.isReady()) {
                    effect = previousEffect;
                    defines.markAsUnprocessed();
                    if (result.lightDisposed) {
                        // re register in case it takes more than one frame.
                        defines._areLightsDisposed = true;
                        return false;
                    }
                }
                else {
                    scene.resetCachedMaterial();
                    subMesh.setEffect(effect, defines, this._materialContext);
                }
            }
        }
        if (!subMesh.effect || !subMesh.effect.isReady()) {
            return false;
        }
        defines._renderId = scene.getRenderId();
        subMesh.effect._wasPreviouslyReady = true;
        return true;
    };
    Object.defineProperty(NodeMaterial.prototype, "compiledShaders", {
        /**
         * Get a string representing the shaders built by the current node graph
         */
        get: function () {
            return "// Vertex shader\r\n".concat(this._vertexCompilationState.compilationString, "\r\n\r\n// Fragment shader\r\n").concat(this._fragmentCompilationState.compilationString);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Binds the world matrix to the material
     * @param world defines the world transformation matrix
     */
    NodeMaterial.prototype.bindOnlyWorldMatrix = function (world) {
        var scene = this.getScene();
        if (!this._activeEffect) {
            return;
        }
        var hints = this._sharedData.hints;
        if (hints.needWorldViewMatrix) {
            world.multiplyToRef(scene.getViewMatrix(), this._cachedWorldViewMatrix);
        }
        if (hints.needWorldViewProjectionMatrix) {
            world.multiplyToRef(scene.getTransformMatrix(), this._cachedWorldViewProjectionMatrix);
        }
        // Connection points
        for (var _i = 0, _a = this._sharedData.inputBlocks; _i < _a.length; _i++) {
            var inputBlock = _a[_i];
            inputBlock._transmitWorld(this._activeEffect, world, this._cachedWorldViewMatrix, this._cachedWorldViewProjectionMatrix);
        }
    };
    /**
     * Binds the submesh to this material by preparing the effect and shader to draw
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh containing the submesh
     * @param subMesh defines the submesh to bind the material to
     */
    NodeMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var scene = this.getScene();
        var effect = subMesh.effect;
        if (!effect) {
            return;
        }
        this._activeEffect = effect;
        // Matrices
        this.bindOnlyWorldMatrix(world);
        var mustRebind = this._mustRebind(scene, effect, mesh.visibility);
        var sharedData = this._sharedData;
        if (mustRebind) {
            // Bindable blocks
            for (var _i = 0, _a = sharedData.bindableBlocks; _i < _a.length; _i++) {
                var block = _a[_i];
                block.bind(effect, this, mesh, subMesh);
            }
            for (var _b = 0, _c = sharedData.forcedBindableBlocks; _b < _c.length; _b++) {
                var block = _c[_b];
                block.bind(effect, this, mesh, subMesh);
            }
            // Connection points
            for (var _d = 0, _e = sharedData.inputBlocks; _d < _e.length; _d++) {
                var inputBlock = _e[_d];
                inputBlock._transmit(effect, scene, this);
            }
        }
        else if (!this.isFrozen) {
            for (var _f = 0, _g = sharedData.forcedBindableBlocks; _f < _g.length; _f++) {
                var block = _g[_f];
                block.bind(effect, this, mesh, subMesh);
            }
        }
        this._afterBind(mesh, this._activeEffect);
    };
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    NodeMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        if (this._sharedData) {
            activeTextures.push.apply(activeTextures, this._sharedData.textureBlocks.filter(function (tb) { return tb.texture; }).map(function (tb) { return tb.texture; }));
        }
        return activeTextures;
    };
    /**
     * Gets the list of texture blocks
     * @returns an array of texture blocks
     */
    NodeMaterial.prototype.getTextureBlocks = function () {
        if (!this._sharedData) {
            return [];
        }
        return this._sharedData.textureBlocks;
    };
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    NodeMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        if (!this._sharedData) {
            return false;
        }
        for (var _i = 0, _a = this._sharedData.textureBlocks; _i < _a.length; _i++) {
            var t = _a[_i];
            if (t.texture === texture) {
                return true;
            }
        }
        return false;
    };
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     * @param notBoundToMesh specifies if the material that is being disposed is known to be not bound to any mesh
     */
    NodeMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures, notBoundToMesh) {
        if (forceDisposeTextures) {
            for (var _i = 0, _a = this.getTextureBlocks()
                .filter(function (tb) { return tb.texture; })
                .map(function (tb) { return tb.texture; }); _i < _a.length; _i++) {
                var texture = _a[_i];
                texture.dispose();
            }
        }
        for (var _b = 0, _c = this.attachedBlocks; _b < _c.length; _b++) {
            var block = _c[_b];
            block.dispose();
        }
        this.attachedBlocks = [];
        this._sharedData = null;
        this._vertexCompilationState = null;
        this._fragmentCompilationState = null;
        this.onBuildObservable.clear();
        if (this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
            this._imageProcessingObserver = null;
        }
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures, notBoundToMesh);
    };
    /** Creates the node editor window. */
    NodeMaterial.prototype._createNodeEditor = function () {
        this.BJSNODEMATERIALEDITOR.NodeEditor.Show({
            nodeMaterial: this,
        });
    };
    /**
     * Launch the node material editor
     * @param config Define the configuration of the editor
     * @return a promise fulfilled when the node editor is visible
     */
    NodeMaterial.prototype.edit = function (config) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.BJSNODEMATERIALEDITOR = _this.BJSNODEMATERIALEDITOR || _this._getGlobalNodeMaterialEditor();
            if (typeof _this.BJSNODEMATERIALEDITOR == "undefined") {
                var editorUrl = config && config.editorURL ? config.editorURL : NodeMaterial.EditorURL;
                // Load editor and add it to the DOM
                Tools.LoadScript(editorUrl, function () {
                    _this.BJSNODEMATERIALEDITOR = _this.BJSNODEMATERIALEDITOR || _this._getGlobalNodeMaterialEditor();
                    _this._createNodeEditor();
                    resolve();
                });
            }
            else {
                // Otherwise creates the editor
                _this._createNodeEditor();
                resolve();
            }
        });
    };
    /**
     * Clear the current material
     */
    NodeMaterial.prototype.clear = function () {
        this._vertexOutputNodes = [];
        this._fragmentOutputNodes = [];
        this.attachedBlocks = [];
    };
    /**
     * Clear the current material and set it to a default state
     */
    NodeMaterial.prototype.setToDefault = function () {
        this.clear();
        this.editorData = null;
        var positionInput = new InputBlock("Position");
        positionInput.setAsAttribute("position");
        var worldInput = new InputBlock("World");
        worldInput.setAsSystemValue(NodeMaterialSystemValues.World);
        var worldPos = new TransformBlock("WorldPos");
        positionInput.connectTo(worldPos);
        worldInput.connectTo(worldPos);
        var viewProjectionInput = new InputBlock("ViewProjection");
        viewProjectionInput.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);
        var worldPosdMultipliedByViewProjection = new TransformBlock("WorldPos * ViewProjectionTransform");
        worldPos.connectTo(worldPosdMultipliedByViewProjection);
        viewProjectionInput.connectTo(worldPosdMultipliedByViewProjection);
        var vertexOutput = new VertexOutputBlock("VertexOutput");
        worldPosdMultipliedByViewProjection.connectTo(vertexOutput);
        // Pixel
        var pixelColor = new InputBlock("color");
        pixelColor.value = new Color4(0.8, 0.8, 0.8, 1);
        var fragmentOutput = new FragmentOutputBlock("FragmentOutput");
        pixelColor.connectTo(fragmentOutput);
        // Add to nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this._mode = NodeMaterialModes.Material;
    };
    /**
     * Clear the current material and set it to a default state for post process
     */
    NodeMaterial.prototype.setToDefaultPostProcess = function () {
        this.clear();
        this.editorData = null;
        var position = new InputBlock("Position");
        position.setAsAttribute("position2d");
        var const1 = new InputBlock("Constant1");
        const1.isConstant = true;
        const1.value = 1;
        var vmerger = new VectorMergerBlock("Position3D");
        position.connectTo(vmerger);
        const1.connectTo(vmerger, { input: "w" });
        var vertexOutput = new VertexOutputBlock("VertexOutput");
        vmerger.connectTo(vertexOutput);
        // Pixel
        var scale = new InputBlock("Scale");
        scale.visibleInInspector = true;
        scale.value = new Vector2(1, 1);
        var uv0 = new RemapBlock("uv0");
        position.connectTo(uv0);
        var uv = new MultiplyBlock("UV scale");
        uv0.connectTo(uv);
        scale.connectTo(uv);
        var currentScreen = new CurrentScreenBlock("CurrentScreen");
        uv.connectTo(currentScreen);
        currentScreen.texture = new Texture("https://assets.babylonjs.com/nme/currentScreenPostProcess.png", this.getScene());
        var fragmentOutput = new FragmentOutputBlock("FragmentOutput");
        currentScreen.connectTo(fragmentOutput, { output: "rgba" });
        // Add to nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this._mode = NodeMaterialModes.PostProcess;
    };
    /**
     * Clear the current material and set it to a default state for procedural texture
     */
    NodeMaterial.prototype.setToDefaultProceduralTexture = function () {
        this.clear();
        this.editorData = null;
        var position = new InputBlock("Position");
        position.setAsAttribute("position2d");
        var const1 = new InputBlock("Constant1");
        const1.isConstant = true;
        const1.value = 1;
        var vmerger = new VectorMergerBlock("Position3D");
        position.connectTo(vmerger);
        const1.connectTo(vmerger, { input: "w" });
        var vertexOutput = new VertexOutputBlock("VertexOutput");
        vmerger.connectTo(vertexOutput);
        // Pixel
        var time = new InputBlock("Time");
        time.value = 0;
        time.min = 0;
        time.max = 0;
        time.isBoolean = false;
        time.matrixMode = 0;
        time.animationType = AnimatedInputBlockTypes.Time;
        time.isConstant = false;
        var color = new InputBlock("Color3");
        color.value = new Color3(1, 1, 1);
        color.isConstant = false;
        var fragmentOutput = new FragmentOutputBlock("FragmentOutput");
        var vectorMerger = new VectorMergerBlock("VectorMerger");
        vectorMerger.visibleInInspector = false;
        var cos = new TrigonometryBlock("Cos");
        cos.operation = TrigonometryBlockOperations.Cos;
        position.connectTo(vectorMerger);
        time.output.connectTo(cos.input);
        cos.output.connectTo(vectorMerger.z);
        vectorMerger.xyzOut.connectTo(fragmentOutput.rgb);
        // Add to nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this._mode = NodeMaterialModes.ProceduralTexture;
    };
    /**
     * Clear the current material and set it to a default state for particle
     */
    NodeMaterial.prototype.setToDefaultParticle = function () {
        this.clear();
        this.editorData = null;
        // Pixel
        var uv = new InputBlock("uv");
        uv.setAsAttribute("particle_uv");
        var texture = new ParticleTextureBlock("ParticleTexture");
        uv.connectTo(texture);
        var color = new InputBlock("Color");
        color.setAsAttribute("particle_color");
        var multiply = new MultiplyBlock("Texture * Color");
        texture.connectTo(multiply);
        color.connectTo(multiply);
        var rampGradient = new ParticleRampGradientBlock("ParticleRampGradient");
        multiply.connectTo(rampGradient);
        var cSplitter = new ColorSplitterBlock("ColorSplitter");
        color.connectTo(cSplitter);
        var blendMultiply = new ParticleBlendMultiplyBlock("ParticleBlendMultiply");
        rampGradient.connectTo(blendMultiply);
        texture.connectTo(blendMultiply, { output: "a" });
        cSplitter.connectTo(blendMultiply, { output: "a" });
        var fragmentOutput = new FragmentOutputBlock("FragmentOutput");
        blendMultiply.connectTo(fragmentOutput);
        // Add to nodes
        this.addOutputNode(fragmentOutput);
        this._mode = NodeMaterialModes.Particle;
    };
    /**
     * Loads the current Node Material from a url pointing to a file save by the Node Material Editor
     * @param url defines the url to load from
     * @param rootUrl defines the root URL for nested url in the node material
     * @returns a promise that will fulfil when the material is fully loaded
     */
    NodeMaterial.prototype.loadAsync = function (url, rootUrl) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        return this.getScene()
            ._loadFileAsync(url)
            .then(function (data) {
            var serializationObject = JSON.parse(data);
            _this.loadFromSerialization(serializationObject, rootUrl);
        });
    };
    NodeMaterial.prototype._gatherBlocks = function (rootNode, list) {
        if (list.indexOf(rootNode) !== -1) {
            return;
        }
        list.push(rootNode);
        for (var _i = 0, _a = rootNode.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var connectedPoint = input.connectedPoint;
            if (connectedPoint) {
                var block = connectedPoint.ownerBlock;
                if (block !== rootNode) {
                    this._gatherBlocks(block, list);
                }
            }
        }
    };
    /**
     * Generate a string containing the code declaration required to create an equivalent of this material
     * @returns a string
     */
    NodeMaterial.prototype.generateCode = function () {
        var alreadyDumped = [];
        var vertexBlocks = [];
        var uniqueNames = ["const", "var", "let"];
        // Gets active blocks
        for (var _i = 0, _a = this._vertexOutputNodes; _i < _a.length; _i++) {
            var outputNode = _a[_i];
            this._gatherBlocks(outputNode, vertexBlocks);
        }
        var fragmentBlocks = [];
        for (var _b = 0, _c = this._fragmentOutputNodes; _b < _c.length; _b++) {
            var outputNode = _c[_b];
            this._gatherBlocks(outputNode, fragmentBlocks);
        }
        // Generate vertex shader
        var codeString = "var nodeMaterial = new BABYLON.NodeMaterial(\"".concat(this.name || "node material", "\");\r\n");
        for (var _d = 0, vertexBlocks_1 = vertexBlocks; _d < vertexBlocks_1.length; _d++) {
            var node = vertexBlocks_1[_d];
            if (node.isInput && alreadyDumped.indexOf(node) === -1) {
                codeString += node._dumpCode(uniqueNames, alreadyDumped);
            }
        }
        // Generate fragment shader
        for (var _e = 0, fragmentBlocks_1 = fragmentBlocks; _e < fragmentBlocks_1.length; _e++) {
            var node = fragmentBlocks_1[_e];
            if (node.isInput && alreadyDumped.indexOf(node) === -1) {
                codeString += node._dumpCode(uniqueNames, alreadyDumped);
            }
        }
        // Connections
        alreadyDumped = [];
        codeString += "\r\n// Connections\r\n";
        for (var _f = 0, _g = this._vertexOutputNodes; _f < _g.length; _f++) {
            var node = _g[_f];
            codeString += node._dumpCodeForOutputConnections(alreadyDumped);
        }
        for (var _h = 0, _j = this._fragmentOutputNodes; _h < _j.length; _h++) {
            var node = _j[_h];
            codeString += node._dumpCodeForOutputConnections(alreadyDumped);
        }
        // Output nodes
        codeString += "\r\n// Output nodes\r\n";
        for (var _k = 0, _l = this._vertexOutputNodes; _k < _l.length; _k++) {
            var node = _l[_k];
            codeString += "nodeMaterial.addOutputNode(".concat(node._codeVariableName, ");\r\n");
        }
        for (var _m = 0, _o = this._fragmentOutputNodes; _m < _o.length; _m++) {
            var node = _o[_m];
            codeString += "nodeMaterial.addOutputNode(".concat(node._codeVariableName, ");\r\n");
        }
        codeString += "nodeMaterial.build();\r\n";
        return codeString;
    };
    /**
     * Serializes this material in a JSON representation
     * @param selectedBlocks
     * @returns the serialized material object
     */
    NodeMaterial.prototype.serialize = function (selectedBlocks) {
        var serializationObject = selectedBlocks ? {} : SerializationHelper.Serialize(this);
        serializationObject.editorData = JSON.parse(JSON.stringify(this.editorData)); // Copy
        var blocks = [];
        if (selectedBlocks) {
            blocks = selectedBlocks;
        }
        else {
            serializationObject.customType = "BABYLON.NodeMaterial";
            serializationObject.outputNodes = [];
            // Outputs
            for (var _i = 0, _a = this._vertexOutputNodes; _i < _a.length; _i++) {
                var outputNode = _a[_i];
                this._gatherBlocks(outputNode, blocks);
                serializationObject.outputNodes.push(outputNode.uniqueId);
            }
            for (var _b = 0, _c = this._fragmentOutputNodes; _b < _c.length; _b++) {
                var outputNode = _c[_b];
                this._gatherBlocks(outputNode, blocks);
                if (serializationObject.outputNodes.indexOf(outputNode.uniqueId) === -1) {
                    serializationObject.outputNodes.push(outputNode.uniqueId);
                }
            }
        }
        // Blocks
        serializationObject.blocks = [];
        for (var _d = 0, blocks_1 = blocks; _d < blocks_1.length; _d++) {
            var block = blocks_1[_d];
            serializationObject.blocks.push(block.serialize());
        }
        if (!selectedBlocks) {
            for (var _e = 0, _f = this.attachedBlocks; _e < _f.length; _e++) {
                var block = _f[_e];
                if (blocks.indexOf(block) !== -1) {
                    continue;
                }
                serializationObject.blocks.push(block.serialize());
            }
        }
        return serializationObject;
    };
    NodeMaterial.prototype._restoreConnections = function (block, source, map) {
        for (var _i = 0, _a = block.outputs; _i < _a.length; _i++) {
            var outputPoint = _a[_i];
            for (var _b = 0, _c = source.blocks; _b < _c.length; _b++) {
                var candidate = _c[_b];
                var target = map[candidate.id];
                if (!target) {
                    continue;
                }
                for (var _d = 0, _e = candidate.inputs; _d < _e.length; _d++) {
                    var input = _e[_d];
                    if (map[input.targetBlockId] === block && input.targetConnectionName === outputPoint.name) {
                        var inputPoint = target.getInputByName(input.inputName);
                        if (!inputPoint || inputPoint.isConnected) {
                            continue;
                        }
                        outputPoint.connectTo(inputPoint, true);
                        this._restoreConnections(target, source, map);
                        continue;
                    }
                }
            }
        }
    };
    /**
     * Clear the current graph and load a new one from a serialization object
     * @param source defines the JSON representation of the material
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @param merge defines whether or not the source must be merged or replace the current content
     */
    NodeMaterial.prototype.loadFromSerialization = function (source, rootUrl, merge) {
        var _a;
        if (rootUrl === void 0) { rootUrl = ""; }
        if (merge === void 0) { merge = false; }
        if (!merge) {
            this.clear();
        }
        var map = {};
        // Create blocks
        for (var _i = 0, _b = source.blocks; _i < _b.length; _i++) {
            var parsedBlock = _b[_i];
            var blockType = GetClass(parsedBlock.customType);
            if (blockType) {
                var block = new blockType();
                block._deserialize(parsedBlock, this.getScene(), rootUrl);
                map[parsedBlock.id] = block;
                this.attachedBlocks.push(block);
            }
        }
        // Connections - Starts with input blocks only (except if in "merge" mode where we scan all blocks)
        for (var blockIndex = 0; blockIndex < source.blocks.length; blockIndex++) {
            var parsedBlock = source.blocks[blockIndex];
            var block = map[parsedBlock.id];
            if (!block) {
                continue;
            }
            if (block.inputs.length && !merge) {
                continue;
            }
            this._restoreConnections(block, source, map);
        }
        // Outputs
        if (source.outputNodes) {
            for (var _c = 0, _d = source.outputNodes; _c < _d.length; _c++) {
                var outputNodeId = _d[_c];
                this.addOutputNode(map[outputNodeId]);
            }
        }
        // UI related info
        if (source.locations || (source.editorData && source.editorData.locations)) {
            var locations = source.locations || source.editorData.locations;
            for (var _e = 0, locations_1 = locations; _e < locations_1.length; _e++) {
                var location_1 = locations_1[_e];
                if (map[location_1.blockId]) {
                    location_1.blockId = map[location_1.blockId].uniqueId;
                }
            }
            if (merge && this.editorData && this.editorData.locations) {
                locations.concat(this.editorData.locations);
            }
            if (source.locations) {
                this.editorData = {
                    locations: locations,
                };
            }
            else {
                this.editorData = source.editorData;
                this.editorData.locations = locations;
            }
            var blockMap = [];
            for (var key in map) {
                blockMap[key] = map[key].uniqueId;
            }
            this.editorData.map = blockMap;
        }
        this.comment = source.comment;
        if (source.forceAlphaBlending !== undefined) {
            this.forceAlphaBlending = source.forceAlphaBlending;
        }
        if (!merge) {
            this._mode = (_a = source.mode) !== null && _a !== void 0 ? _a : NodeMaterialModes.Material;
        }
    };
    /**
     * Makes a duplicate of the current material.
     * @param name defines the name to use for the new material
     * @param shareEffect defines if the clone material should share the same effect (default is false)
     */
    NodeMaterial.prototype.clone = function (name, shareEffect) {
        var _this = this;
        if (shareEffect === void 0) { shareEffect = false; }
        var serializationObject = this.serialize();
        var clone = SerializationHelper.Clone(function () { return new NodeMaterial(name, _this.getScene(), _this.options); }, this);
        clone.id = name;
        clone.name = name;
        clone.loadFromSerialization(serializationObject);
        clone._buildId = this._buildId;
        clone.build(false, !shareEffect);
        return clone;
    };
    /**
     * Creates a node material from parsed material data
     * @param source defines the JSON representation of the material
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new node material
     */
    NodeMaterial.Parse = function (source, scene, rootUrl) {
        if (rootUrl === void 0) { rootUrl = ""; }
        var nodeMaterial = SerializationHelper.Parse(function () { return new NodeMaterial(source.name, scene); }, source, scene, rootUrl);
        nodeMaterial.loadFromSerialization(source, rootUrl);
        nodeMaterial.build();
        return nodeMaterial;
    };
    /**
     * Creates a node material from a snippet saved in a remote file
     * @param name defines the name of the material to create
     * @param url defines the url to load from
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL for nested url in the node material
     * @returns a promise that will resolve to the new node material
     */
    NodeMaterial.ParseFromFileAsync = function (name, url, scene, rootUrl) {
        if (rootUrl === void 0) { rootUrl = ""; }
        var material = new NodeMaterial(name, scene);
        return new Promise(function (resolve, reject) {
            return material
                .loadAsync(url, rootUrl)
                .then(function () {
                material.build();
                resolve(material);
            })
                .catch(reject);
        });
    };
    /**
     * Creates a node material from a snippet saved by the node material editor
     * @param snippetId defines the snippet to load
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @param nodeMaterial defines a node material to update (instead of creating a new one)
     * @returns a promise that will resolve to the new node material
     */
    NodeMaterial.ParseFromSnippetAsync = function (snippetId, scene, rootUrl, nodeMaterial) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        if (snippetId === "_BLANK") {
            return Promise.resolve(this.CreateDefault("blank", scene));
        }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var snippet = JSON.parse(JSON.parse(request.responseText).jsonPayload);
                        var serializationObject = JSON.parse(snippet.nodeMaterial);
                        if (!nodeMaterial) {
                            nodeMaterial = SerializationHelper.Parse(function () { return new NodeMaterial(snippetId, scene); }, serializationObject, scene, rootUrl);
                            nodeMaterial.uniqueId = scene.getUniqueId();
                        }
                        nodeMaterial.loadFromSerialization(serializationObject);
                        nodeMaterial.snippetId = snippetId;
                        try {
                            nodeMaterial.build();
                            resolve(nodeMaterial);
                        }
                        catch (err) {
                            reject(err);
                        }
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
    /**
     * Creates a new node material set to default basic configuration
     * @param name defines the name of the material
     * @param scene defines the hosting scene
     * @returns a new NodeMaterial
     */
    NodeMaterial.CreateDefault = function (name, scene) {
        var newMaterial = new NodeMaterial(name, scene);
        newMaterial.setToDefault();
        newMaterial.build();
        return newMaterial;
    };
    NodeMaterial._BuildIdGenerator = 0;
    /** Define the Url to load node editor script */
    NodeMaterial.EditorURL = "https://unpkg.com/babylonjs-node-editor@".concat(Engine.Version, "/babylon.nodeEditor.js");
    /** Define the Url to load snippets */
    NodeMaterial.SnippetUrl = `https://snippet.babylonjs.com`;
    /** Gets or sets a boolean indicating that node materials should not deserialize textures from json / snippet content */
    NodeMaterial.IgnoreTexturesAtLoadTime = false;
    __decorate([
        serialize()
    ], NodeMaterial.prototype, "ignoreAlpha", void 0);
    __decorate([
        serialize()
    ], NodeMaterial.prototype, "maxSimultaneousLights", void 0);
    __decorate([
        serialize("mode")
    ], NodeMaterial.prototype, "_mode", void 0);
    __decorate([
        serialize("comment")
    ], NodeMaterial.prototype, "comment", void 0);
    __decorate([
        serialize()
    ], NodeMaterial.prototype, "forceAlphaBlending", void 0);
    return NodeMaterial;
}(PushMaterial));
export { NodeMaterial };
RegisterClass("BABYLON.NodeMaterial", NodeMaterial);
//# sourceMappingURL=nodeMaterial.js.map