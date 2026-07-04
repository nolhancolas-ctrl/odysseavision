import Link from "next/link";
import { db } from "@/lib/db";
import {
  getVimeoEmbedUrl,
  getVimeoWatchUrl,
  isPlaceholderVimeoId,
} from "@/lib/vimeo";

export async function VideosVimeoStatus() {
  const videos = await db.video.findMany({
    include: {
      category: true,
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    take: 6,
  });

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#242617]/10 p-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Vimeo sources
          </p>
          <h2 className="mt-2 font-serif text-3xl uppercase leading-none text-[#242617]">
            Video links preview
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#242617]/55">
            These Vimeo links come from the Videos manager. Placeholder links are intentionally visible, even if they are not playable yet.
          </p>
        </div>

        <Link
          href="/admin/videos"
          className="rounded-full bg-[#071321] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#f4efe4] hover:text-[#071321]"
        >
          Manage videos
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="p-6 text-sm text-[#242617]/55">
          No videos found yet. Run the Vimeo placeholder seed.
        </div>
      ) : (
        <div className="grid gap-5 p-6 lg:grid-cols-3">
          {videos.map((video) => {
            const embedUrl = getVimeoEmbedUrl(video.vimeoUrl, video.vimeoId);
            const watchUrl = getVimeoWatchUrl(video.vimeoUrl, video.vimeoId);
            const isPlaceholder = isPlaceholderVimeoId(
              video.vimeoId || video.vimeoUrl,
            );
            const canPreview = Boolean(embedUrl) && !isPlaceholder;

            return (
              <article
                key={video.id}
                className="overflow-hidden rounded-[1.5rem] border border-[#242617]/10 bg-[#f4efe4]/70"
              >
                {canPreview ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full bg-[#071321]"
                  />
                ) : (
                  <div
                    className="relative flex aspect-video flex-col items-center justify-center bg-[#071321] bg-cover bg-center px-6 text-center"
                    style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
                  >
                    <div className="absolute inset-0 bg-[#071321]/75" />
                    <div className="relative">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]">
                        Sorry
                      </p>
                      <p className="mt-2 max-w-xs text-xs leading-5 text-[#f4efe4]/65">
                        This video is not available yet. The owner has been notified.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#242617]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#242617]/50">
                      {video.status}
                    </span>

                    {canPreview ? (
                      <span className="rounded-full border border-[#b88a3b]/25 bg-[#d5ad68]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                        Playable embed
                      </span>
                    ) : isPlaceholder ? (
                      <span className="rounded-full border border-[#b88a3b]/25 bg-[#d5ad68]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b88a3b]">
                        Placeholder link
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-900/15 bg-red-900/5 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-red-900/60">
                        Missing link
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl uppercase leading-none text-[#242617]">
                    {video.title}
                  </h3>

                  <p className="mt-3 break-all text-xs leading-5 text-[#242617]/45">
                    {video.vimeoUrl || "No Vimeo URL"}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {watchUrl ? (
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/65 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                      >
                        Open
                      </a>
                    ) : null}

                    <Link
                      href={`/admin/videos/${video.id}`}
                      className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#242617]/65 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
