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
        pageKey: "client-albums",
        sectionKey: "intro",
      },
    },
  });

  if (!section) {
    console.log("No client-albums intro section found in DB.");
    return;
  }

  const content = toObject(section.content);
  const images = toObject(content.images);

  delete images.stamp;

  await db.pageContent.update({
    where: {
      pageKey_sectionKey: {
        pageKey: "client-albums",
        sectionKey: "intro",
      },
    },
    data: {
      content: {
        ...content,
        images,
      } as Prisma.InputJsonValue,
    },
  });

  console.log("Intro stamp removed from client-albums intro DB content.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
