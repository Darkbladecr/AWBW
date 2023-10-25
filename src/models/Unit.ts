import { ELayer } from "../RenderEngine";
import { EMovementType } from "../movement/Movement";
import { unitFilenames } from "./files";
import { Sprite } from "./Sprite";
import { ECountry } from "./types";
import { EDecal, IDecalArgs } from "./Decal";

export enum EUnit {
  ANTIAIR,
  APC,
  ARTILLERY,
  BCOPTER,
  BATTLESHIP,
  BLACKBOAT,
  BLACKBOMB,
  BOMBER,
  CARRIER,
  CRUISER,
  FIGHTER,
  INFANTRY,
  LANDER,
  MDTANK,
  MECH,
  MEGATANK,
  MISSILE,
  NEOTANK,
  PIPERUNNER,
  RECON,
  ROCKET,
  STEALTH,
  SUB,
  TCOPTER,
  TANK,
}

export interface IUnitMetadata {
  name: string;
  mp: number;
  ammo: number;
  fuel: number;
  turnFuel: number;
  hiddenTurnFuel: number;
  vision: number;
  range: [number, number];
  movementType: EMovementType;
  givesResupply: boolean;
  storage: number;
  storageUnits: EUnit[];
  cost: number;
}

export interface IUnitArgs {
  insertDecal: (args: IDecalArgs) => void;
  countryIdx: ECountry;
  unitIdx: EUnit;
  x: number;
  y: number;
  hp?: number;
  ammo?: number;
  fuel?: number;
}

// const landEUnits = [1, 2, 3, 11, 13, 14, 15, 16, 17, 18, 19, 20, 24];
// const airEUnits = [4, 6, 7, 10, 21, 23];
// const seaEUnits = [5, 8, 9, 12, 22];

export class Unit extends Sprite {
  spriteIdx: number;
  layerId = ELayer.UNITS;
  country: ECountry;
  unit: EUnit;
  name: string;
  _hp!: number;
  _ammo!: number;
  _fuel!: number;
  turnFuel = 0;
  x: number;
  y: number;
  insertDecal: (args: IDecalArgs) => void;

  constructor({
    insertDecal,
    countryIdx,
    unitIdx,
    x,
    y,
    hp,
    ammo,
    fuel,
  }: IUnitArgs) {
    super();
    this.insertDecal = insertDecal;
    this.country = countryIdx;
    this.unit = unitIdx;
    this.name = unitFilenames[unitIdx - 1];
    this.spriteIdx = Unit.getUnitCode(countryIdx, unitIdx);
    this.x = x;
    this.y = y;
    this.hp = hp ?? 10;
    this.ammo = ammo ?? 99;
    this.fuel = fuel ?? 99;
  }

  static metadata: IUnitMetadata[] = [
    {
      name: "Anti-Air",
      mp: 6,
      ammo: 9,
      fuel: 60,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 8000,
    },
    {
      name: "APC",
      mp: 6,
      ammo: 0,
      fuel: 70,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: true,
      storage: 1,
      storageUnits: [EUnit.INFANTRY, EUnit.MECH],
      cost: 5000,
    },
    {
      name: "Artillery",
      mp: 5,
      ammo: 9,
      fuel: 50,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [2, 3],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 6000,
    },
    {
      name: "B-Copter",
      mp: 6,
      ammo: 6,
      fuel: 99,
      turnFuel: 2,
      hiddenTurnFuel: 0,
      vision: 3,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 9000,
    },
    {
      name: "Battleship",
      mp: 5,
      ammo: 9,
      fuel: 99,
      turnFuel: 1,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [2, 6],
      movementType: EMovementType.SEA,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 28000,
    },
    {
      name: "Black Boat",
      mp: 7,
      ammo: 0,
      fuel: 60,
      turnFuel: 1,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.LANDER,
      givesResupply: true,
      storage: 2,
      storageUnits: [EUnit.INFANTRY, EUnit.MECH],
      cost: 7500,
    },
    {
      name: "Black Bomb",
      mp: 9,
      ammo: 0,
      fuel: 45,
      turnFuel: 5,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 25000,
    },
    {
      name: "Bomber",
      mp: 7,
      ammo: 9,
      fuel: 99,
      turnFuel: 5,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 22000,
    },
    {
      name: "Carrier",
      mp: 5,
      ammo: 9,
      fuel: 99,
      turnFuel: 1,
      hiddenTurnFuel: 0,
      vision: 4,
      range: [3, 8],
      movementType: EMovementType.SEA,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 30000,
    },
    {
      name: "Cruiser",
      mp: 6,
      ammo: 9,
      fuel: 99,
      turnFuel: 1,
      hiddenTurnFuel: 0,
      vision: 3,
      range: [0, 0],
      movementType: EMovementType.SEA,
      givesResupply: false,
      storage: 2,
      storageUnits: [EUnit.BCOPTER],
      cost: 18000,
    },
    {
      name: "Fighter",
      mp: 9,
      ammo: 9,
      fuel: 99,
      turnFuel: 5,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 20000,
    },
    {
      name: "Infantry",
      mp: 3,
      ammo: 0,
      fuel: 99,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.FOOT,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 1000,
    },
    {
      name: "Lander",
      mp: 6,
      ammo: 0,
      fuel: 99,
      turnFuel: 1,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.LANDER,
      givesResupply: false,
      storage: 2,
      storageUnits: [
        EUnit.ANTIAIR,
        EUnit.APC,
        EUnit.ARTILLERY,
        EUnit.INFANTRY,
        EUnit.MDTANK,
        EUnit.MECH,
        EUnit.MEGATANK,
        EUnit.MISSILE,
        EUnit.NEOTANK,
        EUnit.RECON,
        EUnit.ROCKET,
        EUnit.TANK,
      ],
      cost: 12000,
    },
    {
      name: "Md.Tank",
      mp: 5,
      ammo: 8,
      fuel: 50,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 16000,
    },
    {
      name: "Mech",
      mp: 2,
      ammo: 3,
      fuel: 70,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.BAZOOKA,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 3000,
    },
    {
      name: "Mega Tank",
      mp: 4,
      ammo: 3,
      fuel: 50,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 28000,
    },
    {
      name: "Missile",
      mp: 4,
      ammo: 6,
      fuel: 50,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 5,
      range: [3, 5],
      movementType: EMovementType.WHEELS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 12000,
    },
    {
      name: "Neotank",
      mp: 6,
      ammo: 9,
      fuel: 99,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 22000,
    },
    {
      name: "Piperunner",
      mp: 9,
      ammo: 9,
      fuel: 99,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 4,
      range: [2, 5],
      movementType: EMovementType.PIPE,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 20000,
    },
    {
      name: "Recon",
      mp: 8,
      ammo: 0,
      fuel: 80,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 5,
      range: [0, 0],
      movementType: EMovementType.WHEELS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 4000,
    },
    {
      name: "Rocket",
      mp: 5,
      ammo: 6,
      fuel: 50,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 1,
      range: [3, 5],
      movementType: EMovementType.WHEELS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 15000,
    },
    {
      name: "Stealth",
      mp: 6,
      ammo: 6,
      fuel: 60,
      turnFuel: 5,
      hiddenTurnFuel: 8,
      vision: 4,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 24000,
    },
    {
      name: "Sub",
      mp: 5,
      ammo: 6,
      fuel: 60,
      turnFuel: 1,
      hiddenTurnFuel: 5,
      vision: 5,
      range: [0, 0],
      movementType: EMovementType.SEA,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 20000,
    },
    {
      name: "T-Copter",
      mp: 6,
      ammo: 0,
      fuel: 99,
      turnFuel: 2,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [0, 0],
      movementType: EMovementType.AIR,
      givesResupply: false,
      storage: 1,
      storageUnits: [EUnit.INFANTRY, EUnit.MECH],
      cost: 5000,
    },
    {
      name: "Tank",
      mp: 6,
      ammo: 9,
      fuel: 70,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 3,
      range: [0, 0],
      movementType: EMovementType.TREADS,
      givesResupply: false,
      storage: 0,
      storageUnits: [],
      cost: 7000,
    },
  ];

  static getUnitCode(country: ECountry, unit: EUnit) {
    return unit + (country - 1) * unitFilenames.length;
  }

  get hp() {
    return this._hp;
  }
  set hp(hp: number) {
    this._hp = Math.min(0, hp);
    if (hp < 10) {
      this.insertDecal({ index: hp - 1, x: this.x, y: this.y });
    }
  }
  get ammo() {
    return this._ammo;
  }
  set ammo(ammo: number) {
    this._ammo = Math.min(0, ammo);
    if (ammo < 4) {
      this.insertDecal({ index: EDecal.AMMO, x: this.x, y: this.y });
    }
  }
  get fuel() {
    return this._fuel;
  }
  set fuel(fuel: number) {
    this._fuel = Math.min(0, fuel);
    if (fuel < 30) {
      this.insertDecal({ index: EDecal.FUEL, x: this.x, y: this.y });
    }
  }
  get metadata(): IUnitMetadata {
    return Unit.metadata[this.spriteIdx - 1];
  }
}
