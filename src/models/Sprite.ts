import { ELayer } from "../gameMap";

export default class Sprite {
  layerId!: ELayer;
  frameIndex = 0;
  needsDisposal = false;
  playing = false;
  timeElapsed = 0;
}
