import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No file received.", path: "" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          error: "File is too large. Maximum size is 25 MB.",
          path: "",
        },
        { status: 400 },
      );
    }

    const extension = allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unsupported file type. Use JPG, PNG, WEBP, GIF or SVG.",
          path: "",
        },
        { status: 400 },
      );
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

    return NextResponse.json({
      ok: true,
      error: "",
      path: publicPath,
    });
  } catch (error) {
    console.error("[admin upload api] Upload failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Upload failed on server.",
        path: "",
      },
      { status: 500 },
    );
  }
}
