import { toPng } from "html-to-image";

const EXPORT_BACKGROUND = "#f3f7f4";

export async function saveElementAsPng(elementId: string, filename: string) {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Export target not found: ${elementId}`);
  }

  await document.fonts?.ready;

  const dataUrl = await toPng(element, {
    backgroundColor: EXPORT_BACKGROUND,
    cacheBust: true,
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
