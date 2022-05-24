// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
import "./ShadersInclude/packingFunctions.js";
var name = "standardPixelShader";
var shader = "uniform sampler2D textureSampler;\nvarying vec2 vUV;\n#define CUSTOM_FRAGMENT_DEFINITIONS\n#if defined(PASS_POST_PROCESS)\nvoid main(void)\n{\nvec4 color=texture2D(textureSampler,vUV);\ngl_FragColor=color;\n}\n#endif\n#if defined(DOWN_SAMPLE_X4)\nuniform vec2 dsOffsets[16];\nvoid main(void)\n{\nvec4 average=vec4(0.0,0.0,0.0,0.0);\naverage=texture2D(textureSampler,vUV+dsOffsets[0]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[1]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[2]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[3]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[4]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[5]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[6]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[7]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[8]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[9]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[10]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[11]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[12]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[13]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[14]);\naverage+=texture2D(textureSampler,vUV+dsOffsets[15]);\naverage/=16.0;\ngl_FragColor=average;\n}\n#endif\n#if defined(BRIGHT_PASS)\nuniform vec2 dsOffsets[4];\nuniform float brightThreshold;\nvoid main(void)\n{\nvec4 average=vec4(0.0,0.0,0.0,0.0);\naverage=texture2D(textureSampler,vUV+vec2(dsOffsets[0].x,dsOffsets[0].y));\naverage+=texture2D(textureSampler,vUV+vec2(dsOffsets[1].x,dsOffsets[1].y));\naverage+=texture2D(textureSampler,vUV+vec2(dsOffsets[2].x,dsOffsets[2].y));\naverage+=texture2D(textureSampler,vUV+vec2(dsOffsets[3].x,dsOffsets[3].y));\naverage*=0.25;\nfloat luminance=length(average.rgb);\nif (luminance<brightThreshold) {\naverage=vec4(0.0,0.0,0.0,1.0);\n}\ngl_FragColor=average;\n}\n#endif\n#if defined(TEXTURE_ADDER)\nuniform sampler2D otherSampler;\nuniform sampler2D lensSampler;\nuniform float exposure;\nvoid main(void)\n{\nvec3 colour=texture2D(textureSampler,vUV).rgb;\ncolour*=exposure;\nvec3 X=max(vec3(0.0,0.0,0.0),colour-0.004);\nvec3 retColor=(X*(6.2*X+0.5))/(X*(6.2*X+1.7)+0.06);\ncolour=retColor*retColor;\ncolour+=colour*texture2D(lensSampler,vUV).rgb;\nvec4 finalColor=vec4(colour.rgb,1.0)+texture2D(otherSampler,vUV);\ngl_FragColor=finalColor;\n}\n#endif\n#if defined(VLS)\n#define PI 3.1415926535897932384626433832795\nuniform mat4 shadowViewProjection;\nuniform mat4 lightWorld;\nuniform vec3 cameraPosition;\nuniform vec3 sunDirection;\nuniform vec3 sunColor;\nuniform vec2 depthValues;\nuniform float scatteringCoefficient;\nuniform float scatteringPower;\nuniform sampler2D shadowMapSampler;\nuniform sampler2D positionSampler;\nfloat computeScattering(float lightDotView)\n{\nfloat result=1.0-scatteringCoefficient*scatteringCoefficient;\nresult/=(4.0*PI*pow(1.0+scatteringCoefficient*scatteringCoefficient-(2.0*scatteringCoefficient)*lightDotView,1.5));\nreturn result;\n}\nvoid main(void)\n{\nvec3 worldPos=texture2D(positionSampler,vUV).rgb;\nvec3 startPosition=cameraPosition;\nvec3 rayVector=worldPos-startPosition;\nfloat rayLength=length(rayVector);\nvec3 rayDirection=rayVector/rayLength;\nfloat stepLength=rayLength/NB_STEPS;\nvec3 stepL=rayDirection*stepLength;\nvec3 currentPosition=startPosition;\nvec3 accumFog=vec3(0.0);\nfor (int i=0; i<int(NB_STEPS); i++)\n{\nvec4 worldInShadowCameraSpace=shadowViewProjection*vec4(currentPosition,1.0);\nfloat depthMetric= (worldInShadowCameraSpace.z+depthValues.x)/(depthValues.y);\nfloat shadowPixelDepth=clamp(depthMetric,0.0,1.0);\nworldInShadowCameraSpace.xyz/=worldInShadowCameraSpace.w;\nworldInShadowCameraSpace.xyz=0.5*worldInShadowCameraSpace.xyz+vec3(0.5);\nfloat shadowMapValue=texture2D(shadowMapSampler,worldInShadowCameraSpace.xy).r;\nif (shadowMapValue>shadowPixelDepth)\naccumFog+=sunColor*computeScattering(dot(rayDirection,sunDirection));\ncurrentPosition+=stepL;\n}\naccumFog/=NB_STEPS;\nvec3 color=accumFog*scatteringPower;\ngl_FragColor=vec4(color*exp(color) ,1.0);\n}\n#endif\n#if defined(VLSMERGE)\nuniform sampler2D originalSampler;\nvoid main(void)\n{\ngl_FragColor=texture2D(originalSampler,vUV)+texture2D(textureSampler,vUV);\n}\n#endif\n#if defined(LUMINANCE)\nuniform vec2 lumOffsets[4];\nvoid main()\n{\nfloat average=0.0;\nvec4 color=vec4(0.0);\nfloat maximum=-1e20;\nvec3 weight=vec3(0.299,0.587,0.114);\nfor (int i=0; i<4; i++)\n{\ncolor=texture2D(textureSampler,vUV+ lumOffsets[i]);\nfloat GreyValue=dot(color.rgb,vec3(0.33,0.33,0.33));\n#ifdef WEIGHTED_AVERAGE\nfloat GreyValue=dot(color.rgb,weight);\n#endif\n#ifdef BRIGHTNESS\nfloat GreyValue=max(color.r,max(color.g,color.b));\n#endif\n#ifdef HSL_COMPONENT\nfloat GreyValue=0.5*(max(color.r,max(color.g,color.b))+min(color.r,min(color.g,color.b)));\n#endif\n#ifdef MAGNITUDE\nfloat GreyValue=length(color.rgb);\n#endif\nmaximum=max(maximum,GreyValue);\naverage+=(0.25*log(1e-5+GreyValue));\n}\naverage=exp(average);\ngl_FragColor=vec4(average,maximum,0.0,1.0);\n}\n#endif\n#if defined(LUMINANCE_DOWN_SAMPLE)\nuniform vec2 dsOffsets[9];\nuniform float halfDestPixelSize;\n#ifdef FINAL_DOWN_SAMPLER\n#include<packingFunctions>\n#endif\nvoid main()\n{\nvec4 color=vec4(0.0);\nfloat average=0.0;\nfor (int i=0; i<9; i++)\n{\ncolor=texture2D(textureSampler,vUV+vec2(halfDestPixelSize,halfDestPixelSize)+dsOffsets[i]);\naverage+=color.r;\n}\naverage/=9.0;\n#ifdef FINAL_DOWN_SAMPLER\ngl_FragColor=pack(average);\n#else\ngl_FragColor=vec4(average,average,0.0,1.0);\n#endif\n}\n#endif\n#if defined(HDR)\nuniform sampler2D textureAdderSampler;\nuniform float averageLuminance;\nvoid main()\n{\nvec4 color=texture2D(textureAdderSampler,vUV);\n#ifndef AUTO_EXPOSURE\nvec4 adjustedColor=color/averageLuminance;\ncolor=adjustedColor;\ncolor.a=1.0;\n#endif\ngl_FragColor=color;\n}\n#endif\n#if defined(LENS_FLARE)\n#define GHOSTS 3\nuniform sampler2D lensColorSampler;\nuniform float strength;\nuniform float ghostDispersal;\nuniform float haloWidth;\nuniform vec2 resolution;\nuniform float distortionStrength;\nfloat hash(vec2 p)\n{\nfloat h=dot(p,vec2(127.1,311.7));\nreturn -1.0+2.0*fract(sin(h)*43758.5453123);\n}\nfloat noise(in vec2 p)\n{\nvec2 i=floor(p);\nvec2 f=fract(p);\nvec2 u=f*f*(3.0-2.0*f);\nreturn mix(mix(hash(i+vec2(0.0,0.0)),\nhash(i+vec2(1.0,0.0)),u.x),\nmix(hash(i+vec2(0.0,1.0)),\nhash(i+vec2(1.0,1.0)),u.x),u.y);\n}\nfloat fbm(vec2 p)\n{\nfloat f=0.0;\nf+=0.5000*noise(p); p*=2.02;\nf+=0.2500*noise(p); p*=2.03;\nf+=0.1250*noise(p); p*=2.01;\nf+=0.0625*noise(p); p*=2.04;\nf/=0.9375;\nreturn f;\n}\nvec3 pattern(vec2 uv)\n{\nvec2 p=-1.0+2.0*uv;\nfloat p2=dot(p,p);\nfloat f=fbm(vec2(15.0*p2))/2.0;\nfloat r=0.2+0.6*sin(12.5*length(uv-vec2(0.5)));\nfloat g=0.2+0.6*sin(20.5*length(uv-vec2(0.5)));\nfloat b=0.2+0.6*sin(17.2*length(uv-vec2(0.5)));\nreturn (1.0-f)*vec3(r,g,b);\n}\nfloat luminance(vec3 color)\n{\nreturn dot(color.rgb,vec3(0.2126,0.7152,0.0722));\n}\nvec4 textureDistorted(sampler2D tex,vec2 texcoord,vec2 direction,vec3 distortion)\n{\nreturn vec4(\ntexture2D(tex,texcoord+direction*distortion.r).r,\ntexture2D(tex,texcoord+direction*distortion.g).g,\ntexture2D(tex,texcoord+direction*distortion.b).b,\n1.0\n);\n}\nvoid main(void)\n{\nvec2 uv=-vUV+vec2(1.0);\nvec2 ghostDir=(vec2(0.5)-uv)*ghostDispersal;\nvec2 texelSize=1.0/resolution;\nvec3 distortion=vec3(-texelSize.x*distortionStrength,0.0,texelSize.x*distortionStrength);\nvec4 result=vec4(0.0);\nfloat ghostIndice=1.0;\nfor (int i=0; i<GHOSTS; ++i)\n{\nvec2 offset=fract(uv+ghostDir*ghostIndice);\nfloat weight=length(vec2(0.5)-offset)/length(vec2(0.5));\nweight=pow(1.0-weight,10.0);\nresult+=textureDistorted(textureSampler,offset,normalize(ghostDir),distortion)*weight*strength;\nghostIndice+=1.0;\n}\nvec2 haloVec=normalize(ghostDir)*haloWidth;\nfloat weight=length(vec2(0.5)-fract(uv+haloVec))/length(vec2(0.5));\nweight=pow(1.0-weight,10.0);\nresult+=textureDistorted(textureSampler,fract(uv+haloVec),normalize(ghostDir),distortion)*weight*strength;\nresult*=texture2D(lensColorSampler,vec2(length(vec2(0.5)-uv)/length(vec2(0.5))));\ngl_FragColor=result;\n}\n#endif\n#if defined(LENS_FLARE_COMPOSE)\nuniform sampler2D otherSampler;\nuniform sampler2D lensDirtSampler;\nuniform sampler2D lensStarSampler;\nuniform mat4 lensStarMatrix;\nvoid main(void)\n{\nvec2 lensFlareCoords=(lensStarMatrix*vec4(vUV,1.0,1.0)).xy;\nvec4 lensMod=texture2D(lensDirtSampler,vUV);\nlensMod+=texture2D(lensStarSampler,vUV/*lensFlareCoords*/);\nvec4 result=texture2D(textureSampler,vUV)*lensMod;\ngl_FragColor=texture2D(otherSampler,vUV)+result;\n}\n#endif\n#if defined(DEPTH_OF_FIELD)\nuniform sampler2D otherSampler;\nuniform sampler2D depthSampler;\nuniform float distance;\nvoid main(void)\n{\nvec4 sharp=texture2D(otherSampler,vUV);\nvec4 blur=texture2D(textureSampler,vUV);\nfloat dist=clamp(texture2D(depthSampler,vUV).r*distance,0.0,1.0);\nfloat factor=0.0;\nif (dist<0.05)\nfactor=1.0;\nelse if (dist<0.1)\nfactor=20.0*(0.1-dist);\nelse if (dist<0.5)\nfactor=0.0;\nelse\nfactor=2.0*(dist-0.5);\nfactor=clamp(factor,0.0,0.90);\ngl_FragColor=mix(sharp,blur,factor);\n}\n#endif\n#if defined(MOTION_BLUR)\nuniform mat4 inverseViewProjection;\nuniform mat4 prevViewProjection;\nuniform vec2 screenSize;\nuniform float motionScale;\nuniform float motionStrength;\nuniform sampler2D depthSampler;\nvoid main(void)\n{\nvec2 texelSize=1.0/screenSize;\nfloat depth=texture2D(depthSampler,vUV).r;\nvec4 cpos=vec4(vUV*2.0-1.0,depth,1.0);\ncpos=cpos*inverseViewProjection;\nvec4 ppos=cpos*prevViewProjection;\nppos.xyz/=ppos.w;\nppos.xy=ppos.xy*0.5+0.5;\nvec2 velocity=(ppos.xy-vUV)*motionScale*motionStrength;\nfloat speed=length(velocity/texelSize);\nint nSamples=int(clamp(speed,1.0,MAX_MOTION_SAMPLES));\nvec4 result=texture2D(textureSampler,vUV);\nfor (int i=1; i<int(MAX_MOTION_SAMPLES); ++i) {\nif (i>=nSamples)\nbreak;\nvec2 offset1=vUV+velocity*(float(i)/float(nSamples-1)-0.5);\nresult+=texture2D(textureSampler,offset1);\n}\ngl_FragColor=result/float(nSamples);\n}\n#endif\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var standardPixelShader = { name: name, shader: shader };
//# sourceMappingURL=standard.fragment.js.map