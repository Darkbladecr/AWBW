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

  private _debounce(func: Function, wait: number, immediate?: boolean) {
    let timeout = 0;
    const later = () => {
      timeout = 0;
      if (!immediate) {
        func();
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func();
    }
  }
}

export default Game;
