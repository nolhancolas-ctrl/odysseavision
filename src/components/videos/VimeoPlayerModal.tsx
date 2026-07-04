"use client";

import { useEffect } from "react";
import type { PublicVideo } from "@/lib/content/videos";

type VimeoPlayerModalProps = {
  video: PublicVideo | null;
  onClose: () => void;
};

export function VimeoPlayerModal({ video, onClose }: VimeoPlayerModalProps) {
  useEffect(() => {
    if (!video) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071008]/85 px-4 py-8 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close video player"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-4 text-[#f4efe4]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
              {video.category}
            </p>
            <h2 className="mt-2 font-serif text-3xl uppercase leading-none">
              {video.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-xl text-white/70 transition hover:bg-white hover:text-[#071008]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <iframe
          src={`${video.embedUrl}&autoplay=1`}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full bg-black shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        />

        {video.watchUrl ? (
          <a
            href={video.watchUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 transition hover:text-white"
          >
            Watch on Vimeo →
          </a>
        ) : null}
      </div>
    </div>
  );
}
