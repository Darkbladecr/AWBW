interface ISpriteArgs {
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  sx: number;
  sy: number;
  x: number;
  y: number;
}

class Sprite {
  sx: number;
  sy: number;
  width = 16;
  height = 16;
  padding = 1;
  img: HTMLImageElement;
  // frames: Uint8ClampedArray[];
  x: number;
  y: number;
  ctx: CanvasRenderingContext2D;
  private _frameIndex = 0;
  private _frames = [0, 1, 2, 1];

  constructor({ ctx, img, sx, sy, x, y }: ISpriteArgs) {
    this.ctx = ctx;
    this.img = img;
    this.sx = sx;
    this.sy = sy;
    this.x = x;
    this.y = y;

    console.log(this.draw());
  }

  next() {
    this._frameIndex++;
    if (this._frameIndex > this._frames.length - 1) {
      this._frameIndex = 0;
    }
    this.draw();
  }

  draw() {
    this.ctx.clearRect(this.x, this.y, this.width, this.height);
    const sx =
      this.sx + this._frames[this._frameIndex] * (this.width + this.padding);
    this.ctx.drawImage(
      this.img,
      sx,
      this.sy,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const { data } = imageData;
    for (const [i, r, g, b, a] of this.imageDataIterator(data)) {
      if (r === 140 && g === 181 && b === 123 && a === 255) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }
    this.ctx.putImageData(imageData, 0, 0);
    return imageData;
  }

  *imageDataIterator(data: Uint8ClampedArray) {
    for (let i = 0; i < data.length; i += 4) {
      // [i,r,g,b,a]
      yield [i, data[i], data[i + 1], data[i + 2], data[i + 3]];
    }
  }
}

function main() {
  const el = document.getElementById("canvas") as HTMLCanvasElement;
  if (!el) {
    return;
  }
  const ctx = el.getContext("2d");
  if (!ctx) {
    return;
  }
  const img = document.getElementById("units_small") as HTMLImageElement;
  if (img) {
    const sprite = new Sprite({
      ctx,
      img,
      sx: 3,
      sy: 30,
      x: 0,
      y: 0,
    });
    sprite.draw();
    console.log(img);
    setInterval(() => sprite.next(), 350);
    // ctx.drawImage(img, 3, 30, 16, 16, 0, 0, 16, 16);
    // ctx.drawImage(img, 0, 0);
  }
}

main();
