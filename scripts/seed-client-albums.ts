import { PrismaClient } from "@prisma/client";
import { clientAlbums } from "../src/data/clients";

const prisma = new PrismaClient();

function parseAlbumDate(value: string) {
  const date = new Date(`${value} 1, 2024`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function main() {
  for (const [index, album] of clientAlbums.entries()) {
    await prisma.clientAlbum.upsert({
      where: { slug: album.slug },
      update: {
        title: album.title,
        coverSrc: album.cover.src,
        shootingDate: parseAlbumDate(album.date),
        status: "PUBLISHED",
        allowDownload: true,
        allowShare: true,
      },
      create: {
        title: album.title,
        slug: album.slug,
        description: "Private client gallery.",
        coverSrc: album.cover.src,
        shootingDate: parseAlbumDate(album.date),
        status: "PUBLISHED",
        allowDownload: true,
        allowShare: true,
      },
    });
  }

  console.log(`Seeded ${clientAlbums.length} client albums.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
