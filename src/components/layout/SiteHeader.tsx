"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNavigation } from "@/data/navigation";

type SiteHeaderProps = {
  active?: string;
};

export function SiteHeader({ active = "Home" }: SiteHeaderProps) {
  const [isCompressed, setIsCompressed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      setIsCompressed(window.scrollY > window.innerHeight - 120);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader);
    window.addEventListener("resize", updateHeader);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full px-6 py-7 text-white transition-all duration-500 md:px-14 ${
          isCompressed
            ? "pointer-events-none -translate-y-8 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
          >
            Odyssea
            <br />
            Vision
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:text-white"
              >
                {item.label}
                {item.label === active && (
                  <span className="absolute -bottom-3 left-0 h-px w-full bg-white" />
                )}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur lg:hidden"
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 top-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-[#f4efe4]/25 bg-[#071008]/90 text-[#f4efe4] shadow-2xl backdrop-blur transition-all duration-500 md:right-10 md:top-8 ${
          isCompressed
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0 lg:opacity-0"
        }`}
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
          <span className="block h-px w-5 bg-current" />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-sm flex-col bg-[#071008] px-8 py-8 text-[#f4efe4] shadow-2xl transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-14 flex items-start justify-between">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
          >
            Odyssea
            <br />
            Vision
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f4efe4]/20 text-2xl leading-none"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-5">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`border-b border-[#f4efe4]/10 pb-4 text-sm font-semibold uppercase tracking-[0.22em] transition hover:text-white ${
                item.label === active ? "text-white" : "text-[#f4efe4]/65"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#f4efe4]/10 pt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#f4efe4]/35">
            Photography & Film
          </p>
          <p className="mt-3 max-w-xs text-sm leading-7 text-[#f4efe4]/65">
            Stories from land and sea, told through photography and film.
          </p>
        </div>
      </aside>
    </>
  );
}
