// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrVertexDeclaration";
var shader = "uniform mat4 view;\nuniform mat4 viewProjection;\n#ifdef ALBEDO\nuniform mat4 albedoMatrix;\nuniform vec2 vAlbedoInfos;\n#endif\n#ifdef AMBIENT\nuniform mat4 ambientMatrix;\nuniform vec4 vAmbientInfos;\n#endif\n#ifdef OPACITY\nuniform mat4 opacityMatrix;\nuniform vec2 vOpacityInfos;\n#endif\n#ifdef EMISSIVE\nuniform vec2 vEmissiveInfos;\nuniform mat4 emissiveMatrix;\n#endif\n#ifdef LIGHTMAP\nuniform vec2 vLightmapInfos;\nuniform mat4 lightmapMatrix;\n#endif\n#ifdef REFLECTIVITY \nuniform vec3 vReflectivityInfos;\nuniform mat4 reflectivityMatrix;\n#endif\n#ifdef METALLIC_REFLECTANCE\nuniform vec2 vMetallicReflectanceInfos;\nuniform mat4 metallicReflectanceMatrix;\n#endif\n#ifdef REFLECTANCE\nuniform vec2 vReflectanceInfos;\nuniform mat4 reflectanceMatrix;\n#endif\n#ifdef MICROSURFACEMAP\nuniform vec2 vMicroSurfaceSamplerInfos;\nuniform mat4 microSurfaceSamplerMatrix;\n#endif\n#ifdef BUMP\nuniform vec3 vBumpInfos;\nuniform mat4 bumpMatrix;\n#endif\n#ifdef POINTSIZE\nuniform float pointSize;\n#endif\n#ifdef REFLECTION\nuniform vec2 vReflectionInfos;\nuniform mat4 reflectionMatrix;\n#endif\n#ifdef CLEARCOAT\n#if defined(CLEARCOAT_TEXTURE) || defined(CLEARCOAT_TEXTURE_ROUGHNESS)\nuniform vec4 vClearCoatInfos;\n#endif\n#ifdef CLEARCOAT_TEXTURE\nuniform mat4 clearCoatMatrix;\n#endif\n#ifdef CLEARCOAT_TEXTURE_ROUGHNESS\nuniform mat4 clearCoatRoughnessMatrix;\n#endif\n#ifdef CLEARCOAT_BUMP\nuniform vec2 vClearCoatBumpInfos;\nuniform mat4 clearCoatBumpMatrix;\n#endif\n#ifdef CLEARCOAT_TINT_TEXTURE\nuniform vec2 vClearCoatTintInfos;\nuniform mat4 clearCoatTintMatrix;\n#endif\n#endif\n#ifdef IRIDESCENCE\n#if defined(IRIDESCENCE_TEXTURE) || defined(IRIDESCENCE_THICKNESS_TEXTURE)\nuniform vec4 vIridescenceInfos;\n#endif\n#ifdef IRIDESCENCE_TEXTURE\nuniform mat4 iridescenceMatrix;\n#endif\n#ifdef IRIDESCENCE_THICKNESS_TEXTURE\nuniform mat4 iridescenceThicknessMatrix;\n#endif\n#endif\n#ifdef ANISOTROPIC\n#ifdef ANISOTROPIC_TEXTURE\nuniform vec2 vAnisotropyInfos;\nuniform mat4 anisotropyMatrix;\n#endif\n#endif\n#ifdef SHEEN\n#if defined(SHEEN_TEXTURE) || defined(SHEEN_TEXTURE_ROUGHNESS)\nuniform vec4 vSheenInfos;\n#endif\n#ifdef SHEEN_TEXTURE\nuniform mat4 sheenMatrix;\n#endif\n#ifdef SHEEN_TEXTURE_ROUGHNESS\nuniform mat4 sheenRoughnessMatrix;\n#endif\n#endif\n#ifdef SUBSURFACE\n#ifdef SS_REFRACTION\nuniform vec4 vRefractionInfos;\nuniform mat4 refractionMatrix;\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nuniform vec2 vThicknessInfos;\nuniform mat4 thicknessMatrix;\n#endif\n#ifdef SS_REFRACTIONINTENSITY_TEXTURE\nuniform vec2 vRefractionIntensityInfos;\nuniform mat4 refractionIntensityMatrix;\n#endif\n#ifdef SS_TRANSLUCENCYINTENSITY_TEXTURE\nuniform vec2 vTranslucencyIntensityInfos;\nuniform mat4 translucencyIntensityMatrix;\n#endif\n#endif\n#ifdef NORMAL\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\n#ifdef USESPHERICALFROMREFLECTIONMAP\n#ifdef SPHERICAL_HARMONICS\nuniform vec3 vSphericalL00;\nuniform vec3 vSphericalL1_1;\nuniform vec3 vSphericalL10;\nuniform vec3 vSphericalL11;\nuniform vec3 vSphericalL2_2;\nuniform vec3 vSphericalL2_1;\nuniform vec3 vSphericalL20;\nuniform vec3 vSphericalL21;\nuniform vec3 vSphericalL22;\n#else\nuniform vec3 vSphericalX;\nuniform vec3 vSphericalY;\nuniform vec3 vSphericalZ;\nuniform vec3 vSphericalXX_ZZ;\nuniform vec3 vSphericalYY_ZZ;\nuniform vec3 vSphericalZZ;\nuniform vec3 vSphericalXY;\nuniform vec3 vSphericalYZ;\nuniform vec3 vSphericalZX;\n#endif\n#endif\n#endif\n#endif\n#ifdef DETAIL\nuniform vec4 vDetailInfos;\nuniform mat4 detailMatrix;\n#endif\n#define ADDITIONAL_VERTEX_DECLARATION\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=pbrVertexDeclaration.js.map