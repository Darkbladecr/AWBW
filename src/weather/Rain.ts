export class RainLine {
  x!: number;
  y!: number;
  canvasW: number;
  canvasH: number;
  private a: number;
  sinA: number;
  cosA: number;
  l!: number;
  v!: number;

  constructor(canvasW: number, canvasH: number) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.a = (20 * Math.PI) / 180;
    this.sinA = Math.sin(this.a);
    this.cosA = Math.cos(this.a);
    this.init();
  }

  init() {
    this.x = Math.floor(
      Math.random() * (this.canvasW + this.canvasW * Math.sin(this.a + 0.1))
    );
    this.y = Math.floor(Math.random() * this.canvasH - this.canvasH);
    this.l = Math.floor(Math.random() * 15) + 10;
    this.v = Math.floor(Math.random() * 2) + 2;
  }

  updatePosition() {
    this.x -= this.v * this.sinA;
    this.y += this.v * this.cosA;
    if (this.y > this.canvasH) {
      this.init();
    }
  }
}
