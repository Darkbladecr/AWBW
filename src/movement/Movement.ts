import { ELayer, State } from "../State";
import { Building, ITerrainMetadata, Terrain, Unit } from "../models";
import { ECountry, IMapLayer } from "../models/types";
import { EWeather } from "../weather";
import { Grid } from "./Grid";
import { GridNode } from "./GridNode";
import { BinaryHeap } from "./graph/BinaryHeap";
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

  static AStar(
    grid: Grid,
    startPos: [number, number],
    endPos: [number, number]
  ): GridNode[] {
    grid.cleanDirty();

    const start = grid.grid[startPos[1]][startPos[0]];
    const end = grid.grid[endPos[1]][endPos[0]];

    start.h = Movement.manhattanDistance(start.x, start.y, end.x, end.y);
    grid.markDirty(start);

    const heap = new BinaryHeap<GridNode>((node: GridNode) => node.f);
    heap.push(start);

    while (heap.size > 0) {
      const currentNode = heap.pop();
      // End case -- result has been found, return the traced path
      if (currentNode === end) {
        return currentNode.pathTo();
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors
      currentNode.closed = true;
      const neighbors = grid.neighbors(currentNode);

      for (let i = 0, il = neighbors.length; i < il; i++) {
        const neighbor = neighbors[i];
        if (neighbor.closed || neighbor.impassible) {
          // not a valid node, so skip to next neighbor
          continue;
        }

        // The g score is the shortest distance from start to currentNode.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        const gScore = currentNode.g + neighbor.getCost(currentNode);
        const isVisted = neighbor.visited;

        if (!isVisted || gScore < neighbor.g) {
          // Node not visited so process or found a more optimal path to this node, so take a score.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h =
            neighbor.h ||
            Movement.manhattanDistance(neighbor.x, neighbor.y, end.x, end.y);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          grid.markDirty(neighbor);

          if (!isVisted) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            heap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            heap.rescore(neighbor);
          }
        }
      }
    }
    // No result was found - empty array signifies failure to find path.
    return [];
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

  createCostGrid(movementType: EMovementType) {
    const costGrid = this.movementCost.map((rows) =>
      rows.map((cols) => cols[this.state.weather][movementType])
    );
    return new Grid(costGrid);
  }

  countryCostGrid(countryIdx: ECountry) {
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
      this.costGrid = this.createCostGrid(movementType);
    }
    this.unitCostGrid = this.countryCostGrid(unit.countryIdx);
    this.startPos = [unit.x, unit.y];

    const graph = DistanceGraph.create({
      x: unit.x,
      y: unit.y,
      mp,
      fuel,
      costGrid: this.unitCostGrid,
    });

    for (const node of graph.iter()) {
      if (node.totalCost === 0) {
        continue;
      }
      this.movementMap.set(`${node}`, node);
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
      if (coord.totalCost === 0) {
        continue;
      }
      availableRangeArr.push({ x: coord.x, y: coord.y });
    }
    return availableRangeArr;
  }
}
