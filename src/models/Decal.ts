import { ELayer } from "../gameMap";
import { EDecal } from "../sprites";
import Sprite from "./Sprite";

export default class Decal extends Sprite {
  spriteIdx: number;
  layerId = ELayer.DECALS;
  x: number;
  y: number;

  constructor(decalIdx: EDecal, x: number, y: number) {
    super();
    this.spriteIdx = decalIdx;
    this.x = x;
    this.y = y;
  }
}
