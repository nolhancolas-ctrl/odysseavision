import Link from "next/link";
import { getAppearanceSettings } from "@/lib/content/appearance";
import { getNavigationSettings } from "@/lib/content/navigation";
import { getSeoSettings } from "@/lib/content/seo";

export async function SiteFooter() {
  const [appearance, navigation, seo] = await Promise.all([
    getAppearanceSettings(),
    getNavigationSettings(),
    getSeoSettings(),
  ]);

  const footerLinks = navigation.footerLinks.filter((item) => item.visible);
  const contactEmail = seo.contactEmail
    .replace(/^mailto:/i, "")
    .trim();

  const configuredSocialLinks = [
    {
      id: "seo-instagram",
      label: "Instagram",
      shortLabel: "IG",
      href: seo.instagramUrl.trim(),
    },
    {
      id: "seo-youtube",
      label: "YouTube",
      shortLabel: "YT",
      href: seo.youtubeUrl.trim(),
    },
    {
      id: "seo-email",
      label: "Email",
      shortLabel: "ML",
      href: contactEmail ? `mailto:${contactEmail}` : "",
    },
  ].filter((item) => Boolean(item.href));

  const socialLinks =
    configuredSocialLinks.length > 0
      ? configuredSocialLinks
      : navigation.socialLinks.filter((item) => item.visible);

  return (
    <footer className="bg-[#030b05] px-5 text-[#f4efe4] sm:px-6 md:px-14">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-6 border-t border-[#f4efe4]/10 py-7 sm:gap-x-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:py-8">
        <Link
          href="/"
          className="text-[12px] font-semibold uppercase leading-[1.35] tracking-[0.34em] sm:text-[14px] sm:tracking-[0.42em]"
        >
          {appearance.brandLineOne}
          <br />
          {appearance.brandLineTwo}
        </Link>

        <nav className="hidden min-w-0 flex-wrap gap-x-7 gap-y-3 md:flex md:justify-center">
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

        <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
          {socialLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={item.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f4efe4]/25 text-[10px] font-semibold uppercase tracking-widest text-[#f4efe4]/75 transition hover:border-[#f4efe4]/70 hover:text-white"
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
