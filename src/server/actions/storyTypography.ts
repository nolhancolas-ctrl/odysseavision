"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  defaultStoryTypographySettings,
  normalizeStoryTypographySettings,
  STORY_TYPOGRAPHY_SETTING_KEY,
} from "@/lib/content/storyTypography";

function revalidateStoryTypography() {
  revalidatePath("/stories");
  revalidatePath("/stories/[slug]", "page");
  revalidatePath("/admin/stories/settings");
}

export async function updateStoryTypographySettings(
  formData: FormData,
) {
  const rawValue = String(
    formData.get("storyTypographySettings") ?? "{}",
  );

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid Story typography settings.");
  }

  const settings = normalizeStoryTypographySettings(parsed);

  await db.siteSetting.upsert({
    where: {
      key: STORY_TYPOGRAPHY_SETTING_KEY,
    },
    update: {
      value: settings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: STORY_TYPOGRAPHY_SETTING_KEY,
      value: settings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateStoryTypography();

  return settings;
}

export async function resetStoryTypographySettings(
  _formData?: FormData,
) {
  await db.siteSetting.upsert({
    where: {
      key: STORY_TYPOGRAPHY_SETTING_KEY,
    },
    update: {
      value:
        defaultStoryTypographySettings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: STORY_TYPOGRAPHY_SETTING_KEY,
      value:
        defaultStoryTypographySettings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateStoryTypography();

  return defaultStoryTypographySettings;
}
