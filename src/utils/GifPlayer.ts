import { ParsedFrame } from "gifuct-js";

class GifPlayer {
  loadedFrames: ParsedFrame[] = [];
  frameIndex = 0;
  initialFrameData: ImageData | undefined;
  frameImageData: ImageData | undefined;
  posX: number;
  posY: number;
  autoplay: boolean;
  playing = false;
  timeoutId: number | undefined;
  needsDisposal = false;
  width = 0;
  height = 0;

  // main canvas ctx
  ctx: CanvasRenderingContext2D;
  // gif patch canvas
  diffCanvas: HTMLCanvasElement;
  diffCtx: CanvasRenderingContext2D;
  // combined full gif canvas
  fullCanvas: HTMLCanvasElement;
  fullCtx: CanvasRenderingContext2D;

  constructor(
    frames: ParsedFrame[],
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    autoplay = true
  ) {
    this.loadedFrames = frames;
    this.width = frames[0].dims.width;
    this.height = frames[0].dims.height;

    this.posX = x;
    this.posY = y;
    this.autoplay = autoplay;

    this.ctx = ctx;

    this.diffCanvas = document.createElement("canvas");
    this.diffCtx = this.diffCanvas.getContext("2d") as CanvasRenderingContext2D;

    this.fullCanvas = document.createElement("canvas");
    this.fullCtx = this.fullCanvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    this.fullCanvas.width = this.width;
    this.fullCanvas.height = this.height;

    this._createDiffBackground();
    this._resetDiffBackground();

    if (!this.playing && this.autoplay) {
      this.playPause();
    } else {
      // generate first frame
      this._renderFrame();
    }
  }

  playPause() {
    this.playing = !this.playing;
    if (this.playing) {
      this._renderFrame();
    } else if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private _renderFrame() {
    // get the frame
    const frame = this.loadedFrames[this.frameIndex];
    const start = new Date().getTime();

    if (this.needsDisposal) {
      this._resetDiffBackground();
      this.needsDisposal = false;
    }

    // draw the patch
    this._drawPatch(frame);

    // update the frame index
    this.frameIndex += 1;
    if (this.frameIndex >= this.loadedFrames.length) {
      this.frameIndex = 0;
    }

    if (frame.disposalType === 2) {
      this.needsDisposal = true;
    }

    const end = new Date().getTime();
    const diff = end - start;

    if (this.playing) {
      // delay the next gif frame
      this.timeoutId = setTimeout(() => {
        window.requestAnimationFrame(this._renderFrame.bind(this));
      }, Math.max(0, Math.floor(frame.delay - diff)));
    }
  }

  private _drawPatch(frame: ParsedFrame) {
    const { dims } = frame;

    if (
      !this.frameImageData ||
      dims.width !== this.frameImageData.width ||
      dims.height !== this.frameImageData.height
    ) {
      this.diffCanvas.width = dims.width;
      this.diffCanvas.height = dims.height;
      this.frameImageData = this.diffCtx.createImageData(
        dims.width,
        dims.height
      );
    }
    // set the patch data as an override
    this.frameImageData.data.set(frame.patch);

    // draw the patch back over the canvas
    this.diffCtx.putImageData(this.frameImageData, 0, 0);

    this.fullCtx.drawImage(this.diffCanvas, dims.left, dims.top);

    const imageData = this.fullCtx.getImageData(
      0,
      0,
      this.fullCanvas.width,
      this.fullCanvas.height
    );
    this.ctx.putImageData(imageData, this.posX, this.posY);
  }

  private _createDiffBackground() {
    const imageData = this.ctx.getImageData(
      this.posX,
      this.posY,
      this.width,
      this.height
    );
    this.initialFrameData = imageData;
  }

  private _resetDiffBackground() {
    if (!this.initialFrameData) {
      return;
    }
    this.diffCtx.putImageData(this.initialFrameData, 0, 0);
    this.fullCtx.putImageData(this.initialFrameData, 0, 0);
  }
}

export default GifPlayer;
