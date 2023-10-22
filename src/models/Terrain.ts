import { IAssets } from "../gameMap";
import { ETerrain } from "../sprites";
import Sprite from "./Sprite";
import { ITerrainMetadata, getTerrainMetadata } from "./types";

export default class Terrain extends Sprite {
  spriteIdx: number;
  metadata: ITerrainMetadata;
  x: number;
  y: number;

  constructor(
    assets: IAssets["terrain"],
    terrainIdx: ETerrain,
    x: number,
    y: number
  ) {
    super();
    this.spriteIdx = terrainIdx;
    this.x = x;
    this.y = y;

    this.metadata = getTerrainMetadata(terrainIdx);
    const asset =
      assets.static.get(terrainIdx) || assets.dynamic.get(terrainIdx);
    if (asset) {
      this.metadata.sprite = asset.sprite;
      this.metadata.frames = asset.frames;
    }
  }
}
