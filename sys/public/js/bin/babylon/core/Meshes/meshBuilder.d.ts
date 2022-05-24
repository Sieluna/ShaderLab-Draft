import { CreateRibbon } from "./Builders/ribbonBuilder";
import { CreateDisc } from "./Builders/discBuilder";
import { CreateBox } from "./Builders/boxBuilder";
import { CreateTiledBox } from "./Builders/tiledBoxBuilder";
import { CreateSphere } from "./Builders/sphereBuilder";
import { CreateCylinder } from "./Builders/cylinderBuilder";
import { CreateTorus } from "./Builders/torusBuilder";
import { CreateTorusKnot } from "./Builders/torusKnotBuilder";
import { CreateDashedLines, CreateLineSystem, CreateLines } from "./Builders/linesBuilder";
import { CreatePolygon, ExtrudePolygon } from "./Builders/polygonBuilder";
import { ExtrudeShape, ExtrudeShapeCustom } from "./Builders/shapeBuilder";
import { CreateLathe } from "./Builders/latheBuilder";
import { CreatePlane } from "./Builders/planeBuilder";
import { CreateTiledPlane } from "./Builders/tiledPlaneBuilder";
import { CreateGround, CreateGroundFromHeightMap, CreateTiledGround } from "./Builders/groundBuilder";
import { CreateTube } from "./Builders/tubeBuilder";
import { CreatePolyhedron } from "./Builders/polyhedronBuilder";
import { CreateIcoSphere } from "./Builders/icoSphereBuilder";
import { CreateDecal } from "./Builders/decalBuilder";
import { CreateCapsule } from "./Builders/capsuleBuilder";
import { CreateGeodesic } from "./Builders/geodesicBuilder";
import { CreateGoldberg } from "./Builders/goldbergBuilder";
/**
 * Class containing static functions to help procedurally build meshes
 */
export declare const MeshBuilder: {
    CreateBox: typeof CreateBox;
    CreateTiledBox: typeof CreateTiledBox;
    CreateSphere: typeof CreateSphere;
    CreateDisc: typeof CreateDisc;
    CreateIcoSphere: typeof CreateIcoSphere;
    CreateRibbon: typeof CreateRibbon;
    CreateCylinder: typeof CreateCylinder;
    CreateTorus: typeof CreateTorus;
    CreateTorusKnot: typeof CreateTorusKnot;
    CreateLineSystem: typeof CreateLineSystem;
    CreateLines: typeof CreateLines;
    CreateDashedLines: typeof CreateDashedLines;
    ExtrudeShape: typeof ExtrudeShape;
    ExtrudeShapeCustom: typeof ExtrudeShapeCustom;
    CreateLathe: typeof CreateLathe;
    CreateTiledPlane: typeof CreateTiledPlane;
    CreatePlane: typeof CreatePlane;
    CreateGround: typeof CreateGround;
    CreateTiledGround: typeof CreateTiledGround;
    CreateGroundFromHeightMap: typeof CreateGroundFromHeightMap;
    CreatePolygon: typeof CreatePolygon;
    ExtrudePolygon: typeof ExtrudePolygon;
    CreateTube: typeof CreateTube;
    CreatePolyhedron: typeof CreatePolyhedron;
    CreateGeodesic: typeof CreateGeodesic;
    CreateGoldberg: typeof CreateGoldberg;
    CreateDecal: typeof CreateDecal;
    CreateCapsule: typeof CreateCapsule;
};
