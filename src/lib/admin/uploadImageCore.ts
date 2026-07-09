import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

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

function getUploadFolder(
  context: UploadContext,
  entitySlug: string,
) {
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

function getSafeFileName(file: File, slotKey: string) {
  const extension = getExtension(file);
  const baseName = getBaseName(file, slotKey);

  return `${baseName}.${extension}`;
}

async function uploadToLocal({
  file,
  buffer,
  folder,
  fileName,
}: {
  file: File;
  buffer: Buffer;
  folder: string;
  fileName: string;
}): Promise<UploadResult> {
  const publicFolder = path.join(process.cwd(), "public", "images", folder);
  await mkdir(publicFolder, { recursive: true });

  const filePath = path.join(publicFolder, fileName);
  await writeFile(filePath, buffer);

  const src = `/images/${folder}/${fileName}`.replace(/\/+/g, "/");

  return {
    ok: true,
    src,
    path: src,
    url: src,
    pathname: src,
    fileName,
    size: file.size,
    contentType: file.type,
    storage: "local",
  };
}

async function uploadToBlob({
  file,
  buffer,
  folder,
  fileName,
}: {
  file: File;
  buffer: Buffer;
  folder: string;
  fileName: string;
}): Promise<UploadResult> {
  const pathname = `images/${folder}/${Date.now()}-${fileName}`.replace(
    /\/+/g,
    "/",
  );

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: true,
  });

  return {
    ok: true,
    src: blob.url,
    path: blob.url,
    url: blob.url,
    pathname: blob.pathname,
    fileName,
    size: file.size,
    contentType: file.type,
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
  const fileName = getSafeFileName(file, slotKey);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob({
      file,
      buffer,
      folder,
      fileName,
    });
  }

  return uploadToLocal({
    file,
    buffer,
    folder,
    fileName,
  });
}
