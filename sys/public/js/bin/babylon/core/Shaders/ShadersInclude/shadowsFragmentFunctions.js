// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "shadowsFragmentFunctions";
var shader = "#ifdef SHADOWS\n#ifndef SHADOWFLOAT\nfloat unpack(vec4 color)\n{\nconst vec4 bit_shift=vec4(1.0/(255.0*255.0*255.0),1.0/(255.0*255.0),1.0/255.0,1.0);\nreturn dot(color,bit_shift);\n}\n#endif\nfloat computeFallOff(float value,vec2 clipSpace,float frustumEdgeFalloff)\n{\nfloat mask=smoothstep(1.0-frustumEdgeFalloff,1.00000012,clamp(dot(clipSpace,clipSpace),0.,1.));\nreturn mix(value,1.0,mask);\n}\n#define inline\nfloat computeShadowCube(vec3 lightPosition,samplerCube shadowSampler,float darkness,vec2 depthValues)\n{\nvec3 directionToLight=vPositionW-lightPosition;\nfloat depth=length(directionToLight);\ndepth=(depth+depthValues.x)/(depthValues.y);\ndepth=clamp(depth,0.,1.0);\ndirectionToLight=normalize(directionToLight);\ndirectionToLight.y=-directionToLight.y;\n#ifndef SHADOWFLOAT\nfloat shadow=unpack(textureCube(shadowSampler,directionToLight));\n#else\nfloat shadow=textureCube(shadowSampler,directionToLight).x;\n#endif\nreturn depth>shadow ? darkness : 1.0;\n}\n#define inline\nfloat computeShadowWithPoissonSamplingCube(vec3 lightPosition,samplerCube shadowSampler,float mapSize,float darkness,vec2 depthValues)\n{\nvec3 directionToLight=vPositionW-lightPosition;\nfloat depth=length(directionToLight);\ndepth=(depth+depthValues.x)/(depthValues.y);\ndepth=clamp(depth,0.,1.0);\ndirectionToLight=normalize(directionToLight);\ndirectionToLight.y=-directionToLight.y;\nfloat visibility=1.;\nvec3 poissonDisk[4];\npoissonDisk[0]=vec3(-1.0,1.0,-1.0);\npoissonDisk[1]=vec3(1.0,-1.0,-1.0);\npoissonDisk[2]=vec3(-1.0,-1.0,-1.0);\npoissonDisk[3]=vec3(1.0,-1.0,1.0);\n#ifndef SHADOWFLOAT\nif (unpack(textureCube(shadowSampler,directionToLight+poissonDisk[0]*mapSize))<depth) visibility-=0.25;\nif (unpack(textureCube(shadowSampler,directionToLight+poissonDisk[1]*mapSize))<depth) visibility-=0.25;\nif (unpack(textureCube(shadowSampler,directionToLight+poissonDisk[2]*mapSize))<depth) visibility-=0.25;\nif (unpack(textureCube(shadowSampler,directionToLight+poissonDisk[3]*mapSize))<depth) visibility-=0.25;\n#else\nif (textureCube(shadowSampler,directionToLight+poissonDisk[0]*mapSize).x<depth) visibility-=0.25;\nif (textureCube(shadowSampler,directionToLight+poissonDisk[1]*mapSize).x<depth) visibility-=0.25;\nif (textureCube(shadowSampler,directionToLight+poissonDisk[2]*mapSize).x<depth) visibility-=0.25;\nif (textureCube(shadowSampler,directionToLight+poissonDisk[3]*mapSize).x<depth) visibility-=0.25;\n#endif\nreturn min(1.0,visibility+darkness);\n}\n#define inline\nfloat computeShadowWithESMCube(vec3 lightPosition,samplerCube shadowSampler,float darkness,float depthScale,vec2 depthValues)\n{\nvec3 directionToLight=vPositionW-lightPosition;\nfloat depth=length(directionToLight);\ndepth=(depth+depthValues.x)/(depthValues.y);\nfloat shadowPixelDepth=clamp(depth,0.,1.0);\ndirectionToLight=normalize(directionToLight);\ndirectionToLight.y=-directionToLight.y;\n#ifndef SHADOWFLOAT\nfloat shadowMapSample=unpack(textureCube(shadowSampler,directionToLight));\n#else\nfloat shadowMapSample=textureCube(shadowSampler,directionToLight).x;\n#endif\nfloat esm=1.0-clamp(exp(min(87.,depthScale*shadowPixelDepth))*shadowMapSample,0.,1.-darkness); \nreturn esm;\n}\n#define inline\nfloat computeShadowWithCloseESMCube(vec3 lightPosition,samplerCube shadowSampler,float darkness,float depthScale,vec2 depthValues)\n{\nvec3 directionToLight=vPositionW-lightPosition;\nfloat depth=length(directionToLight);\ndepth=(depth+depthValues.x)/(depthValues.y);\nfloat shadowPixelDepth=clamp(depth,0.,1.0);\ndirectionToLight=normalize(directionToLight);\ndirectionToLight.y=-directionToLight.y;\n#ifndef SHADOWFLOAT\nfloat shadowMapSample=unpack(textureCube(shadowSampler,directionToLight));\n#else\nfloat shadowMapSample=textureCube(shadowSampler,directionToLight).x;\n#endif\nfloat esm=clamp(exp(min(87.,-depthScale*(shadowPixelDepth-shadowMapSample))),darkness,1.);\nreturn esm;\n}\n#if defined(WEBGL2) || defined(WEBGPU)\n#define inline\nfloat computeShadowCSM(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArray shadowSampler,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec2 uv=0.5*clipSpace.xy+vec2(0.5);\nvec3 uvLayer=vec3(uv.x,uv.y,layer);\nfloat shadowPixelDepth=clamp(depthMetric,0.,1.0);\n#ifndef SHADOWFLOAT\nfloat shadow=unpack(texture2D(shadowSampler,uvLayer));\n#else\nfloat shadow=texture2D(shadowSampler,uvLayer).x;\n#endif\nreturn shadowPixelDepth>shadow ? computeFallOff(darkness,clipSpace.xy,frustumEdgeFalloff) : 1.;\n}\n#endif\n#define inline\nfloat computeShadow(vec4 vPositionFromLight,float depthMetric,sampler2D shadowSampler,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec2 uv=0.5*clipSpace.xy+vec2(0.5);\nif (uv.x<0. || uv.x>1.0 || uv.y<0. || uv.y>1.0)\n{\nreturn 1.0;\n}\nelse\n{\nfloat shadowPixelDepth=clamp(depthMetric,0.,1.0);\n#ifndef SHADOWFLOAT\nfloat shadow=unpack(texture2D(shadowSampler,uv));\n#else\nfloat shadow=texture2D(shadowSampler,uv).x;\n#endif\nreturn shadowPixelDepth>shadow ? computeFallOff(darkness,clipSpace.xy,frustumEdgeFalloff) : 1.;\n}\n}\n#define inline\nfloat computeShadowWithPoissonSampling(vec4 vPositionFromLight,float depthMetric,sampler2D shadowSampler,float mapSize,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec2 uv=0.5*clipSpace.xy+vec2(0.5);\nif (uv.x<0. || uv.x>1.0 || uv.y<0. || uv.y>1.0)\n{\nreturn 1.0;\n}\nelse\n{\nfloat shadowPixelDepth=clamp(depthMetric,0.,1.0);\nfloat visibility=1.;\nvec2 poissonDisk[4];\npoissonDisk[0]=vec2(-0.94201624,-0.39906216);\npoissonDisk[1]=vec2(0.94558609,-0.76890725);\npoissonDisk[2]=vec2(-0.094184101,-0.92938870);\npoissonDisk[3]=vec2(0.34495938,0.29387760);\n#ifndef SHADOWFLOAT\nif (unpack(texture2D(shadowSampler,uv+poissonDisk[0]*mapSize))<shadowPixelDepth) visibility-=0.25;\nif (unpack(texture2D(shadowSampler,uv+poissonDisk[1]*mapSize))<shadowPixelDepth) visibility-=0.25;\nif (unpack(texture2D(shadowSampler,uv+poissonDisk[2]*mapSize))<shadowPixelDepth) visibility-=0.25;\nif (unpack(texture2D(shadowSampler,uv+poissonDisk[3]*mapSize))<shadowPixelDepth) visibility-=0.25;\n#else\nif (texture2D(shadowSampler,uv+poissonDisk[0]*mapSize).x<shadowPixelDepth) visibility-=0.25;\nif (texture2D(shadowSampler,uv+poissonDisk[1]*mapSize).x<shadowPixelDepth) visibility-=0.25;\nif (texture2D(shadowSampler,uv+poissonDisk[2]*mapSize).x<shadowPixelDepth) visibility-=0.25;\nif (texture2D(shadowSampler,uv+poissonDisk[3]*mapSize).x<shadowPixelDepth) visibility-=0.25;\n#endif\nreturn computeFallOff(min(1.0,visibility+darkness),clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#define inline\nfloat computeShadowWithESM(vec4 vPositionFromLight,float depthMetric,sampler2D shadowSampler,float darkness,float depthScale,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec2 uv=0.5*clipSpace.xy+vec2(0.5);\nif (uv.x<0. || uv.x>1.0 || uv.y<0. || uv.y>1.0)\n{\nreturn 1.0;\n}\nelse\n{\nfloat shadowPixelDepth=clamp(depthMetric,0.,1.0);\n#ifndef SHADOWFLOAT\nfloat shadowMapSample=unpack(texture2D(shadowSampler,uv));\n#else\nfloat shadowMapSample=texture2D(shadowSampler,uv).x;\n#endif\nfloat esm=1.0-clamp(exp(min(87.,depthScale*shadowPixelDepth))*shadowMapSample,0.,1.-darkness);\nreturn computeFallOff(esm,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#define inline\nfloat computeShadowWithCloseESM(vec4 vPositionFromLight,float depthMetric,sampler2D shadowSampler,float darkness,float depthScale,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec2 uv=0.5*clipSpace.xy+vec2(0.5);\nif (uv.x<0. || uv.x>1.0 || uv.y<0. || uv.y>1.0)\n{\nreturn 1.0;\n}\nelse\n{\nfloat shadowPixelDepth=clamp(depthMetric,0.,1.0); \n#ifndef SHADOWFLOAT\nfloat shadowMapSample=unpack(texture2D(shadowSampler,uv));\n#else\nfloat shadowMapSample=texture2D(shadowSampler,uv).x;\n#endif\nfloat esm=clamp(exp(min(87.,-depthScale*(shadowPixelDepth-shadowMapSample))),darkness,1.);\nreturn computeFallOff(esm,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#ifdef IS_NDC_HALF_ZRANGE\n#define ZINCLIP clipSpace.z\n#else\n#define ZINCLIP uvDepth.z\n#endif\n#if defined(WEBGL2) || defined(WEBGPU)\n#define GREATEST_LESS_THAN_ONE 0.99999994\n#define inline\nfloat computeShadowWithCSMPCF1(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArrayShadow shadowSampler,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=clamp(ZINCLIP,0.,GREATEST_LESS_THAN_ONE);\nvec4 uvDepthLayer=vec4(uvDepth.x,uvDepth.y,layer,uvDepth.z);\nfloat shadow=texture2D(shadowSampler,uvDepthLayer);\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n#define inline\nfloat computeShadowWithCSMPCF3(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArrayShadow shadowSampler,vec2 shadowMapSizeAndInverse,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=clamp(ZINCLIP,0.,GREATEST_LESS_THAN_ONE);\nvec2 uv=uvDepth.xy*shadowMapSizeAndInverse.x; \nuv+=0.5; \nvec2 st=fract(uv); \nvec2 base_uv=floor(uv)-0.5; \nbase_uv*=shadowMapSizeAndInverse.y; \nvec2 uvw0=3.-2.*st;\nvec2 uvw1=1.+2.*st;\nvec2 u=vec2((2.-st.x)/uvw0.x-1.,st.x/uvw1.x+1.)*shadowMapSizeAndInverse.y;\nvec2 v=vec2((2.-st.y)/uvw0.y-1.,st.y/uvw1.y+1.)*shadowMapSizeAndInverse.y;\nfloat shadow=0.;\nshadow+=uvw0.x*uvw0.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[0],v[0]),layer,uvDepth.z));\nshadow+=uvw1.x*uvw0.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[1],v[0]),layer,uvDepth.z));\nshadow+=uvw0.x*uvw1.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[0],v[1]),layer,uvDepth.z));\nshadow+=uvw1.x*uvw1.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[1],v[1]),layer,uvDepth.z));\nshadow=shadow/16.;\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n#define inline\nfloat computeShadowWithCSMPCF5(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArrayShadow shadowSampler,vec2 shadowMapSizeAndInverse,float darkness,float frustumEdgeFalloff)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=clamp(ZINCLIP,0.,GREATEST_LESS_THAN_ONE);\nvec2 uv=uvDepth.xy*shadowMapSizeAndInverse.x; \nuv+=0.5; \nvec2 st=fract(uv); \nvec2 base_uv=floor(uv)-0.5; \nbase_uv*=shadowMapSizeAndInverse.y; \nvec2 uvw0=4.-3.*st;\nvec2 uvw1=vec2(7.);\nvec2 uvw2=1.+3.*st;\nvec3 u=vec3((3.-2.*st.x)/uvw0.x-2.,(3.+st.x)/uvw1.x,st.x/uvw2.x+2.)*shadowMapSizeAndInverse.y;\nvec3 v=vec3((3.-2.*st.y)/uvw0.y-2.,(3.+st.y)/uvw1.y,st.y/uvw2.y+2.)*shadowMapSizeAndInverse.y;\nfloat shadow=0.;\nshadow+=uvw0.x*uvw0.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[0],v[0]),layer,uvDepth.z));\nshadow+=uvw1.x*uvw0.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[1],v[0]),layer,uvDepth.z));\nshadow+=uvw2.x*uvw0.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[2],v[0]),layer,uvDepth.z));\nshadow+=uvw0.x*uvw1.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[0],v[1]),layer,uvDepth.z));\nshadow+=uvw1.x*uvw1.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[1],v[1]),layer,uvDepth.z));\nshadow+=uvw2.x*uvw1.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[2],v[1]),layer,uvDepth.z));\nshadow+=uvw0.x*uvw2.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[0],v[2]),layer,uvDepth.z));\nshadow+=uvw1.x*uvw2.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[1],v[2]),layer,uvDepth.z));\nshadow+=uvw2.x*uvw2.y*texture2D(shadowSampler,vec4(base_uv.xy+vec2(u[2],v[2]),layer,uvDepth.z));\nshadow=shadow/144.;\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n#define inline\nfloat computeShadowWithPCF1(vec4 vPositionFromLight,float depthMetric,highp sampler2DShadow shadowSampler,float darkness,float frustumEdgeFalloff)\n{\nif (depthMetric>1.0 || depthMetric<0.0) {\nreturn 1.0;\n}\nelse\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=ZINCLIP;\nfloat shadow=texture2D(shadowSampler,uvDepth);\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#define inline\nfloat computeShadowWithPCF3(vec4 vPositionFromLight,float depthMetric,highp sampler2DShadow shadowSampler,vec2 shadowMapSizeAndInverse,float darkness,float frustumEdgeFalloff)\n{\nif (depthMetric>1.0 || depthMetric<0.0) {\nreturn 1.0;\n}\nelse\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=ZINCLIP;\nvec2 uv=uvDepth.xy*shadowMapSizeAndInverse.x; \nuv+=0.5; \nvec2 st=fract(uv); \nvec2 base_uv=floor(uv)-0.5; \nbase_uv*=shadowMapSizeAndInverse.y; \nvec2 uvw0=3.-2.*st;\nvec2 uvw1=1.+2.*st;\nvec2 u=vec2((2.-st.x)/uvw0.x-1.,st.x/uvw1.x+1.)*shadowMapSizeAndInverse.y;\nvec2 v=vec2((2.-st.y)/uvw0.y-1.,st.y/uvw1.y+1.)*shadowMapSizeAndInverse.y;\nfloat shadow=0.;\nshadow+=uvw0.x*uvw0.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[0],v[0]),uvDepth.z));\nshadow+=uvw1.x*uvw0.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[1],v[0]),uvDepth.z));\nshadow+=uvw0.x*uvw1.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[0],v[1]),uvDepth.z));\nshadow+=uvw1.x*uvw1.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[1],v[1]),uvDepth.z));\nshadow=shadow/16.;\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#define inline\nfloat computeShadowWithPCF5(vec4 vPositionFromLight,float depthMetric,highp sampler2DShadow shadowSampler,vec2 shadowMapSizeAndInverse,float darkness,float frustumEdgeFalloff)\n{\nif (depthMetric>1.0 || depthMetric<0.0) {\nreturn 1.0;\n}\nelse\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=ZINCLIP;\nvec2 uv=uvDepth.xy*shadowMapSizeAndInverse.x; \nuv+=0.5; \nvec2 st=fract(uv); \nvec2 base_uv=floor(uv)-0.5; \nbase_uv*=shadowMapSizeAndInverse.y; \nvec2 uvw0=4.-3.*st;\nvec2 uvw1=vec2(7.);\nvec2 uvw2=1.+3.*st;\nvec3 u=vec3((3.-2.*st.x)/uvw0.x-2.,(3.+st.x)/uvw1.x,st.x/uvw2.x+2.)*shadowMapSizeAndInverse.y;\nvec3 v=vec3((3.-2.*st.y)/uvw0.y-2.,(3.+st.y)/uvw1.y,st.y/uvw2.y+2.)*shadowMapSizeAndInverse.y;\nfloat shadow=0.;\nshadow+=uvw0.x*uvw0.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[0],v[0]),uvDepth.z));\nshadow+=uvw1.x*uvw0.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[1],v[0]),uvDepth.z));\nshadow+=uvw2.x*uvw0.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[2],v[0]),uvDepth.z));\nshadow+=uvw0.x*uvw1.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[0],v[1]),uvDepth.z));\nshadow+=uvw1.x*uvw1.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[1],v[1]),uvDepth.z));\nshadow+=uvw2.x*uvw1.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[2],v[1]),uvDepth.z));\nshadow+=uvw0.x*uvw2.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[0],v[2]),uvDepth.z));\nshadow+=uvw1.x*uvw2.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[1],v[2]),uvDepth.z));\nshadow+=uvw2.x*uvw2.y*texture2D(shadowSampler,vec3(base_uv.xy+vec2(u[2],v[2]),uvDepth.z));\nshadow=shadow/144.;\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n}\nconst vec3 PoissonSamplers32[64]=vec3[64](\nvec3(0.06407013,0.05409927,0.),\nvec3(0.7366577,0.5789394,0.),\nvec3(-0.6270542,-0.5320278,0.),\nvec3(-0.4096107,0.8411095,0.),\nvec3(0.6849564,-0.4990818,0.),\nvec3(-0.874181,-0.04579735,0.),\nvec3(0.9989998,0.0009880066,0.),\nvec3(-0.004920578,-0.9151649,0.),\nvec3(0.1805763,0.9747483,0.),\nvec3(-0.2138451,0.2635818,0.),\nvec3(0.109845,0.3884785,0.),\nvec3(0.06876755,-0.3581074,0.),\nvec3(0.374073,-0.7661266,0.),\nvec3(0.3079132,-0.1216763,0.),\nvec3(-0.3794335,-0.8271583,0.),\nvec3(-0.203878,-0.07715034,0.),\nvec3(0.5912697,0.1469799,0.),\nvec3(-0.88069,0.3031784,0.),\nvec3(0.5040108,0.8283722,0.),\nvec3(-0.5844124,0.5494877,0.),\nvec3(0.6017799,-0.1726654,0.),\nvec3(-0.5554981,0.1559997,0.),\nvec3(-0.3016369,-0.3900928,0.),\nvec3(-0.5550632,-0.1723762,0.),\nvec3(0.925029,0.2995041,0.),\nvec3(-0.2473137,0.5538505,0.),\nvec3(0.9183037,-0.2862392,0.),\nvec3(0.2469421,0.6718712,0.),\nvec3(0.3916397,-0.4328209,0.),\nvec3(-0.03576927,-0.6220032,0.),\nvec3(-0.04661255,0.7995201,0.),\nvec3(0.4402924,0.3640312,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.),\nvec3(0.,0.,0.)\n);\nconst vec3 PoissonSamplers64[64]=vec3[64](\nvec3(-0.613392,0.617481,0.),\nvec3(0.170019,-0.040254,0.),\nvec3(-0.299417,0.791925,0.),\nvec3(0.645680,0.493210,0.),\nvec3(-0.651784,0.717887,0.),\nvec3(0.421003,0.027070,0.),\nvec3(-0.817194,-0.271096,0.),\nvec3(-0.705374,-0.668203,0.),\nvec3(0.977050,-0.108615,0.),\nvec3(0.063326,0.142369,0.),\nvec3(0.203528,0.214331,0.),\nvec3(-0.667531,0.326090,0.),\nvec3(-0.098422,-0.295755,0.),\nvec3(-0.885922,0.215369,0.),\nvec3(0.566637,0.605213,0.),\nvec3(0.039766,-0.396100,0.),\nvec3(0.751946,0.453352,0.),\nvec3(0.078707,-0.715323,0.),\nvec3(-0.075838,-0.529344,0.),\nvec3(0.724479,-0.580798,0.),\nvec3(0.222999,-0.215125,0.),\nvec3(-0.467574,-0.405438,0.),\nvec3(-0.248268,-0.814753,0.),\nvec3(0.354411,-0.887570,0.),\nvec3(0.175817,0.382366,0.),\nvec3(0.487472,-0.063082,0.),\nvec3(-0.084078,0.898312,0.),\nvec3(0.488876,-0.783441,0.),\nvec3(0.470016,0.217933,0.),\nvec3(-0.696890,-0.549791,0.),\nvec3(-0.149693,0.605762,0.),\nvec3(0.034211,0.979980,0.),\nvec3(0.503098,-0.308878,0.),\nvec3(-0.016205,-0.872921,0.),\nvec3(0.385784,-0.393902,0.),\nvec3(-0.146886,-0.859249,0.),\nvec3(0.643361,0.164098,0.),\nvec3(0.634388,-0.049471,0.),\nvec3(-0.688894,0.007843,0.),\nvec3(0.464034,-0.188818,0.),\nvec3(-0.440840,0.137486,0.),\nvec3(0.364483,0.511704,0.),\nvec3(0.034028,0.325968,0.),\nvec3(0.099094,-0.308023,0.),\nvec3(0.693960,-0.366253,0.),\nvec3(0.678884,-0.204688,0.),\nvec3(0.001801,0.780328,0.),\nvec3(0.145177,-0.898984,0.),\nvec3(0.062655,-0.611866,0.),\nvec3(0.315226,-0.604297,0.),\nvec3(-0.780145,0.486251,0.),\nvec3(-0.371868,0.882138,0.),\nvec3(0.200476,0.494430,0.),\nvec3(-0.494552,-0.711051,0.),\nvec3(0.612476,0.705252,0.),\nvec3(-0.578845,-0.768792,0.),\nvec3(-0.772454,-0.090976,0.),\nvec3(0.504440,0.372295,0.),\nvec3(0.155736,0.065157,0.),\nvec3(0.391522,0.849605,0.),\nvec3(-0.620106,-0.328104,0.),\nvec3(0.789239,-0.419965,0.),\nvec3(-0.545396,0.538133,0.),\nvec3(-0.178564,-0.596057,0.)\n);\n#define inline\nfloat computeShadowWithCSMPCSS(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArray depthSampler,highp sampler2DArrayShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff,int searchTapCount,int pcfTapCount,vec3[64] poissonSamplers,vec2 lightSizeUVCorrection,float depthCorrection,float penumbraDarkness)\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=clamp(ZINCLIP,0.,GREATEST_LESS_THAN_ONE);\nvec4 uvDepthLayer=vec4(uvDepth.x,uvDepth.y,layer,uvDepth.z);\nfloat blockerDepth=0.0;\nfloat sumBlockerDepth=0.0;\nfloat numBlocker=0.0;\nfor (int i=0; i<searchTapCount; i ++) {\nblockerDepth=texture2D(depthSampler,vec3(uvDepth.xy+(lightSizeUV*lightSizeUVCorrection*shadowMapSizeInverse*PoissonSamplers32[i].xy),layer)).r;\nif (blockerDepth<depthMetric) {\nsumBlockerDepth+=blockerDepth;\nnumBlocker++;\n}\n}\nif (numBlocker<1.0) {\nreturn 1.0;\n}\nelse\n{\nfloat avgBlockerDepth=sumBlockerDepth/numBlocker;\nfloat AAOffset=shadowMapSizeInverse*10.;\nfloat penumbraRatio=((depthMetric-avgBlockerDepth)*depthCorrection+AAOffset);\nvec4 filterRadius=vec4(penumbraRatio*lightSizeUV*lightSizeUVCorrection*shadowMapSizeInverse,0.,0.);\nfloat random=getRand(vPositionFromLight.xy);\nfloat rotationAngle=random*3.1415926;\nvec2 rotationVector=vec2(cos(rotationAngle),sin(rotationAngle));\nfloat shadow=0.;\nfor (int i=0; i<pcfTapCount; i++) {\nvec4 offset=vec4(poissonSamplers[i],0.);\noffset=vec4(offset.x*rotationVector.x-offset.y*rotationVector.y,offset.y*rotationVector.x+offset.x*rotationVector.y,0.,0.);\nshadow+=texture2D(shadowSampler,uvDepthLayer+offset*filterRadius);\n}\nshadow/=float(pcfTapCount);\nshadow=mix(shadow,1.,min((depthMetric-avgBlockerDepth)*depthCorrection*penumbraDarkness,1.));\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n#define inline\nfloat computeShadowWithPCSS(vec4 vPositionFromLight,float depthMetric,sampler2D depthSampler,highp sampler2DShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff,int searchTapCount,int pcfTapCount,vec3[64] poissonSamplers)\n{\nif (depthMetric>1.0 || depthMetric<0.0) {\nreturn 1.0;\n}\nelse\n{\nvec3 clipSpace=vPositionFromLight.xyz/vPositionFromLight.w;\nvec3 uvDepth=vec3(0.5*clipSpace.xyz+vec3(0.5));\nuvDepth.z=ZINCLIP;\nfloat blockerDepth=0.0;\nfloat sumBlockerDepth=0.0;\nfloat numBlocker=0.0;\nfor (int i=0; i<searchTapCount; i ++) {\nblockerDepth=texture2D(depthSampler,uvDepth.xy+(lightSizeUV*shadowMapSizeInverse*PoissonSamplers32[i].xy)).r;\nif (blockerDepth<depthMetric) {\nsumBlockerDepth+=blockerDepth;\nnumBlocker++;\n}\n}\nif (numBlocker<1.0) {\nreturn 1.0;\n}\nelse\n{\nfloat avgBlockerDepth=sumBlockerDepth/numBlocker;\nfloat AAOffset=shadowMapSizeInverse*10.;\nfloat penumbraRatio=((depthMetric-avgBlockerDepth)+AAOffset);\nfloat filterRadius=penumbraRatio*lightSizeUV*shadowMapSizeInverse;\nfloat random=getRand(vPositionFromLight.xy);\nfloat rotationAngle=random*3.1415926;\nvec2 rotationVector=vec2(cos(rotationAngle),sin(rotationAngle));\nfloat shadow=0.;\nfor (int i=0; i<pcfTapCount; i++) {\nvec3 offset=poissonSamplers[i];\noffset=vec3(offset.x*rotationVector.x-offset.y*rotationVector.y,offset.y*rotationVector.x+offset.x*rotationVector.y,0.);\nshadow+=texture2D(shadowSampler,uvDepth+offset*filterRadius);\n}\nshadow/=float(pcfTapCount);\nshadow=mix(shadow,1.,depthMetric-avgBlockerDepth);\nshadow=mix(darkness,1.,shadow);\nreturn computeFallOff(shadow,clipSpace.xy,frustumEdgeFalloff);\n}\n}\n}\n#define inline\nfloat computeShadowWithPCSS16(vec4 vPositionFromLight,float depthMetric,sampler2D depthSampler,highp sampler2DShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff)\n{\nreturn computeShadowWithPCSS(vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,16,16,PoissonSamplers32);\n}\n#define inline\nfloat computeShadowWithPCSS32(vec4 vPositionFromLight,float depthMetric,sampler2D depthSampler,highp sampler2DShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff)\n{\nreturn computeShadowWithPCSS(vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,16,32,PoissonSamplers32);\n}\n#define inline\nfloat computeShadowWithPCSS64(vec4 vPositionFromLight,float depthMetric,sampler2D depthSampler,highp sampler2DShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff)\n{\nreturn computeShadowWithPCSS(vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,32,64,PoissonSamplers64);\n}\n#define inline\nfloat computeShadowWithCSMPCSS16(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArray depthSampler,highp sampler2DArrayShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff,vec2 lightSizeUVCorrection,float depthCorrection,float penumbraDarkness)\n{\nreturn computeShadowWithCSMPCSS(layer,vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,16,16,PoissonSamplers32,lightSizeUVCorrection,depthCorrection,penumbraDarkness);\n}\n#define inline\nfloat computeShadowWithCSMPCSS32(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArray depthSampler,highp sampler2DArrayShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff,vec2 lightSizeUVCorrection,float depthCorrection,float penumbraDarkness)\n{\nreturn computeShadowWithCSMPCSS(layer,vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,16,32,PoissonSamplers32,lightSizeUVCorrection,depthCorrection,penumbraDarkness);\n}\n#define inline\nfloat computeShadowWithCSMPCSS64(float layer,vec4 vPositionFromLight,float depthMetric,highp sampler2DArray depthSampler,highp sampler2DArrayShadow shadowSampler,float shadowMapSizeInverse,float lightSizeUV,float darkness,float frustumEdgeFalloff,vec2 lightSizeUVCorrection,float depthCorrection,float penumbraDarkness)\n{\nreturn computeShadowWithCSMPCSS(layer,vPositionFromLight,depthMetric,depthSampler,shadowSampler,shadowMapSizeInverse,lightSizeUV,darkness,frustumEdgeFalloff,32,64,PoissonSamplers64,lightSizeUVCorrection,depthCorrection,penumbraDarkness);\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowsFragmentFunctions = { name: name, shader: shader };
//# sourceMappingURL=shadowsFragmentFunctions.js.map