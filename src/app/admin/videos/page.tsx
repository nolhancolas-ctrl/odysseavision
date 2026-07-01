import Link from "next/link";
import { deleteVideo } from "@/server/actions/videos";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const [videos, categories] = await Promise.all([
    db.video.findMany({
      include: { category: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    db.videoCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);

  const publishedCount = videos.filter(
    (video) => video.status === "PUBLISHED",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Create & manage
          </p>
          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
            Videos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Add Vimeo films, manage thumbnails, descriptions, categories and featured videos.
          </p>
        </div>

        <Link
          href="/admin/videos/new"
          className="rounded-full bg-[#d5ad68] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#071008] transition hover:bg-[#f4efe4]"
        >
          Add video
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Total videos
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {videos.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Published
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Categories
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {categories.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        {videos.length === 0 ? (
          <div className="p-8 text-sm text-[#242617]/55">
            No videos yet. Create your first video.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {videos.map((video) => (
              <article
                key={video.id}
                className="grid gap-5 p-5 md:grid-cols-[160px_1fr_auto]"
              >
                <div
                  className="aspect-video rounded-2xl bg-[#e8dfcf] bg-cover bg-center"
                  style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
                />

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/55">
                      {video.status}
                    </span>

                    {video.featured ? (
                      <span className="rounded-full border border-[#d5ad68]/30 bg-[#d5ad68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                        Featured
                      </span>
                    ) : null}

                    {video.category ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {video.category.name}
                      </span>
                    ) : null}

                    {video.duration ? (
                      <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                        {video.duration}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                    {video.title}
                  </h2>

                  <p className="mt-2 text-xs text-[#242617]/35">
                    /videos/{video.slug}
                  </p>

                  {video.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                      {video.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3 md:justify-end">
                  <Link
                    href={`/admin/videos/${video.id}`}
                    className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/70 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                  >
                    Edit
                  </Link>

                  <form action={deleteVideo.bind(null, video.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-400/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-900/55 transition hover:border-red-800/40 hover:text-red-900"
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
