import Link from "next/link";
import { mainNavigation } from "@/data/navigation";

export function SiteFooter() {
  return (
    <footer className="bg-[#10170d] px-8 py-12 text-[#f4efe4] md:px-14">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_2fr_1fr]">
        <div>
          <p className="mb-6 text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.42em]">
            Odyssea
            <br />
            Vision
          </p>
          <p className="max-w-xs text-sm leading-7 text-[#f4efe4]/70">
            We’re Andrew & Morgane, photographers and filmmakers drawn to the
            ocean, wildlife and the stories that live in between.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#f4efe4]/45">
              Menu
            </p>
            <div className="flex flex-col gap-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] uppercase tracking-[0.12em] text-[#f4efe4]/75 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#f4efe4]/45">
              Portfolio
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/portfolio/wildlife">Wildlife</Link>
              <Link href="/portfolio/ocean">Ocean</Link>
              <Link href="/portfolio/landscape">Landscape</Link>
              <Link href="/portfolio/portrait">Portrait</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#f4efe4]/45">
              Follow us
            </p>
            <p className="text-sm text-[#f4efe4]/70">Instagram · YouTube · Vimeo</p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-[#f4efe4]/45">
            Let’s connect
          </p>
          <p className="text-sm text-[#f4efe4]/75">odysseavision@gmail.com</p>
          <p className="mt-8 font-serif text-2xl italic text-[#f4efe4]/75">
            home is where the anchor drops
          </p>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-7xl text-center text-[11px] uppercase tracking-[0.18em] text-[#f4efe4]/40">
        © 2024 Odyssea Vision. All rights reserved.
      </p>
    </footer>
  );
}