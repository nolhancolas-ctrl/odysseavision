import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPageContent } from "@/lib/content/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FrameWatermark } from "@/components/ui/FrameWatermark";
import { WatermarkedPhotoFrame } from "@/components/ui/WatermarkedPhotoFrame";
import {
  getPublicPortfolioCategories,
  getPublicPortfolioItems,
} from "@/lib/content/portfolio";

export const dynamic = "force-dynamic";

type PortfolioCategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getSlugFromHref(href: string) {
  return href.split("/").filter(Boolean).at(-1) ?? "";
}

function getWatermarkOwner(value: string) {
  if (value === "ANDREW") return "andrew";
  if (value === "MORGANE") return "morgane";
  return "default";
}

export async function generateMetadata({
  params,
}: PortfolioCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getPublicPortfolioCategories();
  const category = categories.find((item) => getSlugFromHref(item.href) === slug);

  if (!category) {
    return {
      title: "Portfolio gallery · Odyssea Vision",
    };
  }

  return {
    title: `${category.title} · Odyssea Vision`,
    description: category.description,
  };
}

export default async function PortfolioCategoryPage({
  params,
}: PortfolioCategoryPageProps) {
  const { slug } = await params;

  const [categories, items, pageContent] = await Promise.all([
    getPublicPortfolioCategories(),
    getPublicPortfolioItems(),
    getPublicPageContent("portfolio"),
  ]);

  const newsletterContent =
    pageContent?.sections?.newsletter;
  const navigationBackground =
    newsletterContent?.images?.background ??
    newsletterContent?.imageSrc ??
    "/images/portfolio/newsletter_fond.png";

  const category = categories.find((item) => getSlugFromHref(item.href) === slug);

  if (!category) {
    notFound();
  }

  const categoryItems = items.filter((item) => item.categorySlug === slug);
  const currentCategoryIndex = categories.findIndex(
    (item) => getSlugFromHref(item.href) === slug,
  );
  const previousCategory =
    categories.length > 1
      ? categories[
          (currentCategoryIndex - 1 + categories.length) %
            categories.length
        ]
      : null;
  const nextCategory =
    categories.length > 1
      ? categories[
          (currentCategoryIndex + 1) % categories.length
        ]
      : null;
  const previousPreviewItems = previousCategory
    ? items
        .filter(
          (item) =>
            item.categorySlug ===
            getSlugFromHref(previousCategory.href),
        )
        .slice(0, 3)
    : [];
  const nextPreviewItems = nextCategory
    ? items
        .filter(
          (item) =>
            item.categorySlug ===
            getSlugFromHref(nextCategory.href),
        )
        .slice(0, 3)
    : [];


  return (
    <main className="min-h-screen bg-[#f4efe4] text-[#242617]">
      <SiteHeader active="Portfolio" />

      <section className="relative min-h-[78svh] overflow-hidden bg-[#11190f] text-[#f4efe4]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${category.image})` }}
        />
        <div className="absolute inset-0 bg-[#11190f]/68" />
        <FrameWatermark />

        <div className="relative z-20 mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-6 pb-20 pt-36 md:px-14">
          <Link
            href="/portfolio"
            className="mb-10 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
          >
            Back to portfolio
          </Link>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Gallery {category.number}
          </p>

          <h1 className="font-serif text-[clamp(3.4rem,8vw,8rem)] uppercase leading-[0.86] tracking-[-0.06em]">
            {category.title}
          </h1>

          <div className="my-7 h-px w-16 bg-white/45" />

          <p className="max-w-2xl text-sm leading-7 text-white/72">
            {category.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:px-14 md:py-20">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#242617]/10 pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b88a3b]">
                Photo gallery
              </p>
              <h2 className="mt-3 font-serif text-5xl uppercase leading-none tracking-[-0.04em]">
                {category.title}
              </h2>
            </div>

            <p className="text-xs uppercase tracking-[0.16em] text-[#242617]/45">
              {categoryItems.length}{" "}
              {categoryItems.length === 1 ? "photo" : "photos"}
            </p>
          </div>

          {categoryItems.length > 0 ? (
            <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
              {categoryItems.map((item) => (
                <figure
                    key={item.id}
                    className="group mb-5 break-inside-avoid overflow-hidden bg-[#d8cdb8]"
                  >
                    <WatermarkedPhotoFrame
                      src={item.imageSrc}
                      alt={item.title}
                      preserveAspectRatio
                      imageClassName="transition duration-500 group-hover:opacity-95"
                      showWatermark={item.watermark !== "NONE"}
                      watermarkOwner={getWatermarkOwner(item.watermark)}
                    />

                    {item.location || item.description ? (
                      <figcaption className="border-t border-[#242617]/10 bg-[#eee6d8] px-5 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <p className="font-serif text-lg leading-tight text-[#242617]">
                            {item.title}
                          </p>

                          {item.location ? (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b682f]">
                              {item.location}
                            </p>
                          ) : null}
                        </div>

                        {item.description ? (
                          <p className="mt-2 text-xs leading-5 text-[#242617]/65">
                            {item.description}
                          </p>
                        ) : null}
                      </figcaption>
                    ) : null}
                  </figure>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#242617]/10 bg-white/45 p-10 text-center">
              <p className="text-sm text-[#242617]/55">
                No published photos have been added to this gallery yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {previousCategory && nextCategory ? (
        <nav
          aria-label="Portfolio galleries"
          className="relative overflow-hidden bg-[#172016] px-3 py-6 text-[#f4efe4] sm:px-6 sm:py-8 md:px-14 md:py-12"
        >
          {navigationBackground ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center opacity-70 md:bg-top"
              style={{
                backgroundImage: `url(${navigationBackground})`,
              }}
            />
          ) : null}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#222d20]/55"
          />

          <div className="relative mx-auto grid max-w-[1450px] grid-cols-2 gap-2 sm:gap-4">
            <Link
              href={previousCategory.href}
              className="group relative min-h-[96px] overflow-hidden border border-white/20 bg-[#11190f]/55 transition hover:border-[#c7a760]/75 hover:bg-[#11190f]/65 md:min-h-[200px]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 z-20 hidden w-[60%] items-center justify-end -space-x-10 opacity-100 transition duration-500 md:right-6 md:flex"
              >
                {previousPreviewItems.map(
                  (preview, index) => (
                    <div
                      key={preview.id}
                      className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden border-2 border-[#f4efe4]/90 bg-[#242617] shadow-[0_14px_30px_rgba(0,0,0,0.38)] lg:h-32 lg:w-32"
                      style={{
                        transform: `rotate(${
                          [-6, 1, 6][index] ?? 0
                        }deg)`,
                        zIndex: index + 1,
                      }}
                    >
                      <img
                        src={preview.imageSrc}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 bg-gradient-to-r from-[#11190f] via-[#11190f]/90 to-[#11190f]/15"
              />

              <div className="relative z-30 flex min-h-[96px] max-w-full flex-col justify-start p-3 md:min-h-[200px] md:max-w-[58%] md:p-6 lg:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65 transition group-hover:text-[#c7a760] sm:tracking-[0.18em]">
                  ← Previous gallery
                </span>

                <span className="mt-2 font-serif text-[clamp(1.25rem,5vw,1.65rem)] uppercase leading-none tracking-[-0.03em] md:text-3xl">
                  {previousCategory.title}
                </span>
              </div>
            </Link>

            <Link
              href={nextCategory.href}
              className="group relative min-h-[96px] overflow-hidden border border-white/20 bg-[#11190f]/55 transition hover:border-[#c7a760]/75 hover:bg-[#11190f]/65 md:min-h-[200px]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 z-20 hidden w-[60%] items-center -space-x-10 opacity-100 transition duration-500 md:left-6 md:flex"
              >
                {nextPreviewItems.map(
                  (preview, index) => (
                    <div
                      key={preview.id}
                      className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden border-2 border-[#f4efe4]/90 bg-[#242617] shadow-[0_14px_30px_rgba(0,0,0,0.38)] lg:h-32 lg:w-32"
                      style={{
                        transform: `rotate(${
                          [6, -1, -6][index] ?? 0
                        }deg)`,
                        zIndex:
                          nextPreviewItems.length - index,
                      }}
                    >
                      <img
                        src={preview.imageSrc}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 bg-gradient-to-l from-[#11190f] via-[#11190f]/90 to-[#11190f]/15"
              />

              <div className="relative z-30 ml-auto flex min-h-[96px] max-w-full flex-col items-end justify-start p-3 text-right md:min-h-[200px] md:max-w-[58%] md:p-6 lg:p-7">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65 transition group-hover:text-[#c7a760] sm:tracking-[0.18em]">
                  Next gallery →
                </span>

                <span className="mt-2 font-serif text-[clamp(1.25rem,5vw,1.65rem)] uppercase leading-none tracking-[-0.03em] md:text-3xl">
                  {nextCategory.title}
                </span>
              </div>
            </Link>
          </div>
        </nav>
      ) : null}

      <SiteFooter />
    </main>
  );
}
