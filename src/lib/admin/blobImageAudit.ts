import "server-only";

import type { BlobImageOptimization, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getBlobStorageAudit,
  normalizeBlobUrl,
} from "@/lib/admin/blobCleanup";
import {
  IMAGE_OPTIMIZATION_POLICY,
  isBlobImageStatus,
  type BlobImageStatus,
} from "@/lib/admin/imageOptimizationPolicy";
import {
  recordBlobImageAssessment,
  type RecordedBlobImageAssessment,
} from "@/lib/admin/blobImageRegistry";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BATCH_SIZE = 5;
const PROCESSABLE_FORMATS = new Set(["jpeg", "png", "webp"]);

type AuditableBlob = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt?: Date | string;
};

export type BlobImageAuditRow = {
  id: string;
  url: string;
  pathname: string;
  uploadedAt: string | null;
  referenced: boolean;
  size: number;
  contentType: string;
  format: string;
  width: number | null;
  height: number | null;
  projectedSize: number | null;
  projectedSavingBytes: number;
  projectedSavingPercent: number;
  policyIssues: string[];
  status: BlobImageStatus;
  policyVersion: number;
  policyCurrent: boolean;
  checkedAt: string | null;
  note: string;
};

function getUploadedAtMs(value: Date | string | null | undefined) {
  if (!value) return 0;

  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function toDate(value: Date | string | null | undefined) {
  const timestamp = getUploadedAtMs(value);
  return timestamp > 0 ? new Date(timestamp) : null;
}

function toIso(value: Date | string | null | undefined) {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}

function getPolicyIssues({
  format,
  width,
  height,
  size,
}: {
  format: string;
  width?: number;
  height?: number;
  size: number;
}) {
  const issues: string[] = [];
  const largestDimension = Math.max(width || 0, height || 0);

  if (format !== "webp") issues.push("not-webp");
  if (largestDimension > IMAGE_OPTIMIZATION_POLICY.maxDimension) {
    issues.push(`over-${IMAGE_OPTIMIZATION_POLICY.maxDimension}px`);
  }
  if (size > IMAGE_OPTIMIZATION_POLICY.targetMaxBytes) {
    issues.push("over-1.6mb");
  }

  return issues;
}

function requiresOptimization({
  width,
  height,
  size,
  savingRatio,
}: {
  width?: number;
  height?: number;
  size: number;
  savingRatio: number;
}) {
  return (
    Math.max(width || 0, height || 0) > IMAGE_OPTIMIZATION_POLICY.maxDimension ||
    size > IMAGE_OPTIMIZATION_POLICY.targetMaxBytes ||
    savingRatio >= IMAGE_OPTIMIZATION_POLICY.minimumSavingRatio
  );
}

async function analyzeBlob(
  blob: AuditableBlob,
  referenced: boolean,
): Promise<RecordedBlobImageAssessment> {
  const base = {
    url: normalizeBlobUrl(blob.url),
    pathname: blob.pathname,
    uploadedAt: blob.uploadedAt,
    storedSize: Number(blob.size || 0),
    referenced,
    policyVersion: IMAGE_OPTIMIZATION_POLICY.version,
    checkedAt: new Date(),
  };

  try {
    const response = await fetch(blob.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        ...base,
        status: "FAILED",
        note: `Download failed (${response.status}).`,
      };
    }

    const contentType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "";
    const source = Buffer.from(await response.arrayBuffer());
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(source).metadata();
    const format = metadata.format || "unknown";
    const policyIssues = getPolicyIssues({
      format,
      width: metadata.width,
      height: metadata.height,
      size: source.length,
    });

    if (!PROCESSABLE_FORMATS.has(format)) {
      return {
        ...base,
        storedSize: source.length,
        contentType,
        format,
        width: metadata.width || null,
        height: metadata.height || null,
        policyIssues,
        status: "SKIPPED",
        note: "Format intentionally excluded from WebP optimization.",
      };
    }

    const projected = await sharp(source)
      .rotate()
      .resize({
        width: IMAGE_OPTIMIZATION_POLICY.maxDimension,
        height: IMAGE_OPTIMIZATION_POLICY.maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: IMAGE_OPTIMIZATION_POLICY.webpQuality,
        alphaQuality: 90,
        effort: 5,
      })
      .toBuffer();

    const savingBytes = Math.max(0, source.length - projected.length);
    const savingRatio = source.length > 0 ? savingBytes / source.length : 0;
    const needsOptimization = requiresOptimization({
      width: metadata.width,
      height: metadata.height,
      size: source.length,
      savingRatio,
    });

    return {
      ...base,
      storedSize: source.length,
      contentType,
      format,
      width: metadata.width || null,
      height: metadata.height || null,
      projectedSize: projected.length,
      projectedSavingBytes: savingBytes,
      projectedSavingPercent: savingRatio * 100,
      policyIssues,
      status: needsOptimization ? "NEEDS_OPTIMIZATION" : "COMPLIANT",
      note: needsOptimization
        ? "Outside the current policy or at least 12% smaller after simulation."
        : format === "webp"
          ? "Within the current optimization policy."
          : "Original format retained because WebP would not save at least 12%.",
    };
  } catch (error) {
    return {
      ...base,
      status: "FAILED",
      note: error instanceof Error ? error.message : "Image analysis failed.",
    };
  }
}

async function runInChunks<T>(
  values: T[],
  callback: (chunk: T[]) => Promise<unknown>,
  chunkSize = 50,
) {
  for (let index = 0; index < values.length; index += chunkSize) {
    await callback(values.slice(index, index + chunkSize));
  }
}

export async function syncBlobImageRegistry() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN in Vercel runtime.");
  }

  const storage = await getBlobStorageAudit();

  await db.blobImageOptimization.updateMany({
    data: { presentInStorage: false, referenced: false },
  });

  await runInChunks(storage.blobs, async (chunk) => {
    await db.$transaction(
      chunk.map((blob) => {
        const url = normalizeBlobUrl(blob.url);
        const referenced = storage.references.has(url);

        return db.blobImageOptimization.upsert({
          where: { url },
          create: {
            url,
            pathname: blob.pathname,
            uploadedAt: toDate(blob.uploadedAt),
            storedSize: Number(blob.size || 0),
            status: "UNKNOWN",
            policyVersion: 0,
            referenced,
            presentInStorage: true,
            note: "Waiting for its first optimization assessment.",
          },
          update: {
            pathname: blob.pathname,
            uploadedAt: toDate(blob.uploadedAt),
            storedSize: Number(blob.size || 0),
            referenced,
            presentInStorage: true,
          },
        });
      }),
    );
  });

  return storage;
}

function readPolicyIssues(value: Prisma.JsonValue | null): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toRow(record: BlobImageOptimization): BlobImageAuditRow {
  const status = isBlobImageStatus(record.status) ? record.status : "UNKNOWN";

  return {
    id: record.id,
    url: record.url,
    pathname: record.pathname,
    uploadedAt: toIso(record.uploadedAt),
    referenced: record.referenced,
    size: record.storedSize,
    contentType: record.contentType || "",
    format: record.format || "",
    width: record.width,
    height: record.height,
    projectedSize: record.projectedSize,
    projectedSavingBytes: record.projectedSavingBytes,
    projectedSavingPercent: record.projectedSavingPercent,
    policyIssues: readPolicyIssues(record.policyIssues),
    status,
    policyVersion: record.policyVersion,
    policyCurrent:
      record.policyVersion === IMAGE_OPTIMIZATION_POLICY.version &&
      !["UNKNOWN", "PENDING"].includes(status),
    checkedAt: toIso(record.checkedAt),
    note: record.note || "No assessment recorded yet.",
  };
}

function getRowPriority(row: BlobImageAuditRow) {
  if (!row.policyCurrent || ["UNKNOWN", "PENDING"].includes(row.status)) return 0;
  if (row.status === "NEEDS_OPTIMIZATION") return 1;
  if (row.status === "FAILED") return 2;
  if (row.status === "COMPLIANT") return 3;
  return 4;
}

export async function getBlobImageAudit() {
  const storage = await syncBlobImageRegistry();
  const records = await db.blobImageOptimization.findMany({
    where: { presentInStorage: true },
  });
  const rows = records
    .map(toRow)
    .sort((left, right) => {
      const priority = getRowPriority(left) - getRowPriority(right);
      return priority || getUploadedAtMs(right.uploadedAt) - getUploadedAtMs(left.uploadedAt);
    });
  const queued = rows.filter(
    (row) => !row.policyCurrent || ["UNKNOWN", "PENDING"].includes(row.status),
  );
  const optimizable = rows.filter(
    (row) => row.status === "NEEDS_OPTIMIZATION" && row.policyCurrent,
  );

  return {
    generatedAt: new Date().toISOString(),
    policy: IMAGE_OPTIMIZATION_POLICY,
    storage: {
      totalBytes: storage.usedBytes,
      fileCount: storage.fileCount,
      orphanedBytes: storage.orphanedBytes,
      orphanedCount: storage.orphanedCount,
    },
    registry: {
      trackedCount: rows.length,
      queuedCount: queued.length,
      compliantCount: rows.filter(
        (row) => row.status === "COMPLIANT" && row.policyCurrent,
      ).length,
      optimizableCount: optimizable.length,
      failedCount: rows.filter((row) => row.status === "FAILED").length,
      skippedCount: rows.filter((row) => row.status === "SKIPPED").length,
      unusedCount: rows.filter((row) => !row.referenced).length,
      projectedSavingBytes: optimizable.reduce(
        (sum, row) => sum + row.projectedSavingBytes,
        0,
      ),
    },
    rows,
  };
}

export async function analyzeNextBlobImageBatch({
  limit = 3,
  retryFailed = false,
}: {
  limit?: number;
  retryFailed?: boolean;
} = {}) {
  await syncBlobImageRegistry();
  const safeLimit = Math.min(MAX_BATCH_SIZE, Math.max(1, Math.floor(limit)));
  const candidates = await db.blobImageOptimization.findMany({
    where: {
      presentInStorage: true,
      ...(retryFailed
        ? { status: "FAILED" }
        : {
            OR: [
              { status: { in: ["UNKNOWN", "PENDING"] } },
              { policyVersion: { lt: IMAGE_OPTIMIZATION_POLICY.version } },
            ],
          }),
    },
    orderBy: [{ uploadedAt: "asc" }, { createdAt: "asc" }],
    take: safeLimit,
  });

  if (candidates.length === 0) return { analyzed: 0, remaining: 0 };

  await db.blobImageOptimization.updateMany({
    where: { id: { in: candidates.map((candidate) => candidate.id) } },
    data: {
      status: "PENDING",
      note: "Optimization assessment in progress.",
    },
  });

  for (const candidate of candidates) {
    const assessment = await analyzeBlob(
      {
        url: candidate.url,
        pathname: candidate.pathname,
        size: candidate.storedSize,
        uploadedAt: candidate.uploadedAt || undefined,
      },
      candidate.referenced,
    );

    await recordBlobImageAssessment(assessment);
  }

  const remaining = await db.blobImageOptimization.count({
    where: {
      presentInStorage: true,
      OR: [
        { status: { in: ["UNKNOWN", "PENDING"] } },
        { policyVersion: { lt: IMAGE_OPTIMIZATION_POLICY.version } },
      ],
    },
  });

  return { analyzed: candidates.length, remaining };
}
