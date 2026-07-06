import type {
  PortfolioCategory,
  PortfolioItem,
} from "@prisma/client";

type PortfolioItemFormProps = {
  item?: PortfolioItem | null;
  categories: PortfolioCategory[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

function formatDateInput(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#11170f]/10 bg-white/60 px-4 py-3 text-sm text-[#11170f] outline-none transition placeholder:text-[#11170f]/35 focus:border-[#b88a3b]/60 focus:bg-white";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#11170f]/48";

export function PortfolioItemForm({
  item,
  categories,
  action,
  submitLabel,
}: PortfolioItemFormProps) {
  return (
    <form action={action} className="space-y-7">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl">Content</h2>

          <div className="mt-6 grid gap-5">
            <label>
              <span className={labelClass}>Title</span>
              <input
                name="title"
                required
                defaultValue={item?.title ?? ""}
                placeholder="Wild escape in Iceland"
                className={inputClass}
              />
            </label>

            <label>
              <span className={labelClass}>Slug</span>
              <input
                name="slug"
                defaultValue={item?.slug ?? ""}
                placeholder="wild-escape-iceland"
                className={inputClass}
              />
              <p className="mt-2 text-xs leading-5 text-[#11170f]/45">
                Leave empty to generate it automatically from the title.
              </p>
            </label>

            <label>
              <span className={labelClass}>Description</span>
              <textarea
                name="description"
                rows={5}
                defaultValue={item?.description ?? ""}
                placeholder="Short description displayed on portfolio cards."
                className={inputClass}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClass}>Location</span>
                <input
                  name="location"
                  defaultValue={item?.location ?? ""}
                  placeholder="Iceland"
                  className={inputClass}
                />
              </label>

              <label>
                <span className={labelClass}>Date</span>
                <input
                  type="date"
                  name="date"
                  defaultValue={formatDateInput(item?.date)}
                  className={inputClass}
                />
              </label>
            </div>

            <label>
              <span className={labelClass}>Tags</span>
              <input
                name="tags"
                defaultValue={item?.tags ?? ""}
                placeholder="ocean, wildlife, travel"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <h2 className="font-serif text-3xl">Image</h2>

            <label className="mt-6 block">
              <span className={labelClass}>Image URL</span>
              <input
                name="imageSrc"
                required
                defaultValue={item?.imageSrc ?? ""}
                placeholder="/images/portfolio/example.png"
                className={inputClass}
              />
            </label>

            {item?.imageSrc ? (
              <div
                className="mt-5 aspect-[4/3] rounded-3xl bg-[#d8d0c2] bg-cover bg-center"
                style={{ backgroundImage: `url(${item.imageSrc})` }}
              />
            ) : (
              <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-[#11170f]/15 text-sm text-[#11170f]/35">
                Image preview
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <h2 className="font-serif text-3xl">Publishing</h2>

            <div className="mt-6 grid gap-5">
              <label>
                <span className={labelClass}>Status</span>
                <select
                  name="status"
                  defaultValue={item?.status ?? "DRAFT"}
                  className={inputClass}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>

              <label>
                <span className={labelClass}>Category</span>
                <select
                  name="categoryId"
                  defaultValue={item?.categoryId ?? ""}
                  className={inputClass}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className={labelClass}>New category</span>
                <input
                  name="categoryName"
                  placeholder="Vintage"
                  className={inputClass}
                />
                <p className="mt-2 text-xs leading-5 text-[#11170f]/45">
                  Optional. If filled, this will override the selected category.
                </p>
              </label>

              <label>
                <span className={labelClass}>Display order</span>
                <input
                  type="number"
                  name="order"
                  defaultValue={item?.order ?? 0}
                  className={inputClass}
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/50 px-4 py-3">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={item?.featured ?? false}
                  className="h-4 w-4 accent-[#071321]"
                />
                <span className="text-sm text-[#11170f]/68">
                  Featured item
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="rounded-full bg-[#071321] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
        >
          {submitLabel}
        </button>

        <a
          href="/admin/portfolio"
          className="rounded-full border border-[#11170f]/12 px-7 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#11170f]/55 transition hover:bg-[#071321] hover:text-[#f4efe4]"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
