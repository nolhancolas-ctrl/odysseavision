"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type StoryVideoAlignment =
  | "left"
  | "center"
  | "full"
  | "right";

export type StoryVideoSize =
  | "small"
  | "medium"
  | "large";

export type StoryVideoKind =
  | "youtube"
  | "vimeo"
  | "direct";

export type StoryVideoDraft = {
  source: string;
  caption: string;
  alignment: StoryVideoAlignment;
  size: StoryVideoSize;
};

export type ResolvedStoryVideo = {
  kind: StoryVideoKind;
  source: string;
  embedUrl: string;
};

type StoryVideoDialogProps = {
  initialDraft: StoryVideoDraft;
  editing: boolean;
  onCancel: () => void;
  onRemove?: () => void;
  onSave: (draft: StoryVideoDraft) => void;
};

export function createEmptyStoryVideoDraft(): StoryVideoDraft {
  return {
    source: "",
    caption: "",
    alignment: "center",
    size: "large",
  };
}

function cleanVideoId(value: string) {
  return /^[a-zA-Z0-9_-]{6,20}$/.test(value)
    ? value
    : "";
}

export function resolveStoryVideoUrl(
  rawValue: string,
): ResolvedStoryVideo | null {
  const source = rawValue.trim();

  if (!source) return null;

  let url: URL;

  try {
    url = new URL(source);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const hostname = url.hostname
    .replace(/^www\./, "")
    .toLowerCase();

  if (hostname === "youtu.be") {
    const id = cleanVideoId(
      url.pathname.split("/").filter(Boolean)[0] || "",
    );

    if (!id) return null;

    return {
      kind: "youtube",
      source,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    const segments = url.pathname.split("/").filter(Boolean);

    const id = cleanVideoId(
      url.searchParams.get("v") ||
        (
          ["embed", "shorts", "live"].includes(segments[0] || "")
            ? segments[1]
            : ""
        ) ||
        "",
    );

    if (!id) return null;

    return {
      kind: "youtube",
      source,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  if (
    hostname === "vimeo.com" ||
    hostname === "player.vimeo.com"
  ) {
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments
      .slice()
      .reverse()
      .find((segment) => /^\d+$/.test(segment));

    if (!id) return null;

    return {
      kind: "vimeo",
      source,
      embedUrl: `https://player.vimeo.com/video/${id}`,
    };
  }

  if (/\.(?:mp4|webm|ogg)(?:$|[?#])/i.test(source)) {
    return {
      kind: "direct",
      source,
      embedUrl: source,
    };
  }

  return null;
}

function optionClass(active: boolean) {
  return [
    "flex h-12 cursor-pointer items-center justify-center rounded-2xl",
    "border px-4 text-[10px] font-bold uppercase tracking-[0.16em]",
    "transition",
    active
      ? "border-[#071321] bg-[#071321] text-white"
      : "border-[#242617]/12 bg-[#f4efe4]/60 text-[#242617]/50 hover:border-[#b88a3b]/55 hover:text-[#242617]",
  ].join(" ");
}

function VideoPreview({
  video,
}: {
  video: ResolvedStoryVideo;
}) {
  if (video.kind === "direct") {
    return (
      <video
        src={video.embedUrl}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
      />
    );
  }

  return (
    <iframe
      src={video.embedUrl}
      title="Story video preview"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="h-full w-full border-0"
    />
  );
}

export function StoryVideoDialog({
  initialDraft,
  editing,
  onCancel,
  onRemove,
  onSave,
}: StoryVideoDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState(initialDraft.source);
  const [caption, setCaption] = useState(initialDraft.caption);
  const [alignment, setAlignment] = useState(
    initialDraft.alignment,
  );
  const [size, setSize] = useState(initialDraft.size);
  const [error, setError] = useState("");

  const resolvedVideo = useMemo(
    () => resolveStoryVideoUrl(source),
    [source],
  );

  useEffect(() => {
    setMounted(true);

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onCancel]);

  function submit() {
    if (!resolvedVideo) {
      setError(
        "Enter a valid YouTube, Vimeo, MP4, WebM or OGG URL.",
      );
      return;
    }

    onSave({
      source: source.trim(),
      caption: caption.trim(),
      alignment,
      size,
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#071321]/42 p-4 backdrop-blur-md md:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit video" : "Insert a video"}
        className="flex max-h-[90svh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[2.5rem] border border-white/55 bg-[#f7f2e8] text-[#242617] shadow-[0_40px_120px_rgba(7,19,33,0.35)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-5 border-b border-[#242617]/10 px-7 py-6 md:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Story media
            </p>

            <h2 className="mt-2 font-serif text-3xl tracking-[-0.04em] md:text-4xl">
              {editing ? "Edit video" : "Insert a video"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close video editor"
            className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#071321] text-2xl text-white transition hover:bg-[#1d2b38]"
          >
            ×
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.08fr_0.92fr]">
          <section className="border-b border-[#242617]/10 p-7 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
              Live preview
            </p>

            <div className="mt-5 aspect-video overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-[#071321] shadow-[0_18px_50px_rgba(7,19,33,0.12)]">
              {resolvedVideo ? (
                <VideoPreview video={resolvedVideo} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white/55">
                  <span className="text-4xl">▶</span>

                  <p className="mt-5 max-w-sm text-sm leading-7">
                    Paste a YouTube, Vimeo or direct video URL
                    to see the preview.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs leading-6 text-[#242617]/42">
              YouTube and Vimeo links are converted into
              privacy-friendly responsive embeds. Direct MP4,
              WebM and OGG files use the native video player.
            </p>
          </section>

          <section className="space-y-7 p-7 lg:p-10">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Video URL
              </span>

              <input
                type="url"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setError("");
                }}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                className="h-14 w-full rounded-2xl border border-[#242617]/12 bg-[#f4efe4]/75 px-5 text-sm outline-none transition placeholder:text-[#242617]/28 focus:border-[#b88a3b]/65"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Legend
              </span>

              <textarea
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                placeholder="Credit, context or a short description"
                rows={3}
                className="w-full resize-none rounded-2xl border border-[#242617]/12 bg-[#f4efe4]/75 px-5 py-4 text-sm leading-6 outline-none transition placeholder:text-[#242617]/28 focus:border-[#b88a3b]/65"
              />
            </label>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Placement
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["left", "Left"],
                    ["center", "Center"],
                    ["full", "Full"],
                    ["right", "Right"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAlignment(value)}
                    className={optionClass(alignment === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/45">
                Size
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["small", "Small"],
                    ["medium", "Medium"],
                    ["large", "Large"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSize(value)}
                    className={optionClass(size === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </section>
        </div>

        <footer className="flex shrink-0 flex-col-reverse justify-between gap-3 border-t border-[#242617]/10 bg-[#f7f2e8] px-7 py-5 sm:flex-row sm:items-center md:px-10">
          <div>
            {editing && onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="h-12 cursor-pointer rounded-full border border-red-400/35 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-red-700/65 transition hover:bg-red-500/7"
              >
                Remove video
              </button>
            ) : null}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 cursor-pointer rounded-full border border-[#242617]/12 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/45 transition hover:text-[#242617]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              className="h-12 cursor-pointer rounded-full bg-[#202810] px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#374125]"
            >
              {editing ? "Save video" : "Insert video"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
