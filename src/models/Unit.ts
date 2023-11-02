import { ELayer, State } from "../State";
import { EMovementType } from "../movement/Movement";
import { unitFilenames } from "./files";
import { Sprite } from "./Sprite";
import { ECountry } from "./types";
import { EDecal, IDecalArgs } from "./Decal";
import { DistanceGraph } from "../movement/graph/Distance";
import Engine, { EHelperStyle } from "../Engine";

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
  state: State;
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
  countryIdx: ECountry;
  unitIdx: EUnit;
  name: string;
  _hp!: number;
  _ammo!: number;
  _fuel!: number;
  turnFuel = 0;

  _showMovement = false;
  private _availableMovement: Map<string, DistanceGraph> = new Map();
  showVision = false;
  _showAttack = false;
  exhausted = false;

  x: number;
  y: number;
  insertDecal: (args: IDecalArgs) => void;

  static metadata: IUnitMetadata[] = [
    {
      name: "Anti-Air",
      mp: 6,
      ammo: 9,
      fuel: 60,
      turnFuel: 0,
      hiddenTurnFuel: 0,
      vision: 2,
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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
      range: [1, 1],
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

  constructor({
    state,
    insertDecal,
    countryIdx,
    unitIdx,
    x,
    y,
    hp,
    ammo,
    fuel,
  }: IUnitArgs) {
    super(state);
    this.insertDecal = insertDecal;
    this.countryIdx = countryIdx;
    this.unitIdx = unitIdx;
    this.name = unitFilenames[unitIdx - 1];
    this.spriteIdx = Unit.getUnitCode(countryIdx, unitIdx);
    this.x = x;
    this.y = y;
    this.hp = typeof hp === "number" ? hp : 10;
    this.ammo = typeof ammo === "number" ? ammo : 9;
    this.fuel = typeof fuel === "number" ? fuel : 99;
  }

  get hp() {
    return this._hp;
  }
  set hp(hp: number) {
    this._hp = Math.max(0, hp);
    if (this._hp < 10) {
      this.insertDecal({
        index: hp - 1,
        x: this.x,
        y: this.y,
        state: this.state,
      });
    }
  }
  get ammo() {
    return this._ammo;
  }
  set ammo(ammo: number) {
    this._ammo = Math.max(0, ammo);
    if (this._ammo < 4) {
      this.insertDecal({
        index: EDecal.AMMO,
        x: this.x,
        y: this.y,
        state: this.state,
      });
    }
  }
  get fuel() {
    return this._fuel;
  }
  set fuel(fuel: number) {
    this._fuel = Math.max(0, fuel);
    if (this._fuel < 30) {
      this.insertDecal({
        index: EDecal.FUEL,
        x: this.x,
        y: this.y,
        state: this.state,
      });
    }
  }

  get showMovement() {
    return this._showMovement;
  }
  set showMovement(bool: boolean) {
    if (this._showMovement === bool) {
      return;
    }
    if (this._availableMovement.size === 0) {
      this._availableMovement = this.availableMovement();
    }
    for (const { x, y } of this._availableMovement.values()) {
      if (bool) {
        Engine.paintGrid({
          state: this.state,
          layer: ELayer.HELPERS,
          x,
          y,
          style: EHelperStyle.MOVEMENT,
        });
      } else {
        Engine.clearGrid({
          state: this.state,
          layer: ELayer.HELPERS,
          x,
          y,
        });
      }
    }
    if (!bool) {
      this._availableMovement.clear();
    }
    this._showMovement = bool;
  }

  get showAttack() {
    return this._showAttack;
  }
  set showAttack(bool: boolean) {
    if (this._showAttack === bool) {
      return;
    }
    this._showAttack = bool;
    for (const { x, y } of this.attackRange()) {
      if (bool) {
        Engine.paintGrid({
          state: this.state,
          layer: ELayer.HELPERS,
          x,
          y,
          style: EHelperStyle.ATTACK,
        });
      } else {
        Engine.clearGrid({
          state: this.state,
          layer: ELayer.HELPERS,
          x,
          y,
        });
      }
    }
  }

  clearHelpers() {
    this.showAttack = false;
    this.showMovement = false;
    this.showVision = false;
  }

  availableMovement() {
    if (this._showMovement && this._availableMovement.size > 0) {
      return this._availableMovement;
    }
    if (this.exhausted) {
      return new Map<string, DistanceGraph>();
    }
    return this.state.movement.availableMovement(this);
  }

  attackRange() {
    if (this.ammo === 0) {
      return [];
    }
    return this.state.movement.availableRange(this);
  }

  update() {
    if (
      this.state.layers[ELayer.UNITS].items.has(State.mapKey(this.x, this.y))
    ) {
      this.state.layers[ELayer.UNITS].items.set(
        State.mapKey(this.x, this.y),
        this
      );
    }
  }
}
