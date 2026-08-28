"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { analyzeNextBlobImageBatch } from "@/lib/admin/blobImageAudit";
import { deleteUnusedBlobByRegistryId } from "@/lib/admin/blobCleanup";
import { optimizeNextDetectedBlobImage } from "@/lib/admin/blobImageOptimizer";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Admin authentication required.");
  }
}

export async function deleteUnusedBlobImage(id: string) {
  await requireAdmin();

  const result = await deleteUnusedBlobByRegistryId(id);

  revalidatePath("/admin/storage-audit");
  revalidatePath("/admin");

  return result;
}

export async function analyzeNextBlobImages() {
  await requireAdmin();
  const result = await analyzeNextBlobImageBatch({ limit: 5 });
  revalidatePath("/admin/storage-audit");
  return result;
}

export async function analyzeAllUnverifiedBlobImages() {
  await requireAdmin();
  const result = await analyzeNextBlobImageBatch({
    limit: 5,
    includeAll: true,
  });
  revalidatePath("/admin/storage-audit");
  return result;
}

export async function retryFailedBlobImages() {
  await requireAdmin();
  await analyzeNextBlobImageBatch({ limit: 3, retryFailed: true });
  revalidatePath("/admin/storage-audit");
}


export async function optimizeNextDetectedBlob() {
  await requireAdmin();
  const result = await optimizeNextDetectedBlobImage();
  revalidatePath("/admin/storage-audit");
  revalidatePath("/", "layout");
  return result;
}
