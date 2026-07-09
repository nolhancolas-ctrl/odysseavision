"use client";

import { useMemo, useState } from "react";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import type { PublicSectionContent } from "@/lib/content/site";
import type { PublicVideo } from "@/lib/content/videos";
import { VimeoPlayerModal } from "./VimeoPlayerModal";

type VideoCollectionProps = {
  content?: PublicSectionContent;
  videos: PublicVideo[];
  videoCategories: string[];
};

export function VideoCollection({
  content,
  videos,
  videoCategories,
}: VideoCollectionProps) {
  const [category, setCategory] = useState("All films");
  const [activeVideo, setActiveVideo] = useState<PublicVideo | null>(null);

  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeCategories =
    Array.isArray(videoCategories) && videoCategories.length > 0
      ? videoCategories
      : ["All films"];

  const filteredVideos = useMemo(
    () =>
      category === "All films"
        ? safeVideos
        : safeVideos.filter((video) => video.category === category),
    [category, safeVideos],
  );

  return (
    <section
      id="films"
      className="relative bg-[#11190f] px-6 py-16 text-[#f4efe4] md:px-14 md:py-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {content?.eyebrow || "Explore more films"}
          </p>

          <h2 className="mt-4 font-serif text-4xl uppercase md:text-5xl">
            {content?.title || "Our collection"}
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-4">
          {safeCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`cursor-pointer border px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition ${
                category === item
                  ? "border-white/55 text-white"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <article key={video.slug}>
              <button
                type="button"
                onClick={() => {
                  if (video.embedUrl) setActiveVideo(video);
                }}
                disabled={!video.embedUrl}
                className="group relative block aspect-[1.75] w-full cursor-pointer overflow-hidden bg-[#263024] text-left disabled:cursor-not-allowed"
                aria-label={`Watch ${video.title}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
                />
                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />
                <FrameWatermark />

                {video.duration ? (
                  <span className="absolute right-3 top-3 text-[9px] text-white">
                    {video.duration}
                  </span>
                ) : null}
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/15 text-sm opacity-0 transition group-hover:opacity-100">
                  {video.embedUrl ? "▶" : "—"}
                </span>
              </button>

              <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em]">
                {video.title}
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-6 text-white/55">
                {video.description}
              </p>

              <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {video.category}
              </p>
            </article>
          ))}
        </div>
      </div>

      <VimeoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      <img
        src="/images/stories/torn-paper.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-2px] left-0 h-14 w-full object-fill"
      />
    </section>
  );
}
