"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { analyzeNextBlobImageBatch } from "@/lib/admin/blobImageAudit";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Admin authentication required.");
  }
}

export async function analyzeNextBlobImages() {
  await requireAdmin();
  await analyzeNextBlobImageBatch({ limit: 3 });
  revalidatePath("/admin/storage-audit");
}

export async function retryFailedBlobImages() {
  await requireAdmin();
  await analyzeNextBlobImageBatch({ limit: 3, retryFailed: true });
  revalidatePath("/admin/storage-audit");
}
