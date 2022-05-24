// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "depthOfFieldPixelShader";
var shader = "uniform sampler2D textureSampler;\nuniform sampler2D highlightsSampler;\nuniform sampler2D depthSampler;\nuniform sampler2D grainSampler;\nuniform float grain_amount;\nuniform bool blur_noise;\nuniform float screen_width;\nuniform float screen_height;\nuniform float distortion;\nuniform bool dof_enabled;\nuniform float screen_distance; \nuniform float aperture;\nuniform float darken;\nuniform float edge_blur;\nuniform bool highlights;\nuniform float near;\nuniform float far;\nvarying vec2 vUV;\n#define PI 3.14159265\n#define TWOPI 6.28318530\n#define inverse_focal_length 0.1 \nvec2 centered_screen_pos;\nvec2 distorted_coords;\nfloat radius2;\nfloat radius;\nvec2 rand(vec2 co)\n{\nfloat noise1=(fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453));\nfloat noise2=(fract(sin(dot(co,vec2(12.9898,78.233)*2.0))*43758.5453));\nreturn clamp(vec2(noise1,noise2),0.0,1.0);\n}\nvec2 getDistortedCoords(vec2 coords) {\nif (distortion==0.0) { return coords; }\nvec2 direction=1.0*normalize(centered_screen_pos);\nvec2 dist_coords=vec2(0.5,0.5);\ndist_coords.x=0.5+direction.x*radius2*1.0;\ndist_coords.y=0.5+direction.y*radius2*1.0;\nfloat dist_amount=clamp(distortion*0.23,0.0,1.0);\ndist_coords=mix(coords,dist_coords,dist_amount);\nreturn dist_coords;\n}\nfloat sampleScreen(inout vec4 color,in vec2 offset,in float weight) {\nvec2 coords=distorted_coords;\nfloat angle=rand(coords*100.0).x*TWOPI;\ncoords+=vec2(offset.x*cos(angle)-offset.y*sin(angle),offset.x*sin(angle)+offset.y*cos(angle));\ncolor+=texture2D(textureSampler,coords)*weight;\nreturn weight;\n}\nfloat getBlurLevel(float size) {\nreturn min(3.0,ceil(size/1.0));\n}\nvec4 getBlurColor(float size) {\nvec4 col=texture2D(textureSampler,distorted_coords);\nfloat blur_level=getBlurLevel(size);\nfloat w=(size/screen_width);\nfloat h=(size/screen_height);\nfloat total_weight=1.0;\nvec2 sample_coords;\ntotal_weight+=sampleScreen(col,vec2(-0.50*w,0.24*h),0.93);\ntotal_weight+=sampleScreen(col,vec2(0.30*w,-0.75*h),0.90);\ntotal_weight+=sampleScreen(col,vec2(0.36*w,0.96*h),0.87);\ntotal_weight+=sampleScreen(col,vec2(-1.08*w,-0.55*h),0.85);\ntotal_weight+=sampleScreen(col,vec2(1.33*w,-0.37*h),0.83);\ntotal_weight+=sampleScreen(col,vec2(-0.82*w,1.31*h),0.80);\ntotal_weight+=sampleScreen(col,vec2(-0.31*w,-1.67*h),0.78);\ntotal_weight+=sampleScreen(col,vec2(1.47*w,1.11*h),0.76);\ntotal_weight+=sampleScreen(col,vec2(-1.97*w,0.19*h),0.74);\ntotal_weight+=sampleScreen(col,vec2(1.42*w,-1.57*h),0.72);\nif (blur_level>1.0) {\ntotal_weight+=sampleScreen(col,vec2(0.01*w,2.25*h),0.70);\ntotal_weight+=sampleScreen(col,vec2(-1.62*w,-1.74*h),0.67);\ntotal_weight+=sampleScreen(col,vec2(2.49*w,0.20*h),0.65);\ntotal_weight+=sampleScreen(col,vec2(-2.07*w,1.61*h),0.63);\ntotal_weight+=sampleScreen(col,vec2(0.46*w,-2.70*h),0.61);\ntotal_weight+=sampleScreen(col,vec2(1.55*w,2.40*h),0.59);\ntotal_weight+=sampleScreen(col,vec2(-2.88*w,-0.75*h),0.56);\ntotal_weight+=sampleScreen(col,vec2(2.73*w,-1.44*h),0.54);\ntotal_weight+=sampleScreen(col,vec2(-1.08*w,3.02*h),0.52);\ntotal_weight+=sampleScreen(col,vec2(-1.28*w,-3.05*h),0.49);\n}\nif (blur_level>2.0) {\ntotal_weight+=sampleScreen(col,vec2(3.11*w,1.43*h),0.46);\ntotal_weight+=sampleScreen(col,vec2(-3.36*w,1.08*h),0.44);\ntotal_weight+=sampleScreen(col,vec2(1.80*w,-3.16*h),0.41);\ntotal_weight+=sampleScreen(col,vec2(0.83*w,3.65*h),0.38);\ntotal_weight+=sampleScreen(col,vec2(-3.16*w,-2.19*h),0.34);\ntotal_weight+=sampleScreen(col,vec2(3.92*w,-0.53*h),0.31);\ntotal_weight+=sampleScreen(col,vec2(-2.59*w,3.12*h),0.26);\ntotal_weight+=sampleScreen(col,vec2(-0.20*w,-4.15*h),0.22);\ntotal_weight+=sampleScreen(col,vec2(3.02*w,3.00*h),0.15);\n}\ncol/=total_weight; \nif (darken>0.0) {\ncol.rgb*=clamp(0.3,1.0,1.05-size*0.5*darken);\n}\nreturn col;\n}\n#define CUSTOM_FRAGMENT_DEFINITIONS\nvoid main(void)\n{\ncentered_screen_pos=vec2(vUV.x-0.5,vUV.y-0.5);\nradius2=centered_screen_pos.x*centered_screen_pos.x+centered_screen_pos.y*centered_screen_pos.y;\nradius=sqrt(radius2);\ndistorted_coords=getDistortedCoords(vUV); \nvec2 texels_coords=vec2(vUV.x*screen_width,vUV.y*screen_height); \nfloat depth=texture2D(depthSampler,distorted_coords).r; \nfloat distance=near+(far-near)*depth; \nvec4 color=texture2D(textureSampler,vUV); \nfloat coc=abs(aperture*(screen_distance*(inverse_focal_length-1.0/distance)-1.0));\nif (dof_enabled==false || coc<0.07) { coc=0.0; }\nfloat edge_blur_amount=0.0;\nif (edge_blur>0.0) {\nedge_blur_amount=clamp((radius*2.0-1.0+0.15*edge_blur)*1.5,0.0,1.0)*1.3;\n}\nfloat blur_amount=max(edge_blur_amount,coc);\nif (blur_amount==0.0) {\ngl_FragColor=texture2D(textureSampler,distorted_coords);\n}\nelse {\ngl_FragColor=getBlurColor(blur_amount*1.7);\nif (highlights) {\ngl_FragColor.rgb+=clamp(coc,0.0,1.0)*texture2D(highlightsSampler,distorted_coords).rgb;\n}\nif (blur_noise) {\nvec2 noise=rand(distorted_coords)*0.01*blur_amount;\nvec2 blurred_coord=vec2(distorted_coords.x+noise.x,distorted_coords.y+noise.y);\ngl_FragColor=0.04*texture2D(textureSampler,blurred_coord)+0.96*gl_FragColor;\n}\n}\nif (grain_amount>0.0) {\nvec4 grain_color=texture2D(grainSampler,texels_coords*0.003);\ngl_FragColor.rgb+=(-0.5+grain_color.rgb)*0.30*grain_amount;\n}\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var depthOfFieldPixelShader = { name: name, shader: shader };
//# sourceMappingURL=depthOfField.fragment.js.map