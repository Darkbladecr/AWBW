import {
  Building,
  Decal,
  Terrain,
  Unit,
  ECountry,
  IMapLayer,
  CO,
} from "./models";
import { Movement } from "./movement/Movement";
import { EWeather } from "./weather";

export interface IStateArgs {
  players: IPlayer[];
  width: number;
  height: number;
  root: HTMLElement;
}

export interface IPlayer {
  co: CO;
  country: ECountry;
}

export enum ELayer {
  STATIC,
  DYNAMIC,
  HELPERS,
  UNITS,
  HP,
  FUEL,
  AMMO,
  CAPTURE,
  CURSOR,
  UI,
}

export type GameMapLayers = [
  IMapLayer<Terrain>,
  IMapLayer<Building>,
  IMapLayer<any>, // helpers
  IMapLayer<Unit>,
  IMapLayer<Decal>, // hp
  IMapLayer<Decal>, // fuel
  IMapLayer<Decal>, // ammo
  IMapLayer<Decal>, // capture
  IMapLayer<Decal>, // cursor
  IMapLayer<any> // UI
];

export class State {
  players: IPlayer[];
  playerIdxTurn = 0;
  day = 1;

  weather = EWeather.CLEAR;
  layers!: GameMapLayers;
  movement!: Movement;

  // grid width & height
  private _width = 0;
  private _height = 0;
  grid = 16;
  padding = 4;
  widthPx!: number;
  heightPx!: number;

  root: HTMLElement;
  debug = true;

  static layerNames = Object.keys(ELayer);

  /**
   * Iterator to efficiently loop through all (x,y) coordinates on each layer
   */
  static *gridIterator(layers: number, width: number, height: number) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let layerId = 0; layerId < layers; layerId++) {
          yield { layerId, x, y };
        }
      }
    }
  }

  constructor({ players, width, height, root }: IStateArgs) {
    this.players = players;
    this._width = width;
    this.widthPx = width * this.grid + this.padding * 2;
    this._height = height;
    this.heightPx = height * this.grid + this.padding * 2;
    this.root = root;

    this._setupLayers();
  }

  setGrid(x: number, y: number) {
    if (x < 1 || y < 1) {
      throw new Error("Cannot make a grid with < 1 row or column.");
    }
    this._width = x;
    this.widthPx = x * this.grid + this.padding * 2;
    this._height = y;
    this.heightPx = y * this.grid + this.padding * 2;
    this._setupLayers();
  }

  get width() {
    return this._width;
  }
  set width(x: number) {
    this._width = x;
    this.widthPx = x * this.grid + this.padding * 2;
    this._setupLayers();
  }

  get height() {
    return this._height;
  }
  set height(y: number) {
    this._height = y;
    this.heightPx = y * this.grid + this.padding * 2;
    this._setupLayers();
  }

  private _setupLayers() {
    this.root.innerHTML = "";
    let layers: IMapLayer<any>[] = [];
    for (let i = 0; i < State.layerNames.length; i++) {
      const label = State.layerNames[i];

      const canvas = document.createElement("canvas");
      canvas.id = label;
      canvas.classList.add("layer");
      canvas.style["zIndex"] = i.toString();
      canvas.width = this.widthPx;
      canvas.height = this.heightPx;

      this.root.appendChild(canvas);

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
    if (this.width > 0 && this.height > 0) {
      layers[ELayer.STATIC].canvas.style.backgroundColor = "#000";
    }
    this.layers = layers as GameMapLayers;
  }
}
