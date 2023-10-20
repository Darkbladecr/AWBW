function drawGrid() {
  // vertical
  for (let i = 0; i < width; i = i + grid) {
    if (i === 0) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
    ctx.closePath();
  }
  // horizontal
  for (let i = 0; i < height; i = i + grid) {
    if (i === 0) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
    ctx.closePath();
  }
}