import { ELayer } from "../RenderEngine";
import { ETerrain, ITerrainArgs, Terrain } from "./Terrain";
import { ECountry } from "./types";

export interface IBuildingArgs extends ITerrainArgs {
  capture?: number;
}

export class Building extends Terrain {
  country: ECountry;
  capture = 20;
  layerId = ELayer.DYNAMIC;
  // TODO: resupply metadata

  constructor({ index, x, y, capture }: IBuildingArgs) {
    if (!Building.isDynamicTerrain(index)) {
      throw new Error(`Cannot create Building with terrainIdx: ${index}`);
    }
    super({ index, x, y });
    this.country = Building.getCountry(index);
    this.capture ?? capture;
  }

  static isDynamicTerrain(index: ETerrain) {
    return (
      index >= ETerrain.NEUTRALCITY ||
      (index < ETerrain.VPIPE && index > ETerrain.WPIPEEND)
    );
  }

  static getCountry(index: ETerrain) {
    if (
      index === ETerrain.NEUTRALLAB ||
      index === ETerrain.NEUTRALCOMTOWER ||
      (index >= ETerrain.NEUTRALCITY && index <= ETerrain.NEUTRALPORT)
    ) {
      return ECountry.NEUTRAL;
    } else if (
      index === ETerrain.ORANGESTARLAB ||
      index === ETerrain.ORANGESTARCOMTOWER ||
      (index >= ETerrain.ORANGESTARCITY && index <= ETerrain.ORANGESTARHQ)
    ) {
      return ECountry.ORANGE_STAR;
    } else if (
      index === ETerrain.BLUEMOONLAB ||
      index === ETerrain.BLUEMOONCOMTOWER ||
      (index >= ETerrain.BLUEMOONCITY && index <= ETerrain.BLUEMOONHQ)
    ) {
      return ECountry.BLUE_MOON;
    } else if (
      index === ETerrain.GREENEARTHLAB ||
      index === ETerrain.GREENEARTHCOMTOWER ||
      (index >= ETerrain.GREENEARTHCITY && index <= ETerrain.GREENEARTHHQ)
    ) {
      return ECountry.GREEN_EARTH;
    } else if (
      index === ETerrain.YELLOWCOMETLAB ||
      index === ETerrain.YELLOWCOMETCOMTOWER ||
      (index >= ETerrain.YELLOWCOMETCITY && index <= ETerrain.YELLOWCOMETHQ)
    ) {
      return ECountry.YELLOW_COMET;
    } else if (
      index === ETerrain.REDFIRELAB ||
      index === ETerrain.REDFIRECOMTOWER ||
      (index >= ETerrain.REDFIRECITY && index <= ETerrain.REDFIREHQ)
    ) {
      return ECountry.RED_FIRE;
    } else if (
      index === ETerrain.GREYSKYLAB ||
      index === ETerrain.GREYSKYCOMTOWER ||
      (index >= ETerrain.GREYSKYAIRPORT && index <= ETerrain.GREYSKYHQ)
    ) {
      return ECountry.GREY_SKY;
    } else if (
      index === ETerrain.BLACKHOLELAB ||
      index === ETerrain.BLACKHOLECOMTOWER ||
      (index >= ETerrain.BLACKHOLECITY && index <= ETerrain.BLACKHOLEHQ)
    ) {
      return ECountry.BLACK_HOLE;
    } else if (
      index === ETerrain.BROWNDESERTLAB ||
      index === ETerrain.BROWNDESERTCOMTOWER ||
      (index >= ETerrain.BROWNDESERTCITY && index <= ETerrain.BROWNDESERTHQ)
    ) {
      return ECountry.BROWN_DESERT;
    } else if (
      index === ETerrain.AMBERBLAZELAB ||
      index === ETerrain.AMBERBLAZECOMTOWER ||
      (index >= ETerrain.AMBERBLAZEAIRPORT && index <= ETerrain.AMBERBLAZEPORT)
    ) {
      return ECountry.AMBER_BLAZE;
    } else if (
      index === ETerrain.JADESUNLAB ||
      index === ETerrain.JADESUNCOMTOWER ||
      (index >= ETerrain.JADESUNAIRPORT && index <= ETerrain.JADESUNPORT)
    ) {
      return ECountry.JADE_SUN;
    } else if (
      index >= ETerrain.COBALTICEAIRPORT &&
      index <= ETerrain.COBALTICEPORT
    ) {
      return ECountry.COBALT_ICE;
    } else if (
      index >= ETerrain.PINKCOSMOSAIRPORT &&
      index <= ETerrain.PINKCOSMOSPORT
    ) {
      return ECountry.PINK_COSMOS;
    } else if (
      index >= ETerrain.TEALGALAXYAIRPORT &&
      index <= ETerrain.TEALGALAXYPORT
    ) {
      return ECountry.TEAL_GALAXY;
    } else if (
      index >= ETerrain.PURPLELIGHTNINGAIRPORT &&
      index <= ETerrain.PURPLELIGHTNINGPORT
    ) {
      return ECountry.PURPLE_LIGHTNING;
    } else if (
      index >= ETerrain.ACIDRAINAIRPORT &&
      index <= ETerrain.ACIDRAINPORT
    ) {
      return ECountry.ACID_RAIN;
    } else if (
      index >= ETerrain.WHITENOVAAIRPORT &&
      index <= ETerrain.WHITENOVAPORT
    ) {
      return ECountry.WHITE_NOVA;
    } else {
      return ECountry.NEUTRAL;
    }
  }
}
