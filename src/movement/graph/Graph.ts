export interface IGraphArgs {
  x: number;
  y: number;
  totalCost?: number;
}

export class Graph {
  x: number;
  y: number;
  totalCost = 0;
  children: Graph[] = [];

  constructor({ x, y, totalCost }: IGraphArgs) {
    this.x = x;
    this.y = y;
    this.totalCost = totalCost ?? 0;
  }

  *iter(): Generator<Graph> {
    yield this;
    for (const child of this.children) {
      yield* child.iter();
    }
  }

  toString() {
    return `${this.x},${this.y}`;
  }
}
