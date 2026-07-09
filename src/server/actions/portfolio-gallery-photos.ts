"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

type UploadedPhoto = {
  imageSrc: string;
  title?: string;
  originalName?: string;
};

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

  return "/admin/portfolio/photos";
}

function getTitleFromFileName(fileName: string, fallback: string) {
  const clean = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return clean || fallback;
}

export async function createPortfolioGalleryPhotos(formData: FormData) {
  const categoryId = String(formData.get("categoryId") || "");
  const status = String(formData.get("status") || "PUBLISHED");
  const imagesRaw = String(formData.get("images") || "[]");
  const returnTo = safeAdminReturn(formData.get("returnTo"));

  if (!categoryId) {
    redirect(`${returnTo}?error=missing-category`);
  }

  let images: UploadedPhoto[] = [];

  try {
    images = JSON.parse(imagesRaw);
  } catch {
    redirect(`${returnTo}?error=invalid-images`);
  }

  const validImages = images.filter((image) => image.imageSrc);

  if (validImages.length === 0) {
    redirect(`${returnTo}?error=no-images`);
  }

  const category = await db.portfolioCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    redirect(`${returnTo}?error=category-not-found`);
  }

  const existingCount = await db.portfolioItem.count({
    where: { categoryId },
  });

  const timestamp = Date.now();

  await db.portfolioItem.createMany({
    data: validImages.map((image, index) => {
      const title = getTitleFromFileName(
        image.title || image.originalName || "",
        `${category.name} ${existingCount + index + 1}`,
      );

      return {
        title,
        slug: `${category.slug}-${slugify(title)}-${timestamp}-${index}`,
        description: null,
        imageSrc: image.imageSrc,
        categoryId,
        location: null,
        date: null,
        featured: false,
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        order: existingCount + index,
      };
    }),
    skipDuplicates: true,
  });

  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${category.slug}`);
  revalidatePath("/admin/portfolio");
  revalidatePath(`/admin/portfolio/categories/${category.id}`);
  revalidatePath("/admin/portfolio/photos");

  redirect(`${returnTo}?imported=${validImages.length}`);
}

export async function deletePortfolioGalleryPhoto(
  itemId: string,
  formData: FormData,
) {
  const returnTo = safeAdminReturn(formData.get("returnTo"));

  const item = await db.portfolioItem.findUnique({
    where: { id: itemId },
    include: { category: true },
  });

  if (!item) {
    redirect(returnTo);
  }

  await db.portfolioItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath(returnTo);
  revalidatePath("/portfolio");

  if (item.category?.slug) {
    revalidatePath(`/portfolio/${item.category.slug}`);
  }

  redirect(returnTo);
}
