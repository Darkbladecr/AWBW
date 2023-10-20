import { terrain } from './sprites';

class GameMap {
  width: number;
  height: number;
  grid = 16;
  gridMap: [][];
  ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.gridMap = new Array(Math.floor(width / this.grid)).fill(
      new Array(Math.floor(height / this.grid))
    );
    console.log('width:', this.gridMap.length);
    console.log('height:', this.gridMap[0].length);

    const canvas = document.createElement('canvas');
    const el = document.getElementById('map');
    if (!el) {
      throw new Error('#map not found on page');
    }
    el.replaceWith(canvas);
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  async init() {}

  private loadAssets(filenames: string[]) {
    return filenames.map(
      (filename) =>
        new Promise((resolve, _reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = `terrain/ani/${filename}.gif`;
        })
    );
  }

  drawGrid() {
    // vertical
    for (let i = 0; i < this.width + 1; i = i + this.grid) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.height);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    // horizontal
    for (let i = 0; i < this.height + 1; i = i + this.grid) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.width, i);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  }
}

export default GameMap;
