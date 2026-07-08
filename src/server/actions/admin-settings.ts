"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function cleanString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function cleanBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/client-albums");
  revalidatePath("/contact");
}

export async function updateSmtpSettingsAction(formData: FormData) {
  const current = await db.siteSetting.findUnique({
    where: { key: "smtp" },
  });

  const currentValue =
    current?.value && typeof current.value === "object"
      ? (current.value as Record<string, unknown>)
      : {};

  const password = cleanString(formData.get("password"));

  const value = {
    host: cleanString(formData.get("host")),
    port: cleanString(formData.get("port")) || "465",
    secure: cleanBoolean(formData.get("secure")),
    user: cleanString(formData.get("user")),
    password: password || String(currentValue.password ?? ""),
    from: cleanString(formData.get("from")),
    enabled: cleanBoolean(formData.get("enabled")),
  };

  await db.siteSetting.upsert({
    where: { key: "smtp" },
    update: { value },
    create: { key: "smtp", value },
  });

  revalidateSettings();

  redirect("/admin/settings?smtp=updated");
}

export async function updateGlobalSiteInfoAction(formData: FormData) {
  const value = {
    siteName: cleanString(formData.get("siteName")),
    publicUrl: cleanString(formData.get("publicUrl")),
    contactEmail: cleanString(formData.get("contactEmail")),
    businessName: cleanString(formData.get("businessName")),
    location: cleanString(formData.get("location")),
  };

  await db.siteSetting.upsert({
    where: { key: "globalSiteInfo" },
    update: { value },
    create: { key: "globalSiteInfo", value },
  });

  revalidateSettings();

  redirect("/admin/settings?site=updated");
}
