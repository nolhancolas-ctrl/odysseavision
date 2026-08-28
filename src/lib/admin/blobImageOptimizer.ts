import "server-only";

import { del, put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getReferencedBlobUrls,
  normalizeBlobUrl,
} from "@/lib/admin/blobCleanup";
import { recordBlobImageAssessment } from "@/lib/admin/blobImageRegistry";
import { IMAGE_OPTIMIZATION_POLICY } from "@/lib/admin/imageOptimizationPolicy";

const FETCH_TIMEOUT_MS = 30_000;

async function replaceBlobReferences(oldValue: string, newValue: string) {
  const oldUrl = normalizeBlobUrl(oldValue);
  const newUrl = normalizeBlobUrl(newValue);
  const pattern = `%${oldUrl}%`;

  const results = await db.$transaction([
    db.$executeRaw`
      UPDATE "PortfolioItem"
      SET "imageSrc" = replace("imageSrc", ${oldUrl}, ${newUrl}),
          "updatedAt" = now()
      WHERE "imageSrc" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "Story"
      SET "imageSrc" = replace("imageSrc", ${oldUrl}, ${newUrl}),
          "content" = replace("content", ${oldUrl}, ${newUrl}),
          "updatedAt" = now()
      WHERE "imageSrc" LIKE ${pattern}
         OR "content" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "Video"
      SET "thumbnailSrc" = replace("thumbnailSrc", ${oldUrl}, ${newUrl}),
          "updatedAt" = now()
      WHERE "thumbnailSrc" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "ClientAlbum"
      SET "coverSrc" = replace("coverSrc", ${oldUrl}, ${newUrl}),
          "externalDownloadUrl" = replace(
            "externalDownloadUrl",
            ${oldUrl},
            ${newUrl}
          ),
          "updatedAt" = now()
      WHERE "coverSrc" LIKE ${pattern}
         OR "externalDownloadUrl" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "ClientAlbumImage"
      SET "imageSrc" = replace("imageSrc", ${oldUrl}, ${newUrl}),
          "updatedAt" = now()
      WHERE "imageSrc" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "NewsletterCampaign"
      SET "heroImage" = replace("heroImage", ${oldUrl}, ${newUrl}),
          "body" = replace("body", ${oldUrl}, ${newUrl}),
          "updatedAt" = now()
      WHERE "heroImage" LIKE ${pattern}
         OR "body" LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "PageContent"
      SET "content" = replace(
            "content"::text,
            ${oldUrl},
            ${newUrl}
          )::jsonb,
          "updatedAt" = now()
      WHERE "content"::text LIKE ${pattern}
    `,
    db.$executeRaw`
      UPDATE "SiteSetting"
      SET "value" = replace(
            "value"::text,
            ${oldUrl},
            ${newUrl}
          )::jsonb,
          "updatedAt" = now()
      WHERE "value"::text LIKE ${pattern}
    `,
  ]);

  return results.reduce((sum, value) => sum + Number(value), 0);
}

async function createOptimizedWebp(source: Buffer) {
  const sharp = (await import("sharp")).default;

  async function create(maxDimension: number, quality: number) {
    return sharp(source)
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality,
        alphaQuality: 90,
        effort: 5,
      })
      .toBuffer({ resolveWithObject: true });
  }

  let optimized = await create(
    IMAGE_OPTIMIZATION_POLICY.maxDimension,
    IMAGE_OPTIMIZATION_POLICY.webpQuality,
  );

  for (const attempt of [
    { maxDimension: 2000, quality: 80 },
    { maxDimension: 1800, quality: 78 },
    { maxDimension: 1600, quality: 76 },
  ]) {
    if (optimized.data.length <= IMAGE_OPTIMIZATION_POLICY.targetMaxBytes) {
      break;
    }

    const candidate = await create(
      attempt.maxDimension,
      attempt.quality,
    );

    if (candidate.data.length < optimized.data.length) {
      optimized = candidate;
    }
  }

  return optimized;
}

function getOptimizedPathname(pathname: string) {
  const base = pathname.replace(/\.[^/.]+$/, "");
  return `${base}-optimized.webp`;
}

async function countRemaining() {
  return db.blobImageOptimization.count({
    where: {
      presentInStorage: true,
      referenced: true,
      status: "NEEDS_OPTIMIZATION",
      policyVersion: IMAGE_OPTIMIZATION_POLICY.version,
    },
  });
}

export type BlobOptimizationResult = {
  optimized: number;
  remaining: number;
  savedBytes: number;
  pathname: string | null;
};

export async function optimizeNextDetectedBlobImage(): Promise<BlobOptimizationResult> {
  if (process.env.BLOB_OPTIMIZATION_WRITE_ENABLED !== "true") {
    throw new Error(
      "Blob optimization writes are locked. Set BLOB_OPTIMIZATION_WRITE_ENABLED=true only when ready.",
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
  }

  const candidate = await db.blobImageOptimization.findFirst({
    where: {
      presentInStorage: true,
      referenced: true,
      status: "NEEDS_OPTIMIZATION",
      policyVersion: IMAGE_OPTIMIZATION_POLICY.version,
    },
    orderBy: [
      { projectedSavingBytes: "desc" },
      { storedSize: "desc" },
    ],
  });

  if (!candidate) {
    return {
      optimized: 0,
      remaining: 0,
      savedBytes: 0,
      pathname: null,
    };
  }

  await db.blobImageOptimization.update({
    where: { id: candidate.id },
    data: {
      status: "PENDING",
      note: "Real Blob optimization in progress.",
    },
  });

  let newUrl: string | null = null;
  let referencesReplaced = false;

  try {
    const response = await fetch(candidate.url, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Blob download failed (${response.status}).`);
    }

    const source = Buffer.from(await response.arrayBuffer());
    const optimized = await createOptimizedWebp(source);

    if (optimized.data.length >= source.length) {
      throw new Error("The generated WebP is not smaller than the source.");
    }

    const uploaded = await put(
      getOptimizedPathname(candidate.pathname),
      optimized.data,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/webp",
        cacheControlMaxAge: 31_536_000,
        token,
      },
    );

    newUrl = normalizeBlobUrl(uploaded.url);

    const replacements = await replaceBlobReferences(
      candidate.url,
      newUrl,
    );
    referencesReplaced = true;

    const references = await getReferencedBlobUrls();

    if (references.has(normalizeBlobUrl(candidate.url))) {
      await replaceBlobReferences(newUrl, candidate.url);
      referencesReplaced = false;
      throw new Error(
        "The old URL is still referenced; all replacements were rolled back.",
      );
    }

    await recordBlobImageAssessment({
      url: newUrl,
      pathname: uploaded.pathname,
      uploadedAt: new Date(),
      storedSize: optimized.data.length,
      contentType: "image/webp",
      format: "webp",
      width: optimized.info.width,
      height: optimized.info.height,
      projectedSize: optimized.data.length,
      projectedSavingBytes: 0,
      projectedSavingPercent: 0,
      policyIssues: [],
      status: "COMPLIANT",
      policyVersion: IMAGE_OPTIMIZATION_POLICY.version,
      referenced: true,
      checkedAt: new Date(),
      note: `Optimized automatically; ${replacements} database record(s) updated.`,
    });

    await db.blobImageOptimization.update({
      where: { id: candidate.id },
      data: {
        referenced: false,
        status: "SKIPPED",
        note: `Replaced by ${newUrl}.`,
      },
    });

    let deleted = false;

    try {
      await del(candidate.url, { token });
      deleted = true;
    } catch (error) {
      console.warn(
        "[blob optimizer] Old Blob could not be deleted:",
        candidate.url,
        error,
      );
    }

    await db.blobImageOptimization.update({
      where: { id: candidate.id },
      data: {
        presentInStorage: !deleted,
        note: deleted
          ? `Replaced by ${newUrl}; old Blob deleted.`
          : `Replaced by ${newUrl}; old Blob cleanup pending.`,
      },
    });

    return {
      optimized: 1,
      remaining: await countRemaining(),
      savedBytes: Math.max(0, source.length - optimized.data.length),
      pathname: candidate.pathname,
    };
  } catch (error) {
    if (referencesReplaced && newUrl) {
      try {
        await replaceBlobReferences(newUrl, candidate.url);
      } catch (rollbackError) {
        console.error(
          "[blob optimizer] Reference rollback failed:",
          rollbackError,
        );
      }
    }

    if (newUrl) {
      try {
        await del(newUrl, { token });
      } catch (cleanupError) {
        console.warn(
          "[blob optimizer] Temporary Blob cleanup failed:",
          cleanupError,
        );
      }

      await db.blobImageOptimization.updateMany({
        where: { url: newUrl },
        data: {
          referenced: false,
          presentInStorage: false,
          status: "SKIPPED",
          note: "Optimization attempt rolled back.",
        },
      });
    }

    const message =
      error instanceof Error ? error.message : "Blob optimization failed.";

    await db.blobImageOptimization.update({
      where: { id: candidate.id },
      data: {
        status: "NEEDS_OPTIMIZATION",
        note: `Optimization failed safely: ${message}`,
      },
    });

    throw error;
  }
}
