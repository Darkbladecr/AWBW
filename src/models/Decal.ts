import { ELayer } from "../gameMap";
import { Sprite, ISpriteMetadata } from "./Sprite";

export enum EDecal {
  HP1,
  HP2,
  HP3,
  HP4,
  HP5,
  HP6,
  HP7,
  HP8,
  HP9,
  AMMO,
  FUEL,
  CAPTURE,
  LOAD,
  FOG_LOAD,
  SUB_DIVE,
  SUPPLY_RIGHT,
  TARGET,
  TRAP_RIGHT,
  SELECT,
}

export interface IDecalMetadata {
  name: string;
}

export function getDecalMetadata(index: EDecal) {
  const metadata: Partial<ISpriteMetadata> = {
    offsetX: 0,
    offsetY: 0,
  };
  if (index <= EDecal.HP9) {
    metadata.offsetX = 11;
    metadata.offsetY = 11;
  } else if (index === EDecal.AMMO) {
    metadata.offsetX = 12;
    metadata.offsetY = 12;
  } else if (index === EDecal.FUEL) {
    metadata.offsetX = 11;
    metadata.offsetY = 10;
  } else if (index >= EDecal.CAPTURE && index <= EDecal.SUB_DIVE) {
    metadata.offsetX = 2;
    metadata.offsetY = 10;
  } else if (index === EDecal.SUPPLY_RIGHT || index === EDecal.TRAP_RIGHT) {
    metadata.offsetX = 20;
    metadata.offsetY = 5;
  } else if (index === EDecal.SELECT) {
    metadata.offsetX = -1.5;
    metadata.offsetY = -1.5;
  }

  return metadata;
}

export class Decal extends Sprite {
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
