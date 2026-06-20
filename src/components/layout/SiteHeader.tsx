import Link from "next/link";
import { mainNavigation } from "@/data/navigation";

type SiteHeaderProps = {
  active?: string;
};

export function SiteHeader({ active = "Home" }: SiteHeaderProps) {
  return (
    <header className="absolute left-0 top-0 z-50 w-full px-8 py-8 text-white md:px-14">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
        >
          Odyssea
          <br />
          Vision
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-[11px] font-medium uppercase tracking-[0.16em] text-white/85 transition hover:text-white"
            >
              {item.label}
              {item.label === active && (
                <span className="absolute -bottom-3 left-0 h-px w-full bg-white" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}