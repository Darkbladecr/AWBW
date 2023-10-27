import { State } from "./State";

export class Mouse {
  state: State;
  x = 0;
  y = 0;
  gridX = 0;
  gridY = 0;
  prev = {
    gridX: 0,
    gridY: 0,
  };
  constructor(state: State) {
    this.state = state;
  }

  /**
   *
   * @returns boolean if to render cursor
   */
  handleMove(e: MouseEvent) {
    const x = Math.min(
      Math.max(0, e.offsetX - this.state.padding),
      this.state.width * this.state.grid
    );
    const y = Math.min(
      Math.max(0, e.offsetY - this.state.padding),
      this.state.height * this.state.grid
    );

    this.prev = {
      gridX: this.gridX,
      gridY: this.gridY,
    };

    this.x = x;
    this.y = y;
    this.gridX = Math.floor(x / this.state.grid);
    this.gridY = Math.floor(y / this.state.grid);

    if (
      this.gridX < this.state.width &&
      this.gridY < this.state.height &&
      (this.gridX !== this.prev.gridX || this.gridY !== this.prev.gridY)
    ) {
      return true;
    }
    return false;
  }
  toString() {
    return `${this.gridX},${this.gridY}`;
  }
}
