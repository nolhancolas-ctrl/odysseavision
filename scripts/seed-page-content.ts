import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { editablePages, type EditablePageSection } from "../src/data/sitePages";

const prisma = new PrismaClient();

function getDefaultSectionContent(
  section: EditablePageSection,
): Record<string, Prisma.InputJsonValue> {
  const content: Record<string, Prisma.InputJsonValue> = {};

  for (const field of section.fields) {
    content[field] = section.defaults[field] ?? "";
  }

  if (section.defaults.ctaHref) {
    content.ctaHref = section.defaults.ctaHref;
  }

  if (section.defaults.imageSrc) {
    content.imageSrc = section.defaults.imageSrc;
  }

  const images: Record<string, Prisma.InputJsonValue> = {};

  for (const image of section.images ?? []) {
    images[image.key] = image.defaultSrc ?? "";
  }

  if (Object.keys(images).length > 0) {
    content.images = images;

    if (!content.imageSrc) {
      const firstImage = Object.values(images).find(
        (value) => typeof value === "string" && value.trim(),
      );

      if (typeof firstImage === "string") {
        content.imageSrc = firstImage;
      }
    }
  }

  const drawings: Record<string, Prisma.InputJsonValue> = {};

  for (const drawing of section.drawings ?? []) {
    drawings[drawing.key] = drawing.defaultText;
  }

  if (Object.keys(drawings).length > 0) {
    content.drawings = drawings;
  }

  return content;
}

async function main() {
  let count = 0;

  for (const page of editablePages) {
    for (const section of page.sections) {
      await prisma.pageContent.upsert({
        where: {
          pageKey_sectionKey: {
            pageKey: page.key,
            sectionKey: section.key,
          },
        },
        update: {
          content: getDefaultSectionContent(section),
        },
        create: {
          pageKey: page.key,
          sectionKey: section.key,
          content: getDefaultSectionContent(section),
        },
      });

      count += 1;
    }
  }

  console.log(`Seeded ${count} website page sections.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
