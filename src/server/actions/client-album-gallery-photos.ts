"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

type UploadedPhoto = {
  imageSrc: string;
  title?: string;
  originalName?: string;
  watermark?: string;
};

function parseWatermark(value: unknown) {
  if (value === "ANDREW" || value === "MORGANE") {
    return value;
  }

  return "NONE";
}

function titleFromFileName(fileName: string, fallback: string) {
  const title = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return title || fallback;
}

function safeReturnTo(value: FormDataEntryValue | null, albumId: string) {
  const returnTo = String(value || "");
  const expected = `/admin/albums/${albumId}`;

  return returnTo === expected ? returnTo : expected;
}

export async function createClientAlbumGalleryPhotos(formData: FormData) {
  const albumId = String(formData.get("albumId") || "");
  const returnTo = safeReturnTo(formData.get("returnTo"), albumId);
  const imagesRaw = String(formData.get("images") || "[]");

  if (!albumId) {
    redirect("/admin/albums?error=missing-album");
  }

  let images: UploadedPhoto[] = [];

  try {
    images = JSON.parse(imagesRaw);
  } catch {
    redirect(`${returnTo}?error=invalid-images`);
  }

  const validImages = images.filter((image) =>
    Boolean(String(image.imageSrc || "").trim()),
  );

  if (validImages.length === 0) {
    redirect(`${returnTo}?error=no-images`);
  }

  const album = await db.clientAlbum.findUnique({
    where: { id: albumId },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  if (!album) {
    redirect("/admin/albums?error=album-not-found");
  }

  const highestOrder = await db.clientAlbumImage.aggregate({
    where: { albumId },
    _max: { order: true },
  });

  const firstOrder = (highestOrder._max.order ?? -1) + 1;

  await db.clientAlbumImage.createMany({
    data: validImages.map((image, index) => {
      const title = titleFromFileName(
        image.title || image.originalName || "",
        `${album.title} ${firstOrder + index + 1}`,
      );

      return {
        albumId,
        imageSrc: String(image.imageSrc).trim(),
        title,
        alt: title,
        order: firstOrder + index,
        watermark: parseWatermark(image.watermark),
        selected: false,
      };
    }),
  });

  revalidatePath("/client-albums");
  revalidatePath(`/client-albums/${album.slug}`);
  revalidatePath("/admin/albums");
  revalidatePath(`/admin/albums/${album.id}`);

  redirect(`${returnTo}?imported=${validImages.length}`);
}
