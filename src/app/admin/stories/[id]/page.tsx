import { notFound } from "next/navigation";
import Link from "next/link";
import { StoryForm } from "@/components/admin/stories/StoryForm";
import { updateStory } from "@/server/actions/stories";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditStoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params;

  const [story, categories] = await Promise.all([
    db.story.findUnique({
      where: { id },
      include: { category: true },
    }),
    db.storyCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Edit story
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            {story.title}
          </p>
        </div>

        <Link
          href="/admin/stories"
          className="rounded-full border border-[#242617]/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:text-[#071321]"
        >
          Back
        </Link>
      </section>

      <StoryForm
        story={story}
        categories={categories}
        action={updateStory.bind(null, story.id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
