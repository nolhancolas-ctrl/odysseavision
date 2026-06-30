import { notFound } from "next/navigation";
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5ad68]">
          Edit story
        </p>
        <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#f4efe4]">
          {story.title}
        </h1>
      </div>

      <StoryForm
        story={story}
        categories={categories}
        action={updateStory.bind(null, story.id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
