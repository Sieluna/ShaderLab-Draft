import { InternalTexture, InternalTextureSource } from "../../../Materials/Textures/internalTexture.js";
import { Logger } from "../../../Misc/logger.js";

import { WebGPUEngine } from "../../webgpuEngine.js";
WebGPUEngine.prototype.unBindMultiColorAttachmentFramebuffer = function (rtWrapper, disableGenerateMipMaps, onBeforeUnbind) {
    if (disableGenerateMipMaps === void 0) { disableGenerateMipMaps = false; }
    if (onBeforeUnbind) {
        onBeforeUnbind();
    }
    var attachments = rtWrapper._attachments;
    var count = attachments.length;
    if (this._currentRenderPass && this._currentRenderPass !== this._mainRenderPassWrapper.renderPass) {
        this._endRenderTargetRenderPass();
    }
    for (var i = 0; i < count; i++) {
        var texture = rtWrapper.textures[i];
        if (texture.generateMipMaps && !disableGenerateMipMaps && !texture.isCube) {
            this._generateMipmaps(texture);
        }
    }
    this._currentRenderTarget = null;
    this._mrtAttachments = [];
    this._cacheRenderPipeline.setMRT([]);
    this._cacheRenderPipeline.setMRTAttachments(this._mrtAttachments);
    this._currentRenderPass = this._mainRenderPassWrapper.renderPass;
    this._setDepthTextureFormat(this._mainRenderPassWrapper);
    this._setColorFormat(this._mainRenderPassWrapper);
};
WebGPUEngine.prototype.createMultipleRenderTarget = function (size, options, initializeBuffers) {
    var _a;
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
        depthTextureFormat = (_a = options.depthTextureFormat) !== null && _a !== void 0 ? _a : 15;
        if (options.types) {
            types = options.types;
        }
        if (options.samplingModes) {
            samplingModes = options.samplingModes;
        }
        if (options.useSRGBBuffers) {
            useSRGBBuffers = options.useSRGBBuffers;
        }
    }
    var width = size.width || size;
    var height = size.height || size;
    var depthStencilTexture = null;
    if (generateDepthBuffer || generateStencilBuffer || generateDepthTexture) {
        depthStencilTexture = rtWrapper.createDepthStencilTexture(0, false, generateStencilBuffer, 1, depthTextureFormat);
    }
    var textures = [];
    var attachments = [];
    var defaultAttachments = [];
    rtWrapper._generateDepthBuffer = generateDepthBuffer;
    rtWrapper._generateStencilBuffer = generateStencilBuffer;
    rtWrapper._attachments = attachments;
    rtWrapper._defaultAttachments = defaultAttachments;
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
        if (type === 1 && !this._caps.textureFloat) {
            type = 0;
            Logger.Warn("Float textures are not supported. Render target forced to TEXTURETYPE_UNSIGNED_BYTE type");
        }
        var texture = new InternalTexture(this, InternalTextureSource.MultiRenderTarget);
        textures.push(texture);
        attachments.push(i + 1);
        defaultAttachments.push(initializeBuffers ? i + 1 : i === 0 ? 1 : 0);
        texture.baseWidth = width;
        texture.baseHeight = height;
        texture.width = width;
        texture.height = height;
        texture.isReady = true;
        texture.samples = 1;
        texture.generateMipMaps = generateMipMaps;
        texture.samplingMode = samplingMode;
        texture.type = type;
        texture._cachedWrapU = 0;
        texture._cachedWrapV = 0;
        texture._useSRGBBuffer = useSRGBBuffer;
        this._internalTexturesCache.push(texture);
        this._textureHelper.createGPUTextureForInternalTexture(texture);
    }
    if (depthStencilTexture) {
        depthStencilTexture.incrementReferences();
        textures.push(depthStencilTexture);
        this._internalTexturesCache.push(depthStencilTexture);
    }
    rtWrapper.setTextures(textures);
    return rtWrapper;
};
WebGPUEngine.prototype.updateMultipleRenderTargetTextureSampleCount = function (rtWrapper, samples) {
    if (!rtWrapper || !rtWrapper.textures || rtWrapper.textures[0].samples === samples) {
        return samples;
    }
    var count = rtWrapper.textures.length;
    if (count === 0) {
        return 1;
    }
    samples = Math.min(samples, this.getCaps().maxMSAASamples);
    for (var i = 0; i < count; ++i) {
        var texture = rtWrapper.textures[i];
        this._textureHelper.createMSAATexture(texture, samples);
        texture.samples = samples;
    }
    // Note that the last texture of textures is the depth texture if the depth texture has been generated by the MRT class and so the MSAA texture
    // will be recreated for this texture by the loop above: in that case, there's no need to create the MSAA texture for rtWrapper._depthStencilTexture
    // because rtWrapper._depthStencilTexture is the same texture than the depth texture
    if (rtWrapper._depthStencilTexture && rtWrapper._depthStencilTexture !== rtWrapper.textures[rtWrapper.textures.length - 1]) {
        this._textureHelper.createMSAATexture(rtWrapper._depthStencilTexture, samples);
        rtWrapper._depthStencilTexture.samples = samples;
    }
    return samples;
};
WebGPUEngine.prototype.bindAttachments = function (attachments) {
    if (attachments.length === 0 || !this._currentRenderTarget) {
        return;
    }
    this._mrtAttachments = attachments;
    if (this._currentRenderPass) {
        // the render pass has already been created, we need to call setMRTAttachments to update the state of the attachments
        this._cacheRenderPipeline.setMRTAttachments(attachments);
    }
    else {
        // the render pass is not created yet so we don't need to call setMRTAttachments: it will be called as part of the render pass creation (see WebGPUEngine._startRenderTargetRenderPass)
    }
};
WebGPUEngine.prototype.buildTextureLayout = function (textureStatus) {
    var result = [];
    for (var i = 0; i < textureStatus.length; i++) {
        if (textureStatus[i]) {
            result.push(i + 1);
        }
        else {
            result.push(0);
        }
    }
    return result;
};
WebGPUEngine.prototype.restoreSingleAttachment = function () {
    // not sure what to do, probably nothing... This function and restoreSingleAttachmentForRenderTarget are not called in Babylon.js so it's hard to know the use case
};
WebGPUEngine.prototype.restoreSingleAttachmentForRenderTarget = function () {
    // not sure what to do, probably nothing... This function and restoreSingleAttachment are not called in Babylon.js so it's hard to know the use case
};
//# sourceMappingURL=engine.multiRender.js.map