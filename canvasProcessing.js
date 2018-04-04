export function removeUnneededEntities(canvas) {
  const ctx = canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let { data } = imageData;
  let oData = originalImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const left = i - 4;
    const top = i - canvas.width * 4;
    const bottom = i + canvas.width * 4;
    const right = i + 4;

    if (
      data[i] === 0 &&
      !oData[left] &&
      !oData[top] &&
      !oData[bottom] &&
      !oData[right]
    ) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
