import { terrain, ETerrain, countryUnits, getUnitCode, ECountry, EUnit } from './sprites';

enum ESpriteType {
  TERRAIN,
  UNIT
}

class GameMap {
  width: number;
  height: number;
  grid = 16;
  terrainMap: number[][];
  unitMap: number[][];
  terrain: HTMLImageElement[] = [];
  units: HTMLImageElement[] = [];
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.terrainMap = Array.from({length: width}, () => Array(height).fill(1));
    this.unitMap = Array.from({length: width}, () => Array(height).fill(null));

    this.ctx = this._setupCanvas('map');
  }

  async init() {
    this.terrain = await Promise.all(this._loadAssets('terrain', terrain));
    this.units = await Promise.all(this._loadAssets('units', countryUnits));
    this._insertSprite(ESpriteType.TERRAIN, ETerrain.MOUNTAIN, 0, 0);
    this._insertSprite(ESpriteType.UNIT, getUnitCode(ECountry.ORANGE_STAR, EUnit.INFANTRY), 1, 1);
    return this;
  }

  private _setupCanvas(id: string){
    const canvas = document.createElement('canvas');
    canvas.id = id;
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`#${id} not found on page`);
    }
    el.replaceWith(canvas);
    canvas.width = this.width * this.grid;
    canvas.height = this.height * this.grid;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    return this.ctx;
  }

  private _loadAssets(path: string, filenames: string[]): Promise<HTMLImageElement>[] {
    return filenames.map(
      (filename) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = `sprites/${path}/ani/${filename}.gif`;
        })
    );
  }

  drawGrid() {
    // vertical
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    for (let i = 0; i < this.width + 1; i++) {
      const iPx = i * this.grid;
      this.ctx.beginPath();
      this.ctx.moveTo(iPx, 0);
      this.ctx.lineTo(iPx, this.height * this.grid);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    // horizontal
    for (let i = 0; i < this.height + 1; i++) {
      const iPx = i * this.grid;
      this.ctx.beginPath();
      this.ctx.moveTo(0, iPx);
      this.ctx.lineTo(this.width * this.grid, iPx);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    this.ctx.strokeStyle = "#000";
  }

  render(){
    // terrain
    for(let x = 0; x < this.width; x++){
      for (let y = 0; y < this.height; y++){
        const img = this.terrain[this.terrainMap[x][y] - 1];
        if (!img){
          continue;
        }
        const offset = img.height - this.grid;
        this.ctx.drawImage(img, x * this.grid, y * this.grid - offset);
      }
    }
    // units
    for(let x = 0; x < this.width; x++){
      for (let y = 0; y < this.height; y++){
        const img = this.units[this.unitMap[x][y] - 1];
        if (!img){
          continue;
        }
        const offset = img.height - this.grid;
        this.ctx.drawImage(img, x * this.grid, y * this.grid - offset);
      }
    }
  }

  importMap(map: number[][] | string){
    if (typeof map === 'string'){
      map = map.split('\n').map((x) => x.split(',').map((y) => parseInt(y)));
    }
    this.width = map.length;
    this.height = map[0].length;
    this.terrainMap = map;

    const canvas = document.createElement('canvas');
    const el = document.getElementById('map');
    if (!el) {
      throw new Error('#map not found on page');
    }
    el.replaceWith(canvas);
    canvas.width = this.width * this.grid;
    canvas.height = this.height * this.grid;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  private _insertSprite(type: ESpriteType, index: number, x: number, y: number) {
    if (type === ESpriteType.TERRAIN){
      this.terrainMap[x][y] = index;
    } else if (type === ESpriteType.UNIT){
      this.unitMap[x][y] = index;
    }
  }
}

export default GameMap;
