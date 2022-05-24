// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockSubSurface";
var shader = "struct subSurfaceOutParams\n{\nvec3 specularEnvironmentReflectance;\n#ifdef SS_REFRACTION\nvec3 finalRefraction;\nvec3 surfaceAlbedo;\n#ifdef SS_LINKREFRACTIONTOTRANSPARENCY\nfloat alpha;\n#endif\n#ifdef REFLECTION\nfloat refractionFactorForIrradiance;\n#endif\n#endif\n#ifdef SS_TRANSLUCENCY\nvec3 transmittance;\nfloat translucencyIntensity;\n#ifdef REFLECTION\nvec3 refractionIrradiance;\n#endif\n#endif\n#if DEBUGMODE>0\nvec4 thicknessMap;\nvec4 environmentRefraction;\nvec3 refractionTransmittance;\n#endif\n};\n#ifdef SUBSURFACE\n#define pbr_inline\n#define inline\nvoid subSurfaceBlock(\nin vec3 vSubSurfaceIntensity,\nin vec2 vThicknessParam,\nin vec4 vTintColor,\nin vec3 normalW,\nin vec3 specularEnvironmentReflectance,\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nin vec4 thicknessMap,\n#endif\n#ifdef SS_REFRACTIONINTENSITY_TEXTURE\nin vec4 refractionIntensityMap,\n#endif\n#ifdef SS_TRANSLUCENCYINTENSITY_TEXTURE\nin vec4 translucencyIntensityMap,\n#endif\n#ifdef REFLECTION\n#ifdef SS_TRANSLUCENCY\nin mat4 reflectionMatrix,\n#ifdef USESPHERICALFROMREFLECTIONMAP\n#if !defined(NORMAL) || !defined(USESPHERICALINVERTEX)\nin vec3 irradianceVector_,\n#endif\n#if defined(REALTIME_FILTERING)\nin samplerCube reflectionSampler,\nin vec2 vReflectionFilteringInfo,\n#endif\n#endif\n#ifdef USEIRRADIANCEMAP\n#ifdef REFLECTIONMAP_3D\nin samplerCube irradianceSampler,\n#else\nin sampler2D irradianceSampler,\n#endif\n#endif\n#endif\n#endif\n#if defined(SS_REFRACTION) || defined(SS_TRANSLUCENCY)\nin vec3 surfaceAlbedo,\n#endif\n#ifdef SS_REFRACTION\nin vec3 vPositionW,\nin vec3 viewDirectionW,\nin mat4 view,\nin vec4 vRefractionInfos,\nin mat4 refractionMatrix,\nin vec4 vRefractionMicrosurfaceInfos,\nin vec4 vLightingIntensity,\n#ifdef SS_LINKREFRACTIONTOTRANSPARENCY\nin float alpha,\n#endif\n#ifdef SS_LODINREFRACTIONALPHA\nin float NdotVUnclamped,\n#endif\n#ifdef SS_LINEARSPECULARREFRACTION\nin float roughness,\n#endif\nin float alphaG,\n#ifdef SS_REFRACTIONMAP_3D\nin samplerCube refractionSampler,\n#ifndef LODBASEDMICROSFURACE\nin samplerCube refractionSamplerLow,\nin samplerCube refractionSamplerHigh,\n#endif\n#else\nin sampler2D refractionSampler,\n#ifndef LODBASEDMICROSFURACE\nin sampler2D refractionSamplerLow,\nin sampler2D refractionSamplerHigh,\n#endif\n#endif\n#ifdef ANISOTROPIC\nin anisotropicOutParams anisotropicOut,\n#endif\n#ifdef REALTIME_FILTERING\nin vec2 vRefractionFilteringInfo,\n#endif\n#ifdef SS_USE_LOCAL_REFRACTIONMAP_CUBIC\nin vec3 refractionPosition,\nin vec3 refractionSize,\n#endif\n#endif\n#ifdef SS_TRANSLUCENCY\nin vec3 vDiffusionDistance,\n#endif\nout subSurfaceOutParams outParams\n)\n{\noutParams.specularEnvironmentReflectance=specularEnvironmentReflectance;\n#ifdef SS_REFRACTION\nfloat refractionIntensity=vSubSurfaceIntensity.x;\n#ifdef SS_LINKREFRACTIONTOTRANSPARENCY\nrefractionIntensity*=(1.0-alpha);\noutParams.alpha=1.0;\n#endif\n#endif\n#ifdef SS_TRANSLUCENCY\nfloat translucencyIntensity=vSubSurfaceIntensity.y;\n#endif\n#ifdef SS_THICKNESSANDMASK_TEXTURE\n#if defined(SS_USE_GLTF_TEXTURES)\nfloat thickness=thicknessMap.g*vThicknessParam.y+vThicknessParam.x;\n#else\nfloat thickness=thicknessMap.r*vThicknessParam.y+vThicknessParam.x;\n#endif\n#if DEBUGMODE>0\noutParams.thicknessMap=thicknessMap;\n#endif\n#ifdef SS_MASK_FROM_THICKNESS_TEXTURE\n#if defined(SS_REFRACTION) && defined(SS_REFRACTION_USE_INTENSITY_FROM_TEXTURE)\n#if defined(SS_USE_GLTF_TEXTURES)\nrefractionIntensity*=thicknessMap.r;\n#else\nrefractionIntensity*=thicknessMap.g;\n#endif\n#endif\n#if defined(SS_TRANSLUCENCY) && defined(SS_TRANSLUCENCY_USE_INTENSITY_FROM_TEXTURE)\ntranslucencyIntensity*=thicknessMap.b;\n#endif\n#endif\n#else\nfloat thickness=vThicknessParam.y;\n#endif\n#ifdef SS_REFRACTIONINTENSITY_TEXTURE\n#ifdef SS_USE_GLTF_TEXTURES\nrefractionIntensity*=refractionIntensityMap.r;\n#else\nrefractionIntensity*=refractionIntensityMap.g;\n#endif\n#endif\n#ifdef SS_TRANSLUCENCYINTENSITY_TEXTURE\ntranslucencyIntensity*=translucencyIntensityMap.b;\n#endif\n#ifdef SS_TRANSLUCENCY\nthickness=maxEps(thickness);\nvec3 transmittance=transmittanceBRDF_Burley(vTintColor.rgb,vDiffusionDistance,thickness);\ntransmittance*=translucencyIntensity;\noutParams.transmittance=transmittance;\noutParams.translucencyIntensity=translucencyIntensity;\n#endif\n#ifdef SS_REFRACTION\nvec4 environmentRefraction=vec4(0.,0.,0.,0.);\n#ifdef ANISOTROPIC\nvec3 refractionVector=refract(-viewDirectionW,anisotropicOut.anisotropicNormal,vRefractionInfos.y);\n#else\nvec3 refractionVector=refract(-viewDirectionW,normalW,vRefractionInfos.y);\n#endif\n#ifdef SS_REFRACTIONMAP_OPPOSITEZ\nrefractionVector.z*=-1.0;\n#endif\n#ifdef SS_REFRACTIONMAP_3D\n#ifdef SS_USE_LOCAL_REFRACTIONMAP_CUBIC\nrefractionVector=parallaxCorrectNormal(vPositionW,refractionVector,refractionSize,refractionPosition);\n#endif\nrefractionVector.y=refractionVector.y*vRefractionInfos.w;\nvec3 refractionCoords=refractionVector;\nrefractionCoords=vec3(refractionMatrix*vec4(refractionCoords,0));\n#else\n#ifdef SS_USE_THICKNESS_AS_DEPTH\nvec3 vRefractionUVW=vec3(refractionMatrix*(view*vec4(vPositionW+refractionVector*thickness,1.0)));\n#else\nvec3 vRefractionUVW=vec3(refractionMatrix*(view*vec4(vPositionW+refractionVector*vRefractionInfos.z,1.0)));\n#endif\nvec2 refractionCoords=vRefractionUVW.xy/vRefractionUVW.z;\nrefractionCoords.y=1.0-refractionCoords.y;\n#endif\n#ifdef SS_HAS_THICKNESS\nfloat ior=vRefractionInfos.y;\n#else\nfloat ior=vRefractionMicrosurfaceInfos.w;\n#endif\n#ifdef SS_LODINREFRACTIONALPHA\nfloat refractionAlphaG=alphaG;\nrefractionAlphaG=mix(alphaG,0.0,clamp(ior*3.0-2.0,0.0,1.0));\nfloat refractionLOD=getLodFromAlphaG(vRefractionMicrosurfaceInfos.x,refractionAlphaG,NdotVUnclamped);\n#elif defined(SS_LINEARSPECULARREFRACTION)\nfloat refractionRoughness=alphaG;\nrefractionRoughness=mix(alphaG,0.0,clamp(ior*3.0-2.0,0.0,1.0));\nfloat refractionLOD=getLinearLodFromRoughness(vRefractionMicrosurfaceInfos.x,refractionRoughness);\n#else\nfloat refractionAlphaG=alphaG;\nrefractionAlphaG=mix(alphaG,0.0,clamp(ior*3.0-2.0,0.0,1.0));\nfloat refractionLOD=getLodFromAlphaG(vRefractionMicrosurfaceInfos.x,refractionAlphaG);\n#endif\n#ifdef LODBASEDMICROSFURACE\nrefractionLOD=refractionLOD*vRefractionMicrosurfaceInfos.y+vRefractionMicrosurfaceInfos.z;\n#ifdef SS_LODINREFRACTIONALPHA\nfloat automaticRefractionLOD=UNPACK_LOD(sampleRefraction(refractionSampler,refractionCoords).a);\nfloat requestedRefractionLOD=max(automaticRefractionLOD,refractionLOD);\n#else\nfloat requestedRefractionLOD=refractionLOD;\n#endif\n#ifdef REALTIME_FILTERING\nenvironmentRefraction=vec4(radiance(alphaG,refractionSampler,refractionCoords,vRefractionFilteringInfo),1.0);\n#else\nenvironmentRefraction=sampleRefractionLod(refractionSampler,refractionCoords,requestedRefractionLOD);\n#endif\n#else\nfloat lodRefractionNormalized=saturate(refractionLOD/log2(vRefractionMicrosurfaceInfos.x));\nfloat lodRefractionNormalizedDoubled=lodRefractionNormalized*2.0;\nvec4 environmentRefractionMid=sampleRefraction(refractionSampler,refractionCoords);\nif (lodRefractionNormalizedDoubled<1.0){\nenvironmentRefraction=mix(\nsampleRefraction(refractionSamplerHigh,refractionCoords),\nenvironmentRefractionMid,\nlodRefractionNormalizedDoubled\n);\n} else {\nenvironmentRefraction=mix(\nenvironmentRefractionMid,\nsampleRefraction(refractionSamplerLow,refractionCoords),\nlodRefractionNormalizedDoubled-1.0\n);\n}\n#endif\n#ifdef SS_RGBDREFRACTION\nenvironmentRefraction.rgb=fromRGBD(environmentRefraction);\n#endif\n#ifdef SS_GAMMAREFRACTION\nenvironmentRefraction.rgb=toLinearSpace(environmentRefraction.rgb);\n#endif\nenvironmentRefraction.rgb*=vRefractionInfos.x;\n#endif\n#ifdef SS_REFRACTION\nvec3 refractionTransmittance=vec3(refractionIntensity);\n#ifdef SS_THICKNESSANDMASK_TEXTURE\nvec3 volumeAlbedo=computeColorAtDistanceInMedia(vTintColor.rgb,vTintColor.w);\nrefractionTransmittance*=cocaLambert(volumeAlbedo,thickness);\n#elif defined(SS_LINKREFRACTIONTOTRANSPARENCY)\nfloat maxChannel=max(max(surfaceAlbedo.r,surfaceAlbedo.g),surfaceAlbedo.b);\nvec3 volumeAlbedo=saturate(maxChannel*surfaceAlbedo);\nenvironmentRefraction.rgb*=volumeAlbedo;\n#else\nvec3 volumeAlbedo=computeColorAtDistanceInMedia(vTintColor.rgb,vTintColor.w);\nrefractionTransmittance*=cocaLambert(volumeAlbedo,vThicknessParam.y);\n#endif\n#ifdef SS_ALBEDOFORREFRACTIONTINT\nenvironmentRefraction.rgb*=surfaceAlbedo.rgb;\n#endif\noutParams.surfaceAlbedo=surfaceAlbedo*(1.-refractionIntensity);\n#ifdef REFLECTION\noutParams.refractionFactorForIrradiance=(1.-refractionIntensity);\n#endif\n#ifdef UNUSED_MULTIPLEBOUNCES\nvec3 bounceSpecularEnvironmentReflectance=(2.0*specularEnvironmentReflectance)/(1.0+specularEnvironmentReflectance);\noutParams.specularEnvironmentReflectance=mix(bounceSpecularEnvironmentReflectance,specularEnvironmentReflectance,refractionIntensity);\n#endif\nrefractionTransmittance*=1.0-outParams.specularEnvironmentReflectance;\n#if DEBUGMODE>0\noutParams.refractionTransmittance=refractionTransmittance;\n#endif\noutParams.finalRefraction=environmentRefraction.rgb*refractionTransmittance*vLightingIntensity.z;\n#if DEBUGMODE>0\noutParams.environmentRefraction=environmentRefraction;\n#endif\n#endif\n#if defined(REFLECTION) && defined(SS_TRANSLUCENCY)\n#if defined(NORMAL) && defined(USESPHERICALINVERTEX) || !defined(USESPHERICALFROMREFLECTIONMAP)\nvec3 irradianceVector=vec3(reflectionMatrix*vec4(normalW,0)).xyz;\n#ifdef REFLECTIONMAP_OPPOSITEZ\nirradianceVector.z*=-1.0;\n#endif\n#ifdef INVERTCUBICMAP\nirradianceVector.y*=-1.0;\n#endif\n#else\nvec3 irradianceVector=irradianceVector_;\n#endif\n#if defined(USESPHERICALFROMREFLECTIONMAP)\n#if defined(REALTIME_FILTERING)\nvec3 refractionIrradiance=irradiance(reflectionSampler,-irradianceVector,vReflectionFilteringInfo);\n#else\nvec3 refractionIrradiance=computeEnvironmentIrradiance(-irradianceVector);\n#endif\n#elif defined(USEIRRADIANCEMAP)\n#ifdef REFLECTIONMAP_3D\nvec3 irradianceCoords=irradianceVector;\n#else\nvec2 irradianceCoords=irradianceVector.xy;\n#ifdef REFLECTIONMAP_PROJECTION\nirradianceCoords/=irradianceVector.z;\n#endif\nirradianceCoords.y=1.0-irradianceCoords.y;\n#endif\nvec4 refractionIrradiance=sampleReflection(irradianceSampler,-irradianceCoords);\n#ifdef RGBDREFLECTION\nrefractionIrradiance.rgb=fromRGBD(refractionIrradiance);\n#endif\n#ifdef GAMMAREFLECTION\nrefractionIrradiance.rgb=toLinearSpace(refractionIrradiance.rgb);\n#endif\n#else\nvec4 refractionIrradiance=vec4(0.);\n#endif\nrefractionIrradiance.rgb*=transmittance;\n#ifdef SS_ALBEDOFORTRANSLUCENCYTINT\nrefractionIrradiance.rgb*=surfaceAlbedo.rgb;\n#endif\noutParams.refractionIrradiance=refractionIrradiance.rgb;\n#endif\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockSubSurface = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockSubSurface.js.map