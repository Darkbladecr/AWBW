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
    [1, 0], // RIGHT
    [0, 1], // DOWN
    [-1, 0], // LEFT
  ];

  static allDirectionVectors: [number, number][] = [
    [0, -1], // UP
    [1, -1], // UP RIGHT
    [1, 0], // RIGHT
    [1, 1], // DOWN RIGHT
    [0, 1], // DOWN
    [-1, 1], // DOWN LEFT
    [-1, 0], // LEFT
    [-1, -1], // UP LEFT
  ];

  static *distanceGraphIterator(
    distanceGraph: IDistanceNode
  ): Generator<{ x: number; y: number; totalCost: number }> {
    yield {
      x: distanceGraph.x,
      y: distanceGraph.y,
      totalCost: distanceGraph.totalCost,
    };
    for (const node of distanceGraph.neighbors) {
      yield* Movement.distanceGraphIterator(node);
    }
  }

  static manhattanDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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

  static rangeStep(
    rangeNode: IDistanceNode,
    startX: number,
    startY: number,
    minRange: number,
    maxRange: number,
    rangeGrid: boolean[][]
  ) {
    const { x, y } = rangeNode;
    rangeGrid[y][x] = false;

    for (const [x1, y1] of Movement.directionVectors) {
      let nextGrid: boolean;
      const x2 = x + x1;
      const y2 = y + y1;
      try {
        nextGrid = rangeGrid[y2][x2];
      } catch (e) {
        continue;
      }
      const distance = Movement.manhattanDistance(startX, startY, x2, y2);
      if (nextGrid && distance <= maxRange) {
        rangeNode.neighbors.push({
          x: x2,
          y: y2,
          totalCost: distance >= minRange ? 1 : 0,
          neighbors: [],
        });
        Movement.rangeStep(
          rangeNode.neighbors[rangeNode.neighbors.length - 1],
          startX,
          startY,
          minRange,
          maxRange,
          rangeGrid
        );
      }
    }
  }

  constructor(state: State) {
    this.state = state;

    const { width, height, players } = this.state;

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
    for (const { x, y } of State.gridIterator(1, width, height)) {
      const terrain = this.state.layers[ELayer.STATIC].sprites[y][x];
      const building = this.state.layers[ELayer.DYNAMIC].sprites[y][x];
      if (terrain) {
        this.terrainMap[y][x] = Terrain.metadata(terrain.spriteIdx);
      } else if (building) {
        this.terrainMap[y][x] = Building.metadata(building.spriteIdx);
      } else {
        throw new Error("Map is incomplete for Movement init");
      }

      this.movementCost[y][x] = this.terrainMap[y][x].movement;
    }
  }

  availableMovement(unit: Unit) {
    const { fuel } = unit;
    const { movementType, mp } = Unit.metadata[unit.unitIdx];
    const { width, height, weather, layers } = this.state;
    const movementCostGrid = this.movementCost.map((rows) =>
      rows.map((cols) => cols[weather][movementType])
    );

    for (const { x, y } of State.gridIterator(1, width, height)) {
      const otherUnit = layers[ELayer.UNITS].sprites[y][x];
      if (otherUnit && otherUnit.countryIdx !== unit.countryIdx) {
        movementCostGrid[y][x] = 0;
      }
    }

    const distanceGraph: IDistanceNode = {
      x: unit.x,
      y: unit.y,
      totalCost: 0,
      neighbors: [],
    };
    Movement.step(distanceGraph, mp, fuel, movementCostGrid);

    const movementAvailableArr: { x: number; y: number }[] = [];
    for (const coord of Movement.distanceGraphIterator(distanceGraph)) {
      if (coord.totalCost === 0) {
        continue;
      }
      movementAvailableArr.push({ x: coord.x, y: coord.y });
    }
    return movementAvailableArr;
  }

  availableRange(unit: Unit) {
    const [minRange, maxRange] = Unit.metadata[unit.spriteIdx].range;
    const rangeGrid = Movement.createGrid<boolean>(
      this.state.width,
      this.state.height,
      true
    );
    const rangeGraph: IDistanceNode = {
      x: unit.x,
      y: unit.y,
      totalCost: 0,
      neighbors: [],
    };
    Movement.rangeStep(
      rangeGraph,
      unit.x,
      unit.y,
      minRange,
      maxRange,
      rangeGrid
    );
    const availableRangeArr: { x: number; y: number }[] = [];
    for (const coord of Movement.distanceGraphIterator(rangeGraph)) {
      if (coord.totalCost === 0) {
        continue;
      }
      availableRangeArr.push({ x: coord.x, y: coord.y });
    }
    return availableRangeArr;
  }
}
