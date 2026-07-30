import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { MAX_UPLOAD_BYTES, MIME_EXT } from "./uploads-shared";

/**
 * رفع صور المنتجات. هذه حدّ ثقة: الملف قادم من المتصفح، فلا يُصدَّق منه شيء —
 * لا اسمه ولا امتداده ولا نوعه المُعلن. النوع يُستنتج من البايتات نفسها،
 * والاسم يُولَّد هنا. لا يصل أي جزء من مدخلات المستخدم إلى مسار الملف.
 */

const DB_PATH = process.env.SUFRA_DB_PATH ?? join(process.cwd(), "data", "sufra.db");
const UPLOAD_DIR = join(dirname(DB_PATH), "uploads");

const EXT = MIME_EXT;

/** يقرأ النوع من التوقيع الثنائي — البايتات لا تكذب، بخلاف Content-Type. */
function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";

  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((b, i) => bytes[i] === b)) return "image/png";

  const ascii = (from: number, len: number) =>
    String.fromCharCode(...bytes.subarray(from, from + len));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";

  return null;
}

export type SaveResult =
  | { ok: true; fileName: string; mime: string; bytes: number }
  | { ok: false; error: "empty" | "too_large" | "unsupported_type" };

export async function saveProductImage(file: File): Promise<SaveResult> {
  if (file.size === 0) return { ok: false, error: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "too_large" };

  const bytes = new Uint8Array(await file.arrayBuffer());
  // إعادة فحص الحجم بعد القراءة: file.size رقم مُعلن، والطول الفعلي هو الحقيقة.
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return { ok: false, error: "too_large" };

  const mime = sniffMime(bytes);
  if (!mime) return { ok: false, error: "unsupported_type" };

  const fileName = `${randomUUID().replace(/-/g, "")}.${EXT[mime]}`;
  mkdirSync(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, fileName), bytes);

  return { ok: true, fileName, mime, bytes: bytes.byteLength };
}

/** أسماء نولّدها نحن فقط: ٣٢ خانة ست عشرية ثم امتداد معروف. */
const SAFE_NAME = /^[0-9a-f]{32}\.(jpg|png|webp)$/;

export async function readProductImage(
  fileName: string,
): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!SAFE_NAME.test(fileName)) return null;

  const ext = fileName.split(".").pop()!;
  const mime = Object.entries(EXT).find(([, e]) => e === ext)?.[0];
  if (!mime) return null;

  try {
    return { bytes: await readFile(join(UPLOAD_DIR, fileName)), mime };
  } catch {
    return null;
  }
}
