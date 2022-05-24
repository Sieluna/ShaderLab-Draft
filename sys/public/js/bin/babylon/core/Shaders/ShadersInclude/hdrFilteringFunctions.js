// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "hdrFilteringFunctions";
var shader = "#ifdef NUM_SAMPLES\n#if NUM_SAMPLES>0\n#if defined(WEBGL2) || defined(WEBGPU)\nfloat radicalInverse_VdC(uint bits) \n{\nbits=(bits<<16u) | (bits>>16u);\nbits=((bits & 0x55555555u)<<1u) | ((bits & 0xAAAAAAAAu)>>1u);\nbits=((bits & 0x33333333u)<<2u) | ((bits & 0xCCCCCCCCu)>>2u);\nbits=((bits & 0x0F0F0F0Fu)<<4u) | ((bits & 0xF0F0F0F0u)>>4u);\nbits=((bits & 0x00FF00FFu)<<8u) | ((bits & 0xFF00FF00u)>>8u);\nreturn float(bits)*2.3283064365386963e-10; \n}\nvec2 hammersley(uint i,uint N)\n{\nreturn vec2(float(i)/float(N),radicalInverse_VdC(i));\n}\n#else\nfloat vanDerCorpus(int n,int base)\n{\nfloat invBase=1.0/float(base);\nfloat denom =1.0;\nfloat result =0.0;\nfor(int i=0; i<32; ++i)\n{\nif(n>0)\n{\ndenom =mod(float(n),2.0);\nresult+=denom*invBase;\ninvBase=invBase/2.0;\nn =int(float(n)/2.0);\n}\n}\nreturn result;\n}\nvec2 hammersley(int i,int N)\n{\nreturn vec2(float(i)/float(N),vanDerCorpus(i,2));\n}\n#endif\nfloat log4(float x) {\nreturn log2(x)/2.;\n}\nconst float NUM_SAMPLES_FLOAT=float(NUM_SAMPLES);\nconst float NUM_SAMPLES_FLOAT_INVERSED=1./NUM_SAMPLES_FLOAT;\nconst float K=4.;\n#define inline\nvec3 irradiance(samplerCube inputTexture,vec3 inputN,vec2 filteringInfo)\n{\nvec3 n=normalize(inputN);\nvec3 result=vec3(0.0);\nvec3 tangent=abs(n.z)<0.999 ? vec3(0.,0.,1.) : vec3(1.,0.,0.);\ntangent=normalize(cross(tangent,n));\nvec3 bitangent=cross(n,tangent);\nmat3 tbn=mat3(tangent,bitangent,n);\nfloat maxLevel=filteringInfo.y;\nfloat dim0=filteringInfo.x;\nfloat omegaP=(4.*PI)/(6.*dim0*dim0);\n#if defined(WEBGL2) || defined(WEBGPU)\nfor(uint i=0u; i<NUM_SAMPLES; ++i)\n#else\nfor(int i=0; i<NUM_SAMPLES; ++i)\n#endif\n{\nvec2 Xi=hammersley(i,NUM_SAMPLES);\nvec3 Ls=hemisphereCosSample(Xi);\nLs=normalize(Ls);\nvec3 Ns=vec3(0.,0.,1.);\nfloat NoL=dot(Ns,Ls);\nif (NoL>0.) {\nfloat pdf_inversed=PI/NoL;\nfloat omegaS=NUM_SAMPLES_FLOAT_INVERSED*pdf_inversed;\nfloat l=log4(omegaS)-log4(omegaP)+log4(K);\nfloat mipLevel=clamp(l,0.0,maxLevel);\nvec3 c=textureCubeLodEXT(inputTexture,tbn*Ls,mipLevel).rgb;\n#ifdef GAMMA_INPUT\nc=toLinearSpace(c);\n#endif\nresult+=c;\n}\n}\nresult=result*NUM_SAMPLES_FLOAT_INVERSED;\nreturn result;\n}\n#define inline\nvec3 radiance(float alphaG,samplerCube inputTexture,vec3 inputN,vec2 filteringInfo)\n{\nvec3 n=normalize(inputN);\nif (alphaG==0.) {\nvec3 c=textureCube(inputTexture,n).rgb;\n#ifdef GAMMA_INPUT\nc=toLinearSpace(c);\n#endif\nreturn c;\n} else {\nvec3 result=vec3(0.);\nvec3 tangent=abs(n.z)<0.999 ? vec3(0.,0.,1.) : vec3(1.,0.,0.);\ntangent=normalize(cross(tangent,n));\nvec3 bitangent=cross(n,tangent);\nmat3 tbn=mat3(tangent,bitangent,n);\nfloat maxLevel=filteringInfo.y;\nfloat dim0=filteringInfo.x;\nfloat omegaP=(4.*PI)/(6.*dim0*dim0);\nfloat weight=0.;\n#if defined(WEBGL2) || defined(WEBGPU)\nfor(uint i=0u; i<NUM_SAMPLES; ++i)\n#else\nfor(int i=0; i<NUM_SAMPLES; ++i)\n#endif\n{\nvec2 Xi=hammersley(i,NUM_SAMPLES);\nvec3 H=hemisphereImportanceSampleDggx(Xi,alphaG);\nfloat NoV=1.;\nfloat NoH=H.z;\nfloat NoH2=H.z*H.z;\nfloat NoL=2.*NoH2-1.;\nvec3 L=vec3(2.*NoH*H.x,2.*NoH*H.y,NoL);\nL=normalize(L);\nif (NoL>0.) {\nfloat pdf_inversed=4./normalDistributionFunction_TrowbridgeReitzGGX(NoH,alphaG);\nfloat omegaS=NUM_SAMPLES_FLOAT_INVERSED*pdf_inversed;\nfloat l=log4(omegaS)-log4(omegaP)+log4(K);\nfloat mipLevel=clamp(float(l),0.0,maxLevel);\nweight+=NoL;\nvec3 c=textureCubeLodEXT(inputTexture,tbn*L,mipLevel).rgb;\n#ifdef GAMMA_INPUT\nc=toLinearSpace(c);\n#endif\nresult+=c*NoL;\n}\n}\nresult=result/weight;\nreturn result;\n}\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var hdrFilteringFunctions = { name: name, shader: shader };
//# sourceMappingURL=hdrFilteringFunctions.js.map