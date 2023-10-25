import {
  Building,
  Decal,
  EDecal,
  EMapStyle,
  IBuildingArgs,
  IDecalArgs,
  IUnitArgs,
  SpriteType,
  Terrain,
  Unit,
} from "./models";
import Queue from "./utils/Queue";
import Assets, { SpriteMetadata } from "./Assets";
import { Movement } from "./movement/Movement";
import { ELayer, State } from "./State";

interface IRenderArgs {
  layers?: ELayer[];
  grid?: boolean;
}

interface IInsertTerrain extends IBuildingArgs {
  rerender?: boolean;
}

class Engine {
  state: State;

  requestedAnimationFrame: number | undefined;
  renderQueue = new Queue<SpriteType>();

  mouse = {
    x: 0,
    y: 0,
    gridX: 0,
    gridY: 0,
    prev: {
      gridX: 0,
      gridY: 0,
    },
  };

  assets!: Assets;
  movement!: Movement;

  private _style: EMapStyle = EMapStyle.ANIMATED;
  lastRender = 0;

  constructor(state: State) {
    this.state = state;

    this._setupEventListeners();
  }

  /**
   * load all assets asynchronously and assign to this.assets
   */
  async init() {
    this.assets = await new Assets().init();

    this.render();

    return this;
  }

  /**
   * Paint all assets onto the respective canvases and add items to
   * renderQueue if they have GIF animations
   */
  render(args?: IRenderArgs) {
    // const layersToRender = args?.layers ?? [];
    const grid = args?.grid ?? false;
    this.movement = new Movement(this.state);

    for (const { x, y, layerId } of State.gridIterator(
      this.state.layers.length,
      this.state.width,
      this.state.height
    )) {
      const item: SpriteType = this.state.layers[layerId].sprites[y][x];
      if (item) {
        this.renderQueue.enqueue(item);
      }
    }
    this._animate(0);

    if (grid || this.state.debug) {
      this._drawGrid();
    }
  }

  /**
   * reset animation queue and map
   */
  private _resetAnimate() {
    if (this.requestedAnimationFrame) {
      window.cancelAnimationFrame(this.requestedAnimationFrame);
    }
    this.renderQueue.clear();
    this.render();
  }

  /**
   * Insert terrain either onto the static or dynamic layer based on the asset type
   */
  insertTerrain({ index, x, y, capture, rerender }: IInsertTerrain) {
    let item: Terrain | Building;
    if (!Building.isDynamicTerrain(index)) {
      item = new Terrain({ index, x, y });
      this.state.layers[ELayer.STATIC].sprites[y][x] = item;
    } else {
      item = new Building({ index, x, y, capture });
      this.state.layers[ELayer.DYNAMIC].sprites[y][x] = item as Building;
    }
    if (rerender) {
      this._resetAnimate();
    }
    return item;
  }

  /**
   * Insert unit onto the unit layer with all the respective metadata
   */
  insertUnit({
    countryIdx,
    unitIdx,
    x,
    y,
    hp,
    ammo,
    fuel,
  }: Omit<IUnitArgs, "insertDecal">) {
    const unit = new Unit({
      insertDecal: this.insertDecal.bind(this),
      countryIdx,
      unitIdx,
      x,
      y,
      hp,
      ammo,
      fuel,
    });
    this.state.layers[ELayer.UNITS].sprites[y][x] = unit;
    this._resetAnimate();
    return unit;
  }

  insertDecal({ index, x, y }: IDecalArgs) {
    const decal = new Decal({ index, x, y });
    this.state.layers[decal.layerId].sprites[y][x] = decal;
    this._resetAnimate();
    return decal;
  }

  /**
   * Take a map string or JS array and assign assets to the respective layers
   */
  importMap(map: number[][] | string) {
    if (typeof map === "string") {
      map = map.split("\n").map((x) => x.split(",").map((y) => parseInt(y)));
    }

    this.state.setGrid(map[0].length, map.length);

    for (const { x, y } of State.gridIterator(
      1,
      this.state.width,
      this.state.height
    )) {
      const index = map[y][x];
      const item = this.insertTerrain({ index, x, y, rerender: false });
      if (
        item instanceof Building &&
        Building.hqIndexes.includes(item.spriteIdx)
      ) {
        this.state.players.push({
          co: "",
          country: item.country,
        });
      }
    }
    this.render();
    console.log(this.movement);
  }

  private _insertCursor(x: number, y: number) {
    const cursor = new Decal({ index: EDecal.SELECT, x, y });
    return cursor;
  }

  get style() {
    return this._style;
  }
  /**
   * Change the style of the GameMap and reset layer assets/animations
   */
  set style(style: EMapStyle) {
    this.style = style;
    if (this.requestedAnimationFrame) {
      window.cancelAnimationFrame(this.requestedAnimationFrame);
    }
    this.renderQueue = new Queue();
    for (const { x, y, layerId } of State.gridIterator(
      this.state.layers.length,
      this.state.width,
      this.state.height
    )) {
      const item: SpriteType = this.state.layers[layerId].sprites[y][x];
      if (item) {
        item.playing = false;
        item.frameIndex = 0;
        item.layerId = layerId;
        this.renderQueue.enqueue(item);
      }
    }
    this._animate(0);
  }

  /**
   * Draw grid ontop of map for debugging
   */
  private _drawGrid() {
    const ctx = this.state.layers[ELayer.UI].ctx;
    // vertical
    ctx.save();
    ctx.strokeStyle = "#fafadd";
    for (let i = 0; i < this.state.width + 1; i++) {
      const iPx = i * this.state.grid + this.state.padding;
      const heightPx = this.state.height * this.state.grid + this.state.padding;
      ctx.beginPath();
      ctx.moveTo(iPx, 0 + this.state.padding);
      ctx.lineTo(iPx, heightPx);
      ctx.stroke();
      ctx.closePath();
    }
    // horizontal
    for (let i = 0; i < this.state.height + 1; i++) {
      const iPx = i * this.state.grid + this.state.padding;
      const widthPx = this.state.width * this.state.grid + this.state.padding;
      ctx.beginPath();
      ctx.moveTo(0 + this.state.padding, iPx);
      ctx.lineTo(widthPx, iPx);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.reset();
  }

  /**
   * animation orchestrator for each window.requestAnimationFrame()
   */
  private _animate(timestamp: number) {
    const delta = timestamp - this.lastRender;
    this.lastRender = timestamp;

    for (const item of this.renderQueue.iterator()) {
      if (!item) {
        continue;
      }
      this._renderAssets.call(this, delta, item);
    }

    if (this.style === EMapStyle.ANIMATED) {
      this.requestedAnimationFrame = window.requestAnimationFrame(
        this._animate.bind(this)
      );
    }
  }

  /**
   * Controller for rendering Sprites onto layers. Readd item to
   * renderQueue if it contains future frames (frame.delay)
   */
  private _renderAssets(delta: number, item: SpriteType) {
    item.timeElapsed += delta;

    let asset: SpriteMetadata | undefined;
    if (item instanceof Terrain) {
      asset = this.assets.terrain.get(item.spriteIdx);
    } else if (item instanceof Unit) {
      asset = this.assets.units.get(item.spriteIdx);
    } else if (item instanceof Decal) {
      asset = this.assets.decals.get(item.spriteIdx);
    }
    if (!asset) {
      throw new Error(`${item} missing from assets`);
    }
    const frames = asset.frames[this.style];
    if (frames.length === 0) {
      this.state.layers[item.layerId].ctx.drawImage(
        asset.sprites[this.style],
        item.x * this.state.grid + asset.offsetX,
        item.y * this.state.grid + asset.offsetY
      );
    }
    const frame = frames[item.frameIndex];
    if (!frame) {
      return;
    }
    if (!item.playing) {
      item.playing = true;
      this._patchFrame(item, asset);
    }

    if (this.style === EMapStyle.ANIMATED && item.playing) {
      if (frame.delay) {
        this.renderQueue.enqueue(item);
      }
      if (item.timeElapsed > frame.delay) {
        this._patchFrame(item, asset);
      }
    }
  }

  /**
   * Controller to render next GIF frame efficiently with diff
   */
  private _patchFrame(item: SpriteType, asset: SpriteMetadata) {
    const frames = asset.frames[this.style];
    const frame = frames[item.frameIndex];

    item.timeElapsed = 0;
    item.frameIndex += 1;
    if (item.frameIndex >= frames.length) {
      item.frameIndex = 0;
    }
    const nextFrame = frames[item.frameIndex];
    const posX = item.x * this.state.grid + this.state.padding + asset.offsetX;

    if (frame.disposalType === 2) {
      const offset = frame.dims.height - this.state.grid;
      const posY =
        item.y * this.state.grid - offset + this.state.padding + asset.offsetY;
      this.state.layers[item.layerId].ctx.clearRect(
        posX,
        posY,
        frame.dims.width,
        frame.dims.height
      );
    }
    const { dims } = nextFrame;
    const frameImageData = this.state.layers[item.layerId].ctx.createImageData(
      dims.width,
      dims.height
    );
    frameImageData.data.set(nextFrame.patch);

    const offset = nextFrame.dims.height - this.state.grid;
    const posY =
      item.y * this.state.grid - offset + this.state.padding + asset.offsetY;
    this.state.layers[item.layerId].ctx.putImageData(
      frameImageData,
      posX,
      posY
    );
  }

  private _clearCanvas(layerId: ELayer) {
    this.state.layers[layerId].ctx.clearRect(
      0,
      0,
      this.state.widthPx,
      this.state.heightPx
    );
  }

  private _cursorRender(x: number, y: number) {
    this._clearCanvas(ELayer.CURSOR);
    const item = this._insertCursor(x, y);
    const asset = this.assets.decals.get(item.spriteIdx);
    if (asset) {
      this.state.layers[item.layerId].ctx.drawImage(
        asset.sprites[this.style],
        x * this.state.grid + this.state.padding + asset.offsetX,
        y * this.state.grid + this.state.padding + asset.offsetY
      );
    }
  }

  private _setupEventListeners() {
    this.state.root.addEventListener("mousemove", (e) => {
      const x = Math.min(
        Math.max(0, e.offsetX - this.state.padding),
        this.state.width * this.state.grid
      );
      const y = Math.min(
        Math.max(0, e.offsetY - this.state.padding),
        this.state.height * this.state.grid
      );

      const prev = {
        gridX: this.mouse.gridX,
        gridY: this.mouse.gridY,
      };

      this.mouse = {
        x,
        y,
        gridX: Math.floor(x / this.state.grid),
        gridY: Math.floor(y / this.state.grid),
        prev,
      };
      if (
        this.mouse.gridX < this.state.width &&
        this.mouse.gridY < this.state.height &&
        (this.mouse.gridX !== this.mouse.prev.gridX ||
          this.mouse.gridY !== this.mouse.prev.gridY)
      ) {
        this._cursorRender(this.mouse.gridX, this.mouse.gridY);
      }
    });

    this.state.root.addEventListener("mousedown", (e) => {
      e.preventDefault();
      console.log(this.mouse);
      // const decal = this.insertDecal(
      //   EDecal.HP9,
      //   this.mouse.gridX,
      //   this.mouse.gridY
      // );
      // this.renderQueue.enqueue(decal);
    });
  }
}

export default Engine;
