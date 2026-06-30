"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

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

    return db.storyCategory.upsert({
      where: { slug },
      update: { name: newCategory },
      create: {
        name: newCategory,
        slug,
      },
    });
  }

  if (categoryId) {
    return db.storyCategory.findUnique({
      where: { id: categoryId },
    });
  }

  return null;
}

function getStoryData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || title);

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!slug) {
    throw new Error("Slug is required.");
  }

  return {
    title,
    slug,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    content: String(formData.get("content") ?? "").trim() || null,
    imageSrc:
      String(formData.get("imageSrc") ?? "").trim() ||
      "/images/stories/featured_elephants_01.png",
    date: parseDate(formData.get("date")),
    readTime: String(formData.get("readTime") ?? "").trim() || null,
    status: parseStatus(formData.get("status")),
    featured: formData.get("featured") === "on",
    order: Number(formData.get("order") ?? 0) || 0,
  };
}

function revalidateStories() {
  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/admin/stories");
}

export async function createStory(formData: FormData) {
  const category = await resolveCategory(formData);
  const data = getStoryData(formData);

  await db.story.create({
    data: {
      ...data,
      categoryId: category?.id ?? null,
    },
  });

  revalidateStories();
  redirect("/admin/stories");
}

export async function updateStory(id: string, formData: FormData) {
  const category = await resolveCategory(formData);
  const data = getStoryData(formData);

  await db.story.update({
    where: { id },
    data: {
      ...data,
      categoryId: category?.id ?? null,
    },
  });

  revalidateStories();
  redirect("/admin/stories");
}

export async function deleteStory(id: string) {
  await db.story.delete({
    where: { id },
  });

  revalidateStories();
}
