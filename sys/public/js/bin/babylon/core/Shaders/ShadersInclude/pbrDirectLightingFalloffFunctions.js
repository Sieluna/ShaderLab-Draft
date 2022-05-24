// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrDirectLightingFalloffFunctions";
var shader = "float computeDistanceLightFalloff_Standard(vec3 lightOffset,float range)\n{\nreturn max(0.,1.0-length(lightOffset)/range);\n}\nfloat computeDistanceLightFalloff_Physical(float lightDistanceSquared)\n{\nreturn 1.0/maxEps(lightDistanceSquared);\n}\nfloat computeDistanceLightFalloff_GLTF(float lightDistanceSquared,float inverseSquaredRange)\n{\nfloat lightDistanceFalloff=1.0/maxEps(lightDistanceSquared);\nfloat factor=lightDistanceSquared*inverseSquaredRange;\nfloat attenuation=saturate(1.0-factor*factor);\nattenuation*=attenuation;\nlightDistanceFalloff*=attenuation;\nreturn lightDistanceFalloff;\n}\nfloat computeDistanceLightFalloff(vec3 lightOffset,float lightDistanceSquared,float range,float inverseSquaredRange)\n{\n#ifdef USEPHYSICALLIGHTFALLOFF\nreturn computeDistanceLightFalloff_Physical(lightDistanceSquared);\n#elif defined(USEGLTFLIGHTFALLOFF)\nreturn computeDistanceLightFalloff_GLTF(lightDistanceSquared,inverseSquaredRange);\n#else\nreturn computeDistanceLightFalloff_Standard(lightOffset,range);\n#endif\n}\nfloat computeDirectionalLightFalloff_Standard(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle,float exponent)\n{\nfloat falloff=0.0;\nfloat cosAngle=maxEps(dot(-lightDirection,directionToLightCenterW));\nif (cosAngle>=cosHalfAngle)\n{\nfalloff=max(0.,pow(cosAngle,exponent));\n}\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff_Physical(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle)\n{\nconst float kMinusLog2ConeAngleIntensityRatio=6.64385618977; \nfloat concentrationKappa=kMinusLog2ConeAngleIntensityRatio/(1.0-cosHalfAngle);\nvec4 lightDirectionSpreadSG=vec4(-lightDirection*concentrationKappa,-concentrationKappa);\nfloat falloff=exp2(dot(vec4(directionToLightCenterW,1.0),lightDirectionSpreadSG));\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff_GLTF(vec3 lightDirection,vec3 directionToLightCenterW,float lightAngleScale,float lightAngleOffset)\n{\nfloat cd=dot(-lightDirection,directionToLightCenterW);\nfloat falloff=saturate(cd*lightAngleScale+lightAngleOffset);\nfalloff*=falloff;\nreturn falloff;\n}\nfloat computeDirectionalLightFalloff(vec3 lightDirection,vec3 directionToLightCenterW,float cosHalfAngle,float exponent,float lightAngleScale,float lightAngleOffset)\n{\n#ifdef USEPHYSICALLIGHTFALLOFF\nreturn computeDirectionalLightFalloff_Physical(lightDirection,directionToLightCenterW,cosHalfAngle);\n#elif defined(USEGLTFLIGHTFALLOFF)\nreturn computeDirectionalLightFalloff_GLTF(lightDirection,directionToLightCenterW,lightAngleScale,lightAngleOffset);\n#else\nreturn computeDirectionalLightFalloff_Standard(lightDirection,directionToLightCenterW,cosHalfAngle,exponent);\n#endif\n}";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrDirectLightingFalloffFunctions = { name: name, shader: shader };
//# sourceMappingURL=pbrDirectLightingFalloffFunctions.js.map