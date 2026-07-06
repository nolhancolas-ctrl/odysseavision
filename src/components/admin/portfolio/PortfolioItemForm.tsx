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
  const [status, setStatus] = useState<StatusValue>(parseStatus(item?.status));
  const [categoryId, setCategoryId] = useState<CategoryValue | "">(
    item?.categoryId ?? "",
  );
  const [categoryError, setCategoryError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [imageSrc, setImageSrc] = useState(item?.imageSrc ?? "");
  const [imageError, setImageError] = useState("");
  const uploadSlug = item?.slug || item?.id || "draft";

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

            <div className="mt-6">
              <span className={labelClass}>Image</span>

              <div className="mt-2">
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
                  ratio="4 / 3"
                />
              </div>

              {imageError ? (
                <p className="mt-2 text-xs font-semibold text-red-900/70">
                  {imageError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-[#11170f]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
            <h2 className="font-serif text-3xl">Publishing</h2>

            <div className="mt-6 grid gap-5">
              <label>
                <span className={labelClass}>Status</span>
                <StatusSelect value={status} onChange={setStatus} />
              </label>

              <label>
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
              </label>

              {categoryId === "__new__" ? (
                <label>
                  <span className={labelClass}>New category name</span>
                  <input
                    name="categoryName"
                    value={categoryName}
                    onChange={(event) => {
                      setCategoryName(event.target.value);
                      setCategoryError("");
                    }}
                    placeholder="Vintage"
                    className={inputClass}
                  />
                </label>
              ) : (
                <input type="hidden" name="categoryName" value="" />
              )}

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
          className="cursor-pointer rounded-full bg-[#071321] px-7 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
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
