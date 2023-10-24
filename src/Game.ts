import RenderEngine from "./RenderEngine";

class Game {
  id: string;
  // grid width & height
  width: number;
  height: number;
  // map: MapLayers[][];
  debug = true;

  // keep canvases in separate layers for efficient updates

  rootElement: HTMLElement;
  engine!: RenderEngine;

  constructor(id: string, width: number, height: number) {
    this.id = id;
    this.width = width;
    this.height = height;

    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`#${id} not found on page`);
    }
    this.rootElement = el;
    // this.map = Array.from({ length: this.height }, () =>
    //   Array.from({ length: this.width }, () => [0, null, null])
    // );
  }

  /**
   * load all assets asynchronously and assign to this.assets
   */
  async init() {
    this.engine = await new RenderEngine(
      this.rootElement,
      this.width,
      this.height
    ).init();

    return this;
  }

  /**
   * Take a map string or JS array and assign assets to the respective layers
   */
  importMap(map: number[][] | string) {
    if (typeof map === "string") {
      map = map.split("\n").map((x) => x.split(",").map((y) => parseInt(y)));
    }

    this.height = map.length;
    this.width = map[0].length;

    this.engine.setupCanvas(this.width, this.height);

    for (const { x, y } of this.engine.gridIterator({ layers: 1 })) {
      const index = map[y][x];
      this.engine.insertTerrain({ index, x, y, rerender: false });
    }
    this.engine.render();
    console.log(this.engine.movement);
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
