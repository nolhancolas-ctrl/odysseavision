import { PrismaClient } from "@prisma/client";
import { editablePages } from "../src/data/sitePages";

const prisma = new PrismaClient();

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
        update: {},
        create: {
          pageKey: page.key,
          sectionKey: section.key,
          content: section.defaults,
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
