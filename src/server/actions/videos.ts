"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { extractVimeoId } from "@/lib/vimeo";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStatus(value: FormDataEntryValue | null) {
  if (value === "PUBLISHED") return "PUBLISHED";
  if (value === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

function parseDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  return new Date(`${value}T00:00:00.000Z`);
}

async function resolveCategory(formData: FormData) {
  const categoryId = String(formData.get("categoryId") ?? "");
  const newCategory = String(formData.get("newCategory") ?? "").trim();

  if (newCategory) {
    const slug = slugify(newCategory);

    return db.videoCategory.upsert({
      where: { slug },
      update: { name: newCategory },
      create: {
        name: newCategory,
        slug,
      },
    });
  }

  if (categoryId) {
    return db.videoCategory.findUnique({
      where: { id: categoryId },
    });
  }

  return null;
}

function getVideoData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || title);
  const rawVimeoUrl = String(formData.get("vimeoUrl") ?? "").trim();
  const rawVimeoId = String(formData.get("vimeoId") ?? "").trim();
  const vimeoId = rawVimeoId || extractVimeoId(rawVimeoUrl);

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!slug) {
    throw new Error("Slug is required.");
  }

  return {
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    vimeoUrl: rawVimeoUrl || (vimeoId ? `https://vimeo.com/${vimeoId}` : null),
    vimeoId: vimeoId || null,
    duration: String(formData.get("duration") ?? "").trim() || null,
    date: parseDate(formData.get("date")),
    status: parseStatus(formData.get("status")),
    featured: formData.get("featured") === "on",
    order: Number(formData.get("order") ?? 0) || 0,
    thumbnailSrc:
      String(formData.get("thumbnailSrc") ?? "").trim() ||
      "/images/videos/film_thailand_01.png",
  };
}

function revalidateVideos() {
  revalidatePath("/");
  revalidatePath("/videos");
  revalidatePath("/admin/videos");
}

export async function createVideo(formData: FormData) {
  const category = await resolveCategory(formData);
  const data = getVideoData(formData);

  await db.video.create({
    data: {
      ...data,
      categoryId: category?.id ?? null,
    },
  });

  revalidateVideos();
  redirect("/admin/videos");
}

export async function updateVideo(id: string, formData: FormData) {
  const category = await resolveCategory(formData);
  const data = getVideoData(formData);

  await db.video.update({
    where: { id },
    data: {
      ...data,
      categoryId: category?.id ?? null,
    },
  });

  revalidateVideos();
  redirect("/admin/videos");
}

export async function deleteVideo(id: string) {
  await db.video.delete({
    where: { id },
  });

  revalidateVideos();
}
