import Link from "next/link";
import { VideoSettingsManager } from "@/components/admin/videos/VideoSettingsManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VideoSettingsPage() {
  const videos = await db.video.findMany({
    include: {
      category: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const publishedCount = videos.filter(
    (video) => video.status === "PUBLISHED",
  ).length;
  const featuredVideo = videos.find((video) => video.featured);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
            Video configuration
          </p>

          <h1 className="mt-3 font-serif text-5xl uppercase tracking-[-0.04em] text-[#242617]">
            Video settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#242617]/55">
            Organize the public order of films and select the Featured Video.
            Changes are saved automatically.
          </p>
        </div>

        <Link
          href="/admin/videos"
          className="inline-flex items-center justify-center rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:bg-[#071321] hover:text-white"
        >
          Back to Videos
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total videos", videos.length],
          ["Published", publishedCount],
          ["Featured", featuredVideo?.title ?? "None"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-5 shadow-[0_18px_50px_rgba(20,20,10,0.06)]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#242617]/45">
              {label}
            </p>
            <p className="mt-3 truncate font-serif text-4xl text-[#242617]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="border-b border-[#242617]/10 p-5 md:px-6 md:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b88a3b]">
            Public collection
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#242617]">
            Video order and Featured Film
          </h2>
        </div>

        <div className="p-5 md:p-6">
          {videos.length ? (
            <VideoSettingsManager
              initialItems={videos.map((video) => ({
                id: video.id,
                title: video.title,
                slug: video.slug,
                imageSrc: video.thumbnailSrc,
                status: video.status,
                category: video.category?.name ?? "",
                featured: video.featured,
                order: video.order,
              }))}
            />
          ) : (
            <p className="text-sm text-[#242617]/45">
              No videos are available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
