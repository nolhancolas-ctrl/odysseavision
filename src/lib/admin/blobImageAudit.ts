import "server-only";

import sharp from "sharp";
import {
  getBlobStorageAudit,
  normalizeBlobUrl,
} from "@/lib/admin/blobCleanup";

const CURRENT_MAX_DIMENSION = 2200;
const CURRENT_WEBP_QUALITY = 82;
const CURRENT_TARGET_MAX_BYTES = 1.6 * 1024 * 1024;
const MIN_WORTHWHILE_SAVING_RATIO = 0.12;
const FETCH_TIMEOUT_MS = 15_000;
const AUDIT_CONCURRENCY = 2;

const PROCESSABLE_FORMATS = new Set([
  "jpeg",
  "png",
  "webp",
]);

type AuditableBlob = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt?: Date | string;
};

export type BlobImageAuditRow = {
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
  status: "optimized" | "optimizable" | "review" | "skipped" | "failed";
  note: string;
};

function getUploadedAtMs(blob: AuditableBlob) {
  if (!blob.uploadedAt) {
    return 0;
  }

  const value =
    blob.uploadedAt instanceof Date
      ? blob.uploadedAt.getTime()
      : new Date(blob.uploadedAt).getTime();

  return Number.isFinite(value) ? value : 0;
}

function getUploadedAtIso(blob: AuditableBlob) {
  const timestamp = getUploadedAtMs(blob);
  return timestamp > 0 ? new Date(timestamp).toISOString() : null;
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

  if (format !== "webp") {
    issues.push("not-webp");
  }

  if (largestDimension > CURRENT_MAX_DIMENSION) {
    issues.push("over-2200px");
  }

  if (size > CURRENT_TARGET_MAX_BYTES) {
    issues.push("over-1.6mb");
  }

  return issues;
}

async function analyzeBlob(
  blob: AuditableBlob,
  references: Set<string>,
): Promise<BlobImageAuditRow> {
  const base = {
    pathname: blob.pathname,
    uploadedAt: getUploadedAtIso(blob),
    referenced: references.has(normalizeBlobUrl(blob.url)),
    size: Number(blob.size || 0),
  };

  try {
    const response = await fetch(blob.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        ...base,
        contentType: "",
        format: "",
        width: null,
        height: null,
        projectedSize: null,
        projectedSavingBytes: 0,
        projectedSavingPercent: 0,
        policyIssues: [],
        status: "failed",
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
        size: source.length,
        contentType,
        format,
        width: metadata.width || null,
        height: metadata.height || null,
        projectedSize: null,
        projectedSavingBytes: 0,
        projectedSavingPercent: 0,
        policyIssues,
        status: "skipped",
        note: "Format intentionally excluded from WebP simulation.",
      };
    }

    const projected = await sharp(source)
      .rotate()
      .resize({
        width: CURRENT_MAX_DIMENSION,
        height: CURRENT_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: CURRENT_WEBP_QUALITY,
        alphaQuality: 90,
        effort: 5,
      })
      .toBuffer();

    const savingBytes = Math.max(0, source.length - projected.length);
    const savingRatio = source.length > 0 ? savingBytes / source.length : 0;
    const worthwhile = savingRatio >= MIN_WORTHWHILE_SAVING_RATIO;

    if (worthwhile) {
      return {
        ...base,
        size: source.length,
        contentType,
        format,
        width: metadata.width || null,
        height: metadata.height || null,
        projectedSize: projected.length,
        projectedSavingBytes: savingBytes,
        projectedSavingPercent: savingRatio * 100,
        policyIssues,
        status: "optimizable",
        note: "At least 12% smaller with the current 2200px/WebP policy.",
      };
    }

    if (policyIssues.length > 0) {
      return {
        ...base,
        size: source.length,
        contentType,
        format,
        width: metadata.width || null,
        height: metadata.height || null,
        projectedSize: projected.length,
        projectedSavingBytes: savingBytes,
        projectedSavingPercent: savingRatio * 100,
        policyIssues,
        status: "review",
        note: "Outside the target policy, but recompression would save less than 12%.",
      };
    }

    return {
      ...base,
      size: source.length,
      contentType,
      format,
      width: metadata.width || null,
      height: metadata.height || null,
      projectedSize: projected.length,
      projectedSavingBytes: savingBytes,
      projectedSavingPercent: savingRatio * 100,
      policyIssues,
      status: "optimized",
      note: "Within the current policy with no worthwhile recompression gain.",
    };
  } catch (error) {
    return {
      ...base,
      contentType: "",
      format: "",
      width: null,
      height: null,
      projectedSize: null,
      projectedSavingBytes: 0,
      projectedSavingPercent: 0,
      policyIssues: [],
      status: "failed",
      note: error instanceof Error ? error.message : "Image analysis failed.",
    };
  }
}

export async function getRecentBlobImageAudit(limit = 15) {
  const storage = await getBlobStorageAudit();
  const safeLimit = Math.min(30, Math.max(1, Math.floor(limit)));
  const recentBlobs = [...storage.blobs]
    .sort((left, right) => getUploadedAtMs(right) - getUploadedAtMs(left))
    .slice(0, safeLimit);

  const rows: BlobImageAuditRow[] = [];

  for (let index = 0; index < recentBlobs.length; index += AUDIT_CONCURRENCY) {
    const batch = recentBlobs.slice(index, index + AUDIT_CONCURRENCY);
    rows.push(
      ...(await Promise.all(
        batch.map((blob) => analyzeBlob(blob, storage.references)),
      )),
    );
  }

  const optimizable = rows.filter((row) => row.status === "optimizable");

  return {
    generatedAt: new Date().toISOString(),
    policy: {
      maxDimension: CURRENT_MAX_DIMENSION,
      webpQuality: CURRENT_WEBP_QUALITY,
      targetMaxBytes: CURRENT_TARGET_MAX_BYTES,
      minimumSavingPercent: MIN_WORTHWHILE_SAVING_RATIO * 100,
    },
    storage: {
      totalBytes: storage.usedBytes,
      fileCount: storage.fileCount,
      orphanedBytes: storage.orphanedBytes,
      orphanedCount: storage.orphanedCount,
    },
    sample: {
      count: rows.length,
      referencedCount: rows.filter((row) => row.referenced).length,
      unusedCount: rows.filter((row) => !row.referenced).length,
      optimizableCount: optimizable.length,
      failedCount: rows.filter((row) => row.status === "failed").length,
      projectedSavingBytes: optimizable.reduce(
        (sum, row) => sum + row.projectedSavingBytes,
        0,
      ),
    },
    rows,
  };
}
