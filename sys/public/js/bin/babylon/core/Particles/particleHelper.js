import { Tools } from "../Misc/tools.js";
import { Color4 } from "../Maths/math.color.js";
import { Texture } from "../Materials/Textures/texture.js";
import { EngineStore } from "../Engines/engineStore.js";
import { GPUParticleSystem } from "./gpuParticleSystem.js";
import { ParticleSystemSet } from "./particleSystemSet.js";
import { ParticleSystem } from "./particleSystem.js";
import { WebRequest } from "../Misc/webRequest.js";

/**
 * This class is made for on one-liner static method to help creating particle system set.
 */
var ParticleHelper = /** @class */ (function () {
    function ParticleHelper() {
    }
    /**
     * Create a default particle system that you can tweak
     * @param emitter defines the emitter to use
     * @param capacity defines the system capacity (default is 500 particles)
     * @param scene defines the hosting scene
     * @param useGPU defines if a GPUParticleSystem must be created (default is false)
     * @returns the new Particle system
     */
    ParticleHelper.CreateDefault = function (emitter, capacity, scene, useGPU) {
        if (capacity === void 0) { capacity = 500; }
        if (useGPU === void 0) { useGPU = false; }
        var system;
        if (useGPU) {
            system = new GPUParticleSystem("default system", { capacity: capacity }, scene);
        }
        else {
            system = new ParticleSystem("default system", capacity, scene);
        }
        system.emitter = emitter;
        system.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", system.getScene());
        system.createConeEmitter(0.1, Math.PI / 4);
        // Particle color
        system.color1 = new Color4(1.0, 1.0, 1.0, 1.0);
        system.color2 = new Color4(1.0, 1.0, 1.0, 1.0);
        system.colorDead = new Color4(1.0, 1.0, 1.0, 0.0);
        // Particle Size
        system.minSize = 0.1;
        system.maxSize = 0.1;
        // Emission speed
        system.minEmitPower = 2;
        system.maxEmitPower = 2;
        // Update speed
        system.updateSpeed = 1 / 60;
        system.emitRate = 30;
        return system;
    };
    /**
     * This is the main static method (one-liner) of this helper to create different particle systems
     * @param type This string represents the type to the particle system to create
     * @param scene The scene where the particle system should live
     * @param gpu If the system will use gpu
     * @param capacity defines the system capacity (if null or undefined the sotred capacity will be used)
     * @returns the ParticleSystemSet created
     */
    ParticleHelper.CreateAsync = function (type, scene, gpu, capacity) {
        if (gpu === void 0) { gpu = false; }
        if (!scene) {
            scene = EngineStore.LastCreatedScene;
        }
        var token = {};
        scene._addPendingData(token);
        return new Promise(function (resolve, reject) {
            if (gpu && !GPUParticleSystem.IsSupported) {
                scene._removePendingData(token);
                return reject("Particle system with GPU is not supported.");
            }
            Tools.LoadFile("".concat(ParticleHelper.BaseAssetsUrl, "/systems/").concat(type, ".json"), function (data) {
                scene._removePendingData(token);
                var newData = JSON.parse(data.toString());
                return resolve(ParticleSystemSet.Parse(newData, scene, gpu, capacity));
            }, undefined, undefined, undefined, function () {
                scene._removePendingData(token);
                return reject("An error occurred with the creation of your particle system. Check if your type '".concat(type, "' exists."));
            });
        });
    };
    /**
     * Static function used to export a particle system to a ParticleSystemSet variable.
     * Please note that the emitter shape is not exported
     * @param systems defines the particle systems to export
     * @returns the created particle system set
     */
    ParticleHelper.ExportSet = function (systems) {
        var set = new ParticleSystemSet();
        for (var _i = 0, systems_1 = systems; _i < systems_1.length; _i++) {
            var system = systems_1[_i];
            set.systems.push(system);
        }
        return set;
    };
    /**
     * Creates a particle system from a snippet saved in a remote file
     * @param name defines the name of the particle system to create (can be null or empty to use the one from the json data)
     * @param url defines the url to load from
     * @param scene defines the hosting scene
     * @param gpu If the system will use gpu
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @param capacity defines the system capacity (if null or undefined the sotred capacity will be used)
     * @returns a promise that will resolve to the new particle system
     */
    ParticleHelper.ParseFromFileAsync = function (name, url, scene, gpu, rootUrl, capacity) {
        if (gpu === void 0) { gpu = false; }
        if (rootUrl === void 0) { rootUrl = ""; }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var serializationObject = JSON.parse(request.responseText);
                        var output = void 0;
                        if (gpu) {
                            output = GPUParticleSystem.Parse(serializationObject, scene, rootUrl, false, capacity);
                        }
                        else {
                            output = ParticleSystem.Parse(serializationObject, scene, rootUrl, false, capacity);
                        }
                        if (name) {
                            output.name = name;
                        }
                        resolve(output);
                    }
                    else {
                        reject("Unable to load the particle system");
                    }
                }
            });
            request.open("GET", url);
            request.send();
        });
    };
    /**
     * Creates a particle system from a snippet saved by the particle system editor
     * @param snippetId defines the snippet to load (can be set to _BLANK to create a default one)
     * @param scene defines the hosting scene
     * @param gpu If the system will use gpu
     * @param rootUrl defines the root URL to use to load textures and relative dependencies
     * @param capacity defines the system capacity (if null or undefined the sotred capacity will be used)
     * @returns a promise that will resolve to the new particle system
     */
    ParticleHelper.CreateFromSnippetAsync = function (snippetId, scene, gpu, rootUrl, capacity) {
        var _this = this;
        if (gpu === void 0) { gpu = false; }
        if (rootUrl === void 0) { rootUrl = ""; }
        if (snippetId === "_BLANK") {
            var system = this.CreateDefault(null);
            system.start();
            return Promise.resolve(system);
        }
        return new Promise(function (resolve, reject) {
            var request = new WebRequest();
            request.addEventListener("readystatechange", function () {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        var snippet = JSON.parse(JSON.parse(request.responseText).jsonPayload);
                        var serializationObject = JSON.parse(snippet.particleSystem);
                        var output = void 0;
                        if (gpu) {
                            output = GPUParticleSystem.Parse(serializationObject, scene, rootUrl, false, capacity);
                        }
                        else {
                            output = ParticleSystem.Parse(serializationObject, scene, rootUrl, false, capacity);
                        }
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
    /**
     * Gets or sets base Assets URL
     */
    ParticleHelper.BaseAssetsUrl = ParticleSystemSet.BaseAssetsUrl;
    /** Define the Url to load snippets */
    ParticleHelper.SnippetUrl = `https://snippet.babylonjs.com`;
    return ParticleHelper;
}());
export { ParticleHelper };
//# sourceMappingURL=particleHelper.js.map