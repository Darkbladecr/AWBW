import { IAssets } from "../gameMap";
import { ECountry, ETerrain } from "../sprites";
import Terrain from "./Terrain";

export default class Building extends Terrain {
  country: ECountry;
  capture = 20;
  // TODO: resupply metadata

  constructor(
    assets: IAssets["terrain"],
    terrainIdx: ETerrain,
    x: number,
    y: number,
    capture?: number
  ) {
    super(assets, terrainIdx, x, y);
    this.country = this._getCountry();
    this.capture ?? capture;
  }

  private _getCountry() {
    const id = super.spriteIdx;
    if (
      id === ETerrain.NEUTRALLAB ||
      id === ETerrain.NEUTRALCOMTOWER ||
      (id >= ETerrain.NEUTRALCITY && id <= ETerrain.NEUTRALPORT)
    ) {
      return ECountry.NEUTRAL;
    } else if (
      id === ETerrain.ORANGESTARLAB ||
      id === ETerrain.ORANGESTARCOMTOWER ||
      (id >= ETerrain.ORANGESTARCITY && id <= ETerrain.ORANGESTARHQ)
    ) {
      return ECountry.ORANGE_STAR;
    } else if (
      id === ETerrain.BLUEMOONLAB ||
      id === ETerrain.BLUEMOONCOMTOWER ||
      (id >= ETerrain.BLUEMOONCITY && id <= ETerrain.BLUEMOONHQ)
    ) {
      return ECountry.BLUE_MOON;
    } else if (
      id === ETerrain.GREENEARTHLAB ||
      id === ETerrain.GREENEARTHCOMTOWER ||
      (id >= ETerrain.GREENEARTHCITY && id <= ETerrain.GREENEARTHHQ)
    ) {
      return ECountry.GREEN_EARTH;
    } else if (
      id === ETerrain.YELLOWCOMETLAB ||
      id === ETerrain.YELLOWCOMETCOMTOWER ||
      (id >= ETerrain.YELLOWCOMETCITY && id <= ETerrain.YELLOWCOMETHQ)
    ) {
      return ECountry.YELLOW_COMET;
    } else if (
      id === ETerrain.REDFIRELAB ||
      id === ETerrain.REDFIRECOMTOWER ||
      (id >= ETerrain.REDFIRECITY && id <= ETerrain.REDFIREHQ)
    ) {
      return ECountry.RED_FIRE;
    } else if (
      id === ETerrain.GREYSKYLAB ||
      id === ETerrain.GREYSKYCOMTOWER ||
      (id >= ETerrain.GREYSKYAIRPORT && id <= ETerrain.GREYSKYHQ)
    ) {
      return ECountry.GREY_SKY;
    } else if (
      id === ETerrain.BLACKHOLELAB ||
      id === ETerrain.BLACKHOLECOMTOWER ||
      (id >= ETerrain.BLACKHOLECITY && id <= ETerrain.BLACKHOLEHQ)
    ) {
      return ECountry.BLACK_HOLE;
    } else if (
      id === ETerrain.BROWNDESERTLAB ||
      id === ETerrain.BROWNDESERTCOMTOWER ||
      (id >= ETerrain.BROWNDESERTCITY && id <= ETerrain.BROWNDESERTHQ)
    ) {
      return ECountry.BROWN_DESERT;
    } else if (
      id === ETerrain.AMBERBLAZELAB ||
      id === ETerrain.AMBERBLAZECOMTOWER ||
      (id >= ETerrain.AMBERBLAZEAIRPORT && id <= ETerrain.AMBERBLAZEPORT)
    ) {
      return ECountry.AMBER_BLAZE;
    } else if (
      id === ETerrain.JADESUNLAB ||
      id === ETerrain.JADESUNCOMTOWER ||
      (id >= ETerrain.JADESUNAIRPORT && id <= ETerrain.JADESUNPORT)
    ) {
      return ECountry.JADE_SUN;
    } else if (
      id >= ETerrain.COBALTICEAIRPORT &&
      id <= ETerrain.COBALTICEPORT
    ) {
      return ECountry.COBALT_ICE;
    } else if (
      id >= ETerrain.PINKCOSMOSAIRPORT &&
      id <= ETerrain.PINKCOSMOSPORT
    ) {
      return ECountry.PINK_COSMOS;
    } else if (
      id >= ETerrain.TEALGALAXYAIRPORT &&
      id <= ETerrain.TEALGALAXYPORT
    ) {
      return ECountry.TEAL_GALAXY;
    } else if (
      id >= ETerrain.PURPLELIGHTNINGAIRPORT &&
      id <= ETerrain.PURPLELIGHTNINGPORT
    ) {
      return ECountry.PURPLE_LIGHTNING;
    } else if (id >= ETerrain.ACIDRAINAIRPORT && id <= ETerrain.ACIDRAINPORT) {
      return ECountry.ACID_RAIN;
    } else if (
      id >= ETerrain.WHITENOVAAIRPORT &&
      id <= ETerrain.WHITENOVAPORT
    ) {
      return ECountry.WHITE_NOVA;
    } else {
      return ECountry.NEUTRAL;
    }
  }
}
