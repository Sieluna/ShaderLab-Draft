import { __awaiter, __generator } from "tslib";
/**
 * Transform some pixel data to a base64 string
 * @param pixels defines the pixel data to transform to base64
 * @param size defines the width and height of the (texture) data
 * @param invertY true if the data must be inverted for the Y coordinate during the conversion
 * @returns The base64 encoded string or null
 */
export function GenerateBase64StringFromPixelData(pixels, size, invertY) {
    if (invertY === void 0) { invertY = false; }
    var width = size.width;
    var height = size.height;
    if (pixels instanceof Float32Array) {
        var len = pixels.byteLength / pixels.BYTES_PER_ELEMENT;
        var npixels = new Uint8Array(len);
        while (--len >= 0) {
            var val = pixels[len];
            if (val < 0) {
                val = 0;
            }
            else if (val > 1) {
                val = 1;
            }
            npixels[len] = val * 255;
        }
        pixels = npixels;
    }
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
        return null;
    }
    var imageData = ctx.createImageData(width, height);
    var castData = imageData.data;
    castData.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    if (invertY) {
        var canvas2 = document.createElement("canvas");
        canvas2.width = width;
        canvas2.height = height;
        var ctx2 = canvas2.getContext("2d");
        if (!ctx2) {
            return null;
        }
        ctx2.translate(0, height);
        ctx2.scale(1, -1);
        ctx2.drawImage(canvas, 0, 0);
        return canvas2.toDataURL("image/png");
    }
    return canvas.toDataURL("image/png");
}
/**
 * Reads the pixels stored in the webgl texture and returns them as a base64 string
 * @param texture defines the texture to read pixels from
 * @param faceIndex defines the face of the texture to read (in case of cube texture)
 * @param level defines the LOD level of the texture to read (in case of Mip Maps)
 * @returns The base64 encoded string or null
 */
export function GenerateBase64StringFromTexture(texture, faceIndex, level) {
    if (faceIndex === void 0) { faceIndex = 0; }
    if (level === void 0) { level = 0; }
    var internalTexture = texture.getInternalTexture();
    if (!internalTexture) {
        return null;
    }
    var pixels = texture._readPixelsSync(faceIndex, level);
    if (!pixels) {
        return null;
    }
    return GenerateBase64StringFromPixelData(pixels, texture.getSize(), internalTexture.invertY);
}
/**
 * Reads the pixels stored in the webgl texture and returns them as a base64 string
 * @param texture defines the texture to read pixels from
 * @param faceIndex defines the face of the texture to read (in case of cube texture)
 * @param level defines the LOD level of the texture to read (in case of Mip Maps)
 * @returns The base64 encoded string or null wrapped in a promise
 */
export function GenerateBase64StringFromTextureAsync(texture, faceIndex, level) {
    if (faceIndex === void 0) { faceIndex = 0; }
    if (level === void 0) { level = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var internalTexture, pixels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    internalTexture = texture.getInternalTexture();
                    if (!internalTexture) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, texture.readPixels(faceIndex, level)];
                case 1:
                    pixels = _a.sent();
                    if (!pixels) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, GenerateBase64StringFromPixelData(pixels, texture.getSize(), internalTexture.invertY)];
            }
        });
    });
}
/**
 * Class used to host copy specific utilities
 * (Back-compat)
 */
export var CopyTools = {
    /**
     * Transform some pixel data to a base64 string
     * @param pixels defines the pixel data to transform to base64
     * @param size defines the width and height of the (texture) data
     * @param invertY true if the data must be inverted for the Y coordinate during the conversion
     * @returns The base64 encoded string or null
     */
    GenerateBase64StringFromPixelData: GenerateBase64StringFromPixelData,
    /**
     * Reads the pixels stored in the webgl texture and returns them as a base64 string
     * @param texture defines the texture to read pixels from
     * @param faceIndex defines the face of the texture to read (in case of cube texture)
     * @param level defines the LOD level of the texture to read (in case of Mip Maps)
     * @returns The base64 encoded string or null
     */
    GenerateBase64StringFromTexture: GenerateBase64StringFromTexture,
    /**
     * Reads the pixels stored in the webgl texture and returns them as a base64 string
     * @param texture defines the texture to read pixels from
     * @param faceIndex defines the face of the texture to read (in case of cube texture)
     * @param level defines the LOD level of the texture to read (in case of Mip Maps)
     * @returns The base64 encoded string or null wrapped in a promise
     */
    GenerateBase64StringFromTextureAsync: GenerateBase64StringFromTextureAsync,
};
//# sourceMappingURL=copyTools.js.map