import Link from "next/link";
import { db } from "@/lib/db";
import { StorySettingsManager } from "@/components/admin/stories/StorySettingsManager";
import { StoryTypographyEditor } from "@/components/admin/stories/StoryTypographyEditor";
import { getStoryTypographySettings } from "@/lib/content/storyTypography";

export const dynamic = "force-dynamic";

export default async function StorySettingsPage() {
  const [stories, typographySettings] = await Promise.all([
    db.story.findMany({
      include: {
        category: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    }),
    getStoryTypographySettings(),
  ]);

  const publishedCount = stories.filter(
    (story) => story.status === "PUBLISHED",
  ).length;

  const featuredStory = stories.find((story) => story.featured);

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Editorial configuration
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
            Story settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Manage the public order and choose the Featured Story from one
            central workspace.
          </p>
        </div>

        <Link
          href="/admin/stories"
          className="inline-flex items-center justify-center rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:bg-[#071321] hover:text-white"
        >
          Back to stories
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Ordered stories
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {stories.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Published
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {publishedCount}
          </p>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Featured Story
          </p>
          <p
            className="mt-3 truncate font-serif text-2xl text-[#242617]"
            title={featuredStory?.title ?? "None selected"}
          >
            {featuredStory?.title ?? "None selected"}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 p-5 md:px-6 md:py-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Editorial flow
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#242617]">
              Public story order
            </h2>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#242617]/35">
            Drag & drop enabled
          </p>
        </div>

        <div className="p-4 md:p-6">
          {stories.length ? (
            <StorySettingsManager
              initialItems={stories.map((story) => ({
                id: story.id,
                title: story.title,
                slug: story.slug,
                imageSrc: story.imageSrc,
                status: story.status,
                category: story.category?.name ?? "",
                featured: story.featured,
                order: story.order,
              }))}
            />
          ) : (
            <div className="py-16 text-center text-sm text-[#242617]/45">
              Create a story before configuring its order.
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-5 md:px-6 md:py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
            Editorial appearance
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            Typography & rhythm
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-[#242617]/45">
            Define how titles, paragraphs, quotes and photo legends are
            rendered across every public Story.
          </p>
        </div>

        <div className="p-4 md:p-6">
          <StoryTypographyEditor
            initialSettings={typographySettings}
          />
        </div>
      </section>
    </div>
  );
}
