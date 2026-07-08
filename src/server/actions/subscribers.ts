"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const MAX_IMPORT_FILE_SIZE = 1.5 * 1024 * 1024;

function revalidateSubscribers() {
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin/newsletters");
  revalidatePath("/admin/analytics/subscribers");
  revalidatePath("/admin/activity");
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function extractEmails(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,;"'<>]+/g)
        .map(cleanEmail)
        .filter((email) => email && isValidEmail(email)),
    ),
  );
}

function safeReturnTo(formData?: FormData) {
  const raw = String(formData?.get("returnTo") ?? "/admin/subscribers");

  if (raw === "/admin/subscribers" || raw.startsWith("/admin/subscribers?")) {
    return raw;
  }

  return "/admin/subscribers";
}

export async function addNewsletterSubscriber(formData: FormData) {
  const email = cleanEmail(String(formData.get("email") ?? ""));

  if (!email || !isValidEmail(email)) {
    redirect("/admin/subscribers?subscribers=invalid-email");
  }

  await db.newsletterSubscriber.upsert({
    where: { email },
    update: {
      active: true,
      source: "admin",
    },
    create: {
      email,
      source: "admin",
      active: true,
    },
  });

  revalidateSubscribers();

  redirect("/admin/subscribers?subscribers=added&filter=active");
}

export async function importNewsletterSubscribers(formData: FormData) {
  let raw = String(formData.get("csvText") ?? "");

  const file = formData.get("csvFile");

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      redirect("/admin/subscribers?subscribers=import-too-large");
    }

    raw += "\n" + (await file.text());
  }

  const emails = extractEmails(raw);

  if (emails.length === 0) {
    redirect("/admin/subscribers?subscribers=empty-import");
  }

  for (const email of emails) {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {
        active: true,
        source: "import",
      },
      create: {
        email,
        source: "import",
        active: true,
      },
    });
  }

  revalidateSubscribers();

  redirect(`/admin/subscribers?subscribers=imported&count=${emails.length}&filter=active`);
}

export async function setNewsletterSubscriberActive(
  subscriberId: string,
  active: boolean,
  formData?: FormData,
) {
  await db.newsletterSubscriber.updateMany({
    where: { id: subscriberId },
    data: { active },
  });

  revalidateSubscribers();

  if (active) {
    redirect("/admin/subscribers?subscribers=updated&filter=active");
  }

  redirect("/admin/subscribers?subscribers=updated&filter=inactive");
}

export async function deleteNewsletterSubscriber(
  subscriberId: string,
  formData?: FormData,
) {
  await db.newsletterSubscriber.deleteMany({
    where: { id: subscriberId },
  });

  revalidateSubscribers();

  const returnTo = safeReturnTo(formData);
  const separator = returnTo.includes("?") ? "&" : "?";

  redirect(`${returnTo}${separator}subscribers=deleted`);
}
