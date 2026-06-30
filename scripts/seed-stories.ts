import { PrismaClient } from "@prisma/client";
import { stories, storyCategories } from "../src/data/stories";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const categories = storyCategories.filter(
    (category) => category !== "All stories",
  );

  for (const [index, categoryName] of categories.entries()) {
    await prisma.storyCategory.upsert({
      where: { slug: slugify(categoryName) },
      update: {
        name: categoryName,
        order: index,
      },
      create: {
        name: categoryName,
        slug: slugify(categoryName),
        order: index,
      },
    });
  }

  for (const [index, story] of stories.entries()) {
    const category = await prisma.storyCategory.upsert({
      where: { slug: slugify(story.category) },
      update: {
        name: story.category,
      },
      create: {
        name: story.category,
        slug: slugify(story.category),
        order: index,
      },
    });

    await prisma.story.upsert({
      where: { slug: story.slug },
      update: {
        title: story.title,
        excerpt: story.description,
        content: story.description,
        imageSrc: story.image.src,
        date: new Date(`${story.date}T00:00:00.000Z`),
        readTime: story.readTime,
        status: "PUBLISHED",
        featured: index === 0,
        order: index,
        categoryId: category.id,
      },
      create: {
        title: story.title,
        slug: story.slug,
        excerpt: story.description,
        content: story.description,
        imageSrc: story.image.src,
        date: new Date(`${story.date}T00:00:00.000Z`),
        readTime: story.readTime,
        status: "PUBLISHED",
        featured: index === 0,
        order: index,
        categoryId: category.id,
      },
    });
  }

  console.log(`Seeded ${stories.length} stories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
