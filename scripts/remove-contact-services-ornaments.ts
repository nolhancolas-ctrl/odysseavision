import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

function toObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }

  return {};
}

async function main() {
  const section = await db.pageContent.findUnique({
    where: {
      pageKey_sectionKey: {
        pageKey: "contact",
        sectionKey: "services",
      },
    },
  });

  if (!section) {
    console.log("No contact services section found in DB.");
    return;
  }

  const content = toObject(section.content);
  const images = toObject(content.images);

  delete images.stamp;
  delete images.leaf;

  await db.pageContent.update({
    where: {
      pageKey_sectionKey: {
        pageKey: "contact",
        sectionKey: "services",
      },
    },
    data: {
      content: {
        ...content,
        images,
      } as Prisma.InputJsonValue,
    },
  });

  console.log("Contact services stamp and leaf removed from DB.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
