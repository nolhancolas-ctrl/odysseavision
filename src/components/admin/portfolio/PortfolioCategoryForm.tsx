"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PortfolioCategory } from "@prisma/client";

type PortfolioCategoryFormProps = {
  category?: PortfolioCategory | null;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  returnTo?: string;
  uploadFormId?: string;
};

function StatusDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const options = [
    {
      value: "PUBLISHED",
      label: "Published",
    },
    {
      value: "DRAFT",
      label: "Draft",
    },
  ];

  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex h-[58px] w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-[#f4efe4]/80 px-4 text-left transition",
          open
            ? "border-[#b88a3b]/70 shadow-[0_12px_30px_rgba(36,38,23,0.08)]"
            : "border-[#242617]/10 hover:border-[#b88a3b]/55",
        ].join(" ")}
      >
        <span className="text-sm font-semibold text-[#242617]">
          {selected.label}
        </span>

        <span
          className={[
            "h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200",
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[#242617]/12 bg-[#f4efe4] p-1 shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        ].join(" ")}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={[
                "block w-full cursor-pointer rounded-xl px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] transition",
                isSelected
                  ? "bg-[#242617] text-[#f4efe4]"
                  : "text-[#242617]/60 hover:bg-[#e8dfcf] hover:text-[#242617]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DescriptionEditor({
  initialValue,
}: {
  initialValue: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeOnOutsideClick,
    );
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeOnOutsideClick,
      );
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const summary =
    value.trim() ||
    "Add a description";

  return (
    <div ref={panelRef} className="relative">
      <input
        type="hidden"
        name="description"
        value={value}
      />

      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
        Description
      </span>

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className="flex h-[58px] w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 text-left text-sm text-[#242617] outline-none transition hover:border-[#b88a3b]/55 focus:border-[#b88a3b]/70"
      >
        <span
          className={
            value.trim()
              ? "min-w-0 flex-1 truncate"
              : "min-w-0 flex-1 truncate text-[#242617]/38"
          }
        >
          {summary}
        </span>

        <span
          aria-hidden="true"
          className={`shrink-0 text-xl leading-none text-[#242617]/45 transition ${
            open ? "-rotate-90" : "rotate-0"
          }`}
        >
          ›
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Edit category description"
          className="absolute right-0 top-full z-[80] mt-3 w-[min(380px,calc(100vw-3rem))] rounded-[1.5rem] border border-[#242617]/12 bg-[#f7f2e8] p-4 shadow-[0_24px_70px_rgba(20,20,10,0.2)]"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b88a3b]">
                Portfolio preview
              </p>
              <p className="mt-1 text-xs text-[#242617]/48">
                Maximum 320 characters
              </p>
            </div>

            <button
              type="button"
              aria-label="Close description editor"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#071321] text-lg text-white"
            >
              ×
            </button>
          </div>

          <textarea
            value={value}
            onChange={(event) =>
              setValue(event.target.value.slice(0, 320))
            }
            placeholder="A curated selection of visual stories..."
            maxLength={320}
            rows={6}
            autoFocus
            className="min-h-[150px] w-full resize-y rounded-2xl border border-[#242617]/12 bg-white/65 px-4 py-3 text-sm leading-6 text-[#242617] outline-none transition placeholder:text-[#242617]/28 focus:border-[#b88a3b]/70"
          />

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold tabular-nums text-[#242617]/38">
              {value.length}/320
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 cursor-pointer rounded-full bg-[#242617] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4efe4] transition hover:bg-[#b88a3b]"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PortfolioCategoryForm({
  category,
  action,
  submitLabel,
  returnTo = "/admin/portfolio",
  uploadFormId = "portfolio-gallery-upload-form",
}: PortfolioCategoryFormProps) {
  const [uploadStatus, setUploadStatus] = useState("PUBLISHED");

  return (
    <form
      action={action}
      className="h-full rounded-[2rem] border border-[#242617]/10 bg-white/45 p-6 shadow-[0_22px_70px_rgba(20,20,10,0.07)]"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="status" value={uploadStatus} form={uploadFormId} />

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
            Category name
          </span>
          <input
            name="name"
            required
            defaultValue={category?.name ?? ""}
            placeholder="Wildlife"
            className="h-[58px] w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
            Slug
          </span>
          <input
            name="slug"
            defaultValue={category?.slug ?? ""}
            placeholder="wildlife"
            className="h-[58px] w-full rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80 px-4 text-sm text-[#242617] outline-none transition focus:border-[#b88a3b]/70"
          />
        </label>



        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
            New photos status
          </span>
          <StatusDropdown value={uploadStatus} onChange={setUploadStatus} />
        </div>

        <DescriptionEditor
          initialValue={category?.description ?? ""}
        />
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-[#242617] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f4efe4] transition hover:-translate-y-0.5 hover:bg-[#b88a3b]"
        >
          {submitLabel}
        </button>

        <Link
          href="/admin/portfolio"
          className="rounded-full border border-[#242617]/10 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/55 transition hover:border-[#b88a3b] hover:text-[#242617]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
