import { IMapLayer } from "../RenderEngine";
import { Building } from "../models/Building";
import { ITerrainMetadata, Terrain } from "../models/Terrain";
import { Unit } from "../models/Unit";
import { EWeather } from "../weather";

export const NULL_MOVEMENT: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 0];

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

export type IMovementArr = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export interface IMovementArgs {
  terrain: IMapLayer<Terrain>;
  buildings: IMapLayer<Building>;
  units: IMapLayer<Unit>;
}

export class Movement {
  weather = EWeather.CLEAR;
  terrainMap: ITerrainMetadata[][];
  movementCost: [IMovementArr, IMovementArr, IMovementArr][][];

  constructor({ terrain, buildings, units }: IMovementArgs) {
    const height = terrain.sprites.length;
    const width = terrain.sprites[0]?.length ?? 0;

    this.terrainMap = Array.from({ length: height }, () =>
      Array.from({ length: width }).fill(0)
    ) as ITerrainMetadata[][];
    this.movementCost = Array.from({ length: height }, () =>
      Array.from({ length: width }, () =>
        Array.from({ length: 3 }, () => Array.from({ length: 8 }).fill(0))
      )
    ) as [IMovementArr, IMovementArr, IMovementArr][][];

    if (height > 0 && width > 0) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const terrainItem = terrain.sprites[y][x];
          const buildingItem = buildings.sprites[y][x];
          if (terrainItem) {
            this.terrainMap[y][x] = terrainItem.metadata;
          } else if (buildingItem) {
            this.terrainMap[y][x] = buildingItem.metadata;
          }

          // TODO: figure out mapping based on unit army
          const unitItem = units.sprites[y][x];
          if (unitItem) {
            this.movementCost[y][x] = [
              NULL_MOVEMENT,
              NULL_MOVEMENT,
              NULL_MOVEMENT,
            ];
          } else {
            this.movementCost[y][x] = this.terrainMap[y][x].movement;
          }
        }
      }
    }
  }
}