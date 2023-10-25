import {
  IMovementArr,
  IMovementWeatherArr,
  Movement,
} from "../movement/Movement";
import { ELayer } from "../State";
import { terrainFilenames } from "./files";
import { Sprite } from "./Sprite";

export enum ETerrain {
  NULL,
  PLAIN = 1,
  MOUNTAIN,
  WOOD,
  HRIVER,
  VRIVER,
  CRIVER,
  ESRIVER,
  SWRIVER,
  WNRIVER,
  NERIVER,
  ESWRIVER,
  SWNRIVER,
  WNERIVER,
  NESRIVER,
  HROAD,
  VROAD,
  CROAD,
  ESROAD,
  SWROAD,
  WNROAD,
  NEROAD,
  ESWROAD,
  SWNROAD,
  WNEROAD,
  NESROAD,
  HBRIDGE,
  VBRIDGE,
  SEA,
  HSHOAL,
  HSHOALN,
  VSHOAL,
  VSHOALE,
  REEF,
  NEUTRALCITY,
  NEUTRALBASE,
  NEUTRALAIRPORT,
  NEUTRALPORT,
  ORANGESTARCITY,
  ORANGESTARBASE,
  ORANGESTARAIRPORT,
  ORANGESTARPORT,
  ORANGESTARHQ,
  BLUEMOONCITY,
  BLUEMOONBASE,
  BLUEMOONAIRPORT,
  BLUEMOONPORT,
  BLUEMOONHQ,
  GREENEARTHCITY,
  GREENEARTHBASE,
  GREENEARTHAIRPORT,
  GREENEARTHPORT,
  GREENEARTHHQ,
  YELLOWCOMETCITY,
  YELLOWCOMETBASE,
  YELLOWCOMETAIRPORT,
  YELLOWCOMETPORT,
  YELLOWCOMETHQ,
  REDFIRECITY = 81,
  REDFIREBASE,
  REDFIREAIRPORT,
  REDFIREPORT,
  REDFIREHQ,
  GREYSKYCITY,
  GREYSKYBASE,
  GREYSKYAIRPORT,
  GREYSKYPORT,
  GREYSKYHQ,
  BLACKHOLECITY,
  BLACKHOLEBASE,
  BLACKHOLEAIRPORT,
  BLACKHOLEPORT,
  BLACKHOLEHQ,
  BROWNDESERTCITY,
  BROWNDESERTBASE,
  BROWNDESERTAIRPORT,
  BROWNDESERTPORT,
  BROWNDESERTHQ,
  VPIPE,
  HPIPE,
  NEPIPE,
  ESPIPE,
  SWPIPE,
  WNPIPE,
  NPIPEEND,
  EPIPEEND,
  SPIPEEND,
  WPIPEEND,
  MISSILESILO,
  MISSILESILOEMPTY,
  HPIPESEAM,
  VPIPESEAM,
  HPIPERUBBLE,
  VPIPERUBBLE,
  AMBERBLAZEAIRPORT,
  AMBERBLAZEBASE,
  AMBERBLAZECITY,
  AMBERBLAZEHQ,
  AMBERBLAZEPORT,
  JADESUNAIRPORT,
  JADESUNBASE,
  JADESUNCITY,
  JADESUNHQ,
  JADESUNPORT,
  AMBERBLAZECOMTOWER,
  BLACKHOLECOMTOWER,
  BLUEMOONCOMTOWER,
  BROWNDESERTCOMTOWER,
  GREENEARTHCOMTOWER,
  JADESUNCOMTOWER,
  NEUTRALCOMTOWER,
  ORANGESTARCOMTOWER,
  REDFIRECOMTOWER,
  YELLOWCOMETCOMTOWER,
  GREYSKYCOMTOWER,
  AMBERBLAZELAB,
  BLACKHOLELAB,
  BLUEMOONLAB,
  BROWNDESERTLAB,
  GREENEARTHLAB,
  GREYSKYLAB,
  JADESUNLAB,
  NEUTRALLAB,
  ORANGESTARLAB,
  REDFIRELAB,
  YELLOWCOMETLAB,
  COBALTICEAIRPORT,
  COBALTICEBASE,
  COBALTICECITY,
  COBALTICECOMTOWER,
  COBALTICEHQ,
  COBALTICELAB,
  COBALTICEPORT,
  PINKCOSMOSAIRPORT,
  PINKCOSMOSBASE,
  PINKCOSMOSCITY,
  PINKCOSMOSCOMTOWER,
  PINKCOSMOSHQ,
  PINKCOSMOSLAB,
  PINKCOSMOSPORT,
  TEALGALAXYAIRPORT,
  TEALGALAXYBASE,
  TEALGALAXYCITY,
  TEALGALAXYCOMTOWER,
  TEALGALAXYHQ,
  TEALGALAXYLAB,
  TEALGALAXYPORT,
  PURPLELIGHTNINGAIRPORT,
  PURPLELIGHTNINGBASE,
  PURPLELIGHTNINGCITY,
  PURPLELIGHTNINGCOMTOWER,
  PURPLELIGHTNINGHQ,
  PURPLELIGHTNINGLAB,
  PURPLELIGHTNINGPORT,
  ACIDRAINAIRPORT = 181,
  ACIDRAINBASE,
  ACIDRAINCITY,
  ACIDRAINCOMTOWER,
  ACIDRAINHQ,
  ACIDRAINLAB,
  ACIDRAINPORT,
  WHITENOVAAIRPORT,
  WHITENOVABASE,
  WHITENOVACITY,
  WHITENOVACOMTOWER,
  WHITENOVAHQ,
  WHITENOVALAB,
  WHITENOVAPORT,
  TELEPORTER,
}

export interface ITerrainMetadata {
  name: string;
  spriteIdx: ETerrain;
  defense: number;
  movement: IMovementWeatherArr;
}

export interface ITerrainArgs {
  index: ETerrain;
  x: number;
  y: number;
}

export class Terrain extends Sprite {
  spriteIdx: number;
  layerId = ELayer.STATIC;
  x: number;
  y: number;

  static metadata(index: ETerrain): ITerrainMetadata {
    let terrainIdx = index;
    if (index > 81) {
      terrainIdx = terrainIdx - (81 - 57);
    }
    if (index > 181) {
      terrainIdx = terrainIdx - (181 - 176);
    }
    let metadata: ITerrainMetadata = {
      spriteIdx: index,
      name: terrainFilenames[terrainIdx],
      defense: 0,
      movement: [Movement.nullArr, Movement.nullArr, Movement.nullArr],
    };
    if (
      index === ETerrain.PLAIN ||
      index === ETerrain.HPIPERUBBLE ||
      index === ETerrain.VPIPERUBBLE
    ) {
      metadata.defense = 1;
      const clearMovement: IMovementArr = [1, 1, 1, 2, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 2, 3, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [2, 1, 2, 3, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index === ETerrain.MOUNTAIN) {
      metadata.defense = 4;
      const clearMovement: IMovementArr = [2, 1, 0, 0, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [2, 1, 0, 0, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [4, 2, 0, 0, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index === ETerrain.WOOD) {
      metadata.defense = 2;
      const clearMovement: IMovementArr = [1, 1, 2, 3, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 3, 4, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [2, 1, 2, 3, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index >= ETerrain.HRIVER && index <= ETerrain.NESRIVER) {
      const clearMovement: IMovementArr = [2, 1, 0, 0, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [2, 1, 0, 0, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [2, 1, 0, 0, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index >= ETerrain.HROAD && index <= ETerrain.VBRIDGE) {
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index === ETerrain.SEA) {
      const clearMovement: IMovementArr = [0, 0, 0, 0, 1, 1, 1, 0];
      const rainMovement: IMovementArr = [0, 0, 0, 0, 1, 1, 1, 0];
      const snowMovement: IMovementArr = [0, 0, 0, 0, 2, 2, 2, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index >= ETerrain.HSHOAL && index <= ETerrain.VSHOALE) {
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 1, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 1, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 1, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (index === ETerrain.REEF) {
      metadata.defense = 1;
      const clearMovement: IMovementArr = [0, 0, 0, 0, 1, 2, 2, 0];
      const rainMovement: IMovementArr = [0, 0, 0, 0, 1, 2, 2, 0];
      const snowMovement: IMovementArr = [0, 0, 0, 0, 2, 2, 2, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      index === ETerrain.NEUTRALCITY ||
      (index < ETerrain.VPIPE && (index - ETerrain.ORANGESTARCITY) % 5 === 0) ||
      index === ETerrain.AMBERBLAZECITY ||
      index === ETerrain.JADESUNCITY ||
      (index >= ETerrain.COBALTICECITY &&
        index < ETerrain.TELEPORTER &&
        (index - ETerrain.COBALTICECITY) % 7 === 0)
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      index === ETerrain.NEUTRALBASE ||
      (index < ETerrain.VPIPE && (index - ETerrain.ORANGESTARBASE) % 5 === 0) ||
      index === ETerrain.AMBERBLAZEBASE ||
      index === ETerrain.JADESUNBASE ||
      (index >= ETerrain.COBALTICEBASE &&
        index < ETerrain.TELEPORTER &&
        (index - ETerrain.COBALTICEBASE) % 7 === 0)
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 1];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 1];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 1];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      index === ETerrain.NEUTRALAIRPORT ||
      (index < ETerrain.VPIPE &&
        (index - ETerrain.ORANGESTARAIRPORT) % 5 === 0) ||
      index === ETerrain.AMBERBLAZEAIRPORT ||
      index === ETerrain.JADESUNAIRPORT ||
      (index >= ETerrain.COBALTICEAIRPORT &&
        index < ETerrain.TELEPORTER &&
        (index - ETerrain.COBALTICEAIRPORT) % 7 === 0)
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      index === ETerrain.NEUTRALPORT ||
      (index < ETerrain.VPIPE && (index - ETerrain.ORANGESTARPORT) % 5 === 0) ||
      index === ETerrain.AMBERBLAZEPORT ||
      index === ETerrain.JADESUNPORT ||
      (index >= ETerrain.COBALTICEPORT &&
        index < ETerrain.TELEPORTER &&
        (index - ETerrain.COBALTICEPORT) % 7 === 0)
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 1, 1, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 1, 1, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 2, 2, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      (index < ETerrain.VPIPE && (index - ETerrain.ORANGESTARHQ) % 5 === 0) ||
      index === ETerrain.AMBERBLAZEHQ ||
      index === ETerrain.JADESUNHQ ||
      (index >= ETerrain.COBALTICEHQ &&
        index < ETerrain.TELEPORTER &&
        (index - ETerrain.COBALTICEHQ) % 7 === 0)
    ) {
      metadata.defense = 4;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND) ||
      index === ETerrain.HPIPESEAM ||
      index === ETerrain.VPIPESEAM
    ) {
      const clearMovement: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 1];
      const rainMovement: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 1];
      const snowMovement: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 1];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      index === ETerrain.MISSILESILO ||
      index === ETerrain.MISSILESILOEMPTY
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      (index >= ETerrain.AMBERBLAZECOMTOWER &&
        index <= ETerrain.GREYSKYCOMTOWER) ||
      (index - ETerrain.COBALTICECOMTOWER) % 7 === 0
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    } else if (
      (index >= ETerrain.AMBERBLAZELAB && index <= ETerrain.YELLOWCOMETLAB) ||
      (index - ETerrain.COBALTICELAB) % 7 === 0
    ) {
      metadata.defense = 3;
      const clearMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const rainMovement: IMovementArr = [1, 1, 1, 1, 1, 0, 0, 0];
      const snowMovement: IMovementArr = [1, 1, 1, 1, 2, 0, 0, 0];
      metadata.movement = [clearMovement, rainMovement, snowMovement];
    }
    return metadata;
  }

  constructor({ index, x, y }: ITerrainArgs) {
    super();
    this.spriteIdx = index;
    this.x = x;
    this.y = y;
  }
}
