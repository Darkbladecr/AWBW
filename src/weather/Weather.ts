import { State } from "./../State";
import { RainLine } from "./Rain";
import { SnowFlake } from "./Snow";

export enum EWeather {
  CLEAR,
  RAIN,
  SNOW,
}

export class Weather {
  state: State;
  private _type = EWeather.CLEAR;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  snowflakes: SnowFlake[] = [];
  rainLines: RainLine[] = [];
  animationReq: number | undefined;

  constructor(state: State, canvas: HTMLCanvasElement) {
    this.state = state;
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
    this.start();
  }

  get type() {
    return this._type;
  }
  set type(type: EWeather) {
    if (this._type === type) {
      return;
    }
    this.state.movement.clear();
    this.cancel();
    this._type = type;
    if (this._type !== EWeather.CLEAR) {
      this.start();
    }
  }

  start() {
    if (this._type === EWeather.CLEAR) {
      this.cancel();
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    if (this._type === EWeather.SNOW) {
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
    } else if (this._type === EWeather.RAIN) {
      this.ctx.strokeStyle = "white";
      for (const rain of this.rainLines) {
        // draw rain
        this.ctx.beginPath();
        this.ctx.moveTo(rain.x, rain.y);
        const dx = rain.x + rain.l * rain.sinA;
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
