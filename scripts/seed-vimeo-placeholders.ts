import { db } from "@/lib/db";
import { videos } from "@/data/videos";

async function main() {
  for (const [index, video] of videos.entries()) {
    const category = await db.videoCategory.upsert({
      where: {
        slug: video.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
      update: {
        name: video.category,
      },
      create: {
        name: video.category,
        slug: video.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        order: index,
      },
    });

    await db.video.upsert({
      where: {
        slug: video.slug,
      },
      update: {
        title: video.title,
        description: video.description,
        thumbnailSrc: video.image.src,
        duration: video.duration,
        vimeoUrl: video.vimeoUrl,
        vimeoId: video.vimeoId,
        status: "PUBLISHED",
        featured: index === 0,
        order: index,
        categoryId: category.id,
      },
      create: {
        title: video.title,
        slug: video.slug,
        description: video.description,
        thumbnailSrc: video.image.src,
        duration: video.duration,
        vimeoUrl: video.vimeoUrl,
        vimeoId: video.vimeoId,
        status: "PUBLISHED",
        featured: index === 0,
        order: index,
        categoryId: category.id,
      },
    });
  }

  console.log("Vimeo placeholder links added to all videos.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
