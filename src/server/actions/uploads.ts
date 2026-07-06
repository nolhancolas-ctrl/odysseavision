"use server";

import { access, mkdir, rename, writeFile } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 12 * 1024 * 1024;

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanFolder(value: string) {
  return value
    .split("/")
    .map((part) => slugify(part))
    .filter(Boolean)
    .join("/");
}

function getUploadFolder(formData: FormData) {
  const context = String(formData.get("context") ?? "misc");
  const pageKey = String(formData.get("pageKey") ?? "");
  const sectionKey = String(formData.get("sectionKey") ?? "");
  const slotKey = String(formData.get("slotKey") ?? "");
  const entitySlug = String(formData.get("entitySlug") ?? "");

  if (context === "website-page") {
    return cleanFolder(`${pageKey}/${sectionKey}`);
  }

  if (context === "story") {
    return cleanFolder(`stories/${entitySlug || "draft"}`);
  }

  if (context === "portfolio") {
    return cleanFolder(`portfolio/items/${entitySlug || "draft"}`);
  }

  if (context === "client-album") {
    return cleanFolder(`client-albums/${entitySlug || "draft"}`);
  }

  if (context === "video") {
    return cleanFolder(`videos/${entitySlug || "draft"}/${slotKey || "thumbnail"}`);
  }

  if (context === "newsletter") {
    return cleanFolder(`newsletters/${entitySlug || "draft"}`);
  }

  if (context === "seo") {
    return cleanFolder("seo");
  }

  if (context === "appearance") {
    return cleanFolder("admin");
  }

  return cleanFolder(`uploads/${context}/${slotKey || "image"}`);
}

function getBaseName(formData: FormData, originalName: string) {
  const slotKey = String(formData.get("slotKey") ?? "");
  const label = String(formData.get("label") ?? "");
  const fallback = originalName.replace(/\.[^.]+$/, "");

  return slugify(slotKey || label || fallback || "image");
}

async function uniqueFilePath(folder: string, baseName: string, extension: string) {
  const absoluteFolder = path.join(process.cwd(), "public", "images", folder);
  await mkdir(absoluteFolder, { recursive: true });

  let index = 1;

  while (true) {
    const suffix = index === 1 ? "" : `-${index}`;
    const filename = `${baseName}${suffix}.${extension}`;
    const absolutePath = path.join(absoluteFolder, filename);

    try {
      await writeFile(absolutePath, Buffer.alloc(0), { flag: "wx" });
      return {
        absolutePath,
        publicPath: `/images/${folder}/${filename}`,
      };
    } catch {
      index += 1;
    }
  }
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      ok: false,
      error: "No file received.",
      path: "",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: "File is too large. Maximum size is 12 MB.",
      path: "",
    };
  }

  const extension = allowedMimeTypes.get(file.type);

  if (!extension) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPG, PNG, WEBP, GIF or SVG.",
      path: "",
    };
  }

  const folder = getUploadFolder(formData);
  const baseName = getBaseName(formData, file.name);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { absolutePath, publicPath } = await uniqueFilePath(
    folder,
    baseName,
    extension,
  );

  await writeFile(absolutePath, buffer);

  return {
    ok: true,
    error: "",
    path: publicPath,
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
    root,
    absolutePath,
  };
}

async function getAvailableRenamePath(
  folder: string,
  baseName: string,
  extension: string,
  currentAbsolutePath: string,
) {
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

export async function renameUploadedImage(formData: FormData) {
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
      error: "Only local /images files can be renamed.",
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

  const requestedBase = path
    .basename(requestedName)
    .replace(/\.[^.]+$/, "");

  const baseName = slugify(requestedBase);

  if (!baseName) {
    return {
      ok: false,
      error: "Invalid file name.",
      path: currentPath,
    };
  }

  const folder = path.dirname(safePath.absolutePath);
  const nextAbsolutePath = await getAvailableRenamePath(
    folder,
    baseName,
    extension,
    safePath.absolutePath,
  );

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
