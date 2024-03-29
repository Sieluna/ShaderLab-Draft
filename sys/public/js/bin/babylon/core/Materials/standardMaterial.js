import { __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { serialize, SerializationHelper, serializeAsColor3, expandToProperty, serializeAsFresnelParameters, serializeAsTexture } from "../Misc/decorators.js";
import { SmartArray } from "../Misc/smartArray.js";
import { Scene } from "../scene.js";
import { Matrix } from "../Maths/math.vector.js";
import { Color3 } from "../Maths/math.color.js";
import { VertexBuffer } from "../Buffers/buffer.js";
import { PrePassConfiguration } from "./prePassConfiguration.js";
import { ImageProcessingConfiguration } from "./imageProcessingConfiguration.js";
import { Material } from "../Materials/material.js";
import { MaterialPluginEvent } from "./materialPluginEvent.js";
import { MaterialDefines } from "../Materials/materialDefines.js";
import { PushMaterial } from "./pushMaterial.js";
import { MaterialHelper } from "./materialHelper.js";
import { Texture } from "../Materials/Textures/texture.js";
import { RegisterClass } from "../Misc/typeStore.js";
import { MaterialFlags } from "./materialFlags.js";
import "../Shaders/default.fragment.js";
import "../Shaders/default.vertex.js";

import { EffectFallbacks } from "./effectFallbacks.js";
import { DetailMapConfiguration } from "./material.detailMapConfiguration.js";
var onCreatedEffectParameters = { effect: null, subMesh: null };
/** @hidden */
var StandardMaterialDefines = /** @class */ (function (_super) {
    __extends(StandardMaterialDefines, _super);
    /**
     * Initializes the Standard Material defines.
     * @param externalProperties The external properties
     */
    function StandardMaterialDefines(externalProperties) {
        var _this = _super.call(this, externalProperties) || this;
        _this.MAINUV1 = false;
        _this.MAINUV2 = false;
        _this.MAINUV3 = false;
        _this.MAINUV4 = false;
        _this.MAINUV5 = false;
        _this.MAINUV6 = false;
        _this.DIFFUSE = false;
        _this.DIFFUSEDIRECTUV = 0;
        _this.BAKED_VERTEX_ANIMATION_TEXTURE = false;
        _this.AMBIENT = false;
        _this.AMBIENTDIRECTUV = 0;
        _this.OPACITY = false;
        _this.OPACITYDIRECTUV = 0;
        _this.OPACITYRGB = false;
        _this.REFLECTION = false;
        _this.EMISSIVE = false;
        _this.EMISSIVEDIRECTUV = 0;
        _this.SPECULAR = false;
        _this.SPECULARDIRECTUV = 0;
        _this.BUMP = false;
        _this.BUMPDIRECTUV = 0;
        _this.PARALLAX = false;
        _this.PARALLAXOCCLUSION = false;
        _this.SPECULAROVERALPHA = false;
        _this.CLIPPLANE = false;
        _this.CLIPPLANE2 = false;
        _this.CLIPPLANE3 = false;
        _this.CLIPPLANE4 = false;
        _this.CLIPPLANE5 = false;
        _this.CLIPPLANE6 = false;
        _this.ALPHATEST = false;
        _this.DEPTHPREPASS = false;
        _this.ALPHAFROMDIFFUSE = false;
        _this.POINTSIZE = false;
        _this.FOG = false;
        _this.SPECULARTERM = false;
        _this.DIFFUSEFRESNEL = false;
        _this.OPACITYFRESNEL = false;
        _this.REFLECTIONFRESNEL = false;
        _this.REFRACTIONFRESNEL = false;
        _this.EMISSIVEFRESNEL = false;
        _this.FRESNEL = false;
        _this.NORMAL = false;
        _this.TANGENT = false;
        _this.UV1 = false;
        _this.UV2 = false;
        _this.UV3 = false;
        _this.UV4 = false;
        _this.UV5 = false;
        _this.UV6 = false;
        _this.VERTEXCOLOR = false;
        _this.VERTEXALPHA = false;
        _this.NUM_BONE_INFLUENCERS = 0;
        _this.BonesPerMesh = 0;
        _this.BONETEXTURE = false;
        _this.BONES_VELOCITY_ENABLED = false;
        _this.INSTANCES = false;
        _this.THIN_INSTANCES = false;
        _this.INSTANCESCOLOR = false;
        _this.GLOSSINESS = false;
        _this.ROUGHNESS = false;
        _this.EMISSIVEASILLUMINATION = false;
        _this.LINKEMISSIVEWITHDIFFUSE = false;
        _this.REFLECTIONFRESNELFROMSPECULAR = false;
        _this.LIGHTMAP = false;
        _this.LIGHTMAPDIRECTUV = 0;
        _this.OBJECTSPACE_NORMALMAP = false;
        _this.USELIGHTMAPASSHADOWMAP = false;
        _this.REFLECTIONMAP_3D = false;
        _this.REFLECTIONMAP_SPHERICAL = false;
        _this.REFLECTIONMAP_PLANAR = false;
        _this.REFLECTIONMAP_CUBIC = false;
        _this.USE_LOCAL_REFLECTIONMAP_CUBIC = false;
        _this.USE_LOCAL_REFRACTIONMAP_CUBIC = false;
        _this.REFLECTIONMAP_PROJECTION = false;
        _this.REFLECTIONMAP_SKYBOX = false;
        _this.REFLECTIONMAP_EXPLICIT = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
        _this.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
        _this.REFLECTIONMAP_OPPOSITEZ = false;
        _this.INVERTCUBICMAP = false;
        _this.LOGARITHMICDEPTH = false;
        _this.REFRACTION = false;
        _this.REFRACTIONMAP_3D = false;
        _this.REFLECTIONOVERALPHA = false;
        _this.TWOSIDEDLIGHTING = false;
        _this.SHADOWFLOAT = false;
        _this.MORPHTARGETS = false;
        _this.MORPHTARGETS_NORMAL = false;
        _this.MORPHTARGETS_TANGENT = false;
        _this.MORPHTARGETS_UV = false;
        _this.NUM_MORPH_INFLUENCERS = 0;
        _this.MORPHTARGETS_TEXTURE = false;
        _this.NONUNIFORMSCALING = false; // https://playground.babylonjs.com#V6DWIH
        _this.PREMULTIPLYALPHA = false; // https://playground.babylonjs.com#LNVJJ7
        _this.ALPHATEST_AFTERALLALPHACOMPUTATIONS = false;
        _this.ALPHABLEND = true;
        _this.PREPASS = false;
        _this.PREPASS_IRRADIANCE = false;
        _this.PREPASS_IRRADIANCE_INDEX = -1;
        _this.PREPASS_ALBEDO_SQRT = false;
        _this.PREPASS_ALBEDO_SQRT_INDEX = -1;
        _this.PREPASS_DEPTH = false;
        _this.PREPASS_DEPTH_INDEX = -1;
        _this.PREPASS_NORMAL = false;
        _this.PREPASS_NORMAL_INDEX = -1;
        _this.PREPASS_POSITION = false;
        _this.PREPASS_POSITION_INDEX = -1;
        _this.PREPASS_VELOCITY = false;
        _this.PREPASS_VELOCITY_INDEX = -1;
        _this.PREPASS_REFLECTIVITY = false;
        _this.PREPASS_REFLECTIVITY_INDEX = -1;
        _this.SCENE_MRT_COUNT = 0;
        _this.RGBDLIGHTMAP = false;
        _this.RGBDREFLECTION = false;
        _this.RGBDREFRACTION = false;
        _this.IMAGEPROCESSING = false;
        _this.VIGNETTE = false;
        _this.VIGNETTEBLENDMODEMULTIPLY = false;
        _this.VIGNETTEBLENDMODEOPAQUE = false;
        _this.TONEMAPPING = false;
        _this.TONEMAPPING_ACES = false;
        _this.CONTRAST = false;
        _this.COLORCURVES = false;
        _this.COLORGRADING = false;
        _this.COLORGRADING3D = false;
        _this.SAMPLER3DGREENDEPTH = false;
        _this.SAMPLER3DBGRMAP = false;
        _this.IMAGEPROCESSINGPOSTPROCESS = false;
        _this.SKIPFINALCOLORCLAMP = false;
        _this.MULTIVIEW = false;
        _this.ORDER_INDEPENDENT_TRANSPARENCY = false;
        _this.ORDER_INDEPENDENT_TRANSPARENCY_16BITS = false;
        /**
         * If the reflection texture on this material is in linear color space
         * @hidden
         */
        _this.IS_REFLECTION_LINEAR = false;
        /**
         * If the refraction texture on this material is in linear color space
         * @hidden
         */
        _this.IS_REFRACTION_LINEAR = false;
        _this.EXPOSURE = false;
        _this.rebuild();
        return _this;
    }
    StandardMaterialDefines.prototype.setReflectionMode = function (modeToEnable) {
        var modes = [
            "REFLECTIONMAP_CUBIC",
            "REFLECTIONMAP_EXPLICIT",
            "REFLECTIONMAP_PLANAR",
            "REFLECTIONMAP_PROJECTION",
            "REFLECTIONMAP_PROJECTION",
            "REFLECTIONMAP_SKYBOX",
            "REFLECTIONMAP_SPHERICAL",
            "REFLECTIONMAP_EQUIRECTANGULAR",
            "REFLECTIONMAP_EQUIRECTANGULAR_FIXED",
            "REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED",
        ];
        for (var _i = 0, modes_1 = modes; _i < modes_1.length; _i++) {
            var mode = modes_1[_i];
            this[mode] = mode === modeToEnable;
        }
    };
    return StandardMaterialDefines;
}(MaterialDefines));
export { StandardMaterialDefines };
/**
 * This is the default material used in Babylon. It is the best trade off between quality
 * and performances.
 * @see https://doc.babylonjs.com/babylon101/materials
 */
var StandardMaterial = /** @class */ (function (_super) {
    __extends(StandardMaterial, _super);
    /**
     * Instantiates a new standard material.
     * This is the default material used in Babylon. It is the best trade off between quality
     * and performances.
     * @see https://doc.babylonjs.com/babylon101/materials
     * @param name Define the name of the material in the scene
     * @param scene Define the scene the material belong to
     */
    function StandardMaterial(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        _this._diffuseTexture = null;
        _this._ambientTexture = null;
        _this._opacityTexture = null;
        _this._reflectionTexture = null;
        _this._emissiveTexture = null;
        _this._specularTexture = null;
        _this._bumpTexture = null;
        _this._lightmapTexture = null;
        _this._refractionTexture = null;
        /**
         * The color of the material lit by the environmental background lighting.
         * @see https://doc.babylonjs.com/babylon101/materials#ambient-color-example
         */
        _this.ambientColor = new Color3(0, 0, 0);
        /**
         * The basic color of the material as viewed under a light.
         */
        _this.diffuseColor = new Color3(1, 1, 1);
        /**
         * Define how the color and intensity of the highlight given by the light in the material.
         */
        _this.specularColor = new Color3(1, 1, 1);
        /**
         * Define the color of the material as if self lit.
         * This will be mixed in the final result even in the absence of light.
         */
        _this.emissiveColor = new Color3(0, 0, 0);
        /**
         * Defines how sharp are the highlights in the material.
         * The bigger the value the sharper giving a more glossy feeling to the result.
         * Reversely, the smaller the value the blurrier giving a more rough feeling to the result.
         */
        _this.specularPower = 64;
        _this._useAlphaFromDiffuseTexture = false;
        _this._useEmissiveAsIllumination = false;
        _this._linkEmissiveWithDiffuse = false;
        _this._useSpecularOverAlpha = false;
        _this._useReflectionOverAlpha = false;
        _this._disableLighting = false;
        _this._useObjectSpaceNormalMap = false;
        _this._useParallax = false;
        _this._useParallaxOcclusion = false;
        /**
         * Apply a scaling factor that determine which "depth" the height map should reprensent. A value between 0.05 and 0.1 is reasonnable in Parallax, you can reach 0.2 using Parallax Occlusion.
         */
        _this.parallaxScaleBias = 0.05;
        _this._roughness = 0;
        /**
         * In case of refraction, define the value of the index of refraction.
         * @see https://doc.babylonjs.com/how_to/reflect#how-to-obtain-reflections-and-refractions
         */
        _this.indexOfRefraction = 0.98;
        /**
         * Invert the refraction texture alongside the y axis.
         * It can be useful with procedural textures or probe for instance.
         * @see https://doc.babylonjs.com/how_to/reflect#how-to-obtain-reflections-and-refractions
         */
        _this.invertRefractionY = true;
        /**
         * Defines the alpha limits in alpha test mode.
         */
        _this.alphaCutOff = 0.4;
        _this._useLightmapAsShadowmap = false;
        _this._useReflectionFresnelFromSpecular = false;
        _this._useGlossinessFromSpecularMapAlpha = false;
        _this._maxSimultaneousLights = 4;
        _this._invertNormalMapX = false;
        _this._invertNormalMapY = false;
        _this._twoSidedLighting = false;
        _this._renderTargets = new SmartArray(16);
        _this._worldViewProjectionMatrix = Matrix.Zero();
        _this._globalAmbientColor = new Color3(0, 0, 0);
        _this._cacheHasRenderTargetTextures = false;
        _this.detailMap = new DetailMapConfiguration(_this);
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        _this.prePassConfiguration = new PrePassConfiguration();
        _this.getRenderTargetTextures = function () {
            _this._renderTargets.reset();
            if (StandardMaterial.ReflectionTextureEnabled && _this._reflectionTexture && _this._reflectionTexture.isRenderTarget) {
                _this._renderTargets.push(_this._reflectionTexture);
            }
            if (StandardMaterial.RefractionTextureEnabled && _this._refractionTexture && _this._refractionTexture.isRenderTarget) {
                _this._renderTargets.push(_this._refractionTexture);
            }
            _this._eventInfo.renderTargets = _this._renderTargets;
            _this._callbackPluginEventFillRenderTargetTextures(_this._eventInfo);
            return _this._renderTargets;
        };
        return _this;
    }
    Object.defineProperty(StandardMaterial.prototype, "imageProcessingConfiguration", {
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
    /**
     * Attaches a new image processing configuration to the Standard Material.
     * @param configuration
     */
    StandardMaterial.prototype._attachImageProcessingConfiguration = function (configuration) {
        var _this = this;
        if (configuration === this._imageProcessingConfiguration) {
            return;
        }
        // Detaches observer
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        // Pick the scene configuration if needed
        if (!configuration) {
            this._imageProcessingConfiguration = this.getScene().imageProcessingConfiguration;
        }
        else {
            this._imageProcessingConfiguration = configuration;
        }
        // Attaches observer
        if (this._imageProcessingConfiguration) {
            this._imageProcessingObserver = this._imageProcessingConfiguration.onUpdateParameters.add(function () {
                _this._markAllSubMeshesAsImageProcessingDirty();
            });
        }
    };
    Object.defineProperty(StandardMaterial.prototype, "isPrePassCapable", {
        /**
         * Can this material render to prepass
         */
        get: function () {
            return !this.disableDepthWrite;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraColorCurvesEnabled", {
        /**
         * Gets whether the color curves effect is enabled.
         */
        get: function () {
            return this.imageProcessingConfiguration.colorCurvesEnabled;
        },
        /**
         * Sets whether the color curves effect is enabled.
         */
        set: function (value) {
            this.imageProcessingConfiguration.colorCurvesEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraColorGradingEnabled", {
        /**
         * Gets whether the color grading effect is enabled.
         */
        get: function () {
            return this.imageProcessingConfiguration.colorGradingEnabled;
        },
        /**
         * Gets whether the color grading effect is enabled.
         */
        set: function (value) {
            this.imageProcessingConfiguration.colorGradingEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraToneMappingEnabled", {
        /**
         * Gets whether tonemapping is enabled or not.
         */
        get: function () {
            return this._imageProcessingConfiguration.toneMappingEnabled;
        },
        /**
         * Sets whether tonemapping is enabled or not
         */
        set: function (value) {
            this._imageProcessingConfiguration.toneMappingEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraExposure", {
        /**
         * The camera exposure used on this material.
         * This property is here and not in the camera to allow controlling exposure without full screen post process.
         * This corresponds to a photographic exposure.
         */
        get: function () {
            return this._imageProcessingConfiguration.exposure;
        },
        /**
         * The camera exposure used on this material.
         * This property is here and not in the camera to allow controlling exposure without full screen post process.
         * This corresponds to a photographic exposure.
         */
        set: function (value) {
            this._imageProcessingConfiguration.exposure = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraContrast", {
        /**
         * Gets The camera contrast used on this material.
         */
        get: function () {
            return this._imageProcessingConfiguration.contrast;
        },
        /**
         * Sets The camera contrast used on this material.
         */
        set: function (value) {
            this._imageProcessingConfiguration.contrast = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraColorGradingTexture", {
        /**
         * Gets the Color Grading 2D Lookup Texture.
         */
        get: function () {
            return this._imageProcessingConfiguration.colorGradingTexture;
        },
        /**
         * Sets the Color Grading 2D Lookup Texture.
         */
        set: function (value) {
            this._imageProcessingConfiguration.colorGradingTexture = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "cameraColorCurves", {
        /**
         * The color grading curves provide additional color adjustmnent that is applied after any color grading transform (3D LUT).
         * They allow basic adjustment of saturation and small exposure adjustments, along with color filter tinting to provide white balance adjustment or more stylistic effects.
         * These are similar to controls found in many professional imaging or colorist software. The global controls are applied to the entire image. For advanced tuning, extra controls are provided to adjust the shadow, midtone and highlight areas of the image;
         * corresponding to low luminance, medium luminance, and high luminance areas respectively.
         */
        get: function () {
            return this._imageProcessingConfiguration.colorCurves;
        },
        /**
         * The color grading curves provide additional color adjustment that is applied after any color grading transform (3D LUT).
         * They allow basic adjustment of saturation and small exposure adjustments, along with color filter tinting to provide white balance adjustment or more stylistic effects.
         * These are similar to controls found in many professional imaging or colorist software. The global controls are applied to the entire image. For advanced tuning, extra controls are provided to adjust the shadow, midtone and highlight areas of the image;
         * corresponding to low luminance, medium luminance, and high luminance areas respectively.
         */
        set: function (value) {
            this._imageProcessingConfiguration.colorCurves = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "canRenderToMRT", {
        /**
         * Can this material render to several textures at once
         */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial.prototype, "hasRenderTargetTextures", {
        /**
         * Gets a boolean indicating that current material needs to register RTT
         */
        get: function () {
            if (StandardMaterial.ReflectionTextureEnabled && this._reflectionTexture && this._reflectionTexture.isRenderTarget) {
                return true;
            }
            if (StandardMaterial.RefractionTextureEnabled && this._refractionTexture && this._refractionTexture.isRenderTarget) {
                return true;
            }
            return this._cacheHasRenderTargetTextures;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the current class name of the material e.g. "StandardMaterial"
     * Mainly use in serialization.
     * @returns the class name
     */
    StandardMaterial.prototype.getClassName = function () {
        return "StandardMaterial";
    };
    Object.defineProperty(StandardMaterial.prototype, "useLogarithmicDepth", {
        /**
         * In case the depth buffer does not allow enough depth precision for your scene (might be the case in large scenes)
         * You can try switching to logarithmic depth.
         * @see https://doc.babylonjs.com/how_to/using_logarithmic_depth_buffer
         */
        get: function () {
            return this._useLogarithmicDepth;
        },
        set: function (value) {
            this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
            this._markAllSubMeshesAsMiscDirty();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Specifies if the material will require alpha blending
     * @returns a boolean specifying if alpha blending is needed
     */
    StandardMaterial.prototype.needAlphaBlending = function () {
        if (this._disableAlphaBlending) {
            return false;
        }
        return (this.alpha < 1.0 ||
            this._opacityTexture != null ||
            this._shouldUseAlphaFromDiffuseTexture() ||
            (this._opacityFresnelParameters && this._opacityFresnelParameters.isEnabled));
    };
    /**
     * Specifies if this material should be rendered in alpha test mode
     * @returns a boolean specifying if an alpha test is needed.
     */
    StandardMaterial.prototype.needAlphaTesting = function () {
        if (this._forceAlphaTest) {
            return true;
        }
        return this._hasAlphaChannel() && (this._transparencyMode == null || this._transparencyMode === Material.MATERIAL_ALPHATEST);
    };
    /**
     * Specifies whether or not the alpha value of the diffuse texture should be used for alpha blending.
     */
    StandardMaterial.prototype._shouldUseAlphaFromDiffuseTexture = function () {
        return this._diffuseTexture != null && this._diffuseTexture.hasAlpha && this._useAlphaFromDiffuseTexture && this._transparencyMode !== Material.MATERIAL_OPAQUE;
    };
    /**
     * Specifies whether or not there is a usable alpha channel for transparency.
     */
    StandardMaterial.prototype._hasAlphaChannel = function () {
        return (this._diffuseTexture != null && this._diffuseTexture.hasAlpha) || this._opacityTexture != null;
    };
    /**
     * Get the texture used for alpha test purpose.
     * @returns the diffuse texture in case of the standard material.
     */
    StandardMaterial.prototype.getAlphaTestTexture = function () {
        return this._diffuseTexture;
    };
    /**
     * Get if the submesh is ready to be used and all its information available.
     * Child classes can use it to update shaders
     * @param mesh defines the mesh to check
     * @param subMesh defines which submesh to check
     * @param useInstances specifies that instances should be used
     * @returns a boolean indicating that the submesh is ready or not
     */
    StandardMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
        if (useInstances === void 0) { useInstances = false; }
        if (!this._uniformBufferLayoutBuilt) {
            this.buildUniformLayout();
        }
        if (subMesh.effect && this.isFrozen) {
            if (subMesh.effect._wasPreviouslyReady) {
                return true;
            }
        }
        if (!subMesh.materialDefines) {
            this._callbackPluginEventGeneric(MaterialPluginEvent.GetDefineNames, this._eventInfo);
            subMesh.materialDefines = new StandardMaterialDefines(this._eventInfo.defineNames);
        }
        var scene = this.getScene();
        var defines = subMesh.materialDefines;
        if (this._isReadyForSubMesh(subMesh)) {
            return true;
        }
        var engine = scene.getEngine();
        // Lights
        defines._needNormals = MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
        // Multiview
        MaterialHelper.PrepareDefinesForMultiview(scene, defines);
        // PrePass
        var oit = this.needAlphaBlendingForMesh(mesh) && this.getScene().useOrderIndependentTransparency;
        MaterialHelper.PrepareDefinesForPrePass(scene, defines, this.canRenderToMRT && !oit);
        // Order independant transparency
        MaterialHelper.PrepareDefinesForOIT(scene, defines, oit);
        // Textures
        if (defines._areTexturesDirty) {
            this._eventInfo.hasRenderTargetTextures = false;
            this._callbackPluginEventHasRenderTargetTextures(this._eventInfo);
            this._cacheHasRenderTargetTextures = this._eventInfo.hasRenderTargetTextures;
            defines._needUVs = false;
            for (var i = 1; i <= 6; ++i) {
                defines["MAINUV" + i] = false;
            }
            if (scene.texturesEnabled) {
                if (this._diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                    if (!this._diffuseTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._diffuseTexture, defines, "DIFFUSE");
                    }
                }
                else {
                    defines.DIFFUSE = false;
                }
                if (this._ambientTexture && StandardMaterial.AmbientTextureEnabled) {
                    if (!this._ambientTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._ambientTexture, defines, "AMBIENT");
                    }
                }
                else {
                    defines.AMBIENT = false;
                }
                if (this._opacityTexture && StandardMaterial.OpacityTextureEnabled) {
                    if (!this._opacityTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._opacityTexture, defines, "OPACITY");
                        defines.OPACITYRGB = this._opacityTexture.getAlphaFromRGB;
                    }
                }
                else {
                    defines.OPACITY = false;
                }
                if (this._reflectionTexture && StandardMaterial.ReflectionTextureEnabled) {
                    if (!this._reflectionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        defines._needNormals = true;
                        defines.REFLECTION = true;
                        defines.ROUGHNESS = this._roughness > 0;
                        defines.REFLECTIONOVERALPHA = this._useReflectionOverAlpha;
                        defines.INVERTCUBICMAP = this._reflectionTexture.coordinatesMode === Texture.INVCUBIC_MODE;
                        defines.REFLECTIONMAP_3D = this._reflectionTexture.isCube;
                        defines.REFLECTIONMAP_OPPOSITEZ =
                            defines.REFLECTIONMAP_3D && this.getScene().useRightHandedSystem ? !this._reflectionTexture.invertZ : this._reflectionTexture.invertZ;
                        defines.RGBDREFLECTION = this._reflectionTexture.isRGBD;
                        switch (this._reflectionTexture.coordinatesMode) {
                            case Texture.EXPLICIT_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_EXPLICIT");
                                break;
                            case Texture.PLANAR_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_PLANAR");
                                break;
                            case Texture.PROJECTION_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_PROJECTION");
                                break;
                            case Texture.SKYBOX_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_SKYBOX");
                                break;
                            case Texture.SPHERICAL_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_SPHERICAL");
                                break;
                            case Texture.EQUIRECTANGULAR_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_EQUIRECTANGULAR");
                                break;
                            case Texture.FIXED_EQUIRECTANGULAR_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_EQUIRECTANGULAR_FIXED");
                                break;
                            case Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE:
                                defines.setReflectionMode("REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED");
                                break;
                            case Texture.CUBIC_MODE:
                            case Texture.INVCUBIC_MODE:
                            default:
                                defines.setReflectionMode("REFLECTIONMAP_CUBIC");
                                break;
                        }
                        defines.USE_LOCAL_REFLECTIONMAP_CUBIC = this._reflectionTexture.boundingBoxSize ? true : false;
                    }
                }
                else {
                    defines.REFLECTION = false;
                    defines.REFLECTIONMAP_OPPOSITEZ = false;
                }
                if (this._emissiveTexture && StandardMaterial.EmissiveTextureEnabled) {
                    if (!this._emissiveTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._emissiveTexture, defines, "EMISSIVE");
                    }
                }
                else {
                    defines.EMISSIVE = false;
                }
                if (this._lightmapTexture && StandardMaterial.LightmapTextureEnabled) {
                    if (!this._lightmapTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._lightmapTexture, defines, "LIGHTMAP");
                        defines.USELIGHTMAPASSHADOWMAP = this._useLightmapAsShadowmap;
                        defines.RGBDLIGHTMAP = this._lightmapTexture.isRGBD;
                    }
                }
                else {
                    defines.LIGHTMAP = false;
                }
                if (this._specularTexture && StandardMaterial.SpecularTextureEnabled) {
                    if (!this._specularTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._specularTexture, defines, "SPECULAR");
                        defines.GLOSSINESS = this._useGlossinessFromSpecularMapAlpha;
                    }
                }
                else {
                    defines.SPECULAR = false;
                }
                if (scene.getEngine().getCaps().standardDerivatives && this._bumpTexture && StandardMaterial.BumpTextureEnabled) {
                    // Bump texture can not be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                    else {
                        MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "BUMP");
                        defines.PARALLAX = this._useParallax;
                        defines.PARALLAXOCCLUSION = this._useParallaxOcclusion;
                    }
                    defines.OBJECTSPACE_NORMALMAP = this._useObjectSpaceNormalMap;
                }
                else {
                    defines.BUMP = false;
                }
                if (this._refractionTexture && StandardMaterial.RefractionTextureEnabled) {
                    if (!this._refractionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    else {
                        defines._needUVs = true;
                        defines.REFRACTION = true;
                        defines.REFRACTIONMAP_3D = this._refractionTexture.isCube;
                        defines.RGBDREFRACTION = this._refractionTexture.isRGBD;
                        defines.USE_LOCAL_REFRACTIONMAP_CUBIC = this._refractionTexture.boundingBoxSize ? true : false;
                    }
                }
                else {
                    defines.REFRACTION = false;
                }
                defines.TWOSIDEDLIGHTING = !this._backFaceCulling && this._twoSidedLighting;
            }
            else {
                defines.DIFFUSE = false;
                defines.AMBIENT = false;
                defines.OPACITY = false;
                defines.REFLECTION = false;
                defines.EMISSIVE = false;
                defines.LIGHTMAP = false;
                defines.BUMP = false;
                defines.REFRACTION = false;
            }
            defines.ALPHAFROMDIFFUSE = this._shouldUseAlphaFromDiffuseTexture();
            defines.EMISSIVEASILLUMINATION = this._useEmissiveAsIllumination;
            defines.LINKEMISSIVEWITHDIFFUSE = this._linkEmissiveWithDiffuse;
            defines.SPECULAROVERALPHA = this._useSpecularOverAlpha;
            defines.PREMULTIPLYALPHA = this.alphaMode === 7 || this.alphaMode === 8;
            defines.ALPHATEST_AFTERALLALPHACOMPUTATIONS = this.transparencyMode !== null;
            defines.ALPHABLEND = this.transparencyMode === null || this.needAlphaBlendingForMesh(mesh); // check on null for backward compatibility
        }
        this._eventInfo.isReadyForSubMesh = true;
        this._eventInfo.defines = defines;
        this._callbackPluginEventIsReadyForSubMesh(this._eventInfo);
        if (!this._eventInfo.isReadyForSubMesh) {
            return false;
        }
        if (defines._areImageProcessingDirty && this._imageProcessingConfiguration) {
            if (!this._imageProcessingConfiguration.isReady()) {
                return false;
            }
            this._imageProcessingConfiguration.prepareDefines(defines);
            defines.IS_REFLECTION_LINEAR = this.reflectionTexture != null && !this.reflectionTexture.gammaSpace;
            defines.IS_REFRACTION_LINEAR = this.refractionTexture != null && !this.refractionTexture.gammaSpace;
        }
        if (defines._areFresnelDirty) {
            if (StandardMaterial.FresnelEnabled) {
                // Fresnel
                if (this._diffuseFresnelParameters ||
                    this._opacityFresnelParameters ||
                    this._emissiveFresnelParameters ||
                    this._refractionFresnelParameters ||
                    this._reflectionFresnelParameters) {
                    defines.DIFFUSEFRESNEL = this._diffuseFresnelParameters && this._diffuseFresnelParameters.isEnabled;
                    defines.OPACITYFRESNEL = this._opacityFresnelParameters && this._opacityFresnelParameters.isEnabled;
                    defines.REFLECTIONFRESNEL = this._reflectionFresnelParameters && this._reflectionFresnelParameters.isEnabled;
                    defines.REFLECTIONFRESNELFROMSPECULAR = this._useReflectionFresnelFromSpecular;
                    defines.REFRACTIONFRESNEL = this._refractionFresnelParameters && this._refractionFresnelParameters.isEnabled;
                    defines.EMISSIVEFRESNEL = this._emissiveFresnelParameters && this._emissiveFresnelParameters.isEnabled;
                    defines._needNormals = true;
                    defines.FRESNEL = true;
                }
            }
            else {
                defines.FRESNEL = false;
            }
        }
        // Misc.
        MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, this._shouldTurnAlphaTestOn(mesh) || this._forceAlphaTest, defines);
        // Attribs
        MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true, true);
        // Values that need to be evaluated on every frame
        MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances, null, subMesh.getRenderingMesh().hasThinInstances);
        // External config
        this._eventInfo.defines = defines;
        this._eventInfo.mesh = mesh;
        this._callbackPluginEventPrepareDefines(this._eventInfo);
        // Get correct effect
        if (defines.isDirty) {
            var lightDisposed = defines._areLightsDisposed;
            defines.markAsProcessed();
            // Fallbacks
            var fallbacks = new EffectFallbacks();
            if (defines.REFLECTION) {
                fallbacks.addFallback(0, "REFLECTION");
            }
            if (defines.SPECULAR) {
                fallbacks.addFallback(0, "SPECULAR");
            }
            if (defines.BUMP) {
                fallbacks.addFallback(0, "BUMP");
            }
            if (defines.PARALLAX) {
                fallbacks.addFallback(1, "PARALLAX");
            }
            if (defines.PARALLAXOCCLUSION) {
                fallbacks.addFallback(0, "PARALLAXOCCLUSION");
            }
            if (defines.SPECULAROVERALPHA) {
                fallbacks.addFallback(0, "SPECULAROVERALPHA");
            }
            if (defines.FOG) {
                fallbacks.addFallback(1, "FOG");
            }
            if (defines.POINTSIZE) {
                fallbacks.addFallback(0, "POINTSIZE");
            }
            if (defines.LOGARITHMICDEPTH) {
                fallbacks.addFallback(0, "LOGARITHMICDEPTH");
            }
            MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights);
            if (defines.SPECULARTERM) {
                fallbacks.addFallback(0, "SPECULARTERM");
            }
            if (defines.DIFFUSEFRESNEL) {
                fallbacks.addFallback(1, "DIFFUSEFRESNEL");
            }
            if (defines.OPACITYFRESNEL) {
                fallbacks.addFallback(2, "OPACITYFRESNEL");
            }
            if (defines.REFLECTIONFRESNEL) {
                fallbacks.addFallback(3, "REFLECTIONFRESNEL");
            }
            if (defines.EMISSIVEFRESNEL) {
                fallbacks.addFallback(4, "EMISSIVEFRESNEL");
            }
            if (defines.FRESNEL) {
                fallbacks.addFallback(4, "FRESNEL");
            }
            if (defines.MULTIVIEW) {
                fallbacks.addFallback(0, "MULTIVIEW");
            }
            //Attributes
            var attribs = [VertexBuffer.PositionKind];
            if (defines.NORMAL) {
                attribs.push(VertexBuffer.NormalKind);
            }
            if (defines.TANGENT) {
                attribs.push(VertexBuffer.TangentKind);
            }
            for (var i = 1; i <= 6; ++i) {
                if (defines["UV" + i]) {
                    attribs.push("uv".concat(i === 1 ? "" : i));
                }
            }
            if (defines.VERTEXCOLOR) {
                attribs.push(VertexBuffer.ColorKind);
            }
            MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
            MaterialHelper.PrepareAttributesForInstances(attribs, defines);
            MaterialHelper.PrepareAttributesForMorphTargets(attribs, mesh, defines);
            MaterialHelper.PrepareAttributesForBakedVertexAnimation(attribs, mesh, defines);
            var shaderName = "default";
            var uniforms = [
                "world",
                "view",
                "viewProjection",
                "vEyePosition",
                "vLightsType",
                "vAmbientColor",
                "vDiffuseColor",
                "vSpecularColor",
                "vEmissiveColor",
                "visibility",
                "vFogInfos",
                "vFogColor",
                "pointSize",
                "vDiffuseInfos",
                "vAmbientInfos",
                "vOpacityInfos",
                "vReflectionInfos",
                "vEmissiveInfos",
                "vSpecularInfos",
                "vBumpInfos",
                "vLightmapInfos",
                "vRefractionInfos",
                "mBones",
                "vClipPlane",
                "vClipPlane2",
                "vClipPlane3",
                "vClipPlane4",
                "vClipPlane5",
                "vClipPlane6",
                "diffuseMatrix",
                "ambientMatrix",
                "opacityMatrix",
                "reflectionMatrix",
                "emissiveMatrix",
                "specularMatrix",
                "bumpMatrix",
                "normalMatrix",
                "lightmapMatrix",
                "refractionMatrix",
                "diffuseLeftColor",
                "diffuseRightColor",
                "opacityParts",
                "reflectionLeftColor",
                "reflectionRightColor",
                "emissiveLeftColor",
                "emissiveRightColor",
                "refractionLeftColor",
                "refractionRightColor",
                "vReflectionPosition",
                "vReflectionSize",
                "vRefractionPosition",
                "vRefractionSize",
                "logarithmicDepthConstant",
                "vTangentSpaceParams",
                "alphaCutOff",
                "boneTextureWidth",
                "morphTargetTextureInfo",
                "morphTargetTextureIndices",
            ];
            var samplers = [
                "diffuseSampler",
                "ambientSampler",
                "opacitySampler",
                "reflectionCubeSampler",
                "reflection2DSampler",
                "emissiveSampler",
                "specularSampler",
                "bumpSampler",
                "lightmapSampler",
                "refractionCubeSampler",
                "refraction2DSampler",
                "boneSampler",
                "morphTargets",
                "oitDepthSampler",
                "oitFrontColorSampler",
            ];
            var uniformBuffers = ["Material", "Scene", "Mesh"];
            this._eventInfo.fallbacks = fallbacks;
            this._eventInfo.fallbackRank = 0;
            this._eventInfo.defines = defines;
            this._eventInfo.uniforms = uniforms;
            this._eventInfo.samplers = samplers;
            this._eventInfo.uniformBuffersNames = uniformBuffers;
            this._eventInfo.customCode = undefined;
            this._callbackPluginEventGeneric(MaterialPluginEvent.PrepareEffect, this._eventInfo);
            PrePassConfiguration.AddUniforms(uniforms);
            PrePassConfiguration.AddSamplers(samplers);
            if (ImageProcessingConfiguration) {
                ImageProcessingConfiguration.PrepareUniforms(uniforms, defines);
                ImageProcessingConfiguration.PrepareSamplers(samplers, defines);
            }
            MaterialHelper.PrepareUniformsAndSamplersList({
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: defines,
                maxSimultaneousLights: this._maxSimultaneousLights,
            });
            var csnrOptions = {};
            if (this.customShaderNameResolve) {
                shaderName = this.customShaderNameResolve(shaderName, uniforms, uniformBuffers, samplers, defines, attribs, csnrOptions);
            }
            var join = defines.toString();
            var previousEffect = subMesh.effect;
            var effect = scene.getEngine().createEffect(shaderName, {
                attributes: attribs,
                uniformsNames: uniforms,
                uniformBuffersNames: uniformBuffers,
                samplers: samplers,
                defines: join,
                fallbacks: fallbacks,
                onCompiled: this.onCompiled,
                onError: this.onError,
                indexParameters: { maxSimultaneousLights: this._maxSimultaneousLights, maxSimultaneousMorphTargets: defines.NUM_MORPH_INFLUENCERS },
                processFinalCode: csnrOptions.processFinalCode,
                processCodeAfterIncludes: this._eventInfo.customCode,
                multiTarget: defines.PREPASS,
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
                    if (lightDisposed) {
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
    /**
     * Builds the material UBO layouts.
     * Used internally during the effect preparation.
     */
    StandardMaterial.prototype.buildUniformLayout = function () {
        // Order is important !
        var ubo = this._uniformBuffer;
        ubo.addUniform("diffuseLeftColor", 4);
        ubo.addUniform("diffuseRightColor", 4);
        ubo.addUniform("opacityParts", 4);
        ubo.addUniform("reflectionLeftColor", 4);
        ubo.addUniform("reflectionRightColor", 4);
        ubo.addUniform("refractionLeftColor", 4);
        ubo.addUniform("refractionRightColor", 4);
        ubo.addUniform("emissiveLeftColor", 4);
        ubo.addUniform("emissiveRightColor", 4);
        ubo.addUniform("vDiffuseInfos", 2);
        ubo.addUniform("vAmbientInfos", 2);
        ubo.addUniform("vOpacityInfos", 2);
        ubo.addUniform("vReflectionInfos", 2);
        ubo.addUniform("vReflectionPosition", 3);
        ubo.addUniform("vReflectionSize", 3);
        ubo.addUniform("vEmissiveInfos", 2);
        ubo.addUniform("vLightmapInfos", 2);
        ubo.addUniform("vSpecularInfos", 2);
        ubo.addUniform("vBumpInfos", 3);
        ubo.addUniform("diffuseMatrix", 16);
        ubo.addUniform("ambientMatrix", 16);
        ubo.addUniform("opacityMatrix", 16);
        ubo.addUniform("reflectionMatrix", 16);
        ubo.addUniform("emissiveMatrix", 16);
        ubo.addUniform("lightmapMatrix", 16);
        ubo.addUniform("specularMatrix", 16);
        ubo.addUniform("bumpMatrix", 16);
        ubo.addUniform("vTangentSpaceParams", 2);
        ubo.addUniform("pointSize", 1);
        ubo.addUniform("alphaCutOff", 1);
        ubo.addUniform("refractionMatrix", 16);
        ubo.addUniform("vRefractionInfos", 4);
        ubo.addUniform("vRefractionPosition", 3);
        ubo.addUniform("vRefractionSize", 3);
        ubo.addUniform("vSpecularColor", 4);
        ubo.addUniform("vEmissiveColor", 3);
        ubo.addUniform("vDiffuseColor", 4);
        ubo.addUniform("vAmbientColor", 3);
        _super.prototype.buildUniformLayout.call(this);
    };
    /**
     * Binds the submesh to this material by preparing the effect and shader to draw
     * @param world defines the world transformation matrix
     * @param mesh defines the mesh containing the submesh
     * @param subMesh defines the submesh to bind the material to
     */
    StandardMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var _a;
        var scene = this.getScene();
        var defines = subMesh.materialDefines;
        if (!defines) {
            return;
        }
        var effect = subMesh.effect;
        if (!effect) {
            return;
        }
        this._activeEffect = effect;
        // Matrices Mesh.
        mesh.getMeshUniformBuffer().bindToEffect(effect, "Mesh");
        mesh.transferToEffect(world);
        // Binding unconditionally
        this._uniformBuffer.bindToEffect(effect, "Material");
        this.prePassConfiguration.bindForSubMesh(this._activeEffect, scene, mesh, world, this.isFrozen);
        this._eventInfo.subMesh = subMesh;
        this._callbackPluginEventHardBindForSubMesh(this._eventInfo);
        // Normal Matrix
        if (defines.OBJECTSPACE_NORMALMAP) {
            world.toNormalMatrix(this._normalMatrix);
            this.bindOnlyNormalMatrix(this._normalMatrix);
        }
        var mustRebind = this._mustRebind(scene, effect, mesh.visibility);
        // Bones
        MaterialHelper.BindBonesParameters(mesh, effect);
        var ubo = this._uniformBuffer;
        if (mustRebind) {
            this.bindViewProjection(effect);
            if (!ubo.useUbo || !this.isFrozen || !ubo.isSync) {
                if (StandardMaterial.FresnelEnabled && defines.FRESNEL) {
                    // Fresnel
                    if (this.diffuseFresnelParameters && this.diffuseFresnelParameters.isEnabled) {
                        ubo.updateColor4("diffuseLeftColor", this.diffuseFresnelParameters.leftColor, this.diffuseFresnelParameters.power);
                        ubo.updateColor4("diffuseRightColor", this.diffuseFresnelParameters.rightColor, this.diffuseFresnelParameters.bias);
                    }
                    if (this.opacityFresnelParameters && this.opacityFresnelParameters.isEnabled) {
                        ubo.updateColor4("opacityParts", new Color3(this.opacityFresnelParameters.leftColor.toLuminance(), this.opacityFresnelParameters.rightColor.toLuminance(), this.opacityFresnelParameters.bias), this.opacityFresnelParameters.power);
                    }
                    if (this.reflectionFresnelParameters && this.reflectionFresnelParameters.isEnabled) {
                        ubo.updateColor4("reflectionLeftColor", this.reflectionFresnelParameters.leftColor, this.reflectionFresnelParameters.power);
                        ubo.updateColor4("reflectionRightColor", this.reflectionFresnelParameters.rightColor, this.reflectionFresnelParameters.bias);
                    }
                    if (this.refractionFresnelParameters && this.refractionFresnelParameters.isEnabled) {
                        ubo.updateColor4("refractionLeftColor", this.refractionFresnelParameters.leftColor, this.refractionFresnelParameters.power);
                        ubo.updateColor4("refractionRightColor", this.refractionFresnelParameters.rightColor, this.refractionFresnelParameters.bias);
                    }
                    if (this.emissiveFresnelParameters && this.emissiveFresnelParameters.isEnabled) {
                        ubo.updateColor4("emissiveLeftColor", this.emissiveFresnelParameters.leftColor, this.emissiveFresnelParameters.power);
                        ubo.updateColor4("emissiveRightColor", this.emissiveFresnelParameters.rightColor, this.emissiveFresnelParameters.bias);
                    }
                }
                // Textures
                if (scene.texturesEnabled) {
                    if (this._diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                        ubo.updateFloat2("vDiffuseInfos", this._diffuseTexture.coordinatesIndex, this._diffuseTexture.level);
                        MaterialHelper.BindTextureMatrix(this._diffuseTexture, ubo, "diffuse");
                    }
                    if (this._ambientTexture && StandardMaterial.AmbientTextureEnabled) {
                        ubo.updateFloat2("vAmbientInfos", this._ambientTexture.coordinatesIndex, this._ambientTexture.level);
                        MaterialHelper.BindTextureMatrix(this._ambientTexture, ubo, "ambient");
                    }
                    if (this._opacityTexture && StandardMaterial.OpacityTextureEnabled) {
                        ubo.updateFloat2("vOpacityInfos", this._opacityTexture.coordinatesIndex, this._opacityTexture.level);
                        MaterialHelper.BindTextureMatrix(this._opacityTexture, ubo, "opacity");
                    }
                    if (this._hasAlphaChannel()) {
                        ubo.updateFloat("alphaCutOff", this.alphaCutOff);
                    }
                    if (this._reflectionTexture && StandardMaterial.ReflectionTextureEnabled) {
                        ubo.updateFloat2("vReflectionInfos", this._reflectionTexture.level, this.roughness);
                        ubo.updateMatrix("reflectionMatrix", this._reflectionTexture.getReflectionTextureMatrix());
                        if (this._reflectionTexture.boundingBoxSize) {
                            var cubeTexture = this._reflectionTexture;
                            ubo.updateVector3("vReflectionPosition", cubeTexture.boundingBoxPosition);
                            ubo.updateVector3("vReflectionSize", cubeTexture.boundingBoxSize);
                        }
                    }
                    if (this._emissiveTexture && StandardMaterial.EmissiveTextureEnabled) {
                        ubo.updateFloat2("vEmissiveInfos", this._emissiveTexture.coordinatesIndex, this._emissiveTexture.level);
                        MaterialHelper.BindTextureMatrix(this._emissiveTexture, ubo, "emissive");
                    }
                    if (this._lightmapTexture && StandardMaterial.LightmapTextureEnabled) {
                        ubo.updateFloat2("vLightmapInfos", this._lightmapTexture.coordinatesIndex, this._lightmapTexture.level);
                        MaterialHelper.BindTextureMatrix(this._lightmapTexture, ubo, "lightmap");
                    }
                    if (this._specularTexture && StandardMaterial.SpecularTextureEnabled) {
                        ubo.updateFloat2("vSpecularInfos", this._specularTexture.coordinatesIndex, this._specularTexture.level);
                        MaterialHelper.BindTextureMatrix(this._specularTexture, ubo, "specular");
                    }
                    if (this._bumpTexture && scene.getEngine().getCaps().standardDerivatives && StandardMaterial.BumpTextureEnabled) {
                        ubo.updateFloat3("vBumpInfos", this._bumpTexture.coordinatesIndex, 1.0 / this._bumpTexture.level, this.parallaxScaleBias);
                        MaterialHelper.BindTextureMatrix(this._bumpTexture, ubo, "bump");
                        if (scene._mirroredCameraPosition) {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? 1.0 : -1.0, this._invertNormalMapY ? 1.0 : -1.0);
                        }
                        else {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? -1.0 : 1.0, this._invertNormalMapY ? -1.0 : 1.0);
                        }
                    }
                    if (this._refractionTexture && StandardMaterial.RefractionTextureEnabled) {
                        var depth = 1.0;
                        if (!this._refractionTexture.isCube) {
                            ubo.updateMatrix("refractionMatrix", this._refractionTexture.getReflectionTextureMatrix());
                            if (this._refractionTexture.depth) {
                                depth = this._refractionTexture.depth;
                            }
                        }
                        ubo.updateFloat4("vRefractionInfos", this._refractionTexture.level, this.indexOfRefraction, depth, this.invertRefractionY ? -1 : 1);
                        if (this._refractionTexture.boundingBoxSize) {
                            var cubeTexture = this._refractionTexture;
                            ubo.updateVector3("vRefractionPosition", cubeTexture.boundingBoxPosition);
                            ubo.updateVector3("vRefractionSize", cubeTexture.boundingBoxSize);
                        }
                    }
                }
                // Point size
                if (this.pointsCloud) {
                    ubo.updateFloat("pointSize", this.pointSize);
                }
                if (defines.SPECULARTERM) {
                    ubo.updateColor4("vSpecularColor", this.specularColor, this.specularPower);
                }
                ubo.updateColor3("vEmissiveColor", StandardMaterial.EmissiveTextureEnabled ? this.emissiveColor : Color3.BlackReadOnly);
                ubo.updateColor4("vDiffuseColor", this.diffuseColor, this.alpha);
                scene.ambientColor.multiplyToRef(this.ambientColor, this._globalAmbientColor);
                ubo.updateColor3("vAmbientColor", this._globalAmbientColor);
            }
            // Textures
            if (scene.texturesEnabled) {
                if (this._diffuseTexture && StandardMaterial.DiffuseTextureEnabled) {
                    effect.setTexture("diffuseSampler", this._diffuseTexture);
                }
                if (this._ambientTexture && StandardMaterial.AmbientTextureEnabled) {
                    effect.setTexture("ambientSampler", this._ambientTexture);
                }
                if (this._opacityTexture && StandardMaterial.OpacityTextureEnabled) {
                    effect.setTexture("opacitySampler", this._opacityTexture);
                }
                if (this._reflectionTexture && StandardMaterial.ReflectionTextureEnabled) {
                    if (this._reflectionTexture.isCube) {
                        effect.setTexture("reflectionCubeSampler", this._reflectionTexture);
                    }
                    else {
                        effect.setTexture("reflection2DSampler", this._reflectionTexture);
                    }
                }
                if (this._emissiveTexture && StandardMaterial.EmissiveTextureEnabled) {
                    effect.setTexture("emissiveSampler", this._emissiveTexture);
                }
                if (this._lightmapTexture && StandardMaterial.LightmapTextureEnabled) {
                    effect.setTexture("lightmapSampler", this._lightmapTexture);
                }
                if (this._specularTexture && StandardMaterial.SpecularTextureEnabled) {
                    effect.setTexture("specularSampler", this._specularTexture);
                }
                if (this._bumpTexture && scene.getEngine().getCaps().standardDerivatives && StandardMaterial.BumpTextureEnabled) {
                    effect.setTexture("bumpSampler", this._bumpTexture);
                }
                if (this._refractionTexture && StandardMaterial.RefractionTextureEnabled) {
                    if (this._refractionTexture.isCube) {
                        effect.setTexture("refractionCubeSampler", this._refractionTexture);
                    }
                    else {
                        effect.setTexture("refraction2DSampler", this._refractionTexture);
                    }
                }
            }
            // OIT with depth peeling
            if (this.getScene().useOrderIndependentTransparency && this.needAlphaBlendingForMesh(mesh)) {
                this.getScene().depthPeelingRenderer.bind(effect);
            }
            this._eventInfo.subMesh = subMesh;
            this._callbackPluginEventBindForSubMesh(this._eventInfo);
            // Clip plane
            MaterialHelper.BindClipPlane(effect, scene);
            // Colors
            this.bindEyePosition(effect);
        }
        else if (scene.getEngine()._features.needToAlwaysBindUniformBuffers) {
            this._needToBindSceneUbo = true;
        }
        if (mustRebind || !this.isFrozen) {
            // Lights
            if (scene.lightsEnabled && !this._disableLighting) {
                MaterialHelper.BindLights(scene, mesh, effect, defines, this._maxSimultaneousLights);
            }
            // View
            if ((scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE) || this._reflectionTexture || this._refractionTexture || mesh.receiveShadows) {
                this.bindView(effect);
            }
            // Fog
            MaterialHelper.BindFogParameters(scene, mesh, effect);
            // Morph targets
            if (defines.NUM_MORPH_INFLUENCERS) {
                MaterialHelper.BindMorphTargetParameters(mesh, effect);
            }
            if (defines.BAKED_VERTEX_ANIMATION_TEXTURE) {
                (_a = mesh.bakedVertexAnimationManager) === null || _a === void 0 ? void 0 : _a.bind(effect, defines.INSTANCES);
            }
            // Log. depth
            if (this.useLogarithmicDepth) {
                MaterialHelper.BindLogDepth(defines, effect, scene);
            }
            // image processing
            if (this._imageProcessingConfiguration && !this._imageProcessingConfiguration.applyByPostProcess) {
                this._imageProcessingConfiguration.bind(this._activeEffect);
            }
        }
        this._afterBind(mesh, this._activeEffect);
        ubo.update();
    };
    /**
     * Get the list of animatables in the material.
     * @returns the list of animatables object used in the material
     */
    StandardMaterial.prototype.getAnimatables = function () {
        var results = _super.prototype.getAnimatables.call(this);
        if (this._diffuseTexture && this._diffuseTexture.animations && this._diffuseTexture.animations.length > 0) {
            results.push(this._diffuseTexture);
        }
        if (this._ambientTexture && this._ambientTexture.animations && this._ambientTexture.animations.length > 0) {
            results.push(this._ambientTexture);
        }
        if (this._opacityTexture && this._opacityTexture.animations && this._opacityTexture.animations.length > 0) {
            results.push(this._opacityTexture);
        }
        if (this._reflectionTexture && this._reflectionTexture.animations && this._reflectionTexture.animations.length > 0) {
            results.push(this._reflectionTexture);
        }
        if (this._emissiveTexture && this._emissiveTexture.animations && this._emissiveTexture.animations.length > 0) {
            results.push(this._emissiveTexture);
        }
        if (this._specularTexture && this._specularTexture.animations && this._specularTexture.animations.length > 0) {
            results.push(this._specularTexture);
        }
        if (this._bumpTexture && this._bumpTexture.animations && this._bumpTexture.animations.length > 0) {
            results.push(this._bumpTexture);
        }
        if (this._lightmapTexture && this._lightmapTexture.animations && this._lightmapTexture.animations.length > 0) {
            results.push(this._lightmapTexture);
        }
        if (this._refractionTexture && this._refractionTexture.animations && this._refractionTexture.animations.length > 0) {
            results.push(this._refractionTexture);
        }
        return results;
    };
    /**
     * Gets the active textures from the material
     * @returns an array of textures
     */
    StandardMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        if (this._diffuseTexture) {
            activeTextures.push(this._diffuseTexture);
        }
        if (this._ambientTexture) {
            activeTextures.push(this._ambientTexture);
        }
        if (this._opacityTexture) {
            activeTextures.push(this._opacityTexture);
        }
        if (this._reflectionTexture) {
            activeTextures.push(this._reflectionTexture);
        }
        if (this._emissiveTexture) {
            activeTextures.push(this._emissiveTexture);
        }
        if (this._specularTexture) {
            activeTextures.push(this._specularTexture);
        }
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        if (this._lightmapTexture) {
            activeTextures.push(this._lightmapTexture);
        }
        if (this._refractionTexture) {
            activeTextures.push(this._refractionTexture);
        }
        return activeTextures;
    };
    /**
     * Specifies if the material uses a texture
     * @param texture defines the texture to check against the material
     * @returns a boolean specifying if the material uses the texture
     */
    StandardMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        if (this._diffuseTexture === texture) {
            return true;
        }
        if (this._ambientTexture === texture) {
            return true;
        }
        if (this._opacityTexture === texture) {
            return true;
        }
        if (this._reflectionTexture === texture) {
            return true;
        }
        if (this._emissiveTexture === texture) {
            return true;
        }
        if (this._specularTexture === texture) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        if (this._lightmapTexture === texture) {
            return true;
        }
        if (this._refractionTexture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Disposes the material
     * @param forceDisposeEffect specifies if effects should be forcefully disposed
     * @param forceDisposeTextures specifies if textures should be forcefully disposed
     */
    StandardMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (forceDisposeTextures) {
            (_a = this._diffuseTexture) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._ambientTexture) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this._opacityTexture) === null || _c === void 0 ? void 0 : _c.dispose();
            (_d = this._reflectionTexture) === null || _d === void 0 ? void 0 : _d.dispose();
            (_e = this._emissiveTexture) === null || _e === void 0 ? void 0 : _e.dispose();
            (_f = this._specularTexture) === null || _f === void 0 ? void 0 : _f.dispose();
            (_g = this._bumpTexture) === null || _g === void 0 ? void 0 : _g.dispose();
            (_h = this._lightmapTexture) === null || _h === void 0 ? void 0 : _h.dispose();
            (_j = this._refractionTexture) === null || _j === void 0 ? void 0 : _j.dispose();
        }
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures);
    };
    /**
     * Makes a duplicate of the material, and gives it a new name
     * @param name defines the new name for the duplicated material
     * @returns the cloned material
     */
    StandardMaterial.prototype.clone = function (name) {
        var _this = this;
        var result = SerializationHelper.Clone(function () { return new StandardMaterial(name, _this.getScene()); }, this);
        result.name = name;
        result.id = name;
        this.stencil.copyTo(result.stencil);
        return result;
    };
    /**
     * Creates a standard material from parsed material data
     * @param source defines the JSON representation of the material
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a new standard material
     */
    StandardMaterial.Parse = function (source, scene, rootUrl) {
        var material = SerializationHelper.Parse(function () { return new StandardMaterial(source.name, scene); }, source, scene, rootUrl);
        if (source.stencil) {
            material.stencil.parse(source.stencil, scene, rootUrl);
        }
        return material;
    };
    Object.defineProperty(StandardMaterial, "DiffuseTextureEnabled", {
        // Flags used to enable or disable a type of texture for all Standard Materials
        /**
         * Are diffuse textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.DiffuseTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.DiffuseTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "DetailTextureEnabled", {
        /**
         * Are detail textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.DetailTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.DetailTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "AmbientTextureEnabled", {
        /**
         * Are ambient textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.AmbientTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.AmbientTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "OpacityTextureEnabled", {
        /**
         * Are opacity textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.OpacityTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.OpacityTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "ReflectionTextureEnabled", {
        /**
         * Are reflection textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.ReflectionTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.ReflectionTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "EmissiveTextureEnabled", {
        /**
         * Are emissive textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.EmissiveTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.EmissiveTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "SpecularTextureEnabled", {
        /**
         * Are specular textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.SpecularTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.SpecularTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "BumpTextureEnabled", {
        /**
         * Are bump textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.BumpTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.BumpTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "LightmapTextureEnabled", {
        /**
         * Are lightmap textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.LightmapTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.LightmapTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "RefractionTextureEnabled", {
        /**
         * Are refraction textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.RefractionTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.RefractionTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "ColorGradingTextureEnabled", {
        /**
         * Are color grading textures enabled in the application.
         */
        get: function () {
            return MaterialFlags.ColorGradingTextureEnabled;
        },
        set: function (value) {
            MaterialFlags.ColorGradingTextureEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StandardMaterial, "FresnelEnabled", {
        /**
         * Are fresnels enabled in the application.
         */
        get: function () {
            return MaterialFlags.FresnelEnabled;
        },
        set: function (value) {
            MaterialFlags.FresnelEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        serializeAsTexture("diffuseTexture")
    ], StandardMaterial.prototype, "_diffuseTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], StandardMaterial.prototype, "diffuseTexture", void 0);
    __decorate([
        serializeAsTexture("ambientTexture")
    ], StandardMaterial.prototype, "_ambientTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "ambientTexture", void 0);
    __decorate([
        serializeAsTexture("opacityTexture")
    ], StandardMaterial.prototype, "_opacityTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], StandardMaterial.prototype, "opacityTexture", void 0);
    __decorate([
        serializeAsTexture("reflectionTexture")
    ], StandardMaterial.prototype, "_reflectionTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "reflectionTexture", void 0);
    __decorate([
        serializeAsTexture("emissiveTexture")
    ], StandardMaterial.prototype, "_emissiveTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "emissiveTexture", void 0);
    __decorate([
        serializeAsTexture("specularTexture")
    ], StandardMaterial.prototype, "_specularTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "specularTexture", void 0);
    __decorate([
        serializeAsTexture("bumpTexture")
    ], StandardMaterial.prototype, "_bumpTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "bumpTexture", void 0);
    __decorate([
        serializeAsTexture("lightmapTexture")
    ], StandardMaterial.prototype, "_lightmapTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "lightmapTexture", void 0);
    __decorate([
        serializeAsTexture("refractionTexture")
    ], StandardMaterial.prototype, "_refractionTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "refractionTexture", void 0);
    __decorate([
        serializeAsColor3("ambient")
    ], StandardMaterial.prototype, "ambientColor", void 0);
    __decorate([
        serializeAsColor3("diffuse")
    ], StandardMaterial.prototype, "diffuseColor", void 0);
    __decorate([
        serializeAsColor3("specular")
    ], StandardMaterial.prototype, "specularColor", void 0);
    __decorate([
        serializeAsColor3("emissive")
    ], StandardMaterial.prototype, "emissiveColor", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "specularPower", void 0);
    __decorate([
        serialize("useAlphaFromDiffuseTexture")
    ], StandardMaterial.prototype, "_useAlphaFromDiffuseTexture", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesAndMiscDirty")
    ], StandardMaterial.prototype, "useAlphaFromDiffuseTexture", void 0);
    __decorate([
        serialize("useEmissiveAsIllumination")
    ], StandardMaterial.prototype, "_useEmissiveAsIllumination", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useEmissiveAsIllumination", void 0);
    __decorate([
        serialize("linkEmissiveWithDiffuse")
    ], StandardMaterial.prototype, "_linkEmissiveWithDiffuse", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "linkEmissiveWithDiffuse", void 0);
    __decorate([
        serialize("useSpecularOverAlpha")
    ], StandardMaterial.prototype, "_useSpecularOverAlpha", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useSpecularOverAlpha", void 0);
    __decorate([
        serialize("useReflectionOverAlpha")
    ], StandardMaterial.prototype, "_useReflectionOverAlpha", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useReflectionOverAlpha", void 0);
    __decorate([
        serialize("disableLighting")
    ], StandardMaterial.prototype, "_disableLighting", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsLightsDirty")
    ], StandardMaterial.prototype, "disableLighting", void 0);
    __decorate([
        serialize("useObjectSpaceNormalMap")
    ], StandardMaterial.prototype, "_useObjectSpaceNormalMap", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useObjectSpaceNormalMap", void 0);
    __decorate([
        serialize("useParallax")
    ], StandardMaterial.prototype, "_useParallax", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useParallax", void 0);
    __decorate([
        serialize("useParallaxOcclusion")
    ], StandardMaterial.prototype, "_useParallaxOcclusion", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useParallaxOcclusion", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "parallaxScaleBias", void 0);
    __decorate([
        serialize("roughness")
    ], StandardMaterial.prototype, "_roughness", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "roughness", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "indexOfRefraction", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "invertRefractionY", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "alphaCutOff", void 0);
    __decorate([
        serialize("useLightmapAsShadowmap")
    ], StandardMaterial.prototype, "_useLightmapAsShadowmap", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useLightmapAsShadowmap", void 0);
    __decorate([
        serializeAsFresnelParameters("diffuseFresnelParameters")
    ], StandardMaterial.prototype, "_diffuseFresnelParameters", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelDirty")
    ], StandardMaterial.prototype, "diffuseFresnelParameters", void 0);
    __decorate([
        serializeAsFresnelParameters("opacityFresnelParameters")
    ], StandardMaterial.prototype, "_opacityFresnelParameters", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelAndMiscDirty")
    ], StandardMaterial.prototype, "opacityFresnelParameters", void 0);
    __decorate([
        serializeAsFresnelParameters("reflectionFresnelParameters")
    ], StandardMaterial.prototype, "_reflectionFresnelParameters", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelDirty")
    ], StandardMaterial.prototype, "reflectionFresnelParameters", void 0);
    __decorate([
        serializeAsFresnelParameters("refractionFresnelParameters")
    ], StandardMaterial.prototype, "_refractionFresnelParameters", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelDirty")
    ], StandardMaterial.prototype, "refractionFresnelParameters", void 0);
    __decorate([
        serializeAsFresnelParameters("emissiveFresnelParameters")
    ], StandardMaterial.prototype, "_emissiveFresnelParameters", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelDirty")
    ], StandardMaterial.prototype, "emissiveFresnelParameters", void 0);
    __decorate([
        serialize("useReflectionFresnelFromSpecular")
    ], StandardMaterial.prototype, "_useReflectionFresnelFromSpecular", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsFresnelDirty")
    ], StandardMaterial.prototype, "useReflectionFresnelFromSpecular", void 0);
    __decorate([
        serialize("useGlossinessFromSpecularMapAlpha")
    ], StandardMaterial.prototype, "_useGlossinessFromSpecularMapAlpha", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "useGlossinessFromSpecularMapAlpha", void 0);
    __decorate([
        serialize("maxSimultaneousLights")
    ], StandardMaterial.prototype, "_maxSimultaneousLights", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsLightsDirty")
    ], StandardMaterial.prototype, "maxSimultaneousLights", void 0);
    __decorate([
        serialize("invertNormalMapX")
    ], StandardMaterial.prototype, "_invertNormalMapX", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "invertNormalMapX", void 0);
    __decorate([
        serialize("invertNormalMapY")
    ], StandardMaterial.prototype, "_invertNormalMapY", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "invertNormalMapY", void 0);
    __decorate([
        serialize("twoSidedLighting")
    ], StandardMaterial.prototype, "_twoSidedLighting", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsTexturesDirty")
    ], StandardMaterial.prototype, "twoSidedLighting", void 0);
    __decorate([
        serialize()
    ], StandardMaterial.prototype, "useLogarithmicDepth", null);
    return StandardMaterial;
}(PushMaterial));
export { StandardMaterial };
RegisterClass("BABYLON.StandardMaterial", StandardMaterial);
Scene.DefaultMaterialFactory = function (scene) {
    return new StandardMaterial("default material", scene);
};
//# sourceMappingURL=standardMaterial.js.map