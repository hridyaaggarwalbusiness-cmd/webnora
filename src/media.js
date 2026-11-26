// Small images are kept with structured content so Firebase Storage is optional.
import { esc } from "./data.js";
export function imageUrl(v) {
  if (typeof v !== "string") return "";
  if (/^data:image\/(png|jpeg|webp);base64,[a-z\d+/=]+$/i.test(v))
    return esc(v);
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? esc(u.href) : "";
  } catch {
    return "";
  }
}
export async function thumbnail(file) {
  if (
    !file ||
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 5e6
  )
    throw Error("Choose a PNG, JPEG or WebP smaller than 5 MB.");
  const img = await createImageBitmap(file);
  const c = document.createElement("canvas"),
    ratio = Math.min(1, 960 / img.width, 720 / img.height);
  c.width = Math.round(img.width * ratio);
  c.height = Math.round(img.height * ratio);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  img.close();
  const url = c.toDataURL("image/webp", 0.72);
  if (url.length > 100000) throw Error("Choose a smaller image.");
  return url;
}
