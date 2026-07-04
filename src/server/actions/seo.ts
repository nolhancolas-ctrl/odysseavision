"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  defaultSeoSettings,
  normalizeSeoSettings,
  SEO_SETTING_KEY,
} from "@/lib/content/seo";
import { db } from "@/lib/db";

function revalidateSeo() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/portfolio");
  revalidatePath("/stories");
  revalidatePath("/videos");
  revalidatePath("/client-albums");
  revalidatePath("/contact");
  revalidatePath("/robots.txt");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/seo");
}

export async function updateSeoSettings(formData: FormData) {
  const rawValue = String(formData.get("seoSettings") ?? "{}");

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid SEO settings.");
  }

  const settings = normalizeSeoSettings(parsed);

  await db.siteSetting.upsert({
    where: {
      key: SEO_SETTING_KEY,
    },
    update: {
      value: settings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: SEO_SETTING_KEY,
      value: settings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateSeo();
}

export async function resetSeoSettings(_formData?: FormData) {
  await db.siteSetting.upsert({
    where: {
      key: SEO_SETTING_KEY,
    },
    update: {
      value: defaultSeoSettings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: SEO_SETTING_KEY,
      value: defaultSeoSettings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateSeo();
}
