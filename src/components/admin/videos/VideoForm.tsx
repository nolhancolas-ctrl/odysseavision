import Link from "next/link";
import type { Video, VideoCategory } from "@prisma/client";

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
  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6 rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-6">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Title
          </label>
          <input
            name="title"
            required
            defaultValue={video?.title ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="Thailand episode 1"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Slug
          </label>
          <input
            name="slug"
            defaultValue={video?.slug ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="thailand-episode-1"
          />
          <p className="mt-2 text-xs text-[#f4efe4]/35">
            Leave empty to generate it from the title.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Description
          </label>
          <textarea
            name="description"
            rows={5}
            defaultValue={video?.description ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm leading-6 text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="Short description shown on video cards."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Vimeo URL
            </label>
            <input
              name="vimeoUrl"
              defaultValue={video?.vimeoUrl ?? ""}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
              placeholder="https://vimeo.com/..."
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Vimeo ID
            </label>
            <input
              name="vimeoId"
              defaultValue={video?.vimeoId ?? ""}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
              placeholder="123456789"
            />
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Thumbnail
          </label>
          <input
            name="thumbnailSrc"
            defaultValue={video?.thumbnailSrc ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="/images/videos/film_thailand_01.png"
          />

          {video?.thumbnailSrc ? (
            <div
              className="mt-5 aspect-video rounded-3xl bg-[#071008] bg-cover bg-center"
              style={{ backgroundImage: `url(${video.thumbnailSrc})` }}
            />
          ) : null}
        </div>

        <div className="space-y-4 rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Status
            </label>
            <select
              name="status"
              defaultValue={video?.status ?? "DRAFT"}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Existing category
            </label>
            <select
              name="categoryId"
              defaultValue={video?.categoryId ?? ""}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Or new category
            </label>
            <input
              name="newCategory"
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
              placeholder="Travel films"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
                Duration
              </label>
              <input
                name="duration"
                defaultValue={video?.duration ?? ""}
                className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
                placeholder="06:48"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
                Date
              </label>
              <input
                type="date"
                name="date"
                defaultValue={video?.date ? video.date.toISOString().slice(0, 10) : ""}
                className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Order
            </label>
            <input
              type="number"
              name="order"
              defaultValue={video?.order ?? 0}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4]/75">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={video?.featured ?? false}
              className="h-4 w-4 accent-[#d5ad68]"
            />
            Featured video
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-[#d5ad68] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#071008] transition hover:bg-[#f4efe4]"
          >
            {submitLabel}
          </button>

          <Link
            href="/admin/videos"
            className="rounded-full border border-[#f4efe4]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]/70 transition hover:border-[#f4efe4]/35 hover:text-[#f4efe4]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
