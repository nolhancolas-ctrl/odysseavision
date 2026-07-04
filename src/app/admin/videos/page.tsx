import Link from "next/link";
import { deleteVideo } from "@/server/actions/videos";
import { db } from "@/lib/db";
import { getVimeoEmbedUrl, getVimeoWatchUrl, isPlaceholderVimeoId } from "@/lib/vimeo";

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

  const vimeoReadyCount = videos.filter((video) =>
    getVimeoEmbedUrl(video.vimeoUrl, video.vimeoId),
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

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Total videos
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {videos.length}
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

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
            Vimeo links
          </p>
          <p className="mt-3 font-serif text-4xl text-[#242617]">
            {vimeoReadyCount}
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
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
            No videos yet. Create your first video or run the placeholder seed.
          </div>
        ) : (
          <div className="divide-y divide-[#242617]/10">
            {videos.map((video) => {
              const embedUrl = getVimeoEmbedUrl(video.vimeoUrl, video.vimeoId);
              const watchUrl = getVimeoWatchUrl(video.vimeoUrl, video.vimeoId);
              const isPlaceholder = isPlaceholderVimeoId(video.vimeoId || video.vimeoUrl);

              return (
                <article
                  key={video.id}
                  className="grid gap-5 p-5 md:grid-cols-[220px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-2xl bg-[#071321]">
                    {embedUrl && !isPlaceholder ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="aspect-video w-full bg-[#071321]"
                      />
                    ) : (
                      <div
                        className="relative flex aspect-video flex-col items-center justify-center bg-[#071321] bg-cover bg-center px-5 text-center"
                        style={{
                          backgroundImage: `url(${video.thumbnailSrc})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[#071321]/75" />
                        <div className="relative">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]">
                            Sorry
                          </p>
                          <p className="mt-2 text-xs leading-5 text-[#f4efe4]/65">
                            This video is not available yet. The owner has been notified.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

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

                      {embedUrl ? (
                        <span className="rounded-full border border-[#b88a3b]/25 bg-[#d5ad68]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                          Vimeo detected
                        </span>
                      ) : (
                        <span className="rounded-full border border-red-900/15 bg-red-900/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-900/60">
                          No Vimeo link
                        </span>
                      )}

                      {video.category ? (
                        <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/45">
                          {video.category.name}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-serif text-3xl uppercase leading-none text-[#242617]">
                      {video.title}
                    </h2>

                    <p className="mt-2 text-xs text-[#242617]/35">
                      /videos/{video.slug}
                    </p>

                    <p className="mt-3 break-all rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/60 px-4 py-3 text-xs leading-5 text-[#242617]/55">
                      Vimeo URL: {video.vimeoUrl || "No Vimeo URL yet"}
                    </p>

                    {video.description ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#242617]/55">
                        {video.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-start gap-3 md:justify-end">
                    {watchUrl ? (
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#242617]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#242617]/70 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                      >
                        Open
                      </a>
                    ) : null}

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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
