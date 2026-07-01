"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function getClientData(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();

  if (!firstName) {
    throw new Error("First name is required.");
  }

  return {
    firstName,
    lastName: String(formData.get("lastName") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    language: String(formData.get("language") ?? "en").trim() || "en",
    active: formData.get("active") === "on",
  };
}

function revalidateClients() {
  revalidatePath("/admin/clients");
  revalidatePath("/admin/albums");
}

export async function createClient(formData: FormData) {
  const data = getClientData(formData);

  await db.client.create({
    data,
  });

  revalidateClients();
  redirect("/admin/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const data = getClientData(formData);

  await db.client.update({
    where: { id },
    data,
  });

  revalidateClients();
  redirect("/admin/clients");
}

export async function deleteClient(id: string) {
  await db.clientAlbum.updateMany({
    where: { clientId: id },
    data: { clientId: null },
  });

  await db.client.delete({
    where: { id },
  });

  revalidateClients();
}
