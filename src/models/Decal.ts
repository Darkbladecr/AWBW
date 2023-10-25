import { ELayer } from "../State";
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

export interface IDecalMetadata extends ISpriteMetadata {
  name: string;
}

export interface IDecalArgs {
  index: EDecal;
  x: number;
  y: number;
}

export class Decal extends Sprite {
  spriteIdx: number;
  layerId: ELayer;
  x: number;
  y: number;

  static metadata(index: EDecal) {
    const metadata: Partial<ISpriteMetadata> = {
      offsetX: 0,
      offsetY: 0,
    };
    if (index <= EDecal.HP9) {
      metadata.offsetX = 7;
      metadata.offsetY = -1;
    } else if (index === EDecal.AMMO) {
      metadata.offsetX = 8;
      metadata.offsetY = -5;
    } else if (index === EDecal.FUEL) {
      metadata.offsetX = 8;
      metadata.offsetY = -1;
    } else if (index >= EDecal.CAPTURE && index <= EDecal.SUB_DIVE) {
      metadata.offsetX = -1;
      metadata.offsetY = 0;
    } else if (index === EDecal.SUPPLY_RIGHT || index === EDecal.TRAP_RIGHT) {
      metadata.offsetX = 16;
      metadata.offsetY = -1;
    } else if (index === EDecal.TARGET) {
      metadata.offsetX = -2;
      metadata.offsetY = -2;
    } else if (index === EDecal.SELECT) {
      metadata.offsetX = -5;
      metadata.offsetY = -5;
    }

    return metadata;
  }

  constructor({ index, x, y }: IDecalArgs) {
    super();
    this.spriteIdx = index;
    this.x = x;
    this.y = y;

    if (index <= EDecal.HP9) {
      this.layerId = ELayer.HP;
    } else if (index === EDecal.AMMO) {
      this.layerId = ELayer.AMMO;
    } else if (index === EDecal.FUEL) {
      this.layerId = ELayer.FUEL;
    } else if (index >= EDecal.CAPTURE && index <= EDecal.SUB_DIVE) {
      this.layerId = ELayer.CAPTURE;
    } else if (index === EDecal.SELECT || index === EDecal.TARGET) {
      this.layerId = ELayer.CURSOR;
    } else {
      this.layerId = ELayer.UI;
    }
  }
}
