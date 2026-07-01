"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseStatus(value: FormDataEntryValue | null) {
  if (value === "PUBLISHED") return "PUBLISHED";
  if (value === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

function parseDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return null;
  return new Date(`${value}T00:00:00.000Z`);
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

async function resolveClient(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const firstName = String(formData.get("newClientFirstName") ?? "").trim();
  const lastName = String(formData.get("newClientLastName") ?? "").trim();
  const email = String(formData.get("newClientEmail") ?? "").trim();

  if (firstName) {
    return db.client.create({
      data: {
        firstName,
        lastName: lastName || null,
        email: email || null,
        language: "en",
        active: true,
      },
    });
  }

  if (clientId) {
    return db.client.findUnique({
      where: { id: clientId },
    });
  }

  return null;
}

function getAlbumData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const manualSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(manualSlug || title);

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!slug) {
    throw new Error("Slug is required.");
  }

  return {
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    coverSrc:
      String(formData.get("coverSrc") ?? "").trim() ||
      "/images/client-albums/album_01.png",
    shootingDate: parseDate(formData.get("shootingDate")),
    location: String(formData.get("location") ?? "").trim() || null,
    status: parseStatus(formData.get("status")),
    allowDownload: formData.get("allowDownload") === "on",
    allowShare: formData.get("allowShare") === "on",
    expiresAt: parseDate(formData.get("expiresAt")),
  };
}

function revalidateAlbums() {
  revalidatePath("/");
  revalidatePath("/client-albums");
  revalidatePath("/admin/albums");
}

export async function createClientAlbum(formData: FormData) {
  const client = await resolveClient(formData);
  const data = getAlbumData(formData);
  const password = String(formData.get("password") ?? "").trim();

  await db.clientAlbum.create({
    data: {
      ...data,
      passwordHash: password ? hashPassword(password) : null,
      clientId: client?.id ?? null,
    },
  });

  revalidateAlbums();
  redirect("/admin/albums");
}

export async function updateClientAlbum(id: string, formData: FormData) {
  const client = await resolveClient(formData);
  const data = getAlbumData(formData);
  const password = String(formData.get("password") ?? "").trim();
  const clearPassword = formData.get("clearPassword") === "on";

  await db.clientAlbum.update({
    where: { id },
    data: {
      ...data,
      clientId: client?.id ?? null,
      ...(password ? { passwordHash: hashPassword(password) } : {}),
      ...(clearPassword ? { passwordHash: null } : {}),
    },
  });

  revalidateAlbums();
  redirect("/admin/albums");
}

export async function deleteClientAlbum(id: string) {
  await db.clientAlbum.delete({
    where: { id },
  });

  revalidateAlbums();
}
