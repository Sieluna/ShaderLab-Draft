// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "screenSpaceCurvaturePixelShader";
var shader = "precision highp float;\nvarying vec2 vUV;\nuniform sampler2D textureSampler;\nuniform sampler2D normalSampler;\nuniform float curvature_ridge;\nuniform float curvature_valley;\n#ifndef CURVATURE_OFFSET\n#define CURVATURE_OFFSET 1\n#endif\nfloat curvature_soft_clamp(float curvature,float control)\n{\nif (curvature<0.5/control)\nreturn curvature*(1.0-curvature*control);\nreturn 0.25/control;\n}\nfloat calculate_curvature(ivec2 texel,float ridge,float valley)\n{\nvec2 normal_up =texelFetch(normalSampler,texel+ivec2(0, CURVATURE_OFFSET),0).rb;\nvec2 normal_down =texelFetch(normalSampler,texel+ivec2(0,-CURVATURE_OFFSET),0).rb;\nvec2 normal_left =texelFetch(normalSampler,texel+ivec2(-CURVATURE_OFFSET,0),0).rb;\nvec2 normal_right=texelFetch(normalSampler,texel+ivec2( CURVATURE_OFFSET,0),0).rb;\nfloat normal_diff=((normal_up.g-normal_down.g)+(normal_right.r-normal_left.r));\nif (normal_diff<0.0)\nreturn -2.0*curvature_soft_clamp(-normal_diff,valley);\nreturn 2.0*curvature_soft_clamp(normal_diff,ridge);\n}\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void) \n{\nivec2 texel=ivec2(gl_FragCoord.xy);\nvec4 baseColor=texture2D(textureSampler,vUV);\nfloat curvature=calculate_curvature(texel,curvature_ridge,curvature_valley);\nbaseColor.rgb*=curvature+1.0;\ngl_FragColor=baseColor;\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var screenSpaceCurvaturePixelShader = { name: name, shader: shader };
//# sourceMappingURL=screenSpaceCurvature.fragment.js.map