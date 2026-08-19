"use client";

import { useEffect, useRef, useState } from "react";
import type { PortfolioCategory, PortfolioItem } from "@prisma/client";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";

type PortfolioItemFormProps = {
  item?: PortfolioItem | null;
  categories: PortfolioCategory[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

type StatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type CategoryValue = string | "__new__";

const statusOptions: Array<{
  value: StatusValue;
  label: string;
  description: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
    description: "Hidden from the public portfolio.",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description: "Visible on the public portfolio.",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    description: "Kept in admin but removed from public display.",
  },
];

function formatDateInput(date?: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function parseStatus(value: string | undefined): StatusValue {
  if (value === "PUBLISHED" || value === "ARCHIVED") return value;
  return "DRAFT";
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#11170f] outline-none transition placeholder:text-[#11170f]/35 focus:border-[#b88a3b]/60 focus:bg-[#f4efe4]";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#11170f]/48";

function StatusSelect({
  value,
  onChange,
}: {
  value: StatusValue;
  onChange: (value: StatusValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected =
    statusOptions.find((option) => option.value === value) ?? statusOptions[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-[#f4efe4]/80 px-4 py-3 text-left transition ${
          open
            ? "border-[#b88a3b]/70"
            : "border-[#11170f]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-[#11170f]">
            {selected.label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#11170f]/42">
            {selected.description}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#11170f]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#11170f]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {statusOptions.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-xl px-4 py-3 text-left transition ${
                isSelected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#11170f]/60 hover:bg-[#e8dfcf] hover:text-[#11170f]"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em]">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  isSelected ? "text-[#f4efe4]/62" : "text-[#11170f]/42"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategorySelect({
  value,
  categories,
  error,
  onChange,
}: {
  value: CategoryValue | "";
  categories: PortfolioCategory[];
  error: string;
  onChange: (value: CategoryValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedCategory = categories.find((category) => category.id === value);

  const selectedLabel =
    value === "__new__"
      ? "New category"
      : selectedCategory?.name || "Choose a category";

  const selectedDescription =
    value === "__new__"
      ? "Create a new portfolio category."
      : selectedCategory
        ? "Existing portfolio category."
        : "A category is required before saving.";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-[#f4efe4]/80 px-4 py-3 text-left transition ${
          error
            ? "border-red-900/45"
            : open
              ? "border-[#b88a3b]/70"
              : "border-[#11170f]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span
            className={`block text-sm font-semibold ${
              value ? "text-[#11170f]" : "text-[#11170f]/38"
            }`}
          >
            {selectedLabel}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#11170f]/42">
            {selectedDescription}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#11170f]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#11170f]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {categories.map((category) => {
          const isSelected = category.id === value;

          return (
            <button
              key={category.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(category.id);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] transition ${
                isSelected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#11170f]/60 hover:bg-[#e8dfcf] hover:text-[#11170f]"
              }`}
            >
              {category.name}
            </button>
          );
        })}

        <button
          type="button"
          role="option"
          aria-selected={value === "__new__"}
          onClick={() => {
            onChange("__new__");
            setOpen(false);
          }}
          className={`mt-1 block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] transition ${
            value === "__new__"
              ? "bg-[#071321] text-[#f4efe4]"
              : "text-[#b88a3b] hover:bg-[#d5ad68]/15"
          }`}
        >
          + New category
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-900/70">{error}</p>
      ) : null}
    </div>
  );
}

export function PortfolioItemForm({
  item,
  categories,
  action,
  submitLabel,
}: PortfolioItemFormProps) {
  const itemWithWatermark = item as (PortfolioItem & {
    watermark?: string | null;
  }) | null;

  const [status, setStatus] = useState<StatusValue>(parseStatus(item?.status));
  const [categoryId, setCategoryId] = useState<CategoryValue | "">(
    item?.categoryId ?? "",
  );
  const [categoryError, setCategoryError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [imageSrc, setImageSrc] = useState(item?.imageSrc ?? "");
  const [imageError, setImageError] = useState("");
  const [order, setOrder] = useState(item?.order ?? 0);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [watermark, setWatermark] = useState(
    itemWithWatermark?.watermark ?? "NONE",
  );

  const uploadSlug = item?.slug || item?.id || "draft";
  const watermarkEnabled = watermark === "ANDREW" || watermark === "MORGANE";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!imageSrc) {
          event.preventDefault();
          setImageError("Please upload an image.");
          return;
        }

        if (!categoryId) {
          event.preventDefault();
          setCategoryError("Please choose a category.");
          return;
        }

        if (categoryId === "__new__" && !categoryName.trim()) {
          event.preventDefault();
          setCategoryError("Please name the new category.");
        }
      }}
      className="space-y-7"
    >
      <input type="hidden" name="imageSrc" value={imageSrc} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="watermark" value={watermark} />
      <input type="hidden" name="tags" value={item?.tags ?? ""} />

      <section className="grid w-full min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        <section className="h-full min-w-0 rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl">Content</h2>

          <div className="mt-6 grid gap-5">
            <label className="min-w-0">
              <span className={labelClass}>Title</span>
              <input
                name="title"
                required
                defaultValue={item?.title ?? ""}
                placeholder="Wild escape in Iceland"
                className={`${inputClass} min-w-0`}
              />
            </label>

            <label className="min-w-0">
              <span className={labelClass}>Slug</span>
              <input
                name="slug"
                defaultValue={item?.slug ?? ""}
                placeholder="wild-escape-iceland"
                className={`${inputClass} min-w-0`}
              />
              <p className="mt-2 text-xs leading-5 text-[#11170f]/45">
                Leave empty to generate it automatically from the title.
              </p>
            </label>

            <label className="min-w-0">
              <span className={labelClass}>Description</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={item?.description ?? ""}
                placeholder="Short description displayed on portfolio cards."
                className={`${inputClass} min-w-0`}
              />
            </label>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <label className="min-w-0">
                <span className={labelClass}>Location</span>
                <input
                  name="location"
                  defaultValue={item?.location ?? ""}
                  placeholder="Iceland"
                  className={`${inputClass} min-w-0`}
                />
              </label>

              <label className="min-w-0">
                <span className={labelClass}>Date</span>
                <input
                  type="date"
                  name="date"
                  defaultValue={formatDateInput(item?.date)}
                  className={`${inputClass} min-w-0`}
                />
              </label>
            </div>

            <label className="min-w-0">
              <span className={labelClass}>Tags</span>
              <input
                name="tags"
                defaultValue={item?.tags ?? ""}
                placeholder="ocean, wildlife, travel"
                className={`${inputClass} min-w-0`}
              />
            </label>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <h2 className="font-serif text-3xl">Publishing</h2>

          <div className="mt-6 grid min-w-0 gap-4">
            <div className="min-w-0">
              <span className={labelClass}>Status</span>
              <div className="mt-2 grid min-w-0 grid-cols-3 rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/80 p-1">
                {(["DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((value) => {
                  const selected = status === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value)}
                      className={[
                        "min-w-0 truncate rounded-xl px-2 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                        selected
                          ? "bg-[#242617] text-[#f4efe4]"
                          : "text-[#11170f]/45 hover:text-[#11170f]",
                      ].join(" ")}
                    >
                      {value === "PUBLISHED" ? "Live" : value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden">
              <span className={labelClass}>Category</span>
              <CategorySelect
                value={categoryId}
                categories={categories}
                error={categoryError}
                onChange={(value) => {
                  setCategoryId(value);
                  setCategoryError("");
                }}
              />
            </div>

            {categoryId === "__new__" ? (
              <label className="min-w-0">
                <span className={labelClass}>New category name</span>
                <input
                  name="categoryName"
                  value={categoryName}
                  onChange={(event) => {
                    setCategoryName(event.target.value);
                    setCategoryError("");
                  }}
                  placeholder="New category"
                  className={`${inputClass} min-w-0`}
                />
              </label>
            ) : null}

            <div className="min-w-0">
              <span className={labelClass}>Display order</span>
              <div className="mt-2 flex h-[54px] min-w-0 overflow-hidden rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/80">
                <button
                  type="button"
                  onClick={() => setOrder((current) => current - 1)}
                  className="w-12 shrink-0 border-r border-[#11170f]/10 text-xl text-[#11170f]/45 transition hover:bg-[#e8dfcf] hover:text-[#11170f]"
                >
                  −
                </button>

                <input
                  name="order"
                  type="number"
                  value={order}
                  onChange={(event) => setOrder(Number(event.target.value) || 0)}
                  className="min-w-0 flex-1 bg-transparent px-4 text-center text-sm text-[#11170f] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setOrder((current) => current + 1)}
                  className="w-12 shrink-0 border-l border-[#11170f]/10 text-xl text-[#11170f]/45 transition hover:bg-[#e8dfcf] hover:text-[#11170f]"
                >
                  +
                </button>
              </div>
            </div>

            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#11170f]/65">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="h-4 w-4 shrink-0 accent-[#b88a3b]"
              />
              <span className="truncate">Featured item</span>
            </label>

            <div className="min-w-0 rounded-2xl border border-[#11170f]/10 bg-[#f4efe4]/70 p-4">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={labelClass}>Watermark</p>
                  <p className="mt-1 truncate text-xs text-[#11170f]/42">
                    {watermark === "ANDREW"
                      ? "Andrew"
                      : watermark === "MORGANE"
                        ? "Morgane"
                        : "None"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-pressed={watermarkEnabled}
                  onClick={() => setWatermark(watermarkEnabled ? "NONE" : "ANDREW")}
                  className={[
                    "relative h-8 w-14 shrink-0 rounded-full border transition",
                    watermarkEnabled
                      ? "border-[#b88a3b]/40 bg-[#242617]"
                      : "border-[#242617]/12 bg-[#e8dfcf]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                      watermarkEnabled ? "left-7" : "left-1",
                    ].join(" ")}
                  />
                </button>
              </div>

              {watermarkEnabled ? (
                <div className="mt-4 grid min-w-0 grid-cols-2 rounded-full border border-[#242617]/10 bg-[#e8dfcf]/80 p-1">
                  {(["ANDREW", "MORGANE"] as const).map((owner) => {
                    const selected = watermark === owner;

                    return (
                      <button
                        key={owner}
                        type="button"
                        onClick={() => setWatermark(owner)}
                        className={[
                          "truncate rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                          selected
                            ? "bg-[#242617] text-[#f4efe4]"
                            : "text-[#242617]/45 hover:text-[#242617]",
                        ].join(" ")}
                      >
                        {owner === "ANDREW" ? "Andrew" : "Morgane"}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </section>

      <section className="w-full min-w-0 rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#11170f]/10 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88a3b]">
              Portfolio image
            </p>
            <h2 className="mt-2 font-serif text-3xl">Image</h2>
          </div>

          <p className="max-w-lg text-xs leading-5 text-[#11170f]/42">
            Preview is intentionally contained here. The full-resolution image is
            kept for the public portfolio.
          </p>
        </div>

        <div className="mt-6 mx-auto w-full max-w-[760px] overflow-hidden rounded-[1.75rem]">
          <AdminImageDropzone
            label="Portfolio image"
            value={imageSrc}
            onChange={(value) => {
              setImageSrc(value);
              setImageError("");
            }}
            context="portfolio"
            entitySlug={uploadSlug}
            slotKey="image"
            ratio="16 / 9"
          />
        </div>

        {imageError ? (
          <p className="mt-3 rounded-2xl border border-red-900/15 bg-red-900/5 px-4 py-3 text-xs text-red-900/65">
            {imageError}
          </p>
        ) : null}
      </section>

      <div className="sticky bottom-5 z-20 flex flex-wrap gap-3 rounded-[2rem] border border-[#242617]/10 bg-[#f4efe4]/90 p-4 shadow-[0_20px_60px_rgba(20,20,10,0.16)] backdrop-blur">
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-[#242617] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#b88a3b]"
        >
          {submitLabel}
        </button>

        <a
          href="/admin/portfolio"
          className="rounded-full border border-[#242617]/10 px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
