"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FeaturedVideoOption = {
  id: string;
  title: string;
};

type FeaturedFilmSelectorDropdownProps = {
  videos: FeaturedVideoOption[];
  defaultValue: string;
};

export function FeaturedFilmSelectorDropdown({
  videos,
  defaultValue,
}: FeaturedFilmSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "__latest__");
  const menuRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () => [{ id: "__latest__", title: "Latest video" }, ...videos],
    [videos],
  );

  const currentLabel =
    options.find((option) => option.id === value)?.title ?? "Latest video";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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
      <input type="hidden" name="featuredVideoId" value={value} />

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[68px] w-full cursor-pointer items-center justify-between border border-[#242617]/18 bg-[#f4efe4]/45 px-7 text-left text-lg text-[#242617]/68 transition hover:border-[#b88a3b]/55"
      >
        <span className="truncate">{currentLabel}</span>
        <span
          className={`h-2.5 w-2.5 shrink-0 border-r border-t border-[#242617]/55 transition-transform duration-200 ${
            open ? "-translate-y-0.5 rotate-[135deg]" : "rotate-[45deg]"
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden border border-[#242617]/18 bg-[#f4efe4] shadow-[0_18px_45px_rgba(36,38,23,0.16)] transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {options.map((option) => {
          const selected = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                setValue(option.id);
                setOpen(false);
              }}
              className={`block w-full cursor-pointer px-7 py-4 text-left text-sm font-bold uppercase tracking-[0.18em] transition ${
                selected
                  ? "bg-[#071321] text-[#f4efe4]"
                  : "text-[#242617]/52 hover:bg-[#e8dfcf] hover:text-[#242617]"
              }`}
            >
              {option.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
