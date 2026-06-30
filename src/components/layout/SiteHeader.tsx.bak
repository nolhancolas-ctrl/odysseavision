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
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  const HeaderNav = ({ onClick }: { onClick?: () => void }) => (
    <nav className="hidden items-center gap-10 lg:flex">
      {mainNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className="group relative text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:text-white"
        >
          {item.label}

          {item.label === active && (
            <span className="absolute -bottom-3 left-0 h-px w-full bg-white" />
          )}
        </Link>
      ))}
    </nav>
  );

  const MobileNav = () => (
    <nav className="mt-8 grid gap-4 lg:hidden">
      {mainNavigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsOpen(false)}
          className={`border-b border-white/10 pb-3 text-xs font-semibold uppercase tracking-[0.22em] transition hover:text-white ${
            item.label === active ? "text-white" : "text-white/65"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Header classique visible sur le hero */}
      <header
        className={`fixed left-0 top-0 z-50 w-full px-6 py-7 text-white transition-all duration-500 md:px-14 ${
          isCompressed || isOpen
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

          <HeaderNav />
        </div>
      </header>

      {/* Bouton fixe : hamburger -> croix */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`fixed right-6 top-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border text-[#f4efe4] shadow-2xl backdrop-blur transition-all duration-500 md:right-10 md:top-8 ${
          isOpen
            ? "translate-y-0 border-[#f4efe4]/25 bg-[#071008] opacity-100"
            : isCompressed
              ? "translate-y-0 border-[#f4efe4]/25 bg-[#071008]/90 opacity-100"
              : "translate-y-0 border-white/35 bg-black/20 opacity-100 lg:pointer-events-none lg:-translate-y-4 lg:opacity-0"
        }`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className="relative block h-5 w-5">
          <span
            className={`absolute left-0 top-[4px] block h-px w-5 bg-current transition-all duration-300 ${
              isOpen ? "top-1/2 rotate-45" : ""
            }`}
          />

          <span
            className={`absolute left-0 top-1/2 block h-px w-5 bg-current transition-all duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />

          <span
            className={`absolute left-0 top-[16px] block h-px w-5 bg-current transition-all duration-300 ${
              isOpen ? "top-1/2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {/* Fine navbar déroulante depuis le haut */}
      <div
        className={`fixed inset-x-0 top-0 z-[80] border-b border-white/10 bg-[#071008]/95 px-6 py-7 text-white shadow-2xl backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:px-14 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-7xl pr-20">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
            >
              Odyssea
              <br />
              Vision
            </Link>

            <HeaderNav onClick={() => setIsOpen(false)} />
          </div>

          <MobileNav />
        </div>
      </div>
    </>
  );
}
