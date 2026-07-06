import Link from "next/link";
import { StoryForm } from "@/components/admin/stories/StoryForm";
import { createStory } from "@/server/actions/stories";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const categories = await db.storyCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b88a3b]">
            Create & manage
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase leading-none text-[#242617] md:text-6xl">
            Add story
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#242617]/55">
            Create an editorial story, assign a category and prepare it for the
            public archive.
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
        categories={categories}
        action={createStory}
        submitLabel="Create story"
      />
    </div>
  );
}
