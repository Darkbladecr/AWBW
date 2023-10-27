import { Movement } from "../Movement";
import { Graph, IGraphArgs } from "./Graph";

interface ICreateRangeGraph {
  x: number;
  y: number;
  minRange: number;
  maxRange: number;
  width: number;
  height: number;
}

export class RangeGraph extends Graph {
  static create({
    x,
    y,
    minRange,
    maxRange,
    width,
    height,
  }: ICreateRangeGraph) {
    const graph = new RangeGraph({ x, y });
    const rangeGrid = Movement.createGrid<boolean>(width, height, true);
    rangeGrid[y][x] = false; // set unit grid as false
    RangeGraph.rangeStep(graph, x, y, minRange, maxRange, rangeGrid);
    return graph;
  }

  constructor(args: IGraphArgs) {
    super(args);
  }

  static rangeStep(
    node: RangeGraph,
    startX: number,
    startY: number,
    minRange: number,
    maxRange: number,
    rangeGrid: boolean[][]
  ) {
    const { x, y } = node;
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
        node.children.push(
          new RangeGraph({
            x: x2,
            y: y2,
            parent: node,
            totalCost: distance >= minRange ? 1 : 0,
          })
        );
        RangeGraph.rangeStep(
          node.children[node.children.length - 1],
          startX,
          startY,
          minRange,
          maxRange,
          rangeGrid
        );
      }
    }
  }
}
