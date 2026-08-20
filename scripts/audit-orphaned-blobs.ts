import { PrismaClient } from "@prisma/client";
import { list } from "@vercel/blob";

const db = new PrismaClient();
const token = process.env.BLOB_READ_WRITE_TOKEN;

if (!token) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
}

const refs = new Set<string>();

function normalize(value: string) {
  return value.split("?")[0].split("#")[0];
}

function collect(value: unknown) {
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
    value.forEach(collect);
    return;
  }

  if (typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach(collect);
  }
}

function mb(bytes: number) {
  return (bytes / 1_000_000).toFixed(1);
}

async function main() {
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

  data.forEach(collect);

  const blobs: any[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({
      token,
      cursor,
      limit: 1000,
    });

    blobs.push(...result.blobs);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  const orphaned = blobs.filter(
    (blob) => !refs.has(normalize(blob.url)),
  );

  const totalBytes = blobs.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  const orphanBytes = orphaned.reduce(
    (sum, blob) => sum + Number(blob.size || 0),
    0,
  );

  console.log("");
  console.log("===== BLOB AUDIT =====");
  console.log("All Blob files:", blobs.length);
  console.log("Referenced Blob URLs:", refs.size);
  console.log("Total storage:", mb(totalBytes), "MB");
  console.log("Potential orphan files:", orphaned.length);
  console.log("Potential reclaimable:", mb(orphanBytes), "MB");

  console.log("");
  console.log("Largest potential orphans:");

  console.table(
    orphaned
      .sort(
        (a, b) =>
          Number(b.size || 0) - Number(a.size || 0),
      )
      .slice(0, 30)
      .map((blob) => ({
        sizeMB: mb(Number(blob.size || 0)),
        pathname: blob.pathname,
      })),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
