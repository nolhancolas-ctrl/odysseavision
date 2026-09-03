"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  analyzeNextBlobImageBatch,
  queueAllBlobImagesForAnalysis,
  refreshBlobImageAuditQueue,
} from "@/lib/admin/blobImageAudit";
import {
  deleteUnusedBlobByRegistryId,
  deleteUnusedBlobsByRegistryIds,
} from "@/lib/admin/blobCleanup";
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

export async function deleteUnusedBlobImages(
  ids: string[],
) {
  await requireAdmin();

  const result =
    await deleteUnusedBlobsByRegistryIds(ids);

  revalidatePath("/admin/storage-audit");
  revalidatePath("/admin");

  return result;
}


export async function refreshRecentBlobImageAudit() {
  await requireAdmin();

  const result = await refreshBlobImageAuditQueue();

  revalidatePath("/admin/storage-audit");
  revalidatePath("/admin");

  return result;
}

export async function restartFullBlobImageAnalysis() {
  await requireAdmin();

  const result = await queueAllBlobImagesForAnalysis();

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
