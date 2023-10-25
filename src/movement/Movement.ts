import { ELayer, State } from "../State";
import { Building, ITerrainMetadata, Terrain, Unit } from "../models";
import { ECountry, IMapLayer } from "../models/types";
import { EWeather } from "../weather";

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

export type IMovementWeatherArr = Record<EWeather, IMovementArr>;
export type IMovementArr = Record<EMovementType, number>;

export interface IMovementArgs {
  terrain: IMapLayer<Terrain>;
  buildings: IMapLayer<Building>;
  units: IMapLayer<Unit>;
  countryTurn: ECountry;
}

export class Movement {
  state: State;
  terrainMap: ITerrainMetadata[][];
  movementCost: IMovementWeatherArr[][];

  static createGrid<T>(x: number, y: number, defaultValue: any) {
    return Array.from({ length: y }, () =>
      Array.from({ length: x }).fill(defaultValue)
    ) as T[][];
  }

  constructor(state: State) {
    this.state = state;

    const { width, height, players, playerIdxTurn } = this.state;

    this.terrainMap = Movement.createGrid<ITerrainMetadata>(
      width,
      height,
      null
    );
    this.movementCost = Movement.createGrid<IMovementWeatherArr>(
      width,
      height,
      Array.from({ length: 3 }, () => Array.from({ length: 8 }).fill(0))
    );

    if (height < 1 || width < 1) {
      return;
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const terrain = this.state.layers[ELayer.STATIC].sprites[y][x];
        const building = this.state.layers[ELayer.DYNAMIC].sprites[y][x];
        if (terrain) {
          this.terrainMap[y][x] = Terrain.metadata(terrain.spriteIdx);
        } else if (building) {
          this.terrainMap[y][x] = Building.metadata(building.spriteIdx);
        }

        const unit = this.state.layers[ELayer.UNITS].sprites[y][x];
        if (unit && unit.country !== players[playerIdxTurn].country) {
          this.movementCost[y][x] = [
            Movement.nullArr,
            Movement.nullArr,
            Movement.nullArr,
          ];
        } else {
          this.movementCost[y][x] = this.terrainMap[y][x].movement;
        }
      }
    }
  }

  static nullArr: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 0];
}
