import { __assign, __decorate, __extends } from "tslib";
/* eslint-disable @typescript-eslint/naming-convention */
import { serialize, serializeAsImageProcessingConfiguration, expandToProperty } from "../../Misc/decorators.js";
import { Logger } from "../../Misc/logger.js";
import { SmartArray } from "../../Misc/smartArray.js";
import { GetEnvironmentBRDFTexture } from "../../Misc/brdfTextureTools.js";
import { Scene } from "../../scene.js";
import { Vector4 } from "../../Maths/math.vector.js";
import { VertexBuffer } from "../../Buffers/buffer.js";
import { PBRBRDFConfiguration } from "./pbrBRDFConfiguration.js";
import { PrePassConfiguration } from "../prePassConfiguration.js";
import { Color3, TmpColors } from "../../Maths/math.color.js";
import { Scalar } from "../../Maths/math.scalar.js";
import { ImageProcessingConfiguration } from "../../Materials/imageProcessingConfiguration.js";
import { Material } from "../../Materials/material.js";
import { MaterialPluginEvent } from "../materialPluginEvent.js";
import { MaterialDefines } from "../../Materials/materialDefines.js";
import { PushMaterial } from "../../Materials/pushMaterial.js";
import { MaterialHelper } from "../../Materials/materialHelper.js";
import { Texture } from "../../Materials/Textures/texture.js";
import { MaterialFlags } from "../materialFlags.js";

import "../../Materials/Textures/baseTexture.polynomial.js";
import "../../Shaders/pbr.fragment.js";
import "../../Shaders/pbr.vertex.js";
import { EffectFallbacks } from "../effectFallbacks.js";
import { PBRClearCoatConfiguration } from "./pbrClearCoatConfiguration.js";
import { PBRIridescenceConfiguration } from "./pbrIridescenceConfiguration.js";
import { PBRAnisotropicConfiguration } from "./pbrAnisotropicConfiguration.js";
import { PBRSheenConfiguration } from "./pbrSheenConfiguration.js";
import { PBRSubSurfaceConfiguration } from "./pbrSubSurfaceConfiguration.js";
import { DetailMapConfiguration } from "../material.detailMapConfiguration.js";
var onCreatedEffectParameters = { effect: null, subMesh: null };
/**
 * Manages the defines for the PBR Material.
 * @hidden
 */
var PBRMaterialDefines = /** @class */ (function (_super) {
    __extends(PBRMaterialDefines, _super);
    /**
     * Initializes the PBR Material defines.
     * @param externalProperties The external properties
     */
    function PBRMaterialDefines(externalProperties) {
        var _this = _super.call(this, externalProperties) || this;
        _this.PBR = true;
        _this.NUM_SAMPLES = "0";
        _this.REALTIME_FILTERING = false;
        _this.MAINUV1 = false;
        _this.MAINUV2 = false;
        _this.MAINUV3 = false;
        _this.MAINUV4 = false;
        _this.MAINUV5 = false;
        _this.MAINUV6 = false;
        _this.UV1 = false;
        _this.UV2 = false;
        _this.UV3 = false;
        _this.UV4 = false;
        _this.UV5 = false;
        _this.UV6 = false;
        _this.ALBEDO = false;
        _this.GAMMAALBEDO = false;
        _this.ALBEDODIRECTUV = 0;
        _this.VERTEXCOLOR = false;
        _this.BAKED_VERTEX_ANIMATION_TEXTURE = false;
        _this.AMBIENT = false;
        _this.AMBIENTDIRECTUV = 0;
        _this.AMBIENTINGRAYSCALE = false;
        _this.OPACITY = false;
        _this.VERTEXALPHA = false;
        _this.OPACITYDIRECTUV = 0;
        _this.OPACITYRGB = false;
        _this.ALPHATEST = false;
        _this.DEPTHPREPASS = false;
        _this.ALPHABLEND = false;
        _this.ALPHAFROMALBEDO = false;
        _this.ALPHATESTVALUE = "0.5";
        _this.SPECULAROVERALPHA = false;
        _this.RADIANCEOVERALPHA = false;
        _this.ALPHAFRESNEL = false;
        _this.LINEARALPHAFRESNEL = false;
        _this.PREMULTIPLYALPHA = false;
        _this.EMISSIVE = false;
        _this.EMISSIVEDIRECTUV = 0;
        _this.GAMMAEMISSIVE = false;
        _this.REFLECTIVITY = false;
        _this.REFLECTIVITY_GAMMA = false;
        _this.REFLECTIVITYDIRECTUV = 0;
        _this.SPECULARTERM = false;
        _this.MICROSURFACEFROMREFLECTIVITYMAP = false;
        _this.MICROSURFACEAUTOMATIC = false;
        _this.LODBASEDMICROSFURACE = false;
        _this.MICROSURFACEMAP = false;
        _this.MICROSURFACEMAPDIRECTUV = 0;
        _this.METALLICWORKFLOW = false;
        _this.ROUGHNESSSTOREINMETALMAPALPHA = false;
        _this.ROUGHNESSSTOREINMETALMAPGREEN = false;
        _this.METALLNESSSTOREINMETALMAPBLUE = false;
        _this.AOSTOREINMETALMAPRED = false;
        _this.METALLIC_REFLECTANCE = false;
        _this.METALLIC_REFLECTANCE_GAMMA = false;
        _this.METALLIC_REFLECTANCEDIRECTUV = 0;
        _this.METALLIC_REFLECTANCE_USE_ALPHA_ONLY = false;
        _this.REFLECTANCE = false;
        _this.REFLECTANCE_GAMMA = false;
        _this.REFLECTANCEDIRECTUV = 0;
        _this.ENVIRONMENTBRDF = false;
        _this.ENVIRONMENTBRDF_RGBD = false;
        _this.NORMAL = false;
        _this.TANGENT = false;
        _this.BUMP = false;
        _this.BUMPDIRECTUV = 0;
        _this.OBJECTSPACE_NORMALMAP = false;
        _this.PARALLAX = false;
        _this.PARALLAXOCCLUSION = false;
        _this.NORMALXYSCALE = true;
        _this.LIGHTMAP = false;
        _this.LIGHTMAPDIRECTUV = 0;
        _this.USELIGHTMAPASSHADOWMAP = false;
        _this.GAMMALIGHTMAP = false;
        _this.RGBDLIGHTMAP = false;
        _this.REFLECTION = false;
        _this.REFLECTIONMAP_3D = false;
        _this.REFLECTIONMAP_SPHERICAL = false;
        _this.REFLECTIONMAP_PLANAR = false;
        _this.REFLECTIONMAP_CUBIC = false;
        _this.USE_LOCAL_REFLECTIONMAP_CUBIC = false;
        _this.REFLECTIONMAP_PROJECTION = false;
        _this.REFLECTIONMAP_SKYBOX = false;
        _this.REFLECTIONMAP_EXPLICIT = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR = false;
        _this.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
        _this.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
        _this.INVERTCUBICMAP = false;
        _this.USESPHERICALFROMREFLECTIONMAP = false;
        _this.USEIRRADIANCEMAP = false;
        _this.USESPHERICALINVERTEX = false;
        _this.REFLECTIONMAP_OPPOSITEZ = false;
        _this.LODINREFLECTIONALPHA = false;
        _this.GAMMAREFLECTION = false;
        _this.RGBDREFLECTION = false;
        _this.LINEARSPECULARREFLECTION = false;
        _this.RADIANCEOCCLUSION = false;
        _this.HORIZONOCCLUSION = false;
        _this.INSTANCES = false;
        _this.THIN_INSTANCES = false;
        _this.INSTANCESCOLOR = false;
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
        _this.NUM_BONE_INFLUENCERS = 0;
        _this.BonesPerMesh = 0;
        _this.BONETEXTURE = false;
        _this.BONES_VELOCITY_ENABLED = false;
        _this.NONUNIFORMSCALING = false;
        _this.MORPHTARGETS = false;
        _this.MORPHTARGETS_NORMAL = false;
        _this.MORPHTARGETS_TANGENT = false;
        _this.MORPHTARGETS_UV = false;
        _this.NUM_MORPH_INFLUENCERS = 0;
        _this.MORPHTARGETS_TEXTURE = false;
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
        _this.EXPOSURE = false;
        _this.MULTIVIEW = false;
        _this.ORDER_INDEPENDENT_TRANSPARENCY = false;
        _this.ORDER_INDEPENDENT_TRANSPARENCY_16BITS = false;
        _this.USEPHYSICALLIGHTFALLOFF = false;
        _this.USEGLTFLIGHTFALLOFF = false;
        _this.TWOSIDEDLIGHTING = false;
        _this.SHADOWFLOAT = false;
        _this.CLIPPLANE = false;
        _this.CLIPPLANE2 = false;
        _this.CLIPPLANE3 = false;
        _this.CLIPPLANE4 = false;
        _this.CLIPPLANE5 = false;
        _this.CLIPPLANE6 = false;
        _this.POINTSIZE = false;
        _this.FOG = false;
        _this.LOGARITHMICDEPTH = false;
        _this.FORCENORMALFORWARD = false;
        _this.SPECULARAA = false;
        _this.UNLIT = false;
        _this.DEBUGMODE = 0;
        _this.rebuild();
        return _this;
    }
    /**
     * Resets the PBR Material defines.
     */
    PBRMaterialDefines.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.ALPHATESTVALUE = "0.5";
        this.PBR = true;
        this.NORMALXYSCALE = true;
    };
    return PBRMaterialDefines;
}(MaterialDefines));
export { PBRMaterialDefines };
/**
 * The Physically based material base class of BJS.
 *
 * This offers the main features of a standard PBR material.
 * For more information, please refer to the documentation :
 * https://doc.babylonjs.com/how_to/physically_based_rendering
 */
var PBRBaseMaterial = /** @class */ (function (_super) {
    __extends(PBRBaseMaterial, _super);
    /**
     * Instantiates a new PBRMaterial instance.
     *
     * @param name The material name
     * @param scene The scene the material will be use in.
     */
    function PBRBaseMaterial(name, scene) {
        var _this = _super.call(this, name, scene) || this;
        /**
         * Intensity of the direct lights e.g. the four lights available in your scene.
         * This impacts both the direct diffuse and specular highlights.
         * @hidden
         */
        _this._directIntensity = 1.0;
        /**
         * Intensity of the emissive part of the material.
         * This helps controlling the emissive effect without modifying the emissive color.
         * @hidden
         */
        _this._emissiveIntensity = 1.0;
        /**
         * Intensity of the environment e.g. how much the environment will light the object
         * either through harmonics for rough material or through the reflection for shiny ones.
         * @hidden
         */
        _this._environmentIntensity = 1.0;
        /**
         * This is a special control allowing the reduction of the specular highlights coming from the
         * four lights of the scene. Those highlights may not be needed in full environment lighting.
         * @hidden
         */
        _this._specularIntensity = 1.0;
        /**
         * This stores the direct, emissive, environment, and specular light intensities into a Vector4.
         */
        _this._lightingInfos = new Vector4(_this._directIntensity, _this._emissiveIntensity, _this._environmentIntensity, _this._specularIntensity);
        /**
         * Debug Control allowing disabling the bump map on this material.
         * @hidden
         */
        _this._disableBumpMap = false;
        /**
         * AKA Diffuse Texture in standard nomenclature.
         * @hidden
         */
        _this._albedoTexture = null;
        /**
         * AKA Occlusion Texture in other nomenclature.
         * @hidden
         */
        _this._ambientTexture = null;
        /**
         * AKA Occlusion Texture Intensity in other nomenclature.
         * @hidden
         */
        _this._ambientTextureStrength = 1.0;
        /**
         * Defines how much the AO map is occluding the analytical lights (point spot...).
         * 1 means it completely occludes it
         * 0 mean it has no impact
         * @hidden
         */
        _this._ambientTextureImpactOnAnalyticalLights = PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS;
        /**
         * Stores the alpha values in a texture.
         * @hidden
         */
        _this._opacityTexture = null;
        /**
         * Stores the reflection values in a texture.
         * @hidden
         */
        _this._reflectionTexture = null;
        /**
         * Stores the emissive values in a texture.
         * @hidden
         */
        _this._emissiveTexture = null;
        /**
         * AKA Specular texture in other nomenclature.
         * @hidden
         */
        _this._reflectivityTexture = null;
        /**
         * Used to switch from specular/glossiness to metallic/roughness workflow.
         * @hidden
         */
        _this._metallicTexture = null;
        /**
         * Specifies the metallic scalar of the metallic/roughness workflow.
         * Can also be used to scale the metalness values of the metallic texture.
         * @hidden
         */
        _this._metallic = null;
        /**
         * Specifies the roughness scalar of the metallic/roughness workflow.
         * Can also be used to scale the roughness values of the metallic texture.
         * @hidden
         */
        _this._roughness = null;
        /**
         * In metallic workflow, specifies an F0 factor to help configuring the material F0.
         * By default the indexOfrefraction is used to compute F0;
         *
         * This is used as a factor against the default reflectance at normal incidence to tweak it.
         *
         * F0 = defaultF0 * metallicF0Factor * metallicReflectanceColor;
         * F90 = metallicReflectanceColor;
         * @hidden
         */
        _this._metallicF0Factor = 1;
        /**
         * In metallic workflow, specifies an F90 color to help configuring the material F90.
         * By default the F90 is always 1;
         *
         * Please note that this factor is also used as a factor against the default reflectance at normal incidence.
         *
         * F0 = defaultF0 * metallicF0Factor * metallicReflectanceColor
         * F90 = metallicReflectanceColor;
         * @hidden
         */
        _this._metallicReflectanceColor = Color3.White();
        /**
         * Specifies that only the A channel from _metallicReflectanceTexture should be used.
         * If false, both RGB and A channels will be used
         * @hidden
         */
        _this._useOnlyMetallicFromMetallicReflectanceTexture = false;
        /**
         * Defines to store metallicReflectanceColor in RGB and metallicF0Factor in A
         * This is multiply against the scalar values defined in the material.
         * @hidden
         */
        _this._metallicReflectanceTexture = null;
        /**
         * Defines to store reflectanceColor in RGB
         * This is multiplied against the scalar values defined in the material.
         * If both _reflectanceTexture and _metallicReflectanceTexture textures are provided and _useOnlyMetallicFromMetallicReflectanceTexture
         * is false, _metallicReflectanceTexture takes precedence and _reflectanceTexture is not used
         * @hidden
         */
        _this._reflectanceTexture = null;
        /**
         * Used to enable roughness/glossiness fetch from a separate channel depending on the current mode.
         * Gray Scale represents roughness in metallic mode and glossiness in specular mode.
         * @hidden
         */
        _this._microSurfaceTexture = null;
        /**
         * Stores surface normal data used to displace a mesh in a texture.
         * @hidden
         */
        _this._bumpTexture = null;
        /**
         * Stores the pre-calculated light information of a mesh in a texture.
         * @hidden
         */
        _this._lightmapTexture = null;
        /**
         * The color of a material in ambient lighting.
         * @hidden
         */
        _this._ambientColor = new Color3(0, 0, 0);
        /**
         * AKA Diffuse Color in other nomenclature.
         * @hidden
         */
        _this._albedoColor = new Color3(1, 1, 1);
        /**
         * AKA Specular Color in other nomenclature.
         * @hidden
         */
        _this._reflectivityColor = new Color3(1, 1, 1);
        /**
         * The color applied when light is reflected from a material.
         * @hidden
         */
        _this._reflectionColor = new Color3(1, 1, 1);
        /**
         * The color applied when light is emitted from a material.
         * @hidden
         */
        _this._emissiveColor = new Color3(0, 0, 0);
        /**
         * AKA Glossiness in other nomenclature.
         * @hidden
         */
        _this._microSurface = 0.9;
        /**
         * Specifies that the material will use the light map as a show map.
         * @hidden
         */
        _this._useLightmapAsShadowmap = false;
        /**
         * This parameters will enable/disable Horizon occlusion to prevent normal maps to look shiny when the normal
         * makes the reflect vector face the model (under horizon).
         * @hidden
         */
        _this._useHorizonOcclusion = true;
        /**
         * This parameters will enable/disable radiance occlusion by preventing the radiance to lit
         * too much the area relying on ambient texture to define their ambient occlusion.
         * @hidden
         */
        _this._useRadianceOcclusion = true;
        /**
         * Specifies that the alpha is coming form the albedo channel alpha channel for alpha blending.
         * @hidden
         */
        _this._useAlphaFromAlbedoTexture = false;
        /**
         * Specifies that the material will keeps the specular highlights over a transparent surface (only the most luminous ones).
         * A car glass is a good example of that. When sun reflects on it you can not see what is behind.
         * @hidden
         */
        _this._useSpecularOverAlpha = true;
        /**
         * Specifies if the reflectivity texture contains the glossiness information in its alpha channel.
         * @hidden
         */
        _this._useMicroSurfaceFromReflectivityMapAlpha = false;
        /**
         * Specifies if the metallic texture contains the roughness information in its alpha channel.
         * @hidden
         */
        _this._useRoughnessFromMetallicTextureAlpha = true;
        /**
         * Specifies if the metallic texture contains the roughness information in its green channel.
         * @hidden
         */
        _this._useRoughnessFromMetallicTextureGreen = false;
        /**
         * Specifies if the metallic texture contains the metallness information in its blue channel.
         * @hidden
         */
        _this._useMetallnessFromMetallicTextureBlue = false;
        /**
         * Specifies if the metallic texture contains the ambient occlusion information in its red channel.
         * @hidden
         */
        _this._useAmbientOcclusionFromMetallicTextureRed = false;
        /**
         * Specifies if the ambient texture contains the ambient occlusion information in its red channel only.
         * @hidden
         */
        _this._useAmbientInGrayScale = false;
        /**
         * In case the reflectivity map does not contain the microsurface information in its alpha channel,
         * The material will try to infer what glossiness each pixel should be.
         * @hidden
         */
        _this._useAutoMicroSurfaceFromReflectivityMap = false;
        /**
         * Defines the  falloff type used in this material.
         * It by default is Physical.
         * @hidden
         */
        _this._lightFalloff = PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL;
        /**
         * Specifies that the material will keeps the reflection highlights over a transparent surface (only the most luminous ones).
         * A car glass is a good example of that. When the street lights reflects on it you can not see what is behind.
         * @hidden
         */
        _this._useRadianceOverAlpha = true;
        /**
         * Allows using an object space normal map (instead of tangent space).
         * @hidden
         */
        _this._useObjectSpaceNormalMap = false;
        /**
         * Allows using the bump map in parallax mode.
         * @hidden
         */
        _this._useParallax = false;
        /**
         * Allows using the bump map in parallax occlusion mode.
         * @hidden
         */
        _this._useParallaxOcclusion = false;
        /**
         * Controls the scale bias of the parallax mode.
         * @hidden
         */
        _this._parallaxScaleBias = 0.05;
        /**
         * If sets to true, disables all the lights affecting the material.
         * @hidden
         */
        _this._disableLighting = false;
        /**
         * Number of Simultaneous lights allowed on the material.
         * @hidden
         */
        _this._maxSimultaneousLights = 4;
        /**
         * If sets to true, x component of normal map value will be inverted (x = 1.0 - x).
         * @hidden
         */
        _this._invertNormalMapX = false;
        /**
         * If sets to true, y component of normal map value will be inverted (y = 1.0 - y).
         * @hidden
         */
        _this._invertNormalMapY = false;
        /**
         * If sets to true and backfaceCulling is false, normals will be flipped on the backside.
         * @hidden
         */
        _this._twoSidedLighting = false;
        /**
         * Defines the alpha limits in alpha test mode.
         * @hidden
         */
        _this._alphaCutOff = 0.4;
        /**
         * Enforces alpha test in opaque or blend mode in order to improve the performances of some situations.
         * @hidden
         */
        _this._forceAlphaTest = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha is converted to gamma to compute the fresnel)
         * @hidden
         */
        _this._useAlphaFresnel = false;
        /**
         * A fresnel is applied to the alpha of the model to ensure grazing angles edges are not alpha tested.
         * And/Or occlude the blended part. (alpha stays linear to compute the fresnel)
         * @hidden
         */
        _this._useLinearAlphaFresnel = false;
        /**
         * Specifies the environment BRDF texture used to compute the scale and offset roughness values
         * from cos theta and roughness:
         * http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
         * @hidden
         */
        _this._environmentBRDFTexture = null;
        /**
         * Force the shader to compute irradiance in the fragment shader in order to take bump in account.
         * @hidden
         */
        _this._forceIrradianceInFragment = false;
        _this._realTimeFiltering = false;
        _this._realTimeFilteringQuality = 8;
        /**
         * Force normal to face away from face.
         * @hidden
         */
        _this._forceNormalForward = false;
        /**
         * Enables specular anti aliasing in the PBR shader.
         * It will both interacts on the Geometry for analytical and IBL lighting.
         * It also prefilter the roughness map based on the bump values.
         * @hidden
         */
        _this._enableSpecularAntiAliasing = false;
        /**
         * Keep track of the image processing observer to allow dispose and replace.
         */
        _this._imageProcessingObserver = null;
        /**
         * Stores the available render targets.
         */
        _this._renderTargets = new SmartArray(16);
        /**
         * Sets the global ambient color for the material used in lighting calculations.
         */
        _this._globalAmbientColor = new Color3(0, 0, 0);
        /**
         * Enables the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        _this._useLogarithmicDepth = false;
        /**
         * If set to true, no lighting calculations will be applied.
         */
        _this._unlit = false;
        _this._debugMode = 0;
        /**
         * @hidden
         * This is reserved for the inspector.
         * Defines the material debug mode.
         * It helps seeing only some components of the material while troubleshooting.
         */
        _this.debugMode = 0;
        /**
         * @hidden
         * This is reserved for the inspector.
         * Specify from where on screen the debug mode should start.
         * The value goes from -1 (full screen) to 1 (not visible)
         * It helps with side by side comparison against the final render
         * This defaults to -1
         */
        _this._debugLimit = -1;
        /**
         * @hidden
         * This is reserved for the inspector.
         * As the default viewing range might not be enough (if the ambient is really small for instance)
         * You can use the factor to better multiply the final value.
         */
        _this._debugFactor = 1;
        _this._cacheHasRenderTargetTextures = false;
        _this.brdf = new PBRBRDFConfiguration(_this);
        _this.clearCoat = new PBRClearCoatConfiguration(_this);
        _this.iridescence = new PBRIridescenceConfiguration(_this);
        _this.anisotropy = new PBRAnisotropicConfiguration(_this);
        _this.sheen = new PBRSheenConfiguration(_this);
        _this.subSurface = new PBRSubSurfaceConfiguration(_this);
        _this.detailMap = new DetailMapConfiguration(_this);
        // Setup the default processing configuration to the scene.
        _this._attachImageProcessingConfiguration(null);
        _this.getRenderTargetTextures = function () {
            _this._renderTargets.reset();
            if (MaterialFlags.ReflectionTextureEnabled && _this._reflectionTexture && _this._reflectionTexture.isRenderTarget) {
                _this._renderTargets.push(_this._reflectionTexture);
            }
            _this._eventInfo.renderTargets = _this._renderTargets;
            _this._callbackPluginEventFillRenderTargetTextures(_this._eventInfo);
            return _this._renderTargets;
        };
        _this._environmentBRDFTexture = GetEnvironmentBRDFTexture(_this.getScene());
        _this.prePassConfiguration = new PrePassConfiguration();
        return _this;
    }
    Object.defineProperty(PBRBaseMaterial.prototype, "realTimeFiltering", {
        /**
         * Enables realtime filtering on the texture.
         */
        get: function () {
            return this._realTimeFiltering;
        },
        set: function (b) {
            this._realTimeFiltering = b;
            this.markAsDirty(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "realTimeFilteringQuality", {
        /**
         * Quality switch for realtime filtering
         */
        get: function () {
            return this._realTimeFilteringQuality;
        },
        set: function (n) {
            this._realTimeFilteringQuality = n;
            this.markAsDirty(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "canRenderToMRT", {
        /**
         * Can this material render to several textures at once
         */
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Attaches a new image processing configuration to the PBR Material.
     * @param configuration
     */
    PBRBaseMaterial.prototype._attachImageProcessingConfiguration = function (configuration) {
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
    Object.defineProperty(PBRBaseMaterial.prototype, "hasRenderTargetTextures", {
        /**
         * Gets a boolean indicating that current material needs to register RTT
         */
        get: function () {
            if (MaterialFlags.ReflectionTextureEnabled && this._reflectionTexture && this._reflectionTexture.isRenderTarget) {
                return true;
            }
            return this._cacheHasRenderTargetTextures;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "isPrePassCapable", {
        /**
         * Can this material render to prepass
         */
        get: function () {
            return !this.disableDepthWrite;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Gets the name of the material class.
     */
    PBRBaseMaterial.prototype.getClassName = function () {
        return "PBRBaseMaterial";
    };
    Object.defineProperty(PBRBaseMaterial.prototype, "useLogarithmicDepth", {
        /**
         * Enabled the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        get: function () {
            return this._useLogarithmicDepth;
        },
        /**
         * Enabled the use of logarithmic depth buffers, which is good for wide depth buffers.
         */
        set: function (value) {
            this._useLogarithmicDepth = value && this.getScene().getEngine().getCaps().fragmentDepthSupported;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PBRBaseMaterial.prototype, "_disableAlphaBlending", {
        /**
         * Returns true if alpha blending should be disabled.
         */
        get: function () {
            var _a;
            return (this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_OPAQUE ||
                this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_ALPHATEST ||
                ((_a = this.subSurface) === null || _a === void 0 ? void 0 : _a.disableAlphaBlending));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Specifies whether or not this material should be rendered in alpha blend mode.
     */
    PBRBaseMaterial.prototype.needAlphaBlending = function () {
        if (this._disableAlphaBlending) {
            return false;
        }
        return this.alpha < 1.0 || this._opacityTexture != null || this._shouldUseAlphaFromAlbedoTexture();
    };
    /**
     * Specifies whether or not this material should be rendered in alpha test mode.
     */
    PBRBaseMaterial.prototype.needAlphaTesting = function () {
        var _a;
        if (this._forceAlphaTest) {
            return true;
        }
        if ((_a = this.subSurface) === null || _a === void 0 ? void 0 : _a.disableAlphaBlending) {
            return false;
        }
        return this._hasAlphaChannel() && (this._transparencyMode == null || this._transparencyMode === PBRBaseMaterial.PBRMATERIAL_ALPHATEST);
    };
    /**
     * Specifies whether or not the alpha value of the albedo texture should be used for alpha blending.
     */
    PBRBaseMaterial.prototype._shouldUseAlphaFromAlbedoTexture = function () {
        return this._albedoTexture != null && this._albedoTexture.hasAlpha && this._useAlphaFromAlbedoTexture && this._transparencyMode !== PBRBaseMaterial.PBRMATERIAL_OPAQUE;
    };
    /**
     * Specifies whether or not there is a usable alpha channel for transparency.
     */
    PBRBaseMaterial.prototype._hasAlphaChannel = function () {
        return (this._albedoTexture != null && this._albedoTexture.hasAlpha) || this._opacityTexture != null;
    };
    /**
     * Gets the texture used for the alpha test.
     */
    PBRBaseMaterial.prototype.getAlphaTestTexture = function () {
        return this._albedoTexture;
    };
    /**
     * Specifies that the submesh is ready to be used.
     * @param mesh - BJS mesh.
     * @param subMesh - A submesh of the BJS mesh.  Used to check if it is ready.
     * @param useInstances - Specifies that instances should be used.
     * @returns - boolean indicating that the submesh is ready or not.
     */
    PBRBaseMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
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
            subMesh.materialDefines = new PBRMaterialDefines(this._eventInfo.defineNames);
        }
        var defines = subMesh.materialDefines;
        if (this._isReadyForSubMesh(subMesh)) {
            return true;
        }
        var scene = this.getScene();
        var engine = scene.getEngine();
        if (defines._areTexturesDirty) {
            this._eventInfo.hasRenderTargetTextures = false;
            this._callbackPluginEventHasRenderTargetTextures(this._eventInfo);
            this._cacheHasRenderTargetTextures = this._eventInfo.hasRenderTargetTextures;
            if (scene.texturesEnabled) {
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    if (!this._albedoTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    if (!this._ambientTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    if (!this._opacityTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                var reflectionTexture = this._getReflectionTexture();
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    if (!reflectionTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                    if (reflectionTexture.irradianceTexture && !reflectionTexture.irradianceTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    if (!this._lightmapTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    if (!this._emissiveTexture.isReadyOrNotBlocking()) {
                        return false;
                    }
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        if (!this._metallicTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    else if (this._reflectivityTexture) {
                        if (!this._reflectivityTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    if (this._metallicReflectanceTexture) {
                        if (!this._metallicReflectanceTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    if (this._reflectanceTexture) {
                        if (!this._reflectanceTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                    if (this._microSurfaceTexture) {
                        if (!this._microSurfaceTexture.isReadyOrNotBlocking()) {
                            return false;
                        }
                    }
                }
                if (engine.getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    // Bump texture cannot be not blocking.
                    if (!this._bumpTexture.isReady()) {
                        return false;
                    }
                }
                if (this._environmentBRDFTexture && MaterialFlags.ReflectionTextureEnabled) {
                    // This is blocking.
                    if (!this._environmentBRDFTexture.isReady()) {
                        return false;
                    }
                }
            }
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
        }
        if (!engine.getCaps().standardDerivatives && !mesh.isVerticesDataPresent(VertexBuffer.NormalKind)) {
            mesh.createNormals(true);
            Logger.Warn("PBRMaterial: Normals have been created for the mesh: " + mesh.name);
        }
        var previousEffect = subMesh.effect;
        var lightDisposed = defines._areLightsDisposed;
        var effect = this._prepareEffect(mesh, defines, this.onCompiled, this.onError, useInstances, null, subMesh.getRenderingMesh().hasThinInstances);
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
        if (!subMesh.effect || !subMesh.effect.isReady()) {
            return false;
        }
        defines._renderId = scene.getRenderId();
        subMesh.effect._wasPreviouslyReady = true;
        return true;
    };
    /**
     * Specifies if the material uses metallic roughness workflow.
     * @returns boolean specifying if the material uses metallic roughness workflow.
     */
    PBRBaseMaterial.prototype.isMetallicWorkflow = function () {
        if (this._metallic != null || this._roughness != null || this._metallicTexture) {
            return true;
        }
        return false;
    };
    PBRBaseMaterial.prototype._prepareEffect = function (mesh, defines, onCompiled, onError, useInstances, useClipPlane, useThinInstances) {
        if (onCompiled === void 0) { onCompiled = null; }
        if (onError === void 0) { onError = null; }
        if (useInstances === void 0) { useInstances = null; }
        if (useClipPlane === void 0) { useClipPlane = null; }
        this._prepareDefines(mesh, defines, useInstances, useClipPlane, useThinInstances);
        if (!defines.isDirty) {
            return null;
        }
        defines.markAsProcessed();
        var scene = this.getScene();
        var engine = scene.getEngine();
        // Fallbacks
        var fallbacks = new EffectFallbacks();
        var fallbackRank = 0;
        if (defines.USESPHERICALINVERTEX) {
            fallbacks.addFallback(fallbackRank++, "USESPHERICALINVERTEX");
        }
        if (defines.FOG) {
            fallbacks.addFallback(fallbackRank, "FOG");
        }
        if (defines.SPECULARAA) {
            fallbacks.addFallback(fallbackRank, "SPECULARAA");
        }
        if (defines.POINTSIZE) {
            fallbacks.addFallback(fallbackRank, "POINTSIZE");
        }
        if (defines.LOGARITHMICDEPTH) {
            fallbacks.addFallback(fallbackRank, "LOGARITHMICDEPTH");
        }
        if (defines.PARALLAX) {
            fallbacks.addFallback(fallbackRank, "PARALLAX");
        }
        if (defines.PARALLAXOCCLUSION) {
            fallbacks.addFallback(fallbackRank++, "PARALLAXOCCLUSION");
        }
        if (defines.ENVIRONMENTBRDF) {
            fallbacks.addFallback(fallbackRank++, "ENVIRONMENTBRDF");
        }
        if (defines.TANGENT) {
            fallbacks.addFallback(fallbackRank++, "TANGENT");
        }
        if (defines.BUMP) {
            fallbacks.addFallback(fallbackRank++, "BUMP");
        }
        fallbackRank = MaterialHelper.HandleFallbacksForShadows(defines, fallbacks, this._maxSimultaneousLights, fallbackRank++);
        if (defines.SPECULARTERM) {
            fallbacks.addFallback(fallbackRank++, "SPECULARTERM");
        }
        if (defines.USESPHERICALFROMREFLECTIONMAP) {
            fallbacks.addFallback(fallbackRank++, "USESPHERICALFROMREFLECTIONMAP");
        }
        if (defines.USEIRRADIANCEMAP) {
            fallbacks.addFallback(fallbackRank++, "USEIRRADIANCEMAP");
        }
        if (defines.LIGHTMAP) {
            fallbacks.addFallback(fallbackRank++, "LIGHTMAP");
        }
        if (defines.NORMAL) {
            fallbacks.addFallback(fallbackRank++, "NORMAL");
        }
        if (defines.AMBIENT) {
            fallbacks.addFallback(fallbackRank++, "AMBIENT");
        }
        if (defines.EMISSIVE) {
            fallbacks.addFallback(fallbackRank++, "EMISSIVE");
        }
        if (defines.VERTEXCOLOR) {
            fallbacks.addFallback(fallbackRank++, "VERTEXCOLOR");
        }
        if (defines.MORPHTARGETS) {
            fallbacks.addFallback(fallbackRank++, "MORPHTARGETS");
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
        if (defines.INSTANCESCOLOR) {
            attribs.push(VertexBuffer.ColorInstanceKind);
        }
        MaterialHelper.PrepareAttributesForBones(attribs, mesh, defines, fallbacks);
        MaterialHelper.PrepareAttributesForInstances(attribs, defines);
        MaterialHelper.PrepareAttributesForMorphTargets(attribs, mesh, defines);
        MaterialHelper.PrepareAttributesForBakedVertexAnimation(attribs, mesh, defines);
        var shaderName = "pbr";
        var uniforms = [
            "world",
            "view",
            "viewProjection",
            "vEyePosition",
            "vLightsType",
            "vAmbientColor",
            "vAlbedoColor",
            "vReflectivityColor",
            "vMetallicReflectanceFactors",
            "vEmissiveColor",
            "visibility",
            "vReflectionColor",
            "vFogInfos",
            "vFogColor",
            "pointSize",
            "vAlbedoInfos",
            "vAmbientInfos",
            "vOpacityInfos",
            "vReflectionInfos",
            "vReflectionPosition",
            "vReflectionSize",
            "vEmissiveInfos",
            "vReflectivityInfos",
            "vReflectionFilteringInfo",
            "vMetallicReflectanceInfos",
            "vReflectanceInfos",
            "vMicroSurfaceSamplerInfos",
            "vBumpInfos",
            "vLightmapInfos",
            "mBones",
            "vClipPlane",
            "vClipPlane2",
            "vClipPlane3",
            "vClipPlane4",
            "vClipPlane5",
            "vClipPlane6",
            "albedoMatrix",
            "ambientMatrix",
            "opacityMatrix",
            "reflectionMatrix",
            "emissiveMatrix",
            "reflectivityMatrix",
            "normalMatrix",
            "microSurfaceSamplerMatrix",
            "bumpMatrix",
            "lightmapMatrix",
            "metallicReflectanceMatrix",
            "reflectanceMatrix",
            "vLightingIntensity",
            "logarithmicDepthConstant",
            "vSphericalX",
            "vSphericalY",
            "vSphericalZ",
            "vSphericalXX_ZZ",
            "vSphericalYY_ZZ",
            "vSphericalZZ",
            "vSphericalXY",
            "vSphericalYZ",
            "vSphericalZX",
            "vSphericalL00",
            "vSphericalL1_1",
            "vSphericalL10",
            "vSphericalL11",
            "vSphericalL2_2",
            "vSphericalL2_1",
            "vSphericalL20",
            "vSphericalL21",
            "vSphericalL22",
            "vReflectionMicrosurfaceInfos",
            "vTangentSpaceParams",
            "boneTextureWidth",
            "vDebugMode",
            "morphTargetTextureInfo",
            "morphTargetTextureIndices",
        ];
        var samplers = [
            "albedoSampler",
            "reflectivitySampler",
            "ambientSampler",
            "emissiveSampler",
            "bumpSampler",
            "lightmapSampler",
            "opacitySampler",
            "reflectionSampler",
            "reflectionSamplerLow",
            "reflectionSamplerHigh",
            "irradianceSampler",
            "microSurfaceSampler",
            "environmentBrdfSampler",
            "boneSampler",
            "metallicReflectanceSampler",
            "reflectanceSampler",
            "morphTargets",
            "oitDepthSampler",
            "oitFrontColorSampler",
        ];
        var uniformBuffers = ["Material", "Scene", "Mesh"];
        this._eventInfo.fallbacks = fallbacks;
        this._eventInfo.fallbackRank = fallbackRank;
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
        return engine.createEffect(shaderName, {
            attributes: attribs,
            uniformsNames: uniforms,
            uniformBuffersNames: uniformBuffers,
            samplers: samplers,
            defines: join,
            fallbacks: fallbacks,
            onCompiled: onCompiled,
            onError: onError,
            indexParameters: { maxSimultaneousLights: this._maxSimultaneousLights, maxSimultaneousMorphTargets: defines.NUM_MORPH_INFLUENCERS },
            processFinalCode: csnrOptions.processFinalCode,
            processCodeAfterIncludes: this._eventInfo.customCode,
            multiTarget: defines.PREPASS,
        }, engine);
    };
    PBRBaseMaterial.prototype._prepareDefines = function (mesh, defines, useInstances, useClipPlane, useThinInstances) {
        var _a;
        if (useInstances === void 0) { useInstances = null; }
        if (useClipPlane === void 0) { useClipPlane = null; }
        if (useThinInstances === void 0) { useThinInstances = false; }
        var scene = this.getScene();
        var engine = scene.getEngine();
        // Lights
        MaterialHelper.PrepareDefinesForLights(scene, mesh, defines, true, this._maxSimultaneousLights, this._disableLighting);
        defines._needNormals = true;
        // Multiview
        MaterialHelper.PrepareDefinesForMultiview(scene, defines);
        // PrePass
        var oit = this.needAlphaBlendingForMesh(mesh) && this.getScene().useOrderIndependentTransparency;
        MaterialHelper.PrepareDefinesForPrePass(scene, defines, this.canRenderToMRT && !oit);
        // Order independant transparency
        MaterialHelper.PrepareDefinesForOIT(scene, defines, oit);
        // Textures
        defines.METALLICWORKFLOW = this.isMetallicWorkflow();
        if (defines._areTexturesDirty) {
            defines._needUVs = false;
            if (scene.texturesEnabled) {
                if (scene.getEngine().getCaps().textureLOD) {
                    defines.LODBASEDMICROSFURACE = true;
                }
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._albedoTexture, defines, "ALBEDO");
                    defines.GAMMAALBEDO = this._albedoTexture.gammaSpace;
                }
                else {
                    defines.ALBEDO = false;
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._ambientTexture, defines, "AMBIENT");
                    defines.AMBIENTINGRAYSCALE = this._useAmbientInGrayScale;
                }
                else {
                    defines.AMBIENT = false;
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._opacityTexture, defines, "OPACITY");
                    defines.OPACITYRGB = this._opacityTexture.getAlphaFromRGB;
                }
                else {
                    defines.OPACITY = false;
                }
                var reflectionTexture = this._getReflectionTexture();
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    defines.REFLECTION = true;
                    defines.GAMMAREFLECTION = reflectionTexture.gammaSpace;
                    defines.RGBDREFLECTION = reflectionTexture.isRGBD;
                    defines.LODINREFLECTIONALPHA = reflectionTexture.lodLevelInAlpha;
                    defines.LINEARSPECULARREFLECTION = reflectionTexture.linearSpecularLOD;
                    if (this.realTimeFiltering && this.realTimeFilteringQuality > 0) {
                        defines.NUM_SAMPLES = "" + this.realTimeFilteringQuality;
                        if (engine._features.needTypeSuffixInShaderConstants) {
                            defines.NUM_SAMPLES = defines.NUM_SAMPLES + "u";
                        }
                        defines.REALTIME_FILTERING = true;
                    }
                    else {
                        defines.REALTIME_FILTERING = false;
                    }
                    if (reflectionTexture.coordinatesMode === Texture.INVCUBIC_MODE) {
                        defines.INVERTCUBICMAP = true;
                    }
                    defines.REFLECTIONMAP_3D = reflectionTexture.isCube;
                    defines.REFLECTIONMAP_OPPOSITEZ = defines.REFLECTIONMAP_3D && this.getScene().useRightHandedSystem ? !reflectionTexture.invertZ : reflectionTexture.invertZ;
                    defines.REFLECTIONMAP_CUBIC = false;
                    defines.REFLECTIONMAP_EXPLICIT = false;
                    defines.REFLECTIONMAP_PLANAR = false;
                    defines.REFLECTIONMAP_PROJECTION = false;
                    defines.REFLECTIONMAP_SKYBOX = false;
                    defines.REFLECTIONMAP_SPHERICAL = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
                    defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
                    switch (reflectionTexture.coordinatesMode) {
                        case Texture.EXPLICIT_MODE:
                            defines.REFLECTIONMAP_EXPLICIT = true;
                            break;
                        case Texture.PLANAR_MODE:
                            defines.REFLECTIONMAP_PLANAR = true;
                            break;
                        case Texture.PROJECTION_MODE:
                            defines.REFLECTIONMAP_PROJECTION = true;
                            break;
                        case Texture.SKYBOX_MODE:
                            defines.REFLECTIONMAP_SKYBOX = true;
                            break;
                        case Texture.SPHERICAL_MODE:
                            defines.REFLECTIONMAP_SPHERICAL = true;
                            break;
                        case Texture.EQUIRECTANGULAR_MODE:
                            defines.REFLECTIONMAP_EQUIRECTANGULAR = true;
                            break;
                        case Texture.FIXED_EQUIRECTANGULAR_MODE:
                            defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = true;
                            break;
                        case Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE:
                            defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = true;
                            break;
                        case Texture.CUBIC_MODE:
                        case Texture.INVCUBIC_MODE:
                        default:
                            defines.REFLECTIONMAP_CUBIC = true;
                            defines.USE_LOCAL_REFLECTIONMAP_CUBIC = reflectionTexture.boundingBoxSize ? true : false;
                            break;
                    }
                    if (reflectionTexture.coordinatesMode !== Texture.SKYBOX_MODE) {
                        if (reflectionTexture.irradianceTexture) {
                            defines.USEIRRADIANCEMAP = true;
                            defines.USESPHERICALFROMREFLECTIONMAP = false;
                        }
                        // Assume using spherical polynomial if the reflection texture is a cube map
                        else if (reflectionTexture.isCube) {
                            defines.USESPHERICALFROMREFLECTIONMAP = true;
                            defines.USEIRRADIANCEMAP = false;
                            if (this._forceIrradianceInFragment || this.realTimeFiltering || scene.getEngine().getCaps().maxVaryingVectors <= 8) {
                                defines.USESPHERICALINVERTEX = false;
                            }
                            else {
                                defines.USESPHERICALINVERTEX = true;
                            }
                        }
                    }
                }
                else {
                    defines.REFLECTION = false;
                    defines.REFLECTIONMAP_3D = false;
                    defines.REFLECTIONMAP_SPHERICAL = false;
                    defines.REFLECTIONMAP_PLANAR = false;
                    defines.REFLECTIONMAP_CUBIC = false;
                    defines.USE_LOCAL_REFLECTIONMAP_CUBIC = false;
                    defines.REFLECTIONMAP_PROJECTION = false;
                    defines.REFLECTIONMAP_SKYBOX = false;
                    defines.REFLECTIONMAP_EXPLICIT = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR = false;
                    defines.REFLECTIONMAP_EQUIRECTANGULAR_FIXED = false;
                    defines.REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED = false;
                    defines.INVERTCUBICMAP = false;
                    defines.USESPHERICALFROMREFLECTIONMAP = false;
                    defines.USEIRRADIANCEMAP = false;
                    defines.USESPHERICALINVERTEX = false;
                    defines.REFLECTIONMAP_OPPOSITEZ = false;
                    defines.LODINREFLECTIONALPHA = false;
                    defines.GAMMAREFLECTION = false;
                    defines.RGBDREFLECTION = false;
                    defines.LINEARSPECULARREFLECTION = false;
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._lightmapTexture, defines, "LIGHTMAP");
                    defines.USELIGHTMAPASSHADOWMAP = this._useLightmapAsShadowmap;
                    defines.GAMMALIGHTMAP = this._lightmapTexture.gammaSpace;
                    defines.RGBDLIGHTMAP = this._lightmapTexture.isRGBD;
                }
                else {
                    defines.LIGHTMAP = false;
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._emissiveTexture, defines, "EMISSIVE");
                    defines.GAMMAEMISSIVE = this._emissiveTexture.gammaSpace;
                }
                else {
                    defines.EMISSIVE = false;
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._metallicTexture, defines, "REFLECTIVITY");
                        defines.ROUGHNESSSTOREINMETALMAPALPHA = this._useRoughnessFromMetallicTextureAlpha;
                        defines.ROUGHNESSSTOREINMETALMAPGREEN = !this._useRoughnessFromMetallicTextureAlpha && this._useRoughnessFromMetallicTextureGreen;
                        defines.METALLNESSSTOREINMETALMAPBLUE = this._useMetallnessFromMetallicTextureBlue;
                        defines.AOSTOREINMETALMAPRED = this._useAmbientOcclusionFromMetallicTextureRed;
                        defines.REFLECTIVITY_GAMMA = false;
                    }
                    else if (this._reflectivityTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._reflectivityTexture, defines, "REFLECTIVITY");
                        defines.MICROSURFACEFROMREFLECTIVITYMAP = this._useMicroSurfaceFromReflectivityMapAlpha;
                        defines.MICROSURFACEAUTOMATIC = this._useAutoMicroSurfaceFromReflectivityMap;
                        defines.REFLECTIVITY_GAMMA = this._reflectivityTexture.gammaSpace;
                    }
                    else {
                        defines.REFLECTIVITY = false;
                    }
                    if (this._metallicReflectanceTexture || this._reflectanceTexture) {
                        var identicalTextures = this._metallicReflectanceTexture !== null &&
                            this._metallicReflectanceTexture._texture === ((_a = this._reflectanceTexture) === null || _a === void 0 ? void 0 : _a._texture) &&
                            this._metallicReflectanceTexture.checkTransformsAreIdentical(this._reflectanceTexture);
                        defines.METALLIC_REFLECTANCE_USE_ALPHA_ONLY = this._useOnlyMetallicFromMetallicReflectanceTexture && !identicalTextures;
                        if (this._metallicReflectanceTexture) {
                            MaterialHelper.PrepareDefinesForMergedUV(this._metallicReflectanceTexture, defines, "METALLIC_REFLECTANCE");
                            defines.METALLIC_REFLECTANCE_GAMMA = this._metallicReflectanceTexture.gammaSpace;
                        }
                        else {
                            defines.METALLIC_REFLECTANCE = false;
                        }
                        if (this._reflectanceTexture &&
                            !identicalTextures &&
                            (!this._metallicReflectanceTexture || (this._metallicReflectanceTexture && this._useOnlyMetallicFromMetallicReflectanceTexture))) {
                            MaterialHelper.PrepareDefinesForMergedUV(this._reflectanceTexture, defines, "REFLECTANCE");
                            defines.REFLECTANCE_GAMMA = this._reflectanceTexture.gammaSpace;
                        }
                        else {
                            defines.REFLECTANCE = false;
                        }
                    }
                    else {
                        defines.METALLIC_REFLECTANCE = false;
                        defines.REFLECTANCE = false;
                    }
                    if (this._microSurfaceTexture) {
                        MaterialHelper.PrepareDefinesForMergedUV(this._microSurfaceTexture, defines, "MICROSURFACEMAP");
                    }
                    else {
                        defines.MICROSURFACEMAP = false;
                    }
                }
                else {
                    defines.REFLECTIVITY = false;
                    defines.MICROSURFACEMAP = false;
                }
                if (scene.getEngine().getCaps().standardDerivatives && this._bumpTexture && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    MaterialHelper.PrepareDefinesForMergedUV(this._bumpTexture, defines, "BUMP");
                    if (this._useParallax && this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                        defines.PARALLAX = true;
                        defines.PARALLAXOCCLUSION = !!this._useParallaxOcclusion;
                    }
                    else {
                        defines.PARALLAX = false;
                    }
                    defines.OBJECTSPACE_NORMALMAP = this._useObjectSpaceNormalMap;
                }
                else {
                    defines.BUMP = false;
                }
                if (this._environmentBRDFTexture && MaterialFlags.ReflectionTextureEnabled) {
                    defines.ENVIRONMENTBRDF = true;
                    defines.ENVIRONMENTBRDF_RGBD = this._environmentBRDFTexture.isRGBD;
                }
                else {
                    defines.ENVIRONMENTBRDF = false;
                    defines.ENVIRONMENTBRDF_RGBD = false;
                }
                if (this._shouldUseAlphaFromAlbedoTexture()) {
                    defines.ALPHAFROMALBEDO = true;
                }
                else {
                    defines.ALPHAFROMALBEDO = false;
                }
            }
            defines.SPECULAROVERALPHA = this._useSpecularOverAlpha;
            if (this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_STANDARD) {
                defines.USEPHYSICALLIGHTFALLOFF = false;
                defines.USEGLTFLIGHTFALLOFF = false;
            }
            else if (this._lightFalloff === PBRBaseMaterial.LIGHTFALLOFF_GLTF) {
                defines.USEPHYSICALLIGHTFALLOFF = false;
                defines.USEGLTFLIGHTFALLOFF = true;
            }
            else {
                defines.USEPHYSICALLIGHTFALLOFF = true;
                defines.USEGLTFLIGHTFALLOFF = false;
            }
            defines.RADIANCEOVERALPHA = this._useRadianceOverAlpha;
            if (!this.backFaceCulling && this._twoSidedLighting) {
                defines.TWOSIDEDLIGHTING = true;
            }
            else {
                defines.TWOSIDEDLIGHTING = false;
            }
            defines.SPECULARAA = scene.getEngine().getCaps().standardDerivatives && this._enableSpecularAntiAliasing;
        }
        if (defines._areTexturesDirty || defines._areMiscDirty) {
            defines.ALPHATESTVALUE = "".concat(this._alphaCutOff).concat(this._alphaCutOff % 1 === 0 ? "." : "");
            defines.PREMULTIPLYALPHA = this.alphaMode === 7 || this.alphaMode === 8;
            defines.ALPHABLEND = this.needAlphaBlendingForMesh(mesh);
            defines.ALPHAFRESNEL = this._useAlphaFresnel || this._useLinearAlphaFresnel;
            defines.LINEARALPHAFRESNEL = this._useLinearAlphaFresnel;
        }
        if (defines._areImageProcessingDirty && this._imageProcessingConfiguration) {
            this._imageProcessingConfiguration.prepareDefines(defines);
        }
        defines.FORCENORMALFORWARD = this._forceNormalForward;
        defines.RADIANCEOCCLUSION = this._useRadianceOcclusion;
        defines.HORIZONOCCLUSION = this._useHorizonOcclusion;
        // Misc.
        if (defines._areMiscDirty) {
            MaterialHelper.PrepareDefinesForMisc(mesh, scene, this._useLogarithmicDepth, this.pointsCloud, this.fogEnabled, this._shouldTurnAlphaTestOn(mesh) || this._forceAlphaTest, defines);
            defines.UNLIT = this._unlit || ((this.pointsCloud || this.wireframe) && !mesh.isVerticesDataPresent(VertexBuffer.NormalKind));
            defines.DEBUGMODE = this._debugMode;
        }
        // External config
        this._eventInfo.defines = defines;
        this._eventInfo.mesh = mesh;
        this._callbackPluginEventPrepareDefines(this._eventInfo);
        // Values that need to be evaluated on every frame
        MaterialHelper.PrepareDefinesForFrameBoundValues(scene, engine, defines, useInstances ? true : false, useClipPlane, useThinInstances);
        // Attribs
        MaterialHelper.PrepareDefinesForAttributes(mesh, defines, true, true, true, this._transparencyMode !== PBRBaseMaterial.PBRMATERIAL_OPAQUE);
    };
    /**
     * Force shader compilation
     * @param mesh
     * @param onCompiled
     * @param options
     */
    PBRBaseMaterial.prototype.forceCompilation = function (mesh, onCompiled, options) {
        var _this = this;
        var localOptions = __assign({ clipPlane: false, useInstances: false }, options);
        if (!this._uniformBufferLayoutBuilt) {
            this.buildUniformLayout();
        }
        this._callbackPluginEventGeneric(MaterialPluginEvent.GetDefineNames, this._eventInfo);
        var defines = new PBRMaterialDefines(this._eventInfo.defineNames);
        var effect = this._prepareEffect(mesh, defines, undefined, undefined, localOptions.useInstances, localOptions.clipPlane, mesh.hasThinInstances);
        if (this._onEffectCreatedObservable) {
            onCreatedEffectParameters.effect = effect;
            onCreatedEffectParameters.subMesh = null;
            this._onEffectCreatedObservable.notifyObservers(onCreatedEffectParameters);
        }
        if (effect.isReady()) {
            if (onCompiled) {
                onCompiled(this);
            }
        }
        else {
            effect.onCompileObservable.add(function () {
                if (onCompiled) {
                    onCompiled(_this);
                }
            });
        }
    };
    /**
     * Initializes the uniform buffer layout for the shader.
     */
    PBRBaseMaterial.prototype.buildUniformLayout = function () {
        // Order is important !
        var ubo = this._uniformBuffer;
        ubo.addUniform("vAlbedoInfos", 2);
        ubo.addUniform("vAmbientInfos", 4);
        ubo.addUniform("vOpacityInfos", 2);
        ubo.addUniform("vEmissiveInfos", 2);
        ubo.addUniform("vLightmapInfos", 2);
        ubo.addUniform("vReflectivityInfos", 3);
        ubo.addUniform("vMicroSurfaceSamplerInfos", 2);
        ubo.addUniform("vReflectionInfos", 2);
        ubo.addUniform("vReflectionFilteringInfo", 2);
        ubo.addUniform("vReflectionPosition", 3);
        ubo.addUniform("vReflectionSize", 3);
        ubo.addUniform("vBumpInfos", 3);
        ubo.addUniform("albedoMatrix", 16);
        ubo.addUniform("ambientMatrix", 16);
        ubo.addUniform("opacityMatrix", 16);
        ubo.addUniform("emissiveMatrix", 16);
        ubo.addUniform("lightmapMatrix", 16);
        ubo.addUniform("reflectivityMatrix", 16);
        ubo.addUniform("microSurfaceSamplerMatrix", 16);
        ubo.addUniform("bumpMatrix", 16);
        ubo.addUniform("vTangentSpaceParams", 2);
        ubo.addUniform("reflectionMatrix", 16);
        ubo.addUniform("vReflectionColor", 3);
        ubo.addUniform("vAlbedoColor", 4);
        ubo.addUniform("vLightingIntensity", 4);
        ubo.addUniform("vReflectionMicrosurfaceInfos", 3);
        ubo.addUniform("pointSize", 1);
        ubo.addUniform("vReflectivityColor", 4);
        ubo.addUniform("vEmissiveColor", 3);
        ubo.addUniform("vAmbientColor", 3);
        ubo.addUniform("vDebugMode", 2);
        ubo.addUniform("vMetallicReflectanceFactors", 4);
        ubo.addUniform("vMetallicReflectanceInfos", 2);
        ubo.addUniform("metallicReflectanceMatrix", 16);
        ubo.addUniform("vReflectanceInfos", 2);
        ubo.addUniform("reflectanceMatrix", 16);
        ubo.addUniform("vSphericalL00", 3);
        ubo.addUniform("vSphericalL1_1", 3);
        ubo.addUniform("vSphericalL10", 3);
        ubo.addUniform("vSphericalL11", 3);
        ubo.addUniform("vSphericalL2_2", 3);
        ubo.addUniform("vSphericalL2_1", 3);
        ubo.addUniform("vSphericalL20", 3);
        ubo.addUniform("vSphericalL21", 3);
        ubo.addUniform("vSphericalL22", 3);
        ubo.addUniform("vSphericalX", 3);
        ubo.addUniform("vSphericalY", 3);
        ubo.addUniform("vSphericalZ", 3);
        ubo.addUniform("vSphericalXX_ZZ", 3);
        ubo.addUniform("vSphericalYY_ZZ", 3);
        ubo.addUniform("vSphericalZZ", 3);
        ubo.addUniform("vSphericalXY", 3);
        ubo.addUniform("vSphericalYZ", 3);
        ubo.addUniform("vSphericalZX", 3);
        _super.prototype.buildUniformLayout.call(this);
    };
    /**
     * Binds the submesh data.
     * @param world - The world matrix.
     * @param mesh - The BJS mesh.
     * @param subMesh - A submesh of the BJS mesh.
     */
    PBRBaseMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
        var _a, _b, _c, _d;
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
        var engine = scene.getEngine();
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
        MaterialHelper.BindBonesParameters(mesh, this._activeEffect, this.prePassConfiguration);
        var reflectionTexture = null;
        var ubo = this._uniformBuffer;
        if (mustRebind) {
            this.bindViewProjection(effect);
            reflectionTexture = this._getReflectionTexture();
            if (!ubo.useUbo || !this.isFrozen || !ubo.isSync) {
                // Texture uniforms
                if (scene.texturesEnabled) {
                    if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                        ubo.updateFloat2("vAlbedoInfos", this._albedoTexture.coordinatesIndex, this._albedoTexture.level);
                        MaterialHelper.BindTextureMatrix(this._albedoTexture, ubo, "albedo");
                    }
                    if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                        ubo.updateFloat4("vAmbientInfos", this._ambientTexture.coordinatesIndex, this._ambientTexture.level, this._ambientTextureStrength, this._ambientTextureImpactOnAnalyticalLights);
                        MaterialHelper.BindTextureMatrix(this._ambientTexture, ubo, "ambient");
                    }
                    if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                        ubo.updateFloat2("vOpacityInfos", this._opacityTexture.coordinatesIndex, this._opacityTexture.level);
                        MaterialHelper.BindTextureMatrix(this._opacityTexture, ubo, "opacity");
                    }
                    if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                        ubo.updateMatrix("reflectionMatrix", reflectionTexture.getReflectionTextureMatrix());
                        ubo.updateFloat2("vReflectionInfos", reflectionTexture.level, 0);
                        if (reflectionTexture.boundingBoxSize) {
                            var cubeTexture = reflectionTexture;
                            ubo.updateVector3("vReflectionPosition", cubeTexture.boundingBoxPosition);
                            ubo.updateVector3("vReflectionSize", cubeTexture.boundingBoxSize);
                        }
                        if (this.realTimeFiltering) {
                            var width = reflectionTexture.getSize().width;
                            ubo.updateFloat2("vReflectionFilteringInfo", width, Scalar.Log2(width));
                        }
                        if (!defines.USEIRRADIANCEMAP) {
                            var polynomials = reflectionTexture.sphericalPolynomial;
                            if (defines.USESPHERICALFROMREFLECTIONMAP && polynomials) {
                                if (defines.SPHERICAL_HARMONICS) {
                                    var preScaledHarmonics = polynomials.preScaledHarmonics;
                                    ubo.updateVector3("vSphericalL00", preScaledHarmonics.l00);
                                    ubo.updateVector3("vSphericalL1_1", preScaledHarmonics.l1_1);
                                    ubo.updateVector3("vSphericalL10", preScaledHarmonics.l10);
                                    ubo.updateVector3("vSphericalL11", preScaledHarmonics.l11);
                                    ubo.updateVector3("vSphericalL2_2", preScaledHarmonics.l2_2);
                                    ubo.updateVector3("vSphericalL2_1", preScaledHarmonics.l2_1);
                                    ubo.updateVector3("vSphericalL20", preScaledHarmonics.l20);
                                    ubo.updateVector3("vSphericalL21", preScaledHarmonics.l21);
                                    ubo.updateVector3("vSphericalL22", preScaledHarmonics.l22);
                                }
                                else {
                                    ubo.updateFloat3("vSphericalX", polynomials.x.x, polynomials.x.y, polynomials.x.z);
                                    ubo.updateFloat3("vSphericalY", polynomials.y.x, polynomials.y.y, polynomials.y.z);
                                    ubo.updateFloat3("vSphericalZ", polynomials.z.x, polynomials.z.y, polynomials.z.z);
                                    ubo.updateFloat3("vSphericalXX_ZZ", polynomials.xx.x - polynomials.zz.x, polynomials.xx.y - polynomials.zz.y, polynomials.xx.z - polynomials.zz.z);
                                    ubo.updateFloat3("vSphericalYY_ZZ", polynomials.yy.x - polynomials.zz.x, polynomials.yy.y - polynomials.zz.y, polynomials.yy.z - polynomials.zz.z);
                                    ubo.updateFloat3("vSphericalZZ", polynomials.zz.x, polynomials.zz.y, polynomials.zz.z);
                                    ubo.updateFloat3("vSphericalXY", polynomials.xy.x, polynomials.xy.y, polynomials.xy.z);
                                    ubo.updateFloat3("vSphericalYZ", polynomials.yz.x, polynomials.yz.y, polynomials.yz.z);
                                    ubo.updateFloat3("vSphericalZX", polynomials.zx.x, polynomials.zx.y, polynomials.zx.z);
                                }
                            }
                        }
                        ubo.updateFloat3("vReflectionMicrosurfaceInfos", reflectionTexture.getSize().width, reflectionTexture.lodGenerationScale, reflectionTexture.lodGenerationOffset);
                    }
                    if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                        ubo.updateFloat2("vEmissiveInfos", this._emissiveTexture.coordinatesIndex, this._emissiveTexture.level);
                        MaterialHelper.BindTextureMatrix(this._emissiveTexture, ubo, "emissive");
                    }
                    if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                        ubo.updateFloat2("vLightmapInfos", this._lightmapTexture.coordinatesIndex, this._lightmapTexture.level);
                        MaterialHelper.BindTextureMatrix(this._lightmapTexture, ubo, "lightmap");
                    }
                    if (MaterialFlags.SpecularTextureEnabled) {
                        if (this._metallicTexture) {
                            ubo.updateFloat3("vReflectivityInfos", this._metallicTexture.coordinatesIndex, this._metallicTexture.level, this._ambientTextureStrength);
                            MaterialHelper.BindTextureMatrix(this._metallicTexture, ubo, "reflectivity");
                        }
                        else if (this._reflectivityTexture) {
                            ubo.updateFloat3("vReflectivityInfos", this._reflectivityTexture.coordinatesIndex, this._reflectivityTexture.level, 1.0);
                            MaterialHelper.BindTextureMatrix(this._reflectivityTexture, ubo, "reflectivity");
                        }
                        if (this._metallicReflectanceTexture) {
                            ubo.updateFloat2("vMetallicReflectanceInfos", this._metallicReflectanceTexture.coordinatesIndex, this._metallicReflectanceTexture.level);
                            MaterialHelper.BindTextureMatrix(this._metallicReflectanceTexture, ubo, "metallicReflectance");
                        }
                        if (this._reflectanceTexture && defines.REFLECTANCE) {
                            ubo.updateFloat2("vReflectanceInfos", this._reflectanceTexture.coordinatesIndex, this._reflectanceTexture.level);
                            MaterialHelper.BindTextureMatrix(this._reflectanceTexture, ubo, "reflectance");
                        }
                        if (this._microSurfaceTexture) {
                            ubo.updateFloat2("vMicroSurfaceSamplerInfos", this._microSurfaceTexture.coordinatesIndex, this._microSurfaceTexture.level);
                            MaterialHelper.BindTextureMatrix(this._microSurfaceTexture, ubo, "microSurfaceSampler");
                        }
                    }
                    if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                        ubo.updateFloat3("vBumpInfos", this._bumpTexture.coordinatesIndex, this._bumpTexture.level, this._parallaxScaleBias);
                        MaterialHelper.BindTextureMatrix(this._bumpTexture, ubo, "bump");
                        if (scene._mirroredCameraPosition) {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? 1.0 : -1.0, this._invertNormalMapY ? 1.0 : -1.0);
                        }
                        else {
                            ubo.updateFloat2("vTangentSpaceParams", this._invertNormalMapX ? -1.0 : 1.0, this._invertNormalMapY ? -1.0 : 1.0);
                        }
                    }
                }
                // Point size
                if (this.pointsCloud) {
                    ubo.updateFloat("pointSize", this.pointSize);
                }
                // Colors
                if (defines.METALLICWORKFLOW) {
                    TmpColors.Color3[0].r = this._metallic === undefined || this._metallic === null ? 1 : this._metallic;
                    TmpColors.Color3[0].g = this._roughness === undefined || this._roughness === null ? 1 : this._roughness;
                    ubo.updateColor4("vReflectivityColor", TmpColors.Color3[0], 1);
                    var ior = (_b = (_a = this.subSurface) === null || _a === void 0 ? void 0 : _a._indexOfRefraction) !== null && _b !== void 0 ? _b : 1.5;
                    var outsideIOR = 1; // consider air as clear coat and other layers would remap in the shader.
                    // We are here deriving our default reflectance from a common value for none metallic surface.
                    // Based of the schlick fresnel approximation model
                    // for dielectrics.
                    var f0 = Math.pow((ior - outsideIOR) / (ior + outsideIOR), 2);
                    // Tweak the default F0 and F90 based on our given setup
                    this._metallicReflectanceColor.scaleToRef(f0 * this._metallicF0Factor, TmpColors.Color3[0]);
                    var metallicF90 = this._metallicF0Factor;
                    ubo.updateColor4("vMetallicReflectanceFactors", TmpColors.Color3[0], metallicF90);
                }
                else {
                    ubo.updateColor4("vReflectivityColor", this._reflectivityColor, this._microSurface);
                }
                ubo.updateColor3("vEmissiveColor", MaterialFlags.EmissiveTextureEnabled ? this._emissiveColor : Color3.BlackReadOnly);
                ubo.updateColor3("vReflectionColor", this._reflectionColor);
                if (!defines.SS_REFRACTION && ((_c = this.subSurface) === null || _c === void 0 ? void 0 : _c._linkRefractionWithTransparency)) {
                    ubo.updateColor4("vAlbedoColor", this._albedoColor, 1);
                }
                else {
                    ubo.updateColor4("vAlbedoColor", this._albedoColor, this.alpha);
                }
                // Misc
                this._lightingInfos.x = this._directIntensity;
                this._lightingInfos.y = this._emissiveIntensity;
                this._lightingInfos.z = this._environmentIntensity * scene.environmentIntensity;
                this._lightingInfos.w = this._specularIntensity;
                ubo.updateVector4("vLightingIntensity", this._lightingInfos);
                // Colors
                scene.ambientColor.multiplyToRef(this._ambientColor, this._globalAmbientColor);
                ubo.updateColor3("vAmbientColor", this._globalAmbientColor);
                ubo.updateFloat2("vDebugMode", this._debugLimit, this._debugFactor);
            }
            // Textures
            if (scene.texturesEnabled) {
                if (this._albedoTexture && MaterialFlags.DiffuseTextureEnabled) {
                    ubo.setTexture("albedoSampler", this._albedoTexture);
                }
                if (this._ambientTexture && MaterialFlags.AmbientTextureEnabled) {
                    ubo.setTexture("ambientSampler", this._ambientTexture);
                }
                if (this._opacityTexture && MaterialFlags.OpacityTextureEnabled) {
                    ubo.setTexture("opacitySampler", this._opacityTexture);
                }
                if (reflectionTexture && MaterialFlags.ReflectionTextureEnabled) {
                    if (defines.LODBASEDMICROSFURACE) {
                        ubo.setTexture("reflectionSampler", reflectionTexture);
                    }
                    else {
                        ubo.setTexture("reflectionSampler", reflectionTexture._lodTextureMid || reflectionTexture);
                        ubo.setTexture("reflectionSamplerLow", reflectionTexture._lodTextureLow || reflectionTexture);
                        ubo.setTexture("reflectionSamplerHigh", reflectionTexture._lodTextureHigh || reflectionTexture);
                    }
                    if (defines.USEIRRADIANCEMAP) {
                        ubo.setTexture("irradianceSampler", reflectionTexture.irradianceTexture);
                    }
                }
                if (defines.ENVIRONMENTBRDF) {
                    ubo.setTexture("environmentBrdfSampler", this._environmentBRDFTexture);
                }
                if (this._emissiveTexture && MaterialFlags.EmissiveTextureEnabled) {
                    ubo.setTexture("emissiveSampler", this._emissiveTexture);
                }
                if (this._lightmapTexture && MaterialFlags.LightmapTextureEnabled) {
                    ubo.setTexture("lightmapSampler", this._lightmapTexture);
                }
                if (MaterialFlags.SpecularTextureEnabled) {
                    if (this._metallicTexture) {
                        ubo.setTexture("reflectivitySampler", this._metallicTexture);
                    }
                    else if (this._reflectivityTexture) {
                        ubo.setTexture("reflectivitySampler", this._reflectivityTexture);
                    }
                    if (this._metallicReflectanceTexture) {
                        ubo.setTexture("metallicReflectanceSampler", this._metallicReflectanceTexture);
                    }
                    if (this._reflectanceTexture && defines.REFLECTANCE) {
                        ubo.setTexture("reflectanceSampler", this._reflectanceTexture);
                    }
                    if (this._microSurfaceTexture) {
                        ubo.setTexture("microSurfaceSampler", this._microSurfaceTexture);
                    }
                }
                if (this._bumpTexture && engine.getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled && !this._disableBumpMap) {
                    ubo.setTexture("bumpSampler", this._bumpTexture);
                }
            }
            // OIT with depth peeling
            if (this.getScene().useOrderIndependentTransparency && this.needAlphaBlendingForMesh(mesh)) {
                this.getScene().depthPeelingRenderer.bind(effect);
            }
            this._eventInfo.subMesh = subMesh;
            this._callbackPluginEventBindForSubMesh(this._eventInfo);
            // Clip plane
            MaterialHelper.BindClipPlane(this._activeEffect, scene);
            this.bindEyePosition(effect);
        }
        else if (scene.getEngine()._features.needToAlwaysBindUniformBuffers) {
            this._needToBindSceneUbo = true;
        }
        if (mustRebind || !this.isFrozen) {
            // Lights
            if (scene.lightsEnabled && !this._disableLighting) {
                MaterialHelper.BindLights(scene, mesh, this._activeEffect, defines, this._maxSimultaneousLights);
            }
            // View
            if ((scene.fogEnabled && mesh.applyFog && scene.fogMode !== Scene.FOGMODE_NONE) || reflectionTexture || mesh.receiveShadows) {
                this.bindView(effect);
            }
            // Fog
            MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect, true);
            // Morph targets
            if (defines.NUM_MORPH_INFLUENCERS) {
                MaterialHelper.BindMorphTargetParameters(mesh, this._activeEffect);
            }
            if (defines.BAKED_VERTEX_ANIMATION_TEXTURE) {
                (_d = mesh.bakedVertexAnimationManager) === null || _d === void 0 ? void 0 : _d.bind(effect, defines.INSTANCES);
            }
            // image processing
            this._imageProcessingConfiguration.bind(this._activeEffect);
            // Log. depth
            MaterialHelper.BindLogDepth(defines, this._activeEffect, scene);
        }
        this._afterBind(mesh, this._activeEffect);
        ubo.update();
    };
    /**
     * Returns the animatable textures.
     * @returns - Array of animatable textures.
     */
    PBRBaseMaterial.prototype.getAnimatables = function () {
        var results = _super.prototype.getAnimatables.call(this);
        if (this._albedoTexture && this._albedoTexture.animations && this._albedoTexture.animations.length > 0) {
            results.push(this._albedoTexture);
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
        if (this._metallicTexture && this._metallicTexture.animations && this._metallicTexture.animations.length > 0) {
            results.push(this._metallicTexture);
        }
        else if (this._reflectivityTexture && this._reflectivityTexture.animations && this._reflectivityTexture.animations.length > 0) {
            results.push(this._reflectivityTexture);
        }
        if (this._bumpTexture && this._bumpTexture.animations && this._bumpTexture.animations.length > 0) {
            results.push(this._bumpTexture);
        }
        if (this._lightmapTexture && this._lightmapTexture.animations && this._lightmapTexture.animations.length > 0) {
            results.push(this._lightmapTexture);
        }
        return results;
    };
    /**
     * Returns the texture used for reflections.
     * @returns - Reflection texture if present.  Otherwise, returns the environment texture.
     */
    PBRBaseMaterial.prototype._getReflectionTexture = function () {
        if (this._reflectionTexture) {
            return this._reflectionTexture;
        }
        return this.getScene().environmentTexture;
    };
    /**
     * Returns an array of the actively used textures.
     * @returns - Array of BaseTextures
     */
    PBRBaseMaterial.prototype.getActiveTextures = function () {
        var activeTextures = _super.prototype.getActiveTextures.call(this);
        if (this._albedoTexture) {
            activeTextures.push(this._albedoTexture);
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
        if (this._reflectivityTexture) {
            activeTextures.push(this._reflectivityTexture);
        }
        if (this._metallicTexture) {
            activeTextures.push(this._metallicTexture);
        }
        if (this._metallicReflectanceTexture) {
            activeTextures.push(this._metallicReflectanceTexture);
        }
        if (this._reflectanceTexture) {
            activeTextures.push(this._reflectanceTexture);
        }
        if (this._microSurfaceTexture) {
            activeTextures.push(this._microSurfaceTexture);
        }
        if (this._bumpTexture) {
            activeTextures.push(this._bumpTexture);
        }
        if (this._lightmapTexture) {
            activeTextures.push(this._lightmapTexture);
        }
        return activeTextures;
    };
    /**
     * Checks to see if a texture is used in the material.
     * @param texture - Base texture to use.
     * @returns - Boolean specifying if a texture is used in the material.
     */
    PBRBaseMaterial.prototype.hasTexture = function (texture) {
        if (_super.prototype.hasTexture.call(this, texture)) {
            return true;
        }
        if (this._albedoTexture === texture) {
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
        if (this._reflectivityTexture === texture) {
            return true;
        }
        if (this._metallicTexture === texture) {
            return true;
        }
        if (this._metallicReflectanceTexture === texture) {
            return true;
        }
        if (this._reflectanceTexture === texture) {
            return true;
        }
        if (this._microSurfaceTexture === texture) {
            return true;
        }
        if (this._bumpTexture === texture) {
            return true;
        }
        if (this._lightmapTexture === texture) {
            return true;
        }
        return false;
    };
    /**
     * Sets the required values to the prepass renderer.
     */
    PBRBaseMaterial.prototype.setPrePassRenderer = function () {
        var _a;
        if ((_a = this.subSurface) === null || _a === void 0 ? void 0 : _a.isScatteringEnabled) {
            var subSurfaceConfiguration = this.getScene().enableSubSurfaceForPrePass();
            if (subSurfaceConfiguration) {
                subSurfaceConfiguration.enabled = true;
            }
            return true;
        }
        return false;
    };
    /**
     * Disposes the resources of the material.
     * @param forceDisposeEffect - Forces the disposal of effects.
     * @param forceDisposeTextures - Forces the disposal of all textures.
     */
    PBRBaseMaterial.prototype.dispose = function (forceDisposeEffect, forceDisposeTextures) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (forceDisposeTextures) {
            if (this._environmentBRDFTexture && this.getScene().environmentBRDFTexture !== this._environmentBRDFTexture) {
                this._environmentBRDFTexture.dispose();
            }
            (_a = this._albedoTexture) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._ambientTexture) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this._opacityTexture) === null || _c === void 0 ? void 0 : _c.dispose();
            (_d = this._reflectionTexture) === null || _d === void 0 ? void 0 : _d.dispose();
            (_e = this._emissiveTexture) === null || _e === void 0 ? void 0 : _e.dispose();
            (_f = this._metallicTexture) === null || _f === void 0 ? void 0 : _f.dispose();
            (_g = this._reflectivityTexture) === null || _g === void 0 ? void 0 : _g.dispose();
            (_h = this._bumpTexture) === null || _h === void 0 ? void 0 : _h.dispose();
            (_j = this._lightmapTexture) === null || _j === void 0 ? void 0 : _j.dispose();
            (_k = this._metallicReflectanceTexture) === null || _k === void 0 ? void 0 : _k.dispose();
            (_l = this._reflectanceTexture) === null || _l === void 0 ? void 0 : _l.dispose();
            (_m = this._microSurfaceTexture) === null || _m === void 0 ? void 0 : _m.dispose();
        }
        this._renderTargets.dispose();
        if (this._imageProcessingConfiguration && this._imageProcessingObserver) {
            this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver);
        }
        _super.prototype.dispose.call(this, forceDisposeEffect, forceDisposeTextures);
    };
    /**
     * PBRMaterialTransparencyMode: No transparency mode, Alpha channel is not use.
     */
    PBRBaseMaterial.PBRMATERIAL_OPAQUE = Material.MATERIAL_OPAQUE;
    /**
     * PBRMaterialTransparencyMode: Alpha Test mode, pixel are discarded below a certain threshold defined by the alpha cutoff value.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHATEST = Material.MATERIAL_ALPHATEST;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHABLEND = Material.MATERIAL_ALPHABLEND;
    /**
     * PBRMaterialTransparencyMode: Pixels are blended (according to the alpha mode) with the already drawn pixels in the current frame buffer.
     * They are also discarded below the alpha cutoff threshold to improve performances.
     */
    PBRBaseMaterial.PBRMATERIAL_ALPHATESTANDBLEND = Material.MATERIAL_ALPHATESTANDBLEND;
    /**
     * Defines the default value of how much AO map is occluding the analytical lights
     * (point spot...).
     */
    PBRBaseMaterial.DEFAULT_AO_ON_ANALYTICAL_LIGHTS = 0;
    /**
     * PBRMaterialLightFalloff Physical: light is falling off following the inverse squared distance law.
     */
    PBRBaseMaterial.LIGHTFALLOFF_PHYSICAL = 0;
    /**
     * PBRMaterialLightFalloff gltf: light is falling off as described in the gltf moving to PBR document
     * to enhance interoperability with other engines.
     */
    PBRBaseMaterial.LIGHTFALLOFF_GLTF = 1;
    /**
     * PBRMaterialLightFalloff Standard: light is falling off like in the standard material
     * to enhance interoperability with other materials.
     */
    PBRBaseMaterial.LIGHTFALLOFF_STANDARD = 2;
    __decorate([
        serializeAsImageProcessingConfiguration()
    ], PBRBaseMaterial.prototype, "_imageProcessingConfiguration", void 0);
    __decorate([
        expandToProperty("_markAllSubMeshesAsMiscDirty")
    ], PBRBaseMaterial.prototype, "debugMode", void 0);
    __decorate([
        serialize()
    ], PBRBaseMaterial.prototype, "useLogarithmicDepth", null);
    return PBRBaseMaterial;
}(PushMaterial));
export { PBRBaseMaterial };
//# sourceMappingURL=pbrBaseMaterial.js.map