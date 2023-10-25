import { Terrain, Building, Unit, Decal } from ".";

export enum EMapStyle {
  AW1,
  AW2,
  ANIMATED,
}
export const STYLES = [EMapStyle.AW1, EMapStyle.AW2, EMapStyle.ANIMATED];

export const countryCodes = [
  "os",
  "bm",
  "ge",
  "yc",
  "bh",
  "rf",
  "gs",
  "bd",
  "ab",
  "js",
  "ci",
  "pc",
  "tg",
  "pl",
  "ar",
  "wn",
];

export enum ECountry {
  NEUTRAL,
  ORANGE_STAR,
  BLUE_MOON,
  GREEN_EARTH,
  YELLOW_COMET,
  BLACK_HOLE,
  RED_FIRE,
  GREY_SKY,
  BROWN_DESERT,
  AMBER_BLAZE,
  JADE_SUN,
  COBALT_ICE,
  PINK_COSMOS,
  TEAL_GALAXY,
  PURPLE_LIGHTNING,
  ACID_RAIN,
  WHITE_NOVA,
}

export type SpriteType = Terrain | Building | Unit | Decal;

export interface IMapLayer<T extends SpriteType> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData | undefined;
  sprites: (T | null)[][];
}
