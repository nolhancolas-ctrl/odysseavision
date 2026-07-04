import Link from "next/link";
import { getAppearanceSettings } from "@/lib/content/appearance";
import { getNavigationSettings } from "@/lib/content/navigation";

export async function SiteFooter() {
  const [appearance, navigation] = await Promise.all([
    getAppearanceSettings(),
    getNavigationSettings(),
  ]);

  const footerLinks = navigation.footerLinks.filter((item) => item.visible);
  const socialLinks = navigation.socialLinks.filter((item) => item.visible);

  return (
    <footer className="bg-[#030b05] px-6 text-[#f4efe4] md:px-14">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 border-t border-[#f4efe4]/10 py-8 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/"
          className="text-[14px] font-semibold uppercase leading-[1.35] tracking-[0.42em]"
        >
          {appearance.brandLineOne}
          <br />
          {appearance.brandLineTwo}
        </Link>

        <nav className="flex flex-wrap gap-x-7 gap-y-3 lg:justify-center">
          {footerLinks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4efe4]/65 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {socialLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={item.label}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f4efe4]/25 text-[10px] font-semibold uppercase tracking-widest text-[#f4efe4]/75 transition hover:border-[#f4efe4]/70 hover:text-white"
            >
              {item.shortLabel}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 border-t border-[#f4efe4]/8 py-4 text-[9px] uppercase tracking-[0.22em] text-[#f4efe4]/35 md:flex-row md:items-center md:justify-between">
        <p>{navigation.footerCopyright}</p>
        <p>{navigation.footerTagline}</p>
      </div>
    </footer>
  );
}
