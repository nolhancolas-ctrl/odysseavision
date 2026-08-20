import { PrismaClient } from "@prisma/client";
import { del, list } from "@vercel/blob";

const db = new PrismaClient();
const token = process.env.BLOB_READ_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!token) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
}

function normalize(value: string) {
  return value.split("?")[0].split("#")[0];
}

function collectBlobUrls(value: unknown, refs: Set<string>) {
  if (!value) return;

  if (typeof value === "string") {
    const matches =
      value.match(
        /https:\/\/[^\s"'<>()[\]]*blob\.vercel-storage\.com\/[^\s"'<>()[\]]+/g,
      ) || [];

    for (const match of matches) {
      refs.add(normalize(match));
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectBlobUrls(item, refs);
    }
    return;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectBlobUrls(item, refs);
    }
  }
}

async function getReferences() {
  const refs = new Set<string>();

  const data = await Promise.all([
    db.portfolioItem.findMany({
      select: { imageSrc: true },
    }),

    db.story.findMany({
      select: {
        imageSrc: true,
        content: true,
      },
    }),

    db.video.findMany({
      select: { thumbnailSrc: true },
    }),

    db.clientAlbum.findMany({
      select: {
        coverSrc: true,
        externalDownloadUrl: true,
      },
    }),

    db.clientAlbumImage.findMany({
      select: { imageSrc: true },
    }),

    db.newsletterCampaign.findMany({
      select: {
        heroImage: true,
        body: true,
      },
    }),

    db.pageContent.findMany({
      select: { content: true },
    }),

    db.siteSetting.findMany({
      select: { value: true },
    }),
  ]);

  data.forEach((value) => collectBlobUrls(value, refs));

  return refs;
}

async function getBlobs() {
  const blobs: any[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({
      token,
      limit: 1000,
      cursor,
    });

    blobs.push(...result.blobs);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return blobs;
}

function mb(bytes: number) {
  return (bytes / 1_000_000).toFixed(1);
}

async function main() {
  console.log(
    APPLY
      ? "\n===== DELETE ORPHANED BLOBS ====="
      : "\n===== DRY RUN — NOTHING WILL BE DELETED =====",
  );

  const refs = await getReferences();
  const blobs = await getBlobs();

  const orphaned = blobs.filter(
    (blob) => !refs.has(normalize(blob.url)),
  );

  const orphanBytes = orphaned.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  console.log("Blob files:", blobs.length);
  console.log("Referenced:", refs.size);
  console.log("Orphans:", orphaned.length);
  console.log("Reclaimable:", mb(orphanBytes), "MB");

  if (!APPLY) {
    console.log("");
    console.log("No deletion performed.");
    return;
  }

  let deleted = 0;
  let deletedBytes = 0;
  let failed = 0;

  for (const blob of orphaned) {
    // Vérification live avant CHAQUE suppression.
    const latestRefs = await getReferences();

    if (latestRefs.has(normalize(blob.url))) {
      console.log("SKIP — now referenced:", blob.pathname);
      continue;
    }

    try {
      await del(blob.url, { token });

      deleted += 1;
      deletedBytes += Number(blob.size || 0);

      console.log(
        `DELETE ${deleted}/${orphaned.length} — ${blob.pathname}`,
      );
    } catch (error) {
      failed += 1;
      console.error("FAILED:", blob.pathname);
    }
  }

  console.log("");
  console.log("===== CLEANUP COMPLETE =====");
  console.log("Deleted files:", deleted);
  console.log("Failed:", failed);
  console.log("Storage reclaimed:", mb(deletedBytes), "MB");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
