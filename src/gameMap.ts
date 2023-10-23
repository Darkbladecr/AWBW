import { decompressFrames, parseGIF } from "gifuct-js";
import GifPlayer from "./GifPlayer";
import Building from "./models/Building";
import Terrain from "./models/Terrain";
import Unit from "./models/Unit";
import {
  EMapStyle,
  EUnit,
  IDecalMetadata,
  ISpriteMetadata,
  ITerrainMetadata,
  IUnitMetadata,
  STYLES,
  getTerrainMetadata,
  isDynamicTerrain,
  unitMetadata,
} from "./models/types";
import {
  terrainFilenames,
  ETerrain,
  countryUnits,
  ECountry,
  decalFilenames,
  EDecal,
  getDecalMetadata,
} from "./sprites";
import Queue from "./Queue";
import Decal from "./models/Decal";

type TerrainSpriteMetadata = ITerrainMetadata & ISpriteMetadata;
type UnitSpriteMetadata = IUnitMetadata & ISpriteMetadata;
type DecalSpriteMetadata = IDecalMetadata & ISpriteMetadata;

type SpriteMetadata =
  | TerrainSpriteMetadata
  | UnitSpriteMetadata
  | DecalSpriteMetadata;

export interface IAssets {
  terrain: Map<ETerrain, TerrainSpriteMetadata>;
  units: Map<EUnit, UnitSpriteMetadata>;
  decals: Map<EDecal, DecalSpriteMetadata>;
}

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

class GameMap {
  id: string;
  grid = 16;
  padding = 4;
  // grid width & height
  width: number;
  height: number;
  // map: MapLayers[][];

  // keep canvases in separate layers for efficient updates

  rootElement!: HTMLElement;
  layers!: GameMapLayers;
  buildings: Map<string, Building> = new Map();
  mapMetadata: ITerrainMetadata[][];
  units: Map<string, Unit> = new Map();

  gifs: Map<string, GifPlayer> = new Map();
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

  assets: IAssets = {
    terrain: new Map(),
    units: new Map(),
    decals: new Map(),
  };

  private style: EMapStyle = EMapStyle.ANIMATED;
  lastRender = 0;

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
    this.mapMetadata = Array.from({ length: height }, () =>
      Array(width).fill(null)
    );

    this._setupCanvas();
    this._setupEventListeners();
  }

  /**
   * load all assets asynchronously and assign to this.assets
   */
  async init() {
    const [terrainAW1, terrainAW2, terrainANI] = await Promise.all(
      STYLES.map((style) =>
        Promise.all(this._loadGifs("terrain", style, terrainFilenames))
      )
    );

    const [terrainAW1Frames, terrainAW2Frames, terrainANIFrames] =
      await Promise.all(
        [terrainAW1, terrainAW2, terrainANI].map((htmlEls) =>
          Promise.all(htmlEls.map(this._decodeGif))
        )
      );

    for (let i = 0; i < terrainAW1.length; i++) {
      let index: ETerrain = i + 1;
      // fix for deleted sprites from AWBW
      if (index > 57) {
        if (index < 81) {
          continue;
        } else {
          index = index + (81 - 57) - 1;
        }
      }
      if (index > 176) {
        if (index < 181) {
          continue;
        } else {
          index = index + (181 - 176) - 1;
        }
      }

      this.assets.terrain.set(index, {
        ...getTerrainMetadata(index),
        offsetX: 0,
        offsetY: 0,
        sprites: [terrainAW1[i], terrainAW2[i], terrainANI[i]],
        frames: [terrainAW1Frames[i], terrainAW2Frames[i], terrainANIFrames[i]],
      });
    }

    const [unitAW1, unitAW2, unitANI] = await Promise.all(
      STYLES.map((style) =>
        Promise.all(this._loadGifs("units", style, countryUnits))
      )
    );

    const [unitAW1Frames, unitAW2Frames, unitANIFrames] = await Promise.all(
      [unitAW1, unitAW2, unitANI].map((htmlEls) =>
        Promise.all(htmlEls.map(this._decodeGif))
      )
    );

    for (let i = 0; i < unitAW1.length; i++) {
      this.assets.units.set(i, {
        ...unitMetadata[i],
        offsetX: 0,
        offsetY: 0,
        sprites: [unitAW1[i], unitAW2[i], unitANI[i]],
        frames: [unitAW1Frames[i], unitAW2Frames[i], unitANIFrames[i]],
      });
    }

    const decals = await Promise.all(
      this._loadGifs("decals", null, decalFilenames)
    );
    console.log(decals[15]);
    const decalFrames = await Promise.all(decals.map(this._decodeGif));
    console.log(decalFrames[15]);

    for (let i = 0; i < decals.length; i++) {
      this.assets.decals.set(i, {
        name: decalFilenames[i],
        offsetX: 0,
        offsetY: 0,
        sprites: [decals[i], decals[i], decals[i]],
        frames: [decalFrames[i], decalFrames[i], decalFrames[i]],
        ...getDecalMetadata(i),
      });
    }

    return this;
  }

  /**
   * decode gif from HTMLImageElement or URI
   * @returns ParsedFrame
   */
  private async _decodeGif(img: HTMLImageElement | string) {
    const uri = typeof img === "string" ? img : img.src;
    const resp = await fetch(uri);
    const buff = await resp.arrayBuffer();
    const gif = parseGIF(buff);
    const frames = decompressFrames(gif, true);
    return frames;
  }

  /**
   * Create all canvas layers and initialize layer data on GameMap
   */
  private _setupCanvas() {
    this.rootElement.innerHTML = "";
    let layers: IMapLayer<any>[] = [];
    for (let i = 0; i < LAYERS.length; i++) {
      const label = LAYERS[i];

      const canvas = document.createElement("canvas");
      canvas.id = label;
      canvas.classList.add("layer");
      canvas.style["zIndex"] = i.toString();
      canvas.width = this.width * this.grid + this.padding * 2;
      canvas.height = this.height * this.grid + this.padding * 2;

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
  }

  /**
   * load all Gifs and create HTMLImageElements for them
   * @returns
   */
  private _loadGifs(
    path: string,
    styleType: EMapStyle | null,
    filenames: string[]
  ): Promise<HTMLImageElement>[] {
    let style = "";
    if (styleType !== null) {
      style = ["aw1", "aw2", "ani"][styleType] + "/";
    }
    return filenames.map(
      (filename) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = `sprites/${path}/${style}${filename}.gif`;
        })
    );
  }

  /**
   * Draw grid ontop of map for debugging
   */
  drawGrid() {
    const ctx = this.layers[ELayer.UI].ctx;
    // vertical
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
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
    ctx.strokeStyle = "#000";
  }

  /**
   * Paint all assets onto the respective canvases and add items to
   * renderQueue if they have GIF animations
   */
  render(args?: IRenderArgs) {
    // const layersToRender = args?.layers ?? [];
    const grid = args?.grid ?? false;

    for (const { x, y, layerId } of this._makeGridIterator()) {
      const item: SpriteType = this.layers[layerId].sprites[y][x];
      if (item) {
        item.layerId = layerId;
        this.renderQueue.enqueue(item);
      }
    }
    this.animate(0);

    if (grid) {
      this.drawGrid();
    }
    this.layers[ELayer.STATIC].canvas.style.backgroundColor = "#000";
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

    this._setupCanvas();

    for (const { x, y } of this._makeGridIterator({ layers: 1 })) {
      const index = map[y][x];
      this.insertTerrain(index, x, y);
    }
  }

  /**
   * Insert terrain either onto the static or dynamic layer based on the asset type
   */
  insertTerrain(index: ETerrain, x: number, y: number) {
    let item: Terrain | Building;
    if (!isDynamicTerrain(index)) {
      item = new Terrain(index, x, y);
      this.layers[ELayer.STATIC].sprites[y][x] = item;
    } else {
      item = new Building(index, x, y);
      this.layers[ELayer.DYNAMIC].sprites[y][x] = item as Building;
    }
    this.mapMetadata[y][x] = getTerrainMetadata(index);
    return item;
  }

  /**
   * Insert unit onto the unit layer with all the respective metadata
   */
  insertUnit(countryIdx: ECountry, unitIdx: EUnit, x: number, y: number) {
    const unit = new Unit(countryIdx, unitIdx, x, y);
    this.layers[ELayer.UNITS].sprites[y][x] = unit;
    return unit;
  }

  insertDecal(index: EDecal, x: number, y: number) {
    const decal = new Decal(index, x, y);
    if (index === EDecal.SELECT) {
      decal.layerId = ELayer.CURSOR;
    }
    this.layers[decal.layerId].sprites[y][x] = decal;
    return decal;
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
    for (const { x, y, layerId } of this._makeGridIterator()) {
      const item: SpriteType = this.layers[layerId].sprites[y][x];
      if (item) {
        item.playing = false;
        item.frameIndex = 0;
        item.layerId = layerId;
        this.renderQueue.enqueue(item);
      }
    }
    this.animate(0);
  }

  /**
   * Iterator to efficiently loop through all (x,y) coordinates on each layer
   */
  private *_makeGridIterator(args?: {
    layers?: number;
    width?: number;
    height?: number;
  }) {
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
   * animation orchestrator for each window.requestAnimationFrame()
   */
  animate(timestamp: number) {
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
        this.animate.bind(this)
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
    this.layers[layerId].ctx.clearRect(
      0,
      0,
      this.width * this.grid + this.padding * 2,
      this.height * this.grid + this.padding * 2
    );
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

  private _cursorRender(x: number, y: number) {
    this._clearCanvas(ELayer.CURSOR);
    const item = this.insertDecal(EDecal.SELECT, x, y);
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
      const decal = this.insertDecal(
        EDecal.HP9,
        this.mouse.gridX,
        this.mouse.gridY
      );
      this.renderQueue.enqueue(decal);
    });
  }
}

export default GameMap;
