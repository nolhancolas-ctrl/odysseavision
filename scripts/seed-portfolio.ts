import { PrismaClient } from "@prisma/client";
import { portfolioPreviewItems } from "../src/data/home";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  for (const [index, item] of portfolioPreviewItems.entries()) {
    const categorySlug =
      item.href.split("/").filter(Boolean).at(-1) ?? slugify(item.title);

    const category = await prisma.portfolioCategory.upsert({
      where: { slug: categorySlug },
      update: {
        name: item.title,
        order: index,
      },
      create: {
        name: item.title,
        slug: categorySlug,
        order: index,
      },
    });

    const slug = `${categorySlug}-cover`;

    await prisma.portfolioItem.upsert({
      where: { slug },
      update: {
        title: item.title,
        description: item.description,
        imageSrc: item.image,
        categoryId: category.id,
        status: "PUBLISHED",
        featured: true,
        order: index,
      },
      create: {
        title: item.title,
        slug,
        description: item.description,
        imageSrc: item.image,
        categoryId: category.id,
        status: "PUBLISHED",
        featured: true,
        order: index,
      },
    });
  }

  console.log("Portfolio seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
