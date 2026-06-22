import Link from "next/link";
import { mainNavigation } from "@/data/navigation";

export function SiteFooter() {
  return (
    <footer className="bg-[#030b05] px-6 text-[#f4efe4] md:px-14">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 border-t border-[#f4efe4]/10 py-8 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-[14px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
        >
          Odyssea
          <br />
          Vision
        </Link>

        {/* Footer nav */}
        <nav className="flex flex-wrap gap-x-7 gap-y-3 lg:justify-center">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/65 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/odyssea.vision"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f4efe4]/25 text-[10px] font-semibold uppercase tracking-widest text-[#f4efe4]/75 transition hover:border-[#f4efe4]/70 hover:text-white"
          >
            Ig
          </a>

          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f4efe4]/25 text-[10px] font-semibold uppercase tracking-widest text-[#f4efe4]/75 transition hover:border-[#f4efe4]/70 hover:text-white"
          >
            Yt
          </a>

          <a
            href="mailto:odysseavision@gmail.com"
            aria-label="Email"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f4efe4]/25 text-[10px] font-semibold uppercase tracking-widest text-[#f4efe4]/75 transition hover:border-[#f4efe4]/70 hover:text-white"
          >
            @
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 border-t border-[#f4efe4]/8 py-4 text-[9px] uppercase tracking-[0.22em] text-[#f4efe4]/35 md:flex-row md:items-center md:justify-between">
        <p>© 2024 Odyssea Vision. All rights reserved.</p>
        <p>Photography & Film</p>
      </div>
    </footer>
  );
}
