import { RainLine } from "./Rain";
import { SnowFlake } from "./Snow";

export enum EWeather {
  CLEAR,
  RAIN,
  SNOW,
}

export class Weather {
  private _state = EWeather.CLEAR;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  snowflakes: SnowFlake[] = [];
  rainLines: RainLine[] = [];
  animationReq: number | undefined;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.style.direction = "block";
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No canvas 2d layer");
    }
    this.ctx = ctx;

    // prepare snow
    const maxFlakes = Math.floor(this.canvas.width * 0.4);
    for (let i = 0; i < maxFlakes; i++) {
      this.snowflakes.push(
        new SnowFlake(this.canvas.width, this.canvas.height)
      );
    }
    const rainDensity = 0.3;
    const maxRain = (this.canvas.width * rainDensity) | 0;
    for (let i = 0; i < maxRain; i++) {
      this.rainLines.push(new RainLine(this.canvas.width, this.canvas.height));
    }
  }

  get state() {
    return this._state;
  }
  set state(state: EWeather) {
    if (this._state === state) {
      return;
    }
    this.cancel();
    this._state = state;
    if (this._state !== EWeather.CLEAR) {
      this.start();
    }
  }

  start() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    if (this._state === EWeather.SNOW) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      for (const snowflake of this.snowflakes) {
        snowflake.updatePosition();
        this.ctx.beginPath();
        this.ctx.arc(
          snowflake.x,
          snowflake.y,
          snowflake.radius,
          0,
          2 * Math.PI
        );
        this.ctx.fill();
      }
    } else if (this._state === EWeather.RAIN) {
      this.ctx.strokeStyle = "white";
      for (const rain of this.rainLines) {
        // draw rain
        this.ctx.beginPath();
        this.ctx.moveTo(rain.x, rain.y);
        const dx = rain.x - rain.l * rain.sinA;
        const dy = rain.y - rain.l * rain.cosA;
        this.ctx.lineTo(dx, dy);
        this.ctx.stroke();
        // update rain position
        rain.updatePosition();
      }
    }
    this.animationReq = requestAnimationFrame(this.start.bind(this));
    this.ctx.restore();
  }
  cancel() {
    if (this.animationReq) {
      cancelAnimationFrame(this.animationReq);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
