import Link from "next/link";
import { deleteStory } from "@/server/actions/stories";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  const [stories, categories] = await Promise.all([
    db.story.findMany({
      include: { category: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.storyCategory.findMany({
      include: { _count: { select: { stories: true } } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  const publishedCount = stories.filter(
    (story) => story.status === "PUBLISHED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d5ad68]">
            Create & manage
          </p>
          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#f4efe4]">
            Stories
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f4efe4]/55">
            Write, organize and publish editorial stories from the admin platform.
          </p>
        </div>

        <Link
          href="/admin/stories/new"
          className="rounded-full bg-[#d5ad68] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#071008] transition hover:bg-[#f4efe4]"
        >
          Add story
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f4efe4]/45">
            Total stories
          </p>
          <p className="mt-3 font-serif text-4xl text-[#f4efe4]">
            {stories.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f4efe4]/45">
            Published
          </p>
          <p className="mt-3 font-serif text-4xl text-[#f4efe4]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f4efe4]/45">
            Categories
          </p>
          <p className="mt-3 font-serif text-4xl text-[#f4efe4]">
            {categories.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80">
        {stories.length === 0 ? (
          <div className="p-8 text-sm text-[#f4efe4]/55">
            No stories yet. Create your first story.
          </div>
        ) : (
          <div className="divide-y divide-[#f4efe4]/10">
            {stories.map((story) => (
              <article
                key={story.id}
                className="grid gap-5 p-5 md:grid-cols-[120px_1fr_auto]"
              >
                <div
                  className="aspect-[4/3] rounded-2xl bg-[#071008] bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.imageSrc})` }}
                />

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#f4efe4]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4efe4]/55">
                      {story.status}
                    </span>

                    {story.featured ? (
                      <span className="rounded-full border border-[#d5ad68]/30 bg-[#d5ad68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d5ad68]">
                        Featured
                      </span>
                    ) : null}

                    {story.category ? (
                      <span className="rounded-full border border-[#f4efe4]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4efe4]/45">
                        {story.category.name}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="font-serif text-3xl uppercase leading-none text-[#f4efe4]">
                    {story.title}
                  </h2>

                  <p className="mt-2 text-xs text-[#f4efe4]/35">
                    /stories/{story.slug}
                  </p>

                  {story.excerpt ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f4efe4]/55">
                      {story.excerpt}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3 md:justify-end">
                  <Link
                    href={`/admin/stories/${story.id}`}
                    className="rounded-full border border-[#f4efe4]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f4efe4]/70 transition hover:border-[#d5ad68]/60 hover:text-[#d5ad68]"
                  >
                    Edit
                  </Link>

                  <form action={deleteStory.bind(null, story.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-200/70 transition hover:border-red-300/50 hover:text-red-100"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
