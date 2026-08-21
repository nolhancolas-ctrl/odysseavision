export const IMAGE_OPTIMIZATION_POLICY = {
  version: 1,
  maxDimension: 2200,
  webpQuality: 82,
  targetMaxBytes: 1.6 * 1024 * 1024,
  minimumSavingRatio: 0.12,
} as const;

export const BLOB_IMAGE_STATUSES = [
  "UNKNOWN",
  "PENDING",
  "COMPLIANT",
  "NEEDS_OPTIMIZATION",
  "FAILED",
  "SKIPPED",
] as const;

export type BlobImageStatus = (typeof BLOB_IMAGE_STATUSES)[number];

export function isBlobImageStatus(value: string): value is BlobImageStatus {
  return BLOB_IMAGE_STATUSES.includes(value as BlobImageStatus);
}
