import { Observable } from "../Misc/observable.js";
import { Vector3, TmpVectors, Matrix } from "../Maths/math.vector.js";
import { Sprite } from "./sprite.js";
import { SpriteSceneComponent } from "./spriteSceneComponent.js";
import { PickingInfo } from "../Collisions/pickingInfo.js";
import { Texture } from "../Materials/Textures/texture.js";
import { SceneComponentConstants } from "../sceneComponent.js";
import { Logger } from "../Misc/logger.js";
import { Tools } from "../Misc/tools.js";
import { WebRequest } from "../Misc/webRequest.js";
import { SpriteRenderer } from "./spriteRenderer.js";
import { EngineStore } from "../Engines/engineStore.js";

/**
 * Class used to manage multiple sprites on the same spritesheet
 * @see https://doc.babylonjs.com/babylon101/sprites
 */
var SpriteManager = /** @class */ (function () {
    /**
     * Creates a new sprite manager
     * @param name defines the manager's name
     * @param imgUrl defines the sprite sheet url
     * @param capacity defines the maximum allowed number of sprites
     * @param cellSize defines the size of a sprite cell
     * @param scene defines the hosting scene
     * @param epsilon defines the epsilon value to align texture (0.01 by default)
     * @param samplingMode defines the sampling mode to use with spritesheet
     * @param fromPacked set to false; do not alter
     * @param spriteJSON null otherwise a JSON object defining sprite sheet data; do not alter
     */
    function SpriteManager(
    /** defines the manager's name */
    name, imgUrl, capacity, cellSize, scene, epsilon, samplingMode, fromPacked, spriteJSON) {
        if (epsilon === void 0) { epsilon = 0.01; }
        if (samplingMode === void 0) { samplingMode = Texture.TRILINEAR_SAMPLINGMODE; }
        if (fromPacked === void 0) { fromPacked = false; }
        if (spriteJSON === void 0) { spriteJSON = null; }
        var _this = this;
        this.name = name;
        /** Gets the list of sprites */
        this.sprites = new Array();
        /** Gets or sets the rendering group id (0 by default) */
        this.renderingGroupId = 0;
        /** Gets or sets camera layer mask */
        this.layerMask = 0x0fffffff;
        /** Gets or sets a boolean indicating if the sprites are pickable */
        this.isPickable = false;
        /**
         * An event triggered when the manager is disposed.
         */
        this.onDisposeObservable = new Observable();
        this._disableDepthWrite = false;
        /** True when packed cell data from JSON file is ready*/
        this._packedAndReady = false;
        this._customUpdate = function (sprite, baseSize) {
            if (!sprite.cellRef) {
                sprite.cellIndex = 0;
            }
            var num = sprite.cellIndex;
            if (typeof num === "number" && isFinite(num) && Math.floor(num) === num) {
                sprite.cellRef = _this._spriteMap[sprite.cellIndex];
            }
            sprite._xOffset = _this._cellData[sprite.cellRef].frame.x / baseSize.width;
            sprite._yOffset = _this._cellData[sprite.cellRef].frame.y / baseSize.height;
            sprite._xSize = _this._cellData[sprite.cellRef].frame.w;
            sprite._ySize = _this._cellData[sprite.cellRef].frame.h;
        };
        if (!scene) {
            scene = EngineStore.LastCreatedScene;
        }
        if (!scene._getComponent(SceneComponentConstants.NAME_SPRITE)) {
            scene._addComponent(new SpriteSceneComponent(scene));
        }
        this._fromPacked = fromPacked;
        this._scene = scene;
        var engine = this._scene.getEngine();
        this._spriteRenderer = new SpriteRenderer(engine, capacity, epsilon, scene);
        if (cellSize.width && cellSize.height) {
            this.cellWidth = cellSize.width;
            this.cellHeight = cellSize.height;
        }
        else if (cellSize !== undefined) {
            this.cellWidth = cellSize;
            this.cellHeight = cellSize;
        }
        else {
            this._spriteRenderer = null;
            return;
        }
        this._scene.spriteManagers.push(this);
        this.uniqueId = this.scene.getUniqueId();
        if (imgUrl) {
            this.texture = new Texture(imgUrl, scene, true, false, samplingMode);
        }
        if (this._fromPacked) {
            this._makePacked(imgUrl, spriteJSON);
        }
    }
    Object.defineProperty(SpriteManager.prototype, "onDispose", {
        /**
         * Callback called when the manager is disposed
         */
        set: function (callback) {
            if (this._onDisposeObserver) {
                this.onDisposeObservable.remove(this._onDisposeObserver);
            }
            this._onDisposeObserver = this.onDisposeObservable.add(callback);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "children", {
        /**
         * Gets the array of sprites
         */
        get: function () {
            return this.sprites;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "scene", {
        /**
         * Gets the hosting scene
         */
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "capacity", {
        /**
         * Gets the capacity of the manager
         */
        get: function () {
            return this._spriteRenderer.capacity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "texture", {
        /**
         * Gets or sets the spritesheet texture
         */
        get: function () {
            return this._spriteRenderer.texture;
        },
        set: function (value) {
            value.wrapU = Texture.CLAMP_ADDRESSMODE;
            value.wrapV = Texture.CLAMP_ADDRESSMODE;
            this._spriteRenderer.texture = value;
            this._textureContent = null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "cellWidth", {
        /** Defines the default width of a cell in the spritesheet */
        get: function () {
            return this._spriteRenderer.cellWidth;
        },
        set: function (value) {
            this._spriteRenderer.cellWidth = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "cellHeight", {
        /** Defines the default height of a cell in the spritesheet */
        get: function () {
            return this._spriteRenderer.cellHeight;
        },
        set: function (value) {
            this._spriteRenderer.cellHeight = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "fogEnabled", {
        /** Gets or sets a boolean indicating if the manager must consider scene fog when rendering */
        get: function () {
            return this._spriteRenderer.fogEnabled;
        },
        set: function (value) {
            this._spriteRenderer.fogEnabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "blendMode", {
        /**
         * Blend mode use to render the particle, it can be any of
         * the static undefined properties provided in this class.
         * Default value is 2
         */
        get: function () {
            return this._spriteRenderer.blendMode;
        },
        set: function (blendMode) {
            this._spriteRenderer.blendMode = blendMode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SpriteManager.prototype, "disableDepthWrite", {
        /** Disables writing to the depth buffer when rendering the sprites.
         *  It can be handy to disable depth writing when using textures without alpha channel
         *  and setting some specific blend modes.
         */
        get: function () {
            return this._disableDepthWrite;
        },
        set: function (value) {
            this._disableDepthWrite = value;
            this._spriteRenderer.disableDepthWrite = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the string "SpriteManager"
     * @returns "SpriteManager"
     */
    SpriteManager.prototype.getClassName = function () {
        return "SpriteManager";
    };
    SpriteManager.prototype._makePacked = function (imgUrl, spriteJSON) {
        var _this = this;
        if (spriteJSON !== null) {
            try {
                //Get the JSON and Check its structure.  If its an array parse it if its a JSON string etc...
                var celldata = void 0;
                if (typeof spriteJSON === "string") {
                    celldata = JSON.parse(spriteJSON);
                }
                else {
                    celldata = spriteJSON;
                }
                if (celldata.frames.length) {
                    var frametemp = {};
                    for (var i = 0; i < celldata.frames.length; i++) {
                        var _f = celldata.frames[i];
                        if (typeof Object.keys(_f)[0] !== "string") {
                            throw new Error("Invalid JSON Format.  Check the frame values and make sure the name is the first parameter.");
                        }
                        var name_1 = _f[Object.keys(_f)[0]];
                        frametemp[name_1] = _f;
                    }
                    celldata.frames = frametemp;
                }
                var spritemap = Reflect.ownKeys(celldata.frames);
                this._spriteMap = spritemap;
                this._packedAndReady = true;
                this._cellData = celldata.frames;
            }
            catch (e) {
                this._fromPacked = false;
                this._packedAndReady = false;
                throw new Error("Invalid JSON from string. Spritesheet managed with constant cell size.");
            }
        }
        else {
            var re = /\./g;
            var li = void 0;
            do {
                li = re.lastIndex;
                re.test(imgUrl);
            } while (re.lastIndex > 0);
            var jsonUrl = imgUrl.substring(0, li - 1) + ".json";
            var onerror_1 = function () {
                Logger.Error("JSON ERROR: Unable to load JSON file.");
                _this._fromPacked = false;
                _this._packedAndReady = false;
            };
            var onload_1 = function (data) {
                try {
                    var celldata = JSON.parse(data);
                    var spritemap = Reflect.ownKeys(celldata.frames);
                    _this._spriteMap = spritemap;
                    _this._packedAndReady = true;
                    _this._cellData = celldata.frames;
                }
                catch (e) {
                    _this._fromPacked = false;
                    _this._packedAndReady = false;
                    throw new Error("Invalid JSON format. Please check documentation for format specifications.");
                }
            };
            Tools.LoadFile(jsonUrl, onload_1, undefined, undefined, false, onerror_1);
        }
    };
    SpriteManager.prototype._checkTextureAlpha = function (sprite, ray, distance, min, max) {
        if (!sprite.useAlphaForPicking || !this.texture) {
            return true;
        }
        var textureSize = this.texture.getSize();
        if (!this._textureContent) {
            this._textureContent = new Uint8Array(textureSize.width * textureSize.height * 4);
            this.texture.readPixels(0, 0, this._textureContent);
        }
        var contactPoint = TmpVectors.Vector3[0];
        contactPoint.copyFrom(ray.direction);
        contactPoint.normalize();
        contactPoint.scaleInPlace(distance);
        contactPoint.addInPlace(ray.origin);
        var contactPointU = (contactPoint.x - min.x) / (max.x - min.x) - 0.5;
        var contactPointV = 1.0 - (contactPoint.y - min.y) / (max.y - min.y) - 0.5;
        // Rotate
        var angle = sprite.angle;
        var rotatedU = 0.5 + (contactPointU * Math.cos(angle) - contactPointV * Math.sin(angle));
        var rotatedV = 0.5 + (contactPointU * Math.sin(angle) + contactPointV * Math.cos(angle));
        var u = (sprite._xOffset * textureSize.width + rotatedU * sprite._xSize) | 0;
        var v = (sprite._yOffset * textureSize.height + rotatedV * sprite._ySize) | 0;
        var alpha = this._textureContent[(u + v * textureSize.width) * 4 + 3];
        return alpha > 0.5;
    };
    /**
     * Intersects the sprites with a ray
     * @param ray defines the ray to intersect with
     * @param camera defines the current active camera
     * @param predicate defines a predicate used to select candidate sprites
     * @param fastCheck defines if a fast check only must be done (the first potential sprite is will be used and not the closer)
     * @returns null if no hit or a PickingInfo
     */
    SpriteManager.prototype.intersects = function (ray, camera, predicate, fastCheck) {
        var count = Math.min(this.capacity, this.sprites.length);
        var min = Vector3.Zero();
        var max = Vector3.Zero();
        var distance = Number.MAX_VALUE;
        var currentSprite = null;
        var pickedPoint = TmpVectors.Vector3[0];
        var cameraSpacePosition = TmpVectors.Vector3[1];
        var cameraView = camera.getViewMatrix();
        var activeRay = ray;
        var pickedRay = ray;
        for (var index = 0; index < count; index++) {
            var sprite = this.sprites[index];
            if (!sprite) {
                continue;
            }
            if (predicate) {
                if (!predicate(sprite)) {
                    continue;
                }
            }
            else if (!sprite.isPickable) {
                continue;
            }
            Vector3.TransformCoordinatesToRef(sprite.position, cameraView, cameraSpacePosition);
            if (sprite.angle) {
                // Create a rotation matrix to rotate the ray to the sprite's rotation
                Matrix.TranslationToRef(-cameraSpacePosition.x, -cameraSpacePosition.y, 0, TmpVectors.Matrix[1]);
                Matrix.TranslationToRef(cameraSpacePosition.x, cameraSpacePosition.y, 0, TmpVectors.Matrix[2]);
                Matrix.RotationZToRef(sprite.angle, TmpVectors.Matrix[3]);
                // inv translation x rotation x translation
                TmpVectors.Matrix[1].multiplyToRef(TmpVectors.Matrix[3], TmpVectors.Matrix[4]);
                TmpVectors.Matrix[4].multiplyToRef(TmpVectors.Matrix[2], TmpVectors.Matrix[0]);
                activeRay = ray.clone();
                Vector3.TransformCoordinatesToRef(ray.origin, TmpVectors.Matrix[0], activeRay.origin);
                Vector3.TransformNormalToRef(ray.direction, TmpVectors.Matrix[0], activeRay.direction);
            }
            else {
                activeRay = ray;
            }
            min.copyFromFloats(cameraSpacePosition.x - sprite.width / 2, cameraSpacePosition.y - sprite.height / 2, cameraSpacePosition.z);
            max.copyFromFloats(cameraSpacePosition.x + sprite.width / 2, cameraSpacePosition.y + sprite.height / 2, cameraSpacePosition.z);
            if (activeRay.intersectsBoxMinMax(min, max)) {
                var currentDistance = Vector3.Distance(cameraSpacePosition, activeRay.origin);
                if (distance > currentDistance) {
                    if (!this._checkTextureAlpha(sprite, activeRay, currentDistance, min, max)) {
                        continue;
                    }
                    pickedRay = activeRay;
                    distance = currentDistance;
                    currentSprite = sprite;
                    if (fastCheck) {
                        break;
                    }
                }
            }
        }
        if (currentSprite) {
            var result = new PickingInfo();
            cameraView.invertToRef(TmpVectors.Matrix[0]);
            result.hit = true;
            result.pickedSprite = currentSprite;
            result.distance = distance;
            // Get picked point
            var direction = TmpVectors.Vector3[2];
            direction.copyFrom(pickedRay.direction);
            direction.normalize();
            direction.scaleInPlace(distance);
            pickedRay.origin.addToRef(direction, pickedPoint);
            result.pickedPoint = Vector3.TransformCoordinates(pickedPoint, TmpVectors.Matrix[0]);
            return result;
        }
        return null;
    };
    /**
     * Intersects the sprites with a ray
     * @param ray defines the ray to intersect with
     * @param camera defines the current active camera
     * @param predicate defines a predicate used to select candidate sprites
     * @returns null if no hit or a PickingInfo array
     */
    SpriteManager.prototype.multiIntersects = function (ray, camera, predicate) {
        var count = Math.min(this.capacity, this.sprites.length);
        var min = Vector3.Zero();
        var max = Vector3.Zero();
        var distance;
        var results = [];
        var pickedPoint = TmpVectors.Vector3[0].copyFromFloats(0, 0, 0);
        var cameraSpacePosition = TmpVectors.Vector3[1].copyFromFloats(0, 0, 0);
        var cameraView = camera.getViewMatrix();
        for (var index = 0; index < count; index++) {
            var sprite = this.sprites[index];
            if (!sprite) {
                continue;
            }
            if (predicate) {
                if (!predicate(sprite)) {
                    continue;
                }
            }
            else if (!sprite.isPickable) {
                continue;
            }
            Vector3.TransformCoordinatesToRef(sprite.position, cameraView, cameraSpacePosition);
            min.copyFromFloats(cameraSpacePosition.x - sprite.width / 2, cameraSpacePosition.y - sprite.height / 2, cameraSpacePosition.z);
            max.copyFromFloats(cameraSpacePosition.x + sprite.width / 2, cameraSpacePosition.y + sprite.height / 2, cameraSpacePosition.z);
            if (ray.intersectsBoxMinMax(min, max)) {
                distance = Vector3.Distance(cameraSpacePosition, ray.origin);
                if (!this._checkTextureAlpha(sprite, ray, distance, min, max)) {
                    continue;
                }
                var result = new PickingInfo();
                results.push(result);
                cameraView.invertToRef(TmpVectors.Matrix[0]);
                result.hit = true;
                result.pickedSprite = sprite;
                result.distance = distance;
                // Get picked point
                var direction = TmpVectors.Vector3[2];
                direction.copyFrom(ray.direction);
                direction.normalize();
                direction.scaleInPlace(distance);
                ray.origin.addToRef(direction, pickedPoint);
                result.pickedPoint = Vector3.TransformCoordinates(pickedPoint, TmpVectors.Matrix[0]);
            }
        }
        return results;
    };
    /**
     * Render all child sprites
     */
    SpriteManager.prototype.render = function () {
        // Check
        if (this._fromPacked && (!this._packedAndReady || !this._spriteMap || !this._cellData)) {
            return;
        }
        var engine = this._scene.getEngine();
        var deltaTime = engine.getDeltaTime();
        if (this._packedAndReady) {
            this._spriteRenderer.render(this.sprites, deltaTime, this._scene.getViewMatrix(), this._scene.getProjectionMatrix(), this._customUpdate);
        }
        else {
            this._spriteRenderer.render(this.sprites, deltaTime, this._scene.getViewMatrix(), this._scene.getProjectionMatrix());
        }
    };
    /**
     * Rebuilds the manager (after a context lost, for eg)
     */
    SpriteManager.prototype.rebuild = function () {
        var _a;
        (_a = this._spriteRenderer) === null || _a === void 0 ? void 0 : _a.rebuild();
    };
    /**
     * Release associated resources
     */
    SpriteManager.prototype.dispose = function () {
        if (this._spriteRenderer) {
            this._spriteRenderer.dispose();
            this._spriteRenderer = null;
        }
        this._textureContent = null;
        // Remove from scene
        var index = this._scene.spriteManagers.indexOf(this);
        this._scene.spriteManagers.splice(index, 1);
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
    };
    /**
     * Serializes the sprite manager to a JSON object
     * @param serializeTexture defines if the texture must be serialized as well
     * @returns the JSON object
     */
    SpriteManager.prototype.serialize = function (serializeTexture) {
        if (serializeTexture === void 0) { serializeTexture = false; }
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.capacity = this.capacity;
        serializationObject.cellWidth = this.cellWidth;
        serializationObject.cellHeight = this.cellHeight;
        if (this.texture) {
            if (serializeTexture) {
                serializationObject.texture = this.texture.serialize();
            }
            else {
                serializationObject.textureUrl = this.texture.name;
                serializationObject.invertY = this.texture._invertY;
            }
        }
        serializationObject.sprites = [];
        for (var _i = 0, _a = this.sprites; _i < _a.length; _i++) {
            var sprite = _a[_i];
            serializationObject.sprites.push(sprite.serialize());
        }
        return serializationObject;
    };
    /**
     * Parses a JSON object to create a new sprite manager.
     * @param parsedManager The JSON object to parse
     * @param scene The scene to create the sprite manager
     * @param rootUrl The root url to use to load external dependencies like texture
     * @returns the new sprite manager
     */
    SpriteManager.Parse = function (parsedManager, scene, rootUrl) {
        var manager = new SpriteManager(parsedManager.name, "", parsedManager.capacity, {
            width: parsedManager.cellWidth,
            height: parsedManager.cellHeight,
        }, scene);
        if (parsedManager.texture) {
            manager.texture = Texture.Parse(parsedManager.texture, scene, rootUrl);
        }
        else if (parsedManager.textureName) {
            manager.texture = new Texture(rootUrl + parsedManager.textureUrl, scene, false, parsedManager.invertY !== undefined ? parsedManager.invertY : true);
        }
        for (var _i = 0, _a = parsedManager.sprites; _i < _a.length; _i++) {
            var parsedSprite = _a[_i];
            Sprite.Parse(parsedSprite, manager);
        }
        return manager;
    };
    /**
     * Creates a sprite manager from a snippet saved in a remote file
     * @param name defines the name of the sprite manager to create (can be null or empty to use the one from the json data)
     * @param url defines the url to load from
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a promise that will resolve to the new sprite manager
     */
    SpriteManager.ParseFromFileAsync = function (name, url, scene, rootUrl) {
        if (rootUrl === void 0) { rootUrl = ""; }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var serializationObject = JSON.parse(request.responseText);
                        var output = SpriteManager.Parse(serializationObject, scene || EngineStore.LastCreatedScene, rootUrl);
                        if (name) {
                            output.name = name;
                        }
                        resolve(output);
                    }
                    else {
                        reject("Unable to load the sprite manager");
                    }
                }
            });
            request.open("GET", url);
            request.send();
        });
    };
    /**
     * Creates a sprite manager from a snippet saved by the sprite editor
     * @param snippetId defines the snippet to load (can be set to _BLANK to create a default one)
     * @param scene defines the hosting scene
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @returns a promise that will resolve to the new sprite manager
     */
    SpriteManager.CreateFromSnippetAsync = function (snippetId, scene, rootUrl) {
        var _this = this;
        if (rootUrl === void 0) { rootUrl = ""; }
        if (snippetId === "_BLANK") {
            return Promise.resolve(new SpriteManager("Default sprite manager", "//playground.babylonjs.com/textures/player.png", 500, 64, scene));
        }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var snippet = JSON.parse(JSON.parse(request.responseText).jsonPayload);
                        var serializationObject = JSON.parse(snippet.spriteManager);
                        var output = SpriteManager.Parse(serializationObject, scene || EngineStore.LastCreatedScene, rootUrl);
                        output.snippetId = snippetId;
                        resolve(output);
                    }
                    else {
                        reject("Unable to load the snippet " + snippetId);
                    }
                }
            });
            request.open("GET", _this.SnippetUrl + "/" + snippetId.replace(/#/g, "/"));
            request.send();
        });
    };
    /** Define the Url to load snippets */
    SpriteManager.SnippetUrl = `https://snippet.babylonjs.com`;
    return SpriteManager;
}());
export { SpriteManager };
//# sourceMappingURL=spriteManager.js.map