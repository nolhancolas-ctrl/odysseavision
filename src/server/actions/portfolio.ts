"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function clean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseStatus(value: string) {
  if (value === "PUBLISHED") return "PUBLISHED";
  if (value === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

async function getUniquePortfolioSlug(baseSlug: string, excludeId?: string) {
  const base = slugify(baseSlug) || "portfolio-item";
  let slug = base;
  let index = 2;

  while (true) {
    const existing = await db.portfolioItem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${base}-${index}`;
    index += 1;
  }
}

async function resolveCategory(formData: FormData) {
  const categoryName = clean(formData.get("categoryName"));
  const categoryId = clean(formData.get("categoryId"));

  if (categoryName) {
    const slug = slugify(categoryName);

    const category = await db.portfolioCategory.upsert({
      where: { slug },
      update: { name: categoryName },
      create: {
        name: categoryName,
        slug,
      },
    });

    return category.id;
  }

  if (categoryId) {
    return categoryId;
  }

  return null;
}

function parseDate(value: string) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseOrder(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

export async function createPortfolioItem(formData: FormData) {
  const title = clean(formData.get("title"));
  const imageSrc = clean(formData.get("imageSrc"));

  if (!title || !imageSrc) {
    throw new Error("Title and image URL are required.");
  }

  const wantedSlug = clean(formData.get("slug")) || title;
  const slug = await getUniquePortfolioSlug(wantedSlug);
  const categoryId = await resolveCategory(formData);

  await db.portfolioItem.create({
    data: {
      title,
      slug,
      description: clean(formData.get("description")) || null,
      location: clean(formData.get("location")) || null,
      date: parseDate(clean(formData.get("date"))),
      status: parseStatus(clean(formData.get("status"))),
      featured: formData.get("featured") === "on",
      order: parseOrder(clean(formData.get("order"))),
      tags: clean(formData.get("tags")) || null,
      imageSrc,
      categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(id: string, formData: FormData) {
  const title = clean(formData.get("title"));
  const imageSrc = clean(formData.get("imageSrc"));

  if (!title || !imageSrc) {
    throw new Error("Title and image URL are required.");
  }

  const wantedSlug = clean(formData.get("slug")) || title;
  const slug = await getUniquePortfolioSlug(wantedSlug, id);
  const categoryId = await resolveCategory(formData);

  await db.portfolioItem.update({
    where: { id },
    data: {
      title,
      slug,
      description: clean(formData.get("description")) || null,
      location: clean(formData.get("location")) || null,
      date: parseDate(clean(formData.get("date"))),
      status: parseStatus(clean(formData.get("status"))),
      featured: formData.get("featured") === "on",
      order: parseOrder(clean(formData.get("order"))),
      tags: clean(formData.get("tags")) || null,
      imageSrc,
      categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/${id}`);
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(id: string) {
  await db.portfolioItem.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}
