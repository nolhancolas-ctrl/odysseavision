"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function revalidateSubscribers() {
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin/newsletters");
  revalidatePath("/admin/analytics/subscribers");
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
        .split(/[\s,;]+/g)
        .map(cleanEmail)
        .filter((email) => email && isValidEmail(email)),
    ),
  );
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

  redirect("/admin/subscribers?subscribers=added");
}

export async function importNewsletterSubscribers(formData: FormData) {
  let raw = String(formData.get("csvText") ?? "");

  const file = formData.get("csvFile");

  if (file instanceof File && file.size > 0) {
    raw += "\n" + (await file.text());
  }

  const emails = extractEmails(raw);

  if (emails.length === 0) {
    redirect("/admin/subscribers?subscribers=empty-import");
  }

  await Promise.all(
    emails.map((email) =>
      db.newsletterSubscriber.upsert({
        where: { email },
        update: {
          active: true,
          source: "csv",
        },
        create: {
          email,
          source: "csv",
          active: true,
        },
      }),
    ),
  );

  revalidateSubscribers();

  redirect(`/admin/subscribers?subscribers=imported&count=${emails.length}`);
}

export async function setNewsletterSubscriberActive(
  subscriberId: string,
  active: boolean,
) {
  await db.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: { active },
  });

  revalidateSubscribers();

  redirect("/admin/subscribers?subscribers=updated");
}

export async function deleteNewsletterSubscriber(subscriberId: string) {
  await db.newsletterSubscriber.delete({
    where: { id: subscriberId },
  });

  revalidateSubscribers();

  redirect("/admin/subscribers?subscribers=deleted");
}
