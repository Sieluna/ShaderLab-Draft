// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockReflectivity";
var shader = "struct reflectivityOutParams\n{\nfloat microSurface;\nfloat roughness;\nvec3 surfaceReflectivityColor;\n#ifdef METALLICWORKFLOW\nvec3 surfaceAlbedo;\n#endif\n#if defined(METALLICWORKFLOW) && defined(REFLECTIVITY) && defined(AOSTOREINMETALMAPRED)\nvec3 ambientOcclusionColor;\n#endif\n#if DEBUGMODE>0\nvec4 surfaceMetallicColorMap;\nvec4 surfaceReflectivityColorMap;\nvec2 metallicRoughness;\nvec3 metallicF0;\n#endif\n};\n#define pbr_inline\nvoid reflectivityBlock(\nin vec4 vReflectivityColor,\n#ifdef METALLICWORKFLOW\nin vec3 surfaceAlbedo,\nin vec4 metallicReflectanceFactors,\n#endif\n#ifdef REFLECTIVITY\nin vec3 reflectivityInfos,\nin vec4 surfaceMetallicOrReflectivityColorMap,\n#endif\n#if defined(METALLICWORKFLOW) && defined(REFLECTIVITY) && defined(AOSTOREINMETALMAPRED)\nin vec3 ambientOcclusionColorIn,\n#endif\n#ifdef MICROSURFACEMAP\nin vec4 microSurfaceTexel,\n#endif\n#ifdef DETAIL\nin vec4 detailColor,\nin vec4 vDetailInfos,\n#endif\nout reflectivityOutParams outParams\n)\n{\nfloat microSurface=vReflectivityColor.a;\nvec3 surfaceReflectivityColor=vReflectivityColor.rgb;\n#ifdef METALLICWORKFLOW\nvec2 metallicRoughness=surfaceReflectivityColor.rg;\n#ifdef REFLECTIVITY\n#if DEBUGMODE>0\noutParams.surfaceMetallicColorMap=surfaceMetallicOrReflectivityColorMap;\n#endif\n#ifdef AOSTOREINMETALMAPRED\nvec3 aoStoreInMetalMap=vec3(surfaceMetallicOrReflectivityColorMap.r,surfaceMetallicOrReflectivityColorMap.r,surfaceMetallicOrReflectivityColorMap.r);\noutParams.ambientOcclusionColor=mix(ambientOcclusionColorIn,aoStoreInMetalMap,reflectivityInfos.z);\n#endif\n#ifdef METALLNESSSTOREINMETALMAPBLUE\nmetallicRoughness.r*=surfaceMetallicOrReflectivityColorMap.b;\n#else\nmetallicRoughness.r*=surfaceMetallicOrReflectivityColorMap.r;\n#endif\n#ifdef ROUGHNESSSTOREINMETALMAPALPHA\nmetallicRoughness.g*=surfaceMetallicOrReflectivityColorMap.a;\n#else\n#ifdef ROUGHNESSSTOREINMETALMAPGREEN\nmetallicRoughness.g*=surfaceMetallicOrReflectivityColorMap.g;\n#endif\n#endif\n#endif\n#ifdef DETAIL\nfloat detailRoughness=mix(0.5,detailColor.b,vDetailInfos.w);\nfloat loLerp=mix(0.,metallicRoughness.g,detailRoughness*2.);\nfloat hiLerp=mix(metallicRoughness.g,1.,(detailRoughness-0.5)*2.);\nmetallicRoughness.g=mix(loLerp,hiLerp,step(detailRoughness,0.5));\n#endif\n#ifdef MICROSURFACEMAP\nmetallicRoughness.g*=microSurfaceTexel.r;\n#endif\n#if DEBUGMODE>0\noutParams.metallicRoughness=metallicRoughness;\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS\nmicroSurface=1.0-metallicRoughness.g;\nvec3 baseColor=surfaceAlbedo;\n#ifdef FROSTBITE_REFLECTANCE\noutParams.surfaceAlbedo=baseColor.rgb*(1.0-metallicRoughness.r);\nsurfaceReflectivityColor=mix(0.16*reflectance*reflectance,baseColor,metallicRoughness.r);\n#else\nvec3 metallicF0=metallicReflectanceFactors.rgb;\n#if DEBUGMODE>0\noutParams.metallicF0=metallicF0;\n#endif\noutParams.surfaceAlbedo=mix(baseColor.rgb*(1.0-metallicF0),vec3(0.,0.,0.),metallicRoughness.r);\nsurfaceReflectivityColor=mix(metallicF0,baseColor,metallicRoughness.r);\n#endif\n#else\n#ifdef REFLECTIVITY\nsurfaceReflectivityColor*=surfaceMetallicOrReflectivityColorMap.rgb;\n#if DEBUGMODE>0\noutParams.surfaceReflectivityColorMap=surfaceMetallicOrReflectivityColorMap;\n#endif\n#ifdef MICROSURFACEFROMREFLECTIVITYMAP\nmicroSurface*=surfaceMetallicOrReflectivityColorMap.a;\nmicroSurface*=reflectivityInfos.z;\n#else\n#ifdef MICROSURFACEAUTOMATIC\nmicroSurface*=computeDefaultMicroSurface(microSurface,surfaceReflectivityColor);\n#endif\n#ifdef MICROSURFACEMAP\nmicroSurface*=microSurfaceTexel.r;\n#endif\n#define CUSTOM_FRAGMENT_UPDATE_MICROSURFACE\n#endif\n#endif\n#endif\nmicroSurface=saturate(microSurface);\nfloat roughness=1.-microSurface;\noutParams.microSurface=microSurface;\noutParams.roughness=roughness;\noutParams.surfaceReflectivityColor=surfaceReflectivityColor;\n}\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockReflectivity = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockReflectivity.js.map