import { ETerrain } from "../sprites";

export default class Terrain {
  spriteIdx: number;
  x: number;
  y: number;

  constructor(terrainIdx: ETerrain, x: number, y: number) {
    this.spriteIdx = terrainIdx;
    this.x = x;
    this.y = y;
  }
}
