import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export const MAX_ORIGINAL_MB = 15;
const MAX_SIDE = 800;
const QUALITY = 0.82;

export const isImage = (file: File) => /^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.type);

// 브라우저에서 긴 변 800px로 줄이고 WebP로 압축 (용량·업로드 시간 절약)
export async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  if (blob && blob.type === "image/webp") return blob;
  // WebP를 지원하지 않는 브라우저(일부 Safari)는 JPEG로
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!jpeg) throw new Error("이미지를 변환하지 못했어요.");
  return jpeg;
}

// 메뉴 사진 업로드 → 다운로드 URL
export async function uploadMenuPhoto(shopId: string, index: number, file: File): Promise<string> {
  const blob = await resizeImage(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `shops/${shopId}/menus/${Date.now()}-${index}.${ext}`;
  const snap = await uploadBytes(ref(storage, path), blob, { contentType: blob.type, cacheControl: "public, max-age=31536000" });
  return getDownloadURL(snap.ref);
}
