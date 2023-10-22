import { IAssets } from "../gameMap";
import { ECountry, getUnitCode, unitNames } from "../sprites";
import Sprite from "./Sprite";
import { EUnit, IUnitMetadata, unitMetadata } from "./types";

// const landEUnits = [1, 2, 3, 11, 13, 14, 15, 16, 17, 18, 19, 20, 24];
// const airEUnits = [4, 6, 7, 10, 21, 23];
// const seaEUnits = [5, 8, 9, 12, 22];

export default class Unit extends Sprite {
  spriteIdx: number;
  country: ECountry;
  unit: EUnit;
  name: string;
  hp: number;
  ammo: number;
  fuel: number;
  turnFuel = 0;
  x: number;
  y: number;

  constructor(
    country: ECountry,
    unit: EUnit,
    x: number,
    y: number,
    hp?: number,
    ammo?: number,
    fuel?: number
  ) {
    super();
    this.country = country;
    this.unit = unit;
    this.name = unitNames[unit - 1];
    this.spriteIdx = getUnitCode(country, unit);
    this.x = x;
    this.y = y;
    this.hp = hp ?? 10;
    this.ammo = ammo ?? 99;
    this.fuel = fuel ?? 99;
  }

  get metadata(): IUnitMetadata {
    return unitMetadata[this.spriteIdx - 1];
  }
}
