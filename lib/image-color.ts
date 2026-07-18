function componentToHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = l - chroma / 2;
  const [red, green, blue] =
    hue < 60 ? [chroma, x, 0] :
    hue < 120 ? [x, chroma, 0] :
    hue < 180 ? [0, chroma, x] :
    hue < 240 ? [0, x, chroma] :
    hue < 300 ? [x, 0, chroma] : [chroma, 0, x];

  return `#${componentToHex((red + match) * 255)}${componentToHex((green + match) * 255)}${componentToHex((blue + match) * 255)}`;
}

export function bannerColorFromHue(hue: string | number) {
  const numericHue = Number(hue);
  return hslToHex(Number.isFinite(numericHue) ? numericHue : 220, 52, 38);
}

export async function extractMatchingBannerColor(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const size = 48;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    bitmap.close();
    throw new Error("Canvas is unavailable");
  }

  context.drawImage(bitmap, 0, 0, size, size);
  bitmap.close();
  const pixels = context.getImageData(0, 0, size, size).data;
  let red = 0;
  let green = 0;
  let blue = 0;
  let totalWeight = 0;

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.45) continue;

    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 510;
    if (lightness < 0.06 || lightness > 0.94) continue;

    const saturation = max === min
      ? 0
      : (max - min) / (255 - Math.abs(max + min - 255));
    const weight = alpha * (0.45 + saturation * 1.55);
    red += r * weight;
    green += g * weight;
    blue += b * weight;
    totalWeight += weight;
  }

  if (!totalWeight) return "#325578";

  const r = red / totalWeight / 255;
  const g = green / totalWeight / 255;
  const b = blue / totalWeight / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
  return hslToHex(hue, Math.min(72, Math.max(38, saturation * 110)), Math.min(48, Math.max(30, lightness * 78)));
}
