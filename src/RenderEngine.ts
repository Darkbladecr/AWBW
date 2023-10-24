import { Building, IBuildingArgs, isDynamicTerrain } from "./models/Building";
import { Terrain } from "./models/Terrain";
import { IUnitArgs, Unit } from "./models/Unit";

import Queue from "./utils/Queue";
import { Decal, EDecal, IDecalArgs } from "./models/Decal";
import { EMapStyle } from "./models/types";
import Assets, { SpriteMetadata } from "./Assets";

export enum ELayer {
  STATIC,
  DYNAMIC,
  HELPERS,
  UNITS,
  DECALS,
  CURSOR,
  UI,
}
export const LAYERS = [
  "static",
  "dynamic",
  "helpers",
  "units",
  "decals",
  "cursor",
  "ui",
];

type SpriteType = Terrain | Building | Unit | Decal;

interface IMapLayer<T extends SpriteType> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData | undefined;
  sprites: (T | null)[][];
}

type GameMapLayers = [
  IMapLayer<Terrain>,
  IMapLayer<Building>,
  IMapLayer<any>,
  IMapLayer<Unit>,
  IMapLayer<Decal>,
  IMapLayer<Decal>,
  IMapLayer<any>
];

interface IRenderArgs {
  layers?: ELayer[];
  grid?: boolean;
}

// type MapLayers = [ETerrain, Building | null, Unit | null];

class RenderEngine {
  grid = 16;
  padding = 4;
  // grid width & height
  width: number;
  height: number;
  widthPx: number;
  heightPx: number;
  // map: MapLayers[][];

  // keep canvases in separate layers for efficient updates
  debug = true;

  rootElement!: HTMLElement;
  layers!: GameMapLayers;
  buildings: Map<string, Building> = new Map();
  // mapMetadata: ITerrainMetadata[][];
  units: Map<string, Unit> = new Map();

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

  private style: EMapStyle = EMapStyle.ANIMATED;
  lastRender = 0;

  constructor(root: HTMLElement, width: number, height: number) {
    this.rootElement = root;
    this.width = width;
    this.height = height;
    this.widthPx = width * this.grid + this.padding * 2;
    this.heightPx = height * this.grid + this.padding * 2;

    // this.map = Array.from({ length: this.height }, () =>
    //   Array.from({ length: this.width }, () => [0, null, null])
    // );
    // this.mapMetadata = Array.from({ length: height }, () =>
    //   Array(width).fill(null)
    // );

    this.setupCanvas();
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
   * Create all canvas layers and initialize layer data on GameMap
   */
  setupCanvas(width?: number, height?: number) {
    if (width) {
      this.width = width;
      this.widthPx = width * this.grid + this.padding * 2;
    }
    if (height) {
      this.height = height;
      this.heightPx = height * this.grid + this.padding * 2;
    }
    this.rootElement.innerHTML = "";
    let layers: IMapLayer<any>[] = [];
    for (let i = 0; i < LAYERS.length; i++) {
      const label = LAYERS[i];

      const canvas = document.createElement("canvas");
      canvas.id = label;
      canvas.classList.add("layer");
      canvas.style["zIndex"] = i.toString();
      canvas.width = this.widthPx;
      canvas.height = this.heightPx;

      this.rootElement.appendChild(canvas);

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      }) as CanvasRenderingContext2D;
      layers.push({
        canvas,
        ctx,
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        sprites: Array.from({ length: this.height }, () =>
          Array(this.width).fill(null)
        ),
      });
    }
    this.layers = [
      layers[ELayer.STATIC],
      layers[ELayer.DYNAMIC],
      layers[ELayer.HELPERS],
      layers[ELayer.UNITS],
      layers[ELayer.DECALS],
      layers[ELayer.CURSOR],
      layers[ELayer.UI],
    ];
    if (this.width > 0 && this.height > 0) {
      this.layers[ELayer.STATIC].canvas.style.backgroundColor = "#000";
    }
  }

  /**
   * Paint all assets onto the respective canvases and add items to
   * renderQueue if they have GIF animations
   */
  render(args?: IRenderArgs) {
    // const layersToRender = args?.layers ?? [];
    const grid = args?.grid ?? false;

    for (const { x, y, layerId } of this.gridIterator()) {
      const item: SpriteType = this.layers[layerId].sprites[y][x];
      if (item) {
        this.renderQueue.enqueue(item);
      }
    }
    this._animate(0);

    if (grid || this.debug) {
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
  insertTerrain({ index, x, y, capture }: IBuildingArgs) {
    let item: Terrain | Building;
    if (!isDynamicTerrain(index)) {
      item = new Terrain({ index, x, y });
      this.layers[ELayer.STATIC].sprites[y][x] = item;
    } else {
      item = new Building({ index, x, y, capture });
      this.layers[ELayer.DYNAMIC].sprites[y][x] = item as Building;
    }
    this._resetAnimate();
    // this.mapMetadata[y][x] = getTerrainMetadata(index);
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
    this.layers[ELayer.UNITS].sprites[y][x] = unit;
    this._resetAnimate();
    return unit;
  }

  insertDecal({ index, x, y }: IDecalArgs) {
    const decal = new Decal({ index, x, y });
    this.layers[decal.layerId].sprites[y][x] = decal;
    this._resetAnimate();
    return decal;
  }

  private _insertCursor(x: number, y: number) {
    const cursor = new Decal({ index: EDecal.SELECT, x, y });
    if (cursor) {
      cursor.layerId = ELayer.CURSOR;
    }
    return cursor;
  }

  /**
   * Change the style of the GameMap and reset layer assets/animations
   */
  setStyle(style: EMapStyle) {
    this.style = style;
    if (this.requestedAnimationFrame) {
      window.cancelAnimationFrame(this.requestedAnimationFrame);
    }
    this.renderQueue = new Queue();
    for (const { x, y, layerId } of this.gridIterator()) {
      const item: SpriteType = this.layers[layerId].sprites[y][x];
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
   * Iterator to efficiently loop through all (x,y) coordinates on each layer
   */
  *gridIterator(args?: { layers?: number; width?: number; height?: number }) {
    const layers = args?.layers ?? this.layers.length;
    const width = args?.width ?? this.width;
    const height = args?.height ?? this.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let layerId = 0; layerId < layers; layerId++) {
          yield { layerId, x, y };
        }
      }
    }
  }

  /**
   * Draw grid ontop of map for debugging
   */
  private _drawGrid() {
    const ctx = this.layers[ELayer.UI].ctx;
    // vertical
    ctx.save();
    ctx.strokeStyle = "#fafadd";
    for (let i = 0; i < this.width + 1; i++) {
      const iPx = i * this.grid + this.padding;
      const heightPx = this.height * this.grid + this.padding;
      ctx.beginPath();
      ctx.moveTo(iPx, 0 + this.padding);
      ctx.lineTo(iPx, heightPx);
      ctx.stroke();
      ctx.closePath();
    }
    // horizontal
    for (let i = 0; i < this.height + 1; i++) {
      const iPx = i * this.grid + this.padding;
      const widthPx = this.width * this.grid + this.padding;
      ctx.beginPath();
      ctx.moveTo(0 + this.padding, iPx);
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
      // console.log(asset.sprites[this.style]);
      this.layers[item.layerId].ctx.drawImage(
        asset.sprites[this.style],
        item.x * this.grid + asset.offsetX,
        item.y * this.grid + asset.offsetY
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
    const posX = item.x * this.grid + this.padding;

    if (frame.disposalType === 2) {
      const offset = frame.dims.height - this.grid;
      const posY = item.y * this.grid - offset + this.padding;
      this.layers[item.layerId].ctx.clearRect(
        posX,
        posY,
        frame.dims.width,
        frame.dims.height
      );
    }
    const { dims } = nextFrame;
    const frameImageData = this.layers[item.layerId].ctx.createImageData(
      dims.width,
      dims.height
    );
    frameImageData.data.set(nextFrame.patch);

    const offset = nextFrame.dims.height - this.grid;
    const posY = item.y * this.grid - offset + this.padding;
    this.layers[item.layerId].ctx.putImageData(frameImageData, posX, posY);
  }

  private _clearCanvas(layerId: ELayer) {
    this.layers[layerId].ctx.clearRect(0, 0, this.widthPx, this.heightPx);
  }

  private _cursorRender(x: number, y: number) {
    this._clearCanvas(ELayer.CURSOR);
    const item = this._insertCursor(x, y);
    const asset = this.assets.decals.get(item.spriteIdx);
    if (asset) {
      this.layers[item.layerId].ctx.drawImage(
        asset.sprites[this.style],
        x * this.grid + asset.offsetX,
        y * this.grid + asset.offsetY
      );
    }
  }

  private _setupEventListeners() {
    this.rootElement.addEventListener("mousemove", (e) => {
      const x = Math.min(
        Math.max(0, e.offsetX - this.padding),
        this.width * this.grid
      );
      const y = Math.min(
        Math.max(0, e.offsetY - this.padding),
        this.height * this.grid
      );

      const prev = {
        gridX: this.mouse.gridX,
        gridY: this.mouse.gridY,
      };

      this.mouse = {
        x,
        y,
        gridX: Math.floor(x / this.grid),
        gridY: Math.floor(y / this.grid),
        prev,
      };
      if (
        this.mouse.gridX < this.width &&
        this.mouse.gridY < this.height &&
        (this.mouse.gridX !== this.mouse.prev.gridX ||
          this.mouse.gridY !== this.mouse.prev.gridY)
      ) {
        this._cursorRender(this.mouse.gridX, this.mouse.gridY);
      }
    });

    this.rootElement.addEventListener("mousedown", (e) => {
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

export default RenderEngine;
