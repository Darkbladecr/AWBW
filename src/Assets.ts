import { decompressFrames, parseGIF } from "gifuct-js";
import {
  ETerrain,
  ITerrainMetadata,
  getTerrainMetadata,
} from "./models/Terrain";
import {
  EUnit,
  IUnitMetadata,
  countryUnits,
  unitMetadata,
} from "./models/Unit";

import { EDecal, IDecalMetadata, getDecalMetadata } from "./models/Decal";
import { ISpriteMetadata } from "./models/Sprite";
import { EMapStyle, STYLES } from "./models/types";
import { terrainFilenames, decalFilenames } from "./models/files";

export type TerrainSpriteMetadata = ITerrainMetadata & ISpriteMetadata;
export type UnitSpriteMetadata = IUnitMetadata & ISpriteMetadata;
export type DecalSpriteMetadata = IDecalMetadata & ISpriteMetadata;
export type SpriteMetadata =
  | TerrainSpriteMetadata
  | UnitSpriteMetadata
  | DecalSpriteMetadata;

class Assets {
  terrain: Map<ETerrain, TerrainSpriteMetadata> = new Map();
  units: Map<EUnit, UnitSpriteMetadata> = new Map();
  decals: Map<EDecal, DecalSpriteMetadata> = new Map();

  /**
   * load all assets asynchronously and assign to this.assets
   */
  async init() {
    await this._loadAssets();

    return this;
  }

  private async _loadAssets() {
    const [terrainAW1, terrainAW2, terrainANI] = await Promise.all(
      STYLES.map((style) =>
        Promise.all(this._loadGifs("terrain", style, terrainFilenames))
      )
    );

    const [terrainAW1Frames, terrainAW2Frames, terrainANIFrames] =
      await Promise.all(
        [terrainAW1, terrainAW2, terrainANI].map((htmlEls) =>
          Promise.all(htmlEls.map(this._decodeGif))
        )
      );

    for (let i = 0; i < terrainAW1.length; i++) {
      let index: ETerrain = i + 1;
      // fix for deleted sprites from AWBW
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

      this.terrain.set(index, {
        ...getTerrainMetadata(index),
        offsetX: 0,
        offsetY: 0,
        sprites: [terrainAW1[i], terrainAW2[i], terrainANI[i]],
        frames: [terrainAW1Frames[i], terrainAW2Frames[i], terrainANIFrames[i]],
      });
    }

    const [unitAW1, unitAW2, unitANI] = await Promise.all(
      STYLES.map((style) =>
        Promise.all(this._loadGifs("units", style, countryUnits))
      )
    );

    const [unitAW1Frames, unitAW2Frames, unitANIFrames] = await Promise.all(
      [unitAW1, unitAW2, unitANI].map((htmlEls) =>
        Promise.all(htmlEls.map(this._decodeGif))
      )
    );

    for (let i = 0; i < unitAW1.length; i++) {
      this.units.set(i, {
        ...unitMetadata[i],
        offsetX: 0,
        offsetY: 0,
        sprites: [unitAW1[i], unitAW2[i], unitANI[i]],
        frames: [unitAW1Frames[i], unitAW2Frames[i], unitANIFrames[i]],
      });
    }

    const decals = await Promise.all(
      this._loadGifs("decals", null, decalFilenames)
    );
    const decalFrames = await Promise.all(decals.map(this._decodeGif));

    for (let i = 0; i < decals.length; i++) {
      this.decals.set(i, {
        name: decalFilenames[i],
        offsetX: 0,
        offsetY: 0,
        sprites: [decals[i], decals[i], decals[i]],
        frames: [decalFrames[i], decalFrames[i], decalFrames[i]],
        ...getDecalMetadata(i),
      });
    }
  }

  /**
   * decode gif from HTMLImageElement or URI
   * @returns ParsedFrame
   */
  private async _decodeGif(img: HTMLImageElement | string) {
    const uri = typeof img === "string" ? img : img.src;
    const resp = await fetch(uri);
    const buff = await resp.arrayBuffer();
    const gif = parseGIF(buff);
    const frames = decompressFrames(gif, true);
    return frames;
  }

  /**
   * load all Gifs and create HTMLImageElements for them
   * @returns
   */
  private _loadGifs(
    path: string,
    styleType: EMapStyle | null,
    filenames: string[]
  ): Promise<HTMLImageElement>[] {
    let style = "";
    if (styleType !== null) {
      style = ["aw1", "aw2", "ani"][styleType] + "/";
    }
    return filenames.map(
      (filename) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = `sprites/${path}/${style}${filename}.gif`;
        })
    );
  }
}

export default Assets;
