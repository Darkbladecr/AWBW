import { State } from "../State";
import { GridNode } from "./GridNode";
import { Movement } from "./Movement";

export class Grid {
  nodes: GridNode[] = [];
  grid: GridNode[][];
  dirtyNodes: GridNode[] = [];

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
    this.dirtyNodes = [];
    for (let i = 0, il = this.nodes.length; i < il; i++) {
      this.nodes[i].clean();
    }
  }

  cleanDirty() {
    for (let i = 0, il = this.dirtyNodes.length; i < il; i++) {
      this.dirtyNodes[i].clean();
    }
    this.dirtyNodes = [];
  }

  markDirty(node: GridNode) {
    this.dirtyNodes.push(node);
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
