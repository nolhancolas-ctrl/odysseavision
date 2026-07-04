"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  APPEARANCE_SETTING_KEY,
  defaultAppearanceSettings,
  normalizeAppearanceSettings,
} from "@/lib/content/appearance";
import { db } from "@/lib/db";

function revalidateAppearance() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/portfolio");
  revalidatePath("/stories");
  revalidatePath("/videos");
  revalidatePath("/client-albums");
  revalidatePath("/contact");
  revalidatePath("/admin/appearance");
}

export async function updateAppearanceSettings(formData: FormData) {
  const rawValue = String(formData.get("appearanceSettings") ?? "{}");

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid appearance settings.");
  }

  const settings = normalizeAppearanceSettings(parsed);

  await db.siteSetting.upsert({
    where: {
      key: APPEARANCE_SETTING_KEY,
    },
    update: {
      value: settings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: APPEARANCE_SETTING_KEY,
      value: settings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateAppearance();
}

export async function resetAppearanceSettings(_formData?: FormData) {
  await db.siteSetting.upsert({
    where: {
      key: APPEARANCE_SETTING_KEY,
    },
    update: {
      value: defaultAppearanceSettings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: APPEARANCE_SETTING_KEY,
      value: defaultAppearanceSettings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateAppearance();
}
