"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function safeAdminReturn(value: FormDataEntryValue | null) {
  const returnTo = String(value || "");

  if (returnTo.startsWith("/admin/portfolio")) {
    return returnTo;
  }

  return "/admin/portfolio";
}

async function getUniqueCategorySlug(baseSlug: string, currentId?: string) {
  const cleanBase = slugify(baseSlug) || "portfolio-category";
  let candidate = cleanBase;
  let index = 2;

  while (true) {
    const existing = await db.portfolioCategory.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentId) {
      return candidate;
    }

    candidate = `${cleanBase}-${index}`;
    index += 1;
  }
}

export async function createPortfolioCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const order = Number(formData.get("order") || 0);
  const returnTo = safeAdminReturn(formData.get("returnTo"));

  if (!name) {
    redirect("/admin/portfolio/categories/new?error=missing-name");
  }

  const slug = await getUniqueCategorySlug(slugInput || name);

  await db.portfolioCategory.create({
    data: {
      name,
      slug,
      order: Number.isFinite(order) ? order : 0,
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");

  redirect(returnTo);
}

export async function updatePortfolioCategory(
  categoryId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const order = Number(formData.get("order") || 0);
  const returnTo = safeAdminReturn(formData.get("returnTo"));

  if (!name) {
    redirect(`/admin/portfolio/categories/${categoryId}/edit?error=missing-name`);
  }

  const slug = await getUniqueCategorySlug(slugInput || name, categoryId);

  await db.portfolioCategory.update({
    where: { id: categoryId },
    data: {
      name,
      slug,
      order: Number.isFinite(order) ? order : 0,
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/categories/${categoryId}`);
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${slug}`);

  redirect(returnTo);
}

export async function deletePortfolioCategory(
  categoryId: string,
  formData: FormData,
) {
  const returnTo = safeAdminReturn(formData.get("returnTo"));

  const count = await db.portfolioItem.count({
    where: { categoryId },
  });

  if (count > 0) {
    redirect(`${returnTo}?error=category-has-photos`);
  }

  await db.portfolioCategory.delete({
    where: { id: categoryId },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");

  redirect(returnTo);
}
