export class GridNode {
  x: number;
  y: number;
  weight: number;

  f = 0;
  g = 0;
  h = 0;
  visited = false;
  closed = false;
  parent: GridNode | null = null;

  constructor(x: number, y: number, weight: number) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  getCost(fromNeighbor: GridNode) {
    if (
      fromNeighbor &&
      fromNeighbor.x !== this.x &&
      fromNeighbor.y !== this.y
    ) {
      return this.weight * 1.41421;
    }
    return this.weight;
  }
  get impassible() {
    return this.weight === 0;
  }

  clean() {
    this.f = 0;
    this.g = 0;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }

  toString() {
    return `(${this.x},${this.y})`;
  }

  pathTo() {
    let curr: GridNode = this;
    const path: GridNode[] = [];
    while (curr.parent) {
      path.unshift(curr);
      curr = curr.parent;
    }
    return path;
  }
}
