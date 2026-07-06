"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Story, StoryCategory } from "@prisma/client";
import { AdminImageDropzone } from "@/components/admin/uploads/AdminImageDropzone";

type StoryWithCategory = Story & {
  category: StoryCategory | null;
};

type StoryFormProps = {
  story?: StoryWithCategory | null;
  categories: StoryCategory[];
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
    description: "Hidden from the public website.",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    description: "Visible on the public Stories page.",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    description: "Kept in admin but removed from public flow.",
  },
];

function fieldLabelClass() {
  return "mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#242617]/40";
}

function inputClass() {
  return "w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70";
}

function textareaClass() {
  return "w-full resize-none rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 py-3 text-sm leading-7 text-[#242617] outline-none transition placeholder:text-[#242617]/35 focus:border-[#b88a3b]/70";
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={fieldLabelClass()}>{label}</label>
      {children}
      {help ? (
        <p className="mt-2 text-xs leading-5 text-[#242617]/40">{help}</p>
      ) : null}
    </div>
  );
}

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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-5 rounded-2xl border bg-[#f4efe4]/80 px-4 py-3 text-left transition ${
          open
            ? "border-[#b88a3b]/70"
            : "border-[#242617]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span className="block text-sm font-semibold text-[#242617]">
            {selected.label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#242617]/42">
            {selected.description}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
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
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em]">
                {option.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  isSelected ? "text-[#f4efe4]/62" : "text-[#242617]/42"
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
  value: CategoryValue;
  categories: StoryCategory[];
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
      ? "Create a new category for this story."
      : selectedCategory
        ? "Existing story category."
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
    <div ref={menuRef} className="relative">
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
              : "border-[#242617]/10 hover:border-[#b88a3b]/55"
        }`}
      >
        <span>
          <span
            className={`block text-sm font-semibold ${
              value ? "text-[#242617]" : "text-[#242617]/38"
            }`}
          >
            {selectedLabel}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#242617]/42">
            {selectedDescription}
          </span>
        </span>

        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
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
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]"
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

function parseStatus(value: string | undefined): StatusValue {
  if (value === "PUBLISHED" || value === "ARCHIVED") return value;
  return "DRAFT";
}

export function StoryForm({
  story,
  categories,
  action,
  submitLabel,
}: StoryFormProps) {
  const [status, setStatus] = useState<StatusValue>(parseStatus(story?.status));
  const [categoryId, setCategoryId] = useState<CategoryValue>(
    story?.categoryId ?? "",
  );
  const [categoryError, setCategoryError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [imageSrc, setImageSrc] = useState(story?.imageSrc ?? "");
  const uploadSlug = story?.slug || "draft";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!categoryId) {
          event.preventDefault();
          setCategoryError("Please choose a category.");
          return;
        }

        if (categoryId === "__new__" && !newCategory.trim()) {
          event.preventDefault();
          setCategoryError("Please name the new category.");
        }
      }}
      className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]"
    >
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="imageSrc" value={imageSrc} />

      <div className="space-y-6 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
        <Field label="Title">
          <input
            name="title"
            required
            defaultValue={story?.title ?? ""}
            className={inputClass()}
            placeholder="Into the quiet blue"
          />
        </Field>

        <Field label="Slug" help="Leave empty to generate it from the title.">
          <input
            name="slug"
            defaultValue={story?.slug ?? ""}
            className={inputClass()}
            placeholder="into-the-quiet-blue"
          />
        </Field>

        <Field label="Excerpt">
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={story?.excerpt ?? ""}
            className={textareaClass()}
            placeholder="A short introduction shown on story cards."
          />
        </Field>

        <Field label="Full content">
          <textarea
            name="content"
            rows={12}
            defaultValue={story?.content ?? ""}
            className={textareaClass()}
            placeholder="Write the full story here. Use line breaks to separate paragraphs."
          />
        </Field>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <Field label="Cover image">
            <AdminImageDropzone
              label="Story cover image"
              value={imageSrc}
              onChange={setImageSrc}
              context="story"
              entitySlug={uploadSlug}
              slotKey="cover"
              ratio="4 / 3"
            />
          </Field>
        </div>

        <div className="space-y-5 rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_18px_50px_rgba(20,20,10,0.06)]">
          <Field label="Status">
            <StatusSelect value={status} onChange={setStatus} />
          </Field>

          <Field label="Category">
            <CategorySelect
              value={categoryId}
              categories={categories}
              error={categoryError}
              onChange={(nextCategory) => {
                setCategoryId(nextCategory);
                setCategoryError("");
              }}
            />
          </Field>

          {categoryId === "__new__" ? (
            <Field label="New category name">
              <input
                name="newCategory"
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setCategoryError("");
                }}
                className={inputClass()}
                placeholder="Behind the lens"
              />
            </Field>
          ) : (
            <input type="hidden" name="newCategory" value="" />
          )}

          <Field label="Date">
            <input
              type="date"
              name="date"
              defaultValue={
                story?.date ? story.date.toISOString().slice(0, 10) : ""
              }
              className={inputClass()}
            />
          </Field>

          <Field label="Read time">
            <input
              name="readTime"
              defaultValue={story?.readTime ?? ""}
              className={inputClass()}
              placeholder="5 min read"
            />
          </Field>

          <Field label="Order">
            <input
              type="number"
              name="order"
              defaultValue={story?.order ?? 0}
              className={inputClass()}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/65 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#242617]/55">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={story?.featured ?? false}
              className="h-4 w-4 accent-[#b88a3b]"
            />
            Featured story
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 cursor-pointer rounded-full bg-[#071321] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:bg-[#142844]"
          >
            {submitLabel}
          </button>

          <Link
            href="/admin/stories"
            className="rounded-full border border-[#242617]/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#071321] hover:text-[#071321]"
          >
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
