// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "ssao2PixelShader";
var shader = "precision highp float;\nuniform sampler2D textureSampler;\nuniform float near;\nuniform float far;\nuniform float radius;\nfloat scales[16]=float[16](\n0.1,\n0.11406250000000001,\n0.131640625,\n0.15625,\n0.187890625,\n0.2265625,\n0.272265625,\n0.325,\n0.384765625,\n0.4515625,\n0.525390625,\n0.60625,\n0.694140625,\n0.7890625,\n0.891015625,\n1.0\n);\nvarying vec2 vUV;\nfloat perspectiveDepthToViewZ(in float invClipZ,in float near,in float far ) {\nreturn ( near*far )/( ( far-near )*invClipZ-far );\n}\nfloat viewZToPerspectiveDepth( in float viewZ,in float near,in float far ) {\nreturn ( near*far/viewZ+far)/( far-near );\n}\nfloat viewZToOrthographicDepth( in float viewZ,in float near,in float far ) {\nreturn ( viewZ+near )/( near-far );\n}\n#ifdef SSAO\nuniform sampler2D randomSampler;\nuniform sampler2D depthSampler;\nuniform sampler2D normalSampler;\nuniform float randTextureTiles;\nuniform float samplesFactor;\nuniform vec3 sampleSphere[SAMPLES];\nuniform float totalStrength;\nuniform float base;\nuniform float xViewport;\nuniform float yViewport;\nuniform mat3 depthProjection;\nuniform float maxZ;\nuniform float minZAspect;\nuniform vec2 texelSize;\nuniform mat4 projection;\nvoid main()\n{\nvec3 random=texture2D(randomSampler,vUV*randTextureTiles).rgb;\nfloat depth=texture2D(depthSampler,vUV).r;\nfloat depthSign=depth/abs(depth);\ndepth=depth*depthSign;\nvec3 normal=texture2D(normalSampler,vUV).rgb;\nfloat occlusion=0.0;\nfloat correctedRadius=min(radius,minZAspect*depth/near);\nvec3 vViewRay=vec3((vUV.x*2.0-1.0)*xViewport,(vUV.y*2.0-1.0)*yViewport,depthSign);\nvec3 vDepthFactor=depthProjection*vec3(1.0,1.0,depth);\nvec3 origin=vViewRay*vDepthFactor;\nvec3 rvec=random*2.0-1.0;\nrvec.z=0.0;\nfloat dotProduct=dot(rvec,normal);\nrvec=1.0-abs(dotProduct)>1e-2 ? rvec : vec3(-rvec.y,0.0,rvec.x);\nvec3 tangent=normalize(rvec-normal*dot(rvec,normal));\nvec3 bitangent=cross(normal,tangent);\nmat3 tbn=mat3(tangent,bitangent,normal);\nfloat difference;\nfor (int i=0; i<SAMPLES; ++i) {\nvec3 samplePosition=scales[(i+int(random.x*16.0)) % 16]*tbn*sampleSphere[(i+int(random.y*16.0)) % 16];\nsamplePosition=samplePosition*correctedRadius+origin;\nvec4 offset=vec4(samplePosition,1.0);\noffset=projection*offset;\noffset.xyz/=offset.w;\noffset.xy=offset.xy*0.5+0.5;\nif (offset.x<0.0 || offset.y<0.0 || offset.x>1.0 || offset.y>1.0) {\ncontinue;\n}\nfloat sampleDepth=abs(texture2D(depthSampler,offset.xy).r);\ndifference=depthSign*samplePosition.z-sampleDepth;\nfloat rangeCheck=1.0-smoothstep(correctedRadius*0.5,correctedRadius,difference);\nocclusion+=(difference>=0.0 ? 1.0 : 0.0)*rangeCheck;\n}\nocclusion=occlusion*(1.0-smoothstep(maxZ*0.75,maxZ,depth));\nfloat ao=1.0-totalStrength*occlusion*samplesFactor;\nfloat result=clamp(ao+base,0.0,1.0);\ngl_FragColor=vec4(vec3(result),1.0);\n}\n#endif\n#ifdef BILATERAL_BLUR\nuniform sampler2D depthSampler;\nuniform float outSize;\nuniform float samplerOffsets[SAMPLES];\nvec4 blur9(sampler2D image,vec2 uv,float resolution,vec2 direction) {\nvec4 color=vec4(0.0);\nvec2 off1=vec2(1.3846153846)*direction;\nvec2 off2=vec2(3.2307692308)*direction;\ncolor+=texture2D(image,uv)*0.2270270270;\ncolor+=texture2D(image,uv+(off1/resolution))*0.3162162162;\ncolor+=texture2D(image,uv-(off1/resolution))*0.3162162162;\ncolor+=texture2D(image,uv+(off2/resolution))*0.0702702703;\ncolor+=texture2D(image,uv-(off2/resolution))*0.0702702703;\nreturn color;\n}\nvec4 blur13(sampler2D image,vec2 uv,float resolution,vec2 direction) {\nvec4 color=vec4(0.0);\nvec2 off1=vec2(1.411764705882353)*direction;\nvec2 off2=vec2(3.2941176470588234)*direction;\nvec2 off3=vec2(5.176470588235294)*direction;\ncolor+=texture2D(image,uv)*0.1964825501511404;\ncolor+=texture2D(image,uv+(off1/resolution))*0.2969069646728344;\ncolor+=texture2D(image,uv-(off1/resolution))*0.2969069646728344;\ncolor+=texture2D(image,uv+(off2/resolution))*0.09447039785044732;\ncolor+=texture2D(image,uv-(off2/resolution))*0.09447039785044732;\ncolor+=texture2D(image,uv+(off3/resolution))*0.010381362401148057;\ncolor+=texture2D(image,uv-(off3/resolution))*0.010381362401148057;\nreturn color;\n}\nvec4 blur13Bilateral(sampler2D image,vec2 uv,float resolution,vec2 direction) {\nvec4 color=vec4(0.0);\nvec2 off1=vec2(1.411764705882353)*direction;\nvec2 off2=vec2(3.2941176470588234)*direction;\nvec2 off3=vec2(5.176470588235294)*direction;\nfloat compareDepth=abs(texture2D(depthSampler,uv).r);\nfloat sampleDepth;\nfloat weight;\nfloat weightSum=30.0;\ncolor+=texture2D(image,uv)*30.0;\nsampleDepth=abs(texture2D(depthSampler,uv+(off1/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+= weight;\ncolor+=texture2D(image,uv+(off1/resolution))*weight;\nsampleDepth=abs(texture2D(depthSampler,uv-(off1/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+= weight;\ncolor+=texture2D(image,uv-(off1/resolution))*weight;\nsampleDepth=abs(texture2D(depthSampler,uv+(off2/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+=weight;\ncolor+=texture2D(image,uv+(off2/resolution))*weight;\nsampleDepth=abs(texture2D(depthSampler,uv-(off2/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+=weight;\ncolor+=texture2D(image,uv-(off2/resolution))*weight;\nsampleDepth=abs(texture2D(depthSampler,uv+(off3/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+=weight;\ncolor+=texture2D(image,uv+(off3/resolution))*weight;\nsampleDepth=abs(texture2D(depthSampler,uv-(off3/resolution)).r);\nweight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30.0);\nweightSum+=weight;\ncolor+=texture2D(image,uv-(off3/resolution))*weight;\nreturn color/weightSum;\n}\nvoid main()\n{\n#if EXPENSIVE\nfloat compareDepth=abs(texture2D(depthSampler,vUV).r);\nfloat texelsize=1.0/outSize;\nfloat result=0.0;\nfloat weightSum=0.0;\nfor (int i=0; i<SAMPLES; ++i)\n{\n#ifdef BILATERAL_BLUR_H\nvec2 direction=vec2(1.0,0.0);\nvec2 sampleOffset=vec2(texelsize*samplerOffsets[i],0.0);\n#else\nvec2 direction=vec2(0.0,1.0);\nvec2 sampleOffset=vec2(0.0,texelsize*samplerOffsets[i]);\n#endif\nvec2 samplePos=vUV+sampleOffset;\nfloat sampleDepth=abs(texture2D(depthSampler,samplePos).r);\nfloat weight=clamp(1.0/( 0.003+abs(compareDepth-sampleDepth)),0.0,30000.0);\nresult+=texture2D(textureSampler,samplePos).r*weight;\nweightSum+=weight;\n}\nresult/=weightSum;\ngl_FragColor.rgb=vec3(result);\ngl_FragColor.a=1.0;\n#else\nvec4 color;\n#ifdef BILATERAL_BLUR_H\nvec2 direction=vec2(1.0,0.0);\ncolor=blur13Bilateral(textureSampler,vUV,outSize,direction);\n#else\nvec2 direction=vec2(0.0,1.0);\ncolor=blur13Bilateral(textureSampler,vUV,outSize,direction);\n#endif\ngl_FragColor.rgb=vec3(color.r);\ngl_FragColor.a=1.0;\n#endif\n}\n#endif\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var ssao2PixelShader = { name: name, shader: shader };
//# sourceMappingURL=ssao2.fragment.js.map