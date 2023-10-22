import { ParsedFrame } from "gifuct-js";
import { ETerrain, terrain } from "../sprites";

export enum EWeather {
  CLEAR,
  RAIN,
  SNOW,
}

export enum EMovementType {
  FOOT,
  BAZOOKA,
  TREADS,
  WHEELS,
  AIR,
  SEA,
  LANDER,
  PIPE,
}

export interface IMovementTypes {
  foot: number;
  bazooka: number;
  treads: number;
  wheels: number;
  air: number;
  sea: number;
  lander: number;
  pipe: number;
}

type movementArr = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export enum EMapStyle {
  AW1 = "aw1",
  AW2 = "aw2",
  ANIMATED = "ani",
}

export type SpriteMap = Record<EMapStyle, HTMLImageElement | undefined>;

export interface ISpriteMetadata {
  sprite: SpriteMap;
  frames: ParsedFrame[];
}

export interface ITerrainMetadata {
  name: string;
  spriteIdx: ETerrain;
  defense: number;
  movement: [movementArr, movementArr, movementArr];
}

export function getTerrainMetadata(index: ETerrain) {
  const nullMovement: movementArr = [0, 0, 0, 0, 0, 0, 0, 0];
  let terrainIdx = index;
  if (index > 81) {
    terrainIdx = terrainIdx - (81 - 57);
  }
  if (index > 181) {
    terrainIdx = terrainIdx - (181 - 176);
  }
  let metadata: ITerrainMetadata = {
    spriteIdx: index,
    name: terrain[terrainIdx],
    defense: 0,
    movement: [nullMovement, nullMovement, nullMovement],
  };
  if (
    index === ETerrain.PLAIN ||
    index === ETerrain.HPIPERUBBLE ||
    index === ETerrain.VPIPERUBBLE
  ) {
    metadata.defense = 1;
    const clearMovement: movementArr = [1, 1, 1, 2, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 2, 3, 1, 0, 0, 0];
    const snowMovement: movementArr = [2, 1, 2, 3, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index === ETerrain.MOUNTAIN) {
    metadata.defense = 4;
    const clearMovement: movementArr = [2, 1, 0, 0, 1, 0, 0, 0];
    const rainMovement: movementArr = [2, 1, 0, 0, 1, 0, 0, 0];
    const snowMovement: movementArr = [4, 2, 0, 0, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index === ETerrain.WOOD) {
    metadata.defense = 2;
    const clearMovement: movementArr = [1, 1, 2, 3, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 3, 4, 1, 0, 0, 0];
    const snowMovement: movementArr = [2, 1, 2, 3, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index >= ETerrain.HRIVER && index <= ETerrain.NESRIVER) {
    const clearMovement: movementArr = [2, 1, 0, 0, 1, 0, 0, 0];
    const rainMovement: movementArr = [2, 1, 0, 0, 1, 0, 0, 0];
    const snowMovement: movementArr = [2, 1, 0, 0, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index >= ETerrain.HROAD && index <= ETerrain.VBRIDGE) {
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index === ETerrain.SEA) {
    const clearMovement: movementArr = [0, 0, 0, 0, 1, 1, 1, 0];
    const rainMovement: movementArr = [0, 0, 0, 0, 1, 1, 1, 0];
    const snowMovement: movementArr = [0, 0, 0, 0, 2, 2, 2, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index >= ETerrain.HSHOAL && index <= ETerrain.VSHOALE) {
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 1, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 1, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 1, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (index === ETerrain.REEF) {
    metadata.defense = 1;
    const clearMovement: movementArr = [0, 0, 0, 0, 1, 2, 2, 0];
    const rainMovement: movementArr = [0, 0, 0, 0, 1, 2, 2, 0];
    const snowMovement: movementArr = [0, 0, 0, 0, 2, 2, 2, 0];
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
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
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
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 1];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 1];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 1];
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
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
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
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 1, 1, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 1, 1, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 2, 2, 0];
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
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (
    (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND) ||
    index === ETerrain.HPIPESEAM ||
    index === ETerrain.VPIPESEAM
  ) {
    const clearMovement: movementArr = [0, 0, 0, 0, 0, 0, 0, 1];
    const rainMovement: movementArr = [0, 0, 0, 0, 0, 0, 0, 1];
    const snowMovement: movementArr = [0, 0, 0, 0, 0, 0, 0, 1];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (
    index === ETerrain.MISSILESILO ||
    index === ETerrain.MISSILESILOEMPTY
  ) {
    metadata.defense = 3;
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (
    (index >= ETerrain.AMBERBLAZECOMTOWER &&
      index <= ETerrain.GREYSKYCOMTOWER) ||
    (index - ETerrain.COBALTICECOMTOWER) % 7 === 0
  ) {
    metadata.defense = 3;
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  } else if (
    (index >= ETerrain.AMBERBLAZELAB && index <= ETerrain.YELLOWCOMETLAB) ||
    (index - ETerrain.COBALTICELAB) % 7 === 0
  ) {
    metadata.defense = 3;
    const clearMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const rainMovement: movementArr = [1, 1, 1, 1, 1, 0, 0, 0];
    const snowMovement: movementArr = [1, 1, 1, 1, 2, 0, 0, 0];
    metadata.movement = [clearMovement, rainMovement, snowMovement];
  }
  return metadata;
}

export enum EUnit {
  ANTIAIR = 1,
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

export const unitMetadata: IUnitMetadata[] = [
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
