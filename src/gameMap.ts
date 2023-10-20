import Building from "./models/Building";
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
  staticTerrain?: boolean;
  dynamicTerrain?: boolean;
  units?: boolean;
  grid?: boolean;
}

class GameMap {
  width: number;
  height: number;
  grid = 16;
  padding = 4;
  terrainMap: number[][];
  cachedTerrainImg: HTMLImageElement | undefined;
  buildings: Building[] = [];
  mapMetadata: ITerrainMetadata[][];
  units: Unit[] = [];

  assets: IAssets;

  style: EMapStyle = EMapStyle.ANIMATED;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.terrainMap = Array.from({ length: height }, () =>
      Array(width).fill(null)
    );
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

    this.canvas = this._setupCanvas("map");
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  async init() {
    const styles = [EMapStyle.AW1, EMapStyle.AW2, EMapStyle.ANIMATED];
    const [terrainAW1, terrainAW2, terrainANI] = await Promise.all(
      styles.map((style) =>
        Promise.all(this._loadAssets("terrain", style, terrain))
      )
    );

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
        });
      } else {
        this.assets.terrain.static.set(index, {
          ...getTerrainMetadata(index),
          sprite: {
            [EMapStyle.AW1]: terrainAW1[i],
            [EMapStyle.AW2]: terrainAW2[i],
            [EMapStyle.ANIMATED]: terrainANI[i],
          },
        });
      }
    }

    const [unitAW1, unitAW2, unitANI] = await Promise.all(
      styles.map((style) =>
        Promise.all(this._loadAssets("units", style, countryUnits))
      )
    );

    for (let i = 0; i < unitAW1.length; i++) {
      const index = i + 1;
      this.assets.units.set(index, {
        ...unitMetadata[i],
        sprite: {
          [EMapStyle.AW1]: unitAW1[i],
          [EMapStyle.AW2]: unitAW2[i],
          [EMapStyle.ANIMATED]: unitANI[i],
        },
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

  private _setupCanvas(id: string) {
    const canvas = document.createElement("canvas");
    canvas.id = id;
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`#${id} not found on page`);
    }
    el.replaceWith(canvas);
    canvas.width = this.width * this.grid + this.padding * 2;
    canvas.height = this.height * this.grid + this.padding * 2;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    return canvas;
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
    // vertical
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    for (let i = 0; i < this.width + 1; i++) {
      const iPx = i * this.grid + this.padding;
      const heightPx = this.height * this.grid + this.padding;
      this.ctx.beginPath();
      this.ctx.moveTo(iPx, 0 + this.padding);
      this.ctx.lineTo(iPx, heightPx);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    // horizontal
    for (let i = 0; i < this.height + 1; i++) {
      const iPx = i * this.grid + this.padding;
      const widthPx = this.width * this.grid + this.padding;
      this.ctx.beginPath();
      this.ctx.moveTo(0 + this.padding, iPx);
      this.ctx.lineTo(widthPx, iPx);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    this.ctx.strokeStyle = "#000";
  }

  render(args?: IRenderArgs) {
    const staticTerrain = args?.staticTerrain ?? true;
    const dynamicTerrain = args?.dynamicTerrain ?? true;
    const units = args?.units ?? true;
    const grid = args?.grid ?? false;

    // terrain
    if (staticTerrain) {
      if (!this.cachedTerrainImg) {
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.height; y++) {
            const img = this.assets.terrain.static.get(this.terrainMap[y][x])
              ?.sprite[this.style];
            if (!img) {
              continue;
            }
            const offset = img.height - this.grid;
            this.ctx.drawImage(
              img,
              x * this.grid + this.padding,
              y * this.grid - offset + this.padding
            );
          }
        }
        const png = this.canvas.toDataURL("image/png");
        const img = new Image();
        img.src = png;
        this.cachedTerrainImg = img;
      } else {
        this.ctx.drawImage(this.cachedTerrainImg, 0, 0);
      }
    }

    // buildings
    if (dynamicTerrain) {
      for (const building of this.buildings) {
        const img = this.assets.terrain.dynamic.get(building.spriteIdx)?.sprite[
          this.style
        ];
        if (!img) {
          continue;
        }
        const offset = img.height - this.grid;
        this.ctx.drawImage(
          img,
          building.x * this.grid + this.padding,
          building.y * this.grid - offset + this.padding
        );
      }
    }
    // units
    if (units) {
      for (const unit of this.units) {
        const img = this.assets.units.get(unit.spriteIdx)?.sprite[this.style];
        if (!img) {
          continue;
        }
        const offset = img.height - this.grid;
        this.ctx.drawImage(
          img,
          unit.x * this.grid + this.padding,
          unit.y * this.grid - offset + this.padding
        );
      }
    }
    this.canvas.style.background = "#000";

    if (grid) {
      this.drawGrid();
    }
  }

  importMap(map: number[][] | string) {
    if (typeof map === "string") {
      map = map.split("\n").map((x) => x.split(",").map((y) => parseInt(y)));
    }

    this.height = map.length;
    this.width = map[0].length;
    this.terrainMap = Array.from({ length: this.height }, () =>
      Array(this.width).fill(null)
    );
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = map[y][x];
        this.insertTerrain(index, x, y);
      }
    }

    this._setupCanvas("map");
  }

  insertTerrain(index: ETerrain, x: number, y: number) {
    if (
      index < ETerrain.NEUTRALCITY ||
      (index >= ETerrain.VPIPE && index <= ETerrain.WPIPEEND)
    ) {
      this.terrainMap[y][x] = index;
    } else {
      this.terrainMap[y][x] = 0;
      const building = new Building(index, x, y);
      const buildingsIdx = this.buildings.findIndex(
        (b) => b.x === x && b.y === y
      );
      if (buildingsIdx !== -1) {
        this.buildings[buildingsIdx] = building;
      } else {
        this.buildings.push(building);
      }
    }
    this.mapMetadata[y][x] = getTerrainMetadata(index);
  }

  insertUnit(countryIdx: ECountry, unitIdx: EUnit, x: number, y: number) {
    const unit = new Unit(countryIdx, unitIdx, x, y);
    const unitsIdx = this.units.findIndex((u) => u.x === x && u.y);
    if (unitsIdx !== -1) {
      this.units[unitsIdx] = unit;
    } else {
      this.units.push(unit);
    }
  }
}

export default GameMap;
