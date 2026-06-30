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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5ad68]">
          New story
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#f4efe4]">
          Add story
        </h1>
      </div>

      <StoryForm
        categories={categories}
        action={createStory}
        submitLabel="Create story"
      />
    </div>
  );
}
