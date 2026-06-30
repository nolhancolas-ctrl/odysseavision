import Link from "next/link";
import type { Story, StoryCategory } from "@prisma/client";

type StoryWithCategory = Story & {
  category: StoryCategory | null;
};

type StoryFormProps = {
  story?: StoryWithCategory | null;
  categories: StoryCategory[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function StoryForm({
  story,
  categories,
  action,
  submitLabel,
}: StoryFormProps) {
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
            defaultValue={story?.title ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="Into the quiet blue"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Slug
          </label>
          <input
            name="slug"
            defaultValue={story?.slug ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="into-the-quiet-blue"
          />
          <p className="mt-2 text-xs text-[#f4efe4]/35">
            Leave empty to generate it from the title.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={story?.excerpt ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm leading-6 text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="A short introduction shown on story cards."
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Full content
          </label>
          <textarea
            name="content"
            rows={12}
            defaultValue={story?.content ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm leading-7 text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="Write the full story here. Use line breaks to separate paragraphs."
          />
        </div>

      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-[#f4efe4]/10 bg-[#10190f]/80 p-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
            Cover image
          </label>
          <input
            name="imageSrc"
            defaultValue={story?.imageSrc ?? ""}
            className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            placeholder="/images/stories/story_01.png"
          />

          {story?.imageSrc ? (
            <div
              className="mt-5 aspect-[4/3] rounded-3xl bg-[#071008] bg-cover bg-center"
              style={{ backgroundImage: `url(${story.imageSrc})` }}
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
              defaultValue={story?.status ?? "DRAFT"}
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
              defaultValue={story?.categoryId ?? ""}
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
              placeholder="Behind the lens"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Date
            </label>
            <input
              type="date"
              name="date"
              defaultValue={story?.date ? story.date.toISOString().slice(0, 10) : ""}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Read time
            </label>
            <input
              name="readTime"
              defaultValue={story?.readTime ?? ""}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
              placeholder="5 min read"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/55">
              Order
            </label>
            <input
              type="number"
              name="order"
              defaultValue={story?.order ?? 0}
              className="w-full rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4] outline-none transition focus:border-[#d5ad68]/70"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#f4efe4]/10 bg-[#071008] px-4 py-3 text-sm text-[#f4efe4]/75">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story?.featured ?? false}
              className="h-4 w-4 accent-[#d5ad68]"
            />
            Featured story
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
            href="/admin/stories"
            className="rounded-full border border-[#f4efe4]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4]/70 transition hover:border-[#f4efe4]/35 hover:text-[#f4efe4]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
