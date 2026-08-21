import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { BlobImageStatus } from "@/lib/admin/imageOptimizationPolicy";
import { normalizeBlobUrl } from "@/lib/admin/blobCleanup";

export type RecordedBlobImageAssessment = {
  url: string;
  pathname: string;
  uploadedAt?: Date | string | null;
  storedSize: number;
  contentType?: string | null;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  projectedSize?: number | null;
  projectedSavingBytes?: number;
  projectedSavingPercent?: number;
  policyIssues?: string[];
  status: BlobImageStatus;
  policyVersion: number;
  referenced?: boolean;
  note?: string | null;
  checkedAt?: Date | null;
};

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toPolicyIssues(value: string[] | undefined): Prisma.InputJsonValue {
  return value || [];
}

export async function recordBlobImageAssessment(
  assessment: RecordedBlobImageAssessment,
) {
  const url = normalizeBlobUrl(assessment.url);
  const checkedAt = assessment.checkedAt || new Date();
  const policyIssues = toPolicyIssues(assessment.policyIssues);

  return db.blobImageOptimization.upsert({
    where: { url },
    create: {
      url,
      pathname: assessment.pathname,
      uploadedAt: toDate(assessment.uploadedAt),
      storedSize: assessment.storedSize,
      contentType: assessment.contentType || null,
      format: assessment.format || null,
      width: assessment.width || null,
      height: assessment.height || null,
      projectedSize: assessment.projectedSize ?? null,
      projectedSavingBytes: assessment.projectedSavingBytes || 0,
      projectedSavingPercent: assessment.projectedSavingPercent || 0,
      policyIssues,
      status: assessment.status,
      policyVersion: assessment.policyVersion,
      referenced: assessment.referenced || false,
      presentInStorage: true,
      note: assessment.note || null,
      checkedAt,
    },
    update: {
      pathname: assessment.pathname,
      uploadedAt: toDate(assessment.uploadedAt),
      storedSize: assessment.storedSize,
      contentType: assessment.contentType || null,
      format: assessment.format || null,
      width: assessment.width || null,
      height: assessment.height || null,
      projectedSize: assessment.projectedSize ?? null,
      projectedSavingBytes: assessment.projectedSavingBytes || 0,
      projectedSavingPercent: assessment.projectedSavingPercent || 0,
      policyIssues,
      status: assessment.status,
      policyVersion: assessment.policyVersion,
      referenced: assessment.referenced || false,
      presentInStorage: true,
      note: assessment.note || null,
      checkedAt,
    },
  });
}
