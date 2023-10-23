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

export type movementArr = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];
