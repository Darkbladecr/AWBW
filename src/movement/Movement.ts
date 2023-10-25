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

interface IDistanceNode {
  x: number;
  y: number;
  totalCost: number;
  neighbors: IDistanceNode[];
}

export class Movement {
  state: State;
  terrainMap: ITerrainMetadata[][];
  movementCost: IMovementWeatherArr[][];

  static nullArr: IMovementArr = [0, 0, 0, 0, 0, 0, 0, 0];

  static createGrid<T>(x: number, y: number, defaultValue: any) {
    return Array.from({ length: y }, () =>
      Array.from({ length: x }).fill(defaultValue)
    ) as T[][];
  }

  static directionVectors: [number, number][] = [
    [0, -1], // UP
    [0, 1], // RIGHT
    [1, 0], // DOWN
    [0, -1], // LEFT
  ];

  static *distanceGraphIterator(
    distanceGraph: IDistanceNode
  ): Generator<{ x: number; y: number }> {
    yield { x: distanceGraph.x, y: distanceGraph.y };
    for (const node of distanceGraph.neighbors) {
      yield* Movement.distanceGraphIterator(node);
    }
  }

  static step(
    distanceNode: IDistanceNode,
    mp: number,
    fuel: number,
    movementCostGrid: number[][]
  ) {
    const { x, y, totalCost } = distanceNode;
    movementCostGrid[y][x] = 0; // set current grid as seen

    for (const [x1, y1] of Movement.directionVectors) {
      let nextGrid: number;
      try {
        nextGrid = movementCostGrid[y + y1][x + x1];
      } catch (e) {
        continue;
      }
      if (
        nextGrid &&
        totalCost + nextGrid <= mp &&
        totalCost + nextGrid <= fuel
      ) {
        distanceNode.neighbors.push({
          x: x + x1,
          y: y + y1,
          totalCost: totalCost + nextGrid,
          neighbors: [],
        });
        Movement.step(
          distanceNode.neighbors[distanceNode.neighbors.length - 1],
          mp,
          fuel,
          movementCostGrid
        );
      }
    }
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

    if (players.length === 0) {
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
        } else {
          throw new Error("Map is incomplete for Movement init");
        }

        // TODO: breaks if you want to see movement of the other team's units
        const unit = this.state.layers[ELayer.UNITS].sprites[y][x];
        if (unit && unit.countryIdx !== players[playerIdxTurn].country) {
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

  availableMovement(unit: Unit) {
    const { fuel } = unit;
    const { movementType, mp } = Unit.metadata[unit.unitIdx];
    const { width, height, weather } = this.state;
    const movementCostGrid = Movement.createGrid<number>(width, height, 0);

    for (const { x, y } of State.gridIterator(1, width, height)) {
      const terrainMetadata = this.terrainMap[y][x];
      movementCostGrid[y][x] = terrainMetadata.movement[weather][movementType];
    }

    const distanceGraph: IDistanceNode = {
      x: unit.x,
      y: unit.y,
      totalCost: 0,
      neighbors: [],
    };
    Movement.step(distanceGraph, mp, fuel, movementCostGrid);

    const movementAvailableArr: { x: number; y: number }[] = [];
    for (const coordinates of Movement.distanceGraphIterator(distanceGraph)) {
      movementAvailableArr.push(coordinates);
    }
    return movementAvailableArr;
  }
}
