import { ELayer, State } from "../State";
import { Building, ITerrainMetadata, Terrain, Unit } from "../models";
import { ECountry, IMapLayer } from "../models/types";
import { EWeather } from "../weather";
import { Grid } from "./Grid";
import { DistanceGraph } from "./graph/Distance";
import { RangeGraph } from "./graph/Range";

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
  movementMap: Map<string, DistanceGraph> = new Map();
  costGrid: Grid | null = null;
  unitCostGrid: Grid | null = null;
  startPos: [number, number] = [0, 0];

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

  static manhattanDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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

  private _createCostGrid(movementType: EMovementType) {
    const costGrid = this.movementCost.map((rows) =>
      rows.map((cols) => cols[this.state.weather][movementType])
    );
    return new Grid(costGrid);
  }

  private _countryCostGrid(countryIdx: ECountry) {
    if (!this.costGrid) {
      throw new Error("costGrid not initialized");
    }
    const { width, height, layers } = this.state;
    const clone = new Grid(
      this.costGrid.grid.map((y) => y.map((x) => x.weight))
    );
    // check for blocking units
    for (const { x, y } of State.gridIterator(1, width, height)) {
      const otherUnit = layers[ELayer.UNITS].sprites[y][x];
      if (otherUnit && otherUnit.countryIdx !== countryIdx) {
        clone.grid[y][x].weight = 0;
      }
    }
    return clone;
  }

  availableMovement(unit: Unit) {
    const { fuel } = unit;
    const { mp, movementType } = Unit.metadata[unit.unitIdx];

    if (!this.costGrid) {
      // cache for multiple clicks on same unit
      this.costGrid = this._createCostGrid(movementType);
    }
    this.unitCostGrid = this._countryCostGrid(unit.countryIdx);
    this.startPos = [unit.x, unit.y];

    const graph = DistanceGraph.create({
      x: unit.x,
      y: unit.y,
      mp,
      fuel,
      costGrid: this.unitCostGrid,
    });

    for (const node of graph.iter()) {
      if (node.totalCost > 0) {
        this.movementMap.set(`${node}`, node);
      }
    }
    return this.movementMap;
  }

  availableRange(unit: Unit) {
    const [minRange, maxRange] = Unit.metadata[unit.unitIdx].range;
    const graph = RangeGraph.create({
      x: unit.x,
      y: unit.y,
      minRange,
      maxRange,
      width: this.state.width,
      height: this.state.height,
    });
    const availableRangeArr: { x: number; y: number }[] = [];
    for (const coord of graph.iter()) {
      if (coord.totalCost > 0) {
        availableRangeArr.push({ x: coord.x, y: coord.y });
      }
    }
    return availableRangeArr;
  }
}
