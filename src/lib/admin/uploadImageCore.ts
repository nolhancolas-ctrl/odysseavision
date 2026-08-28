import "server-only";
import { createHash } from "node:crypto";

import { access, mkdir, rename, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import {
  findReusableBlobByContentHash,
  recordBlobImageAssessment,
} from "@/lib/admin/blobImageRegistry";
import {
  IMAGE_OPTIMIZATION_POLICY,
  type BlobImageStatus,
} from "@/lib/admin/imageOptimizationPolicy";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

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

const PHOTO_PROCESS_CONTEXTS = new Set([
  "portfolio",
  "client-album",
  "site",
  "story",
  "video",
  "newsletter",
  "general",
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
  reused?: boolean;
  contentHash?: string;
};

type PreparedUpload = {
  buffer: Buffer;
  fileName: string;
  size: number;
  contentType: string;
  optimization: {
    status: BlobImageStatus;
    format: string | null;
    width: number | null;
    height: number | null;
    policyIssues: string[];
    note: string;
  };
};

function getStoredPolicyIssues({
  size,
  width,
  height,
}: {
  size: number;
  width?: number | null;
  height?: number | null;
}) {
  const issues: string[] = [];

  if (Math.max(width || 0, height || 0) > IMAGE_OPTIMIZATION_POLICY.maxDimension) {
    issues.push(`over-${IMAGE_OPTIMIZATION_POLICY.maxDimension}px`);
  }

  if (size > IMAGE_OPTIMIZATION_POLICY.targetMaxBytes) {
    issues.push("over-1.6mb");
  }

  return issues;
}

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
      optimization: {
        status: "SKIPPED",
        format: file.type.split("/")[1] || null,
        width: null,
        height: null,
        policyIssues: [],
        note: "Format intentionally excluded from WebP optimization.",
      },
    };
  }

  try {
    const sharp = (await import("sharp")).default;

    const metadata = await sharp(buffer).metadata();
    async function createOptimizedWebp(
      maxDimension: number,
      quality: number,
    ) {
      return sharp(buffer)
        .rotate()
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality,
          alphaQuality: 90,
          effort: 5,
        })
        .toBuffer({ resolveWithObject: true });
    }

    let processed = await createOptimizedWebp(
      IMAGE_OPTIMIZATION_POLICY.maxDimension,
      IMAGE_OPTIMIZATION_POLICY.webpQuality,
    );

    const fallbackAttempts = [
      { maxDimension: 2000, quality: 80 },
      { maxDimension: 1800, quality: 78 },
      { maxDimension: 1600, quality: 76 },
    ];

    for (const attempt of fallbackAttempts) {
      if (processed.data.length <= IMAGE_OPTIMIZATION_POLICY.targetMaxBytes) {
        break;
      }

      const candidate = await createOptimizedWebp(
        attempt.maxDimension,
        attempt.quality,
      );

      if (candidate.data.length < processed.data.length) {
        processed = candidate;
      }
    }

    // Never store a processed version that is larger than the source.
    if (processed.data.length >= buffer.length) {
      const policyIssues = getStoredPolicyIssues({
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
      });

      return {
        buffer,
        fileName: getSafeFileName(file, slotKey),
        size: buffer.length,
        contentType: file.type,
        optimization: {
          status: policyIssues.length > 0 ? "NEEDS_OPTIMIZATION" : "COMPLIANT",
          format: metadata.format || null,
          width: metadata.width || null,
          height: metadata.height || null,
          policyIssues,
          note:
            policyIssues.length > 0
              ? "Original retained because WebP was larger, but manual review is still needed."
              : "Original retained because WebP would have been larger.",
        },
      };
    }

    const policyIssues = getStoredPolicyIssues({
      size: processed.data.length,
      width: processed.info.width,
      height: processed.info.height,
    });

    return {
      buffer: processed.data,
      fileName: getSafeFileName(file, slotKey, "webp"),
      size: processed.data.length,
      contentType: "image/webp",
      optimization: {
        status: policyIssues.length > 0 ? "NEEDS_OPTIMIZATION" : "COMPLIANT",
        format: "webp",
        width: processed.info.width,
        height: processed.info.height,
        policyIssues,
        note:
          policyIssues.length > 0
            ? "WebP created successfully, but the stored file still exceeds the target size."
            : "Optimized during upload with the current WebP policy.",
      },
    };
  } catch (error) {
    console.error("[admin upload] Sharp processing skipped:", {
      message: error instanceof Error ? error.message : "Unknown sharp error.",
      name: error instanceof Error ? error.name : "UnknownError",
    });

    const message =
      error instanceof Error ? error.message : "Sharp processing failed.";

    throw new Error(
      `Automatic image optimization failed; the original was not uploaded: ${message}`,
    );
  }
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
  const contentHash = createHash("sha256")
    .update(prepared.buffer)
    .digest("hex");

  const reusable = await findReusableBlobByContentHash(contentHash);

  if (reusable) {
    return {
      ok: true,
      src: reusable.url,
      path: reusable.url,
      url: reusable.url,
      pathname: reusable.pathname,
      fileName: prepared.fileName,
      size: reusable.storedSize || prepared.size,
      contentType: reusable.contentType || prepared.contentType,
      storage: "blob",
      reused: true,
      contentHash,
    };
  }

  const pathname = `images/${folder}/${Date.now()}-${prepared.fileName}`.replace(
    /\/+/g,
    "/",
  );

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  const blob = await put(pathname, prepared.buffer, {
    access: "public",
    contentType: prepared.contentType,
    addRandomSuffix: true,
    ...(blobToken ? { token: blobToken } : {}),
  });

  try {
    await recordBlobImageAssessment({
      url: blob.url,
      pathname: blob.pathname,
      uploadedAt: new Date(),
      storedSize: prepared.size,
      contentHash,
      contentType: prepared.contentType,
      format: prepared.optimization.format,
      width: prepared.optimization.width,
      height: prepared.optimization.height,
      policyIssues: prepared.optimization.policyIssues,
      status: prepared.optimization.status,
      policyVersion: IMAGE_OPTIMIZATION_POLICY.version,
      referenced: false,
      note: prepared.optimization.note,
    });
  } catch (error) {
    // The next registry sync will recover this Blob as UNKNOWN.
    console.error("[admin upload] Blob optimization status was not recorded:", error);
  }

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
    reused: false,
    contentHash,
  };
}


function getSafeLocalImagePath(publicPath: string) {
  if (!publicPath.startsWith("/images/")) {
    return null;
  }

  const root = path.resolve(process.cwd(), "public", "images");
  const relative = publicPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(process.cwd(), "public", relative);

  if (!absolutePath.startsWith(root + path.sep)) {
    return null;
  }

  return {
    absolutePath,
  };
}

async function getAvailableLocalRenamePath({
  folder,
  baseName,
  extension,
  currentAbsolutePath,
}: {
  folder: string;
  baseName: string;
  extension: string;
  currentAbsolutePath: string;
}) {
  let index = 1;

  while (true) {
    const suffix = index === 1 ? "" : `-${index}`;
    const filename = `${baseName}${suffix}.${extension}`;
    const absolutePath = path.join(folder, filename);

    if (absolutePath === currentAbsolutePath) {
      return absolutePath;
    }

    try {
      await access(absolutePath);
      index += 1;
    } catch {
      return absolutePath;
    }
  }
}

export async function renameUploadedImageCore(formData: FormData) {
  const currentPath = String(formData.get("currentPath") ?? "").trim();
  const requestedName = String(formData.get("requestedName") ?? "").trim();

  if (!currentPath) {
    return {
      ok: false,
      error: "No image path received.",
      path: currentPath,
    };
  }

  if (!requestedName) {
    return {
      ok: false,
      error: "Please enter a file name.",
      path: currentPath,
    };
  }

  const safePath = getSafeLocalImagePath(currentPath);

  if (!safePath) {
    return {
      ok: false,
      error: "Blob filenames cannot be changed after upload.",
      path: currentPath,
    };
  }

  const extension = path.extname(safePath.absolutePath).replace(".", "");

  if (!extension) {
    return {
      ok: false,
      error: "This file has no extension.",
      path: currentPath,
    };
  }

  const requestedBase = path.basename(requestedName).replace(/\.[^.]+$/, "");
  const baseName = slugifyUploadName(requestedBase);

  if (!baseName) {
    return {
      ok: false,
      error: "Invalid file name.",
      path: currentPath,
    };
  }

  const folder = path.dirname(safePath.absolutePath);
  const nextAbsolutePath = await getAvailableLocalRenamePath({
    folder,
    baseName,
    extension,
    currentAbsolutePath: safePath.absolutePath,
  });

  if (nextAbsolutePath !== safePath.absolutePath) {
    await rename(safePath.absolutePath, nextAbsolutePath);
  }

  const relativePath = path
    .relative(path.join(process.cwd(), "public"), nextAbsolutePath)
    .split(path.sep)
    .join("/");

  return {
    ok: true,
    error: "",
    path: `/${relativePath}`,
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

  if (process.env.VERCEL) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN in Vercel runtime.");
  }

  return uploadToLocal({
    prepared,
    folder,
  });
}
