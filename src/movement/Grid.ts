import { State } from "../State";
import { GridNode } from "./GridNode";
import { Movement } from "./Movement";
import { BinaryHeap } from "./graph/BinaryHeap";

export class Grid {
  nodes: GridNode[] = [];
  grid: GridNode[][];
  dirtyNodes: GridNode[] = [];

  static aStar(
    grid: Grid,
    startPos: [number, number],
    endPos: [number, number]
  ): GridNode[] {
    const start = grid.grid[startPos[1]][startPos[0]];
    const end = grid.grid[endPos[1]][endPos[0]];

    start.h = Movement.manhattanDistance(start.x, start.y, end.x, end.y);

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

  constructor(costGrid: number[][]) {
    this.grid = Movement.createGrid<GridNode>(
      costGrid[0].length,
      costGrid.length,
      null
    );

    for (const { x, y } of State.gridIterator(
      1,
      costGrid[0].length,
      costGrid.length
    )) {
      const node = new GridNode(x, y, costGrid[y][x]);
      this.grid[y][x] = node;
      this.nodes.push(node);
    }
  }

  init() {
    for (let i = 0, il = this.nodes.length; i < il; i++) {
      this.nodes[i].clean();
    }
  }

  neighbors(node: GridNode) {
    const res: GridNode[] = [];
    const x = node.x;
    const y = node.y;
    for (const [x1, y1] of Movement.directionVectors) {
      const x2 = x + x1;
      const y2 = y + y1;
      if (this.grid[y2] && this.grid[y2][x2]) {
        res.push(this.grid[y2][x2]);
      }
    }
    return res;
  }
}
