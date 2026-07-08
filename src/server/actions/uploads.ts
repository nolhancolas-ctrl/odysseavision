"use server";

import { access, rename } from "fs/promises";
import path from "path";
import {
  slugifyUploadName,
  uploadImageCore,
} from "@/lib/admin/uploadImageCore";

export async function uploadImage(formData: FormData) {
  return uploadImageCore(formData);
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
