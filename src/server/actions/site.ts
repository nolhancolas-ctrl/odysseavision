"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  getEditablePage,
  type EditableFieldKey,
  type EditablePageSection,
} from "@/data/sitePages";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function publicPathForPage(pageKey: string) {
  if (pageKey === "home") return "/";
  return `/${pageKey}`;
}

function getDefaultFieldValue(
  section: EditablePageSection,
  field: EditableFieldKey,
) {
  return section.defaults[field] ?? "";
}

function getFirstImageSrc(images: Record<string, Prisma.InputJsonValue>) {
  for (const value of Object.values(images)) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function isWatermarkEligibleImageCategory(category: string) {
  return category === "background" || category === "photoframe" || category === "photo";
}

function getDefaultImageWatermark(category: string) {
  if (!isWatermarkEligibleImageCategory(category)) {
    return false;
  }

  return category !== "background";
}

function readBooleanFromFormData(
  formData: FormData,
  key: string,
  defaultValue: boolean,
) {
  const values = formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  const value = values.at(-1);

  if (!value) {
    return defaultValue;
  }

  return ["true", "on", "1", "yes"].includes(value);
}

function getSectionContent(
  section: EditablePageSection,
  formData: FormData,
): Record<string, Prisma.InputJsonValue> {
  const content: Record<string, Prisma.InputJsonValue> = {};

  for (const field of section.fields) {
    if (formData.has(field)) {
      content[field] = readString(formData, field);
    } else {
      content[field] = getDefaultFieldValue(section, field);
    }
  }

  /**
   * CTA href is intentionally not shown in the Website pages editor anymore.
   * We keep the default value in saved JSON for future public-page wiring.
   */
  if (section.defaults.ctaHref) {
    content.ctaHref = section.defaults.ctaHref;
  }

  /**
   * Backward compatibility with the previous form.
   * This allows the current UI to keep working until Step 3 replaces it.
   */
  if (formData.has("imageSrc")) {
    content.imageSrc = readString(formData, "imageSrc");
  }

  if (formData.has("ctaHref")) {
    const ctaHref = readString(formData, "ctaHref");
    if (ctaHref) {
      content.ctaHref = ctaHref;
    }
  }

  const images: Record<string, Prisma.InputJsonValue> = {};

  for (const image of section.images ?? []) {
    const inputKey = `image:${image.key}`;
    const removeKey = `removeImage:${image.key}`;

    if (formData.get(removeKey) === "on" || formData.get(removeKey) === "true") {
      images[image.key] = "";
      continue;
    }

    if (formData.has(inputKey)) {
      images[image.key] = readString(formData, inputKey);
      continue;
    }

    images[image.key] = image.defaultSrc ?? "";
  }

  if (Object.keys(images).length > 0) {
    content.images = images;

    const imageWatermarks: Record<string, Prisma.InputJsonValue> = {};

    for (const image of section.images ?? []) {
      if (!isWatermarkEligibleImageCategory(image.category)) {
        continue;
      }

      const inputKey = `imageWatermark:${image.key}`;

      imageWatermarks[image.key] = readBooleanFromFormData(
        formData,
        inputKey,
        getDefaultImageWatermark(image.category),
      );
    }

    if (Object.keys(imageWatermarks).length > 0) {
      content.imageWatermarks = imageWatermarks;
    }

    if (!content.imageSrc) {
      const firstImage = getFirstImageSrc(images);
      if (firstImage) {
        content.imageSrc = firstImage;
      }
    }
  }

  const drawings: Record<string, Prisma.InputJsonValue> = {};

  for (const drawing of section.drawings ?? []) {
    const inputKey = `drawing:${drawing.key}`;

    if (formData.has(inputKey)) {
      drawings[drawing.key] = readString(formData, inputKey);
      continue;
    }

    drawings[drawing.key] = drawing.defaultText;
  }

  if (Object.keys(drawings).length > 0) {
    content.drawings = drawings;
  }

  return content;
}

export async function updatePageSection(
  pageKey: string,
  sectionKey: string,
  formData: FormData,
) {
  const page = getEditablePage(pageKey);

  if (!page) {
    throw new Error("Unknown page.");
  }

  const section = page.sections.find((item) => item.key === sectionKey);

  if (!section) {
    throw new Error("Unknown section.");
  }

  const content = getSectionContent(section, formData);

  await db.pageContent.upsert({
    where: {
      pageKey_sectionKey: {
        pageKey,
        sectionKey,
      },
    },
    update: {
      content,
    },
    create: {
      pageKey,
      sectionKey,
      content,
    },
  });

  revalidatePath("/admin/site");
  revalidatePath(publicPathForPage(pageKey));
}

export async function resetPageSection(pageKey: string, sectionKey: string) {
  await db.pageContent.deleteMany({
    where: {
      pageKey,
      sectionKey,
    },
  });

  revalidatePath("/admin/site");
  revalidatePath(`/admin/site/${pageKey}`);
  revalidatePath(publicPathForPage(pageKey));
}



export async function updateFeaturedFilmSelection(formData: FormData) {
  const selectedValue = String(formData.get("featuredVideoId") ?? "__latest__");
  const featuredVideoId =
    selectedValue && selectedValue !== "__latest__" ? selectedValue : "__latest__";

  const existing = await db.pageContent.findUnique({
    where: {
      pageKey_sectionKey: {
        pageKey: "videos",
        sectionKey: "featured-film",
      },
    },
  });

  const currentContent =
    existing?.content &&
    typeof existing.content === "object" &&
    !Array.isArray(existing.content)
      ? existing.content
      : {};

  await db.pageContent.upsert({
    where: {
      pageKey_sectionKey: {
        pageKey: "videos",
        sectionKey: "featured-film",
      },
    },
    update: {
      content: {
        ...currentContent,
        featuredVideoMode:
          featuredVideoId === "__latest__" ? "latest" : "selected",
        featuredVideoId,
      },
    },
    create: {
      pageKey: "videos",
      sectionKey: "featured-film",
      content: {
        featuredVideoMode:
          featuredVideoId === "__latest__" ? "latest" : "selected",
        featuredVideoId,
      },
    },
  });

  revalidatePath("/videos");
  revalidatePath("/admin/site/videos");
}
