import { SmartArrayNoDuplicate } from "../../Misc/smartArray.js";
import { OctreeBlock } from "./octreeBlock.js";
/**
 * Octrees are a really powerful data structure that can quickly select entities based on space coordinates.
 * @see https://doc.babylonjs.com/how_to/optimizing_your_scene_with_octrees
 */
var Octree = /** @class */ (function () {
    /**
     * Creates a octree
     * @see https://doc.babylonjs.com/how_to/optimizing_your_scene_with_octrees
     * @param creationFunc function to be used to instantiate the octree
     * @param maxBlockCapacity defines the maximum number of meshes you want on your octree's leaves (default: 64)
     * @param maxDepth defines the maximum depth (sub-levels) for your octree. Default value is 2, which means 8 8 8 = 512 blocks :) (This parameter takes precedence over capacity.)
     */
    function Octree(creationFunc, maxBlockCapacity, 
    /** Defines the maximum depth (sub-levels) for your octree. Default value is 2, which means 8 8 8 = 512 blocks :) (This parameter takes precedence over capacity.) */
    maxDepth) {
        if (maxDepth === void 0) { maxDepth = 2; }
        this.maxDepth = maxDepth;
        /**
         * Content stored in the octree
         */
        this.dynamicContent = new Array();
        this._maxBlockCapacity = maxBlockCapacity || 64;
        this._selectionContent = new SmartArrayNoDuplicate(1024);
        this._creationFunc = creationFunc;
    }
    // Methods
    /**
     * Updates the octree by adding blocks for the passed in meshes within the min and max world parameters
     * @param worldMin worldMin for the octree blocks var blockSize = new Vector3((worldMax.x - worldMin.x) / 2, (worldMax.y - worldMin.y) / 2, (worldMax.z - worldMin.z) / 2);
     * @param worldMax worldMax for the octree blocks var blockSize = new Vector3((worldMax.x - worldMin.x) / 2, (worldMax.y - worldMin.y) / 2, (worldMax.z - worldMin.z) / 2);
     * @param entries meshes to be added to the octree blocks
     */
    Octree.prototype.update = function (worldMin, worldMax, entries) {
        OctreeBlock._CreateBlocks(worldMin, worldMax, entries, this._maxBlockCapacity, 0, this.maxDepth, this, this._creationFunc);
    };
    /**
     * Adds a mesh to the octree
     * @param entry Mesh to add to the octree
     */
    Octree.prototype.addMesh = function (entry) {
        for (var index = 0; index < this.blocks.length; index++) {
            var block = this.blocks[index];
            block.addEntry(entry);
        }
    };
    /**
     * Remove an element from the octree
     * @param entry defines the element to remove
     */
    Octree.prototype.removeMesh = function (entry) {
        for (var index = 0; index < this.blocks.length; index++) {
            var block = this.blocks[index];
            block.removeEntry(entry);
        }
    };
    /**
     * Selects an array of meshes within the frustum
     * @param frustumPlanes The frustum planes to use which will select all meshes within it
     * @param allowDuplicate If duplicate objects are allowed in the resulting object array
     * @returns array of meshes within the frustum
     */
    Octree.prototype.select = function (frustumPlanes, allowDuplicate) {
        this._selectionContent.reset();
        for (var index = 0; index < this.blocks.length; index++) {
            var block = this.blocks[index];
            block.select(frustumPlanes, this._selectionContent, allowDuplicate);
        }
        if (allowDuplicate) {
            this._selectionContent.concat(this.dynamicContent);
        }
        else {
            this._selectionContent.concatWithNoDuplicate(this.dynamicContent);
        }
        return this._selectionContent;
    };
    /**
     * Test if the octree intersect with the given bounding sphere and if yes, then add its content to the selection array
     * @param sphereCenter defines the bounding sphere center
     * @param sphereRadius defines the bounding sphere radius
     * @param allowDuplicate defines if the selection array can contains duplicated entries
     * @returns an array of objects that intersect the sphere
     */
    Octree.prototype.intersects = function (sphereCenter, sphereRadius, allowDuplicate) {
        this._selectionContent.reset();
        for (var index = 0; index < this.blocks.length; index++) {
            var block = this.blocks[index];
            block.intersects(sphereCenter, sphereRadius, this._selectionContent, allowDuplicate);
        }
        if (allowDuplicate) {
            this._selectionContent.concat(this.dynamicContent);
        }
        else {
            this._selectionContent.concatWithNoDuplicate(this.dynamicContent);
        }
        return this._selectionContent;
    };
    /**
     * Test if the octree intersect with the given ray and if yes, then add its content to resulting array
     * @param ray defines the ray to test with
     * @returns array of intersected objects
     */
    Octree.prototype.intersectsRay = function (ray) {
        this._selectionContent.reset();
        for (var index = 0; index < this.blocks.length; index++) {
            var block = this.blocks[index];
            block.intersectsRay(ray, this._selectionContent);
        }
        this._selectionContent.concatWithNoDuplicate(this.dynamicContent);
        return this._selectionContent;
    };
    /**
     * Adds a mesh into the octree block if it intersects the block
     * @param entry
     * @param block
     */
    Octree.CreationFuncForMeshes = function (entry, block) {
        var boundingInfo = entry.getBoundingInfo();
        if (!entry.isBlocked && boundingInfo.boundingBox.intersectsMinMax(block.minPoint, block.maxPoint)) {
            block.entries.push(entry);
        }
    };
    /**
     * Adds a submesh into the octree block if it intersects the block
     * @param entry
     * @param block
     */
    Octree.CreationFuncForSubMeshes = function (entry, block) {
        var boundingInfo = entry.getBoundingInfo();
        if (boundingInfo.boundingBox.intersectsMinMax(block.minPoint, block.maxPoint)) {
            block.entries.push(entry);
        }
    };
    return Octree;
}());
export { Octree };
//# sourceMappingURL=octree.js.map