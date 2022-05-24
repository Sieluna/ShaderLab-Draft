// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "minmaxReduxPixelShader";
var shader = "varying vec2 vUV;\nuniform sampler2D textureSampler;\n#if defined(INITIAL)\nuniform sampler2D sourceTexture;\nuniform vec2 texSize;\nvoid main(void)\n{\nivec2 coord=ivec2(vUV*(texSize-1.0));\nfloat f1=texelFetch(sourceTexture,coord,0).r;\nfloat f2=texelFetch(sourceTexture,coord+ivec2(1,0),0).r;\nfloat f3=texelFetch(sourceTexture,coord+ivec2(1,1),0).r;\nfloat f4=texelFetch(sourceTexture,coord+ivec2(0,1),0).r;\nfloat minz=min(min(min(f1,f2),f3),f4);\n#ifdef DEPTH_REDUX\nfloat maxz=max(max(max(sign(1.0-f1)*f1,sign(1.0-f2)*f2),sign(1.0-f3)*f3),sign(1.0-f4)*f4);\n#else\nfloat maxz=max(max(max(f1,f2),f3),f4);\n#endif\nglFragColor=vec4(minz,maxz,0.,0.);\n}\n#elif defined(MAIN)\nuniform vec2 texSize;\nvoid main(void)\n{\nivec2 coord=ivec2(vUV*(texSize-1.0));\nvec2 f1=texelFetch(textureSampler,coord,0).rg;\nvec2 f2=texelFetch(textureSampler,coord+ivec2(1,0),0).rg;\nvec2 f3=texelFetch(textureSampler,coord+ivec2(1,1),0).rg;\nvec2 f4=texelFetch(textureSampler,coord+ivec2(0,1),0).rg;\nfloat minz=min(min(min(f1.x,f2.x),f3.x),f4.x);\nfloat maxz=max(max(max(f1.y,f2.y),f3.y),f4.y);\nglFragColor=vec4(minz,maxz,0.,0.);\n}\n#elif defined(ONEBEFORELAST)\nuniform ivec2 texSize;\nvoid main(void)\n{\nivec2 coord=ivec2(vUV*vec2(texSize-1));\nvec2 f1=texelFetch(textureSampler,coord % texSize,0).rg;\nvec2 f2=texelFetch(textureSampler,(coord+ivec2(1,0)) % texSize,0).rg;\nvec2 f3=texelFetch(textureSampler,(coord+ivec2(1,1)) % texSize,0).rg;\nvec2 f4=texelFetch(textureSampler,(coord+ivec2(0,1)) % texSize,0).rg;\nfloat minz=min(f1.x,f2.x);\nfloat maxz=max(f1.y,f2.y);\nglFragColor=vec4(minz,maxz,0.,0.);\n}\n#elif defined(LAST)\nvoid main(void)\n{\nglFragColor=vec4(0.);\nif (true) { \ndiscard;\n}\n}\n#endif\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var minmaxReduxPixelShader = { name: name, shader: shader };
//# sourceMappingURL=minmaxRedux.fragment.js.map