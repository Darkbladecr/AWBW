import Engine from "./Engine";
import { State } from "./State";

class Game {
  state: State;
  debug = true;

  engine!: Engine;

  constructor(id: string, width: number, height: number) {
    const root = document.getElementById(id);
    if (!root) {
      throw new Error(`#${id} not found on page`);
    }
    this.state = new State({ players: [], width, height, root });
  }

  /**
   * load all assets asynchronously and assign to this.assets
   */
  async init() {
    this.engine = await new Engine(this.state).init();

    return this;
  }
}

export default Game;
