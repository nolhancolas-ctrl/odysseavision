"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getEditablePage } from "@/data/sitePages";

function clean(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function publicPathForPage(pageKey: string) {
  if (pageKey === "home") return "/";
  return `/${pageKey}`;
}

function getSectionContent(formData: FormData) {
  return {
    eyebrow: clean(formData.get("eyebrow")),
    title: clean(formData.get("title")),
    description: clean(formData.get("description")),
    imageSrc: clean(formData.get("imageSrc")),
    ctaLabel: clean(formData.get("ctaLabel")),
    ctaHref: clean(formData.get("ctaHref")),
    body: clean(formData.get("body")),
  };
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

  const content = getSectionContent(formData);

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
  revalidatePath(`/admin/site/${pageKey}`);
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
