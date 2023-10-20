import { ECountry, ETerrain } from "../sprites";

export default class Building {
  spriteIdx: number;
  country: ECountry;
  capture = 20;
  // TODO: resupply metadata
  x: number;
  y: number;

  constructor(terrainIdx: ETerrain, x: number, y: number, capture?: number) {
    this.spriteIdx = terrainIdx;
    this.country = this._getCountry();
    this.x = x;
    this.y = y;
    this.capture ?? capture;
  }

  private _getCountry() {
    if (
      this.spriteIdx === ETerrain.NEUTRALLAB ||
      this.spriteIdx === ETerrain.NEUTRALCOMTOWER ||
      (this.spriteIdx >= ETerrain.NEUTRALCITY &&
        this.spriteIdx <= ETerrain.NEUTRALPORT)
    ) {
      return ECountry.NEUTRAL;
    } else if (
      this.spriteIdx === ETerrain.ORANGESTARLAB ||
      this.spriteIdx === ETerrain.ORANGESTARCOMTOWER ||
      (this.spriteIdx >= ETerrain.ORANGESTARCITY &&
        this.spriteIdx <= ETerrain.ORANGESTARHQ)
    ) {
      return ECountry.ORANGE_STAR;
    } else if (
      this.spriteIdx === ETerrain.BLUEMOONLAB ||
      this.spriteIdx === ETerrain.BLUEMOONCOMTOWER ||
      (this.spriteIdx >= ETerrain.BLUEMOONCITY &&
        this.spriteIdx <= ETerrain.BLUEMOONHQ)
    ) {
      return ECountry.BLUE_MOON;
    } else if (
      this.spriteIdx === ETerrain.GREENEARTHLAB ||
      this.spriteIdx === ETerrain.GREENEARTHCOMTOWER ||
      (this.spriteIdx >= ETerrain.GREENEARTHCITY &&
        this.spriteIdx <= ETerrain.GREENEARTHHQ)
    ) {
      return ECountry.GREEN_EARTH;
    } else if (
      this.spriteIdx === ETerrain.YELLOWCOMETLAB ||
      this.spriteIdx === ETerrain.YELLOWCOMETCOMTOWER ||
      (this.spriteIdx >= ETerrain.YELLOWCOMETCITY &&
        this.spriteIdx <= ETerrain.YELLOWCOMETHQ)
    ) {
      return ECountry.YELLOW_COMET;
    } else if (
      this.spriteIdx === ETerrain.REDFIRELAB ||
      this.spriteIdx === ETerrain.REDFIRECOMTOWER ||
      (this.spriteIdx >= ETerrain.REDFIRECITY &&
        this.spriteIdx <= ETerrain.REDFIREHQ)
    ) {
      return ECountry.RED_FIRE;
    } else if (
      this.spriteIdx === ETerrain.GREYSKYLAB ||
      this.spriteIdx === ETerrain.GREYSKYCOMTOWER ||
      (this.spriteIdx >= ETerrain.GREYSKYAIRPORT &&
        this.spriteIdx <= ETerrain.GREYSKYHQ)
    ) {
      return ECountry.GREY_SKY;
    } else if (
      this.spriteIdx === ETerrain.BLACKHOLELAB ||
      this.spriteIdx === ETerrain.BLACKHOLECOMTOWER ||
      (this.spriteIdx >= ETerrain.BLACKHOLECITY &&
        this.spriteIdx <= ETerrain.BLACKHOLEHQ)
    ) {
      return ECountry.BLACK_HOLE;
    } else if (
      this.spriteIdx === ETerrain.BROWNDESERTLAB ||
      this.spriteIdx === ETerrain.BROWNDESERTCOMTOWER ||
      (this.spriteIdx >= ETerrain.BROWNDESERTCITY &&
        this.spriteIdx <= ETerrain.BROWNDESERTHQ)
    ) {
      return ECountry.BROWN_DESERT;
    } else if (
      this.spriteIdx === ETerrain.AMBERBLAZELAB ||
      this.spriteIdx === ETerrain.AMBERBLAZECOMTOWER ||
      (this.spriteIdx >= ETerrain.AMBERBLAZEAIRPORT &&
        this.spriteIdx <= ETerrain.AMBERBLAZEPORT)
    ) {
      return ECountry.AMBER_BLAZE;
    } else if (
      this.spriteIdx === ETerrain.JADESUNLAB ||
      this.spriteIdx === ETerrain.JADESUNCOMTOWER ||
      (this.spriteIdx >= ETerrain.JADESUNAIRPORT &&
        this.spriteIdx <= ETerrain.JADESUNPORT)
    ) {
      return ECountry.JADE_SUN;
    } else if (
      this.spriteIdx >= ETerrain.COBALTICEAIRPORT &&
      this.spriteIdx <= ETerrain.COBALTICEPORT
    ) {
      return ECountry.COBALT_ICE;
    } else if (
      this.spriteIdx >= ETerrain.PINKCOSMOSAIRPORT &&
      this.spriteIdx <= ETerrain.PINKCOSMOSPORT
    ) {
      return ECountry.PINK_COSMOS;
    } else if (
      this.spriteIdx >= ETerrain.TEALGALAXYAIRPORT &&
      this.spriteIdx <= ETerrain.TEALGALAXYPORT
    ) {
      return ECountry.TEAL_GALAXY;
    } else if (
      this.spriteIdx >= ETerrain.PURPLELIGHTNINGAIRPORT &&
      this.spriteIdx <= ETerrain.PURPLELIGHTNINGPORT
    ) {
      return ECountry.PURPLE_LIGHTNING;
    } else if (
      this.spriteIdx >= ETerrain.ACIDRAINAIRPORT &&
      this.spriteIdx <= ETerrain.ACIDRAINPORT
    ) {
      return ECountry.ACID_RAIN;
    } else if (
      this.spriteIdx >= ETerrain.WHITENOVAAIRPORT &&
      this.spriteIdx <= ETerrain.WHITENOVAPORT
    ) {
      return ECountry.WHITE_NOVA;
    } else {
      return ECountry.NEUTRAL;
    }
  }
}
