export class SnowFlake {
  x: number;
  y: number;
  velX!: number;
  velY!: number;
  radius!: number;
  canvasW: number;
  canvasH: number;

  static randomize(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
  }

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.x = SnowFlake.randomize(0, this.canvasW);
    this.y = SnowFlake.randomize(0, this.canvasH);
    this.init();
  }

  init() {
    this.radius = SnowFlake.randomize(0.1, 2);
    this.velX = SnowFlake.randomize(-0.5, -1);
    this.velY = SnowFlake.randomize(0.5, 1);
  }

  updatePosition() {
    this.x += this.velX;
    this.y += this.velY;
    if (this.x < 0) {
      this.x = this.canvasW;
      this.init();
    }
    if (this.y > this.canvasH) {
      this.y = 0;
      this.init();
    }
  }
}
