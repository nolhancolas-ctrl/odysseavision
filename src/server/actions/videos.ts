"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deleteBlobsIfUnreferenced } from "@/lib/admin/blobCleanup";
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

  const lastVideo = await db.video.aggregate({
    _max: { order: true },
  });
  const nextOrder = (lastVideo._max.order ?? -1) + 1;

  await db.video.create({
    data: {
      ...data,
      categoryId: category?.id ?? null,
      order: nextOrder,
      featured: false,
    },
  });

  revalidateVideos();
  redirect("/admin/videos");
}

export async function updateVideo(id: string, formData: FormData) {
  const category = await resolveCategory(formData);
  const data = getVideoData(formData);

  const previous = await db.video.findUnique({
    where: { id },
    select: { thumbnailSrc: true },
  });

  await db.video.update({
    where: { id },
    data: {
      ...data,
      categoryId: category?.id ?? null,
    },
  });

  if (
    previous?.thumbnailSrc &&
    previous.thumbnailSrc !== data.thumbnailSrc
  ) {
    await deleteBlobsIfUnreferenced([
      previous.thumbnailSrc,
    ]);
  }

  revalidateVideos();
  redirect("/admin/videos");
}

export async function reorderVideos(videoIds: string[]) {
  const uniqueIds = Array.from(
    new Set(
      videoIds.filter(
        (videoId): videoId is string =>
          typeof videoId === "string" && videoId.length > 0,
      ),
    ),
  );

  if (uniqueIds.length === 0) return;

  const existing = await db.video.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (existing.length !== uniqueIds.length) {
    throw new Error("One or more videos no longer exist.");
  }

  await db.$transaction(
    uniqueIds.map((videoId, order) =>
      db.video.update({
        where: { id: videoId },
        data: { order },
      }),
    ),
  );

  revalidateVideos();
  revalidatePath("/admin/videos/settings");
}

export async function setFeaturedVideo(videoId: string | null) {
  await db.$transaction(async (transaction) => {
    await transaction.video.updateMany({
      where: { featured: true },
      data: { featured: false },
    });

    if (videoId) {
      const video = await transaction.video.findUnique({
        where: { id: videoId },
        select: { id: true },
      });

      if (!video) {
        throw new Error("The selected video no longer exists.");
      }

      await transaction.video.update({
        where: { id: videoId },
        data: { featured: true },
      });
    }
  });

  revalidateVideos();
  revalidatePath("/admin/videos/settings");
}

export async function deleteVideo(id: string) {
  const previous = await db.video.findUnique({
    where: { id },
    select: { thumbnailSrc: true },
  });

  await db.video.delete({
    where: { id },
  });

  await deleteBlobsIfUnreferenced([
    previous?.thumbnailSrc,
  ]);

  revalidateVideos();
}
