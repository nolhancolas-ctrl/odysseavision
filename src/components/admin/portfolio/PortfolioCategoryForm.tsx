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

export function PortfolioCategoryForm({
  category,
  action,
  submitLabel,
  returnTo = "/admin/portfolio",
  uploadFormId = "portfolio-gallery-upload-form",
}: PortfolioCategoryFormProps) {
  const [order, setOrder] = useState(category?.order ?? 0);
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
            Display order
          </span>

          <div className="flex h-[58px] overflow-hidden rounded-2xl border border-[#242617]/10 bg-[#f4efe4]/80">
            <button
              type="button"
              onClick={() => setOrder((current) => current - 1)}
              className="w-14 cursor-pointer border-r border-[#242617]/10 text-xl text-[#242617]/55 transition hover:bg-[#e8dfcf] hover:text-[#242617]"
            >
              −
            </button>

            <input
              name="order"
              type="number"
              value={order}
              onChange={(event) => setOrder(Number(event.target.value) || 0)}
              className="min-w-0 flex-1 bg-transparent px-4 text-center text-sm text-[#242617] outline-none"
            />

            <button
              type="button"
              onClick={() => setOrder((current) => current + 1)}
              className="w-14 cursor-pointer border-l border-[#242617]/10 text-xl text-[#242617]/55 transition hover:bg-[#e8dfcf] hover:text-[#242617]"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#242617]/45">
            New photos status
          </span>
          <StatusDropdown value={uploadStatus} onChange={setUploadStatus} />
        </div>
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
