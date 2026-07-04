"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  defaultNavigationSettings,
  NAVIGATION_SETTING_KEY,
  normalizeNavigationSettings,
} from "@/lib/content/navigation";
import { db } from "@/lib/db";

function revalidateNavigation() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/portfolio");
  revalidatePath("/stories");
  revalidatePath("/videos");
  revalidatePath("/client-albums");
  revalidatePath("/contact");
  revalidatePath("/admin/navigation");
}

export async function updateNavigationSettings(formData: FormData) {
  const rawValue = String(formData.get("navigationSettings") ?? "{}");

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    throw new Error("Invalid navigation settings.");
  }

  const settings = normalizeNavigationSettings(parsed);

  await db.siteSetting.upsert({
    where: {
      key: NAVIGATION_SETTING_KEY,
    },
    update: {
      value: settings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: NAVIGATION_SETTING_KEY,
      value: settings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateNavigation();
}

export async function resetNavigationSettings() {
  await db.siteSetting.upsert({
    where: {
      key: NAVIGATION_SETTING_KEY,
    },
    update: {
      value: defaultNavigationSettings as unknown as Prisma.InputJsonValue,
    },
    create: {
      key: NAVIGATION_SETTING_KEY,
      value: defaultNavigationSettings as unknown as Prisma.InputJsonValue,
    },
  });

  revalidateNavigation();
}
