import { ParsedFrame } from "gifuct-js";
import { ELayer, State } from "../State";

export type SpriteArr<T> = [T, T, T];

export interface ISpriteMetadata {
  offsetX: number;
  offsetY: number;
  sprites: SpriteArr<HTMLImageElement>;
  frames: SpriteArr<ParsedFrame[]>;
}

export class Sprite {
  layerId!: ELayer;
  frameIndex = 0;
  needsDisposal = false;
  playing = false;
  timeElapsed = 0;
  state: State;

  constructor(state: State) {
    this.state = state;
  }
}
