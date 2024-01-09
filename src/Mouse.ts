import { EKeyboardKey } from "./Keyboard";
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

  private _coordToGridCheck() {
    this.gridX = Math.floor(this.x / this.state.grid);
    this.gridY = Math.floor(this.y / this.state.grid);

    if (
      this.gridX < this.state.width &&
      this.gridY < this.state.height &&
      (this.gridX !== this.prev.gridX || this.gridY !== this.prev.gridY)
    ) {
      return true;
    }
    return false;
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
    return this._coordToGridCheck();
  }

  handleArrowKeys(e: KeyboardEvent) {
    this.prev = {
      gridX: this.gridX,
      gridY: this.gridY,
    };

    if (e.keyCode === EKeyboardKey.LEFT) {
      this.x = Math.min(this.x - this.state.grid);
    } else if (e.keyCode === EKeyboardKey.UP) {
      this.y = Math.min(0, this.y - this.state.grid);
    } else if (e.keyCode === EKeyboardKey.RIGHT) {
      this.x = this.x + this.state.grid;
    } else if (e.keyCode === EKeyboardKey.DOWN) {
      this.y = this.y + this.state.grid;
    }
    return this._coordToGridCheck();
  }

  toString() {
    return State.mapKey(this.gridX, this.gridY);
  }
}
