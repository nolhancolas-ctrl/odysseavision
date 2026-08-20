import path from "node:path";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { del, list, put } from "@vercel/blob";

const prisma = new PrismaClient();

const APPLY = process.argv.includes("--apply");
const INCLUDE_CLIENT_ALBUMS = process.argv.includes("--include-client-albums");

const MAX_DIMENSION = 2200;
const WEBP_QUALITY = 82;

// Ne remplace pas une image si on gagne moins de 12 %.
const MIN_SAVING_RATIO = 0.12;

const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
}

function normalizeUrl(value: string) {
  return value.split("?")[0];
}

function isBlobUrl(value: string) {
  return (
    value.startsWith("https://") &&
    value.includes(".blob.vercel-storage.com/")
  );
}

function extractBlobUrls(value: unknown, output: Map<string, Set<string>>) {
  if (!value) return;

  if (typeof value === "string") {
    if (isBlobUrl(value)) {
      const normalized = normalizeUrl(value);

      if (!output.has(normalized)) {
        output.set(normalized, new Set());
      }

      output.get(normalized)!.add(value);
      return;
    }

    const matches =
      value.match(
        /https:\/\/[^\s"'<>]+\.blob\.vercel-storage\.com\/[^\s"'<>)]*/g,
      ) || [];

    for (const match of matches) {
      const normalized = normalizeUrl(match);

      if (!output.has(normalized)) {
        output.set(normalized, new Set());
      }

      output.get(normalized)!.add(match);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractBlobUrls(item, output);
    }

    return;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      extractBlobUrls(item, output);
    }
  }
}

function replaceStrings(
  value: unknown,
  oldValues: string[],
  newValue: string,
): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    let next = value;

    for (const oldValue of oldValues) {
      next = next.split(oldValue).join(newValue);
    }

    return {
      value: next,
      changed: next !== value,
    };
  }

  if (Array.isArray(value)) {
    let changed = false;

    const next = value.map((item) => {
      const result = replaceStrings(item, oldValues, newValue);
      changed ||= result.changed;
      return result.value;
    });

    return { value: next, changed };
  }

  if (value && typeof value === "object") {
    let changed = false;
    const next: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const result = replaceStrings(item, oldValues, newValue);
      changed ||= result.changed;
      next[key] = result.value;
    }

    return { value: next, changed };
  }

  return { value, changed: false };
}

async function collectReferences() {
  const references = new Map<string, Set<string>>();
  const clientAlbumReferences = new Map<string, Set<string>>();

  const [
    portfolio,
    stories,
    videos,
    albums,
    clientImages,
    newsletters,
    pageContent,
    siteSettings,
  ] = await Promise.all([
    prisma.portfolioItem.findMany({
      select: { imageSrc: true },
    }),

    prisma.story.findMany({
      select: {
        imageSrc: true,
        content: true,
      },
    }),

    prisma.video.findMany({
      select: { thumbnailSrc: true },
    }),

    prisma.clientAlbum.findMany({
      select: { coverSrc: true },
    }),

    prisma.clientAlbumImage.findMany({
      select: { imageSrc: true },
    }),

    prisma.newsletterCampaign.findMany({
      select: {
        heroImage: true,
        body: true,
      },
    }),

    prisma.pageContent.findMany({
      select: { content: true },
    }),

    prisma.siteSetting.findMany({
      select: { value: true },
    }),
  ]);

  extractBlobUrls(portfolio, references);
  extractBlobUrls(stories, references);
  extractBlobUrls(videos, references);
  extractBlobUrls(albums, references);
  extractBlobUrls(newsletters, references);
  extractBlobUrls(pageContent, references);
  extractBlobUrls(siteSettings, references);

  extractBlobUrls(clientImages, clientAlbumReferences);

  if (INCLUDE_CLIENT_ALBUMS) {
    extractBlobUrls(clientImages, references);
  }

  return {
    references,
    clientAlbumReferences,
  };
}

async function getAllBlobs() {
  const blobs: any[] = [];
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

async function replaceReferences(
  oldValues: string[],
  newValue: string,
) {
  const [
    stories,
    newsletters,
    pages,
    settings,
  ] = await Promise.all([
    prisma.story.findMany({
      select: {
        id: true,
        content: true,
      },
    }),

    prisma.newsletterCampaign.findMany({
      select: {
        id: true,
        body: true,
      },
    }),

    prisma.pageContent.findMany({
      select: {
        id: true,
        content: true,
      },
    }),

    prisma.siteSetting.findMany({
      select: {
        id: true,
        value: true,
      },
    }),
  ]);

  const operations: any[] = [
    prisma.portfolioItem.updateMany({
      where: {
        imageSrc: {
          in: oldValues,
        },
      },
      data: {
        imageSrc: newValue,
      },
    }),

    prisma.story.updateMany({
      where: {
        imageSrc: {
          in: oldValues,
        },
      },
      data: {
        imageSrc: newValue,
      },
    }),

    prisma.video.updateMany({
      where: {
        thumbnailSrc: {
          in: oldValues,
        },
      },
      data: {
        thumbnailSrc: newValue,
      },
    }),

    prisma.clientAlbum.updateMany({
      where: {
        coverSrc: {
          in: oldValues,
        },
      },
      data: {
        coverSrc: newValue,
      },
    }),

    prisma.newsletterCampaign.updateMany({
      where: {
        heroImage: {
          in: oldValues,
        },
      },
      data: {
        heroImage: newValue,
      },
    }),
  ];

  if (INCLUDE_CLIENT_ALBUMS) {
    operations.push(
      prisma.clientAlbumImage.updateMany({
        where: {
          imageSrc: {
            in: oldValues,
          },
        },
        data: {
          imageSrc: newValue,
        },
      }),
    );
  }

  for (const story of stories) {
    if (!story.content) continue;

    const result = replaceStrings(
      story.content,
      oldValues,
      newValue,
    );

    if (result.changed) {
      operations.push(
        prisma.story.update({
          where: { id: story.id },
          data: {
            content: String(result.value),
          },
        }),
      );
    }
  }

  for (const campaign of newsletters) {
    const result = replaceStrings(
      campaign.body,
      oldValues,
      newValue,
    );

    if (result.changed) {
      operations.push(
        prisma.newsletterCampaign.update({
          where: { id: campaign.id },
          data: {
            body: String(result.value),
          },
        }),
      );
    }
  }

  for (const page of pages) {
    const result = replaceStrings(
      page.content,
      oldValues,
      newValue,
    );

    if (result.changed) {
      operations.push(
        prisma.pageContent.update({
          where: { id: page.id },
          data: {
            content: result.value as any,
          },
        }),
      );
    }
  }

  for (const setting of settings) {
    const result = replaceStrings(
      setting.value,
      oldValues,
      newValue,
    );

    if (result.changed) {
      operations.push(
        prisma.siteSetting.update({
          where: { id: setting.id },
          data: {
            value: result.value as any,
          },
        }),
      );
    }
  }

  await prisma.$transaction(operations);
}

function mb(bytes: number) {
  return bytes / 1024 / 1024;
}

async function main() {
  console.log(
    APPLY
      ? "\n===== APPLY EXISTING IMAGE OPTIMIZATION ====="
      : "\n===== DRY RUN — NO FILE WILL BE MODIFIED =====",
  );

  console.log(
    `Target: WebP quality ${WEBP_QUALITY}, max ${MAX_DIMENSION}px`,
  );

  console.log(
    `Client album gallery originals: ${
      INCLUDE_CLIENT_ALBUMS ? "INCLUDED" : "EXCLUDED"
    }`,
  );

  const {
    references,
    clientAlbumReferences,
  } = await collectReferences();

  const blobs = await getAllBlobs();

  const blobByUrl = new Map(
    blobs.map((blob) => [
      normalizeUrl(blob.url),
      blob,
    ]),
  );

  let originalTotal = 0;
  let optimizedTotal = 0;
  let optimizedCount = 0;
  let skippedCount = 0;

  const rows: Array<{
    file: string;
    before: string;
    after: string;
    saving: string;
  }> = [];

  for (const [normalizedUrl, referenceValues] of references) {
    const blob = blobByUrl.get(normalizedUrl);

    if (!blob) {
      console.log(
        "SKIP — referenced Blob not found:",
        normalizedUrl,
      );

      skippedCount += 1;
      continue;
    }

    // Protection :
    // ne touche pas à un fichier également utilisé comme
    // photo Client Album si on n'a pas explicitement demandé
    // de les inclure.
    if (
      !INCLUDE_CLIENT_ALBUMS &&
      clientAlbumReferences.has(normalizedUrl)
    ) {
      console.log(
        "SKIP — also used by Client Album:",
        blob.pathname,
      );

      skippedCount += 1;
      continue;
    }

    const response = await fetch(blob.url);

    if (!response.ok) {
      console.log(
        "SKIP — download failed:",
        blob.pathname,
      );

      skippedCount += 1;
      continue;
    }

    const contentType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "";

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(contentType)
    ) {
      console.log(
        "SKIP — unsupported format:",
        blob.pathname,
        contentType,
      );

      skippedCount += 1;
      continue;
    }

    const source = Buffer.from(
      await response.arrayBuffer(),
    );

    let metadata;

    try {
      metadata = await sharp(source).metadata();
    } catch {
      console.log(
        "SKIP — Sharp cannot read:",
        blob.pathname,
      );

      skippedCount += 1;
      continue;
    }

    // Un WebP déjà raisonnable et <= 2200 px peut être
    // laissé tranquille sauf si la recompression apporte
    // un vrai gain.
    const optimized = await sharp(source)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: WEBP_QUALITY,
        alphaQuality: 90,
        effort: 6,
      })
      .toBuffer();

    const savingRatio =
      1 - optimized.length / source.length;

    if (
      optimized.length >= source.length ||
      savingRatio < MIN_SAVING_RATIO
    ) {
      skippedCount += 1;
      continue;
    }

    originalTotal += source.length;
    optimizedTotal += optimized.length;
    optimizedCount += 1;

    rows.push({
      file: blob.pathname,
      before: `${mb(source.length).toFixed(2)} MB`,
      after: `${mb(optimized.length).toFixed(2)} MB`,
      saving: `${(savingRatio * 100).toFixed(0)}%`,
    });

    if (!APPLY) {
      continue;
    }

    const parsed = path.posix.parse(blob.pathname);

    const destinationPath = path.posix.join(
      parsed.dir,
      `${parsed.name}-web-${Date.now()}.webp`,
    );

    console.log(
      `Optimizing ${blob.pathname}...`,
    );

    // 1. Crée le nouveau Blob.
    const uploaded = await put(
      destinationPath,
      optimized,
      {
        access: "public",
        contentType: "image/webp",
        addRandomSuffix: true,
        token,
      },
    );

    try {
      // 2. Modifie toutes les références DB d'un coup.
      await replaceReferences(
        [...referenceValues],
        uploaded.url,
      );
    } catch (error) {
      // DB intacte -> on retire le nouveau Blob.
      await del(uploaded.url, { token }).catch(() => {});
      throw error;
    }

    // 3. L'ancienne image n'est supprimée qu'après
    // la mise à jour réussie de la DB.
    try {
      await del(blob.url, { token });
    } catch {
      console.warn(
        "WARNING — old Blob could not be deleted:",
        blob.pathname,
      );
    }
  }

  console.log("");

  if (rows.length) {
    console.table(rows);
  }

  const saved =
    originalTotal - optimizedTotal;

  console.log("");
  console.log("===== SUMMARY =====");
  console.log("Optimizable images:", optimizedCount);
  console.log("Skipped:", skippedCount);
  console.log(
    "Current size:",
    `${mb(originalTotal).toFixed(1)} MB`,
  );
  console.log(
    "Optimized size:",
    `${mb(optimizedTotal).toFixed(1)} MB`,
  );
  console.log(
    "Projected saving:",
    `${mb(saved).toFixed(1)} MB`,
  );

  if (!APPLY) {
    console.log("");
    console.log(
      "DRY RUN ONLY — database and Blob storage were not modified.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
