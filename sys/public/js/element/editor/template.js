export const base =
    'precision highp float;\n' +
    'attribute vec3 position;\n' +
    'attribute vec2 uv;\n' +
    'void main(void) {\n' +
    '  \n' +
    '}'

export const baseVs =
    'precision highp float;\n' +
    'attribute vec3 position;\n' +
    'attribute vec2 uv;\n' +
    'uniform mat4 worldViewProjection;\n' +
    'varying vec2 vUV;\n' +
    'void main(void) {\n' +
    '  gl_Position = worldViewProjection * vec4(position, 1.0);\n' +
    '  vUV = uv;\n' +
    '}'

export const baseFs =
    'precision highp float;\n' +
    'varying vec2 vUV;\n' +
    'uniform sampler2D textureSampler;\n' +
    'void main(void) {\n' +
    '  gl_FragColor = texture2D(textureSampler, vUV);\n' +
    '}'
