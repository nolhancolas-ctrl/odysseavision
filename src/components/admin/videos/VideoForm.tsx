"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Video, VideoCategory } from "@prisma/client";
import { extractVimeoId, getVimeoEmbedUrl, getVimeoWatchUrl } from "@/lib/vimeo";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";

type VideoWithCategory = Video & {
  category: VideoCategory | null;
};

type VideoFormProps = {
  video?: VideoWithCategory | null;
  categories: VideoCategory[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function VideoForm({
  video,
  categories,
  action,
  submitLabel,
}: VideoFormProps) {
  const [vimeoUrl, setVimeoUrl] = useState(video?.vimeoUrl ?? "");
  const [vimeoId, setVimeoId] = useState(video?.vimeoId ?? "");
  const [thumbnailSrc, setThumbnailSrc] = useState(video?.thumbnailSrc ?? "");

  const resolvedVimeoId = useMemo(
    () => vimeoId.trim() || extractVimeoId(vimeoUrl),
    [vimeoId, vimeoUrl],
  );

  const embedUrl = useMemo(
    () => getVimeoEmbedUrl(vimeoUrl, resolvedVimeoId),
    [vimeoUrl, resolvedVimeoId],
  );

  const watchUrl = useMemo(
    () => getVimeoWatchUrl(vimeoUrl, resolvedVimeoId),
    [vimeoUrl, resolvedVimeoId],
  );

  return (
    <form
      action={action}
      className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"
    >
      <div className="min-w-0 space-y-6 overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
            Title
          </label>
          <input
            name="title"
            required
            defaultValue={video?.title ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
            placeholder="Thailand episode 1"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
            Slug
          </label>
          <input
            name="slug"
            defaultValue={video?.slug ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
            placeholder="thailand-episode-1"
          />
          <p className="mt-2 text-xs text-[#242617]/40">
            Leave empty to generate it from the title.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            defaultValue={video?.description ?? ""}
            className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
            placeholder="Short description shown on video cards."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
              Vimeo URL
            </label>
            <input
              name="vimeoUrl"
              value={vimeoUrl}
              onChange={(event) => setVimeoUrl(event.target.value)}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
              placeholder="https://vimeo.com/123456789"
            />
            <p className="mt-2 text-xs text-[#242617]/40">
              Paste the public Vimeo link. The ID is detected automatically.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
              Vimeo ID
            </label>
            <input
              name="vimeoId"
              value={resolvedVimeoId}
              onChange={(event) => setVimeoId(event.target.value)}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
              placeholder="123456789"
            />
            <p className="mt-2 text-xs text-[#242617]/40">
              Optional. Override only if the URL cannot be parsed.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/60 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d5ad68]">
                Vimeo preview
              </p>
              <p className="mt-1 text-xs text-[#242617]/45">
                This is the player that will be used on the website.
              </p>
            </div>

            {watchUrl ? (
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#242617]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#242617]/60 transition hover:border-[#b88a3b]/70 hover:text-[#b88a3b]"
              >
                Open on Vimeo
              </a>
            ) : null}
          </div>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Vimeo preview"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full rounded-3xl bg-black"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-3xl border border-dashed border-[#242617]/15 bg-white/35 px-6 text-center text-sm leading-6 text-[#242617]/45">
              Paste a Vimeo URL to preview the video here.
            </div>
          )}
        </div>
      </div>

      <aside className="min-w-0 space-y-6">
        <div className="min-w-0 overflow-hidden rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
            Thumbnail
          </label>

          <input type="hidden" name="thumbnailSrc" value={thumbnailSrc} />

          <AdminImageDropzone
            label="Video thumbnail"
            value={thumbnailSrc}
            onChange={setThumbnailSrc}
            context="video"
            entitySlug={video?.slug || video?.id || resolvedVimeoId || "draft"}
            slotKey="thumbnail"
            ratio="16 / 9"
          />
        </div>

        <div className="space-y-4 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
              Status
            </label>
            <select
              name="status"
              defaultValue={video?.status ?? "DRAFT"}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
              Existing category
            </label>
            <select
              name="categoryId"
              defaultValue={video?.categoryId ?? ""}
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
              Or new category
            </label>
            <input
              name="newCategory"
              className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
              placeholder="Travel films"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
                Duration
              </label>
              <input
                name="duration"
                defaultValue={video?.duration ?? ""}
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
                placeholder="06:48"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#242617]/40">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={
                  video?.date ? video.date.toISOString().slice(0, 10) : ""
                }
                className="w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70"
              />
            </div>
          </div>




        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-full bg-[#071321] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#b88a3b]"
          >
            {submitLabel}
          </button>

          <Link
            href="/admin/videos"
            className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:text-[#071321]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
