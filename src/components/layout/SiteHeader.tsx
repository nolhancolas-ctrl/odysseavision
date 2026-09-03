"use client";

import Image from "next/image";
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

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  const Brand = ({ onClick }: { onClick?: () => void }) => (
    <Link
      href="/"
      onClick={onClick}
      className="group flex items-center justify-center gap-3"
      aria-label="Odyssea Vision home"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible lg:h-10 lg:w-10">
        <Image
          src="/images/admin/odyssea_logo.png"
          alt=""
          width={60}
          height={60}
          priority
          className="absolute h-14 w-14 max-w-none object-contain brightness-0 invert transition duration-300 group-hover:scale-105 group-hover:opacity-80 lg:h-15 lg:w-15 lg:-translate-x-5"
        />
      </span>

      <span className="text-[13px] font-semibold uppercase leading-[1.35] tracking-[0.34em] transition duration-300 group-hover:text-white/75 sm:text-[15px] sm:tracking-[0.42em]">
        Odyssea
        <br />
        Vision
      </span>
    </Link>
  );

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
        className={`fixed left-0 top-0 z-50 w-full px-5 py-5 text-white transition-all duration-500 sm:px-6 sm:py-7 md:px-14 ${
          isCompressed || isOpen
            ? "pointer-events-none -translate-y-8 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center lg:justify-between">
          <Brand />

          <HeaderNav />
        </div>
      </header>

      {/* Bouton fixe : hamburger -> croix */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`fixed right-4 top-4 z-[90] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-[#f4efe4] shadow-2xl backdrop-blur transition-all duration-500 hover:scale-105 hover:border-[#d5ad68]/80 hover:bg-[#d5ad68]/10 hover:text-[#d5ad68] focus:outline-none focus:ring-2 focus:ring-[#d5ad68]/40 sm:right-6 sm:top-6 md:right-10 md:top-8 ${
          isOpen
            ? "translate-y-0 border-[#f4efe4]/25 bg-[#071008] opacity-100"
            : isCompressed
              ? "translate-y-0 border-[#f4efe4]/25 bg-[#071008]/90 opacity-100"
              : "translate-y-0 border-white/35 bg-black/20 opacity-100 lg:pointer-events-none lg:-translate-y-4 lg:opacity-0"
        }`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span className="relative block h-6 w-6">
          <span
            className={`absolute left-0 top-1/2 block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "-translate-y-1/2 rotate-45" : "-translate-y-[8px]"
            }`}
          />

          <span
            className={`absolute left-0 top-1/2 block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "-translate-y-1/2 opacity-0" : "-translate-y-1/2 opacity-100"
            }`}
          />

          <span
            className={`absolute left-0 top-1/2 block h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "-translate-y-1/2 -rotate-45" : "translate-y-[6px]"
            }`}
          />
        </span>
      </button>

      {/* Fine navbar déroulante depuis le haut */}
      <div
        className={`fixed inset-x-0 top-0 z-[80] max-h-[100dvh] overflow-y-auto overscroll-contain border-b border-white/10 bg-[#071008]/95 px-5 py-5 text-white shadow-2xl backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] sm:px-6 sm:py-7 md:px-14 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-7xl lg:pr-20">
          <div className="flex items-center justify-center lg:justify-between">
            <Brand onClick={() => setIsOpen(false)} />

            <HeaderNav onClick={() => setIsOpen(false)} />
          </div>

          <MobileNav />
        </div>
      </div>
    </>
  );
}
