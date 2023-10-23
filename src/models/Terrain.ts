import { ELayer } from "../gameMap";
import { ETerrain } from "../sprites";
import Sprite from "./Sprite";
import { ITerrainMetadata, getTerrainMetadata } from "./types";

export default class Terrain extends Sprite {
  spriteIdx: number;
  layerId = ELayer.STATIC;
  x: number;
  y: number;

  constructor(terrainIdx: ETerrain, x: number, y: number) {
    super();
    this.spriteIdx = terrainIdx;
    this.x = x;
    this.y = y;
  }

  get metadata(): ITerrainMetadata {
    return getTerrainMetadata(this.spriteIdx);
  }
  // get sprite():  IAssets["terrain"] {
  //   return this.assets.get(terrainIdx);
  // }
}
