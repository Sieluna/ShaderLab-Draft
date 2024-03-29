import { InternalTexture, InternalTextureSource } from "../../Materials/Textures/internalTexture.js";
import { Logger } from "../../Misc/logger.js";

import { ThinEngine } from "../thinEngine.js";
ThinEngine.prototype.restoreSingleAttachment = function () {
    var gl = this._gl;
    this.bindAttachments([gl.BACK]);
};
ThinEngine.prototype.restoreSingleAttachmentForRenderTarget = function () {
    var gl = this._gl;
    this.bindAttachments([gl.COLOR_ATTACHMENT0]);
};
ThinEngine.prototype.buildTextureLayout = function (textureStatus) {
    var gl = this._gl;
    var result = [];
    for (var i = 0; i < textureStatus.length; i++) {
        if (textureStatus[i]) {
            result.push(gl["COLOR_ATTACHMENT" + i]);
        }
        else {
            result.push(gl.NONE);
        }
    }
    return result;
};
ThinEngine.prototype.bindAttachments = function (attachments) {
    var gl = this._gl;
    gl.drawBuffers(attachments);
};
ThinEngine.prototype.unBindMultiColorAttachmentFramebuffer = function (rtWrapper, disableGenerateMipMaps, onBeforeUnbind) {
    if (disableGenerateMipMaps === void 0) { disableGenerateMipMaps = false; }
    this._currentRenderTarget = null;
    // If MSAA, we need to bitblt back to main texture
    var gl = this._gl;
    var attachments = rtWrapper._attachments;
    var count = attachments.length;
    if (rtWrapper._MSAAFramebuffer) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rtWrapper._MSAAFramebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, rtWrapper._framebuffer);
        for (var i = 0; i < count; i++) {
            var texture = rtWrapper.textures[i];
            for (var j = 0; j < count; j++) {
                attachments[j] = gl.NONE;
            }
            attachments[i] = gl[this.webGLVersion > 1 ? "COLOR_ATTACHMENT" + i : "COLOR_ATTACHMENT" + i + "_WEBGL"];
            gl.readBuffer(attachments[i]);
            gl.drawBuffers(attachments);
            gl.blitFramebuffer(0, 0, texture.width, texture.height, 0, 0, texture.width, texture.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        }
        for (var i = 0; i < count; i++) {
            attachments[i] = gl[this.webGLVersion > 1 ? "COLOR_ATTACHMENT" + i : "COLOR_ATTACHMENT" + i + "_WEBGL"];
        }
        gl.drawBuffers(attachments);
    }
    for (var i = 0; i < count; i++) {
        var texture = rtWrapper.textures[i];
        if (texture.generateMipMaps && !disableGenerateMipMaps && !texture.isCube) {
            this._bindTextureDirectly(gl.TEXTURE_2D, texture, true);
            gl.generateMipmap(gl.TEXTURE_2D);
            this._bindTextureDirectly(gl.TEXTURE_2D, null);
        }
    }
    if (onBeforeUnbind) {
        if (rtWrapper._MSAAFramebuffer) {
            // Bind the correct framebuffer
            this._bindUnboundFramebuffer(rtWrapper._framebuffer);
        }
        onBeforeUnbind();
    }
    this._bindUnboundFramebuffer(null);
};
ThinEngine.prototype.createMultipleRenderTarget = function (size, options, initializeBuffers) {
    if (initializeBuffers === void 0) { initializeBuffers = true; }
    var generateMipMaps = false;
    var generateDepthBuffer = true;
    var generateStencilBuffer = false;
    var generateDepthTexture = false;
    var depthTextureFormat = 15;
    var textureCount = 1;
    var defaultType = 0;
    var defaultSamplingMode = 3;
    var defaultUseSRGBBuffer = false;
    var types = new Array();
    var samplingModes = new Array();
    var useSRGBBuffers = new Array();
    var rtWrapper = this._createHardwareRenderTargetWrapper(true, false, size);
    if (options !== undefined) {
        generateMipMaps = options.generateMipMaps === undefined ? false : options.generateMipMaps;
        generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
        generateStencilBuffer = options.generateStencilBuffer === undefined ? false : options.generateStencilBuffer;
        generateDepthTexture = options.generateDepthTexture === undefined ? false : options.generateDepthTexture;
        textureCount = options.textureCount || 1;
        if (options.types) {
            types = options.types;
        }
        if (options.samplingModes) {
            samplingModes = options.samplingModes;
        }
        if (options.useSRGBBuffers) {
            useSRGBBuffers = options.useSRGBBuffers;
        }
        if (this.webGLVersion > 1 &&
            (options.depthTextureFormat === 13 ||
                options.depthTextureFormat === 16 ||
                options.depthTextureFormat === 14)) {
            depthTextureFormat = options.depthTextureFormat;
        }
    }
    var gl = this._gl;
    // Create the framebuffer
    var framebuffer = gl.createFramebuffer();
    this._bindUnboundFramebuffer(framebuffer);
    var width = size.width || size;
    var height = size.height || size;
    var textures = [];
    var attachments = [];
    var useStencilTexture = this.webGLVersion > 1 && generateDepthTexture && options.depthTextureFormat === 13;
    var depthStencilBuffer = this._setupFramebufferDepthAttachments(!useStencilTexture && generateStencilBuffer, !generateDepthTexture && generateDepthBuffer, width, height);
    rtWrapper._framebuffer = framebuffer;
    rtWrapper._depthStencilBuffer = depthStencilBuffer;
    rtWrapper._generateDepthBuffer = !generateDepthTexture && generateDepthBuffer;
    rtWrapper._generateStencilBuffer = !useStencilTexture && generateStencilBuffer;
    rtWrapper._attachments = attachments;
    for (var i = 0; i < textureCount; i++) {
        var samplingMode = samplingModes[i] || defaultSamplingMode;
        var type = types[i] || defaultType;
        var useSRGBBuffer = useSRGBBuffers[i] || defaultUseSRGBBuffer;
        if (type === 1 && !this._caps.textureFloatLinearFiltering) {
            // if floating point linear (gl.FLOAT) then force to NEAREST_SAMPLINGMODE
            samplingMode = 1;
        }
        else if (type === 2 && !this._caps.textureHalfFloatLinearFiltering) {
            // if floating point linear (HALF_FLOAT) then force to NEAREST_SAMPLINGMODE
            samplingMode = 1;
        }
        var filters = this._getSamplingParameters(samplingMode, generateMipMaps);
        if (type === 1 && !this._caps.textureFloat) {
            type = 0;
            Logger.Warn("Float textures are not supported. Render target forced to TEXTURETYPE_UNSIGNED_BYTE type");
        }
        useSRGBBuffer = useSRGBBuffer && this._caps.supportSRGBBuffers && (this.webGLVersion > 1 || this.isWebGPU);
        var texture = new InternalTexture(this, InternalTextureSource.MultiRenderTarget);
        var attachment = gl[this.webGLVersion > 1 ? "COLOR_ATTACHMENT" + i : "COLOR_ATTACHMENT" + i + "_WEBGL"];
        textures.push(texture);
        attachments.push(attachment);
        gl.activeTexture(gl["TEXTURE" + i]);
        gl.bindTexture(gl.TEXTURE_2D, texture._hardwareTexture.underlyingResource);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters.mag);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters.min);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        var internalSizedFormat = this._getRGBABufferInternalSizedFormat(type, 5, useSRGBBuffer);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalSizedFormat, width, height, 0, gl.RGBA, this._getWebGLTextureType(type), null);
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture._hardwareTexture.underlyingResource, 0);
        if (generateMipMaps) {
            this._gl.generateMipmap(this._gl.TEXTURE_2D);
        }
        // Unbind
        this._bindTextureDirectly(gl.TEXTURE_2D, null);
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.isReady = true;
        texture.samples = 1;
        texture.generateMipMaps = generateMipMaps;
        texture.samplingMode = samplingMode;
        texture.type = type;
        texture._useSRGBBuffer = useSRGBBuffer;
        this._internalTexturesCache.push(texture);
    }
    if (generateDepthTexture && this._caps.depthTextureExtension) {
        // Depth texture
        var depthTexture = new InternalTexture(this, InternalTextureSource.Depth);
        var depthTextureType = 5;
        var glDepthTextureInternalFormat = gl.DEPTH_COMPONENT16;
        var glDepthTextureFormat = gl.DEPTH_COMPONENT;
        var glDepthTextureType = gl.UNSIGNED_SHORT;
        var glDepthTextureAttachment = gl.DEPTH_ATTACHMENT;
        if (this.webGLVersion < 2) {
            glDepthTextureInternalFormat = gl.DEPTH_COMPONENT;
        }
        else {
            if (depthTextureFormat === 14) {
                depthTextureType = 1;
                glDepthTextureType = gl.FLOAT;
                glDepthTextureInternalFormat = gl.DEPTH_COMPONENT32F;
            }
            else if (depthTextureFormat === 16) {
                depthTextureType = 0;
                glDepthTextureType = gl.UNSIGNED_INT;
                glDepthTextureInternalFormat = gl.DEPTH_COMPONENT24;
                glDepthTextureAttachment = gl.DEPTH_ATTACHMENT;
            }
            else if (depthTextureFormat === 13) {
                depthTextureType = 12;
                glDepthTextureType = gl.UNSIGNED_INT_24_8;
                glDepthTextureInternalFormat = gl.DEPTH24_STENCIL8;
                glDepthTextureFormat = gl.DEPTH_STENCIL;
                glDepthTextureAttachment = gl.DEPTH_STENCIL_ATTACHMENT;
            }
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, depthTexture._hardwareTexture.underlyingResource);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, glDepthTextureInternalFormat, width, height, 0, glDepthTextureFormat, glDepthTextureType, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, glDepthTextureAttachment, gl.TEXTURE_2D, depthTexture._hardwareTexture.underlyingResource, 0);
        depthTexture.baseWidth = width;
        depthTexture.baseHeight = height;
        depthTexture.width = width;
        depthTexture.height = height;
        depthTexture.isReady = true;
        depthTexture.samples = 1;
        depthTexture.generateMipMaps = generateMipMaps;
        depthTexture.samplingMode = 1;
        depthTexture.format = depthTextureFormat;
        depthTexture.type = depthTextureType;
        textures.push(depthTexture);
        this._internalTexturesCache.push(depthTexture);
    }
    rtWrapper.setTextures(textures);
    if (initializeBuffers) {
        gl.drawBuffers(attachments);
    }
    this._bindUnboundFramebuffer(null);
    this.resetTextureCache();
    return rtWrapper;
};
ThinEngine.prototype.updateMultipleRenderTargetTextureSampleCount = function (rtWrapper, samples, initializeBuffers) {
    if (initializeBuffers === void 0) { initializeBuffers = true; }
    if (this.webGLVersion < 2 || !rtWrapper || !rtWrapper.texture) {
        return 1;
    }
    if (rtWrapper.samples === samples) {
        return samples;
    }
    var count = rtWrapper._attachments.length;
    if (count === 0) {
        return 1;
    }
    var gl = this._gl;
    samples = Math.min(samples, this.getCaps().maxMSAASamples);
    // Dispose previous render buffers
    if (rtWrapper._depthStencilBuffer) {
        gl.deleteRenderbuffer(rtWrapper._depthStencilBuffer);
        rtWrapper._depthStencilBuffer = null;
    }
    if (rtWrapper._MSAAFramebuffer) {
        gl.deleteFramebuffer(rtWrapper._MSAAFramebuffer);
        rtWrapper._MSAAFramebuffer = null;
    }
    for (var i = 0; i < count; i++) {
        var hardwareTexture = rtWrapper.textures[i]._hardwareTexture;
        if (hardwareTexture === null || hardwareTexture === void 0 ? void 0 : hardwareTexture._MSAARenderBuffer) {
            gl.deleteRenderbuffer(hardwareTexture._MSAARenderBuffer);
            hardwareTexture._MSAARenderBuffer = null;
        }
    }
    if (samples > 1 && gl.renderbufferStorageMultisample) {
        var framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            throw new Error("Unable to create multi sampled framebuffer");
        }
        rtWrapper._MSAAFramebuffer = framebuffer;
        this._bindUnboundFramebuffer(framebuffer);
        var attachments = [];
        for (var i = 0; i < count; i++) {
            var texture = rtWrapper.textures[i];
            var hardwareTexture = texture._hardwareTexture;
            var attachment = gl[this.webGLVersion > 1 ? "COLOR_ATTACHMENT" + i : "COLOR_ATTACHMENT" + i + "_WEBGL"];
            var colorRenderbuffer = this._createRenderBuffer(texture.width, texture.height, samples, -1 /* not used */, this._getRGBAMultiSampleBufferFormat(texture.type), attachment);
            if (!colorRenderbuffer) {
                throw new Error("Unable to create multi sampled framebuffer");
            }
            hardwareTexture._MSAARenderBuffer = colorRenderbuffer;
            texture.samples = samples;
            attachments.push(attachment);
        }
        if (initializeBuffers) {
            gl.drawBuffers(attachments);
        }
    }
    else {
        this._bindUnboundFramebuffer(rtWrapper._framebuffer);
    }
    rtWrapper._depthStencilBuffer = this._setupFramebufferDepthAttachments(rtWrapper._generateStencilBuffer, rtWrapper._generateDepthBuffer, rtWrapper.texture.width, rtWrapper.texture.height, samples);
    this._bindUnboundFramebuffer(null);
    return samples;
};
//# sourceMappingURL=engine.multiRender.js.map