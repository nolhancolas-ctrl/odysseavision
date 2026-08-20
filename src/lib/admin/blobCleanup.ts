import "server-only";

import { del, list } from "@vercel/blob";
import { db } from "@/lib/db";

const ABANDONED_UPLOAD_AGE_MS = 48 * 60 * 60 * 1000;

type BlobItem = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt?: Date | string;
};

export function normalizeBlobUrl(value: string) {
  return String(value || "")
    .split("?")[0]
    .split("#")[0];
}

export function isVercelBlobUrl(value: string) {
  return (
    value.startsWith("https://") &&
    value.includes("blob.vercel-storage.com/")
  );
}

function collectBlobUrls(value: unknown, output: Set<string>) {
  if (!value) {
    return;
  }

  if (typeof value === "string") {
    const matches =
      value.match(
        /https:\/\/[^\s"'<>()[\]]*blob\.vercel-storage\.com\/[^\s"'<>()[\]]+/g,
      ) || [];

    for (const match of matches) {
      output.add(normalizeBlobUrl(match));
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectBlobUrls(item, output);
    }

    return;
  }

  if (typeof value === "object") {
    for (const item of Object.values(
      value as Record<string, unknown>,
    )) {
      collectBlobUrls(item, output);
    }
  }
}

export async function getReferencedBlobUrls() {
  const references = new Set<string>();

  const [
    portfolio,
    stories,
    videos,
    albums,
    albumImages,
    newsletters,
    pageContent,
    siteSettings,
  ] = await Promise.all([
    db.portfolioItem.findMany({
      select: {
        imageSrc: true,
      },
    }),

    db.story.findMany({
      select: {
        imageSrc: true,
        content: true,
      },
    }),

    db.video.findMany({
      select: {
        thumbnailSrc: true,
      },
    }),

    db.clientAlbum.findMany({
      select: {
        coverSrc: true,
        externalDownloadUrl: true,
      },
    }),

    db.clientAlbumImage.findMany({
      select: {
        imageSrc: true,
      },
    }),

    db.newsletterCampaign.findMany({
      select: {
        heroImage: true,
        body: true,
      },
    }),

    db.pageContent.findMany({
      select: {
        content: true,
      },
    }),

    db.siteSetting.findMany({
      select: {
        value: true,
      },
    }),
  ]);

  [
    portfolio,
    stories,
    videos,
    albums,
    albumImages,
    newsletters,
    pageContent,
    siteSettings,
  ].forEach((value) => collectBlobUrls(value, references));

  return references;
}

async function getAllBlobs() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return [];
  }

  const blobs: BlobItem[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({
      token,
      cursor,
      limit: 1000,
    });

    blobs.push(...result.blobs);

    cursor = result.hasMore
      ? result.cursor
      : undefined;
  } while (cursor);

  return blobs;
}

function getUploadedAtMs(blob: BlobItem) {
  if (!blob.uploadedAt) {
    return Number.NaN;
  }

  if (blob.uploadedAt instanceof Date) {
    return blob.uploadedAt.getTime();
  }

  return new Date(blob.uploadedAt).getTime();
}

/**
 * Deletes only files that are no longer referenced anywhere.
 *
 * Intended for immediate cleanup after a DB mutation.
 * Cleanup errors never make the admin save/delete operation fail.
 */
export async function deleteBlobsIfUnreferenced(
  urls: Array<string | null | undefined>,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return {
      deleted: 0,
      failed: 0,
    };
  }

  const candidates = [
    ...new Set(
      urls
        .filter((value): value is string => Boolean(value))
        .filter(isVercelBlobUrl)
        .map(normalizeBlobUrl),
    ),
  ];

  if (candidates.length === 0) {
    return {
      deleted: 0,
      failed: 0,
    };
  }

  // Important:
  // references are read AFTER the database modification.
  const references = await getReferencedBlobUrls();

  const deletable = candidates.filter(
    (url) => !references.has(url),
  );

  let deleted = 0;
  let failed = 0;

  for (const url of deletable) {
    try {
      await del(url, { token });
      deleted += 1;
    } catch (error) {
      failed += 1;

      console.warn(
        "[blob cleanup] Could not delete unused Blob:",
        url,
        error,
      );
    }
  }

  return {
    deleted,
    failed,
  };
}

export async function getBlobStorageAudit() {
  const [references, blobs] = await Promise.all([
    getReferencedBlobUrls(),
    getAllBlobs(),
  ]);

  const usedBytes = blobs.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  const orphaned = blobs.filter(
    (blob) =>
      !references.has(normalizeBlobUrl(blob.url)),
  );

  const orphanedBytes = orphaned.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  const cutoff =
    Date.now() - ABANDONED_UPLOAD_AGE_MS;

  const reclaimable = orphaned.filter((blob) => {
    const uploadedAt = getUploadedAtMs(blob);

    return (
      Number.isFinite(uploadedAt) &&
      uploadedAt <= cutoff
    );
  });

  const reclaimableBytes = reclaimable.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  return {
    blobs,
    references,
    usedBytes,
    fileCount: blobs.length,

    orphaned,
    orphanedCount: orphaned.length,
    orphanedBytes,

    reclaimable,
    reclaimableCount: reclaimable.length,
    reclaimableBytes,
  };
}

/**
 * Garbage collector for abandoned uploads.
 *
 * Only deletes orphaned Blobs older than 48h.
 */
export async function cleanupAbandonedBlobs(
  maxDeletes = 250,
) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return {
      deleted: 0,
      deletedBytes: 0,
      failed: 0,
    };
  }

  const audit = await getBlobStorageAudit();

  const candidates = audit.reclaimable.slice(
    0,
    maxDeletes,
  );

  if (candidates.length === 0) {
    return {
      deleted: 0,
      deletedBytes: 0,
      failed: 0,
    };
  }

  // Final reference check immediately before deletion.
  const latestReferences =
    await getReferencedBlobUrls();

  let deleted = 0;
  let deletedBytes = 0;
  let failed = 0;

  for (const blob of candidates) {
    const url = normalizeBlobUrl(blob.url);

    if (latestReferences.has(url)) {
      continue;
    }

    try {
      await del(blob.url, { token });

      deleted += 1;
      deletedBytes += Number(blob.size || 0);
    } catch (error) {
      failed += 1;

      console.warn(
        "[blob garbage collector] Failed:",
        blob.pathname,
        error,
      );
    }
  }

  return {
    deleted,
    deletedBytes,
    failed,
  };
}
