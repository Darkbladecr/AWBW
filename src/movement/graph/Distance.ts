import { Graph, IGraphArgs } from "./Graph";
import { Movement } from "../Movement";
import { Grid } from "../Grid";

interface ICreateMovementGraph {
  x: number;
  y: number;
  mp: number;
  fuel: number;
  costGrid: Grid;
}

export class DistanceGraph extends Graph {
  static create({ x, y, mp, fuel, costGrid }: ICreateMovementGraph) {
    costGrid.init();
    const graph = new DistanceGraph({ x, y });
    costGrid.grid[y][x].weight = 0; // set current grid as seen
    DistanceGraph.moveStep(graph, costGrid, mp, fuel);
    return graph;
  }

  static moveStep(
    node: DistanceGraph,
    costGrid: Grid,
    mp: number,
    fuel: number
  ) {
    for (const [x1, y1] of Movement.directionVectors) {
      const x2 = node.x + x1;
      const y2 = node.y + y1;
      if (!costGrid.grid[y2] || !costGrid.grid[y2][x2]) {
        continue;
      }
      const nextNode = costGrid.grid[y2][x2];
      if (
        nextNode.weight !== 0 &&
        node.totalCost + nextNode.weight <= mp &&
        node.totalCost + nextNode.weight <= fuel
      ) {
        node.children.push(
          new DistanceGraph({
            x: x2,
            y: y2,
            totalCost: node.totalCost + nextNode.weight,
          })
        );
        DistanceGraph.moveStep(
          node.children[node.children.length - 1],
          costGrid,
          mp,
          fuel
        );
      }
    }
  }

  constructor(args: IGraphArgs) {
    super(args);
  }
}
