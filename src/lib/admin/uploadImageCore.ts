import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const MAX_PHOTO_WIDTH = 2600;
const PHOTO_WEBP_QUALITY = 84;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const PROCESSABLE_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PHOTO_PROCESS_CONTEXTS = new Set(["portfolio", "client-album"]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

type UploadContext =
  | "portfolio"
  | "story"
  | "video"
  | "client-album"
  | "newsletter"
  | "site"
  | "general";

type UploadResult = {
  ok: true;
  error?: string;
  src: string;
  path: string;
  url: string;
  pathname: string;
  fileName: string;
  size: number;
  contentType: string;
  storage: "blob" | "local";
};

type PreparedUpload = {
  buffer: Buffer;
  fileName: string;
  size: number;
  contentType: string;
};

export function slugifyUploadName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);
}

function cleanFolder(value: string) {
  return value
    .split("/")
    .map((part) =>
      slugifyUploadName(part)
        .replace(/\.+/g, ".")
        .replace(/(^\.|\.$)/g, ""),
    )
    .filter(Boolean)
    .join("/");
}

function getUploadFolder(context: UploadContext, entitySlug: string) {
  const cleanSlug = slugifyUploadName(entitySlug || "draft");

  if (context === "portfolio") {
    return cleanFolder(`portfolio/${cleanSlug}`);
  }

  if (context === "story") {
    return cleanFolder(`stories/${cleanSlug}`);
  }

  if (context === "video") {
    return cleanFolder(`videos/${cleanSlug}`);
  }

  if (context === "client-album") {
    return cleanFolder(`client-albums/${cleanSlug}`);
  }

  if (context === "newsletter") {
    return cleanFolder(`newsletters/${cleanSlug}`);
  }

  if (context === "site") {
    return cleanFolder(`site/${cleanSlug}`);
  }

  return cleanFolder(`uploads/${cleanSlug}`);
}

function getExtension(file: File) {
  const originalExtension = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeExtension = EXTENSION_BY_MIME[file.type];

  return mimeExtension || originalExtension || "bin";
}

function getBaseName(file: File, slotKey: string) {
  const originalName = file.name.replace(/\.[a-z0-9]+$/i, "");
  return slugifyUploadName(slotKey || originalName || "image") || "image";
}

function getSafeFileName(file: File, slotKey: string, extension?: string) {
  const safeExtension = extension || getExtension(file);
  const baseName = getBaseName(file, slotKey);

  return `${baseName}.${safeExtension}`;
}

async function preparePhotoUpload({
  file,
  buffer,
  context,
  slotKey,
}: {
  file: File;
  buffer: Buffer;
  context: UploadContext;
  slotKey: string;
}): Promise<PreparedUpload> {
  const shouldProcess =
    PHOTO_PROCESS_CONTEXTS.has(context) &&
    PROCESSABLE_PHOTO_MIME_TYPES.has(file.type);

  if (!shouldProcess) {
    return {
      buffer,
      fileName: getSafeFileName(file, slotKey),
      size: buffer.length,
      contentType: file.type,
    };
  }

  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_PHOTO_WIDTH,
      withoutEnlargement: true,
    })
    .webp({
      quality: PHOTO_WEBP_QUALITY,
      effort: 5,
    })
    .toBuffer();

  return {
    buffer: processedBuffer,
    fileName: getSafeFileName(file, slotKey, "webp"),
    size: processedBuffer.length,
    contentType: "image/webp",
  };
}

async function uploadToLocal({
  prepared,
  folder,
}: {
  prepared: PreparedUpload;
  folder: string;
}): Promise<UploadResult> {
  const publicFolder = path.join(process.cwd(), "public", "images", folder);
  await mkdir(publicFolder, { recursive: true });

  const filePath = path.join(publicFolder, prepared.fileName);
  await writeFile(filePath, prepared.buffer);

  const src = `/images/${folder}/${prepared.fileName}`.replace(/\/+/g, "/");

  return {
    ok: true,
    src,
    path: src,
    url: src,
    pathname: src,
    fileName: prepared.fileName,
    size: prepared.size,
    contentType: prepared.contentType,
    storage: "local",
  };
}

async function uploadToBlob({
  prepared,
  folder,
}: {
  prepared: PreparedUpload;
  folder: string;
}): Promise<UploadResult> {
  const pathname = `images/${folder}/${Date.now()}-${prepared.fileName}`.replace(
    /\/+/g,
    "/",
  );

  const blob = await put(pathname, prepared.buffer, {
    access: "public",
    contentType: prepared.contentType,
    addRandomSuffix: true,
  });

  return {
    ok: true,
    src: blob.url,
    path: blob.url,
    url: blob.url,
    pathname: blob.pathname,
    fileName: prepared.fileName,
    size: prepared.size,
    contentType: prepared.contentType,
    storage: "blob",
  };
}

export async function uploadImageCore(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No image file provided.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported image format.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Image is too large.");
  }

  const context = String(formData.get("context") || "general") as UploadContext;
  const entitySlug = String(formData.get("entitySlug") || "draft");
  const slotKey = String(formData.get("slotKey") || "");

  const folder = getUploadFolder(context, entitySlug);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const prepared = await preparePhotoUpload({
    file,
    buffer,
    context,
    slotKey,
  });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob({
      prepared,
      folder,
    });
  }

  return uploadToLocal({
    prepared,
    folder,
  });
}
