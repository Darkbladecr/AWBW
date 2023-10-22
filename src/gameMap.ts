import { ParsedFrame, decompressFrames, parseGIF } from "gifuct-js";
import GifPlayer from "./GifPlayer";
import Building from "./models/Building";
import Terrain from "./models/Terrain";
import Unit from "./models/Unit";
import {
  EMapStyle,
  EUnit,
  ITerrainMetadata,
  IUnitMetadata,
  getTerrainMetadata,
  unitMetadata,
} from "./models/types";
import { terrain, ETerrain, countryUnits, ECountry } from "./sprites";

interface IAssets {
  terrain: {
    static: Map<ETerrain, ITerrainMetadata>;
    dynamic: Map<ETerrain, ITerrainMetadata>;
  };
  units: Map<EUnit, IUnitMetadata>;
}

interface IRenderArgs {
  layers?: ELayer[];
  grid?: boolean;
}

type SpriteType = Terrain | Building | Unit;

interface IMapLayer<T extends SpriteType> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData | undefined;
  sprites: (T | null)[][];
}

type GameMapLayers = [
  IMapLayer<Terrain>,
  IMapLayer<Building>,
  IMapLayer<Unit>,
  IMapLayer<any>,
  IMapLayer<any>
];

enum ELayer {
  STATIC,
  DYNAMIC,
  UNITS,
  ATTRIBUTES,
  UI,
}

// type MapLayers = [ETerrain, Building | null, Unit | null];

class GameMap {
  id: string;
  width: number;
  height: number;
  grid = 16;
  padding = 4;
  // map: MapLayers[][];
  layers!: GameMapLayers;
  layerLabels = ["static", "dynamic", "units", "attributes", "ui"];
  buildings: Map<string, Building> = new Map();
  mapMetadata: ITerrainMetadata[][];
  units: Map<string, Unit> = new Map();

  gifs: Map<string, GifPlayer> = new Map();

  assets: IAssets;

  style: EMapStyle = EMapStyle.ANIMATED;

  constructor(id: string, width: number, height: number) {
    this.id = id;
    this.width = width;
    this.height = height;
    // this.map = Array.from({ length: this.height }, () =>
    //   Array.from({ length: this.width }, () => [0, null, null])
    // );
    this.mapMetadata = Array.from({ length: height }, () =>
      Array(width).fill(null)
    );

    this.assets = {
      terrain: {
        static: new Map(),
        dynamic: new Map(),
      },
      units: new Map(),
    };

    this._setupCanvas(this.id);
  }

  async init() {
    const styles = [EMapStyle.AW1, EMapStyle.AW2, EMapStyle.ANIMATED];
    const [terrainAW1, terrainAW2, terrainANI] = await Promise.all(
      styles.map((style) =>
        Promise.all(this._loadAssets("terrain", style, terrain))
      )
    );

    const terrainANIFrames = await Promise.all(terrainANI.map(this._decodeGif));

    for (let i = 0; i < terrainAW1.length; i++) {
      let index: ETerrain = i + 1;
      // fix for deleted sprites
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

      if (this._isDynamicTerrain(index)) {
        this.assets.terrain.dynamic.set(index, {
          ...getTerrainMetadata(index),
          sprite: {
            [EMapStyle.AW1]: terrainAW1[i],
            [EMapStyle.AW2]: terrainAW2[i],
            [EMapStyle.ANIMATED]: terrainANI[i],
          },
          frames: terrainANIFrames[i],
        });
      } else {
        this.assets.terrain.static.set(index, {
          ...getTerrainMetadata(index),
          sprite: {
            [EMapStyle.AW1]: terrainAW1[i],
            [EMapStyle.AW2]: terrainAW2[i],
            [EMapStyle.ANIMATED]: terrainANI[i],
          },
          frames: terrainANIFrames[i],
        });
      }
    }

    const [unitAW1, unitAW2, unitANI] = await Promise.all(
      styles.map((style) =>
        Promise.all(this._loadAssets("units", style, countryUnits))
      )
    );

    const unitANIFrames = await Promise.all(unitANI.map(this._decodeGif));

    for (let i = 0; i < unitAW1.length; i++) {
      const index = i + 1;
      this.assets.units.set(index, {
        ...unitMetadata[i],
        sprite: {
          [EMapStyle.AW1]: unitAW1[i],
          [EMapStyle.AW2]: unitAW2[i],
          [EMapStyle.ANIMATED]: unitANI[i],
        },
        frames: unitANIFrames[i],
      });
    }

    return this;
  }

  private _isDynamicTerrain(index: ETerrain) {
    if (
      index < ETerrain.NEUTRALCITY ||
      (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND)
    ) {
      return false;
    }
    return true;
  }

  private async _decodeGif(img: HTMLImageElement | string) {
    const uri = typeof img === "string" ? img : img.src;
    const resp = await fetch(uri);
    const buff = await resp.arrayBuffer();
    const gif = parseGIF(buff);
    const frames = decompressFrames(gif, true);
    return frames;
  }

  private _setupCanvas(id: string) {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`#${id} not found on page`);
    }
    el.innerHTML = "";
    let layers: IMapLayer<any>[] = [];
    for (let i = 0; i < this.layerLabels.length; i++) {
      const label = this.layerLabels[i];

      const canvas = document.createElement("canvas");
      canvas.id = label;
      canvas.classList.add("layer");
      canvas.style["zIndex"] = i.toString();
      canvas.width = this.width * this.grid + this.padding * 2;
      canvas.height = this.height * this.grid + this.padding * 2;

      el.appendChild(canvas);

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
      layers[ELayer.UNITS],
      layers[ELayer.ATTRIBUTES],
      layers[ELayer.UI],
    ];
  }

  private _loadAssets(
    path: string,
    style: string,
    filenames: string[]
  ): Promise<HTMLImageElement>[] {
    return filenames.map(
      (filename) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = `sprites/${path}/${style}/${filename}.gif`;
        })
    );
  }

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

  render(args?: IRenderArgs) {
    const layersToRender = args?.layers ?? [];
    const grid = args?.grid ?? false;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        for (let layerId = 0; layerId < this.layers.length; layerId++) {
          if (layersToRender.length > 0 && !layersToRender.includes(layerId)) {
            continue;
          }
          const layer = this.layers[layerId];
          const item = layer.sprites[y][x];
          if (!item) {
            continue;
          }

          let offset = 0;
          let img: HTMLImageElement | undefined;
          let frames: ParsedFrame[] = [];

          if (item instanceof Terrain && !(item instanceof Building)) {
            const terrainMetadata = this.assets.terrain.static.get(
              item.spriteIdx
            );
            if (terrainMetadata) {
              frames = terrainMetadata.frames;
              img = terrainMetadata.sprite[this.style];
              if (img) {
                offset = img.height - this.grid;
              }
            }
          } else if (item instanceof Building) {
            const terrainMetadata = this.assets.terrain.dynamic.get(
              item.spriteIdx
            );
            if (terrainMetadata) {
              frames = terrainMetadata.frames;
              img = terrainMetadata.sprite[this.style];
              if (img) {
                offset = img.height - this.grid;
              }
            }
          } else if (item instanceof Unit) {
            const unitMetadata = this.assets.units.get(item.spriteIdx);
            if (unitMetadata) {
              frames = unitMetadata.frames;
              img = unitMetadata.sprite[this.style];
              if (img) {
                offset = img.height - this.grid;
              }
            }
          }
          if (!img) {
            continue;
          }
          const posX = item.x * this.grid + this.padding;
          const posY = item.y * this.grid - offset + this.padding;
          if (this.style === EMapStyle.ANIMATED) {
            const gifPlayer = new GifPlayer(
              frames,
              this.layers[layerId].ctx,
              posX,
              posY,
              this.style === EMapStyle.ANIMATED
            );
          } else {
            this.layers[layerId].ctx.drawImage(img, posX, posY);
          }
        }
      }
    }

    if (grid) {
      this.drawGrid();
    }
    this.layers[ELayer.STATIC].canvas.style.backgroundColor = "#000";
  }

  importMap(map: number[][] | string) {
    if (typeof map === "string") {
      map = map.split("\n").map((x) => x.split(",").map((y) => parseInt(y)));
    }

    this.height = map.length;
    this.width = map[0].length;

    this._setupCanvas(this.id);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = map[y][x];
        this.insertTerrain(index, x, y);
      }
    }
  }

  // insertTerrain(index: ETerrain, x: number, y: number) {
  //   if (
  //     index < ETerrain.NEUTRALCITY ||
  //     (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND)
  //   ) {
  //     this.map[y][x][ELayer.STATIC] = index;
  //   } else {
  //     this.map[y][x][ELayer.STATIC] = ETerrain.NULL;
  //     const building = new Building(index, x, y);
  //     this.map[y][x][ELayer.DYNAMIC] = building;
  //     this.buildings.set(this._mapKey(x, y), building);
  //   }
  //   this.mapMetadata[y][x] = getTerrainMetadata(index);
  // }

  insertTerrain(index: ETerrain, x: number, y: number) {
    if (
      index < ETerrain.NEUTRALCITY ||
      (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND)
    ) {
      const terrain = new Terrain(index, x, y);
      this.layers[ELayer.STATIC].sprites[y][x] = terrain;
    } else {
      const building = new Building(index, x, y);
      this.layers[ELayer.DYNAMIC].sprites[y][x] = building;
    }
    this.mapMetadata[y][x] = getTerrainMetadata(index);
  }

  insertUnit(countryIdx: ECountry, unitIdx: EUnit, x: number, y: number) {
    const unit = new Unit(countryIdx, unitIdx, x, y);
    this.layers[ELayer.UNITS].sprites[y][x] = unit;
  }

  private _mapKey(x: number, y: number) {
    return `(${x},${y})`;
  }
}

export default GameMap;
