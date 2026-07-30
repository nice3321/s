/** ثوابت الرفع المشتركة بين الخادم والمتصفح. lib/uploads.ts خادمية بحتة. */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ACCEPTED_MIME = Object.keys(MIME_EXT);
